# Stats — Hero Figure

`stats-hero-figure` · Stats · **statement** · any surface · static (countup optional)

## Look
One enormous hero figure (`ds-num is-xl`) with supporting copy and a pair
of secondary figures separated by hairline rules — the "one number that
carries the section" moment.

## Anatomy
```
section.cmp.cmp-stats-hero-figure.surface-*[data-animate]
└ .container-ds
  ├ .mt2-hero › .ds-num.is-xl[.is-light] + .type-body-lg copy
  ├ .mt2-rule / .mt2-rule-v   ← hairlines (on-surface-border)
  └ secondary figures › .ds-num.is-lg + .type-h3/.type-body labels
```

## Content contract
- ONE hero figure (≤6 chars reads best at is-xl); 2 secondary figures max.

## Drift cautions
All figures are the `ds-num` ATOM (2026-09-01) — the old `.mt2-num`/
`.mt2-cap` type is DELETED; remaining `.mt2-*` classes are layout/rules
only. Size via ds-num axes, never bespoke clamps.

## Authoring rule
Read `blocks/stats-hero-figure.html`. Reuse structure/classes verbatim;
change only content.
