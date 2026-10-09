# CTA Marquee

`cta-marquee` · CTA & Banners · **statement** · any surface · pure CSS marquee

## Look
A closing CTA section with a scrolling word-tape behind/above the actions:
eyebrow + headline, the marquee tape of short phrases, then the button
row. The tape edge-fades, pauses on hover, reverses under RTL and stops
under reduced motion — all inherited from the marquee ATOM.

## Anatomy
```
section.cmp.cmp-cta-marquee.surface-*[data-animate]
└ .container-ds
  ├ .ds-stack.is-center › .ds-eyebrow + h2 (.measure)
  ├ .cm-clip › .cm-inner › .marquee › .marquee-track › .cm-item ×N (duplicated once)
  └ .cm-actions › .btn.btn-lg.btn-accent + .btn.btn-lg.btn-outline
```

## Content contract
- 4–8 tape items, ≤4 words each, duplicated once in markup (the duplicate
  set is the seamless-loop mechanism — keep it, aria-hidden).
- Two CTAs max.

## Drift cautions
The tape IS the marquee atom (`.marquee > .marquee-track`, 2026-09-01) —
speed via `--marquee-dur`, fade via `--marquee-fade`. The old bespoke
`.cm-track`/`.cm-fade-*`/`.cm-btn-*` are DELETED; buttons are the plain
btn model. Never fork the tape.

## Authoring rule
Read `blocks/cta-marquee.html`. Reuse structure/classes verbatim; change
only content.
