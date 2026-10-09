# Payment Link

`payment-link` · Payment UI · **supporting** · surface-grey · reveal

## Usage
**PNG-generation boilerplate — not a page component.** This mock exists to be
rendered once and captured as a TRANSPARENT PNG (the Playwright capture rig;
same doctrine as the device mocks in `assets/images/device/`). The PNG is what
pages use — inside Scroll Scenes, Device Showcase slots, stories and heroes.
Never paste the raw mock markup on a page; dated pages that still carry it are
sweep debt, not precedent.

## Look
A centered, narrow card on a grey surface: a top bar ("Payment request" /
"Emirates NBD Pay"), a lead line, a large amount, a shareable payment URL, a
"Pay now" button, and a row of three share chips (WhatsApp / SMS / Email). A
compact mockup of a shareable payment-request link.

## Motion
Reveal-on-scroll only: the centering wrapper carries `data-reveal="up"`, so the
whole card slides up once. The card itself is static — buttons and chips are
presentational.

## Anatomy
```
section.cmp.surface-grey.section-y[data-animate]
└ .container-ds.flex.justify-center[data-reveal=up]
  └ .epl
    ├ .epl-top      ← span "Payment request" + b "Emirates NBD Pay"
    └ .epl-body
       ├ .epl-lead  ← one short sentence
       ├ .epl-amt   ← amount (e.g. AED 1,250.00)
       ├ .epl-link  ← payment URL
       ├ button.epl-pay
       └ .epl-share ← 3× .epl-chip (WhatsApp / SMS / Email)
```

## Content contract
- **One card**, single instance. Keep the one lead line, one amount, one link,
  one pay button.
- **Exactly 3 share chips** (`.epl-chip`) — the row is sized for three.
- Amount uses a non-breaking space (`AED&nbsp;…`); the link is a short slug-style
  URL. All values are static copy — no data-countup.
- No images.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The root `<section>` has no `cmp-*` modifier class — styling comes from `.epl`
  in ds.css. Keep the `.epl*` class names intact.
- Keep the 3-chip share row; adding/removing chips unbalances the layout.
- Change the labels, amount and link text; keep structure and the `data-reveal`
  on the wrapper.

## Authoring rule
Read `blocks/payment-link.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
