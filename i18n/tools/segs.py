"""Segment an HTML page into translatable units with exact source offsets.

A unit is either
  ('html', start, end, inner)  : innerHTML of the lowest element whose children are
                                  all inline phrasing content and that holds text
  ('attr', start, end, value)  : a translatable attribute value (alt, aria-label,
                                  title, placeholder, meta content, data-label...)
Everything inside <script>, <style>, <svg>, <header> (served from the shared
Arabic header) and <noscript> is skipped. Splicing translations back by offset
keeps the rest of the file byte-identical.
"""
import re, html as H
from html.parser import HTMLParser

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
        'param', 'source', 'track', 'wbr'}
INLINE = {'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i',
          'kbd', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time',
          'u', 'var', 'wbr', 'del', 'ins'}
SKIP = {'script', 'style', 'svg', 'noscript', 'template', 'math'}
ATTRS = {'alt', 'aria-label', 'title', 'placeholder', 'aria-description', 'data-label',
         'data-title', 'data-caption', 'aria-roledescription', 'data-tooltip', 'label',
         'data-placeholder', 'data-empty', 'data-copy', 'data-copied', 'aria-valuetext'}
META_NAMES = {'description', 'twitter:title', 'twitter:description', 'twitter:image:alt',
              'og:title', 'og:description', 'og:image:alt', 'keywords'}

LETTER = re.compile(r'[A-Za-z]')


def translatable_text(s):
    t = H.unescape(re.sub(r'<[^>]+>', ' ', s))
    t = ' '.join(t.split())
    if not LETTER.search(t):
        return False
    return True


class Node:
    __slots__ = ('tag', 'attrs', 's0', 's1', 'e0', 'e1', 'kids', 'parent', 'text', 'skip', 'raw')

    def __init__(self, tag, attrs, s0, s1, parent, raw):
        self.tag, self.attrs, self.s0, self.s1 = tag, attrs, s0, s1
        self.e0 = self.e1 = None
        self.kids, self.parent, self.text, self.skip, self.raw = [], parent, False, False, raw


class P(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src = src
        self.lines = [0]
        for m in re.finditer('\n', src):
            self.lines.append(m.end())
        self.root = Node('#root', [], 0, 0, None, '')
        self.cur = self.root
        self.textnodes = []

    def off(self):
        l, c = self.getpos()
        return self.lines[l - 1] + c

    def handle_starttag(self, tag, attrs):
        s0 = self.off()
        raw = self.get_starttag_text()
        n = Node(tag, attrs, s0, s0 + len(raw), self.cur, raw)
        n.skip = self.cur.skip or tag in SKIP
        self.cur.kids.append(n)
        if tag in VOID:
            n.e0 = n.e1 = n.s1
        else:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        s0 = self.off()
        raw = self.get_starttag_text()
        n = Node(tag, attrs, s0, s0 + len(raw), self.cur, raw)
        n.skip = self.cur.skip or tag in SKIP
        n.e0 = n.e1 = n.s1
        self.cur.kids.append(n)

    def handle_endtag(self, tag):
        e0 = self.off()
        m = re.compile(r'</\s*' + re.escape(tag) + r'\s*>', re.I).match(self.src, e0)
        e1 = m.end() if m else e0 + len(tag) + 3
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is self.root:
            return  # stray end tag
        c = self.cur
        while c is not n:  # implicitly closed
            c.e0 = c.e1 = e0
            c = c.parent
        n.e0, n.e1 = e0, e1
        self.cur = n.parent

    def handle_data(self, d):
        if d.strip():
            self.cur.text = True
            if LETTER.search(d):
                self.cur.kids.append(('#t', self.off(), d))

    def handle_entityref(self, name):
        self.cur.text = True

    def handle_charref(self, name):
        self.cur.text = True


def all_inline(n):
    for k in n.kids:
        if isinstance(k, tuple):
            continue
        if k.tag not in INLINE or k.skip and k.tag != 'svg':
            if k.tag == 'svg':
                continue
            return False
        if not all_inline(k):
            return False
    return True


def simple(n):
    """False for inline 'card stacks': 2+ element children that have element kids."""
    c = 0
    for k in n.kids:
        if isinstance(k, tuple) or k.tag in ('svg', 'br', 'wbr'):
            continue
        if any(not isinstance(g, tuple) and g.tag not in ('svg', 'br', 'wbr') for g in k.kids):
            c += 1
    return c < 2


def has_svg(n):
    for k in n.kids:
        if isinstance(k, tuple):
            continue
        if k.tag == 'svg' or has_svg(k):
            return True
    return False


def parse(src):
    p = P(src)
    p.feed(src)
    p.close()
    return p.root


def units(src, skip_header=True):
    root = parse(src)
    out = []

    def attr_units(n):
        if n.skip:
            return
        raw = n.raw
        names = {k for k, v in n.attrs}
        for k, v in n.attrs:
            want = k in ATTRS
            if n.tag == 'meta' and k == 'content':
                d = dict(n.attrs)
                if (d.get('name') or d.get('property') or '') in META_NAMES:
                    want = True
            if n.tag == 'input' and k == 'value' and dict(n.attrs).get('type') in ('submit', 'button', 'reset'):
                want = True
            if not want or not v or not LETTER.search(v):
                continue
            m = re.search(r'\s' + re.escape(k) + r'\s*=\s*(["\'])(.*?)\1', raw, re.S)
            if not m:
                continue
            out.append(('attr', n.s0 + m.start(2), n.s0 + m.end(2), m.group(2)))

    def walk(n, in_unit=False):
        if isinstance(n, tuple):
            return
        if n.skip:
            return
        if skip_header and n.tag == 'header' and n.parent and n.parent.tag in ('body', '#root'):
            return
        attr_units(n)
        if n.tag in ('title',) and n.e0:
            inner = src[n.s1:n.e0]
            if LETTER.search(inner):
                out.append(('html', n.s1, n.e0, inner))
            return
        if not in_unit and n.tag not in INLINE and n.tag not in VOID and n.e0 is not None \
                and n.tag not in ('#root', 'html', 'head', 'body'):
            inner = src[n.s1:n.e0]
            direct = any(isinstance(k, tuple) for k in n.kids)
            if all_inline(n) and simple(n) and translatable_text(re.sub(r'<svg\b.*?</svg>', '', inner, flags=re.S)):
                out.append(('html', n.s1, n.e0, inner))
                in_unit = True
            elif direct:
                # mixed block: translate each loose text run on its own
                for k in n.kids:
                    if isinstance(k, tuple):
                        t0 = k[1]
                        d = k[2]
                        a = len(d) - len(d.lstrip())
                        b = len(d.rstrip())
                        out.append(('html', t0 + a, t0 + b, d[a:b]))
        elif not in_unit and n.tag in INLINE and n.parent is not None:
            pass
        for k in n.kids:
            if isinstance(k, tuple):
                continue
            if in_unit:
                attr_units_deep(k)
            else:
                walk(k, in_unit)

    def attr_units_deep(n):
        if n.skip:
            return
        attr_units(n)
        for k in n.kids:
            if not isinstance(k, tuple):
                attr_units_deep(k)

    def loose_inline(n):
        """Inline elements sitting in a mixed block (block siblings) still need
        their text; handled by walking: an inline element with text gets a unit."""
        pass

    # second chance: inline elements with text whose parent block was not a unit
    walk(root)
    covered = sorted((u[1], u[2]) for u in out)

    def is_cov(a, b):
        for x, y in covered:
            if x <= a and b <= y:
                return True
        return False

    extra = []

    def walk2(n):
        if isinstance(n, tuple) or n.skip:
            return
        if skip_header and n.tag == 'header' and n.parent and n.parent.tag in ('body', '#root'):
            return
        if n.tag in INLINE and n.e0 is not None and n.tag not in ('br', 'wbr'):
            inner = src[n.s1:n.e0]
            if all_inline(n) and simple(n) and translatable_text(re.sub(r'<svg\b.*?</svg>', '', inner, flags=re.S)) \
                    and not is_cov(n.s1, n.e0):
                extra.append(('html', n.s1, n.e0, inner))
                return
        for k in n.kids:
            walk2(k)
    walk2(root)
    out += extra
    # drop units nested inside other html units except attrs
    out.sort(key=lambda u: (u[1], -u[2]))
    res, last_end = [], -1
    for u in out:
        if u[0] == 'html' and u[1] < last_end:
            continue
        res.append(u)
        if u[0] == 'html':
            last_end = u[2]
    return res


def norm_key(s):
    return ' '.join(s.split())


if __name__ == '__main__':
    import sys
    src = open(sys.argv[1], encoding='utf-8').read()
    for u in units(src):
        print(u[0], u[1], repr(norm_key(u[3]))[:140])


TAG = re.compile(r'<svg\b.*?</svg>|<!--.*?-->|</?[A-Za-z][^>]*>', re.S)


def templ(inner):
    """innerHTML -> (template, tags). Tags become <N>, </N>, <N/> placeholders;
    text is entity-decoded and whitespace-collapsed."""
    tags, parts, stack, pos = [], [], [], 0
    for m in TAG.finditer(inner):
        parts.append(H.unescape(inner[pos:m.start()]))
        t = m.group(0)
        if t.startswith('<!--'):
            pos = m.end()
            continue
        tags.append(t)
        i = len(tags)
        if t.startswith('</'):
            j = stack.pop() if stack else i
            parts.append('</%d>' % j)
        elif t.startswith('<svg') or t.endswith('/>') or re.match(r'<(\w+)', t).group(1).lower() in VOID:
            parts.append('<%d/>' % i)
        else:
            stack.append(i)
            parts.append('<%d>' % i)
        pos = m.end()
    parts.append(H.unescape(inner[pos:]))
    s = ''.join(parts).replace('\xa0', ' ')
    return ' '.join(s.split()), tags


def key_of(unit):
    kind, a, b, v = unit
    if kind == 'attr':
        return ' '.join(H.unescape(v).split())
    return templ(v)[0]
