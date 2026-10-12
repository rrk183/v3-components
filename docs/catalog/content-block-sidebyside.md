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

## Options
- **Checklist right column:** the right column may hold the copy followed by a `list-check` (e.g. documents required).
- **Figure + logos right column:** the right column may hold one large count-up figure with a caption, then an eyebrow and a greyscale logo row (e.g. group companies); the left column may end with a button.
- **Stat figures + jump links:** the right column may hold up to two large stat figures and a numbered row of jump-link pills to sections on the page.
- **Discipline layout:** the right column may be a key-products `badge` list, followed by a full-width row of challenge / solution / impact cards below the two columns. Used five times on structured-solutions-v2.
- **Label id (instances only):** the headline may carry an id used by `aria-labelledby` on the root.
- **Stacked sub-heading:** the right column may add a second sub-heading (`type-h5`) and paragraph under the main copy.
- **Button row:** up to two buttons under the copy in the right column (primary + outline).
- **Section-opening size:** the headline may use `type-h2` instead of `type-h3` when the block opens a major section.
- **Eyebrow** (2026-10-12): an optional `ds-eyebrow` above the headline; the left column becomes a `ds-stack` of eyebrow + headline.
- **Source line:** an optional `type-body-sm` caption after the copy in the right column (a citation or date).
- **Ground:** any surface; on a dark ground use `ink-white` / `ink-soft` / `ink-accent-soft`.
- **Anchor id (instances only):** a page may add `id="..."` to the root.

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
