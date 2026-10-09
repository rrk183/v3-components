# History Timeline

`history-timeline` · Storytelling & Scroll · **statement** · surface-grey · `data-behavior="timeline"`

## Look
A light grey section with a small header (eyebrow + two-line headline) above a
horizontal, swipeable timeline. A connecting line runs across the milestones
with a coloured progress fill; each milestone is a dot with a year, title and
short description. Prev/next arrows sit below. Reads as a polished, scrollable
history track.

## Motion
The track is scroll-snap horizontal. `data-behavior="timeline"` (ds.js, a tiny
rAF read) detects the centred node and marks it active (active / past /
upcoming dot states) while advancing the `data-timeline-fill` progress bar.
Swipe, drag, or the prev/next arrows move between milestones. Heading reveals up
on scroll (`data-reveal="up"`). No scroll-pinning, no inline styles.

## Anatomy
```
section.cmp-history-timeline.surface-grey.section-y[data-animate]
└ .container-ds
  ├ .ds-stack.section-head.ht-head   ← .ds-eyebrow + h2.type-h2 (data-reveal)
  └ .ht[data-behavior=timeline]
     ├ .ht-viewport[data-timeline-viewport]
     │  └ .ht-track[data-timeline-track]
     │     ├ .ht-line > .ht-line-fill[data-timeline-fill]   ← progress bar
     │     └ article.ht-node[data-timeline-node][tabindex=0] ×N
     │        ├ .ht-year
     │        ├ .ht-content (.ht-title + .ht-desc)
     │        └ .ht-dot (aria-hidden)
     └ .ht-nav  ← button.ht-arrow[data-timeline-prev] + [data-timeline-next]
```

## Content contract
- **7 milestone nodes** as shipped (a flexible count — 4–8 read well; each is a
  self-contained `.ht-node`).
- Per node: a year (`.ht-year`, short label like "2007"), a title
  (`.ht-title`, ≤6 words) and a 1–2 sentence description (`.ht-desc`).
- No images — it is year/text driven.
- No live countup numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the `data-behavior="timeline"` wrapper and the
  `data-timeline-viewport` / `data-timeline-track` / `data-timeline-node` /
  `data-timeline-fill` / `data-timeline-prev` / `data-timeline-next` hooks —
  ds.js wires snap, active state, fill and arrows off these.
- Keep one `.ht-line` with its `.ht-line-fill` and one `.ht-dot` per node; the
  progress fill and dot states depend on them.
- Change copy (years, titles, descriptions) and add/remove whole `.ht-node`
  blocks; leave the structure intact.

## Authoring rule
Read `blocks/history-timeline.html`. Reuse the structure and `data-timeline-*`
hooks verbatim; change only the year, title and description text per node.
