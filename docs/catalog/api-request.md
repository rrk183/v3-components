# API Request

`api-request` · Payment UI · **supporting** · surface-grey · static (reveal-up on the card)

## Usage
**PNG-generation boilerplate — not a page component.** This mock exists to be
rendered once and captured as a TRANSPARENT PNG (the Playwright capture rig;
same doctrine as the device mocks in `assets/images/device/`). The PNG is what
pages use — inside Scroll Scenes, Device Showcase slots, stories and heroes.
Never paste the raw mock markup on a page; dated pages that still carry it are
sweep debt, not precedent.

## Look
A centered terminal/code window on a grey surface. A title bar with three traffic
dots and a filename (`create-payment.sh`), below it a dark code pane showing a
syntax-highlighted API request (POST body) and its response. A developer-page
mockup that makes an integration feel real.

## Motion
Static. The whole card reveals-up on scroll (`data-reveal="up"` on the centering
container). No countup, no scroll-story, no interactivity.

## Anatomy
```
section.cmp.surface-grey.section-y[data-animate]
└ .container-ds.flex.justify-center (data-reveal="up")
  └ .eapi
     ├ .eapi-bar   ← 3× <i> dots + <em> filename
     └ .eapi-code  ← code text with inline spans:
                     .m comment · .k key/method · .s string/number
```

## Content contract
- **One code card.** Title bar = filename in `<em>` (the three `<i>` are
  decorative dots — keep empty).
- Code body is literal text inside `.eapi-code`; highlight tokens by wrapping in
  the helper spans: `.m` (comments like `# 201 Created`), `.k` (method/keys),
  `.s` (string/number values). Whitespace and line breaks are preserved as-is.
- Keep it short — a request block + a response block (~12–18 lines) reads best.
- No images, no live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- This block has **no `.cmp-api-request` class** — styling comes from `.eapi`,
  `.eapi-bar`, `.eapi-code` in ds.css. Keep those exact classes.
- Indentation/newlines inside `.eapi-code` are significant (rendered verbatim) —
  edit the text but preserve the JSON-like formatting.
- Only `.m` / `.k` / `.s` spans are styled; don't invent new token classes.

## Authoring rule
Read `blocks/api-request.html`. Reuse the `.eapi` window structure and the
`.m`/`.k`/`.s` highlight spans verbatim; change only the filename and the
request/response text.
