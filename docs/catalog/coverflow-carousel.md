# Coverflow Carousel

`coverflow-carousel` · Feature Sections · **statement** · surface-grey · `data-behavior="coverflow"`

## Look
A light grey section with a header (headline + lead) above a coverflow stage: one
sharp centre card flanked by blurred, scaled-down, dimmed side cards, over a
faint blurred backdrop of the active image. Below, a synced eyebrow/title/
description block, a numbered pager with prev/next arrows ("1 / 4"), and an
"Explore" CTA. Premium browse feel.

## Motion
The `coverflow` recipe (`data-behavior="coverflow"`) drives it. Cards
auto-advance every `data-interval="5000"` ms and pause on hover; you can click a
side card or use the arrows. The active card is sharp/centred while siblings are
blurred/scaled/dimmed; the `.fr-bg` backdrop crossfades to the active image and
the eyebrow/title/description (`data-fr-text`) swap to match. The pager count
updates. No countup, no scroll-pinning.

## Anatomy
```
section.cmp.cmp-coverflow-carousel.surface-grey.section-y[data-animate]
└ .container-ds
  ├ .fr-head            ← h2 headline + p lead (data-reveal)
  └ .fr[data-behavior=coverflow][data-interval=5000]
     ├ .fr-bg[data-fr-bg]          ← blurred backdrop
     ├ .fr-stage[data-fr-stage]
     │   └ 4 × .fr-card[data-fr-card][data-fr-index][data-fr-href][data-bg]
     └ .fr-foot
        ├ .fr-texts → 4 × .fr-text[data-fr-text][data-fr-index]
        │             (.ds-eyebrow + h3.fr-title + p.fr-desc)
        └ .fr-nav
           ├ .fr-pager → arrow[data-fr-prev] + span[data-fr-count] + arrow[data-fr-next]
           └ a.btn.btn-primary.fr-explore[data-fr-explore]
```

## Content contract
- **4 cards + 4 matching text panels** by default, paired by `data-fr-index`
  (0–3). Each card has a `data-bg` image and a `data-fr-href` link; each text
  panel has an eyebrow, an `h3.fr-title`, and a short `.fr-desc` paragraph.
- The pager count (`data-fr-count`, "1 / 4") is set by the recipe — match its
  total to the card count.
- Card images are CSS backgrounds via `data-bg` (e.g. `/assets/images/image-1.jpg`)
  — no fixed aspect ratio in markup; the stage sizes the cards.
- No live numbers (no countup).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Keep card count and text-panel count equal and index-aligned** —
  `data-fr-index` on `.fr-card` must match `data-fr-text`, or the synced copy
  breaks. Add/remove in pairs.
- Keep the `data-fr-*` hooks (`data-fr-stage`, `data-fr-card`, `data-fr-bg`,
  `data-fr-text`, `data-fr-prev/next/count/explore`) and `data-behavior="coverflow"`
  — the recipe wires everything off these.
- Reveal gotcha: put `data-reveal` only on the `.fr-head` heading/lead; do NOT
  reveal the `.fr` stage or its cards or the carousel can be left hidden.
- `data-interval` controls autoplay speed — keep unless deliberately retuning.

## Authoring rule
Read `blocks/coverflow-carousel.html`. Reuse structure/classes verbatim; change
only content (text + media refs).
