# Insight Split

`illustration-split` · Feature Sections · **supporting** · surface-white · reveal

## Look
A two-column split: copy on the left (eyebrow + headline + sub + CTA), and on
the right a CSS-illustrative "insight" composition — an ambient brand blob, an
icon tile (in place of a photo), a proactive "Live insight" message card, and an
animated metric bar. No photos; the whole visual is pure markup, so it themes
and animates with the runtime. Shares the `cmp-illustration-split` styling with the
`illustration-split-grey` reversed variant.

## Motion
Copy elements reveal up in a stagger (`data-reveal="up"` with delays
.06 → .12 → .18). The stage reveals up (`data-reveal-delay=".1"`). The metric
bar fills when its `.isp-metric` reveals (`data-reveal="fade"`); the fill width
comes from `--isp-pct` set inline on `.isp-metric` (e.g. `--isp-pct:86%`). No
scroll-pinning.

## Anatomy
```
section.cmp-illustration-split.surface-white.section-y[data-animate]
└ .container-ds > .isp-grid
  ├ .isp-copy
  │  ├ .ds-eyebrow + h2.isp-h + p.isp-sub   ← all data-reveal
  │  └ .isp-cta > a.btn.btn-primary
  └ .isp-stage (data-reveal)
     ├ .isp-blob (ambient, aria-hidden)
     └ .isp-comp
        ├ .isp-tile (icon SVGs, aria-hidden)   ← stands in for a photo
        ├ .isp-msg (.isp-eyebrow "Live insight" + p with <em>)
        └ .isp-metric[style=--isp-pct:NN%] (data-reveal=fade)
           ├ .isp-mhd (label + percent)
           └ .isp-track > .isp-fill
```

## Content contract
- **One copy column + one illustrative column.** Single instance, not a list.
- Copy: eyebrow (≤2 words), headline (`.isp-h`, 1 short sentence), sub
  (`.isp-sub`, 1–2 sentences), one CTA button.
- Message card: a "Live insight" eyebrow + 1 short sentence (use `<em>` to
  emphasise a phrase).
- Metric: a label, a percent value shown in `.isp-mhd`, and the matching
  `--isp-pct` percentage on `.isp-metric` — keep the two in sync.
- No image slots — the icon tile is decorative SVG.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep `--isp-pct` on `.isp-metric` in sync with the percent text in `.isp-mhd`;
  the bar width is driven by the variable, the number is just copy.
- **Keep `data-reveal="fade"` on `.isp-metric`** — the bar fill triggers on that
  reveal; dropping it can leave the bar empty (reveal gotcha).
- Keep `.isp-blob` and `.isp-tile` (aria-hidden) — they are the composition; the
  stage looks empty without them.
- Add `.isp-rev` on the section root to flip columns (this is exactly what
  `illustration-split-grey` does).

## Authoring rule
Read `blocks/illustration-split.html`. Reuse the grid structure, reveal hooks and
`--isp-pct` mechanism verbatim; change only the eyebrow/headline/sub/CTA text,
the message sentence, and the metric label/percent (both places).
