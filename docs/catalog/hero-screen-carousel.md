# Hero — Screen Carousel

`hero-screen-carousel` · Heroes · **showpiece** · grey-2 ground · bound by `[data-v3a-hero]` (ds.js)

Migrated as-is from personal-home-v3a: markup and class names are the
source's. CSS is scoped to the root `.v3a-hero` (not `body.pg-home-v3`) so it
works inside a CMS rich-text field.

## Look
A full-bleed carousel (four slides: photo, navy gradient washes, white copy,
accent CTA) that is actually playing on a monitor in a calm home study. A
loading-bar dot strip and a pause toggle sit at the bottom. One slide can
carry a stat row (count-ups); one can carry a floating card image.

## Motion
The section **pins** for ~3 screen-heights (2.3 on tablet/phone). Scrolling
pulls the camera back out of the monitor to the whole desk; the slide copy and
controls step aside first. The study softens, a hand + phone rise, the phone
types "I'd like to open an account", then the phone screen opens to a white
sheet that covers the stage and hands off to the next (white) section.
Autoplay runs at the top and on the monitor during the pull-back; the active
dot's bar fills over 6s and advances the slide. It holds for keyboard focus,
hidden tabs and the pause button. Reduced motion: a plain carousel, no study,
no pin, no phone, no autoplay.

## Anatomy
```
section.cmp.v3h.v3a-hero[data-v3a-hero]
└ .v3h-track > .v3h-stage (sticky)
  ├ .v3a-rig
  │  ├ .v3a-screen > span.v3a-slide[data-bg][data-fx]  ×4   ← slide photos
  │  └ span.v3a-room[data-bg]                               ← study plate (screen keyed out)
  ├ .v3a-copy
  │  ├ .v3a-item ×4  (ov washes + container-ds > .hero-copy)
  │  │    optional .v3a-stats > .v3a-stat (ds-num[data-v3a-count]) ×3
  │  │    optional span.v3a-card > img
  │  └ .v3a-nav > button.crl-toggle[data-v3a-toggle] + .v3a-dots > button.v3a-dot ×4
  ├ .v3h-hand > img + .v3h-screen > .v3h-ui (question, typed line, 5 options)
  └ .v3h-sheet
```

## Content contract
- Slides, items and dots are **matched by index**: N `.v3a-slide` = N
  `.v3a-item` = N `.v3a-dot`. Only the first item is `is-on` without `inert`;
  the others carry `inert aria-hidden="true"`. Slide 1 holds the page `h1`,
  the rest `h2`.
- Slide photos: landscape 16:9. `data-fx` (0–1) is the subject's horizontal
  position, used to pan portrait screens to it.
- Study plate `study.webp` (2560×1440, screen keyed to alpha) and the hand
  `hero-hand.webp` are fixed artwork: the recipe's screen geometry is measured
  on that plate. A different plate needs new numbers in the recipe.
- Per item: eyebrow optional, headline ≤ 2 lines, one sentence, one CTA.
- Stat row: 3 figures; the final value is in the markup, `data-v3a-count`
  (+ `data-decimals`, `data-prefix`, `data-suffix`) drives the count-up.
- Phone: `data-text` on `.v3h-type` is the typed phrase; the first `li`
  lights when typing ends.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the slide / item / dot counts equal.
- The next section should be white (`surface-white`): the hero ends on a
  white sheet.
- Use one per page, at the top.
- Image paths are site-root (`/assets/webxv2/images/personal-home/hero-v3a/…`, hand in `…/hero-v3/`)
  so they resolve under `/en/` in the CMS.
