# Site Header v2 — overflow-safe nav (smart "More" collapse)

`site-header-v2` · Navigation · **utility** · no surface class · `data-behavior="site-header"`

## Look
Identical to `site-header` (same navy utility bar, brand row, mega-menus,
search, drawer — read that dossier first) with ONE difference: the utility-bar
segment nav can carry ANY number of links. Links that do not fit the bar
collapse into a "More" dropdown at the end of the strip — a white 12px-radius
panel in the house dropdown style — and move back out when the viewport widens.
The websites menu is labelled **"Our Websites"** here so the two menus read
apart. The demo carries 12 segments (4 more than v1) to show the collapse.

## Motion
Everything from `site-header`, plus: `ds.js` (`ishOverflowNav`, auto-wired off
`.ish-v2 .ish-segwrap`) measures the segment nav on load, resize and font-load.
Links that overflow get `.is-ovf` (hidden) and are mirrored as clones into the
authored `.ish-ovf-panel`; the `.ish-ovf-wrap[hidden]` trigger unhides only
when something is collapsed. The ACTIVE segment is never collapsed. The
dropdown's open/close (click, Escape, outside click) rides the site-header
recipe's normal `[data-dropdown]` wiring. Measurement uses
scrollWidth/clientWidth only — direction-agnostic, so RTL needs no special
casing.

**Mobile (≤1280px).** Exactly as `site-header`: the utility row is hidden and
the drawer owns the nav. The drawer's segment list is built from the ORIGINAL
`.ish-segments` (which keeps every link — collapsed ones are hidden, not
removed), so all 12 segments always appear in the drawer.

## Anatomy
Delta vs `site-header` only — everything else is identical:
```
│   ├ .ish-segwrap
│   │  ├ nav.ish-segments            ← any number of links (one .is-active)
│   │  ├ .ish-ovf-wrap[data-dropdown][hidden]   ← authored EMPTY; ds.js manages
│   │  │  ├ button.ish-ovf-trigger ("More" + .ish-ovf-caret)
│   │  │  └ .ish-ovf-panel[role=menu]  ← clones of collapsed links
│   │  └ .ish-more-wrap[data-dropdown] → "Our Websites" panel (3 .ish-col)
```

## Content contract
- Segment links: **any count** (demo ships 12); exactly one `.is-active` +
  `aria-current="page"`.
- `.ish-ovf-wrap` ships EMPTY and `hidden` — never author links inside
  `.ish-ovf-panel`; `ds.js` fills and empties it.
- Everything else follows the `site-header` contract (mega-menus, login,
  search, drawer).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the `.ish-v2` class on the root next to `cmp-site-header` — it is what
  opts the segment bar into the overflow behavior.
- Keep the authored `.ish-ovf-wrap[data-dropdown][hidden]` exactly as shipped
  (trigger + empty panel), placed INSIDE `.ish-segwrap` directly after
  `nav.ish-segments`.
- Do not pre-hide links with `.is-ovf` or pre-fill the panel — the runtime
  owns both.
- Keep the drawer/burger/mega hooks per the `site-header` dossier; unique
  drawer id per page copy (`ish-drawer-v2` here).
- All `site-header` cautions apply (two-row split, `data-solid` for no-hero
  pages, `.container-ds` gutters).

## Authoring rule
Read `blocks/site-header-v2.html`. Reuse the structure and data hooks verbatim;
change only link labels and counts — add as many segment links as needed, the
bar will not break.
