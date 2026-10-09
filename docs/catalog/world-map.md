# World Map

`world-map` · Storytelling & Scroll · Storytelling & Scroll · **showpiece** · any surface · `data-behavior="world-map"` (v2 contract)

## Look
A section header above an animated dotted world map. Connection arcs sweep
between market points, dots pulse, and HTML label chips name the cities. The
artwork is a transparent, mask-recolored asset — its ink rides surface tokens,
so the same block sits on white, grey, navy or a brand theme without edits.

## Usage
### Reach for it when
- The message is REACH — markets, corridors, network, "we are where you are".
- You need a credibility statement that is spatial, not numeric (pair with the
  With-stats variant when you want both).

### Where it shines
- Corporate/institutional overview pages, network/coverage sections, the
  "global platform" beat of a product story.
- On dark surfaces as an ambient, premium section (ink flips to white).

### Possibilities (all config, no CSS)
- **Points as data**: `data-points` — city `id` from the shared gazetteer
  (dubai, london, cairo, riyadh, mumbai, singapore, shanghai…), or any place
  via `{"lat":…,"lng":…}`. Flags per point: `major`, `hub`, `side`.
- **Routes as data**: `data-routes` — pairs of point ids; points-only is valid.
- **Framing**: default auto-fits the points; `data-focus="x,y" data-zoom="1..3"`
  overrides (the gallery blocks pin `400,200` + zoom 1 = the full artwork).
- **Ink intensity**: `is-ink-faint` / default / `is-ink-strong` (the gallery
  "Map ink" control). Exact override: `style="--wm-map-ink: …"`; arc/dot color
  via `--wm-line` (e.g. `var(--gold)` for a brand moment).
- **Labels**: `data-labels="all|major|none"`; phones show `major` only unless
  `data-labels-mobile="all"`.
- **Animation**: `data-anim="draw|pulse|none"`; reduced-motion renders drawn.
- **`is-bleed`**: the map becomes the SECTION background behind the content
  (full-bleed, edge-faded into the surface) instead of a framed figure.
- **With stats** (`world-map-stats`): folds a `ds-num` data strip (2–4 cells,
  auto-fit columns, hairline dividers) under the map — reach + proof in one
  section. The same strip is available under the Hex Reach Map.

### Pairs well with
Stats sections (before/after), Ticker underneath as a live-tape footer,
a Big Statement above as the claim the map then proves.

### Not for
- Step-by-step journeys or process narrative (use Process & Steps).
- Fewer than ~3 points — a map with two dots reads empty; state it in copy.

## Content contract
- Points: 5–9 reads best; one `hub:true` (the arcs' origin).
- Labels are HTML chips (translatable); keep them to city/market names.
- Stats strip: 2–4 cells, number ≤10 chars, label one line.

## Drift cautions
Never reintroduce a static `<img>` map (the v1 pattern) — the v2 artwork is
recolorable and the ONLY sanctioned map asset. Never hand-tune per-page
offsets; extend the gazetteer instead.
