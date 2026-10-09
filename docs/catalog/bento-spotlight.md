# Bento — Spotlight

`bento-spotlight` · Bento Grids · **showpiece** · surface-white (default in markup; navy per header) · `data-behavior="spotlight"` + countup

## Look
A header (eyebrow + two-line headline) above an asymmetric mosaic of **7 tiles**:
one large image feature tile, several count-up stat tiles, an icon-feature tile,
and a gradient CTA tile. Every tile carries a cursor-following glow and a
hover-lift + sheen, so one tile feels "spotlit" as you move the pointer.

## Motion
The grid reveals up on scroll (`data-reveal="up"` on `.bs-grid` + header). Then
`data-behavior="spotlight"` on the grid drives a cursor-following radial glow per
tile (each tile carries `data-spotlight-tile` + a `.bs-glow` layer) plus a CSS
hover-lift/sheen. Stat numbers count up via `data-countup` (with `data-decimals`,
`data-suffix`, `data-duration` variants). The feature image Ken-Burns zooms on hover.

## Anatomy
```
section.cmp-bento-spotlight[data-animate]   (surface-white in markup)
└ .container-ds
  ├ .ds-stack.section-head                 ← .ds-eyebrow + h2.type-h1
  └ .bs-grid[data-behavior=spotlight][data-reveal]   ← 7 tiles, each w/ .bs-glow + data-spotlight-tile:
     a.bs-tile.bs-feature   image — .bs-img(data-bg) + tag + title + link
     .bs-tile.bs-stat       stat — .bs-stat-num(data-countup 180 +) + label
     .bs-tile.bs-stat       stat — .bs-stat-num(data-countup 99.9 decimals=1 %) + label
     a.bs-tile.bs-cta       CTA — .bs-cta-title + .bs-cta-sub + .bs-cta-arrow
     .bs-tile.bs-icon       icon — .bs-icon-badge SVG + title + sub
     .bs-tile.bs-stat.bs-stat-accent  stat — "< " + (data-countup 2) + label
     .bs-tile.bs-stat       stat — .bs-stat-num(data-countup 40 suffix=+) + label
```

## Content contract
- **7 tiles** in the fixed feature / stat×4 / cta / icon layout — spans are set
  in CSS per modifier class. Keep the roles.
- Feature tile: tag (≤2 words) + title (1 sentence) + link; 1 image via `data-bg`.
- 4 stat tiles: each one number (live via `data-countup`) + short label. Numbers
  support prefixes ("< "), suffixes ("+", "%"), and `data-decimals` — match the
  attributes to the displayed value.
- CTA tile: short title + 1-sentence sub + arrow; icon tile: badge + title + sub.
- **1 image slot** (feature) via `data-bg`. Live numbers: all 4 stat tiles.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Do NOT add/remove tiles or change the `bs-feature` / `bs-stat` / `bs-cta` /
  `bs-icon` classes — the mosaic depends on exactly these 7.
- Keep `data-behavior="spotlight"` on `.bs-grid` plus `data-spotlight-tile` and
  the `.bs-glow` span on every tile — the glow recipe needs all three.
- Keep `data-countup` numbers in sync with their `data-suffix`/`data-decimals`/
  prefix text. The markup ships `surface-white`; switch the surface class only on
  instruction (catalog presents it on navy).

## Authoring rule
Read `blocks/bento-spotlight.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
