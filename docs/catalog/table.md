# Table

`table` · UI Elements · **utility** · surface-white · static

## Look
A light section showing **two stacked table variants**: a *Standard Table*
(recent transactions — reference, beneficiary, date, type, amount, status with
coloured badges, plus an Export CSV action and a pager) and a *Financial Table*
(market indices — last/change/% in green/red, volume, status, with a "Live"
indicator). Each table sits in a bordered card with a header, a horizontally
scrollable body, and (for the standard one) a footer.

## Motion
Static. Reveal-on-scroll only: each `.tbl-label` and `.tbl-wrap` fades/slides up
(`data-reveal="up"`). Rows do not animate; the "Live" dot is a CSS accent. The
pager and Export button are non-functional showcase controls. No countup.

## Anatomy
```
section.cmp-table.surface-white.section-y[data-animate]
└ .container-ds
  ├ Standard Table
  │  ├ p.tbl-label (data-reveal=up)
  │  └ .tbl-wrap (data-reveal=up)
  │     ├ .tbl-header  ← h4.type-h5 + Export CSV button
  │     ├ .tbl-scroll > table.tbl  ← thead + tbody (rows w/ .badge, .num, .tbl-mono)
  │     └ .tbl-footer  ← count caption + .tbl-page pager buttons
  └ Financial Table
     ├ p.tbl-label (data-reveal=up)
     └ .tbl-wrap (data-reveal=up)
        ├ .tbl-header  ← h4.type-h5 + .tbl-live "Live" indicator
        └ .tbl-scroll > table.tbl  ← .num.positive / .num.negative cells
```

## Content contract
- **2 tables** by default (standard + financial); drop one if only one is
  needed. Standard table: **6 columns**, **5 body rows**. Financial table:
  **7 columns**, **5 body rows**.
- Badges reuse `.badge` + colour modifier (`badge-green/amber/red/blue/navy`);
  numeric cells use `.num`, monospace refs use `.tbl-mono`, financial deltas use
  `.num.positive` / `.num.negative`.
- Footer caption is free text (e.g. "Showing 5 of 248 transactions"); pager has
  5 buttons with one `.tbl-page-active`. No images, no live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.tbl-wrap` (the whole table card) is a LIGHT ISLAND — it paints itself
  white, so its head/body/footer copy stays light-mode ink on any surface.
- Keep `.tbl-scroll` around each `table.tbl` — it provides horizontal scroll on
  narrow viewports; removing it breaks overflow on mobile.
- Reuse the badge/`.num`/`.tbl-mono`/`positive`/`negative` classes for styling
  rather than inventing cell classes; these are the contract with `ds.css`.
- Keep `data-reveal` on the labels/wraps only, not on rows or the section root.

## Authoring rule
Read `blocks/table.html`. Reuse the table structure and cell classes verbatim;
change only the column headers, row data, badge labels and caption text (and how
many rows).
