# Breadcrumb

`breadcrumb` · UI Elements · **utility** · surface-white · reveal


## The paste unit (2026-09-01)
`<nav aria-label="Breadcrumb"><ol class="bc-trail">…</ol></nav>` — that is ALL a
page copies. `.bc-trail` owns the row layout (flex/gap/wrap, list reset); items
are `.bc-link` / `.bc-sep` (or `.bc-chev`) / `.bc-current[aria-current="page"]`.
No wrapper component: drop the nav into the page's existing top section or the
hero. The block's `mt-8` rows, captions and navy panel are gallery specimen
chrome — never copy them to a page.

## Look
A light, tight wayfinding section showing the page's location in the IA as a row
of links separated by `/` (or chevron) with the current page in bold. The block
ships as a **demo of four variants** stacked: a 3-level trail, a 4-level trail,
a chevron-separator version, and an on-dark treatment.

## Motion
Reveal-on-scroll only — the eyebrow and each variant wrapper use `data-reveal="up"`
to fade/slide in. No recipe, no interactivity beyond normal link hover.

## Anatomy
```
section.cmp-breadcrumb.surface-white.section-y-tight[data-animate]
└ .container-ds
  ├ span.ds-eyebrow
  ├ .mt-8  "3-level"   → nav>ol.flex  ← li>a.bc-link + li.bc-sep "/" + li>span.bc-current
  ├ .mt-8  "4-level"   → same, 4 crumbs
  ├ .mt-8  "chevron"   → li.bc-chev (SVG) as separators instead of .bc-sep
  └ .surface-primary wrapper (rounded-2xl px-8 py-10) → on-dark variant (dark-surface flips retint .bc-link)
```

## Content contract
- A real page uses **one** breadcrumb trail (pick the variant you need); the
  block shows all four as a reference.
- Each trail: 3–4 crumbs. Ancestors are `a.bc-link`; the final/current page is
  `span.bc-current` (not a link). Separators are either `li.bc-sep` ("/") or
  `li.bc-chev` (SVG), used consistently within one trail.
- Crumb labels are short section names (≤3 words each). No images, no live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the `nav[aria-label="Breadcrumb"] > ol > li` structure and the
  `.bc-link` / `.bc-current` / `.bc-sep` (or `.bc-chev`) classes — styling and
  semantics depend on them. The last crumb must be `.bc-current`, never a link.
- For on-dark put the breadcrumb in a `.surface-primary` wrapper (the global dark-surface flips retint the links); don't hand-recolor. `.bc-dark` was retired 2026-09-01.
- Don't mix `/` and chevron separators within a single trail.

## Authoring rule
Read `blocks/breadcrumb.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
