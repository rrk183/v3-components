# Tabs - Desk reel

`tabs-desk` · Tabs · **statement** · white surface · _(self-contained, inline script)_

Ported from the C&IB home lending section (`cib-home-final.html` section 6, `hf-ask-*`), renamed `td-*`. "With a desk for ____.": the chips rail picks a sector desk, the blank in the sentence rolls like a reel, the photo crossfades and a `card-panel` names the desk.

## Anatomy
`section.cmp-tabs-desk[data-tabs-desk]` > `.td-track` > `.td-pin` > `.td-grid` of `.td-copy` (`.td-q` h2, `.td-sentence` with `.td-slot > .td-reel` words, `.td-intents` of `button.chip.chip-lg[data-td-intent][aria-pressed]`, `.td-panel` copy + CTAs) and `.td-stage` (`.td-shot[data-bg]` per desk + `.td-fact.card-panel` with one div per desk). Words, chips, shots and fact divs are matched by index.

## Behaviour
- Motion on: the track is tall and the stage pins; scroll position picks the desk. Clicking a chip scrolls to that desk.
- Below 1024px: the pin holds sentence, chips and photo; the panel copy and CTAs are moved after the track.
- Reduced motion: no pin, first desk shown, chips switch instantly.
- The sentence auto-shrinks if the longest desk name is wider than the column.

## Drift cautions
- Keep word, chip, shot and fact counts equal.
- Set `--td-hdr` on `.cmp-tabs-desk` to the page's sticky header height (0 in the library frame, 64 to 68px on C&IB pages).
