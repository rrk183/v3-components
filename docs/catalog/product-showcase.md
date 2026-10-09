# Product Showcase

`product-showcase` · Product & Device Showcases · **statement** · surface-dark · reveal + countup

## Look
A dark section built around a central credit-card visual. An intro (eyebrow +
two-line display headline + sub) sits above a glossy CSS-drawn business card,
then a four-up row of feature callouts (icon + title + body), a three-figure stat
strip, and a CTA pair. Soft background glows behind it all. Highlights a
product's feature set around one hero object.

## Motion
Reveal-on-scroll throughout: the intro lines, card, each feature, the stat strip
and the CTA carry `data-reveal="up"` with staggered `data-reveal-delay`s. The
three stat figures count up via `data-countup` (`0%`, `60`, `5M+` — units in
`data-suffix`). Background glows and a card sheen are CSS decoration. No
scroll-pinning.

## Anatomy
```
section.cmp-product-showcase.surface-dark.section-y[data-animate]
├ .ps-glow.ps-glow-1 / .ps-glow-2        ← decorative glows (aria-hidden)
└ .container-ds.ps-inner
  ├ .ps-intro (section-head)             ← .ds-eyebrow + h2.type-display-lg + p.ps-sub
  ├ .ps-card-wrap > .ps-card             ← sheen + brand/tier + chip + .ps-card-num + .ps-card-foot (holder / valid thru)
  ├ .ps-features (grid 1→2→4)            ← 4× .ps-feature (.ps-feature-icon SVG + .ps-feature-title + .ps-feature-body)
  ├ .ps-stats                            ← 3× .ps-stat (span[data-countup] + .ps-stat-lbl), with .ps-stat-div between
  └ .ps-cta                              ← btn.btn-primary.btn-lg + .ps-ghost link
```

## Content contract
- **Exactly 4 feature callouts** in the `grid-cols-4` row (each: one SVG icon,
  a ≤4-word title, a 1-sentence body) — the grid is sized for four.
- **Exactly 3 stats** in the strip, separated by `.ps-stat-div` dividers; each
  number is live via `data-countup` with units in `data-suffix` (`%`, `M+`).
  Keep the visible text matching the final value.
- Intro: short eyebrow, a two-line display headline (`<br>`), one sub sentence.
- The card is CSS-drawn: brand, tier, a 4-group masked number, holder name and
  valid-thru — all static text. CTA is one primary button + one ghost link.
- No raster images required (header notes per-instance images via `data-bg`,
  but the default uses none).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep **4 features and 3 stats** with their `.ps-stat-div` dividers — both
  rows are laid out for those exact counts.
- `data-countup` reads the number; keep visible text matching the final value
  and put units in `data-suffix`, not in `data-countup`.
- Keep the `.ps-glow`, `.ps-card-sheen` and `.ps-card*` structure — the glows
  and card are core to the design and aria-hidden where decorative.
- Change copy, icons, card details and stat numbers; leave structure intact.

## Authoring rule
Read `blocks/product-showcase.html`. Reuse structure/classes verbatim; change
only content (text + media refs).
