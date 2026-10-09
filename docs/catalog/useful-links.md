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

## Drift cautions
- Dividers are `border-block-start` with per-column-mode first-row
  suppression — adding rows never needs CSS; changing columns is the
  `is-cols-*` class, never a new grid rule.
- RTL flips the arrow glyphs automatically (`.is-dl` stays).
- Old `.ul-row` inline-strip markup is retired; pages carrying it WARN in
  the gate until the sweep.
