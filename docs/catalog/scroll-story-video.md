# Scroll Story — Video Scrub

`scroll-story-video` · Heroes · **showpiece** · surface-dark · `data-behavior="scroll-story-scrub"`

## Look
A full-viewport dark stage with a pinned video filling the frame behind a
black-to-bottom gradient overlay. One white headline beat (eyebrow + big
headline, last one with a CTA) sits centered over the footage at a time.
Cinematic, high-drama narrative opener.

## Motion
The section **pins** and the background video scrubs to scroll — its
`currentTime` is driven by scroll progress (`data-source="video"` +
`<video data-story-video>`). `data-scrub-vh="520"` means ~5.2 screen-heights of
scrolling drive the whole sequence. Each beat declares its own keyframes in a
`data-anim` JSON range (0→1 progress): beat 1 rises in/blurs out, beat 2
scales in and drifts out, beat 3 settles in. Only one beat is visible at any
moment. No bespoke JS — the `scroll-story-scrub` recipe in `ds.js` reads the
`data-anim` ranges and advances the video.

## Anatomy
```
section.cmp-scroll-story-video.surface-dark[data-animate]
└ .ssv[data-behavior=scroll-story-scrub][data-scrub-vh=520][data-source=video]
  └ .ssv-stage
    ├ video.ssv-video[data-story-video]   ← muted/playsinline background
    ├ .ov.ov-black.ov-gradient-b.ov-65     ← darkening overlay
    └ .ssv-caps
       ├ .ssv-cap[data-anim='{…}']  ← eyebrow + .ssv-h headline
       ├ .ssv-cap[data-anim='{…}']  ← eyebrow + .ssv-h headline
       └ .ssv-cap[data-anim='{…}']  ← eyebrow + .ssv-h + .btn CTA (.ssv-cta)
```

## Content contract
- **3 beats** (3–4 works; each added beat needs its own `data-anim` range).
- Headlines (`.ssv-h`): short, ≤6 words — they fill the viewport over video
  (uses `<br>` for line breaks).
- Each beat: eyebrow + headline; the closing beat adds one
  `.btn.btn-primary.btn-lg.ssv-cta` button.
- **1 video slot** — `<video data-story-video src>` (default
  `/assets/videos/hero-video.mp4`); supply a landscape clip that reads well
  full-bleed. No countup.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` JSON** unless you understand the recipe — the
  ranges are sequenced so beats hand off cleanly against the video timeline.
- Keep `data-source="video"`, `data-story-video`, and the `muted playsinline`
  attributes — the scrub recipe needs them; without them the video won't seek.
- Keep `data-scrub-vh` unless you deliberately want a longer/shorter scroll,
  and keep the overlay so white text stays legible over footage.
- Keep one idea per beat — it shows a single element at a time.

## Authoring rule
Read `blocks/scroll-story-video.html`. Reuse the structure and `data-anim`
ranges verbatim; change only the eyebrow/headline/CTA **text** and the video
`src`.
