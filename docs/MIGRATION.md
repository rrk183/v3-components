# The sweep guide (/page-fix spec) — old estate → atom vocabulary

The elements were standardized first (2026-09-01, approved by Hakan: "fix the
elements; pages get swept later via a documented guide"). This document IS that
guide — and the SPEC for the future `/page-fix` command: a mechanical sweep
that walks every canonical page, recognizes legacy components, extracts their
real content, and re-emits it as atom/composition markup. A fresh agent with
only this doc + the gallery blocks in `blocks/` must be able to transform a
page section correctly. Every RECOGNIZE selector and EXTRACT class below was
verified against the legacy block files on 2026-08-31; anything not verified
is marked TODO — never guess.

## 1 · Doctrine

- **Tokens → atoms → compositions → components.** Tokens (semantic tones
  `--ok/warn/danger/info-*`, surface tokens `--on-surface*`, the radius scale
  `--r-xs…--r-pill`) paint atoms; atoms (`.btn`, `.badge`, `.chip`,
  `.icon-tile`, `.ds-num`, `.card-panel`/`.card-media`, `.media-cover`, `.ov`,
  `.meta-dot`, `.list-check`, `.type-*`, `.field`/`.check`/`.radio`/`.switch`)
  compose into card patterns; a component class owns only what atoms cannot
  (collection layout, the card frame). Components add THIN skins only
  (custom-prop overrides like `--it-fill`/`--it-ink`), never re-implementations.
- **Minimize CSS.** The sweep's whole point: every section moved onto atoms is
  a legacy ds.css zone that can be deleted (§6). No raw hexes, no literal radii.
- **Markers, not classes.** A card composition is `cmp-cards cards-<comp>`
  (e.g. `cmp-cards is-hover-zoom cards-thumb`) — the `cards-<comp>` marker
  identifies the composition to the gate/audit but carries no CSS. Never mint
  a new card class; a new look is a new composition of atoms on the same root.
- **Tag-agnostic titles.** The tag is semantics (one `<h1>` per page); the
  `.type-*` class alone sets size. Sizing a heading by bare tag is drift.
- **Two-axis surfaces & overlays.** Section axis: `.surface-white|grey|navy|
  dark|blue|image` + flips vs LIGHT ISLANDS (`.on-light` or island-by-
  construction). Card axis (THE CARD MODEL, 2026-09-02): LOOK = `.card-panel` (bounded panel,
  +`is-tile`/`is-flat`/`is-grey`/`is-hover`) or `.card-media` (image IS the
  card); PAINT = a `surface-*` class on the SAME element; FINISH = the `is-*`
  modifiers, which carry border + elevation and NEVER a fill (so the grey tile
  is `card-panel surface-grey is-tile`, and `.is-grey` is a deprecated alias of
  `surface-grey-2 is-tile`); absence of a look class = BOXLESS. Unpainted panels are opaque light islands. Overlays: `.ov` +
  type (`ov-tint|scrim|gradient-b/t/l/r|vignette`) + colour + `.ov-NN` alpha.
- **Pages are CSS/JS-free.** Classes + `data-*` only; no `<style>`, no
  `<script>`, no `id=` (except modal-overlay targets for `data-modal-open`),
  no inline `style=` except `style="--var:…"` custom-property passing;
  images via `data-bg`. Logical properties / `[dir="rtl"]` zone handle RTL —
  blocks never carry RTL classes.

## 2 · The transform loop (how /page-fix processes one page)

1. **`<style>` grep FIRST.** Grep the page for local `<style>` blocks. Any
   hit whose rules touch a legacy class being replaced (any RECOGNIZE selector
   or ledger class below) ⇒ the WHOLE page is JUDGE — stop, report, move on.
   Page-local CSS is the biggest drift source; it must be mapped to
   atoms/tokens by a human-reviewed pass, not swept mechanically.
2. **Parse sections top-to-bottom.** Each `<section class="cmp …">` (and each
   page-level `.cmp-modal`) is one unit.
3. **Recognize** against the recipe table (§3). Match on the RECOGNIZE
   selector (root class or signature child, e.g. `.pos-ways` under an
   anonymous `cmp` root).
4. **Extract slots.** Pull the real content per the recipe's EXTRACT map —
   text, hrefs, `data-bg` paths, `<img>` src+alt, svgs, aria-labels, counts,
   column/modifier state. Content is sacred; markup is disposable.
5. **Emit** the target template: copy the named `blocks/<slug>.html` block
   (the block file IS the template — never re-derive it from memory), place
   the page's content into the template's slots, carry over root modifiers
   (`is-cols-*` from the old layout, `surface-*` from the old section,
   `data-animate`, `data-autoplay`), keep `data-reveal` stagger patterns.
6. **Unknown/custom sections stay untouched** — and are listed in the page's
   report. A section with no recipe is not an invitation to improvise.
7. **Gate.** `node scripts/verify.mjs` — zero NEW failures. Screenshots at
   1280 / 768 / 375 compared against the pre-sweep page. RTL spot-check
   (`?dir=rtl` / the AR preview) — arrows, floats, paddings.
8. **Record payoff** (§6): per-page byte delta + which legacy zones this page
   no longer references.

## 3 · Recipes

21 recipes: 20 AUTO, 1 JUDGE (carousel-center). Estate reach counts are from
`grep -l '<root-class>' *.html` on 2026-08-31 (the `cmp-cards-thumb` count
includes `-box`/`-nobox` substring matches).

### highlights-tiles → cards-icon  [AUTO] — 39 pages
- RECOGNIZE: `.cmp-highlights-tiles`; grid `.ht-grid > .ht-tile`.
- EXTRACT: header `.section-head.is-center.ht-head` (h2 `type-h1` + `.sh-lead`
  — no eyebrow in the shipped block); per tile: `.ht-icon` svg · `.ht-tile-title`
  · `.ht-tile-body`; tile count; Tailwind cols (`grid-cols-1 sm:2 lg:4` = 4-up).
- EMIT: `blocks/cards-icon.html` (root `cmp-cards cards-icon`). Tile →
  `.cd-card.card-panel.surface-grey.is-tile > .ds-stack >` `.icon-tile`(svg) +
  `h3.type-h6.type-navy` + `p.type-body-sm.on-surface-mid`. 4-up = default
  cols (no `is-cols-*`); keep `is-center` on the header; surface carries over.
- NOTES: `.ht-icon` svgs already use `fill="currentColor"`/`currentColor`
  strokes, so `--it-ink` applies. Carousel form: `blocks/cards-icon-carousel.html`.

### kicker-cards → cards-kicker  [AUTO] — 13 pages
- RECOGNIZE: `.cmp-kicker-cards`; `.kc-grid > .kc-card`.
- EXTRACT: header eyebrow/h2/lead (`is-split` in the block); per card:
  `.kc-kicker` (optional; a WORD like "Scale" or a number like "01") ·
  `.kc-title` · `.kc-body`; count (3-up default).
- EMIT: `blocks/cards-kicker.html` (root `cmp-cards cards-kicker is-cols-3`).
  Card → `.cd-card.card-panel > .ds-stack >` `span.type-eyebrow.type-blue`
  (kicker) + `h3.type-h6.type-navy` + `p.type-body-sm.on-surface-mid`.
- NOTES: a NUMBER kicker ⇒ emit the cards-number template instead
  (`.ds-num.is-sm`). kc cards were self-painted white; `card-panel` restores the
  light-island contract for free.

### services-grid → cards-number  [AUTO] — 2 pages
- RECOGNIZE: `.cmp-services-grid`; `.sg-grid > article.sg-card`.
- EXTRACT: header `.sg-head` (centered: `.ds-eyebrow` + h2 + `.sg-sub`); per
  card: `.sg-num` (01–06) · `.sg-card-h` · `.sg-card-p` · `.sg-chips > .sg-chip`×n.
- EMIT: `blocks/cards-number.html` (root `cmp-cards cards-number is-cols-3`).
  Card → `.cd-card.card-panel > .ds-stack >` `span.ds-num.is-sm` +
  `h3.type-h6.type-navy` + `p.type-body-sm.on-surface-mid`; the `.sg-chip` tag
  row → `span.chip` atoms in a `flex flex-wrap gap-2` utility row appended to
  the stack. Header → `.section-head.is-center` + `.sh-lead`.
- NOTES: services-grid's floating corner number badge DROPPED by decision —
  the number becomes the in-flow `ds-num` kicker.

### how-it-works-steps → cards-number  [AUTO] — 6 pages
- RECOGNIZE: `.cmp-how-it-works-steps`; `ol.hiw-steps > li.hiw-step`.
- EXTRACT: header (eyebrow + `h2#hiw-heading` + measure lead); per step:
  `.hiw-step-marker > .hiw-step-n` numeral · `.hiw-step-content >`
  `.hiw-step-h` · `.hiw-step-p` · `ul.hiw-step-list` bullets; foot
  `.hiw-cta > .btn.btn-navy`.
- EMIT: `blocks/cards-number.html`. Step → `.cd-card.card-panel > .ds-stack >`
  `.ds-num.is-sm` + `h3.type-h6.type-navy` + `p.type-body-sm.on-surface-mid`
  + bullets as `ul.list-check` (slots are free atoms — the card composition
  contract). CTA foot → utility row `div.flex.justify-center.mt-10` +
  `a.btn.btn-filled` (the cards-partners foot precedent). Drop the
  `id`/`aria-labelledby` pair → `aria-label` on the section (pages are ID-free).
- NOTES: vertical numbered rail → card grid is the approved re-expression
  (same decision row as services-grid). Long step copy makes tall cards —
  flag such pages in the report for an eyeball pass.

### pillar-grid → cards-icon-linked  [AUTO] — 12 pages
- RECOGNIZE: `.cmp-pillar-grid`; `.pg-grid > a.pg-card`.
- EXTRACT: header (`.ds-stack.section-head.measure`: eyebrow/h2/lead); per
  card: `href` + `aria-label` · `.pg-icon` svg · `.pg-name` · `.pg-desc` ·
  `.pg-go` link text; foot `.pg-cta > .btn.btn-navy`.
- EMIT: `blocks/cards-icon-linked.html` (root `cmp-cards cards-icon-linked
  is-cols-3`). Card → `a.cd-card.card-clear > .ds-stack >` `.icon-tile`(svg) +
  `h3.type-h6.on-surface` + `p.type-body-sm.on-surface-mid` +
  `span.btn.btn-text.mt-1` (pg-go text; the template's arrow svg replaces the
  legacy inline arrow). Foot → `flex justify-center mt-10` + `a.btn.btn-filled`.
- NOTES: match the old column count when it differs from 3 via the column
  tokens (`style="--cd-cols:N"`); `is-cols-*` is sugar over the same tokens.

### ways-to-accept → cards-icon-linked  [AUTO] — 18 pages (`pos-way`)
- RECOGNIZE: `.pos-ways > a.pos-way` — the ROOT is an anonymous
  `section.cmp` (no cmp-* class), so match on the child.
- EXTRACT: header (eyebrow/h2/`.sh-lead`); per card: `href` · `.pos-ico` svg ·
  bare `h3` · bare `p` · `.more` link text (strip the literal `→` entity).
- EMIT: `blocks/cards-icon-linked.html` — same per-slot placement as
  pillar-grid above; the `.more` text becomes the `btn btn-text` label.
- NOTES: this sweep also fixes the "no anonymous roots" audit item for these
  sections — the emitted root is `cmp cmp-cards cards-icon-linked …`.

### process-cards → cards-steps  [AUTO] — 2 pages
- RECOGNIZE: `.cmp-process-cards` / `[data-behavior="process-cards"]`;
  `.ps-cards > .p-card`.
- EXTRACT: header `.ps-head` (`.ds-eyebrow` + `.ps-h2` — flatten the
  `.ps-grad` gradient span to plain text — + `.ps-sub`); per card:
  `.p-pill.p-step` chip text ("Step 01") · `.p-h` title — CONCATENATE the
  per-letter `.p-word > span[style="--i:n"]` spans back to plain text ·
  `.p-num` · `.p-pill.p-title` word.
- EMIT: `blocks/cards-steps.html`. Card → `.cd-card.card-clear >` top row
  `div.flex.items-center.justify-between.w-full` (`span.chip` "Step 01" +
  arrow svg in `span.on-surface-mid`) + `h3.type-h6.on-surface.mt-4` +
  `span.ds-num.is-lg.mt-auto.pt-8`.
- NOTES: scroll fan-in entry + gradient hover + per-letter blur are NOT
  carried — future `data-behavior` option (Hakan). The `.p-title` word pill
  ("Discover") has no slot in the composition — the shipped template already
  drops it for the same source content; drop and report.

### case-study-card → cards-case-study  [AUTO] — 1 page
- RECOGNIZE: `.cmp-case-study-card`; `.csc-grid > article.csc > a.csc-link`.
- EXTRACT: header (is-split eyebrow/h2/lead); per card: `href` ·
  `.csc-img[data-bg]` · `.csc-tag` · `.csc-title` · `.csc-meta > span`×n ·
  `.csc-read` hover CTA.
- EMIT: `blocks/cards-case-study.html` (root `cmp-cards is-hover-zoom
  cards-case-study is-cols-3`). Card → `a.cd-card.card-panel` +
  `style="--card-pad:0"` > media `span.relative.block.aspect-[3/2]`
  (`.media-cover[data-bg]` + `span.chip.absolute.bottom-3.start-4.z-10` tag)
  > body `div.p-6.flex.flex-col.items-start.gap-3` (`h3.type-h6.type-navy` +
  `p.meta-dot > span`×n). `aria-label` from the title.
- NOTES: `.csc-read` hover-reveal CTA dropped — the whole card is the link;
  add a `btn btn-text` only if the page needs a visible CTA.

### people-grid → cards-people  [AUTO] — composition demo (nobox `is-portrait`)
- RECOGNIZE: `.cmp-cards-thumb-nobox.is-portrait` whose cards are
  `button.ct-card[data-modal-open]`, paired with `.op-modal` overlays.
- EXTRACT: header; per person: `.ct-img[data-bg]` photo · `.ct-title` name ·
  `.ct-desc` role · `data-modal-open` id; the page-level `.cmp-modal` block
  with `.modal-overlay#<id> > .modal-content.op-modal` bios.
- EMIT: `blocks/cards-people.html` (root `cmp-cards is-hover-zoom
  cards-people`). Card → `button` carrying the template card classes
  `cd-card justify-end` + `style="--cd-min: clamp(420px,36vw,520px)"` + the
  button-reset utilities from people-grid (`appearance-none border-0
  bg-transparent p-0 m-0 text-left cursor-pointer [font:inherit]`) >
  `span.media-cover[data-bg]` + `span.ov.ov-gradient-b.ov-90` > body
  `div.relative.z-10.p-6.flex.flex-col.items-start.gap-1.5`
  (`h3.type-h6.type-white` name + `p.type-caption.type-muted` role +
  `span.btn.btn-outline-light.btn-sm.btn-pill.mt-3` "View profile").
- NOTES: modal bios stay `cmp-modal` `.op-modal` UNCHANGED. Modal-overlay
  `id=` targets are the one sanctioned id (the `data-modal-open` contract).

### people-carousel → cards-people (carousel)  [AUTO] — 10 pages
- RECOGNIZE: `.cmp-people-carousel`; `.pc-track > article.pc-card`.
- EXTRACT: `.pc-head` (ds-stack eyebrow + h2, plus the tab rail
  `.pc-tabs > button.pc-tab[data-tab]`); per `[data-panel]` `.pc-panel`: a
  `data-carousel` of cards — `.pc-photo[data-bg]` (+its aria-label) ·
  `.pc-name` · `.pc-role`; `.pc-arrows > .pc-arrow[data-carousel-prev/next]`.
- EMIT: cards-people cards (as above, no View-profile pill — legacy has none
  and slots are optional) on the carousel frame from
  `blocks/cards-carousel.html`: `.cd-carousel[data-carousel] >
  .cd-track[data-carousel-track]` + `.cd-arrows` (`.cd-dots[data-carousel-dots]`
  + `btn btn-accent btn-icon btn-pill` prev/next). Keep the
  `data-tabs`/`data-tab`/`data-panel` wiring: one cd-carousel per panel.
- NOTES: tab rail buttons → `chip chip-lg` + `data-tab` (the
  `.sac-aud-tab → chip chip-lg` precedent, §3b; selected =
  `.active`/`aria-selected`).

### partner-logos → cards-partners  [AUTO] — 1 page
- RECOGNIZE: `.cmp-partner-logos`; `.pl-grid > .pl-item`.
- EXTRACT: header (eyebrow + h2, no lead); per item: `.pl-tile > img`
  (src + alt) · `.pl-name` · `.pl-sub`; foot `.pl-foot > .pl-link` text.
- EMIT: `blocks/cards-partners.html` (root `cmp-cards cards-partners`).
  Item → `.cd-card.card-panel.is-flat > div.flex.flex-col.items-center.
  text-center.gap-2 >` logo well `span.flex.items-center.justify-center.
  min-h-[72px].w-full > img.max-h-10.w-auto` + `h3.type-h6.type-navy` +
  `p.type-caption.on-surface-mid`. Foot → `div.flex.justify-center.mt-10 >
  a.btn.btn-text`.
- NOTES: logos stay real `<img>` with a real alt — never a wordmark
  rebuilt in SVG.

### tombstone-grid → cards-tombstones  [AUTO] — 7 pages
- RECOGNIZE: `.cmp-tombstone-grid`; `.tomb-grid > article.tomb-card`.
- EXTRACT: header; count row `.tomb-head` (count + `.tomb-legend`); per card:
  optional `.tomb-esg` pill · `.tomb-logo > img` (src/alt/width/height) ·
  `.tomb-body > .tomb-amount` + `ul.tomb-lines > li`×n + `.tomb-foot >
  .tomb-country`/`.tomb-date`; `.is-text` marks the no-logo variant.
- EMIT: `blocks/cards-tombstones.html` (root `cmp-cards cards-tombstones`).
  Card → `article.cd-card.card-panel.is-flat >` [optional
  `span.badge.badge-ok.badge-sm.absolute.top-3.end-3.z-10` ESG] + logo well
  `div.flex.items-center.justify-center.min-h-[104px].mb-4 >
  img.max-h-[72px].w-auto` + `p.type-h5.type-navy` amount +
  `ul.type-body-sm.on-surface-mid.mt-2.flex.flex-col.gap-1` lines +
  `p.meta-dot.border-t.pt-3.mt-auto > span` country/date. Text-only deal
  (`.is-text`) = same card minus the logo well.
- NOTES: the `.tomb-head` count/legend row has no slot in the composition —
  TODO: re-express as a utility row (`type-body` count + `badge badge-ok
  badge-sm` legend) or drop; confirm with Hakan on first hit.

### key-transactions → cards-tombstones  [AUTO] — 7 pages
- RECOGNIZE: `.cmp-key-transactions`; `.kt-grid > a.kt-cell.on-light`.
- EXTRACT: header (is-split, h2 + `.sh-lead`, no eyebrow in the block); per
  cell: `href` · `.kt-type` · `.kt-client` · `.kt-amount` · `.kt-year`;
  foot `a.kt-link` text.
- EMIT: cards-tombstones text-only cards AS LINKS: `a.cd-card.card-panel.is-flat`
  > `p.type-h5.type-navy` (kt-amount) + detail `ul` (kt-client, kt-type
  lines) + `p.meta-dot.border-t.pt-3.mt-auto > span` (kt-year). 5-up density
  via `style="--cd-cols:5"` (columns are per-breakpoint tokens; `is-cols-*`
  is sugar). Foot → `flex justify-center mt-10` + `a.btn.btn-text`.
- NOTES: the hairline-cell look becomes the flat-card look by decision (one
  tombstone family). Drop `.on-light` — `card-panel` is an island by construction.

### cards-thumb (+ carousel) → cards, Thumbnail  [AUTO] — 48 pages (family)
- RECOGNIZE: `.cmp-cards-thumb` (grid `.ct-grid`, carousel `.ct-track` +
  `.ct-arrows > .ct-arrow`); modifiers `is-cols-3|2|auto`, `is-cta-text`,
  `is-cta-btn`.
- EXTRACT per card: `href`/`aria-label` · `.ct-media[data-bg]` (or
  `<video class="ct-media">`) · `.ct-scrim` · `.ct-label` · `.ct-body >
  .ct-eyebrow` / `.ct-title` / `.ct-desc` / `.ct-cta` (label in `.ct-cta-t`).
  Every slot optional — carry only what exists.
- EMIT: `blocks/cards.html` (grid) / `blocks/cards-carousel.html` (carousel);
  root `cmp-cards is-hover-zoom cards-thumb`. Slot map:
  `.ct-media` → `span.media-cover[data-bg]` (video: `<video
  class="media-cover" autoplay muted loop playsinline>`); `.ct-scrim` →
  `span.ov.ov-gradient-b.ov-90`; `.ct-label` →
  `span.chip.chip-lg.absolute.top-4.start-4.z-10`; body →
  `div.relative.z-10.p-6.flex.flex-col.items-start.gap-2.5`; `.ct-eyebrow` →
  `type-eyebrow type-muted`; `.ct-title` → `h3.type-h5.type-white`;
  `.ct-desc` → `p.type-body-sm.type-muted`. Card root = `a.cd-card.justify-end`
  + `style="--cd-min: clamp(360px,30vw,420px)"`. CTA per the old control:
  default circle → `btn btn-outline-light btn-pill` (+ `btn-icon` +
  `.sr-only` label for icon-only; the template's visible-label default is
  `btn btn-outline-light btn-sm btn-pill`); `is-cta-text` → `btn btn-text`;
  `is-cta-btn` → `btn` (+ size/`btn-pill`). Carousel: cards become
  `data-carousel-slide` in `.cd-track`; `.ct-arrow` prev/next →
  `.cd-arrows > .cd-dots[data-carousel-dots]` + `btn btn-accent btn-icon
  btn-pill` with `data-carousel-prev/next`; keep `data-autoplay`.
- NOTES: `is-cols-*` carries verbatim (same names on `cmp-cards`); hover
  zoom now opt-in via `is-hover-zoom`. Over-media text is `type-white`/
  `type-muted` by design — the scrim is the surface.

### cards-thumb-box (+ carousel) → cards-boxed  [AUTO] — 23 pages
- RECOGNIZE: `.cmp-cards-thumb-box`; `.ct-media > .ct-img[data-bg] +
  .ct-label`, body below in `.ct-body`.
- EXTRACT: as cards-thumb; note the label straddles the media edge.
- EMIT: `blocks/cards-boxed.html` / `blocks/cards-boxed-carousel.html`; root
  `cmp-cards is-hover-zoom cards-boxed`. Card → `a.cd-card.card-panel` +
  `style="--card-pad:0"` > media `span.relative.block.aspect-[3/2]`
  (`.media-cover` + `span.chip.chip-lg.absolute.bottom-3.start-4.z-10`) >
  body `div.p-6.flex.flex-col.items-start.gap-2.5`: eyebrow →
  `type-eyebrow type-blue`; title → `h3.type-h5.type-navy`; desc →
  `p.type-body-sm.type-mid`; CTA → `span.btn.btn-text.mt-1`.
- NOTES: the card-panel goes ON the cd-card (`--card-pad:0`) — never re-paint
  white by hand.

### cards-thumb-nobox (+ carousel) → cards-plain  [AUTO] — 4 pages
- RECOGNIZE: `.cmp-cards-thumb-nobox` (without the people markers — a
  `is-portrait` + `data-modal-open` instance is the people-grid recipe).
- EXTRACT: as cards-thumb-box.
- EMIT: `blocks/cards-plain.html`; root `cmp-cards is-hover-zoom cards-plain
  is-cols-3`. Media → `span.relative.block.aspect-[3/2].overflow-hidden.
  rounded-2xl > .media-cover`; a `.ct-label`, if present, stays a
  `chip chip-lg absolute` on the media wrapper. Body →
  `div.pt-5.flex.flex-col.items-start.gap-2.5`: `type-eyebrow type-blue` +
  `h3.type-h5.type-navy` + `p.type-body-sm.on-surface-mid` +
  `span.btn.btn-text.mt-1` — surface-adaptive on the section itself.

### digital-tools-showcase → cards-carousel  [AUTO] — 8 pages
- RECOGNIZE: `.cmp-digital-tools-showcase`; `.dts-carousel[data-carousel] >
  .dts-track > .dts-card`.
- EXTRACT: header (`.section-head.dts-head`: h2 + `.sh-lead`, no eyebrow);
  per card: `.dts-img[data-bg]` · `.dts-scrim` + `.dts-overlay` ·
  `.dts-card-body > .dts-card-title` + `.dts-card-cta` ("Learn more" +
  arrow); foot `.dts-foot > .dts-link` + `.dts-nav > .dts-nav-btn
  [data-carousel-prev/next]`.
- EMIT: `blocks/cards-carousel.html` (root `cmp-cards is-hover-zoom
  cards-thumb`). `.dts-img` → `media-cover`; scrim + overlay → ONE
  `ov ov-gradient-b ov-90`; title → `h3.type-h5.type-white`; CTA →
  `span.btn.btn-outline-light.btn-sm.btn-pill` (always visible — the
  hover-reveal is not carried); `.dts-link` → `a.btn.btn-text` placed before
  the `.cd-arrows` row; nav buttons → the template's `btn btn-accent
  btn-icon btn-pill` pair.
- NOTES: the scroll-pinned pan variant is pending the scroll-track recipe
  generalization (§4) — a plain carousel is the sweep target.

### carousel-left → cards-carousel  [AUTO] — 3 pages
- RECOGNIZE: `.cmp-carousel-left`; `.cl-track > .cl-slide > .cl-card[data-bg]`.
- EXTRACT: header (is-split); per slide: `data-bg` (on the CARD itself) ·
  `.cl-overlay` · `.cl-meta > .cl-tag` + `.cl-title`; controls
  `.cl-controls > .cl-nav[data-carousel-toggle]` (pause/play) +
  `.cl-dots[data-carousel-dots]`; `data-autoplay` value.
- EMIT: `blocks/cards-carousel.html`. Move `data-bg` off the card onto a
  `span.media-cover` child; `.cl-overlay` → `ov ov-gradient-b ov-90`;
  `.cl-tag` → `chip chip-lg absolute top-4 start-4 z-10`; `.cl-title` →
  `h3.type-h5.type-white`; dots → `.cd-dots[data-carousel-dots]` inside
  `.cd-arrows`.
- NOTES: `.cl-edge` fade masks dropped (no composition equivalent). The
  `data-carousel-toggle` pause/play control has no styled atom in the
  composition — TODO: keep the behavior styled as `btn btn-outline btn-icon
  btn-sm` + `.sr-only` label, or drop autoplay; confirm on first hit.

### carousel-center → cards-carousel  [JUDGE] — 7 pages
- RECOGNIZE: `.cmp-carousel-center`; `.cc-track > .cc-slide > .cc-card`
  (`.cc-img[data-bg]` + `ov ov-gradient-b ov-80` + `.cc-meta > .cc-tag` +
  `.cc-title`); controls `.crl-controls > .crl-toggle[data-carousel-toggle]`
  + `.cc-dots[data-carousel-dots]`.
- WHY JUDGE: the center-peek start mode is a pending carousel option
  (§4) — emitting cards-carousel today changes the layout to start-aligned.
  Extract the same slots as carousel-left; hold the emit until the option
  lands or Hakan accepts the left-aligned look per page.

### intro-side-by-side (pillars half) → in-place atom rewrite  [AUTO]
- RECOGNIZE: `.cmp-intro-side-by-side`; `.intro-pillars > .intro-pillar >
  .ip-ic + div > .ip-t + .ip-d`.
- EXTRACT: per pillar: `.ip-ic` svg · `.ip-t` title · `.ip-d` description.
  The left half (eyebrow/h2/`.intro-lead`) already uses DS type — untouched.
- EMIT: IN PLACE (no template swap — the component keeps its layout-only
  grid): `.ip-ic` → `span.icon-tile` (icon-squares row, §3b); `.ip-t`/`.ip-d`
  → `.type-*` classes in markup — TODO: pick the exact pair on first hit
  (candidates `type-h6 on-surface` / `type-body-sm on-surface-mid`, matching
  the cards-icon slot types) and record it here.
- NOTES: after the rewrite the `ip-ic`/`ip-t`/`ip-d` paint rules in ds.css
  become deletable; `intro-grid`/`intro-pillar` layout rules stay.

### feature-highlight (card row) → in-place atom rewrite  [AUTO]
- RECOGNIZE: `.cmp-feature-highlight`; `.fh-cards > article.fh-card >
  .fh-icon + .fh-card-h + .fh-card-p`.
- EXTRACT: per card: `.fh-icon` svg · `.fh-card-h` · `.fh-card-p`; also
  `.fh-sub` copy and the `.fh-cta > .btn.btn-navy`.
- EMIT: IN PLACE: `.fh-card` gains `card-panel` (white-panels row — fh-card
  keeps layout only); `.fh-icon` → `icon-tile`; `.fh-card-h` →
  `type-h6 type-navy`; `.fh-card-p` → `type-body-sm on-surface-mid`;
  `.fh-sub` → `.type-*` in markup; `btn-navy` → `btn btn-filled`. The media
  half (`.fh-media`/`.fh-img`/`.fh-float` pills) is untouched — no atom
  equivalent for the floating glass pills yet.

### 3b · Class rename & atom rewrite table (ATOM-LEVEL — no full recipe)

Mechanical class swaps inside otherwise-kept markup. Swap classes only;
never content.

| Old | New | Notes |
|---|---|---|
| **THE COLOUR LAW — 2026-09-03. Every row below is MECHANICAL: swap the class, never the content.** | | |
| `surface-grey` | `surface-soft` | palette rename; alias kept in ds.css, gate WARNs |
| `surface-grey-2` | `surface-mute` | palette rename |
| `surface-navy` | `surface-primary` | palette rename (2026-09-03 role naming) |
| `surface-blue` | `surface-accent` | palette rename |
| `ov-black` | `ov-dark` | an overlay carries the GROUND colour of its word |
| `ov-blue` | `ov-accent` | |
| `type-navy` / `text-navy` | `ink-primary` (light ground) · `ink-white` (dark) | **role-dependent — read the pairing rulebook, do not blind-swap** |
| `type-mid` | `ink-mute` (light) · `ink-soft` (dark) | secondary |
| `type-muted` | `ink-soft` | it already painted `#D7DEE6` |
| `type-blue` / `text-blue` | `ink-accent` (light) · `ink-accent-soft` (dark) · `ink-white` (on `surface-accent`) | accent moments |
| `type-blue-soft` / `text-blue-pale` | `ink-accent-soft` | the two paler blues reconcile to one |
| `type-white` | `ink-white` | |
| `on-surface` | `ink-primary` / `ink-white` | the relative layer is gone — the ink is now DECLARED |
| `on-surface-mid` | `ink-mute` / `ink-soft` | |
| `on-surface-faint` | `ink-mute` (light) — it was INERT there; `ink-faint` only for true ornaments | its token was never defined outside the island rules |
| `on-surface-border` | `border-ink` | or nothing: component hairlines now derive from `currentColor` |
| `on-light` | the panel's OWN ground: `card-panel surface-white`, `tbl-wrap surface-white`, … | the island rule is deleted; the fact it encoded moves into the markup |
| a self-painting light panel with no surface class | add `surface-white` | 268 done in blocks; pages are the estate audit's job |
| a container with a `data-bg`/media child + an `.ov` wash | add `surface-image` | it IS a ground; nothing can resolve its ink until it says so |
| `type-*` used for COLOUR | nothing — `type-*` is scale/weight/spacing only | |
| `btn-primary` | `btn-accent` | button model type axis |
| `sth-title` / `scin-h1` / `scin-h2` / `sst-h` / `ssv-h` (scroll heroes) | `type-display-lg ink-primary` (or `ink-white` per ground) (`ssv-h` kept shadow-only) | atoms pass 2026-09-01; sizes snapped to the ramp |
| (scroll-hero alignment) page-authored caption positions | root `is-left/right` x `is-top/bottom` (same axes as cmp-hero; center/middle default) |
| `sth-sub` / `scin-sub` / `sst-sub` | `type-body-lg ink-mute` (or `ink-soft` per ground) + class kept positioning/shadow-only | |
| `scin-ghost` | `btn btn-outline-light btn-lg` | rules deleted |
| `sst-card-num` / `sst-card-lbl` | `ds-num is-lg` / `type-eyebrow ink-mute` (or `ink-soft` per ground) | |
| `bst-link` | `btn btn-text btn-lg` + class kept positioning-only | |
| `cmp-scroll-tab` -> `cmp-scroll-showcase`; `cmp-video-content` -> `cmp-synced-slider`; `cmp-about-stats` -> `cmp-statement-stats`; `cmp-insight-split` -> `cmp-illustration-split`; `cmp-content-block-numbers` -> `cmp-proof-points` | root-class + slug renames (descriptive naming, Hakan 2026-09-01); behavior names aliased in ds.js (video-content/scroll-tab still bind) | old roots in RETIRED_SWEEP: pages re-root at the sweep |
| `bst-line` type | `type-display-xxl` in markup (class keeps em-accent + word-mask hosting) | 38 pages; min size snaps 48->64 |
| `ssv-op-h`/`ssv-op-sub`/`ssv-op-hint`/`ssv-sub` + `cap-*` per-position sizes | SWEEP-collapse onto `type-*` in page markup | 5-6 app-cinema pages; no gallery block teaches them — collapse when those pages are swept |
| `ss-index`/`ss-stat-num`/`ss-stat-lbl`/`ss-quote`/`ss-quote-cite` (scroll-showcase page-only variants) | SWEEP-collapse onto `type-*`/`ds-num is-sm` in page markup | 12 pages; no gallery block teaches them |
| `bs-note` + `bs-grid--box5/--scf5` (bento-spotlight page-only) | note: SWEEP-collapse the note size onto type-caption; the grid variants are legit layout API, keep | 1/3/5 pages |
| `sst-card` glass panel | JUDGE at sweep vs the `surface-glass-25/-50/-75` ladder | geometry (24px radius, wide pad, deep shadow) differs from the ladder today |
| `btn-navy` | `btn-filled` | |
| `hvl-btn-secondary`, `hfb-cta`, `ibc-btn-ghost`, `scin-ghost`, `hvc-btn-ghost`, `hil-btn-outline` | `btn-outline-light` | hand-rolled ghost CTAs on dark heroes |
| `badge-green` / `badge-amber` / `badge-red` / `badge-blue` | `badge-ok` / `badge-warn` / `badge-danger` / `badge-info` | semantic tones (legacy names still aliased in ds.css until the sweep completes) |
| `bt-purple`, `bt-grey` | `badge-neutral` | |
| `bt-sky` | `badge-info` | |
| `bt-xs`, `bt-tiny` | `badge-sm` | |
| `bt-md` | `badge-lg` | |
| `bt-solid-navy` | `badge-solid` | |
| `bt-outline-*` | `badge-outline` + tone class | style axis + tone |
| `.stat-card` (+ `.stat-card-n`/`.stat-card-l`) | `card-panel` + `ds-num` + a label | composition, not a class; 7 pages still paste it — retires at the sweep |
| `es-btn-neutral` | `btn btn-outline btn-xs` | es-btn-* CSS already deleted from ds.css |
| `es-btn-blue` | `btn btn-outline-blue btn-xs` | on a dark ground write `btn-outline-light` — there are no flips any more |
| `pg-*` (pagination) | `pgn-*` | renamed 2026-09-01 — pillar-grid owns `pg-`; rows carry `.pgn-row`; no `pgn-dbtn` twin (dark = a `.surface-primary` wrapper; the controls declare `surface-glass`) |
| `pg-dbtn`, `bc-dark`, `pg-dark` | `.surface-primary` wrapper (+ Tailwind `p-8 rounded-2xl`) + the normal classes | the global dark-surface flips do the recolor |
| breadcrumb `ol` with `flex items-center gap-1 flex-wrap` utilities | `ol.bc-trail` | paste unit is the bare `<nav>`; specimen wrappers (`mt-8` rows) are gallery chrome, never page markup |
| `.overlay` (modal backdrop) | `.modal-overlay` | bare `.overlay` was too generic |
| `modal-icon-blue` / `modal-icon-red` | `icon-tile` + `modal-icon-info` / `modal-icon-danger` | thin `--it-*` skins |
| `modal-status-ok` | `badge badge-ok` | |
| `toast-icon`, `notif-icon`, `modal-icon`, `es-icon`, `es-inline-icon`, `sac-success-icon` | `icon-tile` (+ size: `is-sm`, `style="--it-size:64px"`, `is-round` + `--it-size:68px`) | glyphs use `fill="currentColor"` so `--it-ink` applies |
| `toast-close`, `modal-close` | `btn btn-outline btn-icon btn-xs`/`btn-sm` + `.sr-only` label | `.modal-close-float` survives as a POSITIONING-ONLY class |
| `.toast`/`.modal`/`.modal-content` self-painted panels | compose `card-panel` in markup (+ `--card-pad`) | island via card-panel; removed from LIGHT ISLANDS lists |
| `.toast-title`/`.toast-msg`/`.notif-title`/`.notif-msg` sizes | `.type-*` classes in markup | tone colors keep the notif-* class hooks |
| `.modal-eyebrow`(-dark)/`.modal-lead`/`.modal-text`/`.modal-cover-title`/`.modal-plain-title` | `.type-*` classes | rules deleted |
| `.modal-mono`/`.tbl-mono` | `.mono` global atom | `.tbl-mono` is a grouped legacy alias |
| `.tbl-label` | `.bt-label` | specimen label unified |
| `.tbl-page`(-active) | `.pgn-btn` / `.pgn-compact` | table pager = pagination atoms |
| `filter-chip` (bespoke) | `chip chip-lg` model (state = `aria-pressed`) | `.filter-chip` kept in markup, grouped onto the chip model in CSS; selected = blue-wash/blue |
| `.sac-aud-tab` (pill tab rail) | `chip chip-lg` + `[data-aud]` | ds.js tabs work unchanged; selected = `.active`/`aria-selected` |
| `.sac-checkpill`/`.sac-dot` | `chip chip-lg` (+ component check glyph if needed) | CSS deleted 2026-09-01; component-level migration on pages still open |
| `.sac-legend` type / `.sac-legend-note` / `.sac-aud-prompt` / `.sac-field-lbl` / `.sac-sla` / `.sac-aside-h` | `.type-*` classes in markup | component type rules deleted |
| `.sac-req` | `.field-req` | global form atom |
| `sac-card`, `sac-aside-card` | + `card-panel` | sac-* rules keep structural padding only |
| form-shell `id="fsh-*"` + `for` | `aria-label` on control + bare sibling label | blocks are ID-free |
| `es-card` | `es-card card-panel is-flat` | es-card keeps layout only; card-panel is the paint + light-island contract |
| literal radii (6/8/10/12/14/16px, 999px) | `--r-xs`/`--r-sm`/`--r-md`/`--r-lg`/`--r-xl`/`--r-pill` | atom/element CSS must use the scale |
| heading tags sized by tag | `.type-*` class | tag-agnostic typography |

## 4 · JUDGE list — needs a human / a pending capability

1. **Pages with a page-local `<style>`** touching any replaced class (loop
   step 1) — the whole page, always.
2. **Sections with no composition match** — leave untouched, report.
3. **testimonials-carousel** — future `cards-testimonials` composition;
   backlog, not built yet.
4. **Scroll layout** — the scroll-track recipe (`ds.js`) is hard-bound to
   `.cmp-feature-scroll-track`'s `.cst-outer`/`.cst-pin`/`.cst-trackwrap`
   structure (pinning CSS is component-scoped), so no `cards-scroll`
   composition exists; a pinned pan of `.cd-card`s waits for the recipe to
   be generalized. (Also gates the digital-tools-showcase pinned variant.)
5. **Carousel center-peek mode** (carousel-center) — pending carousel
   option; see the recipe above.
6. **Hero family** — Phase 2; recipes to come.
7. **Tabs (v4 landed 2026-09-01)** — mechanical renames, AUTO:
   `.tabs-underline`→`.tb-rail.is-underline`, `.tab-ul`→`.tb-tab`;
   `.tabs-vert`→`.tb-rail.is-vertical` (+ layout utilities on the wrapper), `.tab-vert`→`.tb-tab`;
   `.tabs-pill` tray + `.tab-pill`→bare `chip rounded-full` triggers (drop the tray div; `chip-lg` only if a bigger rail is wanted);
   `.tabs-pill-dark`/`.tab-pill-dark`→`chip rounded-full` (the dark surface flips the chips — twin DELETED from blocks/gallery, CSS parked);
   `.tab-card`(+`-icon/-label/-desc`)→`card-panel surface-grey is-tile` + `icon-tile is-sm` + `.type-*` spans (JUDGE: pick icon svgs with currentColor);
   `.tab-panel`→`.tb-panel`. Keys/wiring (`data-tabs/tab/panel`) unchanged.
   `cmp-tabs-product-grid` (tpg-*) — JUDGE: this is a FILTER, not tabs. One
   grid of cmp-cards icon-linked cards + `data-filter` chips (see the
   filter-grid block); delete the duplicated per-category panels.
   Accordions (cmp-acc v4 landed 2026-09-01) — AUTO renames:
   root `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`; `.acc-inner`→`.ac-inner`
   (drop its 60ch cap — put `.measure` on prose instead); `.acc-head-sub`→
   `type-caption on-surface-mid` in a ds-stack; `.acc-num`→`.mono` span;
   `.acc-row/.acc-bullet/.acc-text` bullet bodies→`list-check`; `.acc-pad`
   2-col grids→utility grid in the body. data-acc/head/body wiring unchanged.
   `faq-split`→the acc-faq composition (utilities + card-panel help panel).
   `accordion-offerings`/`-twocol` (icon-bar skins)→plain cmp-acc rows (JUDGE
   body layout). `accordion-singlerow`→tabs/filter (recipe above).
   Listings (thumb-left row lists) are NOT accordions — they map to the
   cards-list composition (`cmp-cards.is-list`).
   HEROES (cmp-hero v4 landed 2026-09-01) — the static four are ONE
   component; per-page transform is mostly mechanical, JUDGE the wash:
   `cmp-hero-video-left`→`cmp-hero` + video.media-cover + `ov ov-black
   ov-gradient-l ov-80` + `ov-gradient-t ov-50` (hvl-grad-* divs die);
   page-authored utilities (min-h-screen/flex/items-*/pt/pb) DELETED —
   set Place instead (items-center→is-middle default, items-end→is-bottom);
   `surface-dark` heroes→`surface-primary` (4 pages, no-black rule);
   `hvl-btn-secondary`→`btn btn-outline-light`; `hvl-quick`→hero extras
   composition (JUDGE).
   `cmp-hero-image-left`→`cmp-hero is-bottom` + media-cover data-bg (its
   .ov atoms carry over; hil-* wrappers die).
   `cmp-hero-video-center`→`cmp-hero is-center` + `ov ov-black ov-radial`.
   `cmp-hero-fullbleed`→`cmp-hero is-bottom` (poster via data-bg fallback).
   `cmp-hero-carousel` (hcr-*)→`cmp-hero` carousel mode (hero-track of
   stages); the numbered-pagination nav is now the component's own.
   `cmp-editorial-story` hero→the hero-editorial composition (es-stat*→
   ds-num stat strip; countups carry over).
   `service-accordion` — PARKED JUDGE: hidden-radio :checked hack (keyboard-
   unreachable) + media stage; rebuild later as a tabs/media composition.

## 5 · Ledger — one-line mappings that don't warrant a recipe

| Old | New | Notes |
|---|---|---|
| `surface-navy` | `surface-primary` | SURFACES ARE ROLE-NAMED, 2026-09-03 (Hakan — the button-model precedent). A colour name lies under a second brand: Emirates Islamic paints "navy" purple. 397 occurrences across 74 root pages + 116 across 49 blocks + 161 in ds.css. `.surface-navy` survives as a **DEPRECATED alias on the definition blocks only** (base paint + ink ramp); every compound selector — island guards, flip groups, `:is()` lists — uses the role name ONLY, so stale markup keeps its ground and white `--on-surface` but loses the flips. Gate WARNs on it. Sweep-delete the alias later |
| `surface-blue` | `surface-accent` | same 2026-09-03 ruling; 13 page + 8 block + 161 ds.css occurrences. Same definition-block-only alias (`.surface-blue`), same WARN, same sweep-delete |
| (none) | `surface-accent2` | RESERVED 2026-09-03 — a second accent role, NAMED so nobody invents a rival spelling, and deliberately **undefined**. The gate FAILS if ds.css ever defines it; introducing it is a deliberate act that must update CONVENTIONS.md too |
| `ds-card` | `card-panel` | THE CARD MODEL, 2026-09-02. `.ds-card` stays a **compat alias** — grouped into every rule via `:is(.ds-card, .card-panel)`, pixel-identical, so no page breaks. Do not author it; sweep-rename. 289 occurrences swapped across 47 blocks |
| `card-clear` (+ `is-fill-25/50/75`) | `card-panel surface-clear` (glass → `card-panel surface-glass`) | the outline card is a PANEL with the NULL surface, not its own class. `.card-clear` rules kept working and flagged `/* LEGACY alias — sweep-delete */` |
| `card-clear is-fill-25 / -50 / -75` | `card-panel surface-glass-25 / -50 / -75` | FINISH/PAINT decomposition, 2026-09-02. Strength is PAINT, so it is spelled as a surface, not an `is-*` modifier. Identical white-alpha fills (.25/.50/.75) plus the glass recipe (blur + white ink tokens + rgba border), so a strength is now a full surface instead of a bare `background`. Removed from the gallery cardsurf list; the `is-fill-*` CSS is kept as a zero-usage legacy alias for the dated pages |
| `card-panel is-tile` (fill smuggled by the modifier) | `card-panel surface-grey is-tile` | FINISH/PAINT decomposition, 2026-09-02. `is-tile` lost `--card-fill: var(--light)` and is now pure FINISH — `border-color: transparent; box-shadow: none`. `var(--light)` **is** `surface-grey`'s background, so the rendered look is byte-for-byte the old one; 63 occurrences re-clothed across 14 blocks. The gain: `surface-primary is-tile`, `surface-accent is-tile` etc. now exist |
| `card-panel is-grey` | `card-panel surface-grey-2 is-tile` | FINISH/PAINT decomposition, 2026-09-02. `.is-grey` is now a **deprecated alias** — the one finish modifier still carrying a fill, kept only so untouched markup renders; sweep-delete. 2 occurrences re-clothed (blocks/card-surfaces.html) |
| `cd-card surface-primary p-6` (surface-as-card-paint) | `cd-card card-panel surface-primary` | the paint goes on a **panel**, which supplies the padding token — `p-6` dies. 3 compositions × 3 variants. Renders 28px (`--card-pad`) instead of 24px and gains the surface's own hairline border |
| (no class) text-over-media cards | `card-media` | NEW look class: the image IS the card — clipped, rounded, white ink by construction. `media-cover` + `.ov` stay as children. Applied to Thumbnail / Tiles / Tiles-Aside |
| (none) | `surface-clear` | NEW general surface — the NULL paint: transparent, ink token chain re-declared to `inherit` so the parent themes straight through. Excluded from the LIGHT ISLANDS group |
| (none) | `surface-glass` | NEW general surface — frosted translucent white + `backdrop-filter: blur(10px)`, white ink. Needs a dark or image ground |
| (none) | `surface-glass-25` / `-50` / `-75` | NEW — the glass STRENGTH ladder (2026-09-02). Same recipe at .25/.50/.75 white-alpha; dark/image ground only, and `-75` is tight enough on white ink to warrant an `/audit.html` pass. The island guard reads `:not([class*="surface-glass"])` so the whole family is excluded in one token |
| `.cta-go` | `btn-text` | never shipped |
| `cmp-fe-drop` / `cmp-fe-search` / `cmp-fe-search-icon` / `cmp-fe-muted` | `fe-drop` / `fe-search` / `fe-search-icon` / `fe-muted` | de-scoped |
| `pg-label`, `cmp-fe-label`, `cmp-tabs-label` | `bt-label` | ONE specimen-label class (showcase chrome) |
| icon squares (`ht-icon`, `pg-icon`, `pos-ico`, `fh-icon`, `ip-ic`, `dl-ico`, …) | `icon-tile` | ~18 bespoke re-implementations across the estate |
| white panels (`kc-card`, `fh-card`, `sg-card`, `pos-way`, …) | `card-panel` | keep the component class for layout only |
| number clamps (`is-num`, `mt2-num`, `cbn-figure`, …) | `ds-num` | one stat-figure ramp |
| `.ct-media`/`.ct-img` | `media-cover` atom (+ `--focus`) | |
| `.ct-scrim` | `.ov ov-gradient-b ov-90` | token navy gradient |
| `.ct-label` | `chip chip-lg` + position utilities | |
| `cmp-bento-photo` / `-spotlight` / `-image-cards` / `-magazine` / `-grid`, `cmp-feature-highlight` | `cmp-bento` compositions (same slugs) | CSS deleted 2026-09-01 after parity sign-off; per-tile spans `is-w*/is-h*`, hover axes on root, designed art sets copied into the cmp-bento zone |
| `pos-ways` / `pos-way` (Ways to Accept triad) | Cards — Icon Linked (`cards-icon-linked`) | deleted 2026-09-01; 17 pages still carry the markup — gate WARNs |
| `cmp-digital-tools-showcase` | Cards compositions (Carousel/Scroll variants) | deleted 2026-09-01; 7 pages still carry the markup — gate WARNs |
| `dvs-num` / `dvs-title` / `dvs-desc` (device-scroll steps) | `type-eyebrow type-blue` / `type-h3 on-surface` / `type-body on-surface-mid measure` | bespoke rules deleted 2026-09-01; device is now a stack of transparent PNG renders (assets/images/device/) crossfaded by the same data-anim windows |
| `dvf-icon` / `dvf-title` / `dvf-desc` (devices-features) | `icon-tile` / `type-h6` / `type-body-sm` | bespoke rules deleted 2026-09-01 |
| `ps-feature-icon` / `ps-ghost` / ps card mock (product-showcase) | `icon-tile` / `btn btn-text` / `.ps-card` image slot via data-bg | 2026-09-01 |
| eco-fb card interiors (`eco-fb-ico/nm/ds/mo`, bespoke panel) | `card-panel is-hover` + `icon-tile` + `type-h6`/`type-caption` + `btn btn-text btn-sm` | root is now `cmp cmp-ecosystem eco-fb`; old `cmp eco-fb` pages WARN (6 pages) |
| CSS laptop in laptop-showcase (`ls-lid/screen/base`) | `.ls-device-img` transparent PNG | badges stay UI; kits kept in CSS for pre-sweep pages |
| `cmp-carousel-center` / `cmp-carousel-left` | cmp-cards media-card Carousel compositions (`is-center-peek` for the centered look) | DELETED 2026-09-01 (Hakan); 6 + 2 pages WARN |
| `cmp-people-carousel` | Cards — People (Carousel) + Tabs pills | DELETED 2026-09-01; 9 pages WARN |
| `cmp-app-cinema` | `cmp-scroll-scenes` (pinned full-screen scenes; app story = demo content) | renamed 2026-09-01; 5 pages WARN |
| `cmp-video-tabs` | `cmp-video-chapters` (not tabs — video-backed scroll chapters; now in Storytelling & Scroll) | renamed 2026-09-01; 6 pages WARN |
| `is-portrait-bleed` (Quote Band variant) | plain Quote Band / Reversed | variant DELETED 2026-09-01; 1 page WARNs |
| `cmp-testimonials` (carousel) / `cmp-testimonials-expand` | Cards — Testimonials / Cards — Quote compositions; Quote Band for the single voice | DELETED 2026-09-01 (Hakan); 17 + 0 pages WARN |
| `cmp-key-transactions` | `cmp-fact-grid` (capability-named; deals are demo content; 5-up default) | renamed 2026-09-01; 6 pages WARN |
| `cmp-metrics-type1` / `cmp-metrics-type2` | `cmp-stats-quad` / `cmp-stats-hero-figure` (figures ride ds-num is-lg / is-xl is-light; ds-num-unit for units) | renamed + atomized 2026-09-01; 4+4 pages WARN |
| `cmp-trusted-partners-grid` / `-marquee` | `cmp-logo-wall` / `-marquee` (descriptive rename; Columns + Mobile-columns axes) | renamed 2026-09-01; 7 pages WARN |
| `cmp-impact-stats` (is-num/is-label/is-desc) | cmp-cards composition `impact-stats` (is-divided + ds-num is-lg + ramp) | DELETED 2026-09-01; 33 pages WARN — highest-usage sweep item |
| `cmp-tombstone-grid` | Cards — Tombstones (`cards-tombstones` — now incl. the count + ESG-legend head row) | DELETED 2026-09-01 (Hakan); 6 pages WARN |
| `cmp-partner-logos` | Cards — Partners / Logo Wall | DELETED 2026-09-01; zero page usage |
| `cmp-deal-ticker` | `cmp-ticker` (capability-named; content is per-page) | renamed 2026-09-01; 2 pages WARN |
| `people-grid` gallery card | (composition demo removed; cards-thumb-nobox + .op-modal skin both live on) | DELETED 2026-09-01; our-people pages unaffected |
| `.ct-eyebrow`/`.ct-title`/`.ct-desc` | `.type-*` classes (type-white/type-muted over media) | |
| `.ct-cta` (circle/text/btn control) | `btn btn-outline-light btn-pill` / `btn-text` / `btn` in markup | section-level CTA control retired — style is a markup choice |
| `.ct-arrow` | `btn btn-accent btn-icon btn-pill` + `data-carousel-prev/next` | |
| highlights-tiles `.ht-tile` | `cmp-cards` Icon (`cards-icon`, + `cards-icon-carousel`) | recipe §3 |
| kicker-cards | `cmp-cards` Kicker (`cards-kicker`) | recipe §3 |
| services-grid `.sg-card` / how-it-works-steps | `cmp-cards` Number (`cards-number`, was `cards-text`) | recipe §3 |
| ways-to-accept `.pos-way` / pillar-grid | `cmp-cards` Icon Linked (`cards-icon-linked`) | recipe §3 |
| process-cards `.p-card` | `cmp-cards` Steps (`cards-steps`) | recipe §3 |
| case-study-card `.csc` | `cmp-cards` Case Study (`cards-case-study`) | recipe §3 |
| people-grid / people-carousel | `cmp-cards` People (`cards-people`) | recipe §3 |
| partner-logos `.pl-*` | `cmp-cards` Partners (`cards-partners`) | recipe §3 |
| tombstone-grid `.tomb-*` / key-transactions | `cmp-cards` Tombstones (`cards-tombstones`) | recipe §3 |
| digital-tools-showcase | `cmp-cards` Thumbnail carousel (`cards-carousel`) | recipe §3 |
| carousel-center / carousel-left | `cmp-cards` Thumbnail carousel (`cards-carousel`) | recipes §3 (center = JUDGE) |
| `cmp-cards-thumb` / `-box` / `-nobox` (+ carousels) | `cmp-cards` compositions (Thumbnail / Boxed / Plain) | recipes §3 |
| testimonials-carousel | future `cards-testimonials` | JUDGE §4 |

## 6 · Payoff tracking — "lighter" is measured, not asserted

`/page-fix` records, per page: **bytes before/after** (the HTML file) and
**which legacy zones the page stopped referencing**. At estate completion it
reports the ds.css deletions unlocked — a legacy zone is deletable only when
`grep -l` over ALL pages returns zero for its classes. The target zones
(selector-line counts from ds.css, 2026-08-31, approximate):

| ds.css zone | ~lines | freed by |
|---|---|---|
| `cmp-cards-thumb` (incl. its carousel + is-cta-*/is-portrait modifiers) | 120 | cards-thumb recipe |
| `cmp-cards-thumb-box` (+ carousel) | 40 | cards-boxed recipe |
| `cmp-cards-thumb-nobox` (+ carousel) | 41 | cards-plain / people recipes |
| `ht-*` (highlights-tiles) | 50 | cards-icon recipe |
| `kc-*` (kicker-cards) | 14 | cards-kicker recipe |
| `sg-*` (services-grid) | 24 | cards-number recipe |
| `hiw-*` (how-it-works-steps) | 15 | cards-number recipe |
| `pg-*` pillar-grid zone | 23 | cards-icon-linked recipe |
| `pos-*` (ways-to-accept) | 18 | cards-icon-linked recipe |
| `ps-*`/`p-card` family (process-cards) | 82 | cards-steps recipe |
| `csc*` (case-study-card) | 25 | cards-case-study recipe |
| `pc-*` (people-carousel) | 27 | cards-people recipe |
| `pl-*` (partner-logos) | 16 | cards-partners recipe |
| `tomb*` (tombstone-grid) | 30 | cards-tombstones recipe |
| `kt-*` (key-transactions) | 30 | cards-tombstones recipe |
| `dts-*` (digital-tools-showcase) | 26 | cards-carousel recipe |
| `cc-*`/`crl-*` (carousel-center) | 13 | pending center-peek option |
| `cl-*` (carousel-left) | 23 | cards-carousel recipe |
| `fh-*` card-row rules (feature-highlight) | part of 32 | in-place rewrite (media-half rules stay) |
| `ip-*` pillar paint rules (intro-side-by-side) | part of 10 | in-place rewrite (layout rules stay) |
| `.stat-card` block | 5 | stat-card ledger row |
| `es-btn-*` | 0 | already deleted — page markup swap only |
| `pg-dbtn` twin | 0 | already retired (`.surface-primary` wrapper) |

Also count the RTL zone lines that die with each component (e.g. the
`[dir="rtl"]` hover-nudge re-statements for `kt-link`, `pl-link`, `pg-go`,
`dts-link`, `pc`-family) and each zone's entries in the LIGHT ISLANDS /
audit-freeze lists — deleting a zone means deleting its whole footprint.
| useful-links (inline strip) | REBUILT 2026-09-02 | resource-row grid (design C): ds-eyebrow head + columned hairline rows, type glyphs (page/PDF/external), optional icon-tile all-or-none, is-cols-1/2/3 | api-banking-v2-2026-07-29, businessonline-x-v2-2026-08-04 carry old .ul-row markup — gate WARNs until sweep |
