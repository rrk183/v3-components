# Feature Highlight (composition of cmp-bento)

`feature-highlight` · Bento Grids · **supporting** · surface-white · —

Ported from the CIB review codebase (2026-08). Root class `.cmp-feature-highlight`; all of its
styling lives in `ds.css` under that class — the block itself is pure markup.

## Look
One highlighted feature with a media panel, plus three supporting cards beneath carrying icon, title and a line of copy.

## Content contract
- Media via `data-bg`. Cards are a fixed trio — the grid is built for three.
- Icons are inline SVG using `currentColor` + a token text class.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Card borders use `--border`; don't hard-code a hairline colour or the second brand keeps ENBD's.
- Colours are tokens, never hexes: that is what lets the second brand
  (Emirates Islamic) re-derive this block without touching its CSS.

## Authoring rule
Read `blocks/feature-highlight.html`. Reuse the shell verbatim and change CONTENT only
(text + media). New markup or `cmp-*` classes on a page are drift.

## 2026-09-01 — ported onto cmp-bento
Now a bento composition: tall media tile (is-flush, w6 h2) with the designed
floating glass pills (`.fh-float`, copied to the cmp-bento zone as a generic
capability), a GHOST copy tile top-right (is-ghost — no panel), and three
`card-panel is-hover` icon cards (icon-tile + type-h6 + type-caption). Spans per
tile; --bn-row 236px. Legacy twin: feature-highlight-legacy.
