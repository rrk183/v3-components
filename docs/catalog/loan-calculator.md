# Loan Calculator

`loan-calculator` · Tools & Calculators · **statement** · surface-grey · `data-behavior="loan-calculator"`

## Look
The only calculator variant. A centred section head, then a two-column body: controls on the start side, a
navy result card on the end side. The controls are a tab-style loan-type radio
row (icon over label, blue underline on the selected one), two sliders with
their bounds printed underneath and the live value between them, and a rate /
disclaimer note. The result card leads with the monthly figure at
`clamp(38px, 4vw, 52px)`, then a hairline-separated breakdown of total
repayment and total interest, a full-width primary CTA, a text link, and a
tinted "borrow wisely" foot. Below 1024 the card drops under the controls and
the loan-type row scrolls sideways.

## Motion
Section head and panel reveal up. Everything else is live state, not
animation: the recipe repaints the figures and the slider fill on every
`input`. Thumb scales 1.08 on hover (dropped under reduced-motion).

## Anatomy
```
section.cmp.cmp-loan-calculator.surface-grey.section-y[data-behavior="loan-calculator"][data-currency]
└ .container-ds
  ├ .ds-stack.section-head.is-center.measure
  └ .lc-split
    ├ .lc-controls
    │   ├ fieldset.lc-types > legend.lc-legend + label.lc-type ×3
    │   │     └ input[type=radio][data-lc-type][data-rate…] + .lc-type-inner
    │   ├ .lc-field ×2  → label.lc-label > .lc-label-text + input.lc-range[data-lc-amount|term]
    │   │                 .lc-bounds > [data-lc-*-min] + output[data-lc-*-out] + [data-lc-*-max]
    │   └ p.lc-note > output[data-lc-rate]
    └ .lc-result.surface-primary
        ├ .lc-result-top → .lc-result-label + output.lc-monthly[data-lc-monthly][aria-live]
        │                  dl.lc-breakdown > .lc-row ×2 ([data-lc-total], [data-lc-interest])
        │                  a.btn.btn-primary.lc-cta + a.lc-link
        └ p.lc-result-foot
```

## Content contract
- **Three loan types** fits the row; more needs the sideways scroll to earn its
  keep. Each radio carries its OWN economics — `data-rate`, `data-min`,
  `data-max`, `data-amount`, `data-term-min`, `data-term-max`, `data-term` —
  so switching product re-ranges both sliders. Edit those attributes, never the
  maths.
- Exactly one radio `checked`, and its defaults must match the `value`/`min`/
  `max` authored on the two ranges (the markup is the pre-JS state crawlers and
  no-JS readers see).
- The note must say the figure is indicative and not an offer. Keep it.
- `data-currency` on the root sets the prefix on every money figure.

## Accessibility
- Loan type is a real radio group in `fieldset`/`legend` — arrow keys work with
  no JS, and the group is announced as a group.
- Sliders are WRAPPED in their labels: the block carries **no ids**, so it can
  be placed twice on one page without collisions.
- The recipe maintains `aria-valuetext` on each range, so a screen reader says
  "AED 30,000", not "30000".
- Only `.lc-monthly` is `aria-live="polite"`. Don't add more live regions — one
  slider nudge should announce one number, not the whole panel.
- Focus rings are 3px `--blue` at 4px offset on the ranges. Don't remove them.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The recipe is the only place the amortisation lives (`P·r / (1 − (1+r)⁻ⁿ)`).
  Never re-implement it on a page, and never put a `<script>` in the block.
- `--lc-fill` is published by ds.js — the range's filled track cannot be done
  in CSS alone. Don't "simplify" it away.
- Don't swap the radios for `<button>` tabs; you would lose the keyboard and
  grouping semantics the fieldset gives for free.

## Authoring rule
Read `blocks/loan-calculator.html`. Reuse the structure and every `data-lc-*`
hook verbatim; change only the copy, the CTA targets, and the per-product
`data-rate` / limit attributes.
