# Pagination

`pagination` · UI Elements · **utility** · surface-white · static (presentational demo)

## Look
A light section stacking four pagination styles top to bottom, each under a small
label: a default numbered pager (Prev / numbered buttons / ellipsis / Next), a
"with count" row pairing a results count with arrow-icon buttons, a compact
Previous / "Page X of Y" / Next row, and a dark navy pager block at the bottom.

## Motion
Static. The label rows carry `data-reveal="up"`; the buttons are presentational
demos with no JS wiring or click behavior.

## Anatomy
```
section.cmp-pagination.surface-white.section-y[data-animate]
└ .container-ds > .flex.flex-col.gap-12
  ├ block — default      ← p.bt-label + .pgn-btn row (Prev · 1·2·3 · .pgn-ellipsis · 12 · Next), .is-active / .is-disabled
  ├ block — with count   ← p.bt-label + .pgn-count (with .pgn-strong) + .pgn-btn row with arrow SVGs
  ├ block — compact      ← p.bt-label + .pgn-compact Previous + .pgn-count + .pgn-compact Next
  └ block — dark         ← .surface-primary wrapper: p.bt-label + .pgn-btn row (dark-surface flips style it)
```

## Content contract
- **4 demo blocks**, each labelled by a `.bt-label`. This is a style showcase —
  when using a single pager on a real page, keep one block's structure.
- State classes: `.is-active` for the current page, `.is-disabled` for an
  unavailable Prev/Next; `.pgn-ellipsis` for the gap.
- Count strings use `.pgn-count` with a `.pgn-strong` for the live range/number
  (e.g. "Showing 1–20 of 248 results", "Page 1 of 13"). These are plain text,
  not data-countup.
- Dark variant is the same `.pgn-btn` buttons inside a `.surface-primary` wrapper.
- No images.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Buttons are non-interactive demos; do not assume click handlers exist. Real
  page-through behavior is app-supplied.
- Keep the per-variant class families (`.pgn-btn` vs `.pgn-compact`)
  and state classes (`.is-active`, `.is-disabled`, `.pgn-ellipsis`) — styling
  depends on them.
- Change the page numbers, count strings and labels; keep the block structure.

## Authoring rule
Read `blocks/pagination.html`. Reuse structure/classes verbatim; change only
content (text + media refs).

## Scope
De-scoped + renamed 2026-09-01 — `pg-*` → `pgn-*` (pillar-grid owns the `pg-` prefix); classes are global. Specimen labels are `.bt-label`; the button rows carry `.pgn-row` for narrow-screen wrapping.
