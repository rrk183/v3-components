# cards-plain-scroll

`cards-plain-scroll` · Cards · composition of **[[cards]]**

Layout mode 3 — the Plain cards on the generalized scroll-track recipe (pinned section, row pans with page scroll; `data-scroll-outer`/`data-scroll-wrap`/`data-track`). See the family dossier.

## Options
- **Static cards:** cards may be `div`s instead of links (drop `is-hover-zoom` then).
- **Columns / anchor id:** `is-cols-*` and an anchor id on instances are fine.
- **Closing button row** (2026-10-13): one centred `btn-outline` under the track; see [[cards]].
- **Short screens (automatic, 2026-10-14):** the pinned row reserves the 72px site header; on a short pin its cards narrow so 3:2 media still fits, and when head + cards cannot fit one screen at all (a phone held landscape, iPhone SE) the recipe adds `is-swipe`: the section unpins and the row swipes natively. Nothing to author.
