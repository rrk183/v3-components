# About + Stats

`statement-stats` · Feature Sections · **statement** · surface-white · data-behavior="text-reveal"

Ported from the CIB review codebase (2026-08). Root class `.cmp-statement-stats`; all of its
styling lives in `ds.css` under that class — the block itself is pure markup.

## Look
Two columns: eyebrow, looping video and supporting copy on the left; a large statement heading and a row of count-up proof stats on the right. The heading fills word-by-word from muted to full colour as the section scrolls (scrubbed, not a one-shot reveal).

## Content contract
- Every word of the heading is its own `<span data-tr-word>` — the recipe toggles `.is-on` across them by scroll progress. Re-word freely; just keep each word wrapped.
- The `aria-label` on the `<h2>` must repeat the full sentence, since the words are split across spans.
- Stats are `data-countup` + `data-suffix`; three reads best, four still fits.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **The word-split headline stays English in the AR preview.** Each word is
  its own text node for the scroll fill, and the Arabic preview matches per
  node — Arabic word order does not map one-to-one onto English, so a
  piecewise translation would read as nonsense. A real Arabic page authors
  the headline in Arabic and re-splits it there. The paragraph and stat
  labels DO translate.
- Word colours live in CSS (`[data-tr-word]` / `.is-on`) — never set them in markup, or the second brand can't theme the fill.
- Reduced-motion reveals every word at once; don't gate content behind the scrub.
- Colours are tokens, never hexes: that is what lets the second brand
  (Emirates Islamic) re-derive this block without touching its CSS.

## Authoring rule
Read `blocks/statement-stats.html`. Reuse the shell verbatim and change CONTENT only
(text + media). New markup or `cmp-*` classes on a page are drift.
