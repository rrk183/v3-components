# CTA Band

`cta-band` · CTA & Banners · **supporting** · surface-primary · static

## Look
A compact, centred closing call-to-action band on a navy surface: a small
eyebrow, a large `type-h2` headline, a muted lead sentence, and a single primary
button. Sits in a narrow container so it stays tight and centred — a quiet
conversion moment to close a page.

## Motion
Static. Each element reveals up on scroll in a stagger — eyebrow, headline
(`delay .05`), lead (`.1`), then the CTA row (`.15`), all via `data-reveal="up"`.
No recipe, no countup.

## Anatomy
```
section.cmp.ptf-ctaband.surface-primary.section-y[data-animate]
└ .container-narrow
  ├ span.ds-eyebrow            ← eyebrow (data-reveal up)
  ├ h2.type-h2.on-surface      ← headline (delay .05)
  ├ p.type-body.on-surface-mid ← lead sentence (delay .1)
  └ .ptf-ctarow                ← a.btn.btn-primary (delay .15)
```

## Content contract
- **One eyebrow + one headline + one lead + one CTA button.** Single band.
- Eyebrow: ≤3 words; headline: short `type-h2`; lead: 1 sentence.
- `.ptf-ctarow` holds the single primary CTA by default.
- No images, no live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `.ptf-ctaband` + `.ptf-ctarow` and the `.container-narrow` — the centred,
  narrow band styling is keyed to these.
- It is a compact closing CTA — keep it to one button by default rather than
  adding a button cluster.
- Keep the stagger delays so the reveal reads in order.

## Authoring rule
Read `blocks/cta-band.html`. Reuse structure/classes verbatim; change only
content (text + media refs).
