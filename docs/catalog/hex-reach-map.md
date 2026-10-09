# Hex Reach Map

`hex-reach-map` · Storytelling & Scroll · **showpiece** · surface-primary · data-behavior="hex-reach-map"

Ported from the CIB review codebase (2026-08). Root class `.cmp-hex-reach-map`; all of its
styling lives in `ds.css` under that class — the block itself is pure markup.

## Look
Global reach drawn over a hex-grid world map: per-market hexagonal ripple rings, leader lines and flag chips naming each market. Fades in on entry.

## Content contract
- Markets live in the MARKERS table inside the recipe (id, name, flag, x/y in artwork coordinates, label placement).
- The base artwork is an `<image href>` inside the SVG; flags come from `assets/images/shared/flags/<code>.svg`.
- To add a market: add a MARKERS row with coordinates read off the artwork.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Colours come from CSS classes (`.hx-ripple`, chips) — the recipe never sets a colour, so brands theme it for free. Keep it that way.
- Flags are national artwork: they never theme and never recolour.
- Ripples are dropped under reduced-motion.
- Colours are tokens, never hexes: that is what lets the second brand
  (Emirates Islamic) re-derive this block without touching its CSS.

## Authoring rule
Read `blocks/hex-reach-map.html`. Reuse the shell verbatim and change CONTENT only
(text + media). New markup or `cmp-*` classes on a page are drift.
