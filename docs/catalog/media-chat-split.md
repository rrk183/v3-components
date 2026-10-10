# Media Split, Live Chat

`media-chat-split` · Feature Sections · **statement** · surface-white · behavior `media-chat`

## Look
A two-column split. On the start side, a tall rounded media card: a photo
poster, an optional looping film over it, a navy bottom wash, and a frosted
glass chat panel pinned to the bottom-end corner. The panel holds a "who"
line with a green online dot, one white message bubble, a reply chip and an
"Illustrative" badge. On the end side: eyebrow, a two-tone headline (second
sentence in the mute ink), a lead, a small uppercase label over a check-list,
and two pill buttons (filled + outline). Harvested from the C&IB home
relationship act (`cib-home-final.html`, section 3).

## Motion
- Copy reveals up in a stagger (`data-reveal="up"`, delays .06 to .24); the
  media card reveals up.
- Chat (recipe `media-chat`, once, at 40% visible): the bubble rises in
  showing typing dots, the message replaces the dots after 0.9s, the reply
  chip rises in at 1.7s.
- Film: loads only when the card reaches the viewport (`data-src`, or
  `data-src-m` under 768px), fades in over the poster when it starts, plays
  while a quarter of the card is visible, pauses otherwise. A glass pause
  button appears once it plays; a user pause sticks.
- Reduced motion, JS off or no IntersectionObserver: no film (poster only),
  the whole conversation is visible, nothing is hidden.

## Anatomy
```
section.cmp-media-chat-split.surface-white.section-y[data-animate][data-behavior=media-chat]
└ .container-ds > .mcs-grid
  ├ .mcs-media.media-frame (data-reveal)
  │  ├ img.media-cover            ← poster, style="--focus:x y"
  │  ├ video.media-cover.mcs-film[data-src][data-src-m]   ← optional
  │  ├ span.ov.ov-primary.ov-gradient-b.ov-90             ← wash under the chat
  │  ├ button.btn.btn-glass.btn-icon.btn-sm.is-pause.mcs-pause[data-mcs-pause][hidden]
  │  └ .mcs-chat.card-panel.surface-glass[role=group][aria-label]
  │     ├ p.mcs-who.type-caption.ink-white > span.mcs-online + name
  │     ├ .mcs-bubble.surface-white[data-chat-step]
  │     │  ├ span.mcs-typing (3 × i, aria-hidden)
  │     │  └ p.mcs-msg.type-body-sm.ink-primary
  │     ├ p.mcs-reply[data-chat-step] > span.chip.chip-glass
  │     └ p.mcs-tag > span.badge.badge-sm.badge-outline.ink-white
  └ .mcs-copy
     ├ p.ds-eyebrow.ink-accent
     ├ h2.type-h1.mcs-h.ink-primary (+ span.ink-mute for the second sentence)
     ├ p.type-body-lg.mcs-lead.ink-mute
     ├ p.type-eyebrow.mcs-label.ink-mute
     ├ ul.list-check.mcs-points.ink-primary > li × 3–6
     └ .mcs-btns > a.btn.btn-filled.btn-pill + a.btn.btn-outline.btn-pill
```

## Content contract
- **One instance per section,** one media card and one copy column.
- Media: a landscape photo, at least 1600px wide, with the subject on the
  start/centre side so the chat panel (bottom-end corner) does not cover a
  face; set `--focus` on both poster and film. Film optional, muted, no
  essential information, desktop cut ≤ 10 MB, phone cut ≤ 5 MB.
- Chat: one "who" line (a role, not a real person's name), ONE incoming
  message of at most 2 short sentences (~110 characters), ONE reply of 2–4
  words. Keep the "Illustrative" badge whenever the exchange is invented.
- Amounts in the message use the `.aed` atom (symbol before the digits) with
  an `sr-only` "AED" for screen readers; never write "AED" next to it.
- Copy: eyebrow 1–3 words; headline two short sentences (second in
  `ink-mute`); lead 1–2 sentences; label 2–5 words; 3–6 check items of 2–4
  words; two buttons, primary first.

## Drift cautions
- Do not restyle the chat panel's ground in CSS: it is `card-panel
  surface-glass`, legible because of the `ov-gradient-b ov-90` wash beneath
  it. Keep the wash at 90 for bright photos; lower it (ov-70) only for a dark
  photo. Never add a custom panel fill.
- Keep `[data-chat-step]` on the bubble and the reply; the recipe reveals
  steps in DOM order. A step holding `.mcs-typing` gets the typing beat.
- Keep `hidden` on the pause button in markup; the recipe shows it only
  when the film actually plays.
- No IDs: the chat panel is labelled with `aria-label`, not `aria-labelledby`.
- The split holds from 768px up (open foldables, tablets, desktop) and
  mirrors in RTL; under 768px it stacks, media first. `.is-rev` flips the
  columns wherever the split shows.

## Authoring rule
Always start from `blocks/media-chat-split.html`; change only content (text,
`--focus`, image and video refs, button labels and links) and reuse the
structure and classes verbatim.
