# Link Directory

`link-directory` · Feature Sections · **supporting** · surface-white · (no behavior — reveal only)

Formalized 2026-08-27 from the `.ptf-dir` drift (it had lived only in `ds.css` +
hand-pasted markup across api-banking / businessONLINE-X / digital-solutions-hub,
with no block file). Root class `.cmp-link-directory`; all styling lives in
`ds.css` under that class (surface-adaptive `.ld-*`) — the block is pure markup.

## Look
A standard section-head (eyebrow + heading + lead) over a multi-column directory. Each column is a category heading — uppercase, letter-spaced, with a hairline rule beneath — above a short stack of plain text links. An optional CTA button sits below the grid. Three columns on desktop; one column, stacked, on mobile.

## Anatomy
- `.ld-grid` — the columns wrapper (3-up desktop, 1-up ≤1023px).
- `.ld-col` — one category column; `.ld-col-h` is its heading, then plain `<a>` links.
- `.ld-cta` — optional trailing CTA row.

## Content contract
- Each column: one `.ld-col-h` heading + 2–6 links. Keep link labels short (a service or destination name), not sentences.
- Links are real destinations (`href` to a page or section). Don't leave dead `#` anchors — drop a link rather than ship a link that goes nowhere.
- The CTA is optional; omit `.ld-cta` if the directory needs no closing action.
- Two, three or four columns all tile; three reads best on desktop.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Surface-adaptive by design: text uses `--on-surface` / `--on-surface-mid`, the
  rule uses `--on-surface-border`, hover uses `--blue`. Never hard-code hexes, or
  the second brand (Emirates Islamic) can't re-theme it.
- Not a tab set. When one category holds 10+ short items, or the directory needs
  panels, reach for **Tabs — Pills Grid** instead.
- Keep it links-only. Don't grow the columns into cards with icons and
  descriptions — that is a different component (Pillar Grid / Cards — Thumbnail).

## Authoring rule
Read `blocks/link-directory.html`. Reuse the shell verbatim and change CONTENT only
(headings + links + CTA). New markup or `cmp-*` classes on a page are drift.

## Axes
Columns: `is-cols-2` / default 3 / `is-cols-4` on the root (`--ld-cols`); the
gallery Columns control drives the same classes. Collapses to one column
<1024px regardless of the axis.
