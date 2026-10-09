# Emirates NBD DS — authoring conventions (v4)

A component is **pure portable HTML**. Paste a block into any page that loads the
runtime and it works — styled and animated — with **no per-component CSS or JS
and no IDs**. The runtime is pre-deployed, loaded once per page:

```html
<link rel="stylesheet" href="assets/css/fonts.css" />
<link rel="stylesheet" href="assets/css/ds.css" />
<script src="assets/js/tailwind.cdn.js"></script>
<script src="assets/js/ds-tailwind-config.js"></script>
<script defer src="assets/js/ds.js"></script>
```

## Styling — THE LAW (2026-09-03, Hakan)

> **Surfaces, inks and overlays are declared in MARKUP.**
> **CSS never adapts content by context.**
> **A different look on a different ground is a DIFFERENT MARKUP COMPOSITION.**

Responsibility for layout, surface and colour choices belongs to the **author**.
The library's job is narrower and absolute: *every vocabulary word renders
exactly as declared.* "The library is preselected compositions/markups to guide
the author" — so when a component should look different on navy than on white,
the answer is a second composition, never a rule that reaches down from the
ground and repaints the content.

**A context rule is a GATE FAILURE, not a technique.** `verify.mjs` flow 8
enforces this mechanically, and it is not advisory:

| Gate rule | What fails |
|---|---|
| §8a anti-context | Any ds.css rule whose selector crosses a combinator from a `.surface-*`/`.on-light` ancestor and declares a colour or colour-token property. Geometry under a surface is fine — colour is not. |
| §8b no new indirection | Defining any `--on-*` / `--ink-*` custom property. Ink classes consume **brand tokens** (`--navy`, `--blue`, the greys) directly — one level of indirection, so a brand theme repaints the system by overriding brand tokens alone. |
| §8c closed vocabulary | Any `surface-*` / `ink-*` / `ov-*` class, anywhere, that is not in the enumerated palette / mode / strength / paint sets. Adding a word is a system decision, not a local one. |
| §8d block pairing | Every text element in every block, statically resolved to its ground and checked against the pairing rulebook. Blocks are the library's own compositions — they are provably legal before any page is audited against them. |
| §8e deprecations | Old spellings in first-party pages (warn — pages migrate in the estate audit). |

The vocabulary and the rulebook live in **one file**, `assets/js/ds-palette.js`,
which both the gate and the gallery's Surface control read. Nothing restates
them; a rule that needs a palette fact imports it.

This lesson has been taught twice — see `b7f87aa2` *"revert my invented CSS axes
— library markup + Ram content is the rule."* Prose alone drifts, so the law now
has teeth.

## Styling — hybrid split

| Use **Tailwind utilities** for…            | Use **semantic CSS classes** for…                          |
|--------------------------------------------|-------------------------------------------------------------|
| flex, grid, gap                            | atoms: `.btn` (the button model), `.field`, `.badge` (+ `.badge-sm/-lg`), `.chip`, `.range`, `.list-check`, `.meta-dot`, `.icon-tile`, `.ds-num`, `.card-panel`/`.card-media`, `.tbl-wrap`/`.tbl` |
| spacing (padding/margin), alignment        | grounds + inks: `.surface-*` / `.ink-*` (THE PALETTE — see below)  |
| responsive breakpoints (`md: lg: xl:`)     | type: `.type-h1…h6`, `.type-display-*`, `.ds-eyebrow`       |
| simple positioning (`absolute inset-0`)    | overlays: `.ov .ov-gradient-b .ov-70 .ov-primary`           |
| one-off layout tweaks                      | layout primitives: `.container-ds`, `.section-y`, `.ds-stack` |
|                                            | complex / repeated component styling: `.cmp-<name>` (keyframes, pseudo-elements, intricate selectors) — kept in `ds.css` |

**Don't utility-spam reusable things.** A button is `class="btn btn-accent"`, not
ten utilities. If you'd repeat the same utility cluster, make it an atom or a
`.cmp-<name>` rule. Prefer token utilities (`bg-navy`) over arbitrary
values (`bg-[#072447]`) — and for TEXT colour use the palette ink classes
(`ink-primary`, `ink-accent`, …); `text-blue` and the `type-*` colour family
are deprecated aliases with no flip behaviour left.

**No inline `style="…"` in component markup.** Everything is a class. Common
needs have DS classes: header→content gap `.section-head` / `.section-head-sm`,
content widths `.container-ds` (1400) / `.container-narrow` (880), readable copy
`.measure`, removable rhythm `.ds-stack`. `.container-ds`/`.container-narrow` are
**self-contained** (page gutter + max-width + centred) — use one as the inner
wrapper; do NOT also put `.section-x` on it (double padding). Full-bleed sections
(heroes) use `.section-x` directly. Every standard section's content lines up on
the same left/right gutter this way. Per-instance **images** use
`data-bg="/path.jpg"` (the runtime applies `background-image`) — never an inline
background. The only inline styles that should appear in the live DOM are the
ones the runtime sets from data-attributes (`data-bg`, scroll-frames height).

**Type is TAG-AGNOSTIC (2026-08-31).** The HTML tag is chosen for semantics —
**one `<h1>` per page** (the page's true headline, usually the hero); the
`.type-*` class alone sets the visual size. An `<h2 class="type-h1">` renders
identically to an `<h1 class="type-h1">`. Every new component's title slot
accepts any heading tag; sizing a heading with a bare tag (no `.type-*` class)
is drift. See the Typography gallery card (`blocks/typography.html`).

**The atom set is THE vocabulary (2026-08-31).** Before writing any component
CSS for a mark, link, number, card panel or table, compose the atom instead:
`.icon-tile` (icon squares), `.ds-num` (big stat figures), `.card-panel` (the bounded
panel — it DECLARES its ground: `card-panel surface-white` for the light box,
`card-panel surface-glass` for the frosted one) and
`.card-media` (image-as-card-background), `.chip`, `.badge-sm/-lg`,
`.tbl-*` (tables, now global). Hand-rolling any of these (a new white-card
rule, a new icon square, a new number clamp, a new text+arrow link) is drift.
The UI Elements gallery category demos them all.

**THE BUTTON MODEL (2026-09-01, Hakan).** One system, four axes —
TYPE × ICON MODE × SIZE × RADIUS. Types are ROLE-named, never color-named
(multi-brand; paint rides tokens): `.btn-filled` (primary action),
`.btn-accent` (secondary), `.btn-outline` (tertiary),
`.btn-text` (the quiet text button + optional arrow — the in-card "go deeper"
affordance; its arrow mirrors in RTL). Icon modes are MARKUP: label only /
label + inline svg / icon-only = `.btn-icon` + the label in `.sr-only`.
Icon-only buttons are ALWAYS circles — `.btn-icon` rounds itself (2026-09-03);
never rely on `.btn-pill` for that (it is redundant on icon buttons).
Sizes `.btn-xs…-xl`; radius per-size default or `.btn-pill`. **Radii are
TOKENS** (2026-09-01): the `:root` scale `--r-xs/-sm/-md/-lg/-xl/-pill` is the
only radius vocabulary — atoms consume it, a brand theme reshapes the whole
system by overriding six tokens, and a new literal `border-radius` in atom or
component CSS is drift (legacy component radii migrate at the sweep). Legacy paints
(`btn-primary`, `btn-navy`, `btn-ghost`, `btn-danger`, `btn-outline-blue`)
stay valid until the sweep; `btn-outline-light` remains THE dark-surface
outline. New work composes only the role types.

**THE GLYPH AXIS (2026-09-03, Hakan).** A button's icon is a FIFTH axis, and it
is a CLASS, not markup. Inline `<svg>` blobs inside buttons are retired: the
glyph lives once in ds.css as a data-URI **mask painted with `currentColor`**,
so it inherits the button's ink on every surface, in every brand, in dark mode
and on hover for free. Markup only NAMES it.

```html
<a class="btn btn-text is-arrow" href="#">View all capabilities</a>
<a class="btn btn-outline is-arrow-back is-ic-start" href="#">All case studies</a>
<button class="btn btn-icon is-back" type="button" data-carousel-prev>
  <span class="sr-only">Previous</span></button>
```

`::after` is the default (where the pasted svg sat, inside `.btn`'s own
inline-flex + gap); **`.is-ic-start`** moves it to `::before` for a leading
glyph. Icon-only = `.btn-icon` + the glyph + the label in `.sr-only`. Size
rides `--ic-size` (px), defaulted per button size: xs 14 / sm 16 / base 17 /
lg 18 / xl 20, icon 18. Non-`.btn` controls (`crl-btn`, `ct-arrow`, `fr-arrow`,
`pgn-btn`, the site header's menu/more/login/search/drawer-close) set their own.

THE VOCABULARY — names are LOGICAL (what the control does), never descriptive
of the drawing, so a glyph can be redrawn without touching a page:

| modifier | glyph | used for |
|---|---|---|
| `is-arrow` | → long arrow | the forward CTA affordance ("Learn more →") |
| `is-arrow-back` | ← long arrow | back links, prev on the crl/ct nav |
| `is-next` | › chevron | next in a pair, "go deeper" on a large CTA |
| `is-back` | ‹ chevron | previous in a pair |
| `is-up` / `is-down` | ⌃ / ⌄ chevron | disclosure + menu carets (rotate on open) |
| `is-up-right` | ↗ | external / off-site links |
| `is-close` | ✕ | modal, drawer and dismiss controls |
| `is-plus` / `is-minus` | + / − | expand / collapse, add / remove |
| `is-download` | ⭳ | file downloads |
| `is-search` | magnifier | the search trigger |
| `is-play` / `is-pause` | ▶ / ⏸ | media controls (note: `crl-toggle` keeps its own CSS-drawn pair — component canon, visibility-swapped on `.is-paused`) |

**RTL** is handled once: the five DIRECTIONAL glyphs (`is-arrow`,
`is-arrow-back`, `is-next`, `is-back`, `is-up-right`) mirror under
`[dir="rtl"]`; close/plus/minus/up/down/search/play/pause/download never do.
Hover nudges restate the flip (translate before `scaleX`). Do not add
per-component RTL icon rules — the axis already covers it.

**Forced colours** are handled once too: a mask is a background, and
forced-colors mode strips backgrounds, so every glyph repaints with
`ButtonText` under `@media (forced-colors: active)`.

**ADDING A GLYPH IS A ds.css EDIT** — deliberately a system-level, roughly
monthly-cadence decision, never a per-page one. If a page seems to need a
fifteenth glyph, the answer is almost always one of the fourteen. Genuine
brand marks (a LinkedIn logo, App Store / Google Play badges) are NOT glyphs:
they are multi-colour vendor artwork that must not be recoloured by the
button's ink, so they stay inline svg and are allowlisted in the gate.
The gate WARNs on any other inline `<svg>` inside a button.


**Defaults are policy, modifiers are PINS (2026-09-01).** Every axis carries an
explicit class for its current default (`.is-left`, `.is-cols-4`, …). A
classless instance follows whatever the system default is — including future
changes; an instance that must keep today's look writes the modifier
explicitly. The sweep pins every intentional choice.

## Headlines & copy casing

- **Sentence case for all headings** — every h1…h6 and display line. "Emirates
  NBD" is always written exactly as "Emirates NBD"; brands, products, people,
  places, acronyms and "Islamic" keep their capitals.
- **Chips/badges are labels** — exempt from the sentence-case rule.
- **Periods:** statement headlines — section h1/h2 and card titles that read as
  a full clause — end with a period. Label-like titles (nav items, chip text,
  short noun-phrase card titles) never take one. Multi-sentence display lines
  keep all their stops.

## Component contract

```html
<section class="cmp cmp-<name> surface-<x>" data-animate data-behavior="<recipe?>">
  …content slots…
</section>
```
- Root carries the component class + a surface + optional `data-animate` / `data-behavior`.
- **No IDs.** Address everything by class / `data-*`, so a block can appear any
  number of times on one page without collisions.
- A component's non-utility CSS lives in `ds.css` under `.cmp-<name>`.

## Animation — opt-in, three tiers (all in `ds.js`)

Animations run **only inside `[data-animate]` (or `.animate`)**. Without it,
content is static and visible (also the reduced-motion / JS-off fallback).

1. **Simple** — `data-reveal="up|down|left|right|fade"` (+ `data-reveal-delay`),
   `data-countup="180" data-suffix="+"`.
2. **Interactions** — `data-tabs`/`data-tab`/`data-panel`; `data-accordion`
   (`data-acc`/`data-acc-head`/`data-acc-body`); `data-carousel`
   (`data-carousel-track|slide|prev|next|dots`, `data-autoplay`); modals
   (`data-modal-open="id"`/`data-modal-close`/`data-modal-dismiss`);
   **`data-filter`** — a filterable region: `data-filter-key`/`-value` pill
   buttons + `<select data-filter-key>`, items `data-filter-item` carrying one
   `data-filter-<key>` attr each (AND across keys, OR within a key), optional
   `data-filter-reset`/`-count`/`-empty`. **Filtering is a generic capability —
   any card grid in any block becomes filterable by adding these attributes;
   never write a page-local filter script.** Controls styled with `.filter-bar`
   / `.filter-chip` / `.filter-select` (ds.css).
**Overlay atom:** `.ov` paints a flat tint by DEFAULT; `.ov-black`/`.ov-blue` set only
the colour and `.ov-NN` only the alpha. Add a type class (`ov-tint`, `ov-scrim`,
`ov-gradient-b|t|l|r`, `ov-vignette`) to choose the paint. The atom sits at
`z-index:1`, so the content wrapper above it needs `relative z-10`.

3. **Recipes** — `data-behavior="scroll-frames | zoom-parallax | …"`. Config via
   `data-*` (scroll-frames: `data-source`, `data-count`, `data-path` with `###`,
   `data-scrub-vh`), content via child slots. Heavy libs (GSAP/three.js) load
   once. Add a new effect = one recipe in `ds.js` (`DS.recipe(name, fn)`) +
   document its attributes; reuse it for new content by editing slots/attributes.

## The palette — one palette, three prefixes (RULING 2026-09-03, Hakan)

The whole colour vocabulary is ONE palette of eight words plus one extra ink.
Each word names a role-POSITION; each prefix realises that position in its own
medium — `surface-` as a ground, `ink-` as text, `ov-` as an overlay wash.
An overlay is paint, so **`ov-X` always carries the GROUND colour of X**.

| word | `surface-` (ground) | `ink-` (text) | `ov-` (wash) |
| --- | --- | --- | --- |
| white | `#ffffff` | `#ffffff` | `ov-white` |
| soft | `var(--light)` | `var(--soft)` `#D7DEE6` | `ov-soft` |
| mute | `var(--grey-2)` | `var(--mid)` `#3A4B5C` | `ov-mute` |
| primary | `var(--navy)` | `var(--navy)` | `ov-primary` |
| primary-soft | `var(--navy-wash)` | `var(--steel)` | — |
| accent | `var(--blue)` | `var(--blue)` | `ov-accent` |
| accent-soft | `var(--blue-wash)` | `var(--blue-soft)` | — |
| dark | `#030303` | `#030303` | `ov-dark` |
| — | — | `ink-faint` `var(--faint)` | — |

For white / primary / accent / dark the three realisations are **literally the
same colour**. `soft` and `mute` are the same position read in two media: as a
GROUND, one (soft) and two (mute) steps of separation below white; as an INK,
one and two steps of hierarchy below the ground's own primary ink. That is why
on a light ground the secondary is `ink-mute` and the ornament `ink-soft`, and
on a dark ground the two swap. `ink-faint` is the ornament escape hatch on
either side — **never body copy**.

Every ink resolves through a **BRAND token and nothing else** — one level of
indirection, so a second brand repaints every ink by overriding brand tokens
alone. There is no second token layer; defining any `--on-…` or `--ink-…`
property is a gate failure (flow 8b). `--soft` and `--faint` are the two
reconciled neutrals: `--soft` replaced the whole `--ink-wNN` ramp *and* the
`--ink-media-mid`/`-cool` pair, pinned to the value that was actually measured
(4.58:1 against the worst ground the scrim contract allows).

### The pairing rulebook — CATEGORICAL. Strength never matters.

- **On light grounds** (`white` / `soft` / `mute` / `primary-soft` / `accent-soft`):
  headlines + body `ink-primary` · secondary `ink-mute` · accent moments
  `ink-accent` · ornaments `ink-soft`.
- **On dark grounds** (`primary` / `dark` / the whole glass ladder):
  headlines + body `ink-white` · secondary `ink-soft` · accent moments
  `ink-accent-soft` · ornaments `ink-mute`.
- **On `surface-accent`**: the dark rules, EXCEPT accent-role elements, which go
  `ink-white` (blue on blue is not a hierarchy).
- **On `surface-image`**: the ink follows the **OVERLAY'S COLOUR** — the author's
  declared intent. `ov-dark`/`ov-primary` under the text ⇒ the light ink family;
  `ov-white` ⇒ the dark family. Categorical, regardless of the overlay's
  strength. Number units (`ds-num-unit`) over media go `ink-white`, same as
  their number. **Two roles ignore the overlay and are always `ink-white` —
  see the media exception below.**
- **On `surface-clear`**: resolve through to the nearest real ground.

#### The media exception — the one override the table takes

> **"any eyebrow on media, any text-only link on media is white."**
> — Hakan, 2026-09-04

On a **media** ground — `surface-image`, which is what `card-media` and every
other photo/video ground declares — two atoms lose their accent family
whatever the wash resolves to:

| role | class(es) | light | solid dark / `surface-accent` | **media** |
|---|---|---|---|---|
| eyebrow | `.ds-eyebrow` | `ink-accent` | `ink-accent-soft` / `ink-white` | **`ink-white`** |
| text-only link | `.btn-text`, `.be-link` | `ink-accent` | `ink-accent-soft` / `ink-white` | **`ink-white`** |

This **supersedes** the earlier hero/opener phrasing by widening it: the
trigger is the ground's PAINT, not the component's name. Off media both atoms
are ordinary **accent-role** elements and always were — this is not a new axis,
it is the row of the table they already read.

**Solid dark is unchanged**: `ink-accent-soft` stays legal there, and so does
the standing hero-eyebrow-white ruling. Choosing between two legal inks is the
author's call.

**Not text links** (so not covered): `.art-c-link` is the whole clickable card,
and `.bc-link` / `.sn-link` / `.fo1-link` / `.ds-skip-link` are navigation
chrome. Hand-rolling a new text+arrow link instead of composing `.btn-text` is
drift (see § atoms) — and it is also how a link escapes this rule, so don't.

Machine-readable in `assets/js/ds-palette.js` § 4b (`ATOM_ROLE`,
`MEDIA_ROLE_INK`, `inkForAtom()`); enforced by `verify.mjs` §8d (blocks) and
§8f (pages), which FAIL an accent-family **or un-inked** eyebrow/text-link on
media — `.ds-eyebrow` and `.btn-text` both default to `var(--blue)`, so
omitting the ink paints accent just as loudly as declaring it.

`surface-glass-75` pairs exactly like `surface-primary`. A strength class never
changes which ink is legal — only how loud the ground is.

**A ground declares its own default ink** (`color:` on the surface itself).
That is not a context rule — it is the word rendering as declared, and
inheritance then serves every child that does not override it. What is
forbidden is a ground reaching DOWN a combinator to repaint content.

### Modes (surface-only — no ink or overlay twin)

`surface-image` (the ground IS the photo the markup names via `data-bg`),
`surface-clear` (the NULL surface: paints nothing, inherits everything),
`surface-glass` + `-25/-50/-75` (frosted white over what is behind it; the same
recipe at heavier fills — dark-context only).

`surface-accent2` stays **RESERVED**: named so nobody invents a different
spelling, defined nowhere. The gate fails if ds.css ever defines it.

### A self-painting panel DECLARES its ground

The old LIGHT ISLANDS rule is gone. A card, table wrapper, modal panel or
dropdown that paints itself an opaque light box must say so in the markup —
`card-panel surface-white`, `tbl-wrap surface-white` — because that fact is
what tells the pairing rulebook (and the gallery, and the next author) which
ground its text stands on. 268 panels across 49 blocks now do.

### Deprecated spellings — inert aliases, sweep-delete after the estate audit

`surface-grey`→`surface-soft`, `surface-grey-2`→`surface-mute`,
`surface-navy`→`surface-primary`, `surface-blue`→`surface-accent`,
`ov-black`→`ov-dark`, `ov-blue`→`ov-accent`, and the whole
`type-navy`/`text-navy`/`type-blue`/`text-blue`/`type-blue-soft`/
`text-blue-pale`/`type-white`/`type-mid`/`type-muted` family plus
`on-surface`/`on-surface-mid`/`on-surface-faint`/`on-surface-border`/`on-light`
→ the palette inks. Each alias is pinned to what that spelling rendered on a
LIGHT ground, so a page still carrying one looks identical until the audit
rewrites it. What they no longer do is **FLIP**. The gate WARNs on them in
first-party pages and FAILS on them in blocks.

**`type-*` is SCALE, WEIGHT and SPACING only.** It has no colour duty left.

Hairlines: `--on-surface-border` is gone. A rule follows the element's OWN
declared ink — `color-mix(in srgb, currentColor 14%, transparent)` — which is
light-on-dark or dark-on-light for free and within a point of both values it
replaced. Markup that needs one by hand writes `border-ink`. (Chosen over a
`border-soft`/`border-mute` pair because a palette-named pair would have
re-introduced a ground-dependent choice for something that can simply follow
the declared ink.)

### The one sanctioned same-element compound

`.cmp-x.surface-y { … }` — a component styling ITSELF according to the ground
it was given — is legal, because no content is being repainted. The moment a
combinator appears (`.cmp-x.surface-y .child`), it is a context rule and the
gate fails it. Today exactly one component uses the allowance:
`.cmp-world-map:is(.surface-primary,.surface-dark)` retints its own artwork,
and it also exposes the same control to markup (the Map ink axis).

## Ink is always an opaque colour
**Text inks are OPAQUE COLOURS, never alpha (RULING, Hakan, 2026-09-03: "NO
TEXT should have ALPHA as option. Let them be colors."). Hierarchy comes from
the colour ramp, weight and size; alpha stays for non-text paint.**

Scope is exactly the declarations that SET an ink — `color` and
`-webkit-text-fill-color`. Scrims and `ov` overlays, glass fills, borders,
shadows and backgrounds keep their alpha: that is paint, not ink. Element
**`opacity:` is out of scope too** (carve-out, same day): state dimming and
structural animation on text-bearing elements — inactive timeline steps,
dimmed carousel slides, reveals, cross-fades — stay as they are.
`scripts/verify.mjs` flow 5 fails any ink declared with `rgba()`/`hsla()`, an
8-digit hex, a slash-alpha, or `color-mix(…, transparent)`.

**The ramp is gone.** `--ink-w30 … --ink-w85`, `--ink-media*` and the whole
`--on-surface*` layer were DELETED by the colour law the same day: they existed
only so CSS could resolve an ink by context, and nine palette ink classes
replaced all of them. The nine are opaque by construction, so this rule is now
enforced at the vocabulary rather than per declaration. See *The palette*.


## Section headers own their row
The header is `.section-head` / `.section-head-sm` and it carries its own
layout. **Every header carries the full alignment axis** (2026-09-01):
default = left, `.is-center` (centred), `.is-right` (end-aligned, RTL-aware),
`.is-split` (headline left, `<p class="sh-lead">` right). A trailing
"View all …" link is a **`.sh-action` child of the header**, never a sibling
in a wrapper row around it.

**Never wrap a `.section-head` in a bespoke flex row.** A wrapper makes the
header a flex item it cannot escape, so `.is-center` / `.is-split` — and the
gallery's Header control — silently do nothing (this is exactly how
markets-articles and events broke). Put the row class ON the header instead:

```html
<div class="section-head-sm ma-head is-split">   <!-- ma-head MODIFIES, not wraps -->
  <div class="ds-stack measure">…eyebrow, headline, copy…</div>
  <a class="ma-viewall sh-action" href="#">View all insights</a>
</div>
```
The component class may then only tune the row (gap, `align-items`) — if it
re-declares `display:flex`, the variants can't switch layout again. The verify
gate fails a header wrapped in a row that also holds a link or button.

Split needs two groups: a header that is only an eyebrow + headline has
nothing for the right column, and the gallery marks its Split option `n/a`
rather than offering a no-op.

## Dark surfaces — RETIRED (2026-09-03)
The flip/island machinery this section described is **deleted**: 190 context
rules, the LIGHT ISLANDS group and the whole relative-ink token layer. Nothing
adapts by context any more, so there is nothing here to describe. A dark
composition is written as a dark composition — see *The palette* above, and
run `/audit.html` per brand for the contrast sweep the gate cannot do.


## The card model (2026-09-02, Hakan)
A card is **three independent axes**, never a component variant:

```
cd-card                      ← IDENTITY: the per-card class (universal, 354/354)
  card-panel | card-media    ← LOOK: bounded panel | image-as-card-background
    surface-white(default) | surface-grey | surface-grey-2 | surface-primary |
    surface-accent | surface-clear | surface-glass(-25/-50/-75)
                             ← PAINT via the SURFACE system
    + is-tile | is-flat | is-hover                    ← FINISH: border + elevation
  + .ov family on media      ← the scrim (tone × strength ov-30..90 × shape)
  + engine axes on the root  ← BEHAVIOUR stays on .cmp-cards (hover, cols)
```

**FINISHES vs PAINTS — the rule that keeps the axes independent (Hakan).**
`is-tile` / `is-flat` / `is-hover` are FINISH and behaviour only: border and
elevation, never a fill. **ALL colour comes from a `surface-*` class.** So the
soft grey tile is `card-panel surface-grey is-tile`, and the identical finish
over a dark paint is `card-panel surface-primary is-tile` — which was impossible
while `is-tile` still smuggled `--card-fill: var(--light)` in. A finish sits at
(0,2,0) and so still out-ranks the surface's `border-color`: that is the point —
the surface supplies the fill and the ink, the finish takes the rule and the
shadow away.

**Absence of a look class = BOXLESS.** A bare `cd-card` is content sitting on
the section — the model's null case, not an oversight. Cards — Plain, People,
List and Testimonials ship that way deliberately.

**The paint table.** One decision, one place; every row works on ANY section
surface:

| You want | Write | Ink |
| --- | --- | --- |
| the everyday white panel | `card-panel surface-white` | `ink-primary` |
| a soft tile | `card-panel surface-soft is-tile` | `ink-primary` |
| the deeper tile | `card-panel surface-mute is-tile` | `ink-primary` |
| no shadow | `card-panel surface-white is-flat` | `ink-primary` |
| a lifting link card | `a.card-panel surface-white is-hover` | `ink-primary` |
| a dark card | `card-panel surface-primary` (or `surface-accent`) | white |
| a dark card with no rule/shadow | `card-panel surface-primary is-tile` | white |
| an outline-only card | `card-panel surface-clear` | inherited from the section |
| a frosted card on dark | `card-panel surface-glass` | white |
| a stronger frost | `card-panel surface-glass-25` / `-50` / `-75` | white |
| the image as the card | `card-media` + `.media-cover` + `.ov` | white |
| nothing — boxless | `cd-card` alone | inherited from the section |

The glass family is **dark-context only** — its ink is white at every strength,
so `surface-glass-75` (a three-quarter white fill) belongs over a photo or a
navy ground and nowhere else; run `/audit.html` when you reach for it.

**Behaviour is the engine's, not the card's.** Hover (`is-hover-zoom` /
`is-hover-lift` / `is-hover-fill` / `is-hover-none`) and column count
(`is-cols-*`) go on the `.cmp-cards` root. Never put a behaviour axis on a card.

**The scrim rides the media, not the card.** `card-media` gets a `.media-cover`
child for the picture and an `.ov` child for the wash — `.ov` + shape
(`ov-tint|scrim|gradient-b/t/l/r|vignette|radial`) + tone + `.ov-NN` strength.
`card-media` already makes its ink white, so the content needs no colour classes.

**Why `:where()` — the load-bearing detail.** `card-panel`'s *geometry* (radius,
border width/style, padding) sits at class specificity; its *paint* (background,
`border-color`, `box-shadow`) and its whole ink-token set sit in a
`:where(.card-panel, .ds-card)` rule at **zero** specificity. So any `surface-*`
class on the SAME element (0,1,0) replaces all of it in one move, regardless of
cascade position — and unpainted, every value resolves to the old `.ds-card`
value, which is why a panel that means "light box" must SAY SO — `card-panel surface-white` — with no ancestor rule at
all**. Two consequences to respect:
- Never put a colour in the geometry rule. A LOOK class that also painted would
  out-rank the PAINT class on the same element and `card-panel surface-primary`
  would render white. (It did, once, during this very migration.)
- The LIGHT ISLANDS zone is GONE (2026-09-03). A panel no longer relies on a
  CSS rule to keep its light ink inside a dark section: it DECLARES its ground
  (`card-panel surface-white`), and the pairing rulebook — plus the gallery's
  recomposer and the gate — reads that declaration. 268 self-painting panels
  across 49 blocks were migrated in the same change.

**Panels outside the cards engine** (calculator results, modal bodies, feature
tiles) are `card-panel` with **no** `cd-card` — `cd-card` is the cards engine's
identity class and means nothing on its own.

**Legacy / aliases.** `.ds-card` is a compat alias of `.card-panel`, grouped into
every rule, pixel-identical — do not author it. `.card-clear` (and its
`is-fill-25/50/75` glass ladder) still works but is superseded by
`card-panel surface-clear` / `card-panel surface-glass(-25/-50/-75)`;
sweep-delete. `.is-grey` is likewise a deprecated alias — it is the one finish
modifier that still carries a fill, kept only so untouched markup renders;
write `card-panel surface-mute is-tile`. `surface-primary p-6`-as-card-paint is
dead: the surface goes on a `card-panel`, which supplies the padding token.

## surface-image: the image comes from markup, never CSS
`.surface-image` is a MODE, not a palette word: the ground IS the picture, and the ink follows the OVERLAY'S COLOUR (see the pairing rulebook).
the picture itself ALWAYS comes from `data-bg="…"` on the section — never from a
CSS `url()` and never from themes.css. Each brand's page references its own
asset in markup (ENBD `bento-bg-placeholder.svg`, EI `bento-bg-ei.svg`, …); the
gallery harness stamps the active brand's preview asset when the option is
picked. The verify gate fails any `url()` inside a `.surface-image` rule or
anywhere in themes.css. This applies to EVERY component that gains a
"Background Image" surface option in the future.

## Illustrations — two capabilities, chosen per use-case (2026-09-03, Hakan)
Illustrations ship as **CONTENT** — a media/JSON upload — **never as per-piece
code**. On the CMS, code ships ~monthly and pages ship ~10x a day, so an
illustration that needs a code deploy is a broken illustration. This
generalises the device-mock PNG rule: the baked asset **is** the artwork, and
nothing is rebuilt in the DOM on top of it. The full ruling (rationale, encode
rules, export rules) is **`docs/audits/page-fix-map.md` → Addendum 3
"ILLUSTRATION DOCTRINE"** — read it there, it is not duplicated here.

There are exactly **two** sanctioned capabilities, picked per use-case and
timeline at authoring time (neither is the default):

| | **Lottie** (`blocks/lottie.html`) | **Illustration video** (`blocks/illustration-video.html`) |
|---|---|---|
| asset | `assets/lottie/*.json` + a poster PNG | chromeless MP4 + a poster |
| for | drawn vector work | rendered / textured / 3D work |
| background | transparent — one file, every surface | **baked flat face** — one file per surface |
| wiring | `data-behavior="lottie"` (recipe in ds.js) | none — plain `<video class="media-cover">` |
| player | vendored **lottie-web 5.12.2** (`assets/js/lottie_light.min.js`, SVG-renderer "light" build), lazy-loaded by ds.js on first sighting — pages never carry a `<script>` | the browser |

Load-bearing rules for both: a **poster is mandatory** (it is the
reduced-motion state, and ds.js globally stands autoplay+loop videos down to
their poster); baked video needs **BT.709 colour tags** and carries the target
surface in its **filename**; never bake against a gradient or image surface;
and **the engine never mirrors** — a directional animation needs a mirrored
export, exactly like a directional image. DOM-built mock UIs stay banned.
Upgrading the vendored player means replacing the file **and** the version
recorded in its header comment and in the table above.

## Reveal gotcha
Put `data-reveal` on **content** (eyebrow, headline, copy, decorative tiles), not
on the **root of an interactive component** (accordion/tabs/carousel) — gating
functional UI behind a reveal risks it staying invisible if the reveal doesn't
fire. Reveal the heading; leave the interactive body visible.

## Dynamic injection (CMS/SPA)
After inserting markup at runtime, call `DS.refresh(scope)` to wire the subtree.

## Scaling Tier-3 recipes (decision)
Foundation + common cores (reveal, tabs, accordion, carousel, modals, scroll-frames,
zoom-parallax) stay in the single `ds.css` / `ds.js`. Bespoke Tier-3 recipes
(WebGL/GSAP/canvas) currently also live appended in `ds.js` + `ds.css`. **Once they
grow heavy or exceed ~15–20**, split each into its own file —
`assets/js/recipes/<name>.js` + `assets/css/recipes/<name>.css` — and have `ds.js`
**lazy-load** a recipe module the first time it sees a `[data-behavior="<name>"]`
that isn't registered yet (dynamic `import()` of the matching file). Heavy libs
(GSAP, three, cobe) are likewise loaded once on demand by the recipe that needs
them, never globally. This keeps every page paying only for the recipes it uses.

## Composition cards (2026-08-28)
The gallery shows what is **doable** — a card does not imply a component
class register. A recurring pattern built purely from atoms/existing
components ships as a **composition card**: a `blocks/<name>.html` demo
(root keeps the REAL classes — a plain `cmp` band, or an existing
`cmp-*` + modifiers), an `ALIAS: null` (or → the real component) in
verify.mjs, a catalog entry and dossier. The card is the **canonical form**
of the pattern: pages copy it verbatim, which keeps instances consistent
without new CSS. Mint an actual component only when the pattern owns real
anatomy. Precedents: filter-grid (kicker-cards + data-filter), people-grid
(cards-thumb-nobox + modal skin), market-band (band + badges).

**AUDIT-PASS ITEM (Hakan, 2026-08-28): no anonymous roots.** A bare
`class="cmp surface-*"` root is a gap — even a generic composition should
carry a generic content cmp class (name to be decided in the audit, e.g.
`cmp-content`), so every section is identifiable to the gate and the audit
differ. Affects the pattern-kit ALIAS-null blocks (cta-band, ways-to-accept,
market-band, the payment-UI set, …) and their page instances; the ALIAS-null
mechanism then retires.

## Component naming (Hakan, 2026-09-01)

Names are DESCRIPTIVE of the anatomy, never of the purpose — a component
named for a use case reads as unusable for every other one. "Synced
Slider", "Statement + Stats", "Illustration Split" — not "Video
Showcase", "About Statement", "Insight Split". Purpose lives in
`whenToUse`; the name says what the thing structurally IS, so authors
reach for it for ANY content.

Two tiers: this rule binds COMPONENTS (the shells — Cards, Tabs,
Accordion, Hero, Synced Slider…). COMPOSITIONS may carry pitch-flavored
names (Cards — Testimonials, Cards — Promo, Hero — Editorial, Tabs —
Experience): a composition already demonstrates one use of a descriptive
shell, so its name may say which one.

## Columns doctrine (2026-09-01, Hakan)
Section-level column counts are AXES, never bespoke CSS: an `is-cols-N`
modifier on the component root (exposed as the gallery Columns control), with
opinionated responsive standdowns baked into each mode. Per-breakpoint intent
is an explicit override class (`is-m-cols-1/2` for mobile — the Mobile columns
control; cmp-bento's `is-t-full/is-t-half` are the tablet precedent). Dividers must be
column-agnostic: START-edge borders per cell with first-row/first-column
suppression per mode (transparent cells — any surface, no artifacts on
partial rows). The gap-trick (gap over border-colored background) is only
for grids that are always full (e.g. kt-grid).

## Marker classes (2026-09-01, Hakan)
Every block root carries an identifying class — a `cmp-*` component class, or
for pure-atom compositions a bare MARKER class matching the slug (e.g.
`cmp market-band`, `cmp cmp-cards stats-row`). Zero CSS may hang off a marker;
it exists so instances are greppable for pages, the gate and the sweep.
Anonymous roots (`cmp surface-…` with nothing else) are banned.
