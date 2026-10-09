# Component dossiers

Deep, per-component reference for the page-creation workflow — one file per block:
`docs/catalog/<slug>.md`.

The gallery catalog (`assets/js/library.js`) answers **"which block do I pick?"**
(impact + when-to-use). These dossiers answer the two things markup alone can't
tell a text agent:

1. **How it looks / acts** — a `Look` and `Motion` description, since the visual
   comes from CSS and the motion from a JS recipe, neither readable from markup.
2. **How to fill it without breaking it** — an explicit `Content contract`
   (slot counts, copy lengths, image ratios) plus `Drift cautions`. This is the
   anti-drift guard: past agent pages broke on wrong-shaped content, not bad HTML.

## Dossier format

Each file has:

- **Front line** — slug · category · impact · default surface · behavior
- **Look** — what the rendered component looks like, 1–3 sentences
- **Motion** — what animates and how (or "static")
- **Anatomy** — the slot structure (what each editable region is)
- **Content contract** — exact counts and limits: how many items, copy lengths,
  image aspect ratios, which numbers are live (countup) etc.
- **Drift cautions** — what NOT to touch (fixed grid spans, recipe keyframes,
  required structure) so the block keeps rendering correctly
- **Authoring rule** — always read `blocks/<slug>.html`; change only content
  (text + media refs), reuse structure/classes verbatim

> **Defaults, not walls.** The Content contract, Drift cautions and Authoring
> rule describe how to build **autonomously without instruction** — the safe path
> when no one has asked for something custom.
>
> The thing we guard against is **unintended technical drift**: an agent silently
> improvising structure and shipping broken/mis-rendered HTML. That is always bad.
>
> **Deliberate customization is welcome** — new animation points, tuned keyframes,
> a one-off bespoke moment are all legitimate outcomes of a great page. A
> deviation is fine when it is (a) intended — the user asked for it, or the
> workflow proposed it and the user approved — and (b) still validates and renders
> correctly. Custom ≠ drift. Stick to the component **unless instructed otherwise**,
> but do not treat the cautions as a freeze.

## How the workflow uses them

- **Blueprint step** reads the catalog (selection) → proposes a lineup.
- **Build step** reads the dossier + `blocks/<slug>.html` for each chosen block →
  fills only the content described in the contract.
- **Component-Drift critic** checks the built section against the contract +
  the canonical block structure (technical/HTML validity, not taste).

See `MEMORY` notes: page-creation-workflow, stick-to-existing-components,
component-catalog.
