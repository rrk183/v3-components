# Solutions & Awards

`solutions-awards` · Feature Sections · **supporting** · surface-white · reveal

## Look
A light section with a two-column intro — a large navy headline on the left and
a short supporting paragraph aligned to the far right — above a row of **5 award
logos** rendered as inline SVG (Euromoney, Bonds Loans & Sukuk, The Banker,
EMEA Finance, GTR). Logos are greyscale at rest and colour on hover. A
"See all awards" arrow link closes the block.

## Motion
Reveal-on-scroll only: the headline, paragraph, each logo, and the link
fade/slide up in a stagger (`data-reveal="up"` / `data-reveal="left"` +
`data-reveal-delay`). Logos colour-in on hover (CSS); the "See all awards" arrow
nudges right on hover (CSS). No scroll-pinning, no countup.

## Anatomy
```
section.cmp-solutions-awards.surface-white.section-y[data-animate]
└ .container-ds
  ├ top row (flex, lg:flex-row)
  │  ├ h2.type-h2  ← headline (data-reveal=up)
  │  └ p.type-body ← description, right-aligned (data-reveal=up)
  ├ logo row (flex, responsive wrap → single row on lg)
  │  └ .sa-logo.sa-logo-{1..5}  ← inline <svg.sa-logo-fill> (data-reveal=up)
  └ a.sa-see-all.type-blue  ← "See all awards" + arrow (data-reveal=left)
```

## Content contract
- **Exactly 5 award logos** (`.sa-logo-1` … `.sa-logo-5`), each an inline SVG
  with `.sa-logo-fill`. Per-logo viewBox/aspect varies (e.g. 220×110,
  240×90) — keep each logo's own ratio.
- Headline: one sentence (≤~12 words). Description: one short sentence.
- One "See all awards" link. No live numbers (no countup).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The logos are hand-built inline SVG with brand colours and the
  greyscale-to-colour hover depends on `.sa-logo-fill` — keep that class and the
  `.sa-logo-{n}` indices; swap a logo only by replacing the SVG body wholesale.
- Keep the responsive flex layout (1/row mobile → single row desktop); don't
  convert to a grid.
- Keep `data-reveal` on the content items only (heading, paragraph, logos,
  link), not on the section root.

## Authoring rule
Read `blocks/solutions-awards.html`. Reuse the structure and classes verbatim;
change only the headline/description **text** and the award **SVG logos**.
