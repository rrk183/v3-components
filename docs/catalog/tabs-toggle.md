# Tabs — Toggle

`tabs-toggle` · Tabs · **supporting** · any surface · _(ds.js data-tabs)_

Segmented-toggle composition of **[[tabs-underline]]** (cmp-tabs v4): chip atoms grouped in the `.is-tray` pill well — active segment raised white, tray flips frosted on dark surfaces. The audience/mode switch pattern (2–4 short segments). Rail alignment via the axis (`is-center` here).

## Anatomy
`[data-tabs]` > `.tb-rail.is-tray[role=tablist]` of `button.chip.rounded-full[data-tab]` + `.tb-panel[data-panel]` siblings. Demo panels: intro line + a cmp-cards duo.

## Drift cautions
- 2–4 short segments only — more, or long labels, want the Pills or Underline rail.
- Never rebuild the tray per page; `.is-tray` is the one grouped-pill look.
