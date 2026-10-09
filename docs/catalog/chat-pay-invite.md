# Chat Pay Invite

`chat-pay-invite` · Payment UI · **supporting** · surface-grey · static

## Usage
**PNG-generation boilerplate — not a page component.** This mock exists to be
rendered once and captured as a TRANSPARENT PNG (the Playwright capture rig;
same doctrine as the device mocks in `assets/images/device/`). The PNG is what
pages use — inside Scroll Scenes, Device Showcase slots, stories and heroes.
Never paste the raw mock markup on a page; dated pages that still carry it are
sweep debt, not precedent.

## Look
A centred phone-chat mockup on a light grey surface. A messaging thread header
(avatar "E", sender name + "Business account", a verified check) sits above one
received bubble of text and a highlighted **payment-request card** (label, big
AED amount, a short pay link, a "Pay now" pill), with a timestamp below. Used to
illustrate sending a payment request inside a chat.

## Motion
Static. The whole mockup reveals up once on scroll (`data-reveal="up"` on the
centring wrapper). No recipe, no countup, no interaction.

## Anatomy
```
section.cmp.surface-grey.section-y[data-animate]
└ .container-ds.flex.justify-center[data-reveal=up]
  └ .eph.chat > .eph-screen
    ├ .chat-hd     ← .chat-av + .nm (name + <small>) + .chk check
    ├ .chat-body
    │  ├ .chat-msg   ← one message bubble
    │  ├ .chat-pay   ← .lab + .amt + .lnk + span.b "Pay now"
    │  └ .chat-time  ← timestamp
```

## Content contract
- **One chat thread, one message bubble, one payment-request card.** This is a
  single fixed mockup, not a list.
- Header: avatar is a single initial/letter; sender name + one `<small>`
  sub-line; the check glyph is decorative.
- Message bubble: 1 short sentence.
- Payment card: a label (`.lab`, e.g. "Payment request"), one amount (`.amt`,
  e.g. "AED 1,250.00"), one short link (`.lnk`), one pill label (`.b`).
- One timestamp. No images, no live numbers — the amount is static text.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the `.eph.chat` → `.eph-screen` shell and the `.chat-hd` /
  `.chat-body` / `.chat-pay` structure — the phone styling is keyed to these
  classes.
- Do not add more bubbles/cards by default; it is designed as one tidy request.
- The amount is plain text — there is no countup; just edit the string.

## Authoring rule
Read `blocks/chat-pay-invite.html`. Reuse structure/classes verbatim; change
only content (text + media refs).
