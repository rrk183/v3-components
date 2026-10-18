# World Map - V2

`hex-reach-map` · Storytelling & Scroll · **showpiece** · surface-white (any ground) · behavior `markets-map`

Root class `.cmp-markets-map`. Styled in `style.css`, driven by the `markets-map`
recipe in `ds.js`. Until 2026-10-12 the block carried its own inline style and
script; both moved into the runtime so master changes reach every instance.

## Look
A full-screen, scroll-scrubbed dot-matrix world map. The two-line headline
starts large and centred, then docks to the start side. The camera flies
chapter by chapter (home, region, Europe, Asia by default): each market's pin
pops with a soft halo and its country's dots light up blue. A caption names
the current chapter above a hairline; the counter rolls up as markets appear.
The scrub ends on a wide overview with the lead paragraph.

## Motion
- Pinned stage, scroll-scrubbed with a damped (inertial) progress.
- WebGL dots with a 2D canvas fallback.
- Reduced motion: no pin, no scrub; renders the final overview directly.
- Arabic: the copy docks right and the map frame moves left; geography and
  digits never mirror.

## Anatomy
```
section.cmp.cmp-markets-map.surface-*[data-behavior=markets-map][aria-label] (.is-figs with a stats row)
└ .cm__stage
  ├ canvas.cm__canvas + .cm__veil + .cm__frame + .cm__pins   (all aria-hidden)
  ├ span.ds-eyebrow.cm__eyebrow.ink-accent(-soft)?            ← option
  ├ h2.cm__title > span.cm__line.cm__line--1 + span.cm__line.cm__line--2
  ├ p.cm__lead
  ├ .cm__stat
  │  ├ .cm__chapters > span.cm__chapter[data-view="w,s,e,n"] × 2–5
  │  ├ .cm__rule
  │  └ .cm__count (rolling counter + .cm__unit)  OR  ul.cm__figs > li.cm__fig × 1–3  OR  nothing
  └ ol.cm__markets.sr-only > li[data-country][data-lon][data-lat][data-chapter][data-place][data-home?]
```

## Options
- **Eyebrow** (off by default): add `span.ds-eyebrow.cm__eyebrow` before the
  title, `ink-accent` on light grounds, `ink-accent-soft` on dark. It fades in
  as the headline docks. Gallery: Eyebrow · Off / On.
- **Stats** (counter by default): the rolling counter counts the listed markets
  and carries a short unit line. Replace it with a stats row
  (`ul.cm__figs`, 1 to 3 items of `span.cm__fig-num` + `span.cm__fig-label`,
  plus `.is-figs` on the root), or delete it for chapters + rule only.
  Gallery: Stats · Counter / Row of 3 / Off.
- **Ground:** any surface class on the root; the dots, pins and copy re-derive
  their colours from it.
- **Anchor id (instances only):** a page may add `id="..."` to the root when in-page links jump to the section (sub-nav, "scroll to" buttons). The master block itself stays ID-free.

## Content contract
- Headline: two short lines (line 2 is the muted half), at most about 30
  characters each. Lead: one or two sentences, at most about 200 characters.
- Markets: 1 to 23. `data-country` must be the map's English country name
  ("United Arab Emirates", "Saudi Arabia", "United Kingdom"); the visible pin
  label is the li text (a city or short country name). One `data-home`.
- Chapters: 2 to 5 short captions (1 to 4 words). Every market's
  `data-chapter` must point at one.
- Stats row figures: at most about 10 characters; labels at most about 50.

## Drift cautions
- No IDs and no inline style or script: everything lives in style.css / ds.js.
- Colours are component tokens (`--cm-*`) pointing at brand tokens; set the
  ground in markup, never recolour the map in page CSS.
- The section is very tall (about 6 viewports): use one per page.

## Authoring rule
Start from `blocks/hex-reach-map.html`. Change content only (headline,
lead, chapters, markets, stats, eyebrow text) and the documented options.

## Phones and foldables (2026-10-14)
- Below 1024px the map shows the dots only (no place labels). Under the stats rule one line names the region and the place whose dot lit up last ("UAE - Dubai", then "ASIA - Mumbai", "ASIA - Shanghai"...); the place name swaps, it never accumulates. The recipe builds `.cm__places` from `ol.cm__markets`, so nothing to author; Arabic uses the translated names.
- Tablets and foldables (768-1023): the lead takes only the room left beside the stats (40px gap). Phones: the recipe places the lead 28px above the stats block.
- The map area always ends above the lead and stats, and lifts with them above phone browser bars.
- Arabic figures wrap inside their column (they carry their words).
- Landscape foldables and small landscape tablets (stage 768-1023 wide and wider than tall, e.g. Galaxy Z Fold 8 open at 928 x 515-613): the title keeps the top row; below it the copy column (lead, place line, stats) sits on the start side and the map fills the rest at full height. Container query `cm-stage` on the stage; mirrors in Arabic.
