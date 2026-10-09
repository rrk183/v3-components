# Browser Checkout

`browser-checkout` · Payment UI · **supporting** · surface-grey · static

## Usage
**PNG-generation boilerplate — not a page component.** This mock exists to be
rendered once and captured as a TRANSPARENT PNG (the Playwright capture rig;
same doctrine as the device mocks in `assets/images/device/`). The PNG is what
pages use — inside Scroll Scenes, Device Showcase slots, stories and heroes.
Never paste the raw mock markup on a page; dated pages that still carry it are
sweep debt, not precedent.

## Look
A faux desktop browser window (traffic-light dots + a URL bar) centered on a grey
surface. Inside: a representative store on the left (product photo, name,
line-item totals) and an embedded card-payment panel on the right with masked
card fields, a Pay button, and an "Powered by Emirates NBD Pay" footer. A
mockup that illustrates an embedded online checkout.

## Motion
Static. The container has `data-reveal="up"` so the whole window fades/slides in
on scroll, but nothing inside animates and there is no recipe.

## Anatomy
```
section.cmp.surface-grey.section-y[data-animate]
└ .container-ds.flex.justify-center[data-reveal=up]
  └ .ebrowser
    ├ .ebr-bar     ← 3× <i> dots + span.ebr-url
    └ .ebr-body
       ├ .ebr-site  ← .ebr-shot(data-bg) + h4 + .pr + 3× .ebr-row (last .tot)
       └ .ebr-co    ← .emb + .tag "EMBEDDED" + .lab + .amt
                       + 2× .ebr-fld (card + expiry) + button.ebr-pay + .ebr-pwr
```

## Content contract
- **One browser window.** Left store panel: product name (h4), a sub line
  (`.pr`), and **3 `.ebr-row` lines** (Subtotal / Delivery / Total — last row
  `.tot`). Right panel: label, amount, 2 masked fields, a Pay button, a powered-by
  line.
- **1 image slot** — the product shot (`.ebr-shot` via `data-bg`).
- Keep amounts consistent across `.amt`, the total row, and the Pay button.
- No live numbers (no `data-countup`); values are static demo text.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- This is a fixed UI mockup — keep the `.ebrowser` → `.ebr-bar` / `.ebr-body` →
  `.ebr-site` / `.ebr-co` structure and class names; `.ebrowser` styling depends
  on them. Note the root `<section>` has no `cmp-*` class — styling lives on
  `.ebrowser`.
- Keep the masked-card format and the "Powered by Emirates NBD Pay" footer — they
  carry the brand point.
- Change product, price text and the shot image; don't restructure the panels.

## Authoring rule
Read `blocks/browser-checkout.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
