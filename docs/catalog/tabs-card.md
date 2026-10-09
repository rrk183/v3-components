# Tabs — Cards

`tabs-card` · Tabs · **supporting** · any surface · _(ds.js data-tabs)_

Card-trigger rail of **[[tabs-underline]]** (cmp-tabs v4). Each trigger is a COMPOSITION on the button: `card-panel.surface-grey.is-tile` (+ `--card-pad`) + `icon-tile.is-sm` + `.type-*` label/descriptor — no `.tab-card/-icon/-label/-desc` classes. The component adds only two state hooks: the active blue ring on the card-panel and the icon-tile solid flip (`--it-fill`/`--it-ink`).

## Anatomy
`[data-tabs]` > `.tb-rail[role=tablist]` (gap utility) of `button.card-panel.surface-grey.is-tile[data-tab]` + `.tb-panel[data-panel]` siblings.

## Drift cautions
- The trigger is a real card-panel — always a light island, sized by `--card-pad`; never re-invent a card look on the button.
- Icons use `stroke="currentColor"`/`fill="currentColor"` so the active `--it-ink` flip applies.
