# Bento — Magazine

`bento-magazine` · Bento Grids · **statement** · surface-white · reveal

## Look
A light editorial mosaic with a header (eyebrow + two-line headline) above an
asymmetric grid of four tiles: a large image-backed lead story, a text-led
article card with a left accent bar, a pull-quote panel, and a small image card.
Reads like a magazine spread.

## Motion
Reveal-on-scroll only — header and each tile fade/slide up in a stagger via
`data-reveal="up"` + increasing `data-reveal-delay`. CSS-only micro-interactions
on hover: image Ken-Burns zoom, a growing left accent bar (`.bm-bar`), an
underline wipe on the lead title (`.bm-underline`), and read-arrows that slide.
No recipe, no scroll-pinning.

## Anatomy
```
section.cmp-bento-magazine.surface-white.section-y[data-animate]
└ .container-ds
  ├ .ds-stack.section-head    ← .ds-eyebrow + h2.type-h1
  └ .bm-grid                  ← 4 tiles:
     a.bm-tile.bm-lead     image lead — .bm-img(data-bg) + ov + eyebrow + title(.bm-underline) + excerpt + .bm-read
     a.bm-tile.bm-article  text card — .bm-bar + eyebrow + title + excerpt + .bm-read.bm-read-blue
     .bm-tile.bm-quote     pull quote — .bm-quote-mark + .bm-quote-text + .bm-quote-by
     a.bm-tile.bm-photo    small image card — .bm-img(data-bg) + ov + eyebrow + title
```

## Content contract
- **Exactly 4 tiles** in the lead/article/quote/photo layout — positions are
  fixed in CSS. Keep all four and their roles.
- Lead tile: eyebrow (≤2 words), title ≤8 words (wrapped in `.bm-underline`),
  1-sentence excerpt, a read link.
- Article tile: eyebrow, title ~1 sentence, short excerpt, "Read" link.
- Quote tile: one quote sentence + an attribution line; no image.
- Photo tile: eyebrow + short title only.
- **2 image slots** (lead, photo) via `data-bg`; no fixed aspect ratio — tiles
  set their own size. No live numbers (no `data-countup`).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.bm-article` is NOT an island: on every dark surface the tile repaints
  itself as dark glass (`rgba(255,255,255,.06)`), so its copy flips white.
  Keep the surface-primary/dark/blue/image rules in step when editing it.
- Do NOT add/remove tiles or change `bm-lead` / `bm-article` / `bm-quote` /
  `bm-photo` classes — the mosaic layout depends on these exact four.
- Keep the `.bm-img` + `.ov` overlay layers on image tiles, and the
  `.bm-underline` wrap on the lead title — the hover effects key off them.
- Set images via `data-bg`; change copy freely. Leave structure intact.

## Authoring rule
Read `blocks/bento-magazine.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
