# Expand Duo

`expand-duo` · Bento Grids · **statement** · surface-white · behavior `expand-duo`

## Look
Two tall, rounded, full-bleed photo panels side by side with no section header.
Each panel has a navy bottom wash, a glass chip label at the top-start corner, an
optional white illustrative UI card at the top-end corner (with an
"Illustrative" badge under it), and a white headline at the bottom. The active
panel is wider (1.7 : 1), shows its photo at full colour and reveals a soft
paragraph and an accent pill button under the headline. The other panel shows
only photo, chip and headline, slightly dimmed. Harvested from the C&IB home
trade and markets act (`cib-home-final.html`, section 5).

## Motion
- The row reveals up on first view.
- Recipe `expand-duo`: hover, focus (tabbing into a pane's button) or tap
  opens a pane. The panes ease to 1.7 : 1 over 0.9s; the active photo zooms
  from 1.08 to 1 and loses its dim; its UI card fades down into place (0.25s
  delay); its paragraph and button open (grid rows 0fr to 1fr). A sparkline
  path in the card draws in.
- The first pane is open on arrival (`.is-active` in markup).
- Under 768px, JS off or reduced motion: no collapse, both panes fully open
  (side by side from 768px, stacked below).

## Anatomy
```
section.cmp-expand-duo.surface-white.section-y[data-animate][data-behavior=expand-duo][aria-label]
└ .container-ds > .exd-row (data-reveal)
  └ article.exd-pane.media-frame.surface-image[data-exd-pane] × 2  (first: .is-active)
     ├ img.media-cover.exd-img            ← style="--focus:x y"
     ├ span.ov.ov-primary.ov-gradient-b.ov-90
     ├ span.chip.chip-glass.exd-chip      ← line-of-business label
     ├ .exd-frag[role=group][aria-label]  ← OPTIONAL illustrative slot
     │  ├ .card-panel.surface-white.exd-card  ← any small composition; demos:
     │  │    tracker: p.exd-card-top (title + badge) + ol.exd-steps.ink-mute > li(.is-done | .is-now[aria-current=step])
     │  │    rate:    p.exd-card-top (label + badge) + p.exd-rate + svg.exd-spark + p.exd-card-meta
     │  └ p.exd-tag > span.badge.badge-sm.badge-outline.ink-white "Illustrative"
     └ .exd-body
        ├ h2.type-h2.exd-h.ink-white
        └ .exd-more > div
           ├ p.type-body.exd-p.ink-soft
           └ a.btn.btn-accent.btn-pill.is-arrow.exd-cta
```

## Content contract
- **Exactly two panes.** For three or more, use Bento Expand.
- Photos: landscape, at least 1400px wide, subject clear of the top-end corner
  (the card) and the bottom third (the copy). Set `--focus` per photo.
- Chip: 2 to 5 words (the line of business). Headline: one sentence, at most
  about 45 characters, so it holds on the narrowed pane. Paragraph: 1 to 2
  sentences, at most about 190 characters. Button: 2 to 4 words.
- UI card: one small card, at most 5 short lines; keep the "Illustrative"
  badge whenever the data is invented. Amounts in AED use the `.aed` atom.
- Tracker steps: 3 to 5, with exactly one `.is-now`.

## Drift cautions
- Do not restyle the panels' ground or wash in CSS; darken or lighten with the
  `ov-NN` class in markup.
- Keep `data-exd-pane` on both panes and `.is-active` on exactly one.
- Keep `.exd-more > div` as the single wrapper; the open/close animation needs it.
- No IDs: panes are not labelled by heading IDs.
- The button is the only link in a pane; do not wrap the whole pane in `<a>`
  (the pane is a tap target for expanding).

## Authoring rule
Always start from `blocks/expand-duo.html`; change only content (text, chip,
the card's contents, photos, `--focus`, links) and reuse the structure and
classes verbatim.
