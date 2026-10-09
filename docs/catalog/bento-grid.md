# Bento — Feature Cards (composition of cmp-bento)

`bento-grid` · Bento Grids · composition of `cmp-bento` · **statement** · surface-primary (default; `surface-white` for light) · reveal + countup

## Look
A dark navy section with a header (eyebrow + two-line headline) above an
asymmetric mosaic of **5 frosted tiles** with blue accents. Tiles carry baked-in
decorative SVG art: an animated network-of-dots, a stat figure, a floating cargo
ship, a count-up number, and a mini live-dashboard. Summarizes a product's whole
capability set at a glance.

## Motion
Reveal-on-scroll: the header and tiles fade/slide up in a stagger
(`data-reveal` + `data-reveal-delay`). The "180+" markets figure counts up
(`data-countup`). Hover = the shared `is-hover-lift` axis + the designed `.card-shine` sheen. The SVGs loop subtly
(network nodes pulse, ship floats). No scroll-pinning.

## Anatomy
```
section.cmp-bento.bento-grid.is-hover-lift.surface-primary[data-animate]  --bn-row:272px --bn-gap:12px
└ .container-ds
  ├ .section-head            ← .ds-eyebrow + h2.type-h2
  └ .bn-grid[role=list]      ← 5 tiles (spans per tile via is-w*/is-h*):
     A is-w6 is-h1 .card-a feature — label + headline + blurb (+ network SVG)
     B is-w3 is-h1 .card-b stat    — icon + big stat (e.g. <2s) + label
     C is-w3 is-h2 .card-c tall tile   — label + headline + illustration + 3-item list
     D is-w3 is-h1 .card-d counter — icon + data-countup number + label
     E is-w6 is-h1 .card-e wide tile   — label + headline + 3 dashboard tiles
```

## Content contract
- **5 tiles in the A–E layout** — spans live on each tile (`is-w*`/`is-h*`);
  the `card-a..e` classes remain as PAINT hooks for the designed art set
  (net-viz, ship, dash panels), which is scoped to the `.bento-grid` marker.
- Per feature card (A, C, E): eyebrow label (≤2 words), headline ≤5 words
  (uses `<br>` for line breaks), optional short blurb.
- Stat cards (B, D): one number + unit + a short label + optional sub-line.
  Card D's number is live via `data-countup` (`data-suffix="+"`).
- Card C has a 3-item bullet list; Card E has 3 dashboard metric tiles
  (label + value + delta).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT add/remove cards or change `card-a…card-e` / span classes** — the
  mosaic layout depends on exactly these spans. Adding a 6th card breaks it.
- The decorative SVGs (network, ship, dashboard) are part of the design; keep
  them or the tiles look empty. They are aria-hidden — fine to leave as-is.
- Change copy + the stat numbers + list/dashboard values; leave structure intact.

## Authoring rule
Read `blocks/bento-grid.html`. Reuse the 5-card structure and classes verbatim;
change only the labels, headlines, blurbs, numbers and list/dashboard values.
