# Sub-nav — in-page anchors

`subnav` · Navigation · **utility** · surface-white · static

## Look
A thin one-line row of jump links to the sections of a long page, with a
hairline under it. Links are 14px medium in muted ink; the current section is
brand blue with a 2px blue underline. It sits directly under the hero and
**sticks** to the top of the viewport (below the solid site-header brand row)
as the page scrolls.

## Motion
Static — `position: sticky` only, no recipe and no `data-animate`. Anchor
navigation uses the browser's own smooth scrolling; the block adds no JS.
Below 768 the row scrolls sideways rather than wrapping.

## Anatomy
```
nav.cmp.cmp-subnav.surface-white[aria-label="On this page"]
└ .container-ds.sn-inner              ← flex row, overflow-x auto, scrollbar hidden
  └ a.sn-link ×N                      ← .is-active + aria-current="true" on the current one
```

## Content contract
- **4–6 links.** Fewer than 4 doesn't earn a bar; more than 6 turns into a
  horizontal scroll nobody discovers.
- Labels are 1–3 words and must match the section headings they point at.
- Every `href` is an in-page `#id` that exists on the host page — this is the
  one block whose links depend on the page around it.
- Exactly one `.is-active` + `aria-current="true"`.
- Keep `aria-label="On this page"` on the `<nav>`.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The bar is ONE line high by contract. Don't let it wrap — that pushes the
  page content down on every resize; the sideways scroll below 768 is deliberate.
- `top: 72px` clears the solid brand row. If a page uses a taller header, adjust
  in ds.css — never with an inline style.
- Highlighting the active section as the reader scrolls would need a recipe;
  there is none today, so the active link is authored, not computed.

## Authoring rule
Read `blocks/subnav.html`. Reuse the structure verbatim; change only the link
labels and their `href` targets, and move `.is-active`/`aria-current`.
