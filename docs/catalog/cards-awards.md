# Cards: Awards

`cards-awards` · Cards · **supporting** · surface-soft · static (cmp-cards composition) + reveal

## Look
A split section header over a 3-column grid of plain white card-panels. Each
card: a logo well (the award mark, up to 160 x 58) with a blue year badge at
the end, the practice as a small muted eyebrow, the awarding body as the
title, and the titles won as a list-check. Harvested from the Rankings &
Awards page (`rankings-and-awards.html`, section 2).

## Motion
- Cards reveal up on first view, staggered across each row.
- Hover: the card lifts 4px with the shared card shadow (`is-hover-lift`).
- No recipe; JS-off and reduced motion show everything.

## Anatomy
```
section.cmp.cmp-cards.cards-awards.is-cols-3.is-hover-lift.surface-soft.section-y[data-animate]
└ .container-ds
  ├ .section-head.is-split > .ds-stack (eyebrow + h2) + p.sh-lead
  └ .cd-grid[role=list]
     └ article.cd-card.card-panel.surface-white[role=listitem] (data-reveal) × n
        ├ div (flex, between) > img (logo, real alt) + span.badge.badge-blue (year)
        ├ p.ds-eyebrow.ink-mute            ← practice
        ├ h3.type-h5.ink-primary           ← awarding body
        └ ul.list-check.type-body-sm.ink-mute > li × 1–5   ← titles won
```

## Options
- Columns: `is-cols-2 / -3 / -4` on the root (gallery Columns control).
- Hover: `is-hover-lift` (default), `is-hover-none`.
- Card surface: swap `surface-white` on every card (gallery Card surface control).

## Content contract
- Any number of cards, in multiples of the column count where possible.
- Logo: the official award mark as an image with the award name as alt text.
- Year: four digits in the badge. Practice: 1 to 3 words.
- Awarding body: at most about 40 characters. Titles won: 1 to 5, each one line
  of at most about 55 characters.

## Drift cautions
- Pure composition: do not add `.cards-awards` CSS. Card fill, border, shadow
  and hover come from the shared card and cmp-cards rules.
- On a dark ground, change the card surface in markup; never restyle cards by
  context.
- Keep the titles won as `list-check`, not a bespoke dot list.
- No IDs.

## Authoring rule
Always start from `blocks/cards-awards.html`; change only content (logos with
alt text, year, practice, awarding body, titles won) and reuse the structure
and classes verbatim.
