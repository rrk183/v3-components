# Content Block — Stack

`content-block-stack` · Feature Sections · **supporting** · surface-grey · static

## Look
The simplest copy block: a `type-h2` headline stacked directly above a single
muted body paragraph on a light grey surface. The headline ships a `<br>` to
control its line break; the paragraph is capped to a readable measure. No
figures, no media, no columns.

## Motion
Static. Headline reveals up, paragraph reveals up delayed `.1`
(`data-reveal="up"`). No recipe, no countup.

## Anatomy
```
section.cmp.cmp-content-block-stack.surface-grey.section-y[data-animate]
└ .container-ds
  └ .ds-stack.flex.flex-col.gap-5
     ├ h2.type-h2.on-surface              ← headline (uses <br>)
     └ p.type-body.on-surface-mid.measure ← body copy
```

## Content contract
- **One headline + one body paragraph**, stacked. Single block, no list.
- Headline: short `type-h2`, may use `<br>`; body: 1–3 sentences, `.measure`
  caps the line length.
- No images, no numbers, no countup.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **`cmp-content-block-stack` has no CSS rule of its own** — this block renders
  entirely from utility classes (`flex.flex-col.gap-5`, `type-*`, `on-surface*`,
  `measure`). Keep those utilities exactly; the `cmp-` class is only a hook.
- `.ds-stack` is a structural wrapper — keep it and the flex/gap utilities.
- Reveal the headline and paragraph only — keep `data-reveal` off the section root.

## Authoring rule
Read `blocks/content-block-stack.html`. Reuse structure/classes verbatim;
change only content (text + media refs).
