# Fact Grid

`fact-grid` · Stats · **supporting** · surface-white · reveal

## Look
A header (headline + sub) above a hairline grid of deal "tombstones" — compact
cells each showing a deal type, client, amount and year. The grid is 2-up on
mobile and 5-up on desktop, with a "View all transactions" text link below.
Reads as a crisp proof wall of marquee deals.

## Motion
Cells reveal with a fade in a fast stagger (`data-reveal="fade"` with delays
stepping 0 → .04 → … → .36). The header reveals up. Each cell is a clickable
link (`<a class="kt-cell" href>`). No scroll-pinning, no countup.

## Anatomy
```
section.cmp-fact-grid.surface-white.section-y[data-animate]
└ .container-ds
  ├ .kt-head    ← h2.type-h2 + p.type-body (both data-reveal)
  ├ .kt-grid
  │  └ a.kt-cell[href] (data-reveal=fade, staggered delay) ×10
  │     ├ .kt-type     ← deal type label
  │     ├ .kt-client   ← client name
  │     ├   │     └ .type-micro year line     ← year
  └ a.kt-link  ← "View all transactions" + arrow SVG
```

## Content contract
- **10 tombstone cells** as shipped (the 2-up → 5-up grid reads best in
  multiples of 5; 10 fills two clean desktop rows).
- Per cell: a deal type (`.kt-type`, ≤2 words), a client (`.kt-client`), an
  amount (- Header: one headline + one 1-sentence sub.
- One "View all" link below.
- No images — type/text driven.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Each `.kt-cell` carries `.on-light` — the cells are white cards, so their
  content keeps light-mode ink on dark surfaces. The `.kt-link` beneath them
  sits ON the surface and flips instead.
- Keep the `.kt-cell` four-slot structure (`.kt-type` / `.kt-client` /
  - Prefer cell counts that fill the 5-up desktop grid cleanly (multiples of 5).
- Each cell is an `<a href>` (`data-href`-style clickable cell) — keep it a link.
- Change copy (types, clients, amounts, years) and add/remove whole `.kt-cell`
  links; leave the grid and link structure intact.

## Authoring rule
Read `blocks/fact-grid.html`. Reuse the cell structure and classes
verbatim; change only the type/client/amount/year text per cell, the header copy
and the count of cells.

## Doctrine (2026-09-01)
Renamed from Key Transactions: the grid of fact CELLS is the capability;
deals are demo content (ticker doctrine). Default 5-up. cmp-key-transactions
RETIRED (6 pages WARN).
