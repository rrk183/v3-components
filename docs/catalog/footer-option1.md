# Footer — Option 1

`footer-option1` · Navigation · **utility** · surface-grey · static

## Look
A full three-band site footer. A navy top bar carries the two **context
switchers**: an `عربي` language toggle at the start and a "You are currently
browsing" label + segment-switcher pill at the end. A grey link body spreads
**5 columns** — 4 link lists plus a 5th column with two app-download rows and a
"Follow us" row of 5 social icons. A deeper-grey copyright bar closes it with the
licensing line and a navy masked ENBD logo.

## Motion
No `data-animate` / `data-reveal` — nothing scroll-animates. But the block is
**not inert**: `ds.js` auto-wires two behaviours by class.
- `fo1SegDropdown` — the segment pill opens `.fo1-seg-menu` (a white floating
  panel), syncs `aria-expanded`, closes on outside click / Escape, and mirrors
  the chosen segment into `.fo1-pill-label`.
- `fo1Accordions` — below `lg` each link column collapses into an accordion.

## Anatomy
```
footer.cmp-footer-option1.surface-grey
├ .fo1-topbar > .container-ds
│   ├ button.fo1-lang[lang="ar"] ← .fo1-flag (svg) + عربي
│   └ .flex ← .fo1-browsing
│             + .fo1-seg[data-dropdown]
│                 ├ button.fo1-pill ← .fo1-pill-label + .fo1-pill-caret
│                 └ .fo1-seg-menu[role=menu] ← 4 a[role=menuitem]
├ .fo1-body > .container-ds (grid md:5col)
│   ├ 4 × link column: p.fo1-col-head + ul of a.fo1-link
│   │     (Customer support col has one .fo1-ai-badge "AI")
│   └ 5th column .fo1-apps: p.fo1-col-head + 2 × a.fo1-app
│                 + div ← p.fo1-social-head + 5 a.fo1-social (svg icons)
└ .fo1-copyright > .container-ds ← p.fo1-copy-text + span.fo1-copy-logo
```

## Content contract
- **5 columns**: 4 link lists + 1 apps/social column. Link lists run 4–5 items
  each (`a.fo1-link`); each has a `.fo1-col-head` heading.
- The apps column has 2 `a.fo1-app` rows (title + one-line desc) and **5 social
  links** (Facebook, X, YouTube, Instagram, LinkedIn) under a `.fo1-social-head`.
- Top bar: the `عربي` toggle + one `.fo1-browsing` label + a segment pill whose
  menu lists **4 segments**. Copyright bar: one legal line.
- No images via `data-bg`; the flag, app, social and caret icons are inline SVG.
  The copyright logo is a CSS mask, not markup.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.fo1-body` and `.fo1-copyright` are LIGHT ISLANDS — the footer paints its
  own light body, so its column heads and copyright keep light-mode ink even
  when the section carries a dark surface.
- Keep the three-band structure (`.fo1-topbar` / `.fo1-body` / `.fo1-copyright`)
  — each band's background and spacing is keyed off its class.
- **The top bar is for context switchers only** (locale, segment). Outbound
  links — socials especially — belong in the body's last column, where
  `.fo1-social` gets its 44px light-surface treatment; the top bar's override
  shrinks them to 32px, under the DS tap-target minimum.
- Do **not** put the segment dropdown in the link grid. Those 5 tracks are a
  uniform text rhythm and collapse into accordions below `lg`, so a pill with a
  caret reads as a malformed 6th column and its caret competes with the
  accordion carets.
- Keep the pill in a band with room **below** it — `.fo1-seg-menu` opens
  downward, so it cannot sit in the copyright bar at the page foot.
- Keep the 5-column grid intact; the apps/social column is the 5th cell, not an
  extra appendage.

## Authoring rule
Read `blocks/footer-option1.html`. Reuse the three-band structure and classes
verbatim; change only the column headings, link labels, app titles/descriptions,
segment names and the copyright line.
