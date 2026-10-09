# Section Header

`section-header` · UI Elements · **utility** · surface-white · _(no behavior — composition card)_

Registered 2026-09-01 (Hakan: "the gallery does not have to limit itself to unique components — it can have compositions"). A **composition card** per CONVENTIONS.md: no component class is minted (`.cmp-section-header` is showcase chrome only); everything on it is existing atoms.

## Look
The standard section opener: `.section-head` (or `.section-head-sm`) carrying a `.ds-stack` (eyebrow + title) with optional `.sh-lead` and optional `.sh-action` (a `btn btn-text` "view all" link). The demo places a quiet `card-panel surface-grey is-tile` below to show the header owning its own row.

## The alignment axis (2026-09-01: EVERY header carries it)
- default → left, stacked
- `.is-center` → centred (width-capped columns centre as boxes too)
- `.is-right` → end-aligned; logical properties, flips under RTL
- `.is-split` → headline left + lead right (2-col ≥768, stacks below)

Use the gallery's **Header control** on this card to flip all four live.

## Content contract
- Title is **tag-agnostic**: `<h2 class="type-h2">` normally; the page's single `<h1>` only when this section is the page headline.
- `.sh-lead` ≤ ~60ch; `.sh-action` is a **child of the header**, never a sibling in a wrapper row (a wrapper makes Centered/Split silent no-ops — the events/markets-articles bug).
- Split needs two groups — eyebrow+headline alone has nothing for the right column (the gallery marks Split "n/a").

## Drift cautions
- **Never wrap a `.section-head` in a bespoke flex row.** Put the modifier ON the header.
- Never hand-build a header from utilities — this composition is the one shape.

## Authoring rule
Read `blocks/section-header.html` and copy; change only content and the alignment modifier.
