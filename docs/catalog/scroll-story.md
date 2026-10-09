# Scroll Story

`scroll-story` · Heroes · **showpiece** · surface-dark · `data-behavior="scroll-story"`

## Look
A full-viewport dark stage. One "beat" of content is centered on screen at a
time — large white headline + eyebrow, or a single big stat card, or a closing
headline with a CTA button. Minimal, cinematic, premium.

## Motion
The section **pins** and the story scrubs to scroll. `data-scrub-vh="460"` means
~4.6 screen-heights of scrolling drive the whole sequence. Each beat declares its
own keyframes in a `data-anim` JSON range (0→1 progress): beat 1 rises in and
blurs out, beat 2 scales in and drifts out, beat 3 settles in. Only one beat is
visible at any moment. No bespoke JS — the `scroll-story` recipe in `ds.js` reads
the `data-anim` ranges.

## Anatomy
```
section.cmp-scroll-story.surface-dark[data-animate]
└ .sst[data-behavior=scroll-story][data-scrub-vh=460]
  └ .sst-stage
    ├ .sst-beat[data-anim='{…}']   ← eyebrow + .sst-h headline + .sst-sub
    ├ .sst-beat[data-anim='{…}']   ← .sst-card (.sst-card-num + .sst-card-lbl)
    └ .sst-beat[data-anim='{…}']   ← eyebrow + .sst-h + .btn.btn-primary CTA
```

## Content contract
- **3 beats** (3–4 works; each added beat needs its own `data-anim` range).
- Headlines (`.sst-h`): short, ≤6 words — they fill the viewport.
- Beat types you can mix: text beat (eyebrow + headline + 1 sub sentence),
  stat beat (one number like "AED 1.2 T" + a short label), closing beat
  (eyebrow + headline + one CTA button).
- No images required — it is type/number driven.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` JSON** unless you understand the recipe — the
  ranges are sequenced so beats hand off cleanly. Changing copy is safe;
  changing keyframe numbers is the main drift risk.
- Keep `data-scrub-vh` unless you deliberately want a longer/shorter scroll.
- Keep one idea per beat — it is designed to show a single element at a time.

## Authoring rule
Read `blocks/scroll-story.html`. Reuse the structure and `data-anim` ranges
verbatim; change only the eyebrow/headline/sub/stat/CTA **text**.
