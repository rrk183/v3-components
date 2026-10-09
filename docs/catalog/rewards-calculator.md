# Rewards Calculator (split)

`rewards-calculator` · Tools & Calculators · **statement** · surface-white · `data-behavior="rewards-calculator"`

## Look
A two-column split. The LEFT column is a free content placeholder — as shipped,
an "at a glance" summary (eyebrow, H2, three icon facts, a benefits bullet
list), but any content or another block's body can sit there. The RIGHT column
is a minimal calculator: a title, a soft blue-wash card holding one question
line and six slider rows (bold label left, live dirham value right, slider
below — no bounds, no tabs, no radios), then a navy result band with one big
figure + unit ("Miles per year") and a smaller hairline-separated notes slot inside the band. Below 1024 the columns stack
and the panel caps at 560px.

## Motion
Both columns reveal up (the panel with a small delay). Everything else is live
state: the recipe repaints per-row values, slider fills, and the total on every
`input`.

## Anatomy
```
section.cmp.cmp-rewards-calculator.surface-white.section-y
        [data-behavior="rewards-calculator"][data-divisor][data-multiplier]
└ .container-ds > .rc-split
  ├ .rc-lead.ds-stack           ← PLACEHOLDER: any content
  │   ├ .ds-eyebrow + h2.type-h2
  │   ├ .rc-facts > .rc-fact ×3 (.rc-fact-ico svg + .rc-fact-body)
  │   └ h3.type-h4 + ul.rc-points
  └ aside.rc-panel
      ├ h3.rc-title
      ├ .rc-card > p.rc-q + .lc-field ×6
      │     └ .lc-head (.lc-label-text + output.lc-value.aed[data-rc-out])
      │       label > .sr-only + input.range[data-rc-spend][data-rate]
      └ .rc-result.surface-primary > .rc-result-label +
            .rc-result-line (output.rc-total[data-rc-total] + .rc-unit) +
            p.rc-result-note   ← notes slot, hairline-separated, inside the band
```

## Content contract
- **The maths is a weighted sum, not amortisation**: total = Σ(value ×
  `data-rate`) ÷ `data-divisor` × `data-multiplier`. As shipped: AED spends ÷
  3.6725 (USD) × 12 → Skywards Miles per year. Repurpose by editing only the
  attributes (e.g. cashback: rates as percentages, divisor 1, multiplier 12).
- Each slider carries its own `data-rate`; authored `value`s must match the
  printed `data-rc-out` texts (the pre-JS state crawlers see).
- Six rows fit the card comfortably; fewer is fine, more starts to scroll.
- The unit label (`.rc-unit`) is plain text — keep it honest about the period
  (`per year` when multiplier is 12).
- The LEFT column is disposable placeholder content — replace wholesale.
- Money values carry `.aed` (glyph from CSS); never type a currency symbol.

## Accessibility
- Sliders are label-wrapped with `.sr-only` names — the block carries no ids
  and can repeat on a page.
- The recipe maintains `aria-valuetext` (formatted number) on each range.
- Only the total is `aria-live="polite"` — one drag announces one figure.
- The result band is `surface-primary`, so its text rides the surface tokens.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.rc-card` is a LIGHT ISLAND (it paints its own wash), so the slider labels
  and result copy keep light-mode ink on dark surfaces.
- The card interior pins light-surface tokens locally so the rows stay
  readable when the SECTION surface goes navy/dark/blue — don't remove that.
- Slider styling is the shared calculator kit (scoped to both calculator
  behaviors). Don't fork the `.range` atom; new variants join the `:is()` scope.
- No result breakdown, no bounds, no tabs — that's the loan calculator. This
  variant stays minimal by design.

## Authoring rule
Read `blocks/rewards-calculator.html`. Reuse the structure and every
`data-rc-*` hook verbatim; change the copy, the left column, and the
per-row `data-rate` / range attributes only.
