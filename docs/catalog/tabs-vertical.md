# Tabs — Vertical

`tabs-vertical` · Tabs · **supporting** · any surface · _(ds.js data-tabs)_

Vertical rail of **[[tabs-underline]]** (cmp-tabs v4) — the underline rotated: `.tb-rail.is-vertical` draws a start-border indicator (logical properties, so RTL mirrors free). Layout (rail beside panels) is utility classes in the block markup, not component CSS.

## Anatomy
`[data-tabs]` (flex utilities) > `.tb-rail.is-vertical[role=tablist]` of `button.tb-tab[data-tab]` + a flex-1 column of `.tb-panel[data-panel]`.

## Drift cautions
- Suits long label sets; stacks above panels below 768px via the markup utilities — keep that responsive pattern when pasting.
