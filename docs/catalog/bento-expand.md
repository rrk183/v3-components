# Bento — Expand

`bento-expand` · Bento Grids · **statement** · surface-white · static (CSS hover/focus expand) + reveal

## Look
A light section with a header (eyebrow + large two-line headline) above a row of
horizontal image panels. Each panel is a photo with a bottom gradient overlay;
the active panel is wide and shows its eyebrow, title, description and link, while
collapsed neighbours shrink to a slim strip with a vertical label. The first
panel is open by default.

## Motion
Pure CSS — hovering or focusing a panel grows it (`flex-grow`) while neighbours
shrink, revealing the detail block (`:hover` / `:focus-within`). No JS recipe, no
scroll-pinning. Heading and the panel row reveal-up on scroll (`data-reveal="up"`
with staggered `data-reveal-delay`).

## Anatomy
```
section.cmp.cmp-bento-expand.surface-white.section-y[data-animate]
└ .container-ds
  ├ .ds-stack.section-head  ← .ds-eyebrow + h2.type-h1 (reveal, <br> headline)
  └ .be-row (data-reveal="up")
     └ a.be-panel (first has .is-open) [tabindex=0]   ×4
        ├ span.be-img[data-bg="…"]   ← background image
        ├ .ov.ov-gradient-b.ov-80    ← bottom gradient overlay
        ├ span.be-label              ← vertical label when collapsed
        └ .be-detail  ← .be-eyebrow + h3.be-title + p.be-desc + span.be-link
```

## Content contract
- **4 panels** in the shipped layout (3–5 works; each is one `a.be-panel`).
- Mark exactly **one panel `.is-open`** (the first) so the row doesn't open flat.
- Per panel: a vertical `.be-label` (≤2 words), a numbered `.be-eyebrow`
  (e.g. "01 — Trade Finance"), a `.be-title` ≤5 words, a 1-sentence `.be-desc`,
  and a `.be-link` (ends with →).
- Images are set via `data-bg` on `.be-img` (panels are landscape/portrait
  crops — point at existing `/assets/images/*.jpg`). No live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `.be-panel` as the flex children of `.be-row` — the expand effect is
  `flex-grow` driven; adding wrapper divs breaks the grow/shrink behaviour.
- Keep `tabindex="0"` on each panel (keyboard focus drives `:focus-within` open)
  and keep one `.is-open` default.
- Set images via `data-bg` (the deferred-image loader), not inline `style`/`src`;
  keep the `.ov` gradient overlay or text loses contrast on the photo.

## Authoring rule
Read `blocks/bento-expand.html`. Reuse the panel structure and classes verbatim;
change only the labels, eyebrows, titles, descriptions, links and `data-bg`
image refs (and how many panels).
