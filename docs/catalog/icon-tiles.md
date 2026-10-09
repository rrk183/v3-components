# Icon Tiles & Numbers

`icon-tiles` · UI Elements · **utility** · surface-white · _(no behavior — pure atom showcase)_

Registered 2026-08-31 (component-standardization pass). Makes the **mark atoms** discoverable: `.icon-tile` and `.ds-num`. The drift these prevent is measured: 18 bespoke icon-square implementations (~583 instances, sizes 26–64px, ten fills) and 25+ competing stat-number clamps existed because no atom did.

## Look
- **`.icon-tile`** — squared icon container: 48px / radius 12 / blue-wash fill / blue ink by default. Sizes `.is-sm` (36) / `.is-lg` (56) / freeform `style="--it-size:64px"`; shapes `.is-round`; styles `.is-solid` (blue fill, white glyph) and `.is-ghost` (outline). Any inline SVG drops in — the tile sizes the glyph at half the tile itself.
- **`.ds-num`** — the standard big stat figure: one clamp, `.is-sm`/`.is-lg` sizes, unit or qualifier in `.ds-num-unit` for the accent colour.
- **Composition row** — a stat panel is `card-panel` + `ds-num` + a label, NOT a class. `.stat-card` was demoted to legacy 2026-09-01 (5 pages still paste it; retires at the sweep — its frosted-on-dark look moves to component level in the stats consolidation).

## Content contract
- Icons are inline SVG with `stroke="currentColor"` (or `fill="currentColor"`) — no size attributes needed inside a tile; the tile handles sizing.
- Numbers only inside `.ds-num`; the label is a separate element. No `data-countup` in the atom — pages add it where counting is wanted.
- On dark surfaces the tile goes frosted and the ink goes `--blue-soft` automatically; inside a light island (`.card-panel` / `.on-light`) the light look is restored. `.is-solid`/`.is-ghost` paint directly and survive every surface.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Never hand-roll an icon square or a number clamp.** Legacy `.ht-icon`/`.pg-icon`-style rules are what this atom retires; new components compose `.icon-tile`.
- Don't mix tile sizes within one card grid — pick one size per section.
- This card is documentation; the atoms live in ds.css.

## Authoring rule
Read `blocks/icon-tiles.html` for exact markup. Pages compose these atoms directly; there is no `cmp-icon-tiles` on real pages.
