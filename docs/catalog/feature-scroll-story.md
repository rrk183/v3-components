# Feature Scroll Story

`feature-scroll-story` · Storytelling & Scroll · **showpiece** · surface-grey · `data-behavior="scroll-story"`

> **Unreviewed** — formalised 2026-08 from the shared `.ess` "scroll-story feature
> section" pattern that already lives on many pages (payments, api-banking,
> businessonline, smartscf). Registered as a first-class block; the engine +
> styling stay under the shared `.ess-*` classes in `ds.css`, and this block adds
> a thin `.cmp-feature-scroll-story` marker on the section. Awaiting front-end
> review (surface-adaptivity on dark, and the image-capture authoring flow).

## Look
A **pinned** section: an opener headline holds the viewport, fades out, then
numbered chapters (left column) crossfade one at a time in sync with a
product-UI "mockup" visual (right column), while progress dots track below.
Reads as a scrubbed product story — you scroll, the narrative advances in place.
On light grey; both columns sit on the page gutter, dots centred.

## Anatomy
- `.ess` `data-behavior="scroll-story"` `data-scrub-vh="520"` — the scrub host (ds.js
  drives a 0→1 timeline from the pinned scroll distance).
- `.ess-stage` — the `position:sticky; 100vh` pinned stage.
- `.ess-opener` — the intro headline layer (fades out early via `data-anim`).
- `.ess-beats > .container-ds.ess-grid` — the two-column beats layer (chapters / visual).
- `.ess-col > .ess-chapters > .ess-ch` ×N — the numbered chapters (`.ess-kick` `.ess-line`
  `.ess-desc`, optional `.btn` on the last). Each `.ess-ch` has a `data-anim` in/out window.
- `.ess-vis > .ess-shot` ×N — the crossfading visual slots, sequenced to the chapters.
- `.ess-dotswrap.container-ds > .ess-dots` — the centred progress dots.

### Mockups are images
Each `.ess-shot` visual is a **baked transparent 2× PNG** dropped in as
`<img class="ess-shot-img">` inside `<div class="mkw mkw-img">` — captured once from
the CSS mockup (headless, transparent bg, shadow neutralised). It self-sizes
(`max-width:100%`, natural `width/height` attrs) so it scales down on mobile with
no per-mockup trim, and its `filter:drop-shadow` follows the card silhouette (phone
included). The floating **callout** cards (`.mcard` + `.mc-k`/`.mc-v`) stay LIVE
HTML so they remain translatable and theme-aware.

## Variants
- **Mockup right** (default, `feature-scroll-story`) — chapters left, mockup right.
- **Mockup left** (`feature-scroll-story-rev`) — the SAME block with `rev` added to
  the `.ess` element (`.ess.rev .ess-vis{order:-1}` in `ds.css`); mockup left,
  chapters right. Same `.cmp-feature-scroll-story` root, same engine, same baked
  PNGs — the ONLY difference is the side. Alternate the two across sibling scroll
  stories on one page (e.g. Online then Point-of-sale) for visual rhythm. No new
  CSS; the flip is one existing modifier class.

## Content contract
- 3–4 chapters read best; keep each `.ess-desc` to ~1–2 lines.
- Keep the per-element `data-anim` windows **sequential** (chapter N out ≈ chapter
  N+1 in); the visual `.ess-shot` windows mirror the chapter windows.
- Swap each `<img>` src + `alt` and the chapter copy; capture new mockup images the
  same way (2× DPI, transparent, shadow off — the shadow is re-applied in CSS).
- Callout `.mc-k`/`.mc-v` are HTML — reword freely; they translate via `ar-preview.js`.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Ships on `surface-grey`. Dark-surface adaptivity is **not yet reviewed** (the
  `.ess.surface-primary/-dark` token flips exist but the baked mockup PNGs are light —
  run `/audit.html` before using on a dark surface).
- Image mockups do **not** translate or re-theme (baked pixels); that is the
  deliberate trade for scalability — keep meaningful copy in the HTML callouts.
- The dots wrapper must carry `.ess-dotswrap` (absolute, out of the `.ess-beats`
  flex flow) or the grid collapses to half width — don't hand-roll it in-flow.
- No inline `style=` / `<style>` / IDs: the block is pure markup + `data-*`.

## Authoring rule
Read `blocks/feature-scroll-story.html`. Reuse the shell verbatim and change CONTENT
only (chapter copy + mockup images + callouts). New markup or `cmp-*` classes on a
page are drift. The `.ess-*` engine is shared — never fork it per page.
