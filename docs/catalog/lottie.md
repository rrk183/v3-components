# Lottie

`lottie` · UI Elements · **supporting** · surface-grey · _(behavior: `data-behavior="lottie"` — the lazy vendored-player recipe in `ds.js`)_

Registered 2026-09-03 as **capability 1 of 2** in the illustration doctrine (Hakan, 2026-09-03 — `docs/audits/page-fix-map.md` Addendum 3; summary in CONVENTIONS.md → "Illustrations"). The other capability is [Illustration Video](illustration-video.md); the two are chosen **per use-case at authoring time**, not ranked.

It is a **demo of a behaviour**, not a component with scoped CSS. There is no `.cmp-lottie` ruleset and there should not be one — the root is a marker class, and the mount contract is a small set of **generic `lot-*` atoms** in `ds.css` so *any* block or page can host a stage. The player (`assets/js/lottie_light.min.js` — lottie-web **5.12.2**, SVG renderer only, ~164 KB) is **vendored and pinned**, and `ds.js` lazy-loads it on first sighting of a stage, exactly as it lazy-loads Lenis. Pages never reference the player and never carry a `<script>`. **Flagged Unreviewed.**

## Look
A grey band. Two cards side by side — one white-faced, one navy-faced — each holding the *same* JSON: a brand-blue dot breathing inside two expanding rings, drawn on transparency so each card face shows through. Below, the poster PNG shown as itself: the still that a reduced-motion reader gets.

## Usage
**Reach for it when** the artwork is *drawn* — icons, diagrams, flow motifs, empty-state spots, success ticks, loaders, process illustrations — and especially when the same piece must sit on several surfaces or both brands.
**Where it shines** — a spot illustration in a card grid, a hero-adjacent motif, a step marker in a process section, an empty-state or success moment.
**Possibilities** — `data-lottie-loop="false"` for a one-shot; `data-lottie-speed` to slow a busy loop; any stage width (the poster is the sizer); several stages per page share one lazily-loaded player.
**Pairs well with** Cards — Icon, Empty State, How It Works — Steps, Feature Spotlight.
**Not for** photographic, textured or 3D artwork, and not for anything that needs a non-transparent backdrop — that is Illustration Video. Not for text-bearing artwork (see Content contract).

## Anatomy
- **Section root** — `section.cmp.cmp-lottie.surface-grey.section-y[data-animate]`. Marker class; zero CSS hangs off it.
- **Stage** — `div.lot-stage[data-behavior="lottie"]`. Put it on the section root only for a single-instance component; on the stage whenever a section holds more than one (as here).
- **Poster** — `img.lot-poster` as the stage's child. Sizer, first paint, failure fallback, reduced-motion state.
- **Mount** — `div.lot-anim`, created by the engine and never authored. `.is-lottie-on` on the stage (set on the player's `DOMLoaded`) cross-fades it in and hides the poster with `visibility`, so the box never collapses.

| attribute | required | default | meaning |
|---|---|---|---|
| `data-behavior="lottie"` | yes | — | binds the recipe |
| `data-lottie-src` | yes | — | path to the JSON asset (`assets/lottie/….json`) |
| `data-lottie-loop` | no | `true` | `"false"` plays once and holds the last frame |
| `data-lottie-speed` | no | `1` | playback rate multiplier |

## Content contract
- **Ship a poster PNG with every JSON**, exported from **frame 0** so the still and the first animated frame never disagree. It is not optional: the stage has no intrinsic height without it, and under `prefers-reduced-motion` the recipe returns *before touching the network* — neither the player nor the JSON is fetched — so the poster is the entire experience.
- **Brand palette in-source.** Colours live inside the JSON; the DS cannot recolour it. An export in the wrong blue ships in the wrong blue.
- **No baked text.** Text in the artwork cannot be translated for the Arabic site and is invisible to screen readers. Copy lives in the markup.
- **Mirrored export when directional.** The engine does **not** flip: an arrow travelling left-to-right keeps travelling left-to-right in RTL unless a mirrored JSON is authored and pointed at. Direction is a content decision, like a directional image.
- **Transparent background.** This is the axis on which Lottie beats the baked MP4 — one file on every surface and brand. A piece that needs a photographic or gradient backdrop is a video, not a Lottie.
- Decorative stages give the poster `alt=""`; the engine marks the mount `aria-hidden`.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Never add a `<script>` to a page to run a Lottie**, and never load the player from a CDN. It is vendored, pinned and lazy — that is the whole capability. Upgrading means replacing `assets/js/lottie_light.min.js` **and** the version recorded in its header comment and in CONVENTIONS.md.
- **Never drop the poster** "because the animation loads fast". It is the reduced-motion state and the 404 fallback.
- Do not mint a `.cmp-lottie` ruleset or component-scoped `lot-*` variants. The atoms are deliberately generic — the capability is not a component.
- Do not expect the engine to mirror, recolour, retime or crop the artwork. Everything about the drawing is authored in the JSON.
- The demo asset (`assets/lottie/demo-pulse.json`, ~3 KB, hand-authored 2026-09-03) is demo CONTENT — real pages upload their own.

## Authoring rule
Read `blocks/lottie.html`. Reuse the `lot-stage` + poster contract verbatim and change CONTENT only (`data-lottie-src`, the poster, the copy). To put a Lottie in a *different* block, drop the same four lines into that block's media slot — the behaviour and atoms are shared, and the player loads itself. See CONVENTIONS.md → "Illustrations".
