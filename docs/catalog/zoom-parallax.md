# Zoom Parallax

`zoom-parallax` · Storytelling & Scroll · **showpiece** · surface-dark (default; `surface-white` for light) · `data-behavior="zoom-parallax"`

## Look
A cinematic section: a centered intro (eyebrow + headline + paragraph) over a
soft glow, then a sticky stage where seven layered image cards are positioned
around the viewport and scale up from their centres as you scroll, "zooming"
the layout into view. A closing paragraph follows below. Pure spectacle.

## Motion
The `zoom-parallax` recipe scales each `.px-item` layer with scroll progress over
the 300vh sticky container — each layer's growth is set by its own
`data-scale-max`, so layers expand at different rates for depth. Header and
footer text reveal-up on scroll. The header glow is decorative/static.

## Anatomy
```
section.cmp-zoom-parallax.surface-dark[data-animate]
└ [data-behavior=zoom-parallax]
  ├ .zp-header (50vh)  ← .zp-glow + .ds-eyebrow + h2.type-h2 + p (data-reveal)
  ├ .zp-container (300vh) > .zp-sticky (sticky, h-screen)
  │   └ 7 × .px-item[data-scale-max]
  │        └ .px-card.px-card-{0..6} > .px-img[data-bg]
  └ footer text  ← .type-body paragraph (data-reveal up)
```

## Content contract
- **Exactly 7 image layers** (`.px-card-0` … `.px-card-6`), each with its own
  `data-scale-max` (4, 5, 6, 5, 6, 8, 9 in the canonical markup) and a fixed
  `.px-card-N` position class.
- Images via per-`.px-img` `data-bg` (runtime sets `background-image`).
- Header: eyebrow + headline (uses `<br>` for the line break) + one paragraph.
  Footer: one paragraph.
- No countup; numbers in copy are static text.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Keep all 7 layers and their `.px-card-0..6` classes** — each position is
  placed in CSS; dropping or renaming one collapses the composition.
- `data-scale-max` per layer is tuned for staggered depth — change images
  freely, but treat the scale values as part of the recipe.
- Keep `data-behavior="zoom-parallax"` and the `.zp-container`/`.zp-sticky` 300vh
  sticky structure (a scroll component) — that's what drives the zoom.

## Authoring rule
Read `blocks/zoom-parallax.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
