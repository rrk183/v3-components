# Cards — Thumbnail Box

`cards-thumb-box` · Cards · **statement** · surface-grey · reveal only

> **Unreviewed** — new component (2026-08), the below-media sibling of
> [[cards-thumb]]. One of three flexible card components meant to replace the
> many one-off card blocks (case-study, article, story, product tiles). Awaiting
> front-end review. Root class `.cmp-cards-thumb-box`; styling in `ds.css`. Own
> `.ct-*` markup under its own root — does not touch cards-thumb.

## Look
A row of light cards, each with the media on top (3/2) and the content in a box
below on the card's own white surface (dark text). Only the label pill stays on
the media, straddling its bottom-left edge. Cards lift and the media zooms on
hover. Because the body is a normal block under the media, content never overlaps
— the card simply grows taller, and grid/flex rows equalise the heights.

## Anatomy — every per-card slot is OPTIONAL
- `.ct-media` — the media block (3/2). Holds `.ct-img` (`data-bg`, or swap for a
  `<video>`) and the straddling `.ct-label` pill.
- `.ct-body` — the box below; any subset of `.ct-eyebrow`, `.ct-title`,
  `.ct-desc`, and one `.ct-cta` (label + arrow). CTA look is set by the CTA
  control: default circle / `.is-cta-text` / `.is-cta-btn` (all dark, on the
  light card).
- `.ct-foot` — optional section-level CTA button under the grid.
- The whole `.ct-card` is the link.

## Layouts (two — SAME card)
- **Grid** (default) — 4-up on desktop (Columns control → 3 / 2 / Uncapped),
  2-up on tablet, 1-up on mobile.
- **Carousel** (`cards-thumb-box-carousel`) — the `.ct-carousel` sits outside
  `.container-ds`, so the cards row is full section width and scrolls on the
  shared data-carousel recipe; the header stays contained.

## Content contract
- Title clamps to 3 lines, description to 2 — long copy stays tidy.
- The card is ALWAYS a light card (white, dark text) regardless of section
  surface — a raised card on grey, navy or dark. Text uses `--navy` / `--mid` /
  `--blue` tokens, not surface-adaptive `--on-surface`.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Ships on `surface-grey` so the white cards read as raised; on `surface-white`
  they rely on the hairline border.
- No raw hexes — colours resolve from tokens (`--navy`, `--mid`, `--blue`,
  `--blue-wash`, `--border`); scrim/shadow use `rgba(var(--navy-rgb), a)`.
- No inline `style=` / `<style>` / IDs on the page.

## Authoring rule
Read `blocks/cards-thumb-box.html`. Reuse the shell verbatim and change CONTENT
only (media + text, and which optional slots you include). New markup or `cmp-*`
classes on a page are drift.
