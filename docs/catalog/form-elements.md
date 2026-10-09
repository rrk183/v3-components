# Form Elements

`form-elements` · UI Elements · **utility** · surface-white · reveal (eyebrow only)

## Look
A light reference section that lays out the whole form toolkit in labelled
groups, top to bottom: floating-label text inputs (default, filled, error,
disabled, textarea), selects + a search field, range sliders, then checkboxes / radios /
toggles in three columns, a drag-and-drop file upload zone, and finally the
button gallery (every style and size). It is a specimen sheet, not a real form.

## Motion
Reveal-on-scroll on the first group's eyebrow only (`data-reveal="up"`); the
later group eyebrows are static. Inputs use a CSS floating-label trick
(`placeholder=" "` + label), checkboxes/radios/toggles are CSS-styled native
controls. No JS behavior recipe.

## Anatomy
```
section.cmp-form-elements.surface-white.section-y[data-animate]
└ .container-ds
  ├ Text Inputs   ← p.bt-label + grid of .field
  │     (input/textarea + label; .field.error adds .field-error; .field-hint)
  ├ Select & Search ← 2 .field>select + .fe-search (icon + input[type=search])
  ├ Checkboxes/Radios/Toggles ← 3 columns:
  │     label.check (.box+svg), label.radio (.box), label.switch (.track)
  ├ File Upload   ← label.fe-drop > input[type=file] + svg + copy
  └ Buttons       ← .btn variants row + .btn size row
```

## Content contract
- This is a **specimen catalog** — it intentionally shows one of each state, not
  a usable form. Default counts: 5 text fields, 2 selects + 1 search, 4
  checkboxes / 3 radios / 4 toggles, 2 range sliders, 1 file drop, 7 button styles + 4 sizes.
- Every `.field` pairs an `input`/`textarea`/`select` with a sibling `label`;
  the accessible name comes from `aria-label` on the control (**no `for`/`id`**
  — blocks are ID-free so they can repeat on one page). `placeholder=" "` is
  required for the floating label to work.
- States are shown by class/attribute: `.field.error` + `.field-error`,
  `disabled`, `.field-hint`, `.fe-muted` for disabled-look text.
- No images, no live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `placeholder=" "` on inputs/textarea and the `aria-label` on every
  control — the floating label and accessibility both depend on them. Dropping
  the placeholder breaks the label animation. Never introduce `for`/`id`.
- Use the established state classes (`.field.error`, `.field-hint`,
  `.fe-muted`) rather than inventing inline styles.
- `.range` is the slider atom (blue = the form selected accent, like checked
  states). Its track fill comes from `--range-fill` — ds.js keeps it live on
  input; pass `style="--range-fill: 40%"` for the static initial state.
- Keep the `.check`/`.radio`/`.switch` wrapper structure (hidden input + styled
  `.box`/`.track`) — these are CSS-skinned native controls.
- When picking pieces for a real form, lift only the `.field`/control patterns
  you need; you don't have to ship the whole specimen.

## Authoring rule
Read `blocks/form-elements.html`. Reuse the field/control structure and classes
verbatim; change only labels, placeholders, option values, hint/error text and
button labels.

## Scope
De-scoped 2026-09-01 — `cmp-fe-*` → global `fe-*` classes; specimen labels are `.bt-label`. The legacy Buttons group was removed from the block (blocks/buttons.html is the buttons showcase).
