# Phone Checkout

`phone-checkout` · Payment UI · **supporting** · surface-grey · reveal

## Usage
**PNG-generation boilerplate — not a page component.** This mock exists to be
rendered once and captured as a TRANSPARENT PNG (the Playwright capture rig;
same doctrine as the device mocks in `assets/images/device/`). The PNG is what
pages use — inside Scroll Scenes, Device Showcase slots, stories and heroes.
Never paste the raw mock markup on a page; dated pages that still carry it are
sweep debt, not precedent.

## Look
A centered phone (with dynamic island and home bar, drawn in CSS) on a grey
surface, its screen showing a mobile checkout: an "Amount due" note, a large
amount, a masked card number, a "Pay" button, and an Apple Pay / Google Pay
wallet row. A compact mobile-payment mockup.

## Motion
Reveal-on-scroll only: the centering wrapper carries `data-reveal="up"`, so the
phone slides up once. The screen contents are static.

## Anatomy
```
section.cmp.surface-grey.section-y[data-animate]
└ .container-ds.flex.justify-center[data-reveal=up]
  └ .eph
    └ .eph-screen
       ├ .eph-note   ← "Amount due"
       ├ .eph-amt    ← amount (e.g. AED 1,250.00)
       ├ .eph-line   ← masked card digits (•••• •••• •••• 4242)
       ├ button.eph-pay
       └ .eph-wal    ← 2 spans: Apple Pay / Google Pay
```

## Content contract
- **One phone**, single instance — one note line, one amount, one masked card
  line, one pay button.
- The pay button text repeats the amount (e.g. "Pay AED 1,250.00").
- **2 wallet entries** in `.eph-wal` (Apple Pay / Google Pay).
- Amounts use non-breaking spaces; all values static — no data-countup. The
  phone chrome (island, home bar) is CSS-drawn, not an image.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The root `<section>` has no `cmp-*` modifier class — styling comes from `.eph`
  in ds.css. Keep the `.eph*` class names intact.
- Keep the single-screen structure and the 2-wallet row; do not add real
  payment behavior — it is a static mockup.
- Change the note, amount, masked digits and button label; keep structure and
  the wrapper `data-reveal`.

## Authoring rule
Read `blocks/phone-checkout.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
