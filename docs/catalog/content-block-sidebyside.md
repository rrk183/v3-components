# Content Block — Side by Side

`content-block-sidebyside` · Feature Sections · **supporting** · surface-grey · static

## Look
An editorial two-column copy block on a light grey surface: a navy `type-h3`
headline on the left (with a `<br>` line break baked in) and a muted supporting
paragraph on the right. Columns split 50/50 from `md:` up and stack on mobile.
Quieter and more editorial than the numbers variant.

## Motion
Static. Headline reveals up, paragraph reveals up delayed `.1`
(`data-reveal="up"`). No recipe, no countup.

## Anatomy
```
section.cmp.cmp-content-block-sidebyside.surface-grey.section-y[data-animate]
└ .container-ds
  └ .flex.flex-col.md:flex-row.md:gap-16.items-start
     ├ h2.cbs-head.type-h3.type-navy.md:w-1/2.flex-shrink-0   ← headline (uses <br>)
     └ p.type-body.on-surface-mid.md:w-1/2.md:pt-3            ← supporting copy
```

## Content contract
- **One headline + one paragraph**, side by side. Single block, no list.
- Headline uses `type-h3` (smaller than the other content-block variants) and
  may use `<br>` to control its two lines.
- Paragraph: 1–3 sentences. No images, no numbers, no countup.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `.cbs-head` — it has a dedicated CSS rule (`line-height: 1.5`) tuned for
  the headline.
- Keep both `md:w-1/2` widths so the two columns split evenly; the `md:pt-3` on
  the paragraph optically aligns it with the headline.
- Note the headline is `type-h3` (not `type-h2` like the stacked variants) —
  keep it unless deliberately changing the hierarchy.

## Authoring rule
Read `blocks/content-block-sidebyside.html`. Reuse structure/classes verbatim;
change only content (text + media refs).
