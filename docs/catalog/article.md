# article

`article` · Blogs & Articles · **utility** · article shell (compose takeaways/related from the Cards compositions)

## Look
The long-form article page. A navy hero: photo backdrop (`data-bg`) behind a
105° navy scrim with a blue radial glow top-right; blue-pale eyebrow, a 20ch
h1, then a byline row — gradient avatar circle, author + role, hairline
separators, date and read time. Below, on white, the editorial body: a 68ch
centred column with a bordered lead paragraph, h2 rhythm, 1.72 line-height
body scale, rounded shadowed figures with small captions, and a top-ruled
actions row (Download PDF).

## Anatomy
```
section.cmp.cmp-article.surface-primary.art-hero[data-animate]
  span.art-hero-bg[data-bg]
  .container-narrow.art-hero-inner
    .ds-eyebrow · h1.type-h1.on-surface.art-title
    .art-byline > .art-avatar + .art-byline-txt(.art-author/.art-role)
                 + .art-byline-sep + time.art-date + .art-byline-sep + .art-readtime
section.cmp.cmp-article.surface-white.section-y
  .container-narrow > .art-body
    p.art-lead · h2.type-h2.type-navy.art-h2 · p… ·
    figure.art-figure > img + figcaption.art-figcaption ·
    .art-actions > a.btn.btn-navy
```

## Content contract
Text + one hero image + inline figures. Avatar holds the author's initials.
A full article page composes: article hero + article body + **kicker-cards**
(numbered takeaways) + **article-card** (related grid) — see
`article-example-2026-07-20.html`, the canonical instance.

## Drift cautions
- The hero scrim/glow are component pseudo-elements — never re-add bespoke
  scrim spans or inline styles.
- Body typography is component-scoped (`.cmp-article .art-body p`) — do not
  re-create it with page utilities.
- Byline separators hide ≤479 (canonical breakpoint; Ram's 520 was rewritten).

## Authoring rule
Reuse verbatim; change copy, images, byline and dates only.
