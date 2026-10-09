# Cards — Illustrated (composition of cmp-cards)

`cards-illustrated` (+ `-carousel`, `-scroll`) · Cards · **statement** · harvested 2026-09-01 from the Feature Cards bento (Trade Finance tile)

## Look
Dark navy cards (2-col default, --cd-min 480px): icon eyebrow (`ds-eyebrow has-icon`),
type-h4 headline, an isolated SVG illustration in the middle (the container ship /
the network constellation), a small bullet list, and a `.corner-arrow` ↗ that nudges
on hover. The illustration floats gently (`.ship-float`).

## Usage
### Reach for it when
- A capability deserves a RICH, designed card — more presence than an icon
  card, less weight than a bento section.
- You want product storytelling inside a normal card grid.

### Where it shines
- 2-col grids on white/grey surfaces (the dark cards pop); Carousel/Scroll
  variants for browsing more than two.

### Possibilities
- **The illustration is CONTENT** — any inline SVG; `bento-ship` part-classes
  auto-tokenize the ship palette per surface, `ship-float` adds the drift,
  `net-viz` gives the constellation. New art = new inline svg, zero CSS.
- Full cmp-cards option set: Grid / Carousel / Scroll layouts, Columns,
  hover axes, text-alignment axis.
- Corner arrow nudges on hover and mirrors in RTL automatically.

### Pairs well with
Cards — Dashboard (product numbers) and Cards — Quote (voice) as a set —
the three harvested bento tile designs share one visual language.

### Not for
- Text-only capability lists (use Cards — Icon); photography (use the
  media-card compositions).

## Content contract
- The illustration is CONTENT — any inline svg; `bento-ship` part-classes tokenize
  the ship's palette per surface (dark card ⇒ dark treatment automatically).
- 3–5 word headline with `<br>`; ≤3 list bullets; whole card is one link.
- Card paint = `surface-primary` on the frame (the DARK-card regime).

## Drift cautions
Don't rebuild the illustration as an image; don't add per-card CSS — the art
part-classes + atoms carry everything.
