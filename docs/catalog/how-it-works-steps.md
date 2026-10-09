# How It Works — Steps

`how-it-works-steps` · Process & Steps · **supporting** · surface-white · —

Ported from the CIB review codebase (2026-08). Root class `.cmp-how-it-works-steps`; all of its
styling lives in `ds.css` under that class — the block itself is pure markup.

## Look
A numbered 'how it works' sequence; each step carries a title, a line of copy and a short bulleted list.

## Content contract
- Steps are a simple ordered structure — add or remove without touching CSS.
- The heading is wired to the section via `aria-labelledby`.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Bullet markers are drawn with a token colour; don't swap them for emoji or images.
- For the same content as a connected timeline use `how-it-works-timeline`.
- Colours are tokens, never hexes: that is what lets the second brand
  (Emirates Islamic) re-derive this block without touching its CSS.

## Authoring rule
Read `blocks/how-it-works-steps.html`. Reuse the shell verbatim and change CONTENT only
(text + media). New markup or `cmp-*` classes on a page are drift.
