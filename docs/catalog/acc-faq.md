# Accordion — FAQ Split

`acc-faq` · FAQs / Accordion · composition of **[[acc]]**

The faq-split pattern as a pure composition: utilities grid (`md:grid-cols-[360px_1fr]`), sticky left rail = section header + `card-panel.surface-grey.is-tile` help panel (icon-tile + btn-filled), right = single-open Q&A rows. Replaces `cmp-faq-split` (24 legacy rules → 0).

## Options
- **Search and categories** (2026-10-12): the rail may add a search box and category chips that filter the questions (the shared ds.js filter), with the questions grouped under category headings.
