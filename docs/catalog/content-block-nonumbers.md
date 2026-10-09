# Content Block — No Numbers

`content-block-nonumbers` · Feature Sections · **supporting** · surface-grey · static

## Look
A plain workhorse copy block on a light grey surface: a `type-h2` headline and a
single muted body paragraph. The block ships **two variants** in one file — a
stacked variant (headline over paragraph) and a side-by-side variant (headline
left, paragraph right at `md:` and up). No figures, no media, no decoration.

## Motion
Static. Headline and paragraph reveal up on scroll (`data-reveal="up"`, the
paragraph delayed `data-reveal-delay=".1"`). No recipe, no countup.

## Anatomy
```
section.cmp.cmp-content-block-nonumbers.surface-grey.section-y-tight[data-animate]
└ .container-ds
  ├ Variant 1 (stacked):     .flex.flex-col.gap-5
  │   ├ h2.type-h2.on-surface
  │   └ p.type-body.on-surface-mid.measure
  └ Variant 2 (side-by-side): .flex.flex-col.md:flex-row.md:gap-16
      ├ h2.type-h2.on-surface.md:w-1/2.flex-shrink-0
      └ p.type-body.on-surface-mid.md:w-1/2.md:pt-3
```

## Content contract
- **One headline + one body paragraph per block.** Pick ONE variant and ship it;
  the file shows both so you can choose stacked vs side-by-side.
- Headline: short (`type-h2`); body: 1–3 sentences. `.measure` caps the line
  length in the stacked variant.
- No images, no numbers, no countup.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **`cmp-content-block-nonumbers` has no CSS rule of its own** — this block
  renders entirely from utility classes (`flex`, `md:w-1/2`, `type-*`,
  `on-surface*`). Keep those utilities exactly; the `cmp-` class is just a hook.
- In the side-by-side variant keep both `md:w-1/2` widths so the columns split
  evenly.
- Reveal the headline and paragraph only — keep `data-reveal` off the section root.

## Authoring rule
Read `blocks/content-block-nonumbers.html`. Reuse structure/classes verbatim;
change only content (text + media refs).
