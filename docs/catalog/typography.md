# Typography

`typography` · UI Elements · **utility** · surface-white · _(no behavior — pure atom showcase)_

Registered 2026-08-31 (component-standardization pass) to make the **type atom ramp discoverable** and to teach the one rule the new component generation is built on: **type is tag-agnostic**. Like Buttons, this is a *showcase of existing atoms*: the only CSS it owns is the `.cmp-typography` specimen chrome (`.ty-row` / `.ty-class`); every type class comes from the ds.css atom layer.

## Look
Labelled specimen rows: **Display** (`type-display-xxl/xl/lg`), **Headings** (`type-h1`…`type-h6`), **Body & functional** (`type-body-lg/body/body-sm`, `type-eyebrow`, `type-caption`, `type-micro`), **Weights & colours** (`type-light`…`type-extrabold`, `type-navy/blue/mid`), and the **tag-agnostic demo** — an `<h2 class="type-h1">` and a `<p class="type-h1">` rendering identically.

## Content contract
- **The tag carries semantics, the class carries size.** One `<h1>` per page (the page's true headline, usually the hero); every other same-sized headline is `<h2 class="type-h1">` (or deeper). This is an SEO rule, not a styling preference.
- Never size text with a bare tag — a heading without a `.type-*` class is drift.
- Plus Jakarta Sans (EN) / Tajawal (AR) only. Drama via weight + scale, never a new typeface.
- Class-name labels (`.ty-class`) are code identifiers — deliberately Latin in the AR preview.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Never invent a type size.** A design that seems to need a new clamp is one of these classes on the right element — check here first, then ask.
- Component-specific title clamps (legacy `.hfb-title`-style rules) are what this ramp retires; new components use `.type-*` on the title slot.
- This card is documentation; the atoms live in ds.css — changing the ramp is an atom edit, not a card edit.

## Authoring rule
Read `blocks/typography.html` for exact markup. Pages compose these atoms directly; there is no `cmp-typography` on real pages.
