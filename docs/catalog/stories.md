# Stories

`stories` · Feature Sections · **statement** · surface-white · `data-behavior="stories"`

## Look
A split section head, then a rail of Instagram-style story chips: 78px
circular avatars wrapped in a brand conic-gradient ring (blue → soft blue →
gold), name beneath, horizontally scrollable with no visible scrollbar.
Tapping a chip opens a fullscreen viewer: near-black scrim, a centred
9:16 stage (true fullscreen ≤767px) with segmented progress bars, the
group's face + name + close at the top, the media full-bleed behind a
subtle top/bottom scrim, and an eyebrow + headline caption at the bottom.
Desktop shows round chevrons either side of the stage for group navigation.
A chip's ring turns grey (`.is-seen`) once its LAST slide has been reached —
per visit only, nothing is stored.

## Motion
The viewer is the motion: each image slide runs `data-dur` seconds (default
5) on a rAF clock filling its bar segment; video slides autoplay muted and
their bar follows the REAL video time, advancing on `ended`. Interactions:
tap the leading third for previous, the rest for next; press-and-HOLD
pauses (release resumes); horizontal swipe ≥60px jumps a whole group;
Arrow keys mirror tap nav; Escape or × closes. Ring hover scales 1.04
(dropped under reduced-motion; the progress clock is functional and stays).

## Anatomy
```
section.cmp.cmp-stories.surface-white.section-y[data-behavior="stories"]
└ .container-ds
  ├ .section-head.is-split
  └ .st-rail > .st-group ×N
      ├ button.st-chip > .st-ring > img.st-face + .st-name
      └ .st-slides[hidden] > .st-slide[data-media][data-video?][data-dur?]
            └ p.st-cap-eyebrow + p.st-cap        ← caption, cloned into viewer
(runtime, appended to the section by ds.js on first open:)
.st-viewer[role=dialog] > .st-gnav-prev + .st-stage + .st-gnav-next
  .st-stage > .st-bars + .st-head(face/name/close) + .st-media + .st-scrim + .st-caption
```

## Content contract
- One `.st-group` per story: the chip (face image + name) and its slides.
- Each `.st-slide` carries `data-media` (a real file under `assets/`),
  `data-video` when it's a video (muted autoplay; keep files small — the
  demo videos are ≤400KB), `data-dur` seconds for images (default 5), and
  optional `data-overlay="tint|scrim"` — a legibility wash for busy imagery
  (tint = flat navy 45%, scrim = heavier top/bottom gradient).
- The caption is EVERYTHING inside the slide, cloned into the viewer: `<p>`s
  plus optional `a.st-cta` (the DS `.btn.btn-primary`) and `a.st-link`
  (white underline link). Links are clickable islands — tapping them never
  navigates slides or triggers hold-to-pause. The AR dictionary translates
  it all like any other copy.
- 3–8 groups reads well; the rail scrolls beyond that.
- Faces should be square-ish images (object-fit cover crops them round).

## Accessibility
- Chips are real `<button>`s with visible focus rings; the viewer is
  `role="dialog" aria-modal` and takes focus on open; close returns focus
  to the story's chip.
- Escape closes; Arrow keys navigate slides (direction-aware in RTL).
- Bars/scrim are decorative; the face image in the head is `alt=""` with the
  name as adjacent text. Videos are muted by design — captions carry the
  message, so no audio-only content.
- `html.st-lock` freezes page scroll while the viewer is open.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The viewer is built ONCE per section at runtime and appended inside it —
  don't author viewer markup in pages, and don't move it to `<body>` (the
  styling is scoped under `.cmp-stories`).
- Slides hide behind `[hidden]` on `.st-slides` — never a display:none
  utility on each slide; the recipe reads them in place.
- Don't add autoplaying audio; muted is a hard rule for story videos.
- The seen state is deliberately per-visit (no localStorage) — keep it that
  way unless a real product decision says otherwise.

## Authoring rule
Read `blocks/stories.html`. Reuse the structure and every `st-*` class and
`data-*` hook verbatim; change faces, names, media paths, durations and
caption copy only.
