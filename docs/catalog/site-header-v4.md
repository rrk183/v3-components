# Site Header

> **Canonical since 2026-08-17.** This is THE site header. v1 (`site-header`)
> and v2 (`site-header-v2`, `-scroll`) are superseded and hidden from the
> gallery; their files stay only because ~77 pages already paste them.

`site-header-v4` · Navigation · **utility** · no surface class · `data-behavior="site-header"`

## Look
Work-in-progress variant. A verbatim copy of `site-header` (v1) with two
changes: the utility-bar segment strip carries the retail lineup —
**Personal** is the active segment, "Corporate & institutional" uses the
lowercase-i spelling, and **About us**, **Premium** and **Innovation** are
appended after International (11 segment links total) — and the strip ends
with an **"Our Websites"** dropdown — a white **2-column** panel matching the
live site: *Emirates NBD Bank Websites* (six countries, each a flag + name +
the languages that country publishes in) and *Emirates NBD Group Websites*
(six entities, each a logo tile + name + languages). The site NAME is not a
link; the language links are the destinations, so UK, India and Research
correctly offer English only. In the drawer the panel becomes an "Our
Websites" accordion after the segment accordions, drilling into its two
groups.
Each of the six **megas opens with a full-bleed promo image** on the
start side — flush to the panel's top, bottom and outer edge, image only
(no card or copy over it). Everything else — utility links, brand row,
megas, search, drawer — is identical to v1. Design iteration on this
variant is expected; treat the current look as a placeholder starting
point.

## Motion
Runs the SAME `site-header` recipe — nothing new in ds.js. Transparent-over-
hero → solid brand row on scroll, megas, search sheet, mobile drawer, all v1
behavior.

## Anatomy
Identical to `site-header` except:
```
nav.ish-segments                 ← 10 links, .is-active on Personal
  + .ish-more-wrap[data-dropdown] ← "Our Websites", 2 .ish-col groups
      .ish-site → .ish-more-ico (.ish-flag svg | .ish-site-logo img)
                + .ish-site-body → .ish-site-name + .ish-site-langs
.ish-panel-inner
  figure.ish-mega-media          ← FIRST child of every mega panel; <img> only
.ish-drawer#ish-drawer-v4        ← unique drawer id for this copy
```

## Content contract
Same as `site-header`. Exactly one `.is-active` + `aria-current="page"` in the
segment strip (as built: Personal).

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the recipe hooks verbatim: `data-mega`, `data-dropdown`, `data-search`,
  `data-burger`, `data-drawer` — the mobile drawer is built from them.
- Unique drawer id per page copy (`ish-drawer-v4` here).
- `.ish-mega-media` is decorative: keep `alt=""` + `aria-hidden`, and keep it
  the FIRST child of `.ish-panel-inner` (the bleed relies on grid order). Swap
  the picture by editing the `src` only — never add copy or a CTA over it.
- v4's panel caret is a clip-path TRIANGLE seated entirely above the panel
  edge, not the shared rotated square — the square's lower half shows as a
  floating diamond once it lands on the promo image. Don't "restore" it.
- The group-entity tiles in `assets/images/websites/` are PLACEHOLDERS. Drop
  the real logo in at the same filename to replace one — the icon slot takes an
  inline `<svg>`, an `<img>` or an icon-font `<i>` at 26px either way.
- `.ish-site-langs a` must stay `inline-flex`: `.ish-col a` and the ≤639
  tap-target rule would otherwise make each language a full-width block and
  push the "|" separator onto its own line in the drawer.
- The segment strip is at its width limit at 1281px with "Our Websites"
  present; adding segments there needs a fresh fit check, not just a paste.
- WIP: expect instructed changes to land here; do not "fix" divergences from
  v1 back to the v1 look.

## Authoring rule
Read `blocks/site-header-v4.html`. Reuse the structure and data hooks
verbatim; change only link labels/counts and the active segment.

## Plain-link mode (satellite sites) — 2026-09-07
A satellite property with its own small nav (first use: `ibv2/`, Emirates NBD
Capital) ships `.ish-menu` as bare `<a class="ish-menu-trigger" href="…">`
links and NO `[data-mega]` groups. Desktop renders them exactly like the
triggers (no caret). ds.js detects the mode (no megas + plain links): the
mobile drawer shows the segment bar as the compact selector and mirrors the
links as a flat list, instead of the v4 per-segment accordions (which would
have nothing to drill into). The utility bar doubles as the GROUP-PROPERTY
switcher (Capital · CIB · Securities · Group); Login becomes a plain
`<a class="ish-login">` CTA; the logotype comes in via `--brand-logo` on the
root. Content-only composition — no new CSS.
