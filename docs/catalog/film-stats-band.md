# Film Stats Band

`film-stats-band` · Stats · **showpiece** · surface-white · behavior `film-stats-band` + countup

## Look
One tall (82vh, at least 680px), rounded, full-width film card, inset a little
from the page edges. A looping film plays over a poster under a deep navy
bottom wash. At the bottom: a large white headline and a soft lead on the
start side, an outline pill button on the end side level with them, then a
thin white hairline and a row of four thin display figures (currency, number,
small unit) with short labels, separated by faint vertical dividers.
Harvested from the C&IB home investment banking act (`cib-home-final.html`,
section 6).

## Motion
- The card reveals up on first view.
- Film (recipe `film-stats-band`, shared `inViewFilm` helper): loads only when
  the card reaches the viewport (`data-src`, or `data-src-m` under 768px),
  fades in over the poster when it starts, plays while a quarter of the card
  is visible, pauses otherwise. A glass pause button appears once it plays; a
  user pause sticks.
- Figures count up once via the runtime's `data-countup` tier.
- Reduced motion or JS off: poster only, final figures shown.

## Anatomy
```
section.cmp-film-stats-band.surface-white[data-animate][data-behavior=film-stats-band][aria-label]
└ .fsb-film.media-frame.surface-image (data-reveal)
  ├ img.media-cover                      ← poster, style="--focus:x y"
  ├ video.media-cover.fsb-video[data-src][data-src-m]   ← optional
  ├ span.ov.ov-primary.ov-gradient-b.ov-90
  ├ button.btn.btn-glass.btn-icon.btn-sm.is-pause.fsb-pause[data-fsb-pause][hidden]
  └ .fsb-body
     ├ .fsb-head
     │  ├ .fsb-copy > h2.type-h1.fsb-h.ink-white + p.type-body.fsb-lede.ink-soft
     │  └ a.btn.btn-outline-light.btn-pill.is-arrow
     └ ul.fsb-stats[role=list] > li.fsb-stat × 4
        ├ span.sr-only                   ← the figure in words, read by screen readers
        ├ span.ds-num.is-light.fsb-num.ink-white[aria-hidden]
        │    "USD&nbsp;" + span[data-countup][data-decimals] + span.ds-num-unit
        └ span.type-caption.fsb-lbl.ink-soft
```

## Content contract
- **Exactly four figures** (the grid is 4 across, 2 x 2 below 1024px). For
  two or three, use Stats Row.
- Headline: one sentence, at most about 55 characters. Lead: one or two
  sentences, at most about 220 characters. Button: 2 to 4 words.
- Figure: currency + number (at most 4 digits) + a short unit (bn, mn, %).
  Label: at most about 50 characters (deal, venue and year, role).
- Every figure needs its `sr-only` twin in words, kept in sync with the
  visible number. AED amounts use the `.aed` atom instead of a currency code.
- Photo/film: landscape, at least 1280px wide, subject clear of the bottom
  half where the copy sits. Film muted, no essential information, at most
  about 6 MB per cut.

## Drift cautions
- The band has no vertical padding: it sits tight between sections. Add
  `section-y-tight` on the root for air; never pad it in CSS.
- Do not restyle the wash; change its strength with the `ov-NN` class.
- Keep `aria-hidden` on the visible figure and the `sr-only` twin beside it,
  or screen readers read the count-up as it runs.
- Keep `hidden` on the pause button in markup.
- No IDs: the section is labelled with `aria-label`.

## Authoring rule
Always start from `blocks/film-stats-band.html`; change only content (text,
figures and their sr-only twins, poster and film refs, `--focus`, the link)
and reuse the structure and classes verbatim.
