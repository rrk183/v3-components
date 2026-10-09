# Intro — Side by Side

`intro-side-by-side` · Feature Sections · **supporting** · surface-grey · _(no data-behavior — reveal only)_

> **Unreviewed** — imported from the V7 Payments & Trade Finance page (2026-08).
> Awaiting front-end review (surface-adaptivity on dark, token cleanup). Root
> class `.cmp-intro-side-by-side`; all styling lives in `ds.css` under that class —
> the block itself is pure markup.

## Look
Two columns on a quiet grey surface. Left: an eyebrow, a two-line heading and a
lead paragraph. Right: a stacked list of icon-pillars — each a rounded white icon
chip beside a bold title and a one-line description, divided by hairlines. Reads
as a calm "here is what this area does" opener rather than a hero.

## Anatomy
- `.intro-grid` — the two-column grid (`1.02fr / .98fr` ≥768px, single column below).
- Left column: `.ds-eyebrow` + `.type-h2.type-navy` + `.intro-lead` paragraph.
- `.intro-pillars` — the right column list; each `.intro-pillar` is `icon + text`.
- `.ip-ic` — the 46px white rounded icon chip (holds a 24×24 stroke SVG).
- `.ip-t` / `.ip-d` — pillar title and description.

## Content contract
- Two or three pillars read best; each description is one line (~10–14 words).
- Swap each pillar's inline `<svg>` for the matching concept; keep `stroke-width` ≈1.7.
- Heading is a normal `<h2>` — re-word freely; keep it to two lines with a `<br>` or `&nbsp;`.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Ships on `surface-grey`. Dark-surface adaptivity is **not yet reviewed** — the
  pillar hairline (`rgba(7,36,71,.1)`) and white icon chip were authored for light
  surfaces; run `/audit.html` before using this on `surface-primary`.
- All colours should resolve from tokens (`--on-surface`, `--on-surface-mid`,
  `--blue`) so the second brand re-themes for free — do not reintroduce raw hexes.
- No inline `style=` / `<style>` / IDs on the page: the block is pure markup.

## Authoring rule
Read `blocks/intro-side-by-side.html`. Reuse the shell verbatim and change CONTENT
only (text + icons). New markup or `cmp-*` classes on a page are drift.
