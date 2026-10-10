# Bento — Feature + Research

`bento-research` · Bento Grids · **statement** · surface-white · static (cmp-bento composition) + reveal

## Look
An asymmetric bento on the shared 12-column `cmp-bento` grid. On the start
side, an 8-wide, 6-tall photo feature tile with navy washes at top and bottom:
a large white two-tone headline at the top; at the bottom a lead, a row of
glass chips and a white text link. On the end side, a ghost (transparent)
4-wide column: a two-tone headline, a claim line with one bold word, a wrap of
neutral topic badges, then two research cards on the mute ground, each with a
wide photo, a title, one line and a text link. Harvested from the C&IB home
Islamic finance + research act (`cib-home-final.html`, section 8).

## Motion
- Both tiles reveal up on first view.
- Hovering a research card zooms its photo slightly (1.03).
- No recipe; nothing hides, so JS-off and reduced motion lose nothing.

## Anatomy
```
section.cmp-bento.bento-research.surface-white.section-y[data-animate][aria-label]
└ .container-ds > .bn-grid
  ├ .bn-tile.is-w8.is-h6.is-t-full.surface-image.justify-between.bnr-feature (data-reveal)
  │  ├ img.media-cover                       ← style="--focus:x y"
  │  ├ span.ov.ov-primary.ov-gradient-t.ov-50 + span.ov.ov-primary.ov-gradient-b.ov-70
  │  ├ h2.type-h1.bnr-feature-h.ink-white (+ span.ink-soft second sentence)
  │  └ .bnr-feature-foot
  │     ├ p.type-body.bnr-feature-p.ink-white
  │     ├ ul.bnr-chips > li.chip.chip-lg.chip-glass × 3–5
  │     └ a.btn.btn-text.is-arrow.ink-white
  └ .bn-tile.is-ghost.is-w4.is-h6.is-t-full.bnr-col (data-reveal)
     ├ .bnr-intro
     │  ├ h2.type-h3.bnr-col-h.ink-primary (+ span.ink-mute second sentence)
     │  ├ p.type-body-sm.bnr-claim.ink-mute (> b.ink-primary one word)
     │  └ ul.bnr-tags[aria-label] > li.badge.badge-lg.badge-neutral × 4–8
     └ article.card-panel.surface-mute.bnr-card × 2
        ├ .media-frame.bnr-media > img.media-cover   ← 21:9, real alt text
        └ .bnr-text > h3.type-h4.bnr-card-t + p.type-body-sm.bnr-card-d + a.btn.btn-text.is-arrow.ink-accent
```

## Content contract
- Feature headline: two short sentences (second in `ink-soft`), at most about
  45 characters. Lead: one or two sentences, at most about 230 characters.
  Chips: 3 to 5, each at most 4 words. One text link.
- Research headline: two sentences, the second in `ink-mute`. Claim: one line
  with exactly one bold word. Badges: 4 to 8 topic names, at most 3 words each.
- Exactly two research cards: title at most about 30 characters, one line at
  most about 70 characters, one text link (with an `sr-only` suffix naming the
  card, so the two identical link labels are distinguishable).
- Photos: the feature photo landscape, at least 1600px wide, with calm areas
  at the top and bottom for the copy; card photos crop to 21:9, set `--focus`.

## Drift cautions
- Keep the spans in markup (`is-w8` / `is-w4`, `is-h6`, `is-t-full`); never
  size the tiles in CSS. Rows follow the research column; the photo tile
  stretches to its height (at least min(80vh, 760px)).
- The research column is a ghost tile: no ground of its own. The cards carry
  `surface-mute`; do not restyle them with a custom fill.
- Tags are non-interactive labels: `badge`, not `chip` or buttons.
- No IDs: headings are not referenced by `aria-labelledby`.

## Authoring rule
Always start from `blocks/bento-research.html`; change only content (text,
chips, badges, card photos with alt text, `--focus`, links) and reuse the
structure and classes verbatim.
