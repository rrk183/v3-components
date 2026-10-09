# Footer — Option 2

`footer-option2` · Navigation · **utility** · surface-grey (page; card is `surface-primary`) · reveal

## Look
A compact, modern footer: a navy rounded card inset on a grey page. The card
leads with a large display heading ("Let's move forward, together."), a
newsletter-style row (text input + a CTA button), and a bottom row split into a
website-settings cluster (label + language toggle) on the left and an
"Emirates NBD on Social" cluster with 5 social icons on the right.

## Motion
Reveal-on-scroll only: the heading, form row and bottom row fade in via
`data-reveal` (`up` for heading/form, `fade` for the bottom) with staggered
`data-reveal-delay` (100/200). The input and CTA are inert demo controls — no
behavior recipe.

## Anatomy
```
section.cmp-footer-option2.surface-grey.section-y-tight[data-animate]
└ .container-ds
  └ footer.fo2-card.surface-primary
    ├ h2.type-display-lg.fo2-heading[data-reveal=up]
    ├ .fo2-form[data-reveal] ← input.fo2-input + button.fo2-cta
    └ .fo2-bottom[data-reveal=fade]
       ├ .fo2-settings ← .fo2-settings-label + .fo2-lang (flag + label + value)
       └ .fo2-social   ← .fo2-social-label + 5 a.fo2-social-link (svg icons)
```

## Content contract
- **One card** with: one heading, one input + one CTA, one settings cluster,
  one social cluster of **5 links** (Facebook, X, YouTube, Instagram, LinkedIn).
- Heading: a short sentence (`type-display-lg`). Input placeholder + CTA label
  are both short.
- Settings cluster shows a language toggle (flag emoji + label + value).
- No images; social icons are inline SVG.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- The navy card surface (`.fo2-card.surface-primary`) sits on a grey section — keep
  both surfaces; the inset look depends on the contrast.
- Keep all 5 social links and their `aria-label`s.
- Reveal lives on the heading, `.fo2-form` and `.fo2-bottom`; keep the delays so
  the card builds in sequence.

## Authoring rule
Read `blocks/footer-option2.html`. Reuse the card structure and classes
verbatim; change only the heading, input placeholder, CTA label and the
settings/social text.
