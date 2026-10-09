# Checkout Card

`checkout-card` · Payment UI · **supporting** · surface-grey · static

## Usage
**PNG-generation boilerplate — not a page component.** This mock exists to be
rendered once and captured as a TRANSPARENT PNG (the Playwright capture rig;
same doctrine as the device mocks in `assets/images/device/`). The PNG is what
pages use — inside Scroll Scenes, Device Showcase slots, stories and heroes.
Never paste the raw mock markup on a page; dated pages that still carry it are
sweep debt, not precedent.

## Look
A centred hosted-checkout card on a light grey surface. A top bar reads
"Emirates NBD Pay" / "Secure checkout"; the body shows an amount-due row, a
masked card-number field with a VISA tag, an expiry + CVC pair, a full-width
"Pay AED…" button, an "or pay with" divider, and two wallet chips (Apple Pay,
Google Pay). Illustrates a payment / checkout flow.

## Motion
Static. The card reveals up once on scroll (`data-reveal="up"` on the centring
wrapper). No recipe, no countup, the Pay button and wallets are non-functional
mockup elements.

## Anatomy
```
section.cmp.surface-grey.section-y[data-animate]
└ .container-ds.flex.justify-center[data-reveal=up]
  └ .epc
    ├ .epc-top      ← span brand + b "Secure checkout"
    └ .epc-body
       ├ .epc-amt    ← small "Amount due" + .v amount
       ├ .epc-field  ← .dots masked PAN + brand tag
       ├ .epc-2      ← two .epc-field (expiry, CVC)
       ├ button.epc-pay  ← "Pay AED…"
       ├ .epc-or     ← "or pay with"
       └ .epc-wallets ← 2 × .epc-wallet
```

## Content contract
- **One checkout card** — a single fixed mockup, not a list.
- One amount appears twice (the `.epc-amt .v` row and the `.epc-pay` button);
  keep them consistent.
- Card field: masked digits (`.dots`) + a brand tag (e.g. VISA).
- Expiry/CVC: exactly two fields in `.epc-2`.
- Exactly **2 wallet chips** by default. All values are static text — no live
  numbers, no images.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the `.epc` shell and `.epc-top` / `.epc-body` / `.epc-field` / `.epc-2`
  / `.epc-pay` / `.epc-wallets` structure — the card styling is keyed to these.
- The amount on the button and in the amount row are duplicated by design; edit
  both, not one.
- Do not wire real behaviour onto `.epc-pay`/wallets — it is an illustrative
  mockup.

## Authoring rule
Read `blocks/checkout-card.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
