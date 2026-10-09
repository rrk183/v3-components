# Stats — Quad

`stats-quad` · Stats · **supporting** · any surface · static (countup optional)

## Look
A section head beside a 2×2 grid of big figures: each cell is a `ds-num`
(is-lg, optional is-light) with an accent unit and a small label.

## Anatomy
```
section.cmp.cmp-stats-quad.surface-*[data-animate]
└ .container-ds
  ├ .section-head.is-split › .ds-stack › eyebrow + .type-h2 + .sh-lead
  └ .m1-grid › .m1-cell ×4
    ├ .ds-num.is-lg[.is-light] › figure + span.ds-num-unit
    └ .m1-lbl (.type-body-sm)
```

## Content contract
- Exactly 4 cells; figure ≤7 chars; unit short (%, bn, +); label one line.

## Drift cautions
Figures are the `ds-num` ATOM (2026-09-01) — the old `.m1-num`/`.m1-unit`
type is DELETED; `.m1-*` that remain are layout-only (grid/cell/label).
Never re-add bespoke number type; scale via ds-num's own axis
(is-sm/base/is-lg/is-xl/is-light).

## Authoring rule
Read `blocks/stats-quad.html`. Reuse structure/classes verbatim; change
only content.
