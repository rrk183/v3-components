# Hero — Cinematic (pinned)

`hero-cinematic-pinned` · Heroes · **showpiece** · surface-dark · `data-behavior="scroll-story-scrub"`

## Look
A full-viewport dark cinematic stage: a scroll-scrubbed container-ship push-in
(121-frame photo sequence) rendered to a canvas, with a darkening overlay and
three text phases that hand off as you scroll — an opener (bottom-left), a mid
push-in (centered), and a closing phase (bottom-left) carrying the CTAs.

## Motion
The section **pins** and the frame sequence scrubs to scroll progress
(`data-scrub-vh="340"` ≈ 3.4 screen-heights; `data-source="images"`,
`data-count="121"`, `data-path` with `###` index, `data-start="1"`). The overlay
darkens across the whole scroll (`opacity 0.4→0.74`). Each phase declares its own
`data-anim` keyframes over progress 0→1: phase 1 rises/blurs in early then exits,
phase 2 enters mid then exits, phase 3 settles in at the end. Only one phase is
visible at a time. Driven by the declarative `scroll-story-scrub` engine — no
bespoke JS.

## Anatomy
```
section.cmp-hero-cinematic-pinned.surface-dark[data-animate]
└ .scin[data-behavior=scroll-story-scrub][data-scrub-vh=340]
       [data-source=images data-count=121 data-path=… data-start=1]
  └ .scin-stage
    ├ canvas.scin-canvas[data-story-canvas]   ← scrubbed frame sequence
    ├ .scin-overlay[data-anim]                ← darkens with scroll
    ├ .scin-phase.scin-bottom[data-anim]      ← P1: eyebrow + h1 + sub + scroll cue
    ├ .scin-phase.scin-center[data-anim]      ← P2: eyebrow + h2 + sub
    └ .scin-phase.scin-bottom[data-anim]      ← P3: eyebrow + h2 + .scin-actions (2 CTAs)
```

## Content contract
- **3 phases**, each with its own `data-anim` range (sequenced to hand off
  cleanly). Each phase: eyebrow + headline (`<br>` line breaks) + optional sub.
- Headlines fill the viewport — keep short (≤6 words per line).
- Phase 1 includes a `.scin-cue` "Scroll to explore" affordance; phase 3 holds
  the actions block with two links (primary `.btn` + `.scin-ghost`).
- Frame sequence: 121 images at `data-path` (`###` → zero-padded index from 1).
  Swapping the sequence means updating `data-path` + `data-count` together.
- No live countups — type/number content is literal text.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` JSON** unless retuning deliberately — the phase
  ranges and overlay opacity are sequenced to hand off; changing copy is safe.
- Keep `data-count` matching the actual number of frames at `data-path`, and keep
  `data-source`/`data-path`/`data-start` consistent or the canvas won't scrub.
- Keep `canvas[data-story-canvas]` — the engine renders frames into it.
- One idea per phase; it shows a single phase at a time.

## Authoring rule
Read `blocks/hero-cinematic-pinned.html`. Reuse structure/classes verbatim;
change only content (text + media refs).
