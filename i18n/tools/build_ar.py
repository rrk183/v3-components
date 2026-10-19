"""Generate <page>-ar.html for every page in pages.txt from the translated string
table (ar.json: English key -> Arabic). Untranslated keys stay English and are
reported. Usage: python3 build_ar.py [--dry] [page ...]"""
import json, os, re, sys, html as H
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from segs import units, key_of, templ, ATTRS

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PAGES = [l.strip() for l in open(os.path.join(HERE, 'pages.txt')) if l.strip()]
AR_SET = set(PAGES)

def restore(fix, tags, m):
    """Placeholder -> original tag. A closer </N> is rebuilt from opener N's name."""
    t = tags[int(m.group(2)) - 1]
    if m.group(1):
        return '</%s>' % re.match(r'<\s*([A-Za-z][\w:-]*)', t).group(1)
    return fix(t)

PH = re.compile(r'<(/?)(\d+)(/?)>')


def src_of(rel):
    o = os.path.join(ROOT, 'overrides', rel)
    return open(o if os.path.isfile(o) else os.path.join(ROOT, rel), encoding='utf-8').read()


def ar_name(rel):
    return rel[:-5] + '-ar.html'


def esc_text(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def esc_attr(s, q):
    s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return s.replace('"', '&quot;') if q == '"' else s.replace("'", '&#39;')


def placeholders(t):
    return sorted(m.group(0) for m in PH.finditer(t))


class T:
    def __init__(self, table):
        self.t = table
        self.missing = {}
        self.bad = {}

    def get(self, key):
        v = self.t.get(key)
        if v is None:
            self.missing[key] = self.missing.get(key, 0) + 1
        return v

    def attr(self, raw_val, q):
        k = ' '.join(H.unescape(raw_val).split())
        v = self.get(k)
        return raw_val if v is None else esc_attr(v, q)

    def tag(self, t):
        """Translate translatable attributes inside one restored tag."""
        if t.startswith('<svg') or t.startswith('</'):
            return t
        def sub(m):
            name, q, val = m.group(1), m.group(2), m.group(3)
            if name.lower() in ATTRS and re.search('[A-Za-z]', val):
                return m.group(0)[:m.start(3) - m.start(0)] + self.attr(val, q) + q
            return m.group(0)
        return re.sub(r'(?<=\s)([\w:-]+)\s*=\s*(["\'])(.*?)\2', sub, t, flags=re.S)

    def html(self, inner):
        tmpl, tags = templ(inner)
        v = self.get(tmpl)
        if v is None:
            return None
        if placeholders(v) != placeholders(tmpl):
            self.bad[tmpl] = v
            return None
        lead = inner[:len(inner) - len(inner.lstrip())]
        trail = inner[len(inner.rstrip()):]
        out, pos = [], 0
        for m in PH.finditer(v):
            out.append(esc_text(v[pos:m.start()]))
            out.append(restore(self.tag, tags, m))
            pos = m.end()
        out.append(esc_text(v[pos:]))
        return lead + ''.join(out) + trail


def relink(html):
    """Internal links to pages that have an Arabic edition go to that edition."""
    def sub(m):
        pre, url, q = m.group(1), m.group(2), m.group(3)
        base = re.split(r'[?#]', url, 1)[0]
        if base in AR_SET:
            url = ar_name(base) + url[len(base):]
        return pre + url + q
    return re.sub(r'(\shref=")([^"#:?][^"]*?)(")', sub, html)


AR_LANG_FOOTER = ('<button type="button" class="fo1-lang" lang="en" aria-label="English، التبديل إلى الإنجليزية">')


def chrome(html, rel):
    alt = rel
    html = re.sub(r'<html\b[^>]*>', lambda m: re.sub(r'\s(lang|dir|data-lang-alt)="[^"]*"', '', m.group(0))[:-1]
                  + ' lang="ar" dir="rtl" data-lang-alt="%s">' % alt, html, count=1)
    def body(m):
        t = m.group(0)
        if re.search(r'\sclass="', t):
            return re.sub(r'(\sclass=")', r'\1lang-ar ', t, count=1)
        return t[:-1] + ' class="lang-ar">'
    html = re.sub(r'<body\b[^>]*>', body, html, count=1)
    html = html.replace('content="en_AE"', 'content="ar_AE"')
    html = re.sub(r'(<link rel="canonical" href=")%s(")' % re.escape(rel), r'\g<1>%s\2' % ar_name(rel), html)
    html = re.sub(r'(<meta property="og:url" content=")%s(")' % re.escape(rel), r'\g<1>%s\2' % ar_name(rel), html)
    # footer language button: Arabic edition offers English
    html = re.sub(r'<button type="button" class="fo1-lang" lang="ar"[^>]*>(.*?)<span>عربي</span>',
                  lambda m: AR_LANG_FOOTER + m.group(1) + '<span>English</span>', html, flags=re.S)
    # header language buttons (static fallback; the server re-localises the header)
    html = re.sub(r'<button class="ish-lang" type="button" lang="ar">عربي</button>',
                  '<button class="ish-lang" type="button" lang="en" aria-label="English، التبديل إلى الإنجليزية">English</button>', html)
    html = re.sub(r'<button class="ish-lang-m" type="button" lang="ar"[^>]*>عربي</button>',
                  '<button class="ish-lang-m" type="button" lang="en" aria-label="English، التبديل إلى الإنجليزية">English</button>', html)
    # (RTL page fixes ship inside style.css, scoped to [dir="rtl"] — no extra link)
    # physical Tailwind utilities -> logical ones (Arabic edition only)
    LOGICAL = {'text-left': 'text-start', 'text-right': 'text-end', 'ml-0': 'ms-0', 'mr-0': 'me-0'}
    def cls(m):
        toks = [LOGICAL.get(t, re.sub(r'^(-?)(p|m)([lr])-', lambda x: x.group(1) + x.group(2) + ('s' if x.group(3) == 'l' else 'e') + '-', t)) for t in m.group(2).split(' ')]
        return m.group(1) + ' '.join(toks) + m.group(3)
    html = re.sub(r'(\sclass=")([^"]*)(")', cls, html)
    if 'assets/webxv2/js/lang-switch.js' not in html:
        html = html.replace('</head>', '<script defer src="assets/webxv2/js/lang-switch.js"></script>\n</head>', 1)
    return html


# World-map labels live as JSON in data-points (ds.js world-map draws them).
MAP_AR = {'UK': 'المملكة المتحدة', 'Germany': 'ألمانيا', 'Russia': 'روسيا', 'Austria': 'النمسا',
          'Turkey': 'تركيا', 'T&uuml;rkiye': 'تركيا', 'Türkiye': 'تركيا', 'Egypt': 'مصر', 'KSA': 'السعودية',
          'UAE': 'الإمارات', 'India': 'الهند', 'China': 'الصين', 'Singapore': 'سنغافورة',
          'Indonesia': 'إندونيسيا', 'Dubai': 'دبي', 'Riyadh': 'الرياض', 'Cairo': 'القاهرة',
          'Istanbul': 'إسطنبول', 'London': 'لندن', 'Frankfurt': 'فرانكفورت', 'Moscow': 'موسكو',
          'Mumbai': 'مومباي', 'Shanghai': 'شنغهاي', 'Jakarta': 'جاكرتا', 'Vienna': 'فيينا'}


def map_labels(html):
    def attr(m):
        return re.sub(r'("label"\s*:\s*")([^"]*)(")', lambda x: x.group(1) + MAP_AR.get(x.group(2), x.group(2)) + x.group(3), m.group(0))
    return re.sub(r"\sdata-points='[^']*'|\sdata-points=\"[^\"]*\"", attr, html)


# Phone numbers: in an RTL line each space-separated digit group is laid out as its
# own run, so "600 54 0000" shows as "0000 54 600". Isolate them as LTR.
PHONE = re.compile(r'(?<![\w.,])\+?\(?\d{2,4}\)?(?:[ \u00a0-]\(?\d{1,4}\)?){2,5}(?![\w.,%])')


def ltr_phones(html):
    out, skip = [], False
    for part in re.split(r'(<[^>]+>)', html):
        if part.startswith('<'):
            low = part[:8].lower()
            if low.startswith(('<script', '<style', '<title')):
                skip = True
            elif low.startswith(('</scrip', '</style', '</title')):
                skip = False
            out.append(part)
        elif skip or not part.strip():
            out.append(part)
        else:
            out.append(PHONE.sub(lambda m: '<bdi dir="ltr">' + m.group(0) + '</bdi>', part))
    return ''.join(out)


def build(rel, tr, dry=False):
    src = src_of(rel)
    us = units(src, skip_header=False)
    out, pos = [], 0
    for kind, a, b, v in us:
        if a < pos:
            continue
        if kind == 'attr':
            q = src[a - 1]
            new = tr.attr(v, q)
        else:
            new = tr.html(v)
            if new is None:
                new = v
        out.append(src[pos:a])
        out.append(new)
        pos = b
    out.append(src[pos:])
    html = chrome(ltr_phones(relink(map_labels(''.join(out)))), rel)
    if not dry:
        open(os.path.join(ROOT, ar_name(rel)), 'w', encoding='utf-8').write(html)
    return html


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry' in sys.argv
    table = json.load(open(os.path.join(HERE, 'ar.json'), encoding='utf-8')) if os.path.exists(os.path.join(HERE, 'ar.json')) else {}
    if len(table) < 1000:
        sys.exit('ar.json missing or tiny next to build_ar.py: run merge.py first (refusing to write English pages)')
    tr = T(table)
    # fixes_pages.json: {"<page>.html": {"<en key>": "<arabic>"}}, applied to that page only
    # (approved agency translations that must not change the shared string on other pages).
    pf_path = os.path.join(HERE, 'fixes_pages.json')
    page_fixes = json.load(open(pf_path, encoding='utf-8')) if os.path.exists(pf_path) else {}
    for rel in (args or PAGES):
        if rel in page_fixes:
            pt = T({**table, **page_fixes[rel]})
            build(rel, pt, dry)
            tr.missing.update(pt.missing)
            tr.bad.update(pt.bad)
        else:
            build(rel, tr, dry)
    print('missing keys:', len(tr.missing), ' bad placeholders:', len(tr.bad))
    json.dump({'missing': tr.missing, 'bad': tr.bad}, open(os.path.join(HERE, 'report.json'), 'w'), ensure_ascii=False, indent=1)
