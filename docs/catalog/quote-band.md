# Quote Band

`quote-band` · Feature Sections · **statement** · surface-primary default · variants: Default, Reversed (`quote-band-rev`), Carousel (`quote-band-carousel`, shared data-carousel core)

## Look
One strong voice on a dark band: a topic image beside an oversized
pull-quote (display type with a large quote mark) and a compact citation.
Reversed flips the columns. The Carousel variant rotates several voices
with the shared carousel controls (toggle + glass arrows).

## Anatomy
```
section.cmp.cmp-quote-band.surface-primary[data-animate]
└ .container-ds › .qb-inner
  ├ .qb-media › .qb-img[data-bg]
  └ .qb-body
    ├ .qb-mark (.bm-quote-mark)
    ├ .qb-quote (.type-display-xxl on-surface)
    └ figcaption.qb-cite (.type-body-sm) — name strong, role .on-surface-mid / .type-blue-soft
Carousel: .qb-carousel[data-carousel] › .qb-track[data-carousel-track] › .qb-slide ×N + .qb-ctrls
```

## Content contract
- Quote ≤ 3 lines at display size; citation = name + role in ONE
  figcaption (no `.qb-name`/`.qb-role` children — that anatomy is gone).
- Carousel: 3–4 slides; each slide repeats media + figure.

## Not for
Several short testimonials in a grid — use Cards — Testimonials or
Cards — Quote.

## Drift cautions
The old testimonials components are DELETED — never point at
`testimonials-expand`/`testimonials-carousel`. `is-portrait-bleed` is
retired (renders as the plain band). Keep quotes translated via
ar-preview strings.

## Authoring rule
Read `blocks/quote-band.html` (or -rev / -carousel). Reuse
structure/classes verbatim; change only content.
