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

## Options
- **Wide header column:** `container-ds` instead of `container-narrow` for the header, when a long statement would otherwise break onto an orphan word.
- **Figure strip:** instead of the rank strip, a row of up to three big figures (`type-display-lg ink-primary` + `type-body-sm ink-mute` label) in a `container-ds` under the statement, with an optional footnote.
- **Rank strip numbers:** each rank may lead with an `rs-num` (e.g. "#1").
- **Sources footnote:** an optional centred `type-body-sm ink-mute` line under the rank strip.
- **Headline size:** `type-display-xl` or `type-display-xxl`.
- **Rank strip** (2026-10-12): instead of the closing link, a `ds-eyebrow` label plus a divided `.rank-strip` of up to three ranked claims (`rs-label` + `rs-sub`) under the statement.
- **Closing link optional:** the `bst-link` text link under the statement may be dropped.
- **Compact headline** (2026-10-12): the headline may be a single normal-size `h2.bst-line.type-h2` without the `bst-l` / `bst-w` line and word spans (no word reveal), for a quieter intro.
- **Anchor / label id (instances only):** a page may give the headline an id used by `aria-labelledby` on the root.

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
