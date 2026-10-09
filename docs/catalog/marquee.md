# Marquee

`marquee` · Feature Sections · **supporting** · surface-grey · `data-behavior="marquee"` (pace only — CSS owns the motion)

## Look
A split section head, then a full-width strip of cards scrolling continuously
left, soft-masked at both edges. The strip PAUSES while hovered (or when
anything inside holds focus) and resumes on leave. The demo items are FX buy/sell
cards: soft blue-wash card (white on grey surfaces) with a circular COUNTRY
FLAG (hand-drawn inline SVG in national colours — never themed), the currency
code beneath it, and right-aligned Buy and Sell rates separated by a hairline.
Cards lift slightly on hover.

## Motion
One infinite keyframe scroll (`translateX(-50%)`; RTL uses a +50% twin).
Speed is constant in PIXELS, not loops: `data-speed="48"` (px/s) on the root —
the recipe sets `--mq-speed = setWidth ÷ speed`, so adding or removing cards
never changes the pace. Without JS the CSS falls back to 45s per loop. A
manual `style="--mq-speed:30s"` on `.mq-track` still works but the recipe
overrides it when bound — prefer `data-speed`. Dropped entirely under
reduced-motion. Section head reveals up.

## Anatomy
```
section.cmp.cmp-marquee.surface-grey.section-y.overflow-hidden
├ .container-ds > .section-head.is-split (eyebrow + h2 + sh-lead)
└ .mq-outer                ← mask + hover/focus pause
  └ .mq-track              ← the animated flex row
    ├ .mq-set              ← Set 1 (the real content)
    │   └ article.mq-fx ×N
    │       ├ .mq-fx-id (.mq-fx-flag svg + .mq-fx-code)
    │       └ .mq-fx-quote (.mq-fx-row Buy + .mq-fx-rule + .mq-fx-row Sell)
    └ .mq-set[aria-hidden] ← Set 2 — byte-identical duplicate
```

## Content contract
- **The marquee is generic**: `.mq-outer/.mq-track/.mq-set` scroll ANY items —
  swap the FX cards for chips, quotes, logos, anything of consistent height.
- **Both sets must stay byte-identical** — the loop is `translateX(-50%)`, so
  a mismatch shows as a visible jump at the seam. Edit Set 1, re-copy to
  Set 2, keep `aria-hidden="true"` on the duplicate.
- Enough items to overflow the viewport (8 cards ≈ 2200px) or the loop shows
  gaps on wide screens.
- Rates are illustrative copy (AED per unit; Sell > Buy). Rates are
  LTR-isolated so figures read correctly in Arabic.
- Currency codes stay Latin in both languages; flags are national colours
  drawn inline — they are content, not brand, and never theme.

## Accessibility
- Set 2 is `aria-hidden` — screen readers hear each rate once.
- Hover AND `:focus-within` pause the scroll, so keyboard users can hold it
  still if items ever become links.
- Reduced-motion kills the animation; the first set remains readable.
- Flags are decorative (`aria-hidden` span); the currency code is the
  accessible identity. Buy/Sell are real text labels, not colour alone.

## Drift cautions
_Defaults for autonomous building — all overridable on explicit instruction._
- `.mq-fx` cards are LIGHT ISLANDS — they paint their own wash, so rate copy
  keeps light-mode ink on any surface.
- Don't convert to a JS carousel — continuous drift is the point; the
  Carousel blocks cover stepped browsing.
- The white `.mq-fx` card uses RAW tokens (navy/mid/border), not on-surface —
  it must stay a white card on navy/dark sections. Don't "fix" it to tokens
  that invert.
- Keep the edge mask on `.mq-outer`; without it the strip clips harshly at
  the viewport edge.

## Authoring rule
Read `blocks/marquee.html`. Reuse the shell verbatim; replace the `.mq-fx`
items with your content (any markup), duplicate Set 1 into Set 2 exactly,
and adjust `--mq-speed` only via the style custom-property pass-through.
