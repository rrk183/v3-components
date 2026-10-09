# Feature Spotlight

`feature-spotlight` · Feature Sections · **statement** · surface-white · reveal

## Look
A light section of full-width spotlight rows, each pairing a large media panel
(with a small floating product tag) against a tight copy block: eyebrow, big
navy headline, a lead paragraph, a 3-item checklist, and a text link. Rows
alternate media side — the second row adds `.fsp-reverse` to flip the image to
the right — for an editorial zig-zag rhythm.

## Motion
Reveal-on-scroll only: each row's media and body fade-slide up via
`data-reveal="up"` (body offset by `data-reveal-delay=".06"`). No behavior
recipe or interaction. Images load via `data-bg`.

## Anatomy
```
section.cmp-feature-spotlight.surface-white.section-y[data-animate]
└ .container-ds.fsp-rows
  └ .fsp-row  (2nd row adds .fsp-reverse to flip sides)
    ├ .fsp-media[data-bg][data-reveal]  ← .fsp-tag (product name)
    └ .fsp-body[data-reveal]
       ├ .ds-eyebrow
       ├ h2.type-h2.fsp-title
       ├ p.fsp-lead (.measure)
       ├ ul.fsp-points  ← 3 li, each .fsp-check + text
       └ a.fsp-link
```

## Content contract
- **2 rows** (the canonical alternating pair). Add more by repeating `.fsp-row`
  and toggling `.fsp-reverse` to keep the zig-zag.
- Per row: eyebrow (≤3 words), headline ≤8 words, one lead sentence
  (`.measure` caps line length), **exactly 3** checklist items (short phrases),
  one link.
- **1 image slot per row** (`.fsp-media[data-bg]`), landscape; the `.fsp-tag`
  overlay holds a product name.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `.fsp-reverse` alternating across rows so media doesn't stack on one side.
- Keep the 3-item `.fsp-points` list with `.fsp-check` spans — the check marks
  are styled, not characters; don't swap in plain bullets.
- Reveal lives on `.fsp-media` and `.fsp-body`; don't move it to the row root.

## Authoring rule
Read `blocks/feature-spotlight.html`. Reuse the row structure, `.fsp-reverse`
alternation and classes verbatim; change only the tag, eyebrow, headline, lead,
the 3 list items, link text and `data-bg` image refs.
