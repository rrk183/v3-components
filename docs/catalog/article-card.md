# Article Card

`article-card` · Blogs & Articles · **supporting** · surface-grey · —

Ported from the CIB review codebase (2026-08). Root class `.cmp-article-card`; all of its
styling lives in `ds.css` under that class — the block itself is pure markup.

## Look
A three-card insight/article feed. Each card is a media panel with a category tag, a three-line clamped title, and a footer byline with author and exact date, separated by a hairline.

## Content contract
- Cards are `<a>` — the whole card is the click target.
- Per-card images come from `data-bg`, never an inline background.
- Titles clamp to three lines so every card's footer aligns; write to ~70 characters.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The hover 'Read' affordance is permanently visible on touch (`@media (hover: none)`) — don't remove that rule.
- Dates are exact (not 'x days ago') so the feed doesn't rot.
- Colours are tokens, never hexes: that is what lets the second brand
  (Emirates Islamic) re-derive this block without touching its CSS.

## Authoring rule
Read `blocks/article-card.html`. Reuse the shell verbatim and change CONTENT only
(text + media). New markup or `cmp-*` classes on a page are drift.
