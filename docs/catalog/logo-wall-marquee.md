# Logo Wall — Marquee

`logo-wall-marquee` · Feature Sections · **supporting** · surface-white · CSS marquee

## Look
A light section with a centered header (eyebrow + headline) above a single
horizontal strip of partner logos that scrolls continuously edge to edge. Logos
are mixed-width brand marks (Google, Microsoft, Visa, SWIFT…) sized by per-item
width classes for even optical weight.

## Motion
Pure-CSS keyframe marquee — **no JS**. The `.tpm-strip` translates left and the
logo set is duplicated 2× so the loop is seamless (`translateX(-50%)` wraps with
no visible jump). The animation pauses on hover. The header and the strip
container reveal-up on scroll once. No scroll-scrub, no countup.

## Anatomy
```
section.cmp-logo-wall-marquee.surface-white.section-y.overflow-hidden[data-animate]
├ .container-ds > .section-head   ← .ds-eyebrow + h2.type-h2
└ .tpm-outer (data-reveal) > .tpm-strip
   ├ Set 1: 12 × .tpm-item > .tpm-logo (img or inline svg) + .tpm-w-* width class
   └ Set 2: identical 12 items, aria-hidden="true", alt=""  ← seamless duplicate
```

## Content contract
- **12 logos per set**, duplicated to **24 total** items. Both sets must stay
  identical for the seamless loop; the second set is `aria-hidden="true"` with
  empty `alt`.
- Each logo carries a `.tpm-w-*` width class (e.g. `tpm-w-32` … `tpm-w-110`)
  chosen to balance the brand mark's optical size — keep one per item.
- Logos are mostly remote `<img src>` SVGs (Wikimedia) with one inline `<svg>`
  fallback (Samsung); either form works.
- Header: one eyebrow + one headline. No live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Keep both sets identical and the duplicate aria-hidden** — the CSS loop
  depends on the strip being exactly two copies; an uneven duplicate makes the
  scroll stutter or jump.
- Keep `.overflow-hidden` on the section and the `.tpm-outer`/`.tpm-strip`
  structure — the marquee animation is bound to these classes.
- Give every new logo a sensible `.tpm-w-*` so widths stay balanced.

## Authoring rule
Read `blocks/logo-wall-marquee.html`. Reuse structure/classes verbatim;
change only content (text + media refs).
