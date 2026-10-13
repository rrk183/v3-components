# cards-icon-linked

`cards-icon-linked` · Cards · composition of **[[cards]]**

Linked icon composition of [[cards]] — whole-card `<a class="cd-card card-clear">` with icon-tile + title + body + btn-text; replaces ways-to-accept and pillar-grid; see the family dossier.

## Options
- **Pop-up cards:** a card may open a modal (e.g. a tutorial video, `data-modal-open`) instead of linking to a page.
- **Contact-detail card:** a non-linked card with a larger title and body, phone and email lines and one text link (icon optional).
- **Caption line:** an optional `type-caption ink-mute` line under the body (e.g. an award).
- **Status chip:** a card may carry one small status `chip` (e.g. "Coming soon").
- **Badge instead of icon** (2026-10-12): a small `span.badge.badge-neutral` label may replace the `icon-tile` at the top of every card (all or none).
- **Anchor id (instances only):** a page may add `id="..."` to the root.
- **Unlinked cards** (2026-10-13): cards may be `div.cd-card` with no `btn-text` and no link, all cards or none (a feature list rather than a directory). Keep the root class.
- **Card kicker** (2026-10-13): a `type-eyebrow ink-accent` kicker may sit above each title (all cards or none).
