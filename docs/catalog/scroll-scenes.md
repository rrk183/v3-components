# Scroll Scenes

`scroll-scenes` · Storytelling & Scroll · **showpiece** · surface-primary · `data-behavior="scroll-story"`

## Look
A full-viewport dark stage with grain and a faint grid. Hero text ("Your
business. / Always with you.") opens it; a dark card then rises and expands to
fullscreen, an iPhone mockup flies in with a 3D tilt showing an in-app dashboard
(progress ring + counter + rows), two floating feature badges and a product-copy
column appear, the hero swaps to a download CTA with App Store / Google Play
buttons, then the card pulls back and flies out. A cinematic download-the-app act.

## Motion
The section **pins** and scrubs to scroll. `data-scrub-vh="640"` means ~6.4
screen-heights drive the whole sequence. Every element carries its own
`data-anim` JSON keyframes (progress 0→1): hero scales/blurs out, the `.aci-card`
rises (`y` in vh) and expands (width/height/borderRadius) then reverses out, the
`.aci-mockup` flies in with `rotateX/rotateY/z/scale`, the progress ring fills via
`strokeDashoffset`, and `.aci-counter` counts `count:[0,180]`. No bespoke JS — the
`scroll-story` recipe in `ds.js` reads the `data-anim` ranges.

## Anatomy
```
section.cmp.cmp-scroll-scenes.surface-primary[data-animate]
└ .aci[data-behavior=scroll-story][data-scrub-vh=640]
  └ .aci-stage
    ├ .aci-grain / .aci-grid (decorative, data-anim)
    ├ .aci-hero          ← .aci-t1 + .aci-t2 headlines
    ├ .aci-cta           ← .aci-cta-h + .aci-cta-p + 2 store buttons
    └ .aci-card[data-anim]
       └ .aci-card-inner
          ├ .aci-logo    ← brand img
          ├ .aci-mockup  ← .aci-phone (.aci-screen: app head, ring+counter, 2 rows)
          │                + 2 .aci-badge (tl / br)
          └ .aci-left    ← .aci-left-h + .aci-left-p
```

## Content contract
- **2 hero headline lines** (`.aci-t1`, `.aci-t2`), short.
- **CTA**: one headline, one sub sentence, **2 store badges** (App Store, Google
  Play). Two forms share `.aci-btn` (kicker `.aci-btn-k` + label `.aci-btn-b`):
  the plain text-only button, or the **richer badge** — wrap in `.aci-store`, add a
  brand-icon `<svg class="aci-btn-ic">` + `.aci-btn-tx` around the k/b, and a
  `.aci-qr` (an 84×84 QR `<img>` + "Scan to install"; hidden ≤639px). Group both
  stores in `.aci-cta-btns.aci-cta-stores`. Swap the `href` + QR image per app.
- **Optional phone-screen video**: drop a `<video class="aci-video">` as the first
  child of `.aci-screen` to play a looping app demo behind the in-app UI/overlays.
- In-app dashboard: app head (kicker + brand + avatar), a ring with a counter and
  label, **2 `.aci-row` bars**, **2 floating `.aci-badge`** (each: emoji icon +
  bold title + italic sub-line).
- Left copy: one heading + one paragraph.
- The counter is live via `data-anim count:[0,180]`; the brand logo is the one
  image (`/assets/images/EmiratesNBD-logo.svg`).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` JSON ranges** unless you understand the recipe —
  every element's keyframes are sequenced to hand off cleanly across the 0→1
  timeline. Changing copy is safe; changing the numbers is the main drift risk.
- Keep `data-scrub-vh="640"` unless you deliberately want a longer/shorter scroll.
- Keep the stage structure (card → mockup → badges/copy) and the decorative
  `.aci-grain` / `.aci-grid` / `.aci-sheen` layers; they are part of the look.

## Authoring rule
Read `blocks/scroll-scenes.html`. Reuse the structure and `data-anim` ranges
verbatim; change only the headline/CTA/badge/copy **text** and the logo ref.

Renamed from app-cinema 2026-09-01 (treatment word, and not even an engine —
it runs on scroll-story); the app-download story is demo content.
cmp-app-cinema RETIRED (5 pages WARN).
