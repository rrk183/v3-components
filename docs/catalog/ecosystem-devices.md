# Ecosystem (device + scroller)

`ecosystem-devices` · Product & Device Showcases · **statement** · none (no surface-* class; styled by `.eco-fb`) · reveal (static)

## Look
A centered header above a wide multi-device image (laptop + tablet + mobile)
that blends into a matching grey surface, with a row of four product cards below.
Each card has a line-icon, product name, a short description and an "Explore →"
link.

## Motion
Static (no scroll-pinning, no recipe). The eyebrow draws an underline and the
headline reveals **word-by-word** via `.ew` spans on reveal. The lead, image and
each product card reveal-up in a stagger (`data-reveal="up"` + delay). No
countup.

## Anatomy
```
section.cmp.eco-fb[data-animate]
└ .container-ds
  ├ .ds-stack.section-head (centered)
  │   ├ .ds-eyebrow
  │   ├ h2.eco-fb-h           ← 3 × span.ew (word-by-word reveal)
  │   └ p.eco-fb-lead
  ├ img.eco-img[src]          ← multi-device composite (real <img>, not data-bg)
  └ .eco-fb-grid
      └ 4 × a.eco-fb-card
          ← .eco-fb-ico (SVG) + .eco-fb-nm + .eco-fb-ds + .eco-fb-mo (link + .ar arrow)
```

## Content contract
- Header: 1 eyebrow, a short headline split across **3 `.ew` word spans**, 1 lead
  sentence.
- **1 hero image** — a real `<img class="eco-img" src=…>` (note: NOT `data-bg`;
  this block uses a plain `src`).
- **4 product cards**, each an `<a>` with one icon, a name, a one-sentence
  description and an "Explore →" / "All solutions →" link.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the headline wrapped in `.ew` spans — the word-by-word reveal targets
  them; plain text won't animate the same way.
- The hero uses `src`, not `data-bg` — set the image on the `<img>` directly.
- No surface-* class on the root; `.eco-fb` provides the grey-blend styling.
- Keep the 4-card `.eco-fb-grid` rhythm; change names, descriptions, icons,
  links and the image path only.

## Authoring rule
Read `blocks/ecosystem-devices.html`. Reuse structure/classes verbatim; change
only content (text + media refs).
