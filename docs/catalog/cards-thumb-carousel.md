# Cards — Thumbnail (Carousel)

`cards-thumb-carousel` · Cards · **statement** · surface-white · reveal only

> **Unreviewed** — the carousel layout of [[cards-thumb]]. Same component and
> root class (`.cmp-cards-thumb`), with the `.is-carousel` layout modifier added
> to the section. Awaiting front-end review.

## Look
Identical cards to the Grid layout, arranged as a horizontal scroll-snap row that
scrolls on every breakpoint (desktop, tablet, mobile) instead of wrapping.

## How it differs from the Grid
- Section carries `class="cmp cmp-cards-thumb is-carousel …"`.
- `.ct-grid` becomes a flex row with `scroll-snap-type: x mandatory`; each
  `.ct-card` is `flex: 0 0 clamp(240px, 72vw, 300px)` and snaps to the start.
- No JS — pure CSS scroll-snap.

## When to use
Reach for the carousel when there are more cards than fit comfortably in one row
and horizontal browsing suits the content (teams, desks, a long product suite).
For a fixed small set that should all be visible, use the Grid.

## Everything else
Slots, degradation rules and drift cautions are the same as the Grid — see
[[cards-thumb]]. Authoring: read `blocks/cards-thumb-carousel.html`, change
CONTENT only.
