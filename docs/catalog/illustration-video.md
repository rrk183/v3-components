# Illustration Video

`illustration-video` · UI Elements · **supporting** · surface-grey · _(no behaviour attribute — the reduced-motion stand-down is a global ds.js register)_

Registered 2026-09-03 as **capability 2 of 2** in the illustration doctrine (Hakan, 2026-09-03 — `docs/audits/page-fix-map.md` Addendum 3; the doctrine summary lives in CONVENTIONS.md → "Illustrations"). The other capability is [Lottie](lottie.md); the two are chosen **per use-case at authoring time**, not ranked.

It is a **demo of a media contract**, not a component with scoped CSS. There is no `.cmp-illustration-video` ruleset and there should not be one — the root is a marker class, and everything visible is `media-frame` + `media-cover` + `card-panel` + `surface-*` atoms that already existed. The point is that an illustration is **CONTENT** (a media upload) and never per-piece code: on the CMS, code ships ~monthly while pages ship ~10x a day. **Flagged Unreviewed.**

## Look
A grey band. A full-width white frame holding a looping brand-blue "signal" animation whose ground is pure white, so the only visible edge is the frame's own radius; the same motion again in a navy frame, from a second file baked on navy; then a two-up card grid with the illustration inset in a light card and a dark card. Nothing anywhere is a player: no controls, no scrim, no play button.

## Usage
**Reach for it when** the artwork is *rendered* rather than drawn — 3D, textured, photographic, particle work, anything After Effects would output as pixels — or when a drawn piece is too heavy to be worth a vector export.
**Where it shines** — product/feature explainers inset in a card grid, a full-width band between two copy sections, a device-mock loop where the bezel is baked in.
**Possibilities** — any aspect via `aspect-[…]` on the frame; any surface, provided a bake exists for that face; `data-reveal` on the frame for entry; the frame may be dropped entirely for a truly seam-free full-bleed.
**Pairs well with** Cards — Boxed / Icon (as the media slot), Feature Spotlight, Proof Points.
**Not for** anything that carries meaning by sound or narration — that is a real video with `controls`, not an illustration. Not for gradient or image surfaces (see Drift cautions). Not for drawn vector work: that is Lottie, and Lottie is transparent.

## Anatomy
- **Section root** — `section.cmp.cmp-illustration-video.surface-grey.section-y[data-animate]`. Marker class; zero CSS hangs off it.
- **Frame** — `span.media-frame.surface-X.relative.block.aspect-[R]`. The `surface-*` class is load-bearing *documentation*: it declares which face the bake targets, so a mismatch is readable in the markup.
- **Media** — `video.media-cover` with `muted autoplay loop playsinline preload="metadata" poster="…" src="…" aria-hidden="true"`. **No `controls`, no `<source>` ladder, no overlay.**
- **Inset composition** — `div.card-panel.surface-X` holding the frame + a `ds-stack` of `type-*` copy.
- **Specimen labels** — `.bt-label` (the shared capability-board chrome; this component is on its `:is(…)` list in ds.css).

## Content contract
- **`poster` is REQUIRED.** ds.js's global reduced-motion register pauses any `video[autoplay][loop][poster]:not([controls])` and re-raises the poster (`preload='none'` + `load()`); a poster-less illustration video would go blank for those readers instead of standing down. It is also the first paint and the fallback.
- **One file per face, the face in the filename** — `illustration-signal-white.mp4`, `illustration-signal-navy.mp4`. Never reuse one bake across two surfaces.
- **BT.709 tags are mandatory** — primaries + transfer + matrix, limited range, `yuv420p`. An untagged or BT.601 (`smpte170m`) file decodes through the wrong matrix and the flat ground lands a few values off the CSS surface: a ghost rectangle on exactly the surface it was made for. Reference encode:
  ```
  ffmpeg -i in.mov -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 24 \
    -vf "scale=out_color_matrix=bt709:out_range=tv,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv" \
    -movflags +faststart -an out.mp4
  ```
  Acceptance: decode a frame, sample a corner pixel, and it must equal the surface hex exactly (`#ffffff` / `#072447` — verified for the two shipped demo files on 2026-09-03).
- The frame **may be baked in** (device bezel, browser chrome, card edge) — the same doctrine as the device-mock PNG. The baked pixel IS the UI; nothing is rebuilt in the DOM on top of it.
- Decorative loops take `aria-hidden="true"`; the surrounding copy carries the meaning.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Never add `controls`, a play/pause button, or a scrim.** Chrome on an illustration video is the drift this component exists to prevent; if the piece needs controls it is not an illustration.
- **Never bake against a gradient or image surface.** Those move under the video — parallax, brand theme, viewport — and no bake can track them. Use a real media card there.
- **Never rebuild the baked frame in the DOM** (islands, headers, rings, rows). Addendum 3, device-mock rule.
- **Do not write per-page reduced-motion JS.** The stand-down is global; a page-level `<script>` is banned outright.
- **RTL: the engine does not flip video.** A directional animation needs a mirrored export — the same rule as a directional image.
- Do not mint a `.cmp-illustration-video` ruleset. The composition is atoms; scoping them would make the capability un-reusable.
- The demo files are demo CONTENT. Real pages upload their own bakes; do not treat `illustration-signal-*` as required assets.

## Authoring rule
Read `blocks/illustration-video.html`. Reuse the frame + `<video class="media-cover">` line verbatim and change CONTENT only (src, poster, aspect, copy). To put an illustration video in a *different* block, copy that one line into that block's media slot — the contract is the markup, not this section.
