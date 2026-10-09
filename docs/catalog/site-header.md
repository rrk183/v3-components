# Site Header (v1 — superseded)

> **Superseded 2026-08-17** by `site-header-v4`, which is now the canonical
> Site Header. Hidden from the gallery; kept because ~77 existing pages paste
> this markup. Do not use it for new pages.

`site-header` · Navigation · **utility** · no surface class · `data-behavior="site-header"`

## Look
A sticky two-row header. The top row is a solid navy utility bar with a
horizontal customer-segment switcher (one active), a "More" websites dropdown,
a language toggle and a Login dropdown. The lower brand row carries the Emirates
NBD logo, the primary menu with mega-panels, and a search trigger. Over a dark
hero the brand row is transparent with white text; on scroll it solidifies to a
white bar with navy text.

## Motion
`data-behavior="site-header"` toggles `.is-solid` on the header past a small
scroll threshold — the brand row goes transparent→white and the logo recolours
(white→navy) via CSS mask. Add `data-solid` to the root to force the solid state
from the top (use over light page content). The "More", Login, mega-menu, and
search are hover/click reveals wired off `data-dropdown` / `data-mega` /
`data-search`. No `data-animate` / no scroll-reveal — it is chrome.

**Mobile (≤860px).** The inline `.ish-menu` is hidden and the desktop search
control is hidden (its panel can't open at this width). A 44×44 hamburger
(`.ish-burger[data-burger]`) appears in the brand row and opens a right-side
slide-in drawer (`.ish-drawer[data-drawer]`) carrying the same mega-menu link
groups (as collapsible `<details>` sections) plus the search field. `ds.js`
**builds the drawer body from the page's own live nav** (cloning each `.ish-mega`
panel + the `.ish-search-inner`), so it always mirrors the real links without a
second copy to keep in sync — and **injects the burger + drawer shell if a page
predates the markup**, so the behaviour reaches every page that loads `ds.js`.
The burger toggles `.is-nav-open` on the root (bars morph to an X); the drawer
closes on backdrop tap, the close button (`[data-drawer-close]`), any link tap,
Escape, or resize past 860px. Body scroll is locked via `html.ish-nav-lock`.

## Anatomy
```
header.cmp-site-header[data-behavior=site-header]   (+ optional data-solid)
├ .ish-utility (always solid navy)
│ └ .ish-bar.container-ds
│   ├ .ish-segwrap
│   │  ├ nav.ish-segments  ← segment links (one .is-active)
│   │  └ .ish-more-wrap[data-dropdown] → .ish-more-panel (3 .ish-col)
│   └ .ish-utility-right  ← .ish-lang + .ish-login-wrap[data-dropdown]
└ .ish-brand (transparent → solid)
  ├ .ish-bar.container-ds
  │ ├ .ish-brand-left
  │ │  ├ a.ish-logo > .ish-logo-img
  │ │  └ nav.ish-menu → .ish-mega[data-mega] × N (trigger + .ish-panel, 4 cols)
  │ ├ .ish-search-wrap[data-search] → .ish-search-panel (form + popular links)
  │ └ button.ish-burger[data-burger]   ← ≤860px only; hidden ≥861px
  └ .ish-drawer[data-drawer]   ← ≤860px mobile drawer; body filled by ds.js
    └ .ish-drawer-panel
      ├ .ish-drawer-head (.ish-drawer-logo + .ish-drawer-close[data-drawer-close])
      └ .ish-drawer-body  ← ds.js clones search + .ish-mega groups in here
```

## Content contract
- **8 segment links** in the utility bar (one carries `.is-active` +
  `aria-current="page"`); the "More" panel has **3 columns** of website links.
- **2 mega-menu items** by default (Products & Services, Digital Solutions),
  each opening a **4-column** `.ish-panel`. Add/remove `.ish-mega` blocks to
  change the count.
- Login dropdown: 4 menu items. Search panel: one input + a "Popular" link row.
- No images beyond the logo (CSS-masked `.ish-logo-img`); no countup.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `data-behavior="site-header"` and the `.ish-utility` / `.ish-brand`
  two-row split — the solidify-on-scroll and logo recolour depend on them.
- Keep `data-dropdown` / `data-mega` / `data-search` hooks and the
  `aria-haspopup` / `aria-expanded` triggers — `ds.js` wires open/close off
  these; the panels are display-managed, not reveal-animated.
- Mobile nav is handled by the design system — keep the `data-burger` /
  `data-drawer` / `data-drawer-close` hooks (or omit them entirely; `ds.js`
  injects the burger + drawer when absent). Do **not** hand-roll a per-page
  hamburger or duplicate the nav links into a page-level drawer — the drawer is
  built from the live mega-menus, so customising those updates it for free.
- Keep `.container-ds` on the bars so inner edges align to the page gutter.
- **No-hero pages** (light content at the top, no full-bleed image/video): use
  BOTH `class="… is-solid"` and `data-solid` on the root —
  `<header class="cmp cmp-site-header is-solid" data-behavior="site-header" data-solid>`.
  The class paints the bar solid navy before JS runs (no transparent flash over
  white content); `data-solid` tells the recipe to keep it (without the
  attribute, the scroll handler strips the class at the top). This disables the
  transparent-over-hero treatment entirely — the bar is simply always navy.
  Don't hand-edit the solid CSS.

## Authoring rule
Read `blocks/site-header.html`. Reuse the structure and data hooks verbatim;
change only the link labels, segment/menu items and search placeholder text.
