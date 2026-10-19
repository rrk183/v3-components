# App Download Panel

`app-download-panel` · CTA & Banners · **statement** · surface-white (panel: surface-mute) · behavior `app-download`

## Look
A large rounded panel on a light ground with a faint blue glow. On the start
side: an accent eyebrow, a large headline, a lead, a one-line app pitch and two
large buttons (filled + outline). On the end side, a tall phone render that
rises above the top edge of the panel, with a white "Pending actions" status
chip floating against its side. Across the full panel width, under a hairline,
"Get the app": App Store (dark), Google Play (light) and AppGallery (dark)
badges in one row on the start side, and ONE QR (no card, caption centred below) on the end
side ("Scan to download" below the code).
The QR encodes the get-app.html smart link, which sends iPhones to the App
Store, Huawei phones to AppGallery and other Androids to Google Play (Ram,
2026-10-19). Harvested from the
Wholesale Banking home closing act (`cib-home-final.html`, section 9).

## Motion
- The panel reveals up on first view.
- Recipe `app-download`: once the panel has settled in view, the phone and the
  chip bob gently (6s and 4.8s loops), paused when out of view or when the tab
  is hidden. None under reduced motion.
- The QR needs no script (one code for every phone; the smart link decides).
- Phones: the strip hides; one "Download the app" button points to the
  visitor's own store (iPhone/iPad: data-ios, Huawei: data-huawei, other
  Android: data-android). Tablets (768-1023) and touch screens hide the QR.

## Anatomy
```
section.cmp-app-download-panel.surface-white.section-y[data-animate][data-behavior=app-download][aria-label]
└ .adp-panel.surface-mute (data-reveal)   ← inset panel, max 1400px (no .container-ds)
  ├ span.adp-glow (aria-hidden)
  ├ .adp-text
  │  ├ p.ds-eyebrow.ink-accent + h2.type-h1.adp-h.ink-primary
  │  ├ p.type-body-lg.adp-lead.ink-mute + p.type-body.adp-line.ink-mute
  │  ├ .adp-btns > a.btn.btn-filled.btn-lg + a.btn.btn-outline.btn-lg
  │               + a.btn.btn-outline.btn-lg.is-download.adp-app-btn[data-app-link][data-ios][data-android][data-huawei]  ← phones only
  ├ .adp-device
  │  ├ img.adp-phone             ← transparent PNG render, real alt text
  │  └ p.adp-chip.card-panel.surface-white > span.ink-primary + span.badge.badge-danger
  └ .adp-get   ← full-width strip (grid-column 1 / -1)
     ├ p.adp-get-h.ink-primary
     ├ .adp-stores > a.adp-store.is-dark + a.adp-store.surface-white + a.adp-store.is-dark  (App Store, Google Play, AppGallery; svg.adp-store-ic + .adp-store-tx)
     └ figure.adp-qr (no card: the code, caption centred below)   ← end side via space-between; wraps under the badges when narrow
        ├ img (the smart-link QR)
        └ figcaption > span.adp-qr-t.ink-primary ("Scan to download")
```

## Options
- **Motion.** On by default. Add `.is-static` to the root to turn the phone and
  chip float off for that instance (also the safe choice where a pause control
  is required for looping motion). Gallery control: Motion · On / Off.
- **Buttons.** One to three in `.adp-btns`, always in button-role order:
  primary `btn btn-filled btn-lg`, secondary `btn btn-accent btn-lg`,
  tertiary `btn btn-outline btn-lg`. As built: primary + tertiary (Contact us,
  Log in). Keep the phone-only `.adp-app-btn` last. Gallery control: Buttons
  · As built / 1 · Primary / 2 · Primary + Secondary / 3 · Primary +
  Secondary + Tertiary (the third label in the preview is demo copy).

- **Stores.** All three by default. Each badge carries `data-store="ios|android|huawei"`;
  delete the badges this instance does not offer, and remove the matching
  `data-ios` / `data-android` / `data-huawei` from the phone-only button (a
  phone whose store is off falls back to the next store on). Keep the store
  URLs in get-app.html in step: a store left at "#" there is hidden on that
  page and never redirected to. Gallery control: Stores · All three / any
  pair / one store.

- **App row.** On by default. For a panel without app promotion, delete the
  whole `.adp-get` block (heading, store badges, QR tile and its hairline) and
  the phone-only `.adp-app-btn`. Gallery control: App row · On / Off.

## Content contract
- Eyebrow 1 to 3 words; headline one sentence, at most about 40 characters;
  lead one sentence, at most about 110 characters; app line one sentence.
- Two buttons (primary first). The store button text stays short.
- Store links and both QR images must point to the real store listings. Keep
  the badge wording ("Download on the App Store", "Get it on Google Play").
- Phone render: a transparent PNG at least 1000px tall, the device upright or
  gently tilted. Status chip: at most 3 words plus a small count badge.

## Drift cautions
- Store badges are vendor brand marks: do not recolour their SVGs and do not
  turn them into `.btn` buttons.
- One QR only. It must encode the get-app.html smart link (regenerate it when the
  host changes); set the three store URLs on get-app.html's <html> and on the
  phone-only button (data-ios / data-android / data-huawei).
- The phone's overlap above the panel comes from the section's top padding
  plus the device's negative margin: do not remove the padding on the root.
- No IDs: the section is labelled with `aria-label`.

## Authoring rule
Always start from `blocks/app-download-panel.html`; change only content (text,
links, store and QR targets, the phone render and its alt text, the chip) and
reuse the structure and classes verbatim.
