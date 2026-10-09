# Toast / Notifications

`toast` · UI Elements · **utility** · surface-white · static (showcase)

## Look
A light section showing two families side by side: a responsive grid of
**toast** chips (icon + title + message + dismiss X + a progress sliver, in
success/error/warning/info/neutral colours) and, below, a stack of wider inline
**notification banners** (icon + title + longer message). It is a static
showcase — no live queue or auto-dismiss.

## Motion
Static. Reveal-on-scroll only: the headers and each toast/banner fade/slide up
(`data-reveal="up"` with numeric `data-reveal-delay` like `60`/`120`). The
dismiss buttons and `.toast-progress` bars are visual only — there is no live
toast queue or timed dismissal. No countup.

## Anatomy
```
section.cmp-toast.surface-white.section-y[data-animate]
└ .container-ds
  ├ .section-head-sm  ← eyebrow + h2 (data-reveal=up)
  ├ grid (sm:2 / lg:3 cols)
  │  └ .toast.toast-{success|error|warning|info|neutral} (data-reveal=up)
  │     ├ .icon-tile.is-sm (SVG) + .toast-body (.toast-title + .toast-msg)
  │     ├ .toast-close button (SVG X)
  │     └ .toast-progress
  ├ .section-head-sm  ← eyebrow + h3 (data-reveal=up)
  └ stack (max-w-[640px])
     └ .notif.notif-{success|error|warning|info} (data-reveal=up)
        └ .icon-tile.is-sm (SVG) + .notif-title + .notif-msg
```

## Content contract
- **5 toast chips** (one per variant: success, error, warning, info, neutral) +
  **4 inline banners** (success, error, warning, info). Add/remove to taste, but
  keep one variant class per item.
- Per toast: short title (≤3 words) + a one-line message. Per banner: title + a
  slightly longer one-sentence message.
- Colour comes entirely from the `toast-*` / `notif-*` variant class; icons are
  inline SVG. No images, no live numbers.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.toast` / `.notif` are LIGHT ISLANDS — they paint their own light card, so
  their ink is light-mode on any surface (handled centrally in ds.css).
- This is a **static showcase**, not a live notification system — don't wire it
  to a queue or expect the close button / `.toast-progress` to do anything.
- Keep the `toast-{variant}` / `notif-{variant}` classes paired with matching
  icon + colour; the variant class is the whole styling contract.
- Keep `.icon-tile.is-sm` / `.toast-body` / the btn-model close button
  (`.btn.btn-outline.btn-icon.btn-xs` + `.sr-only`) / `.toast-progress`
  structure so chips lay out correctly.
- `data-reveal` belongs on the headers and each card, not the section root.

## Authoring rule
Read `blocks/toast.html`. Reuse the toast/banner structure and variant classes
verbatim; change only the titles and messages (and how many of each variant).

## Scope
De-scoped 2026-09-01 — classes are global (`.toast*`, `.notif*`); no `.cmp-toast` ancestor is needed for styling. Icons compose the `.icon-tile` atom with per-tone custom-prop skins; the info tone paints from the `--info-*` semantic tokens.
