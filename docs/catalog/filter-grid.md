# Filter Grid

`filter-grid` · Tabs · **utility** · surface-grey · _(behavior: `data-filter` — the generic filter registry in `ds.js`)_

Registered 2026-08-28 to make the **generic `data-filter` capability discoverable** in the gallery. It is a *demo of a behaviour*, not a component with its own scoped CSS — the point is that **filtering is a common DS capability**: any card grid in any block becomes filterable by adding data-attributes, never a page-local script (Hakan, 2026-08-27). The demo IS a `cmp-the cmp-cards kicker composition` section (the ROOT keeps the real component class — rooting it as an unstyled `cmp-filter-grid` was the misleading-wrapper trap, caught in review 2026-08-28) with the filter controls wired on; swap in `cards-thumb`, article cards, tombstones or a table and the wiring is identical. Controls are styled by the generic `.filter-*` utilities already in `ds.css` (`.filter-bar` / `.filter-chip` / `.filter-select` / `.filter-count` / `.filter-empty`) — there is **no `.cmp-filter-grid` ruleset** and there should not be one; scoping the classes to a component would defeat the "works anywhere" intent. **Flagged Unreviewed.**

## Look
A light section with a section-head, a **filter bar** (a row of capability pills on the left, faceted `<select>`s on the right), a live "Showing N" count, the card grid, and a hidden empty-state line that appears with a Clear-filters button when nothing matches. Selecting a pill or a facet hides the non-matching cards instantly (no reload); the count and empty state update live.

## Anatomy
- **Region root** — `data-filter` on the `<section>` (or any wrapper around the controls + grid).
- **Pill controls** — `button.filter-chip data-filter-key="area" data-filter-value="markets" aria-pressed`. `.filter-chip` is grouped onto the `.chip` model (chip-lg geometry; selected = blue-wash/blue via `[aria-pressed="true"]`, 2026-09-01). The `value=""` pill is the "All" reset for that key. Toggling is single-select per key by default (the behavior clears siblings).
- **Select controls** — `select data-filter-key="region"` with an empty-value "All" option.
- **Reset / count / empty** — `[data-filter-reset]`, `[data-filter-count]` (receives the visible number), `[data-filter-empty]` (shown when 0 match).
- **Grid** — `[data-filter-grid]`.
- **Items** — `[data-filter-item]` + one `data-filter-<key>="…"` attribute per key.

## Content contract
- Every key used by a control must exist as a `data-filter-<key>` on every item (an item missing the attribute never matches that key's non-empty values).
- **Match logic: AND across keys, OR within a key.** A space/comma list in an item's attribute (`data-filter-area="markets lending"`) matches *any* of those tokens.
- The initial `[data-filter-count]` number and `aria-pressed="true"` on the "All" pill should reflect the seeded item count (here, 6).
- Keep control labels and item copy real (banking capabilities), never lorem.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Never write a page-local filter `<script>`** — that is the exact drift this replaces. If a section needs filtering, add the attributes; ds.js binds it (`[data-filter]:not([data-filter-bound])`) on load and after `DS.refresh`.
- Do **not** invent a `.cmp-filter-grid` CSS block or component-scoped chip classes. Reuse the generic `.filter-*` utilities and the `.badge` atom. The capability is deliberately grid-agnostic.
- The demo grid is `the cmp-cards kicker composition` only for a self-contained, image-free preview. In real pages the same wiring goes on whatever card block the page already uses — don't treat `the cmp-cards kicker composition` as required.
- Pills are single-select per key here; for multi-select facets, allow several `aria-pressed` pills of the same key (the OR-within-a-key match already supports it).

## Authoring rule
Read `blocks/filter-grid.html`. Reuse the filter-bar + `data-filter*` wiring verbatim and change CONTENT only (keys, values, cards). To filter a *different* block, copy the controls + attributes onto that block's grid — the behaviour and utilities are shared. See CONVENTIONS.md (behaviours → `data-filter`) and `docs/importer-glossary.md` (bespoke filter UI → generic `data-filter`).
