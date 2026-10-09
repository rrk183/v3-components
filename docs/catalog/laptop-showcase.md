# Laptop Showcase

`laptop-showcase` · Product & Device Showcases · **statement** · surface-dark · reveal

## Look
A dark, glowing two-column hero. Left: eyebrow + big display headline + sub +
three numbered steps. Right: a CSS-drawn laptop whose screen is filled by a
background image (`data-bg`), with two floating spec badges (e.g. "256-bit
encryption", "99.99% uptime") and ambient glow blobs behind. Mirrors a premium
product-hero layout.

## Motion
Reveal-on-scroll only: eyebrow, headline, sub and each numbered step fade/slide
up in a stagger (`data-reveal="up"` with delays), and the laptop stage reveals
up. Glow blobs (`.ls-glow`) and the screen sheen are decorative CSS. No
scroll-pinning, no countup.

## Anatomy
```
section.cmp-laptop-showcase.surface-dark.section-y[data-animate]
├ .ls-glow.ls-glow-1 / .ls-glow.ls-glow-2  (aria-hidden ambient glow)
└ .container-ds.ls-grid.grid.grid-cols-1.lg:grid-cols-2.items-center
  ├ .ds-stack.ls-copy
  │  ├ .ds-eyebrow + h2.type-display-lg + p.ls-sub   ← data-reveal
  │  └ ol.ls-steps
  │     └ li.ls-step (data-reveal) ×3
  │        ├ .ls-step-num (aria-hidden)
  │        └ .ls-step-text (h3.ls-step-title + p)
  └ .ls-stage (data-reveal)
     ├ .ls-laptop
     │  ├ .ls-lid > .ls-screen[data-bg] + .ls-screen-sheen
     │  └ .ls-base (aria-hidden)
     ├ .ls-badge.ls-badge-1 (SVG + .ls-badge-val + .ls-badge-lbl)
     └ .ls-badge.ls-badge-2 (SVG + .ls-badge-val + .ls-badge-lbl)
```

## Content contract
- **Exactly 3 numbered steps** (the `.ls-step-num` numerals are content; keep the
  ordered list at three).
- Per step: a short title (`.ls-step-title`, ≤4 words) + a 1-sentence body.
- Copy: eyebrow (≤2 words), display headline (uses `<br>` for line breaks), one
  sub sentence.
- **1 screen image** via `data-bg` on `.ls-screen` (laptop-screen aspect — the
  runtime applies the image; use a 16:10-ish desktop screenshot).
- **2 floating badges**, each a value + a short label.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- Keep the laptop structure (`.ls-laptop` → `.ls-lid` → `.ls-screen[data-bg]` +
  `.ls-base`) and the two `.ls-badge` blocks with their `ls-badge-1`/`ls-badge-2`
  position classes — the CSS positions them.
- Use `data-bg` (not inline styles or `src`) for the screen image — the block is
  explicitly no-inline-styles, no-IDs.
- Keep the `.ls-glow` blobs and `.ls-screen-sheen` (aria-hidden) for the look.
- Change copy, step text, badge values/labels and the `data-bg` image ref; leave
  structure intact.

## Authoring rule
Read `blocks/laptop-showcase.html`. Reuse the structure and classes verbatim;
change only the eyebrow/headline/sub, the 3 step titles+bodies, the 2 badge
value/label pairs, and the `.ls-screen` `data-bg` image.
