# Stats — Row (composition of cmp-cards)

`stats-row` · Stats · **statement** · any surface · composition — zero CSS of its own

## Look
An eyebrow above a single row of big count-up figures, separated by hairline
dividers (`is-divided`). Each cell: `ds-num is-lg` figure, blue label, short
grey description.

## Usage
### Reach for it when
You need to prove scale FAST — 3–4 headline numbers as a standalone beat.

### Where it shines
Directly under a hero or Big Statement; between narrative sections as proof.

### Possibilities
- Cells are atoms: figure `ds-num is-lg` (count-up via `data-countup` +
  `data-suffix`/`data-decimals`), label `type-h5 type-blue`, description
  `type-body-sm` with a `--measure` cap.
- Columns axis (gallery control) — 2/3/4 cells per row; any surface (tokens
  flip the ink; dividers ride `--on-surface-border`).

### Pairs well with
World Map (reach + proof), Ticker, Key Transactions.

### Not for
A hero figure moment (use Metrics — Type 2) or dense 2×2 quads (Type 1).

## Content contract
3–4 cells; figure ≤6 chars + suffix; label ≤4 words; description one line.

## Drift cautions
Replaced the bespoke `cmp-impact-stats` (deleted 2026-09-01; 33 pages WARN
until the sweep). Never re-add per-cell CSS — it is all atoms.
