# Site Header v2 — overflow-safe nav (scrollable strip)

`site-header-v2-scroll` · Navigation · **utility** · no surface class · `data-behavior="site-header"`

## Look
Identical to `site-header` (same navy utility bar, brand row, mega-menus,
search, drawer — read that dossier first) with ONE difference: on desktop the
utility-bar segment nav is a horizontally scrollable strip instead of a fixed
row, so extra links never overlap. Soft edge fades (28px, cut with a CSS mask
so the navy bar itself is untouched) hint that more links are hidden — and only
appear on edges that actually hide something. The demo carries 12 segments
(4 more than v1) to show the strip.

## Motion
Everything from `site-header`, plus: the strip scrolls by trackpad, shift-wheel
or drag (`data-drag-scroll` on the nav rides the design system's existing
drag-scroll behavior). `ds.js` (`ishSegFades`, auto-wired off
`.ish-v2-scroll .ish-segments`) mirrors the scroll position as `.at-start` /
`.at-end` classes; CSS maps them to the edge fades. Classes are LOGICAL
(computed from |scrollLeft|), with a small `[dir="rtl"]` block flipping the
physical mask direction — the strip works unchanged in Arabic.

**Mobile (≤1280px).** Exactly as `site-header`: the utility row is hidden and
the drawer owns the nav (all 12 segments listed).

## Anatomy
Delta vs `site-header` only — everything else is identical:
```
│   ├ .ish-segwrap
│   │  ├ nav.ish-segments[data-drag-scroll]  ← any number of links; scrolls ≥1280
│   │  └ .ish-more-wrap[data-dropdown] → "More" websites panel (3 .ish-col)
```

## Content contract
- Segment links: **any count** (demo ships 12); exactly one `.is-active` +
  `aria-current="page"`.
- Everything else follows the `site-header` contract (mega-menus, login,
  search, drawer).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the `.ish-v2-scroll` class on the root next to `cmp-site-header` — it
  is what opts the segment bar into the scroll-strip behavior.
- Keep `data-drag-scroll` on `nav.ish-segments` (mouse-drag scrolling).
- Never add `.at-start` / `.at-end` by hand — the runtime owns them.
- Keep the drawer/burger/mega hooks per the `site-header` dossier; unique
  drawer id per page copy (`ish-drawer-v2s` here).
- All `site-header` cautions apply (two-row split, `data-solid` for no-hero
  pages, `.container-ds` gutters).

## Authoring rule
Read `blocks/site-header-v2-scroll.html`. Reuse the structure and data hooks
verbatim; change only link labels and counts — add as many segment links as
needed, the strip absorbs them.
