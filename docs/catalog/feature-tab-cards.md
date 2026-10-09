# Feature Tab Cards

`feature-tab-cards` · Tabs · **supporting** · surface-grey · `data-tabs` (`data-autoplay="6000"`)

## Look
A grey section whose top row is a strip of **5 image cards**, each a photo
thumbnail with an audience label (Sellers, Sales Leaders, Founders, RevOps,
Marketers) — these double as the tab triggers. Below, the active panel splits
into a left block (big navy headline + outline CTA button) and a right block of
two stacked feature blurbs (bold title + paragraph).

## Motion
`data-tabs` with `data-autoplay="6000"`: clicking an image card switches to its
panel; the deck also auto-advances every 6 s (pauses on hover, per the recipe).
Within each panel the headline, CTA and two features reveal-up on first view via
`data-reveal` + staggered delays. Panel images load via `data-bg`.
Note: the original auto-advanced every 10 s with a progress ring — that ring is
not part of `ds.js` `data-tabs`, so there is no progress bar here.

## Anatomy
```
section.cmp-feature-tab-cards.surface-grey.section-y[data-animate]
└ .container-ds
  └ [data-tabs][data-autoplay=6000].ftc
    ├ .ftc-row[role=tablist]   ← 5 button.ftc-card[data-tab] (first .active):
    │     .ftc-img[data-bg] + .ftc-label
    └ 5 × [data-panel].ftc-panel (first .active):
        ├ .ftc-left  ← h2.type-h2 + a.btn.btn-outline.ftc-cta (with arrow svg)
        └ .ftc-right ← 2 × .ftc-feature (.ftc-feature-title + p)
```

## Content contract
- **5 tabs = 5 image cards + 5 panels**, paired by `data-tab` / `data-panel`
  ids; exactly one card and one panel carry `.active`.
- Per card: a thumbnail (`.ftc-img[data-bg]`) + a short label (1–2 words).
- Per panel: one headline (≤6 words), one CTA, and **exactly 2** feature
  blocks (bold title + 1–2 sentence paragraph each).
- **5 image slots** (one per card), square/landscape thumbnail crop.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `data-tab`/`data-panel` ids matched 1:1 with one `.active` pair, or the
  wrong panel renders.
- Keep `role="tablist"` and `aria-label` on the cards for accessible tabs.
- Adjust or remove `data-autoplay` only to change the auto-advance cadence; the
  reveal delays inside panels are per-element, not on the panel root.

## Authoring rule
Read `blocks/feature-tab-cards.html`. Reuse the 5-card/5-panel structure and ids
verbatim; change only the labels, headlines, CTA text, the 2 feature blurbs and
`data-bg` image refs.
