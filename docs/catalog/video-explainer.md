# Video Explainer

`video-explainer` · Product & Device Showcases · **statement** · surface-soft · behaviour `videoExplainer` (`[data-video-explainer]`)

## Look
A centred section header (heading and a one-line lead) over a large rounded
16:9 film frame. Before playing, the frame shows the poster with a white
"Watch the video" pill: a blue round play icon, the label and the running
time. Harvested from the API Banking page (`api-banking-v1a.html`, section 6),
where the styles and behaviour already lived in the runtime.

## Motion
- Header and frame reveal up on first view.
- Click the pill: the film plays with sound and the native controls take over.
- When the film ends it returns to the poster and focus goes back to the pill.
- Reduced motion: no pill hover scale. The film never autoplays.

## Anatomy
```
section.cmp.cmp-video-explainer.surface-*.section-y[data-animate][aria-label]
└ .container-ds
  ├ .section-head.is-center > .ds-stack > h2.type-h2.ink-primary  +  p.type-body.sh-lead.ink-mute
  └ .vx-frame[data-video-explainer] (data-vx-mq / data-vx-src-m / data-vx-poster-m optional)
     ├ video.vx-video[controls][playsinline][preload=metadata][poster][aria-label] > source
     └ button.vx-play[hidden][aria-label] > span.vx-play-ic (svg) + span.vx-play-lbl > span.vx-dur
```

## Options
- **Phone cut:** `data-vx-mq` (a media query), `data-vx-src-m` and
  `data-vx-poster-m` on the frame swap to a portrait (9:16) film on matching
  screens, only while idle.
- **Ground:** any surface on the root (soft by default).

## Content contract
- Heading: one question or statement, at most about 50 characters. Lead: one
  sentence, at most about 140 characters.
- Film: 16:9 MP4, H.264, narrated or captioned; poster 1600px wide or more.
- The running time appears in the pill (`vx-dur`) and in both aria-labels.

## Drift cautions
- Never add `autoplay`, `muted` or `loop`: it is a click-to-play film with sound.
- Keep `controls` on the video for the no-JS fallback; the behaviour hides them
  until first play.
- No IDs: label the section with `aria-label`, not `aria-labelledby`.

## Authoring rule
Start from `blocks/video-explainer.html`; change only content (heading, lead,
film and poster paths, running time and labels) and the documented options.
