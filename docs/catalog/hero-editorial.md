# Hero — Editorial

`hero-editorial` · Heroes · composition of **[[hero]]**

The editorial-story anatomy on [[hero]]: display-XL headline pinned low (`is-bottom`, `--hero-copy-max` widened) + a countup `ds-num` stat strip under a hairline (`border-t on-surface-border` utilities). Replaces the editorial-story hero (10 pages) — the extras slot is pure composition.

## Options
- **Video media:** a `video.media-cover` (autoplay muted loop playsinline) may replace the image.
- **Extra washes:** additional `ov` layers for legibility.
- **Button row:** up to two buttons under the copy.
- **Mid-page use:** as a band inside a page, use `h2` for the headline.
- **Editorial grid strip** (2026-10-12): for four facts, the stat strip may be a `grid grid-cols-2 md:grid-cols-4` with smaller `ds-num is-sm is-light ink-white` figures; figures may be words (e.g. "Net Zero 2050") as well as numbers.
- **Anchor id (instances only):** a page may add `id="..."` to the root.
