# Device Showcase (scroll) — Desktop

`desktop-scroll` · Storytelling & Scroll · **showpiece** · surface-white · `data-behavior="scroll-story"`

## Look
A light section: a header (eyebrow + two-line headline), then a laptop frame
pinned on the left with copy steps flowing past it on the right. The laptop
screen shows one app screenshot at a time and crossfades as each numbered step
arrives at center.

## Motion
The `.dvs` block **pins** and scrubs to scroll via the declarative scroll-story
recipe; `data-scrub-vh="400"` means ~4 screen-heights drive the sequence. Each
`.dvs-media` layer carries a `data-anim` opacity range so the screens crossfade
in sequence as progress advances (0→1). The steps themselves are plain flowing
content that scroll past the pinned laptop. Header reveals-up on scroll.

## Anatomy
```
section.cmp-device-scroll.cmp-device-desktop.surface-white[data-animate]
├ .container-ds.dvs-head.section-head   ← .ds-eyebrow + h2.type-h2
└ .dvs[data-behavior=scroll-story][data-scrub-vh=400]
  └ .container-ds.dvs-grid
    ├ .dvs-device > .laptop > .laptop-screen
    │   └ N × .dvs-media[data-bg][data-anim='{…}']   ← crossfading screens
    └ .dvs-steps
        └ N × .dvs-step   ← .dvs-num + h3.dvs-title + p.dvs-desc
```

## Content contract
- **4 steps** and **4 screen layers** (`.dvs-media`) in the default — one screen
  crossfade per step.
- Each step: a two-digit `.dvs-num` (01–04), a short title, one descriptive
  sentence.
- Screens come from `data-bg` image paths on each `.dvs-media`; supply one image
  per layer.
- The `data-anim` opacity ranges are sequenced to hand off between layers — they
  are paired to the step count.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` opacity ranges** unless you re-sequence the whole
  set — they are timed so each screen fades in as its step centers. Adding or
  removing a step means adding/removing a matching `.dvs-media` and re-spacing the
  ranges.
- Reveal gotcha: the laptop and steps live inside the pinned scroll-story block;
  do not slap extra `data-reveal` on the scroll-driven children — reveal the
  header only.
- Keep `.laptop` / `.laptop-screen` and `data-bg` on `.dvs-media`; swap image
  paths and step copy only.

## Authoring rule
Read `blocks/desktop-scroll.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
