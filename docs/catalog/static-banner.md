# Static Banner

`static-banner` · CTA & Banners · **statement** · any surface (paints a navy
gradient on dark surfaces; light surfaces paint themselves) · static

## Look
A rounded banner band: headline + CTA on the left, a single transparent
render of two overlapping phones rising out of the banner's bottom edge on
the right. On dark surfaces the banner paints the navy→blue gradient.

## Anatomy
```
section.cmp.cmp-static-banner.surface-*[data-animate]
└ .container-ds
  └ banner body (flex-col md:flex-row)
    ├ copy: .ds-stack › eyebrow/headline (br-split line) + .sb-cta .btn
    └ img.sb-phones-img  ← ONE transparent PNG (assets/images/device/sb-phones.png)
```

## Content contract
- Headline ≤2 lines (a `<br class="hidden md:block">` splits the long line).
- One CTA. The phones are ONE image — swap the asset, never rebuild UI.

## Drift cautions
The CSS phone mockups (`.sb-shell`/`.sb-screen`/`.ps-*`) are DELETED
(2026-09-01, device-image doctrine): device chrome is a transparent PNG
captured from the DS's own mock, styled only by `.sb-phones-img` sizing +
drop-shadow. Never reintroduce mockup markup. Regenerate the PNG via the
capture rig if the mock design changes.

## Authoring rule
Read `blocks/static-banner.html`. Reuse structure/classes verbatim; change
only content (text + the image asset).
