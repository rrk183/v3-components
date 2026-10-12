# Hero — Text Fade

`hero-text-fade` · Heroes · **showpiece** · surface-dark · `data-behavior="scroll-story"`

## Look
A pinned full-bleed dark hero. Three crossfading background photos with a subtle
Ken-Burns zoom sit behind three centered captions (eyebrow + two-line headline +
sub) that fade in and out one at a time as you scroll. Minimal, typography-led,
cinematic.

## Motion
The section **pins** and the story scrubs to scroll (`data-scrub-vh="340"` ≈ 3.4
screen-heights). Both backgrounds and captions carry their own `data-anim`
keyframes over progress 0→1: each `.sth-bg` fades in with a scale `1.06→1`
Ken-Burns and fades out as the next enters; each `.sth-cap` rises/blurs in then
exits up/blur. Only one caption is visible at a time. Driven by the declarative
`scroll-story` engine — no bespoke JS.

## Anatomy
```
section.cmp-hero-text-fade.surface-dark[data-animate]
└ .sth[data-behavior=scroll-story][data-scrub-vh=340]
  └ .sth-stage
    ├ span.sth-bg[data-bg][data-anim]   ×3  ← crossfading Ken-Burns backgrounds
    ├ .ov.ov-black.ov-gradient-b.ov-70      ← bottom gradient
    └ .sth-caps
       └ .sth-cap[data-anim]  ×3            ← eyebrow + h1.sth-title + p.sth-sub
```

## Options
- **Alignment:** `is-left` or `is-right` on the root docks every caption to
  that side (default centred). A single caption can take `is-right` to sit on
  the opposite side.
- **Phase scrim:** an extra side-gradient `ov` with `sth-ov-phase` and its own
  `data-anim` window darkens one side only while a right-hand caption shows.
- **Highlights row:** a caption may end with a short ticked list (2 to 4 items,
  `ul.flex` of `li.type-body-sm.ink-soft` with an `ink-accent-soft` tick).
- **Per-slide button:** a caption may end with one
  `a.btn.btn-glass.btn-sm.btn-pill.is-arrow` link.
- **Extra overlays:** add or swap `ov-gradient-*` washes for legibility.
- **Anchor id (instances only):** a page may add `id="..."` to the root.

## Content contract
- **3 captions** + **3 background images** (pairs are sequenced — keep counts
  matched; each added caption/bg needs its own `data-anim` range).
- Per caption: eyebrow (≤4 words), headline (`<br>` for two lines, ≤6 words/line),
  one sub sentence.
- 3 background images via `data-bg` on `.sth-bg` (full-bleed cover, landscape).
- No countup, no CTAs — pure type + imagery.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Do NOT edit the `data-anim` JSON** unless retuning deliberately — caption and
  background ranges are sequenced to hand off cleanly. Changing copy is safe.
- Keep captions and backgrounds matched in count; an unpaired range leaves a
  caption with no backdrop (or a backdrop with no copy).
- Keep `data-scrub-vh` unless you want a longer/shorter scroll.
- One caption per beat — designed to show a single one at a time.

## Authoring rule
Read `blocks/hero-text-fade.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
