# How It Works — Timeline

`how-it-works-timeline` · Process & Steps · **supporting** · surface-white · —

Ported from the CIB review codebase (2026-08). Root class `.cmp-how-it-works-timeline`; all of its
styling lives in `ds.css` under that class — the block itself is pure markup.

## Look
The same sequence as a connected timeline: numbered circular nodes on a gradient rule, with the copy beneath each node. Stacks to a vertical rail on small screens.

## Content contract
- Four to six nodes read best; the rule is a gradient between two derived blues.
- Node numbers are content, not generated — keep them sequential.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The connecting rule and node ring use `color-mix()` off `--blue`, so they re-derive per brand — don't replace them with fixed hexes.
- Colours are tokens, never hexes: that is what lets the second brand
  (Emirates Islamic) re-derive this block without touching its CSS.

## Authoring rule
Read `blocks/how-it-works-timeline.html`. Reuse the shell verbatim and change CONTENT only
(text + media). New markup or `cmp-*` classes on a page are drift.
