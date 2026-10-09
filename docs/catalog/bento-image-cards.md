# Bento — Image Cards

`bento-image-cards` · Bento Grids · **statement** · surface-white · static + reveal

## Look
A light section with a header (eyebrow + headline) above a 3-card mosaic: one wide
card (col-span-2) plus two single-width cards. Each card is a colored gradient
panel carrying baked-in decorative SVG art (a wireframe globe, layered waves, and
a constellation network), with an eyebrow, a two-line heading, a short body line
and an arrow glyph at the bottom. A photo-led-feeling overview of three offerings.

## Motion
Reveal-on-scroll only: the header and each card fade/slide up in a stagger
(`data-reveal="up"` + increasing `data-reveal-delay` per card). The SVG art is
static decoration. No countup, no scroll-pinning.

## Anatomy
```
section.cmp.cmp-bento-image-cards.surface-white.section-y[data-animate]
└ .container-ds
  ├ .ds-stack.section-head  ← .ds-eyebrow + h2.type-h2 (reveal)
  └ .bic-grid[role=list]    ← 3 fixed cards:
     A .bic-card-a (col-span-2, .bic-bg-a dark navy)  — GlobeArt SVG
     B .bic-card-b (col-span-1, .bic-bg-b light blue) — WaveArt SVG
     C .bic-card-c (col-span-1, .bic-bg-c midnight)   — ConstellationArt SVG
       each: .bic-card[data-href] > .bic-art(svg) + .bic-fade + .bic-border
              + .bic-text (.bic-eyebrow + h3.bic-heading + p.bic-body + .bic-arrow)
```

## Content contract
- **Exactly 3 cards in the A/B/C layout** — A is col-span-2, B and C are
  col-span-1; spans are fixed in CSS per card class.
- Per card: eyebrow (≤2 words), heading ≤5 words (uses `<br>` for the two lines),
  one short body sentence, plus the arrow glyph.
- Card backgrounds are **intrinsic CSS gradients** (`bic-bg-a/b/c`), not raster
  images — there are no image slots to fill. The decorative SVGs are baked into
  the block.
- Light vs dark text per card: A and C use `bic-heading-white` + `bic-*-dark`,
  B uses `bic-heading-navy` + `bic-*-light`. No live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT add/remove cards or change `bic-card-a/b/c` / span classes** — the
  mosaic depends on exactly these three spans.
- Keep each card's decorative SVG (`.bic-art`) and the `.bic-fade` / `.bic-border`
  layers, or the gradient tile looks empty. They are aria-hidden — leave as-is.
- Keep the light/dark text-class pairing per card (white heading on the dark A/C,
  navy heading on the light B) so copy stays legible on its gradient.

## Authoring rule
Read `blocks/bento-image-cards.html`. Reuse the 3-card structure, gradient classes
and SVG art verbatim; change only the eyebrows, headings and body lines.
