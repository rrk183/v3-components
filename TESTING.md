# Testing scope — emiratesnbd-ds

verify: node scripts/verify.mjs

## What this repo is (context for the reviewer)
A pure-markup design system: 85 canonical components in `blocks/`, one shared
runtime (`assets/css/ds.css` + `assets/js/ds.js`), ~30 first-party pages
composed by pasting blocks and changing only content, and an AI page-builder
(`.claude/workflows/*.js` + `/build-page`) that generates new pages from the
same blocks. Pages must stay CSS/JS-free (classes + data-attributes only).
Deployed as a static site behind `server.js` on DigitalOcean (auto-deploy on
push to `ds-rearchitecture`).

## Critical flows (a regression here is a blocker)
1. **The component contract** — every file in `blocks/` is paste-ready truth:
   root `.cmp .cmp-<name>` + sanctioned surface class, no inline `style=`
   (except CSS-custom-property passing, e.g. `style="--isp-pct:86%"`), no
   `id=`, no `<script>`/`<style>`, no `<details>` accordions, `data-behavior`
   values that exist in ds.js, media paths that resolve. A broken block breaks
   every page that pastes it — and every future AI-built page. Also: a
   `.section-head` must not be wrapped in a bespoke row that holds a link or
   button beside it — the wrapper traps the header as a flex item, so the
   `.is-center`/`.is-split` variants and the gallery Header control become
   silent no-ops (the row class belongs ON the header; the link is a
   `.sh-action` child).
2. **The runtime pair** — ds.css/ds.js must parse; every first-party page must
   reference them with ONE consistent `?v=` cache-bust; the surface system
   must stay intact (`.surface-primary` = brand navy `#072447`, `--on-surface`
   tokens present on all five surfaces; `surface-dark` never a default —
   only `hero-cinematic-cards` carries it in canon).
3. **Library coherence** — `blocks/` ↔ gallery catalog (`library.js` slugs) ↔
   dossiers (`docs/catalog/*.md`) stay 1:1; `all-components.html` regenerates
   byte-identical from current blocks (it is the cross-browser review page —
   if it drifts from blocks/, reviews test stale markup).
4. **Page integrity (first-party pages)** — no references to retired
   components, no dead `cmp-*` classes (CSS must exist), no raw black
   backgrounds (`#030303`/`#04101f`/`surface-dark`) outside sanctioned spots,
   no lorem ipsum / template placeholder copy, all referenced assets exist,
   `<title>` + meta description present.
5. **CSS system discipline** — NO raw hex colours outside `:root`: every
   colour goes through a token so a brand theme can repaint the system by
   overriding variables only. Exempt: `#fff`/`#000`/`#030303` (ink, not brand)
   and the CSS-drawn product-mockup illustrations (artwork). Every
   `var(--x)` without a fallback must resolve to a real definition (ds.css,
   themes.css, a ds.js `setProperty`, or `style="--x:…"` passing).
   `assets/css/themes.css`, when present, may contain variable declarations
   only, and every `[data-theme=…]` block must define the identical token set
   (no silent inheritance of another brand's colour). Media queries only from
   the canonical set (479/639/767/1023/1279 max, 640/768/1024/1280 min, +
   sanctioned specials); `:has()` budget ≤ 1. (The **light-island contract**
   checks were RETIRED 2026-09-03 — they policed machinery the colour law
   deleted; flow 8 replaces them at the source.)
6. **The page-builder prompts** — `.claude/workflows/*.js` parse as JS and the
   blueprint prompt retains its hard rules (SURFACE RULE — no un-requested
   dark; blocks-must-exist rule). These prompts are the factory; silently
   losing a rule regresses every future page.
7. **Serve smoke** — `server.js` starts and serves `index.html`,
   `all-components.html`, and a sample page with HTTP 200 and non-empty
   bodies containing their `.cmp` sections.
8. **The colour law** — *surfaces, inks and overlays are declared in markup;
   CSS never adapts content by context; a different look on a different ground
   is a different markup composition.* Five checks, all reading ONE source of
   truth (`assets/js/ds-palette.js`, which the gallery reads too):
   **8a anti-context** — no ds.css rule may cross a combinator from a
   `.surface-*`/`.on-light` ancestor and declare colour (geometry is fine);
   **8b no new indirection** — no `--on-*`/`--ink-*` custom property may be
   defined at all, so ink classes consume brand tokens directly;
   **8c closed vocabulary** — `surface-*`/`ink-*`/`ov-*` outside the enumerated
   palette/mode/strength/paint sets fails, in ds.css, blocks or the gallery;
   **8d block pairing** — every text element in every block is statically
   resolved to its ground (nearest `surface-*` ancestor; `surface-image` through
   its overlay's COLOUR) and checked against the categorical pairing rulebook,
   including that every `type-*` atom declares an ink;
   **8e deprecations** — old spellings in first-party pages warn (pages migrate
   in the estate audit, not here).
   This flow exists because the composition-vs-context lesson had to be taught
   twice (`b7f87aa2`). A context rule is a gate failure, not a technique.

## What the gate cannot catch (reviewer must eyeball)
- **Rendered visuals** — paddings, alignment, surface rhythm, overlay
  legibility per breakpoint. Protocol: open `/all-components.html` at
  375 / 768 / 1024 / 1440 and scroll fully; screenshots are the evidence.
- **Contrast on dark surfaces** — the gate is static; measuring needs the
  browser. Protocol: run `/audit.html` once per brand (it sweeps all blocks ×
  navy/dark/blue and flags text under 3:1) after adding a component or a
  brand. Photo-backed text is skipped there — eyeball it.
- **Scroll-driven motion** — pinned stages, scrub heroes, reveal timing
  (geometry asserts lie here; only eyes catch a janky pin).
- **Cross-engine rendering** — Safari + Firefox passes of all-components
  (gate is static analysis + Chromium-family preview only).
- **AI page-builder output quality** — the workflows call live models; the
  gate checks their prompts/rules statically, never executes a build. Taste,
  brief-fidelity and content realism of generated pages need human review.
- **Video/image quality** — compression artifacts, art direction.
- **Brand voice/terminology** in copy (e.g. "Emirates NBD Pay" spacing is
  linted, but tone is not).

## Out of scope
- Parked contributor pages (`*-ram.html`, `*-codex.html`) — reference-only
  imports coupled to their authors' CSS; only the asset-404 check applies.
  They are candidates for regeneration, not maintenance.
- `_legacy/` and `refs/` (archived galleries, Figma exports).
- Live execution of the AI workflows (non-deterministic, costs tokens).
- Load/perf testing of the DO deployment; DNS/TLS.
- `harness.html` / `review.html` / `frame.html` internals (dev rigs) beyond
  the serve smoke.

## Accepted tradeoffs
- Layout utilities (incl. Tailwind arbitrary values from the inline-style
  migration) require the JIT runtime `assets/js/tailwind.cdn.js` to execute.
  It is a SAME-ORIGIN asset (not a third-party CDN), so its failure domain
  equals ds.css/ds.js — accepted repo-wide pattern.
- Markup colour literals: BLOCKS may not carry any (arbitrary hex utilities
  or raw rgb triplets — they bypass brand theming; flow-1 fails). First-party
  pages WARN (remaining hits are tracked legacy `<style>` debt). White/black
  literals are exempt everywhere; SVG artwork themes via currentColor + a
  text-<token> class.

## Browser-layout gates (rendered checks — verify.mjs cannot see these)
verify.mjs is static markup analysis. Components whose correctness lives in
RENDERED LAYOUT get a canonical browser check committed under
`scripts/browser-checks/`; a change to such a component is NOT "verified"
until its check passes — improvising a fresh check per fix only ratifies the
fix (that's how the 2026-08-28 map chips-over-stats miss shipped a false
"desktop clean").

- **cmp-world-map (v2)** — `scripts/browser-checks/map-invariants.js`.
  Run on a page with the map at BOTH ≥1280 and 375 viewports (console:
  `fetch('/scripts/browser-checks/map-invariants.js').then(r=>r.text()).then(eval)`).
  Invariants: no chip×chip overlap; no chip×content overlap (ALL overlaid
  blocks); chips unclipped; chip font ≥10px; is-bleed fills its section;
  recipe layers present. Must return `pass: true` at both widths.

## Known flaky
- Full-page screenshots via the preview tool intermittently return blank
  frames on canvas-hero pages (capture artifact, not a rendering bug) —
  re-shoot or verify via computed styles before filing.
- The all-components page under rapid *programmatic* scroll can starve the
  renderer (10+ pinned stages on one page); human-speed scrolling is fine.
  Not shipped to end users.
