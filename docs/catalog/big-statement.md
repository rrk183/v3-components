# Big Statement

`big-statement` · Heroes · **statement** · surface-white · reveal

## Look
An Apple-style opening editorial line: a narrow centered column with a small
eyebrow, an oversized two-line headline (intentionally regular weight, with one
emphasised word in blue), a supporting sub-paragraph, and a single text link.
Minimal — pure typography on any surface.

## Motion
Reveal-on-scroll only. The headline carries `data-reveal` (its two `.bst-l`
lines rise in); the eyebrow, sub and link each use `data-reveal="up"` with
increasing `data-reveal-delay` for a staggered settle. No recipe, no
scroll-pinning.

## Anatomy
```
section.cmp-big-statement.surface-white.section-y[data-animate]
└ .container-narrow  → .section-head.is-center (alignment via variant system)
  └ .ds-stack.section-head
     ├ span.ds-eyebrow[data-reveal=up]
     ├ h2.bst-line[data-reveal]   ← 2× span.bst-l > span.bst-w (one wraps <em> blue word)
     └ p.bst-sub.type-body-lg[data-reveal=up]
  └ a.bst-link[data-reveal=up]    ← text + →
```

## Content contract
- **One statement.** Headline is two lines (two `.bst-l` wrappers, each with a
  `.bst-w` word group); keep each line short (≤3 words) — it fills the column.
- Mark the key word with `<em>` to make it blue.
- One sub sentence (1–2 lines) and one link (text + →).
- No images, no live numbers — type-only.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the `.bst-line` → `.bst-l` → `.bst-w` nesting — the line-reveal animation
  targets these wrappers; flattening to plain text breaks the reveal.
- Keep the headline at regular weight and the single `<em>` accent — that
  restraint is the design; don't bold it or add more emphasis spans casually.
- Keep the narrow column (`container-narrow`); centring comes from `.section-head.is-center` — never re-add a `text-center` utility on the wrapper (it pins every alignment variant to centred).

## Authoring rule
Read `blocks/big-statement.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
