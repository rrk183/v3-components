# Useful Links

`useful-links` · Feature Sections · **utility** · any surface · (no behavior — reveal only)

## Look
A quiet resources strip for the foot of a page: a `ds-eyebrow` head over a
columned grid of hairline link rows (3-up by default). Each row is a title,
an optional small meta line, and a trailing type glyph. Rebuilt 2026-09-02
from the old one-line inline strip (which broke at 6+ links and could not
say "this one is a PDF").

## Usage
### Reach for it when
- A page ends with a set of RESOURCES: docs, PDFs, portals, related pages —
  especially a MIXED set (6+, different types).

### The type-glyph contract
- **Page link** → trailing arrow, no meta (or a one-line descriptor).
- **PDF / download** → download glyph; meta line carries `PDF · 2.4 MB`.
- **External site** → up-right arrow; meta line carries the domain;
  `target="_blank" rel="noopener"` on the row.
The glyph tells the reader what clicking does BEFORE they click. Keep it
truthful — never an arrow on a PDF.

### Possibilities
- **Columns**: `is-cols-1` / `is-cols-2` / default 3 (`--ul-cols`); the
  gallery Columns control drives the same classes. Stacks <768px.
- **Icons**: a leading `icon-tile is-sm` per row — ALL-OR-NONE per instance
  (mixed icon/no-icon rows knock titles out of alignment; decided 2026-09-02).
- Any surface — ink, dividers and icon tiles ride `--on-surface-*` tokens.

### Not for
- A categorized index into many sections — that is Link Directory.
- One or two links — use a `btn btn-text` in the closing section instead.

## Anatomy
```
section.cmp.cmp-useful-links.surface-*[data-animate]
└ .container-ds
  ├ .ul-head › span.ds-eyebrow
  └ .ul-grid
    └ a.ul-item  (×4–9)
      ├ span.icon-tile.is-sm   ← optional, all-or-none
      ├ span.ul-body › .ul-title + .ul-meta?
      └ svg.ul-go[.is-dl|.is-ext]
```

## Content contract
- 4–9 rows; title ≤4 words; meta one short line.
- PDF rows: meta = `PDF · size`, glyph `.is-dl`, `download` attribute.
- External rows: meta = domain, glyph `.is-ext`, `target="_blank" rel="noopener"`.

## Options
- **Groups side by side** (2026-10-12): two or more groups (`.ul-head` + `.ul-grid`) may sit in a `grid md:grid-cols-2` with `is-cols-1` on the root, so each group is a single column.
- **Pop-up rows:** a row may open a modal (`data-modal-open`) instead of only linking.
- **Single row:** one link is fine on a short support page.
- **Footer button row:** one or two centred buttons under the list (e.g. "Visit the Form Centre").
- **Filter bar:** a search box plus topic chips and a live result count (the shared ds.js filter); rows may be grouped under topic headings (each group a `.ul-head` + `.ul-grid`), and the eyebrow head may be dropped.
- **Live search** (2026-10-12): add `data-filter` to the root and a search input that filters the rows (the shared ds.js filter), with a `[data-filter-empty]` empty state.
- **Mid-page section.** Add `section-y` to the root for full section spacing,
  and a `.section-head` (any alignment, e.g. Split) may replace the eyebrow-only
  `.ul-head` above the grid. Grouped lists repeat `.ul-head` (eyebrow = group
  title) + `.ul-grid` per group. Used by media-library and
  tutorials-platform-demos-v2.

## Instance notes
- **Anchor id (instances only):** a page may add `id="..."` to the root when in-page links jump to the section (sub-nav, "scroll to" buttons). The master block itself stays ID-free.

## Drift cautions
- Dividers are `border-block-start` with per-column-mode first-row
  suppression — adding rows never needs CSS; changing columns is the
  `is-cols-*` class, never a new grid rule.
- RTL flips the arrow glyphs automatically (`.is-dl` stays).
- Old `.ul-row` inline-strip markup is retired; pages carrying it WARN in
  the gate until the sweep.
