# Ticker

`ticker` · Feature Sections · **statement** · any surface · pure CSS marquee

## Look
A thin full-bleed band with a continuously scrolling tape of short items
separated by dots — the Bloomberg-tape feel. Edge-masked so items dissolve at
the sides; pauses on hover; static under reduced motion.

## Usage
### Reach for it when
- You have a LIST of short, equal-weight proof points that gain energy from
  motion: landmark deals, milestones, markets, product names, live-ish figures.
- You want a thin credibility band between two heavy sections — it adds
  momentum without claiming vertical space.

### Where it shines
- Under a hero or Big Statement as a proof strip.
- Between sections as a rhythm break on long pages.

### Possibilities
- **The ticker is the CAPABILITY; items are content.** Deals are the demo —
  swap the `dt-item` spans for anything short (same doctrine as Marquee,
  whose demo content is FX cards).
- **Any surface**: the band paints an explicit per-surface tone (blue-wash on
  white, white card on grey, navy-shade on navy, deep blue on blue) and item
  ink rides on-surface tokens.
- Speed: the gallery Speed control / `--marquee-dur` on the tape (marquee atom).

### Pairs well with
Heroes, Big Statement, Stats — anywhere a claim needs a stream of receipts.

### Not for
- Items needing a click-through or more than ~6 words — use Marquee (cards)
  or a Cards carousel.
- More than ~10 distinct items; the loop gets too long to ever repeat.

## Content contract
- 6–10 items, each ≤6 words, duplicated ONCE in markup (the second set is
  `aria-hidden` — that duplication IS the seamless-loop mechanism; keep it).

## Drift cautions
Don't remove the duplicate set or the edge mask. Don't put links inside the
tape (it scrolls; targets are unusable). Renamed from Deal Ticker 2026-09-01;
`cmp-deal-ticker` is retired (pages WARN until the sweep).
