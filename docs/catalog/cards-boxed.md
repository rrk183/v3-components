# cards-boxed

`cards-boxed` · Cards · composition of **[[cards]]**

Boxed composition of [[cards]] — media on top, copy in a card-panel (`--card-pad:0`); see the family dossier.

## Options
- **Single card:** one card is fine (e.g. a single tutorial); the chip stays optional.
- **Filter row:** a row of filter chips above the grid (the shared ds.js filter), e.g. by platform.
- **Video pop-up cards:** a card may open a tutorial video modal (`data-modal-open`) instead of linking out.
- **Title-only card:** a card may show just a title and a text link (no image chip, eyebrow or description).
- **Centred header:** any Section Header alignment, including centred with the lead under the heading.
- **Description optional:** a card may drop its description line.
- **Event card:** date and city as the meta line, with no image chip and no button.
- **Pagination:** a pager under the grid for long lists.
- **Date chip:** the image chip may show a date.
- **Byline body:** the article meta line may include author, date and read time.
- **Article meta line:** the kicker may be dropped and an author / date `meta-dot` line added under the body (research and article cards).
- **Pop-up cards:** a card may open a modal (`href="#" data-modal-open="<id>"`) instead of linking out.
- **See-all link:** one `btn btn-text is-arrow` link centred under the grid.
- **Titled list body** (2026-10-12): instead of a paragraph and link, a card body may hold a `list-check` of titled points (`span.type-body.ink-primary.font-semibold.block` title + `span.type-body-sm.ink-mute` line).
- **Static cards:** cards may be `div`s instead of links (no arrow link then); the kicker is optional.
- **Anchor id (instances only):** a page may add `id="..."` to the root.
