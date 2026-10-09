# Bento — Photographic

`bento-photo` · Bento Grids · **statement** · surface-white · reveal

## Look
A light section with a header (eyebrow + two-line headline) above a photo-forward
asymmetric mosaic of **5 image tiles**. Each tile is a full-bleed photo with a
gradient overlay and white text (tag + title, some with body + link). Themes are
summarized through imagery rather than copy.

## Motion
Reveal-on-scroll only — header and each tile fade/slide up in a stagger via
`data-reveal="up"` + increasing `data-reveal-delay`. On hover each tile's `.bp-img`
layer Ken-Burns zooms while the content stays still. No recipe, no scroll-pinning.

## Anatomy
```
section.cmp-bento-photo.surface-white.section-y[data-animate]
└ .container-ds
  ├ .ds-stack.section-head     ← .ds-eyebrow + h2.type-h1
  └ .bp-grid                   ← 5 tiles (fixed spans by modifier class):
     a.bp-tile.bp-tile-lg   large lead — img + ov-b + tag + title + body + link
     a.bp-tile.bp-tile-top  tall — img + ov-b + tag + title + link
     a.bp-tile              standard — img + ov-b + tag + title
     a.bp-tile              standard — img + ov-b + tag + title
     a.bp-tile.bp-tile-wide wide — img + ov-l + .bp-content-left tag + title + body + link
```
Each tile: `span.bp-img[data-bg]` + `.ov.ov-gradient-*` + `.bp-content`.

## Content contract
- **Exactly 5 tiles** in the lg / top / standard×2 / wide layout — spans are
  fixed in CSS per modifier class. Keep all five and their roles.
- Every tile: a `.bp-tag` (≤2 words) + `.bp-tile-title` (≤1 short sentence).
- The lg and wide tiles add a `.bp-tile-body` line + a `.bp-link` (text + →);
  the others are title-only.
- **5 image slots**, one per tile, via `data-bg`; no fixed aspect ratio (tiles
  set their own size). The wide tile uses `ov-gradient-l` + `.bp-content-left`
  (left-anchored text); others use `ov-gradient-b`. No live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Do NOT add/remove tiles or change the `bp-tile-lg` / `bp-tile-top` /
  `bp-tile-wide` span modifiers — the mosaic depends on exactly these.
- Keep the `.bp-img` + `.ov` overlay layers (Ken-Burns + text legibility); keep
  the wide tile's `ov-gradient-l` + `.bp-content-left` pairing.
- Set images via `data-bg`; change tags/titles/body/links freely.

## Authoring rule
Read `blocks/bento-photo.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
