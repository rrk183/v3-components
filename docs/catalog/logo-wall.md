# Logo Wall — Grid

`logo-wall` · Feature Sections · **supporting** · surface-white · reveal (static logos)

## Look
A light section with a split header — left headline, right-aligned description —
above a bordered logo grid: columns are AXES: `is-cols-3/4/5` desktop (4 default) and `is-m-cols-1/2` mobile — the gallery Columns + Mobile columns controls drive the same classes. Each cell holds
one inline-SVG partner logo, grayscale by default, separated only by hairline
internal dividers. A bottom CTA row pairs a sub-headline with an arrow link.

## Motion
Reduced motion otherwise: cells reveal-up on scroll in a stagger
(`data-reveal="up"` with `data-reveal-delay` climbing 0 → .35 across the 9 cells).
Logos sit grayscale and gain colour + a slight scale on hover (CSS only). The CTA
link reveals from the left. No scroll-pinning, no countup.

## Anatomy
```
section.cmp-logo-wall.surface-white.section-y[data-animate]
└ .container-ds
  ├ header flex row        ← h2.type-h2 (left) + p.type-body (right, lg:text-right)
  ├ .grid.grid-cols-2.md:grid-cols-4   ← 9 × .tpg-cell:
  │    each cell > .tpg-logo > inline <svg> logo, with border-r/border-b dividers
  └ CTA row                ← h3.type-h3 + a.tpg-cta (label + arrow SVG)
```

## Content contract
- **9 logo cells**, each an inline `<svg>` logo (no `<img>`). Divider classes
  (`border-r`, `border-b`, `md:border-r`, `md:border-b-0`) are tuned per cell to
  draw only internal lines for the 4-col grid — they are positional, not arbitrary.
- Header: one headline (≤5 words, `max-w-sm`) + one description sentence
  (~2 lines, `max-w-sm`).
- CTA row: one short sub-headline + one link label (≤3 words) + arrow SVG.
- No live numbers (no `data-countup`).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep **9 cells** so the 4-col grid fills two clean rows; if you change the
  count, re-derive the `border-r`/`border-b`/`md:*` divider classes per cell or
  the grid lines break.
- Logos are inline SVG by design (consistent sizing/grayscale); replace the SVG
  contents per partner rather than dropping in `<img>` tags.
- Keep the staggered `data-reveal-delay` ramp and the `.tpg-cta` structure intact.

## Authoring rule
Read `blocks/logo-wall.html`. Reuse structure/classes verbatim;
change only content (text + media refs).

## Axes
Columns `is-cols-3/4/5` (desktop, default 4) · Mobile columns `is-m-cols-1/2`.
Dividers are column-agnostic start-borders — changing columns never needs CSS.
Marquee variant: speed via the gallery Speed control (`--marquee-dur`).
