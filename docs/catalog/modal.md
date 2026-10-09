# Modal

`modal` · UI Elements · **utility** · surface-grey · `data-modal-open` / `data-modal-close` / `data-modal-dismiss`

## Look
A light section showing a row of trigger buttons (eyebrow + six buttons). Each
button opens a centered dialog over a dimmed page overlay. The six variants range
from a transaction-details panel, to compact confirm/destructive dialogs, a form
dialog, a tall content modal with a photographic cover header, and a plain
content modal with an inner scroll area and an accept checkbox.

## Motion
Static until triggered. `ds.js` wires the recipe: clicking a
`button[data-modal-open="<id>"]` opens the `.modal-overlay#<id>`; `data-modal-close="<id>"`
and the X close button (`.btn.btn-outline.btn-icon.btn-sm` + `.sr-only` label) close it; clicking the overlay backdrop closes it via
`data-modal-dismiss` on the overlay. The cover-modal title carries
`data-reveal="up"`.

## Anatomy
```
section.cmp-modal.surface-grey.section-y[data-animate]
└ .container-ds
  ├ span.ds-eyebrow[data-reveal=up]
  └ .flex (triggers)                       ← 6× button[data-modal-open=<id>]
└ overlay panels (siblings, page-level), each:
  .modal-overlay[ id=<id> ][data-modal-dismiss]
  └ .modal | .modal.modal-w420/480 | .modal-content
     ├ .modal-header (title / .icon-tile.modal-icon-info|-danger) + close button (.btn.btn-outline.btn-icon.btn-sm)[data-modal-close=<id>]
     └ body: .modal-tile / .modal-rows / .field / .modal-cover(.data-bg) / .modal-scroll / .modal-actions
```
Six overlay IDs: `modal-transaction`, `modal-confirm`, `modal-delete`,
`modal-add-beneficiary`, `modal-content-cover`, `modal-content-plain`.

## Content contract
- **6 trigger buttons paired 1:1 with 6 overlay panels**; each
  `data-modal-open` value must match an overlay `id` and its
  `data-modal-close` values.
- Widths: default `.modal`, `.modal-w420` (confirm/delete), `.modal-w480`
  (form), `.modal-content` (the two content modals).
- Cover content modal: one image slot via `data-bg` on `.modal-cover`
  (`/assets/images/hero-bg.webp`), with an `.ov` gradient, eyebrow + title; body
  has a lead, a paragraph, a 3-item `.modal-list`, and 2 actions.
- Plain content modal: eyebrow + title, intro paragraph, a `.modal-scroll`
  region of 3 paragraphs, an accept checkbox, and 2 actions.
- No live numbers — figures (USD 2,450,000 etc.) are static copy.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The `.modal` card is a LIGHT ISLAND: it paints itself white, so on a dark
  section its content keeps light-mode ink. That is handled centrally by the
  island group in ds.css — do NOT add white-text overrides to a modal.
- Keep the `data-modal-open` / `data-modal-close` / `data-modal-dismiss`
  wiring and the `.overlay` IDs in sync — `ds.js` resolves panels by
  `getElementById`, so an ID mismatch leaves the trigger dead. These IDs are
  the one sanctioned ID use here.
- Keep `.modal-header`, the btn-model close button and the `.modal-overlay`
  wrapper — the close affordances and backdrop-dismiss depend on them.
- Change copy, amounts, labels and the cover `data-bg`; do not improvise new
  trigger/overlay pairs without matching IDs both ways.

## Authoring rule
Read `blocks/modal.html`. Reuse structure/classes verbatim; change only content
(text + media refs).

## Scope
De-scoped 2026-09-01 — classes are global (`.modal*`, `.modal-overlay`); no `.cmp-modal` ancestor is needed for styling. The status pill is `.badge.badge-ok`; the backdrop class was renamed `.overlay` → `.modal-overlay`.
