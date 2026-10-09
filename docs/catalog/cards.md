# Cards

`cards` · Cards · **statement** · any surface · _(grid; carousel variant uses the shared data-carousel recipe)_

**THE card component (2026-09-01).** Composition-first: the `cmp-cards` zone in ds.css owns ONLY the collection layout (columns, carousel, the card frame + link hover). Everything inside a card is atoms in the markup — `media-cover` (+`--focus`) and `.ov` for the medium and wash, `card-panel`/`card-media` for the look, `icon-tile`/`ds-num` marks, `.type-*` text (tag-agnostic titles), `chip`/`badge` labels, `btn`/`btn-text` CTAs, `list-check` bullets. Supersedes the cmp-cards-thumb family (legacy until the sweep) and covers the media-less card estate (highlights-tiles, kicker-cards, pillar-grid, …) — see docs/MIGRATION.md.

## THE CARD MODEL (2026-09-02, Hakan)
A card is three independent axes, never a component variant:

```
cd-card                      ← IDENTITY: THE per-card class (universal, 354/354)
  card-panel | card-media    ← LOOK: bounded panel | image-as-card-background
    surface-*                ← PAINT: the surface system does the colour
  + .ov family on media      ← the scrim (tone × strength ov-30..90 × shape)
  + engine axes on the root  ← BEHAVIOUR stays on .cmp-cards (hover, cols)
```

- **Absence of a look class = BOXLESS** — a bare `cd-card` is content on the section. That is the model's null case, not an oversight (Plain, People, List, Testimonials).
- **Paint is not a card feature.** `card-panel surface-primary`, not a "dark card variant". The same surface classes paint sections, tiles, modals and calculator results.
- **Behaviour never goes on a card.** Hover (`is-hover-zoom/lift/fill/none`) and columns (`is-cols-*`) live on the `.cmp-cards` root.
- **Panels outside this engine** (calculator results, modal bodies) are `card-panel` with **no** `cd-card`.
- `.ds-card` is a compat alias of `.card-panel` (pixel-identical, do not author). `card-clear` → `card-panel surface-clear`; `surface-primary p-6`-as-card-paint → `card-panel surface-primary`. See CONVENTIONS.md → "The card model".

## Anatomy
`section.cmp.cmp-cards[.is-cols-3|2|auto]` > `.container-ds` > `.section-head` + `.cd-grid[role=list]` > `.cd-card` (a link or a div; `--cd-min` sets a height floor for media cards). Carousel: `.cd-carousel[data-carousel]` > `.cd-track` > the same cards + `.cd-arrows` of btn atoms.

## The compositions (gallery cards — copy the one you need)
- **Thumbnail** (`cards`, + `cards-carousel`): whole card a link, `card-media` + media-cover + ov scrim, chip label, btn-outline-light pill CTA.
- **Boxed** (`cards-boxed`, + `cards-boxed-carousel`): ratio-box media on top, copy in the card itself = `card-panel` with `--card-pad:0`.
- **Plain** (`cards-plain`): rounded media tile, copy on the section surface.
- **Icon** (`cards-icon`, + `cards-icon-carousel`): media-less; icon-tile + title + body in `card-panel surface-grey is-tile`.
- **Number** (`cards-number`, was `cards-text`): ds-num kicker + title + body in a raised `card-panel` — replaces services-grid / how-it-works-steps (minus services-grid's floating corner number badge, deliberately dropped).
- **Kicker** (`cards-kicker`): word kicker (`type-eyebrow type-blue`) + title + body in a raised `card-panel` — replaces kicker-cards.
- **Icon Linked** (`cards-icon-linked`): whole-card `<a>` in `card-panel surface-clear` — icon-tile + title + body + btn-text — replaces ways-to-accept / pillar-grid.
- **Steps** (`cards-steps`): Step chip + trailing arrow, title, big `ds-num is-lg` in `card-panel is-flat` — replaces process-cards (fan-in entry animation = future data-behavior option, Hakan).
- **Case Study** (`cards-case-study`): boxed media card, category chip on the media edge, title + `meta-dot` fact row — replaces case-study-card.
- **People** (`cards-people`): portrait whole-card links (taller `--cd-min`), gradient wash, name + role + View profile pill — replaces people-grid / people-carousel.
- **Partners** (`cards-partners`): flat logo tiles, mark + name + relationship line, see-all btn-text foot — replaces partner-logos.
- **List** (`cards-list`): the `is-list` LAYOUT mode — hairline rows, thumb + title/subdesc stack + trailing action; the listing pattern.
- **Tombstones** (`cards-tombstones`): flat deal cards — logo well, amount, detail lines, hairline rule, country · date foot, optional ESG badge — replaces tombstone-grid / key-transactions.

**Scroll layout: cards-scroll (generalized scroll-track recipe).** The pinned pan (scroll-track) recipe is hard-bound to `.cmp-feature-scroll-track`'s own `.cst-outer`/`.cst-pin`/`.cst-trackwrap` classes (the tall stage + sticky pin CSS is component-scoped), so a `cards-scroll` composition was deliberately NOT forced — it waits for the recipe to be generalized.

## Content contract
- Slots are markup — add or remove any atom freely; the card stays intentional with any subset.
- Titles are tag-agnostic (`h3` + `.type-*` normally). Whole-card links carry `aria-label`; decorative media/scrims are `aria-hidden`.
- Media via `data-bg` / `<video class="media-cover">` — never inline backgrounds. Focal point: `style="--focus: 70% 50%"`.

## Drift cautions
- Never mint a new card class — a new card look is a new COMPOSITION of atoms on this root (add a gallery card if it recurs).
- Boxed cards: the `card-panel` goes ON the `cd-card` (`--card-pad:0`); never re-paint white by hand.
- **Never mint a card class for a paint** — a new colour is a `surface-*` class on the card, and surfaces are general (they paint any bounded container).
- **Never put a colour in a LOOK rule.** `card-panel` keeps geometry at class specificity and paint at zero (`:where()`), so the surface class wins. Break that and `card-panel surface-primary` renders white.
- Over-media text on `card-media` inherits white ink from the look class; the legacy `type-white`/`type-muted` spellings in shipped blocks still work (the scrim is the surface).

## Authoring rule
Copy the composition block that matches, change content only.
