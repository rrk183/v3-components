# Features — Auto-Progress Tabs

`features-autoprogress` · Feature Sections · **supporting** · surface-white · `data-tabs` (`data-autoplay="4000"`, `data-tabs-progress`)

## Look
A light section with a centered header (eyebrow + headline) above a two-column
layout. The left column is a vertical stack of **4 tab cards** (icon + title +
description), each with a thin progress bar along its edge; the active card's bar
fills as the timer runs. The right column shows the matching feature image, which
swaps as tabs change. On mobile the image stacks above the cards.

## Motion
`data-tabs` with `data-autoplay="4000"`: tabs auto-advance every 4 s; clicking a
card jumps to it and restarts the timer; hovering pauses. Each card carries its
own `.fap-card-bar[data-tabs-progress]` that fills 0→100% over the active cycle.
Image panels crossfade via `data-panel` + `data-bg`. Header eyebrow/headline
reveal-up on scroll.

## Anatomy
```
section.cmp-features-autoprogress.surface-white.section-y[data-animate]
└ .container-ds
  ├ .section-head            ← .ds-eyebrow + h2.type-h2 (data-reveal)
  └ [data-tabs][data-autoplay=4000].fap-tabs (grid lg:2col)
    ├ .flex.flex-col (cards) ← 4 button.fap-card[data-tab f1–f4]:
    │     .fap-icon(svg) + .fap-body(.fap-title + .fap-desc)
    │     + .fap-card-bar[data-tabs-progress]
    └ .fap-media             ← 4 .fap-panel[data-panel f1–f4]:
          .fap-img[data-bg]
```

## Content contract
- **4 tabs = 4 cards + 4 panels**, paired by `data-tab` / `data-panel` ids
  (f1–f4). No `.active` is hard-coded — the recipe starts on the first.
- Per card: an icon glyph, a short title (≤5 words), and a 1–3 sentence
  description (`.fap-desc`).
- **4 image slots** (one `.fap-img[data-bg]` per panel), landscape/portrait
  feature crop.
- No live numbers; the progress bars are timer-driven, not content.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep one `.fap-card-bar[data-tabs-progress]` per card — that is what the
  recipe fills; removing it kills the progress indicator.
- Keep `data-tab`/`data-panel` ids matched 1:1; mismatches break the swap.
- The `order-1`/`order-2` + `lg:order-*` utilities control the mobile/desktop
  stack order; keep them so the image leads on mobile.
- Adjust `data-autoplay` only to change cadence.

## Authoring rule
Read `blocks/features-autoprogress.html`. Reuse the 4-card/4-panel structure,
ids and `data-tabs-progress` bars verbatim; change only the icons, titles,
descriptions and `data-bg` image refs.
