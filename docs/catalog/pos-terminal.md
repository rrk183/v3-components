# POS Terminal

`pos-terminal` · Payment UI · **supporting** · surface-grey · reveal

## Usage
**PNG-generation boilerplate — not a page component.** This mock exists to be
rendered once and captured as a TRANSPARENT PNG (the Playwright capture rig;
same doctrine as the device mocks in `assets/images/device/`). The PNG is what
pages use — inside Scroll Scenes, Device Showcase slots, stories and heroes.
Never paste the raw mock markup on a page; dated pages that still carry it are
sweep debt, not precedent.

## Look
A centered point-of-sale terminal (CSS-drawn) on a grey surface: a screen showing
the "Emirates NBD Pay" label, an amount, a green "✓ Approved" line and a "Tap,
insert or swipe" prompt, above a 3×3 keypad. A compact in-person payment mockup.

## Motion
Reveal-on-scroll only: the centering wrapper carries `data-reveal="up"`, so the
terminal slides up once. The screen and keypad are static.

## Anatomy
```
section.cmp.surface-grey.section-y[data-animate]
└ .container-ds.flex.justify-center[data-reveal=up]
  └ .epos
    ├ .epos-screen
    │  ├ span.lbl   ← "Emirates NBD Pay"
    │  ├ .amt       ← amount (e.g. AED 340.00)
    │  ├ .ok        ← "✓ Approved"
    │  └ .tap       ← "Tap, insert or swipe"
    └ .epos-keys    ← 9 empty span keys (3×3 keypad)
```

## Content contract
- **One terminal**, single instance — one label, one amount, one approval line,
  one prompt.
- The keypad is **9 empty `<span>` keys** rendered purely as decoration; keep
  the count of 9 for the 3×3 grid.
- Amount uses a non-breaking space; all values static — no data-countup. The
  terminal is CSS-drawn, not an image.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The root `<section>` has no `cmp-*` modifier class — styling comes from
  `.epos` in ds.css. Keep the `.epos*` class names intact.
- Keep the 9-key keypad and the screen's four lines; the keys are decorative,
  not interactive.
- Change the label, amount and status text; keep structure and the wrapper
  `data-reveal`.

## Authoring rule
Read `blocks/pos-terminal.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
