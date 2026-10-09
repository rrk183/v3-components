# Badges, Tags & Lists

`badges-tags` · UI Elements · **utility** · surface-white · _(no behavior — pure atom showcase)_

Rebuilt 2026-09-01 to **THE BADGE MODEL** — mirrors the button model: one atom, three axes. The former showcase-scoped `bt-*` variants (purple/sky/grey tones, solid/outline one-offs, xs/md/tiny sizes) were **deleted**: they were unusable by pages and duplicated the axes.

## The model — TONE × STYLE × SIZE
- **Tones** (ROLE-named; paint rides the semantic tokens): `badge-ok`, `badge-warn`, `badge-danger`, `badge-info`, `badge-neutral`. Former purple "Draft" → neutral; sky "Scheduled" → info.
- **Styles**: tint (default) · `badge-solid` (brand emphasis) · `badge-outline` (transparent, ink from the tone via currentColor).
- **Sizes**: `badge-sm` · default · `badge-lg`.
- Radius rides `--r-pill`.

Also on this card: the global **`.chip`** atom — ONE selectable-pill model: base `.chip`, size axis `.chip-lg` (filter-chip geometry), selected state `[aria-pressed="true"]` (`.chip-active` is the legacy alias), removable `chip-x`; `.filter-chip` rides the same model — and the **`.list-check`** atom.

## Legacy — valid until the sweep
`badge-green/amber/red/blue` are grouped aliases of the role tones (same rules, zero extra CSS); `badge-navy` is a legacy indigo emphasis with no role. New work uses role names only.

## Content contract
- Status dots are literal `●` characters in the label, not CSS.
- Chips are interactive (filter UI); badges are static labels — don't swap their roles.
- Brand/product names stay Latin in the AR preview.

## Drift cautions
- **Never invent a badge class or color.** A need that seems new is a tone × style × size combination; if a tone is genuinely missing, ask — don't mint.
- Never re-scope a variant under `.cmp-badges-tags` — that trap is what this rebuild removed.

## Authoring rule
Read `blocks/badges-tags.html` for exact markup. Pages compose these atoms directly.
