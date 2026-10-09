# Cards — Head aside

`cards-aside` · Cards · **supporting** · any surface · layout modifier on `cmp-cards`

## Look
A split section: the head (eyebrow + headline + lead) holds a left column;
the card grid fills the right. The head sits vertically centred beside
the grid. Below 1024px it stacks head-over-cards.

## Usage
### Reach for it when
- The headline + description deserve to stay visible beside the evidence —
  "why us" pillars, capability lists, proof cards.
- You want editorial rhythm on a page of full-width stacked sections.

### Possibilities
- **`is-head-aside` is a MODIFIER, not a card type**: put it on any
  `cmp-cards` composition root — media-less (kicker, icon, number, plain)
  or media (tiles, case-study, promo) — with the grid OR the carousel as
  the right cell. Swap card type = swap the composition marker + the card
  markup together, as everywhere in the library. Only `is-center-peek` is
  out (its both-sides padding fights the column).
- Columns via `is-cols-N` — 2-up reads best beside a head; 1-up for a
  divided-list feel.
- Any surface; everything rides tokens and atoms.

### Not for
- Media-heavy cards (thumbnails fight the head for attention — use a
  full-width composition) or more than ~6 cards.

## Anatomy
```
section.cmp.cmp-cards.is-head-aside.cards-kicker.is-cols-2.surface-*
└ .container-ds          ← becomes the 5fr/8fr grid ≥1024px
  ├ .section-head › .ds-stack › .ds-eyebrow + h2 + lead   (centred)
  └ .cd-grid › .cd-card.card-panel ×3–6
```

## Content contract
- 3–6 cards; head lead ≤2 sentences.
- Cards follow their own composition's contract (kicker: word + title + body).

## Drift cautions
The split is `.cmp-cards.is-head-aside > .container-ds` — never re-wrap the
head or grid in extra columns markup; the modifier owns the layout.
