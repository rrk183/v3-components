# Tabs — Underline

`tabs-underline` · Tabs · **supporting** · any surface · _(ds.js data-tabs)_

**THE tabs shell, default rail (cmp-tabs v4, 2026-09-01).** One behavior, rails as atoms/compositions, panels take ANY HTML. The v4 zone in ds.css owns ONLY the plain-rail indicator (underline / vertical start-border), the composed-trigger state hooks and the panel switch — everything else inside is atoms. Supersedes the legacy `.tab-ul/.tab-pill/.tab-card/.tab-vert` zone (kept for pasted pages until the sweep).

## Anatomy
`section.cmp.cmp-tabs` > `.container-ds` > `[data-tabs]` > `.tb-rail.is-underline[role=tablist]` of `button.tb-tab[data-tab]` + `.tb-panel[data-panel]` siblings. Active state = `.active` (ds.js toggles it). Rail scrolls horizontally on overflow.

## Content contract
- Panels are content-agnostic: this demo holds prose + btn-text, a whole `cmp-cards` grid, and a `.tbl` table. Anything that works on the page surface works in a panel.
- Keys (`data-tab`/`data-panel`) are scoped per `[data-tabs]` wrapper — no page-unique names needed.
- On phones the rail scrolls (active tab auto-revealed, faded overflow edges) and `data-tabs-swipe` on the wrapper lets a left/right swipe on the PANEL move between tabs (RTL-aware; touches inside scrollable content are left alone). All v4 blocks ship with it on.
- Optional auto-advance: `data-autoplay="6000"` on the wrapper; a `[data-tabs-progress]` span inside a trigger becomes its progress bar.

## Drift cautions
- Never style tab looks per page — the accent rides `--tb-accent` (flips to `--blue-soft` on dark surfaces automatically).
- Pills are NOT this component's CSS: use bare `chip chip-lg` triggers (see Tabs — Pills).
