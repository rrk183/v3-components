# Tap Ripple

`tap-ripple` · Product & Device Showcases · **showpiece** · surface-soft · behaviour `tap-ripple` (`data-behavior="tap-ripple"`)

## Look
A light, bright pinned scene for a card product. The card lies flat on a
floor under the opening line, then stands up facing the reader. Benefit
photos (4:5, rounded) stand around it at different depths, the four nearest
with a white benefit pill. The closing line, a one-sentence benefits summary
and two buttons sit at the bottom over a soft fade. Inspired by the card
section of moto-card.com (a card turning face-on inside a world of moments),
retold as our own story: a tap, and its ripple reaching every benefit.

## Motion
- Pinned for 460vh (420vh on phones), scrubbed by scroll with light smoothing.
- 0 to 20%: opening line holds, then fades up and out.
- 10 to 50%: the card lifts, turns one full spin (its back shows halfway) and faces the reader; a light sweep crosses its face.
- 15 to 85%: five contactless ripples spread across the floor; each photo stands up, hinged on its bottom edge, when the first ripple reaches it. The camera rises and slowly orbits throughout.
- 70 to 86%: the closing copy and buttons rise in.
- Reduced motion, no JS, or a screen too short for the closing copy (zoom, landscape phones): no pin, a static composition with everything visible.
- Keyboard: tabbing to a button before the end jumps the scroll to the closing beat.

## Anatomy
```
section.cmp.cmp-tap-ripple.surface-soft.section-y[data-animate][data-behavior=tap-ripple][aria-label]
└ .tr-stage
  ├ .tr-open.container-ds > p.ds-eyebrow.ink-accent + h2.type-display-lg.ink-primary.tr-h + p.tr-hint (arrow + "Scroll")
  ├ .tr-scene[aria-hidden] > .tr-world
  │   ├ span.tr-ring ×5  +  span.tr-shadow
  │   ├ figure.tr-tile[data-tr-x][data-tr-y](.is-ambient)(.is-edge) > img.tr-img (+ figcaption.tr-label.surface-white.type-caption.ink-primary)
  │   └ .tr-card > .tr-face (img.tr-card-img + span.tr-gloss) + .tr-face.tr-back
  └ .tr-end.container-ds > span.ov.ov-soft.ov-gradient-b.ov-90.tr-fade + p.type-display-lg.tr-h + p.type-body-lg.ink-mute.tr-sub + .tr-ctas (btn-filled + btn-outline, btn-lg)
```

## Options
- **Tile placement:** `data-tr-x` / `data-tr-y` on each `.tr-tile`, in px at 1440 wide (card at 0,0, negative y further away). The recipe scales them down on tablets and phones.
- **Ambient photos:** `.is-ambient` = no label; they appear only in the moving scene, not in the static layout.
- **Edge photos:** `.is-edge` = hidden under 1024px, where they would only show as a sliver.
- **Foldable side fillers:** `.is-fold` = shown only from 768 to 1023px (open foldables, tablets), where the narrower spread leaves the sides empty. Two by default, one per side, low and wide (x ±800, y +110 to +130). More reads as crowded; far fillers drift in over the labelled photos under perspective, so keep them near the front.
- **Ground:** surface on the root; soft by default. The fade above the closing copy is `ov-soft`, so change its colour word to match a different ground.

## Content contract
- Eyebrow: the product name. Opening and closing lines: two halves of one thought, about 25 characters each.
- Benefits sentence: one sentence, at most about 140 characters. AED amounts use `.aed` with an sr-only "AED".
- Card image: 720x455 or larger (ISO card ratio), the card face only, no background.
- Photos: 4:5, 440x550 (2x their display size). Not much bigger: a heavily minified photo sparkles in a moving 3D layer. Bright, people-led ENBD imagery.
- Labels: at most 4, one short benefit each (about 35 characters), on the four nearest tiles (x within ±600, y 0 to -600). Every label must be a true benefit of the card shown.
- About 9 photos on desktop and phones, plus the 2 foldable side fillers. More adds shimmer and edge-cropped clutter.

## Drift cautions
- Never give the rings a thin border or resize them per frame: hairlines on a tilted floor flicker. Keep the fixed 800px soft band.
- Never animate the gloss with `background-position` or add `mix-blend-mode`: both repaint the card face mid-scroll.
- Keep everything visible without `.tr-armed`; hidden motion states live only under it.
- The scene is placed by transforms, so it does not mirror in Arabic; only the copy does. That is deliberate.
- No IDs: label the section with `aria-label`.

## Authoring rule
Start from `blocks/tap-ripple.html`; change only content (eyebrow, the two
lines, benefits sentence, card image, photos, labels, button text and links)
and the documented options.
