# Market Band

`market-band` · Feature Sections · **supporting** · surface-primary · _(no behavior — static reveal; a COMPOSITION card, no `cmp-` class)_

**The composition-card doctrine (2026-08-28):** the gallery shows what is *doable* — a card does not imply a component register — AND the card is the CANONICAL form of the pattern: pages copy it verbatim, which keeps instances consistent across the site without new CSS; the audit can diff page instances against it. This band is pure atoms on a plain navy section: `section-head is-split` + a `badge badge-solid` pill row. Formalized as a card because it already ships on five trading pages (agency, online/margin/institutional-trading, securities-services) — Copy HTML and change the pills/copy.

## Look
A navy band: eyebrow + headline left, lead right (the split header), and a wrapping row of solid market pills beneath.

## Variants worth knowing
- Different surface: swap `surface-primary` — the badges and header tokens adapt.
- The original Ram design had a dotted-map texture behind this band: compose the same content on a **`cmp-world-map is-bleed`** section with `data-labels="none"` for the map-backed look (see the map contract).

## Authoring rule
Copy `blocks/market-band.html` verbatim; change content (eyebrow, headline, lead, pills). Pills are the `.badge` atom — never invent a pill class.
