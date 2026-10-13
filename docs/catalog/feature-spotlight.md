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

## Options
- **Button instead of text link:** the row may end with one filled button (e.g. `btn btn-navy btn-lg`).
- **Link optional:** a row may end without the text link.
- **Section header above:** a `section-head` may introduce the rows.
- **Meta line:** a date-style `meta-dot` line may replace the tick list; the title may step down one size.
- **Paragraph instead of list:** a second body paragraph may replace the tick list.
- **Single row:** one row is a normal use; the reversed second row is only for alternating pairs.
- **Corner tag optional:** the `chip` on the media may be dropped.
- **Tick list:** the `ul.list-check.fsp-points` is optional per row; delete it for a copy-only row.
- **Rows:** any number; `.fsp-reverse` flips a row.
- **Anchor id (instances only):** a page may add `id="..."` to the root.
- **Navy ground** (2026-10-13): on `surface-primary` the eyebrow takes `ink-accent-soft`, the copy `ink-white` / `ink-soft` and the checklist `ink-soft`; the FX, rates, equities, fixed-income and money-markets pages use it.

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
