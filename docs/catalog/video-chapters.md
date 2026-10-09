# Video Chapters (scroll)

`video-chapters` · Storytelling & Scroll · **showpiece** · surface-dark · `data-behavior="scroll-story"`

## Look
A full-viewport dark stage with a looping full-bleed video background. As you
scroll, four "tabs" of content take the stage in turn — each a numbered label, a
two-line heading, and grouped feature bullets (some tabs split into two named
sub-suites) — over a gradient-darkened video that crossfades between tabs.

## Motion
Runs on the declarative `scroll-story` engine: the section **pins** and scrubs
over `data-scrub-vh="440"`. Four `.vt-video-fill` videos keep **playing on loop**
and crossfade by scroll via `data-anim` opacity ranges (they are NOT scrubbed).
Each `.vt-layer` fades + slides in (`opacity`/`y`) over its own `data-anim`
progress window, then out as the next begins, so one tab shows at a time.

## Anatomy
```
section.cmp-video-chapters.surface-dark[data-animate]
└ .vt[data-behavior=scroll-story][data-scrub-vh=440]
  └ .vt-stage
    ├ 4 × video.vt-video-fill[autoplay muted loop][data-anim] (crossfade bg)
    ├ .vt-gradient
    └ 4 × .vt-layer[data-anim]
       └ .container-ds.vt-content
          ├ .vt-label  ("(1)"…)  + h2.vt-heading (2 lines via &#10;)
          └ [.vt-suite name +] .vt-bullets > .vt-bullet (.vt-bullet-mark "+" + text)
```

## Content contract
- **4 tabs** = 4 background videos + 4 `.vt-layer` content layers, paired by
  `data-anim` ranges. Adding a tab needs both a new video and a new layer with
  its own sequenced ranges.
- Heading: two short lines (the literal `&#10;` is the line break). Label is a
  numbered marker like `(1)`.
- Bullets: tab 1 has a single 4-bullet group; tabs 2–4 split into two
  `.vt-suite`-named groups of 3 bullets each. Each bullet is one sentence.
- Background videos via each `<video src>`. No images, no countup.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` JSON ranges** unless you understand the recipe —
  the video crossfades and layer in/out windows are sequenced to hand off
  cleanly. Changing copy and `<video src>` is safe; changing the ranges is the
  main drift risk.
- The videos play on loop and crossfade — they are not scrubbed; keep
  `autoplay muted loop playsinline`.
- Keep `data-behavior="scroll-story"` and `data-scrub-vh` (a scroll component):
  do not add `data-reveal` to the layers — the engine drives their visibility.

## Authoring rule
Read `blocks/video-chapters.html`. Reuse structure/classes verbatim; change only
content (text + media refs).

Renamed from Video Tabs 2026-09-01 (it is not tabs — chapters on scroll);
moved to Storytelling & Scroll; cmp-video-tabs RETIRED (6 pages WARN).
