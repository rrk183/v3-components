# Tabs — Pills

`tabs-pill` · Tabs · **supporting** · any surface · _(ds.js data-tabs)_

Pills rail of **[[tabs-underline]]** (cmp-tabs v4) — and the whole point: the rail is bare `.chip.rounded-full` atoms (use `chip-lg` only when a bigger rail is wanted) with `data-tab`, ZERO tab CSS. The chip selected state ([aria-selected]/.active → blue wash) is the active state, and chips flip on dark surfaces, so the old `.tabs-pill-dark` twin is deleted.

## Anatomy
`[data-tabs]` > `.tb-rail[role=tablist]` (gap utility) of `button.chip.rounded-full[data-tab]` + `.tb-panel[data-panel]` siblings. Demo panels: `ds-num` stat rows + prose — panels take ANY HTML.

## Drift cautions
- No tray, no `.tab-pill` class, no dark twin — if a grouped-tray look is ever wanted, that is a chip-model conversation, not new tab CSS.
