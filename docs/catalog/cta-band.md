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

## Options
- **Alignment:** `is-left` / `is-right` on the root. Left and right use the full content column, so the copy sits at the page margin, with the text kept to a readable measure.
- **Photo ground (left-aligned photo band):** `surface-image` + `data-bg` on the root (`--focus` for the focal point), with `ov` washes (e.g. `ov-dark ov-gradient-l ov-60`) as the first children. Typical with `is-left`.
- **Stats column** (2026-10-12): wrap the copy in `.ptf-band-grid > .ptf-band-copy` and add `.ptf-band-stats` with up to two `card-clear` tiles (`ds-num` figure + `type-body-sm ink-soft` label); from 1024px the stats sit right of the copy, aligned to its bottom.
- **Band height:** `is-tall` gives the copy a minimum height (440px, or `style="--band-min: …"`), centred vertically, so a photo band shows more of its photo.
- **Photo on top (small screens):** `is-photo-top` stacks the photo above the copy below 1024px and fades it into the navy, so a subject on the right of a wide plate is never cropped.
- **Headline size / button role:** `type-h1` or `type-h2`; any button role (e.g. `btn-filled btn-lg`).
- **Eyebrow optional; smaller headline:** `type-h2` instead of `type-h1`.
- **Two buttons:** a primary plus an outline-light secondary action.
- **Photo ground** (2026-10-12): `surface-image` with a `media-cover` photo and dark `ov` washes instead of plain navy.
- **Fine-print line:** an optional small `type-caption ink-soft` line under the button.

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
