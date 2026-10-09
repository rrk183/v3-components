# Devices & Features

`devices-features` · Product & Device Showcases · **supporting** · any surface · static

## Look
A split: feature cards (icon-tile + title + body in `card-panel`s) beside a
device stage — a laptop render with a phone render overlapping it. Both
devices are transparent PNG images.

## Anatomy
```
section.cmp.cmp-devices-features.surface-*[data-animate]
└ .container-ds
  ├ .section-head.is-split › .ds-stack › .ds-eyebrow + h2 + .sh-lead
  ├ .dvf-grid › .dvf-feat.card-panel ×N › .icon-tile + title (.on-surface) + body (.on-surface-mid)
  └ .dvf-stage › img.dvf-laptop-img + img.dvf-phone-img  ← transparent renders
```

## Content contract
- 3–4 feature cards; title ≤4 words, body one sentence.
- Devices are ONE image each (assets/images/device/dvf-laptop.png /
  dvf-phone.png) — swap assets, never rebuild chrome.

## Drift cautions
The CSS device frames (`.laptop`/`.laptop-screen`/`.dvf-screen`) are
DELETED (2026-09-01, device-image doctrine). `.dvf-laptop-img`/
`.dvf-phone-img` carry only sizing + drop-shadow. Regenerate PNGs via the
capture rig when the mock changes.

## Authoring rule
Read `blocks/devices-features.html`. Reuse structure/classes verbatim;
change only content.
