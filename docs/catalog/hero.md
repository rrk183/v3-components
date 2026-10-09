# Hero

`hero` · Heroes · **showpiece** · surface-primary default · _(single stage; carousel mode = the shared data-carousel core)_

**THE hero (cmp-hero v4, 2026-09-01).** ONE component for the static-opener estate. Media is CONTENT: `<video class="media-cover">`, a `media-cover` span with `data-bg` (+ `--focus`), or nothing — the surface paints (the flat hero for free). Washes are `.ov` atoms, authored PER STAGE — carousel slides each carry their own overlays. Copy is a `ds-stack` of atoms (tag-agnostic title: `h1` on the page that owns it, `h2.type-h1` elsewhere). Extras (stat strips, quick links) are compositions. Supersedes hero-video-left (63 pages), hero-image-left (20), hero-fullbleed (15), hero-video-center (4), the legacy hero-carousel and editorial-story — see docs/MIGRATION.md. Scroll-driven heroes are a different family and STAY.

## Anatomy
`section.cmp.cmp-hero[.is-*]` > `.hero-stage` > media + `.ov`s + `.container-ds.hero-frame` > `.hero-copy.ds-stack` (+ optional extras row). Carousel: root carries `data-carousel data-autoplay` + `style="--hero-auto: 7s"`; `.hero-track[data-carousel-track]` of stages, `.hero-nav` > numbered pagination (`[data-carousel-dots]` — CSS counters restyle the recipe dots to 01/02/03 with a timed underline) + frosted `crl-btn` arrows + `crl-toggle`.

## Axes
- Align: `is-left` (default) / `is-center` / `is-right` — copy position + text alignment + CTA justification.
- Place: `is-top` / `is-middle` (default) / `is-bottom`.
- Every combo stands down to bottom-start below 768 \u2014 `is-m-align` (the Mobile control) keeps the desktop alignment instead.
- Gallery axes: Surface, Overlay, Align, Place, Mobile, and (on the Carousel variant) Autoplay + Nav \u2014 the same shared controls as cards.
- Slides mix media freely: a video slide beside image slides; the recipe runs only the CURRENT slide's video.
- Height `--hero-min`, copy width `--hero-copy-max`, focal `--focus` — all `--var` passing.

## Drift cautions
- Never author alignment with page utilities (the six-spellings disease) — set the two `is-*` axes.
- Washes are always `.ov` atoms — never bespoke gradient divs.
- `surface-dark` stays banned; the default is `surface-primary` under the media.
