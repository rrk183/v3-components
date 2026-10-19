# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Emirates NBD Design System v4 (Wholesale Banking): a **pure-markup** design system plus ~80 static pages built from it. No build step and no bundler; the site itself has no npm dependencies (esbuild is a dev-only dependency for the CMS handoff build). Pages are plain HTML that load one shared runtime; components are HTML blocks pasted into pages with only their content changed.

`CONVENTIONS.md` (authoring law) and `TESTING.md` (what the gate enforces and what needs a human eye) are authoritative. Read the relevant section before changing CSS, blocks, or page markup.

## Commands

```bash
npm start                                         # node server.js → http://localhost:8080 (PORT env overrides)
node scripts/verify.mjs                           # the verify gate (npm run verify); exits non-zero on any FAIL
node scripts/build-all-components.mjs --write     # regenerate all-components.html from blocks/
node scripts/build-all-components.mjs --check     # exit 1 if all-components.html is stale
npm run minify                                    # style.css → style.min.css (committed) + JS handoff → dist/ (gitignored)
node scripts/minify.mjs --check                   # exit 1 if style.min.css is stale
```

- Needs **Node 18+** (`.nvmrc` pins 20: run `nvm use`). An older default Node fails the scripts and the pre-commit hook.
- Pages must be served over HTTP. `file://` breaks images, video and components.
- `server.js` is a zero-dependency static server. Setting `SITE_PASSWORD` turns on HTTP Basic Auth. `assets/js/gate.js` + `gate-config.js` add a separate client-side prompt() gate for static deploys.
- `.claude/workflows/` is **not in this checkout** (it's gitignored), so `verify.mjs` currently crashes with ENOENT before reporting.
- There are no unit tests. Rendered-layout checks live under `scripts/browser-checks/`, which is also absent here. You run them in the browser console against a served page; see TESTING.md.
- **CSS is one file pair, matching the CMS:** edit `assets/css/style.css`; `assets/css/style.min.css` is generated from it and committed. The `.githooks/pre-commit` hook rebuilds it from the staged `style.css` (activated by `npm install` via the `prepare` script), and the gate fails if it's stale. Never edit the `.min` by hand.
- **JS handoff** (`scripts/minify.mjs`): `dist/assets/js/` gets `.min.js` copies plus the vendor libs `ds.js` lazy-loads from its own folder (`lenis.min.js`, `lottie_light.min.js`). `ds.js` locates itself by matching `ds.js` *or* `ds.min.js`, and reads `?v=` from `style.css` *or* `style.min.css`. Keep both names in any new self-lookup.
- Entry pages: `start-here.html` (index of all pages), `index.html` (component gallery), `cib-home-final.html` (Wholesale Banking home).

## Architecture

**Runtime (loaded once per page, never per-component):**
- `assets/css/style.css`: the only product stylesheet, in three sections: 1 fonts (its Google Fonts `@import` must stay the file's first rule), 2 the design system (all component CSS, scoped under `.cmp-<name>`), 3 `[dir="rtl"]`-only page fixes for the Arabic editions. Raw hex colours are allowed only in `:root`; everything else goes through brand tokens. `library.css` is gallery tooling only and must never load on product pages.
- `assets/css/themes.css`: per-brand `[data-theme=…]` blocks. Variable declarations only, and every block defines the identical token set.
- `assets/js/ds.js`: every behaviour. Opt-in animation lives inside `[data-animate]`: `data-reveal`, `data-countup`, interactions (`data-tabs`, `data-accordion`, `data-carousel`, `data-modal-*`, `data-filter`), and scroll recipes registered via `DS.recipe(name, fn)` and selected with `data-behavior="…"`.
- `assets/js/tailwind.cdn.js` + `ds-tailwind-config.js`: Tailwind JIT, served same-origin. Tailwind handles layout/spacing/breakpoints; semantic classes handle atoms, type, surfaces, inks and overlays.
- `assets/js/ds-palette.js`: the **single source of truth** for the colour vocabulary and the pairing rulebook. Both `verify.mjs` and the gallery (`library.js`/`frame.html`) import it. Never restate palette facts elsewhere.
- Pages reference the runtime with one consistent `?v=` cache-bust value, shared by `style.css` and `ds.js` (the gate enforces it).

**Library (kept 1:1, and the gate checks this):**
- `blocks/<slug>.html`: canonical, paste-ready components. Root is `<section class="cmp cmp-<name> surface-<x>" data-animate data-behavior="…">`. Blocks may not contain IDs, `<script>`/`<style>`, inline `style=` (except `--custom-prop` passing), `<details>`, or colour literals.
- `assets/js/library.js`: the gallery catalog (`slug:` entries). It also sets the order of `all-components.html`.
- `docs/catalog/<slug>.md`: per-block dossiers covering look, motion, anatomy, **content contract** (slot counts, copy lengths, image ratios) and drift cautions. Read the dossier before filling a block.

**Pages:** root-level `*.html`. Each is composed by pasting blocks and changing content only, with no page-local CSS/JS. The Wholesale Banking home's page styles now live in a scoped section at the end of `style.css` (`:where(.hf-main)`, `--hf-*` tokens), with known debt listed in its banner; its `cib-home-flow.js` is still page-local. `staging/<page>/` holds per-page media. `*-ram.html` / `*-codex.html` are parked reference pages (out of scope).

## The colour law (gate-enforced, verify.mjs flow 8)

Surfaces, inks and overlays are declared **in markup**. CSS never adapts content by context. A different look on a different ground means a different markup composition.
- No style.css rule may cross a combinator from a `.surface-*`/`.on-light` ancestor and set colour. Geometry is fine.
- Never define `--on-*` or `--ink-*` custom properties. Ink classes consume brand tokens (`--navy`, `--blue`, greys) directly.
- `surface-*` / `ink-*` / `ov-*` form a closed vocabulary from `ds-palette.js`. Adding a word is a system decision.
- Every text element in a block declares an ink valid for its ground.

## Other rules that bite

- **Cards** have three independent axes: identity `cd-card`, look `card-panel | card-media`, and paint `surface-*`. Finishes (`is-tile | is-flat | is-hover`) add only border/elevation, never fill. Behaviour (`is-hover-*`, `is-cols-*`) goes on the `.cmp-cards` root, never on a card.
- **Section headers own their row.** Never wrap `.section-head` in a bespoke flex row. Put `is-split`/`is-center` on the header and make the link a `.sh-action` child.
- **Filtering** is generic (`data-filter*` attributes in ds.js). Never write a page-local filter script.
- **No site-root paths in the runtime.** The CMS hosts it under `assets/webxv2/`, not `assets/`. `style.css` references files relative to itself (`../fonts/…`, `../images/…`); `ds.js` builds asset URLs with `DS.asset('images/…')`, which resolves from its own folder. The Wholesale Banking logo link reads `<html data-home-url="…">` when present. Never write `/assets/…` in either file.
- **Media queries** come only from the canonical set: max 479/639/767/1023/1279, min 640/768/1024/1280. The `:has()` budget is ≤ 1.
- The gate is static analysis only. For visual changes, check `all-components.html` at 375/768/1024/1440 and run `/audit.html` for contrast on dark grounds.
