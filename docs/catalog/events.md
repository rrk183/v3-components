# Events

`events` · Feature Sections · **supporting** · surface-white · `data-tabs`

## Look
A light split section: a header row (eyebrow + headline + a "View all events"
link) above a two-column layout. The left column is a vertical list of clickable
event rows (tag + date, title, location, and a description that the active row
reveals, with an accent bar lighting up). The right column is a tall featured
image panel with a gradient scrim and an overlaid tag + title + meta line.

## Motion
Built on the `data-tabs` core: clicking a left event (a `data-tab` trigger)
activates its row — expanding the `.ev-descwrap` description and lighting the
`.ev-bar` — and crossfades the matching right `.ev-panel` (`data-panel`) into
view. Reveal-on-scroll on the header and the split (`data-reveal`). Images load
per panel via `data-bg`.

## Anatomy
```
section.cmp-events.surface-white.section-y[data-animate]
└ .container-ds
  ├ .ev-head        ← .section-head-sm (eyebrow + h2) + a.ev-viewall
  └ .ev-split[data-tabs]
    ├ .ev-list      ← 4 button.ev-item[data-tab] (first .active):
    │   .ev-bar + .ev-meta(.ev-tag + .ev-date) + .ev-title + .ev-loc
    │   + .ev-descwrap > .ev-desc
    └ .ev-featured  ← 4 .ev-panel[data-panel] (first .active):
        .ev-img[data-bg] + .ov.ov-gradient-b + .ev-panel-body
        (.ev-panel-tag + h3.ev-panel-title + p.ev-panel-meta)
```

## Content contract
- **4 events** = 4 list rows + 4 featured panels, paired by `data-tab` /
  `data-panel` ids (e1–e4). One trigger and one panel must carry `.active`.
- Per event: a short tag (1–2 words), a date string, a title (≤8 words), a
  location, and a 1–2 sentence description.
- The right panel restates the tag/title and a "date · location" meta line —
  keep them consistent with the matching row.
- **4 image slots** (one `.ev-img[data-bg]` per panel), tall portrait crop.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The header IS the row: `.section-head-sm.ev-head.is-split` holds the copy
  stack, the `.sh-lead` blurb and the `.sh-action` "view all" link. Do NOT wrap
  it in a layout div — that kills the is-center/is-split variants.
- Keep `data-tab`/`data-panel` ids matched 1:1 and exactly one `.active` pair,
  or the wrong panel shows (or none).
- Don't drop `.ev-bar`, `.ev-descwrap`, or the `.ov` scrim — the accent reveal
  and image legibility depend on them.
- Reveal goes on the header and the `.ev-split` wrapper; don't add it to
  individual rows/panels (the tab logic owns their visibility).

## Authoring rule
Read `blocks/events.html`. Reuse the trigger/panel structure and ids verbatim;
change only the tags, dates, titles, locations, descriptions and `data-bg` image
refs.
