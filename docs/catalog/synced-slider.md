# Video Content (slider)

`synced-slider` · Feature Sections · **statement** · surface-grey · `data-behavior="synced-slider"`

## Look
A three-column section where one active slide drives all three regions at once:
LEFT is a heading + body + big stat, CENTRE is a tall photo card with a
restacking "deal-card" deck and two fixed stat tiles, RIGHT is a testimonial
quote with attribution under a brand lockup. Reads like a synced, self-playing
case-study slider.

## Motion
The `synced-slider` recipe auto-advances every `data-interval="4000"` ms and
pauses on hover. On each tick the matching `[data-vc-index]` heading, body, stat,
photo (`.vc-img`), deck card and quote cross-fade in together (`[data-vc-swap]`
shows one index at a time). A progress pill (`[data-vc-progress]`) fills over the
interval and `[data-vc-dots]` renders clickable dots. The CENTRE deck restacks
cards as the index changes. Not scroll-driven.

## Anatomy
```
section.cmp-synced-slider.surface-grey.section-y[data-animate]
└ .vc-grid[data-behavior=synced-slider][data-interval=4000]
  ├ .vc-left   ← .vc-headings/.vc-bodies (4 [data-vc-swap]) + .vc-pill
  │             (.vc-pill-fill[data-vc-progress] + .vc-dots[data-vc-dots])
  │             + .vc-stats (4 [data-vc-swap]: .vc-stat + .vc-stat-label)
  ├ .vc-card   ← .vc-imgs (4 .vc-img[data-vc-swap][data-bg]) + .vc-card-gradient
  │             + .vc-deal-stack (4 .deal-card[data-vc-card]) + .vc-tiles (fixed)
  └ .vc-quote.dot-grid ← .vc-logo + .vc-quotezone (4 [data-vc-swap] quote+attr)
```

## Content contract
- **4 synced slides** (index 0–3). Every region must carry the same set of
  indices: 4 headings, 4 bodies, 4 stats, 4 `.vc-img` photos, 4 `.deal-card`
  deck cards, 4 quotes. Add/remove a slide = add/remove one indexed item in each
  region **and** one deck card, keeping indices aligned.
- Headings: short (≤8 words). Bodies: 1–2 sentences. Stat: one figure + one
  short label. Quote: one sentence + author + title + company.
- Photos via per-`.vc-img` `data-bg` (the photos are full-bleed card fills).
- The `.vc-tiles` block (two `.vc-tile` numbers + caption) is **fixed** — not
  per-slide. No `data-countup`; numbers are static text.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Keep index alignment across all regions** — a heading at index 2 with no
  matching photo/quote/deck card at index 2 will show a blank slide.
- Keep `[data-behavior]`, `[data-vc-swap]`, `[data-vc-card]`, `[data-vc-progress]`
  and `[data-vc-dots]` hooks — the recipe wires the whole sync off these.
- The centre `.vc-tiles` figures are global, not slide-specific; don't try to
  swap them per index.

## Authoring rule
Read `blocks/synced-slider.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
