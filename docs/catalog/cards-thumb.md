# Cards — Thumbnail

`cards-thumb` · Cards · **statement** · surface-white · reveal only

> **Unreviewed** — new component (2026-08). Consolidates three older card
> patterns (bento-photo cards, story-cards, story-cards-video) into one flexible
> portrait card with optional slots. Awaiting front-end review. Root class
> `.cmp-cards-thumb`; all styling lives in `ds.css` under that class — the block
> is pure markup. Does NOT touch `story-cards` / `bento-image-cards` (own `.ct-*`
> namespace), so existing pages are unaffected.

## Look
A row of uniform portrait cards, each an image (or video) under a navy scrim,
with white text pinned to the bottom and an optional frosted label pill at the
top. Cards lift and the media zooms on hover.

## Anatomy — every per-card slot is OPTIONAL
- `.ct-media` — the background: `<span data-bg="…">` for an image, or a
  `<video class="ct-media" autoplay muted loop playsinline>` for motion.
- `.ct-scrim` — the navy gradient that keeps text legible over any media.
- `.ct-label` — frosted pill, pinned top (the "category" chip).
- `.ct-body` — the bottom text stack; holds any subset of `.ct-eyebrow`,
  `.ct-title`, `.ct-desc`, and ONE CTA: `.ct-cta` (a `.ct-cta-t` label + a right
  arrow). Its look is a **section modifier**, set by the CTA control — one markup,
  three styles:
  - default → round icon-arrow button (label hidden but kept for screen readers)
  - `.is-cta-text` → text link + arrow
  - `.is-cta-btn` → solid pill button with text
- `.ct-foot` — optional section-level CTA button under the grid.
- The whole `.ct-card` is the link (`<a href>`).

## Layouts (two — SAME card, different container)
- **Grid** (default) — `.ct-grid`; capped, chosen column count: **4-up** on
  desktop by default, 2 on tablet, 1 on mobile. The **Columns** gallery control
  (or the `.is-cols-3` / `.is-cols-2` modifier on the section) sets the desktop
  count to 3 or 2. Add more cards and they wrap to further rows.
- **Carousel** — the **uncapped** mode (`cards-thumb-carousel`): the `.ct-carousel`
  sits OUTSIDE `.container-ds` (a direct child of the section), so the cards row is
  the full section width — the whole viewport on a real page, the card width in the
  gallery — and scrolls. The header stays inside `.container-ds` and is NEVER
  full-bleed. `--ct-edge` is computed from the carousel's own width (`100%`, not
  `100vw`), so the first card and the arrows line up with the contained header at
  every width and in either context. Built on the shared **data-carousel** recipe —
  `.ct-track[data-carousel-track]` holds `[data-carousel-slide]` cards, `.ct-arrows`
  holds the blue `[data-carousel-prev]` / `[data-carousel-next]` buttons; ds.js
  drives the track, no new JS. Same cards as the grid — only the arrangement changes.

## Content contract
- Graceful degradation is the contract: any subset of slots must read as
  intentional. Common fills — label+title+desc+circle (cross-sell), label+text-CTA
  (story/desk cards), title only (tiles).
- Keep titles to ~2 lines and descriptions to ~1–2 lines; the scrim covers the
  lower ~55% of the card.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Card text is white over the scrim BY DESIGN — not surface-adaptive. The scrim
  (navy tokens via `rgba(var(--navy-rgb), a)`) is what guarantees contrast, so
  every card needs media behind it. Don't place `.ct-card` on a bare surface.
- Don't reintroduce raw hexes — scrim/shadow use `var(--navy-rgb)`, accent uses
  `var(--blue)`; white/translucent-white literals are the only allowed literals.
- No inline `style=` / `<style>` / IDs on the page.

## Authoring rule
Read `blocks/cards-thumb.html`. Reuse the shell verbatim and change CONTENT only
(media + text, and which optional slots you include). New markup or `cmp-*`
classes on a page are drift.
