# Card Surfaces

`card-surfaces` · UI Elements · **utility** · surface-white · _(no behavior — pure atom showcase)_

Registered 2026-08-31; rebuilt 2026-09-02 as the demo of **THE CARD MODEL**. It makes the two LOOK atoms (`.card-panel`, `.card-media`) and the PAINT axis (`surface-*` on the same element) discoverable in one section. `.card-panel` replaced the estate's 15 near-identical white-panel recipes (`.kc-card`, `.fh-card`, `.sg-card`, `.dl-row`, `.pos-way`, …, radii 16–24, six shadow recipes).

## The model

```
cd-card                      ← IDENTITY (inside the cards ENGINE only)
  card-panel | card-media    ← LOOK: bounded panel | image-as-card-background
    surface-*                ← PAINT: the surface system does ALL the colour
    + is-tile | is-flat      ← FINISH: border + elevation, never a fill
  + .ov family on media      ← the scrim
  + engine axes on the root  ← BEHAVIOUR (hover, cols) — never on the card
```

**Absence of a look class = BOXLESS.** The panels in this block sit OUTSIDE the cards engine, so they are `card-panel` with **no** `cd-card` — the same atom every calculator result, modal body and feature tile uses.

## Look
The opening grid is the **finish × paint independence matrix** (rebuilt 2026-09-02): the same three finishes over three surfaces, nine cells.
- **Raised (default)** — 1px `--border`, radius `--card-r` (16px), the one canonical shadow.
- **`.is-tile`** — drops the rule and the shadow. It adds **no fill**: `card-panel surface-grey is-tile` is the classic soft grey tile (the highlights-tiles look), `card-panel surface-primary is-tile` the same finish over a dark paint.
- **`.is-flat`** — border only, no shadow.
- **`.is-hover`** — adds the lift; for cards that are one whole `<a>`.
- **`.is-grey`** — DEPRECATED alias (the one modifier still carrying a `--grey-2` fill). Write `card-panel surface-grey-2 is-tile`.

Then the rest of the paint axis (`surface-grey-2` / `surface-accent` / `surface-clear` + the hover link card), a glass row on a navy ground (the family at four strengths: `surface-glass`, `surface-glass-25/-50/-75`), and a `card-media` row (two scrim treatments) closing on the boxless case.

## Content contract
- **An UNPAINTED `card-panel` always paints an opaque light background.** That is its contract and why it sits in the LIGHT ISLANDS group — on navy/dark/blue/image sections the content inside keeps light-mode ink automatically, with zero per-component registration.
- **A PAINTED panel is not an island.** `surface-primary` / `surface-dark` / `surface-accent` / the whole `surface-glass*` family (excluded as `:not([class*="surface-glass"])`) / `surface-image` / `surface-clear` are excluded from the island group by `:not()`, so a repainted panel is never forced back to light ink. `surface-grey`/`-grey-2` ARE islands — they are light paints.
- **The paint wins because of `:where()`.** `card-panel`'s geometry (radius, border width/style, padding) is at class specificity; its paint (background, `border-color`, `box-shadow`) and ink tokens are in a zero-specificity `:where()` rule. Any `surface-*` on the same element overrides all of it. Never add a colour to the geometry rule — a LOOK class that paints out-ranks the PAINT class and `card-panel surface-primary` renders white.
- `surface-clear` is the NULL surface: transparent, ink tokens re-declared to `inherit`, so the section themes straight through the card.
- Padding via `--card-pad`, radius via `--card-r` (custom-property passing only).
- Link cards: `<a class="card-panel is-hover">` — the whole card is the link; add a `.btn btn-text` inside for the visible affordance.
- `card-media` makes its own ink white, so content inside needs no colour classes; give it a `.media-cover` child for the picture and an `.ov` child for the scrim.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Never hand-roll a white card** (a new `background:#fff; border…; box-shadow…` rule is drift) — compose the atom.
- **Never mint a card class for a paint.** A new colour is a `surface-*` class, and a surface is general: it paints any bounded container, not just cards.
- Never re-flip ink inside an unpainted `card-panel` on a dark surface; the island contract already handles it. If contrast looks wrong, the bug is elsewhere.
- New components that want a boxed look put `card-panel` in the card's own markup (`class="xx-card card-panel surface-grey is-tile"`) rather than re-declaring paint.
- **A finish never carries a colour.** If a modifier would need a fill, it is a surface — that is why the `is-fill-NN` ladder became `surface-glass-25/-50/-75`.
- The glass family is **dark-context only** at every strength (white ink); `surface-glass-75` is a three-quarter white fill, so reserve it for a busy photo ground and run `/audit.html`.
- `.ds-card` is a **compat alias** — grouped into every rule, pixel-identical. Do not author it. `.card-clear` (+ `is-fill-25/50/75`) still works but is superseded by `card-panel surface-clear` / `card-panel surface-glass(-25/-50/-75)`; sweep-delete.

## Authoring rule
Read `blocks/card-surfaces.html` for exact markup. Pages compose these atoms directly; there is no `cmp-card-surfaces` on real pages.
