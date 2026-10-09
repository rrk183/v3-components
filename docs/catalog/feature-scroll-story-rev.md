# Feature Scroll Story — Mockup Left (rev)

`feature-scroll-story-rev` · Storytelling & Scroll · **showpiece** · surface-grey · `data-behavior="scroll-story"`

> **Unreviewed** — the mockup-left layout of [[feature-scroll-story]]. Same
> component and root class (`.cmp-feature-scroll-story`), same `.ess-*` engine,
> with `rev` added to the `.ess` element to flip the mockup column to the LEFT.
> Awaiting front-end review.

## Look
Identical pinned, scrubbed narrative to the default, but mirrored: the product-UI
**mockup column sits on the LEFT** and the numbered chapters on the RIGHT.

## How it differs from the default
- The `.ess` element carries `class="ess rev …"`.
- `ds.css` flips the visual column with `.ess.rev .ess-vis{order:-1}` — no new CSS,
  one existing modifier class. On mobile both variants stack identically
  (`.ess.rev .ess-vis{order:0}`).
- Nothing else changes: same root, engine, baked-PNG mockups (`.ess-shot-img` in
  `.mkw.mkw-img`) and live `.mcard` callouts.

## When to use
Reach for it to **alternate mockup sides** across two scroll stories on one page
(e.g. an Online story with the mockup right, then a Point-of-sale story with the
mockup left) so the page reads with rhythm instead of two identical layouts. For a
single story, use the default.

## Everything else
Anatomy, content contract, image-baking flow and drift cautions are the same as the
default — see [[feature-scroll-story]]. Authoring: read
`blocks/feature-scroll-story-rev.html`, change CONTENT only.
