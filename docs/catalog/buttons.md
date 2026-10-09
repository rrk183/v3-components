# Buttons

`buttons` · UI Elements · **utility** · surface-white · _(no behavior — pure atom showcase)_

Rebuilt 2026-09-01 (Hakan's button model) into **THE canonical button system — one atom, four axes**. Like Badges & Tags, this is a *showcase of existing atoms*: the only CSS it owns is the `.cmp-buttons` label/row chrome. This card replaced the short-lived separate CTAs & Links card — the text link is a button TYPE, not a second atom.

## The model — TYPE × ICON MODE × SIZE × RADIUS
- **Types** (ROLE-named, never color-named — paint rides brand tokens):
  - `.btn-filled` — the primary action (paints `--navy`)
  - `.btn-accent` — the secondary action (paints `--blue`)
  - `.btn-outline` — tertiary; auto-flips on dark surfaces
  - `.btn-text` — the quiet text button + optional arrow; the in-card "go deeper" affordance. Its arrow mirrors under `[dir="rtl"]`.
- **Icon modes** (markup, not classes): label only · label + inline SVG (the `.btn` gap spaces it) · **icon-only** = add `.btn-icon` and wrap the label in `.sr-only` — the accessible name must stay in the DOM.
- **Sizes**: `.btn-xs` (28px — dense mouse-first chrome only, never a primary CTA) · `.btn-sm` · default · `.btn-lg` · `.btn-xl`.
- **Radius**: each size has its restricted default; `.btn-pill` = 999px, a circle when icon-only.

## Content contract
- Buttons are `<a class="btn btn-<type>">` (or `<button>` for real actions); icon SVGs are inline with `currentColor`.
- `btn-outline-light` is **the** outline for navy/dark/image surfaces.
- Disabled = the `disabled` attribute.
- Icon-only buttons ALWAYS carry `<span class="sr-only">Label</span>`.
- `.btn` = a page's actions; `.btn-text` covers the quiet forward link inside cards and lists.

## Legacy paints — valid until the sweep
`btn-primary` (accent-colored), `btn-navy` (filled-colored), `btn-ghost`, `btn-danger`, `btn-outline-blue` remain on ~100 live pages and keep working. **New work composes only the role types above.** The estate sweep migrates `btn-primary → btn-accent`, `btn-navy → btn-filled`.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- **Never invent a button class** (`btn-light` and `hvl-btn-secondary` were exactly this drift). If a design seems to need one, it is a type × mode × size × radius combination — check here first, then ask.
- Never drop the `.sr-only` label from an icon-only button.
- Contact CTAs point at the contact page, never `mailto:` (repo convention).
- This card is documentation; the atoms live in ds.css `.btn*` — changing a button's look is an atom edit, not a card edit.

## Authoring rule
Read `blocks/buttons.html` for the exact markup of each combination and copy the one you need. Pages compose these atoms directly; there is no `cmp-buttons` on real pages.
