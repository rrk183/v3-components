# Empty State

`empty-state` · UI Elements · **utility** · surface-white · reveal

## Look
A light section showing two families of placeholders: a 3-up row of bordered
cards (icon + title + body + button) for full-region empty states — no
transactions, no results, and an error variant in red — followed by a narrow
stack of compact inline rows (icon + title + caption + small action button) for
in-context empties like "no documents" or "no beneficiaries".

## Motion
Reveal-on-scroll only: the two eyebrows and every card/inline row fade-slide up
in a stagger via `data-reveal="up"` + `data-reveal-delay` (.06/.12/.18). No
behavior recipe, no interaction — the buttons are inert demos.

## Anatomy
```
section.cmp-empty-state.surface-white.section-y[data-animate]
└ .container-ds
  ├ .section-head-sm        ← .ds-eyebrow "Empty States"
  ├ .grid (md:grid-cols-3)  ← 3 .es-card.card-panel.is-flat:
  │   • .icon-tile (--it-size:64px) + h4.type-h5 + p.type-body-sm + button.btn
  │   • 3rd card is .es-card-error (red icon .icon-tile.es-icon-error + .btn-danger)
  ├ .section-head-sm.es-inline-head ← .ds-eyebrow "Inline / Compact…"
  └ .flex.flex-col (max-w 560px) ← 2 .es-inline:
      • .es-inline-icon + .flex-1(title + caption) + .btn.es-btn-blue
```

## Content contract
- **3 large cards + 2 inline rows** (the canonical set). The 3rd card is the
  error variant (`.es-card-error`, `.es-icon-error`, `.btn-danger`).
- Card: title ≤4 words (`type-h5`), body 1–2 sentences (`type-body-sm`), one
  button. Inline row: bold title (one line) + a single caption sentence + a
  one-word action button.
- Each card/row carries its own SVG glyph in an `.icon-tile` (64px in cards via `--it-size`, `.is-sm` inline).
- No images, no live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.es-card` composes `.card-panel.is-flat` for its paint (a LIGHT ISLAND) and pins the
  on-surface tokens back to light ink.
- Keep the `.es-card.card-panel.is-flat` / `.es-inline` structure and the icon tiles — all
  styling (border, centering, error tint) is keyed off these classes.
- Preserve the error pairing (`.es-card-error` + `.es-icon-error` +
  `.btn-danger`) on the variant card; don't recolor it ad hoc.
- Reveal lives on the eyebrows and each card/row; keep delays staggered so the
  group animates in sequence rather than all at once.

## Authoring rule
Read `blocks/empty-state.html`. Reuse the structure and classes verbatim; change
only the icon glyphs, titles, body/caption copy and button labels.
