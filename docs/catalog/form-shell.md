# Form Shell

`form-shell` · UI Elements · **supporting** · surface-grey · data-mock-form (wired by ds.js)

## Look
A form page in two columns on grey: left, an audience pill-tab switcher above
a white card of form fieldsets (floating-label `.field` atoms, two-up grid,
check-pills, consent row, navy submit with an SLA note); right, a sticky
aside of white cards — a numbered "what happens next" list (gradient number
dots) and a contact card. Submitting a valid form swaps it for a centred
success panel (tinted icon circle, heading, note). Invalid fields go red
with their `.field-error` lines.

## Anatomy
```
section.cmp.cmp-form-shell.surface-grey.section-y[data-animate]
  .container-ds > .sac-shell            — 1.55fr/.85fr ≥1024
    div                                  — form column
      .sac-aud-prompt + .sac-aud-tabs > button.sac-aud-tab[data-aud]
      .sac-card.card-panel[data-aud-panel]
        form.sac-form[data-mock-form]
          fieldset.sac-fieldset > legend.sac-legend + .sac-legend-note
            .sac-grid > .field (+ .sac-col-2)
          label.check.sac-consent + .field-error[data-consent-error]
          .sac-actions > button.btn.btn-navy + .sac-sla
        .sac-success > .icon-tile.is-round.sac-success-icon (--it-size:68px) + h3 + p     — sibling of the form
    aside.sac-aside > .sac-aside-card (.sac-aside-list | .sac-aside-contact)
```

## Content contract
Text, field labels and options only. Success sits OUTSIDE the form (the
driver hides the form and reveals the sibling `.sac-success`). Pages that
switch panels with the shared data-tabs core instead of `[data-aud]` add
`cmp-tabs` to the root so `.tab-panel` visibility applies.

## Drift cautions
- The drivers are auto-wired in ds.js (`formShell`): `[data-aud]` tabs
  (ARIA pattern, roving tabindex) + `form[data-mock-form]` validation and
  success reveal. Never re-add a page script.
- Prototype-only: no network submit. Real integration replaces
  `data-mock-form` handling, not the markup.
- Canonical breakpoints (Ram's 960/620 were rewritten to 1024/640).

## Authoring rule
Reuse verbatim; change copy, fields and aside content only. Instances:
start-application-* (data-aud tabs) and support-form-* (data-tabs core).

## Composition note (2026-09-01)
`.sac-card` and `.sac-aside-card` compose `.card-panel` for their paint (the sac-* rules keep only structural padding); the success icon composes `.icon-tile.is-round` with an ok-tint skin.

## Composition status (2026-09-01 slim)
The shell now owns ONLY structure + behavior: `.sac-shell` grid, fieldset
rhythm + the legend float fix, `.sac-grid`, error/success wiring, the aside
step-list. Everything else composes atoms in the markup: tabs = `chip chip-lg`
+ `[data-aud]` (ds.js toggles `.active`/`aria-selected`; the chip model styles
both), panels/aside = `card-panel` (+ `--card-pad`), type = `.type-*`, required
mark = `.field-req`, spacing = utilities. Fields label via `aria-label` +
sibling label — **no `for`/`id`** (blocks are ID-free). `.sac-checkpill` CSS
was deleted (chip model covers it; two legacy pages migrate via MIGRATION.md).
