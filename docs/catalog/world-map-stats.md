# World Map — with Scale Stats

`world-map-stats` · Storytelling & Scroll · **showpiece** · surface-grey · data-behavior="world-map"

> **Unreviewed** — a variant of the World Map component (2026-08), generalised
> from Ram's V7 pages, which repeatedly fold a data strip under the map
> (payments-trade-finance, agency, global-loan-solutions). Awaiting front-end
> review. Root class `.cmp-world-map`; the strip is styled by `.cmp-world-map
> .wm-scale` in `ds.css` — the block is pure markup.

## Look
The animated-routes world map, with a multi-column data strip folded in directly
beneath it — big numbers over quiet labels, split by hairline dividers. Reads as
one credibility unit: reach (the map) plus proof (the figures).

## Anatomy
- `.wm-map` + `[data-behavior="world-map"]` — the map recipe (unchanged from the
  Default variant; config via `data-dots` / `data-line-color` / offsets).
- `.wm-scale` — the data strip: a grid of `<div><span class="n">…</span><span class="l">…</span></div>`.
  Two columns on mobile, four ≥768px; the leftmost column of each row drops its divider.

## Content contract
- 2–4 columns read best. Each cell is a number (`.n`) + a short label (`.l`);
  the label can be plain text rather than a figure.
- Keep numbers terse (`AED 1.2T`, `10M+`, `A++ (Stable)`). Long labels wrap fine.
- The strip is not count-up by default — the figures are static (values like
  "A++ (Stable)" are not numeric). Add `data-countup` per cell only for plain numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Surface-adaptive by construction: numbers use `--on-surface`, labels
  `--on-surface-mid`, dividers `--on-surface-border`. Never hardcode white/navy —
  that was the original bug (white text folded onto a grey surface, invisible).
- The strip belongs INSIDE the map section (`.cmp-world-map`), under `.wm-map`;
  its CSS is scoped to `.cmp-world-map .wm-scale` and won't style a loose strip.
- No inline `style=` / `<style>` / IDs on the page.

## Authoring rule
Read `blocks/world-map-stats.html`. Reuse the shell verbatim and change CONTENT
only (routes + figures). New markup or `cmp-*` classes on a page are drift.
