# Content Block — Numbers

`proof-points` · Feature Sections · **supporting** · surface-white · static

## Look
The numbered sibling of [content-block-nonumbers](content-block-nonumbers.md). A
`type-h2` headline sits left; two headline FIGURES sit right, side by side and
split by a vertical hairline. A full-width hairline rule runs under the pair,
then one or two muted body paragraphs in a `.measure` column. The figures are
the argument — the heading makes a claim and the numbers are the proof.
Figures are `type-display-lg` at **regular** weight, never bold.

## Motion
Static. Heading reveals up, the figure group follows at `.1`, the rule fades at
`.15`, body paragraphs at `.2`/`.25`. No recipe, no countup — these are static
figures, not animated counters (use `impact-stats` if you want count-up).

## Anatomy
```
section.cmp.cmp-proof-points.surface-white.section-y[data-animate]
└ .container-ds
  ├ .flex.flex-col.lg:flex-row…            ← top row
  │   ├ h2.type-h2.on-surface
  │   └ .flex.items-stretch.shrink-0       ← figure group
  │       ├ .flex.flex-col.gap-1 → span.cbn-figure.type-display-lg + span.type-body-sm
  │       ├ .cbn-divider.self-stretch.on-surface-border
  │       └ .flex.flex-col.gap-1 → span.cbn-figure + span.type-body-sm
  ├ .cbn-rule.on-surface-border
  └ .flex.flex-col.gap-5.measure → p.type-body.on-surface-mid ×1–2
```

## Content contract
- **Two figures** is the designed count; three still balances, one does not —
  drop to `content-block-nonumbers` if you only have a single number.
- Figure = a short token (`AED 950bn+`, `60+`, `13`), NOT a sentence. The label
  under it completes the thought in ≤ 6 words.
- Body: 1–2 paragraphs. `.measure` caps the line length — don't remove it.
- Keep one `.cbn-divider` BETWEEN each adjacent pair of figures, and exactly one
  `.cbn-rule` under the row.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.cbn-divider` / `.cbn-rule` get their border WIDTH from ds.css and their
  COLOUR from `.on-surface-border`. Keep both classes: as page-local copies
  (before this was a block) they carried colour only and drew nothing at all.
- Don't bold the figures — `type-display-lg` is regular by design.
- Pages that pre-date the block re-declare `.cmp-proof-points` rules in
  their own `<style>`; those are legacy debt, not a pattern to copy.

## Authoring rule
Read `blocks/proof-points.html`. Reuse the structure verbatim; change
only the headline, the figures and their labels, and the body copy.
