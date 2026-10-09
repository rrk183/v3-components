# Device Scroll — Phone

`phone-scroll` · Storytelling & Scroll · **showpiece** · surface-white · `data-behavior="scroll-story"`

## Look
A light section: a header (eyebrow + two-line headline), then a two-column area
where a CSS-drawn phone showing the "businessONLINE X" app sits pinned on one
side while four feature steps (numbered 01–04, title + description) scroll past
on the other. The phone's on-screen card crossfades through four states as you
scroll.

## Motion
The phone **pins** (sticky) while the step copy scrolls past it. The on-screen
app view crossfades between four `.dvs-media` layers — each declares an opacity
`data-anim` range timed to when its step is centred, driven by the
`scroll-story` recipe in `ds.js`. `data-scrub-vh="400"` sets ~4 screen-heights of
scroll for the full sequence. Header lines reveal-up on entry. This is a
scroll-pinned block: it must render in a fixed-height scrolling iframe, never
inline.

## Anatomy
```
section.cmp-device-scroll.cmp-device-phone.surface-white[data-animate]
├ .container-ds.dvs-head.section-head   ← .ds-eyebrow + h2 (data-reveal)
└ .dvs[data-behavior=scroll-story][data-scrub-vh=400]
  └ .container-ds.dvs-grid
    ├ .dvs-steps                        ← 4× .dvs-step (.dvs-num + .dvs-title + .dvs-desc)
    └ .dvs-device > .phone > .phone-screen.boapp
       ├ .boapp-status + .boapp-head
       ├ 4× span.dvs-media.boapp-view[data-anim='{…opacity…}']  ← each: .boapp-card (lbl/num/chip) + .boapp-rows
       └ .boapp-nav (4 dots, first .is-on)
```

## Content contract
- **4 steps paired with 4 phone views** — the `data-anim` opacity ranges are
  sequenced for exactly four crossfades (steps 01→04 at ~0.14 / 0.48 / 0.81
  handoffs).
- Each step: a two-digit number (`.dvs-num`), a short title, and a 1-sentence
  description.
- Each phone view: a card label, a card value (e.g. "AED 36,560"), a chip
  (e.g. "Authorise →"), and a `.boapp-rows` block of 2 rows (label + bold
  value). Card accent class varies (`boapp-card-blue/teal/violet/amber`).
- No images — the phone and app screen are entirely CSS-drawn; numbers are
  static copy (no data-countup).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` opacity JSON** unless you understand the recipe
  — the four ranges hand off cleanly so only one view is visible at a time.
  Changing copy is safe; changing the timing numbers is the main drift risk.
- Keep **4 steps and 4 views** matched; an extra step without its own
  `data-anim` view (or vice versa) breaks the crossfade sequence.
- Keep `data-behavior="scroll-story"`, `data-scrub-vh`, and the `.dvs-media`
  class on each view — the engine selects views by these.
- This block must be previewed in the scrolling iframe, not injected inline.

## Authoring rule
Read `blocks/phone-scroll.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
