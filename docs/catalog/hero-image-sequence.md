# Hero — Image Sequence

`hero-image-sequence` · Heroes · **showpiece** · surface-dark (no surface-* on the recipe div) · `data-behavior="scroll-frames"`

## Look
A full-viewport dark hero driven by a scroll-scrubbed image sequence (121-frame
push-in) rendered to a canvas, with a bottom gradient and a single bottom-anchored
copy block — eyebrow + large display headline + lead paragraph. Premium
product-reveal feel.

## Motion
The `scroll-frames` recipe reads its config off the recipe div and scrubs the
canvas against this block's own scroll position (`data-scrub-vh="300"` ≈ 3
screen-heights; `data-source="images"`, `data-count="121"`, `data-path` with
`###` index, `data-start="1"`). The recipe preloads the sequence then advances
frames with scroll. The copy is static apart from a reveal-up on scroll-in
(`data-reveal="up"` on each line). One copy block only — no phase handoff (unlike
hero-cinematic-pinned). This slug is flagged HEAVY (heavy frame preload).

## Anatomy
```
section.cmp.surface-dark[data-animate]      ← surface-dark on the SECTION
└ [data-behavior=scroll-frames][data-scrub-vh=300]
       [data-source=images data-count=121 data-path=… data-start=1]
  └ [data-sf-stage]
    ├ canvas[data-sf-canvas]               ← scrubbed frame sequence
    ├ .ov.ov-gradient-b.ov-70              ← bottom gradient
    └ .container-ds > .ds-stack            ← bottom-anchored copy
       ├ span.ds-eyebrow[data-reveal=up]
       ├ h1.type-display-lg[data-reveal=up]   ← <br> line break
       └ p.type-body-lg[data-reveal=up]       ← lead (.measure)
```

## Content contract
- **One copy block**: eyebrow, display headline (`<br>` for two lines), one lead
  paragraph. No CTA in the authored markup.
- Frame sequence: 121 images at `data-path` (`###` → zero-padded index from 1).
  Swapping content means updating `data-path` + `data-count` together.
- No countup, no live numbers — literal text.
- The section root carries `surface-dark` and `.cmp`; the recipe div itself has
  no `surface-*` class.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `data-count` matching the real frame count and keep
  `data-source`/`data-path`/`data-start` consistent or the canvas won't scrub.
- Keep `[data-sf-stage]` and `canvas[data-sf-canvas]` — the recipe targets them.
- Keep the bottom gradient overlay for legibility over bright frames.
- It is a single static copy block (no phases) — don't add per-beat `data-anim`
  here; that's the `scroll-story-scrub` pattern, not `scroll-frames`.

## Authoring rule
Read `blocks/hero-image-sequence.html`. Reuse structure/classes verbatim; change
only content (text + media refs).
