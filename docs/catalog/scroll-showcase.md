# Scroll Showcase

`scroll-showcase` · Storytelling & Scroll · **showpiece** · any surface · `data-behavior="scroll-showcase"` (pinned scrub)

## Look
A pinned split: copy steps on one side, a device image on the other. As the
user scrolls, steps activate in sequence and the image crossfades per step;
chips and a count track progress. The Reversed variant flips the columns.

## Motion
Pinned scrub (`data-behavior="scroll-showcase"` — renamed from the old
`scroll-tab`; the alias survives in ds.js but new work uses the new name).
Gallery renders it in a fixed-height scrolling frame like every pinned
engine.

## Anatomy
```
section.cmp.cmp-scroll-showcase.surface-*[data-behavior=scroll-showcase][data-animate]
└ .ss-wrap
  ├ .section-head.is-split › .ds-stack › .ds-eyebrow + h2 + .sh-lead
  └ .ss-sticky
    ├ .ss-steps › .ss-step ×N  (.ss-name, .ss-desc, .ss-chips › .chip, .ss-cta › .btn)
    └ .ss-step-img › .ss-img[data-bg] ×N   (one per step, crossfaded)
```

## Options
- **Status badge:** an item may carry one status `badge` (e.g. "Live", "Pilot").
- **Pull quote:** an item may include a short quote with attribution.
- **Stat pair:** an item may show a pair of key figures (number + label each).
- **Products label:** a small label (e.g. "Sample products") may sit above the chip row.
- **Index number:** each item may open with a large index number.
- **Tick-list body:** an item may hold a `list-check` instead of its chip row.
- **Per-step button optional:** an item may drop its call-to-action button.
- **Chips optional:** the row of tag chips under each item may be dropped (all items or none).

## Content contract
- 3–5 steps; step name ≤4 words; one image per step (same aspect).
- Chips optional per step; one CTA at most.

## Drift cautions
Root is `cmp-scroll-showcase` — never resurrect `cmp-scroll-tab` /
`blocks/scroll-tab.html` (renamed 2026-09-01; pages carrying the old root
WARN in the gate). Steps and images pair by index — keep counts equal.

## Authoring rule
Read `blocks/scroll-showcase.html` (or `scroll-showcase-rev.html`). Reuse
structure/classes verbatim; change only content.

## Instance notes
- **Anchor id (instances only):** a page may add `id="..."` to the root when in-page links jump to the section. The master stays ID-free.
