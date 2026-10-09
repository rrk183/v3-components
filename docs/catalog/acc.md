# Accordion

`acc` · FAQs / Accordion · **supporting** · any surface · _(ds.js data-accordion)_

**THE accordion shell (cmp-acc v4, 2026-09-01).** One behavior, heads and bodies are COMPOSITIONS. Component CSS = row hairline + head layout + the +/x state disc + the grid-rows open animation only (~12 rules). Supersedes the legacy `.cmp-accordion`, `faq-split`, `accordion-offerings/-twocol` zones (kept for pasted pages until the sweep).

## Anatomy
`section.cmp.cmp-acc` > `[data-accordion]` > `[data-acc]` rows, each `button[data-acc-head]` (any atoms + `.ac-icon` last) + `[data-acc-body] > .ac-inner` (ANY HTML). `.is-open` marks the open row (ds.js toggles it; add it in markup for open-by-default). `data-accordion="multi"` allows many open.

## Content contract
- Head slots are markup: a bare `type-*` title, or an icon-tile beside it. `.ac-icon` always sits last (margin-inline-start auto).
- Bodies are content-agnostic: prose (`.measure` for line length), `list-check`, whole `cmp-cards` grids, `.tbl` tables.
- The open state disc rides the ACCENT (blue); it flips white on dark surfaces automatically.

## Drift cautions
- Never use `<details>`; never mint a new accordion skin — a new look is a composition (a gallery card if it recurs).
- Keep body spacing on `.ac-inner` children, not on `[data-acc-body]` — the grid-rows collapse depends on it.
