# Page-fix INVENTORY MAP — the sweep work order

> Built **2026-09-02** by reading the markup of every canonical page against
> [`docs/MIGRATION.md`](../MIGRATION.md) (§3 recipes / §4 JUDGE list / §5 ledger),
> [`docs/importer-glossary.md`](../importer-glossary.md) (EMIT column, freshly reconciled),
> the `library.js` CATALOG, the block files in `blocks/`, and one `node scripts/verify.mjs` run.
> **READ-ONLY artefact** — no other file in the repo was touched, nothing committed.

---

## 0 · The page set

**51 canonical pages** — every `a.sx-link` in `site-index.html` (the latest-version rows).
Gallery/utility pages are excluded by definition (they carry no `sx-link`): `index`,
`category`, `frame`, `all-components`, `audit`, `review`, `harness`, `site-index` itself.
Dated / `-ram` / `-codex` twins are HISTORY (future `/archive/`) and are **not** in the fix
set; where a canonical page has a `-ram` twin it is named in that page's header line as the
**content-source reference**.

| Section (site-index group) | n | pages |
|---|---|---|
| Payments & Trade Finance | 8 | payments-v2, trade-supply-chain-finance-v2, digital-channels-v2, businessonline-x-v2, emirates-nbd-pay-v2, smarttrade-v2, smartscf-v2, api-banking-v2 |
| Lending | 2 | industry-specific-finance-v2, sustainable-finance-v2 |
| Investment Banking | 12 | global-loan-solutions-v2, equity-capital-markets-v2, debt-capital-markets-v2, custody-v2, agency-v2, our-people-v2, case-study-library-v2, securities-services, online-trading, margin-trading, institutional-trading, gcc-market-access |
| Markets | 3 | execution-capabilities, structured-solutions, fx-hub |
| Our Expertise & Partnerships | 2 | initiatives-and-partners-v2, events-library |
| Insights & Research | 3 | media-library, article-library, article-example |
| Support & Resources | 21 | tutorials-platform-demos, form-centre, fraud-awareness-hub, faqs, contact-us, start-application ×2, support-form ×2, payment-tracker, commodities, instant-banking-services, smart-cdm, virtual-accounts, swift-corporates, smartguarantees, + 5 tombstone pages |
| **Total** | **51** | **452 sections** |

**⚠ Scope question for Hakan (one line, answer before the sweep starts).** Nine more
canonical pages are reachable from `site-index.html` only as **section landing pages**
(`sx-group-title` anchors) or the home hero, so a strict `sx-link` extraction misses them:
`corporate-institutional-v2-2026-08-25` (home), `payments-trade-finance-v2-2026-08-25`,
`lending-v3-2026-07-27`, `investment-banking-v2-2026-08-10`, `markets-2026-07-20`,
`islamic-finance-2026-08-11`, `our-expertise-partnerships-2026-08-11`,
`insights-research-2026-07-20`, `support-resources-2026-07-20`. They all carry retired
markup (the gate WARNs on every one) — **60 pages, not 51, if they are in scope.** They are
not mapped below.

### Gate baseline (this branch, 2026-09-02)

`node scripts/verify.mjs` → `✗ VERIFY FAILED — 264 failure(s), 376 warning(s)`.

- **Zero FAILs name any of the 51 canonical pages.** Every page-level FAIL in that run
  belongs to a *dated/older* twin (`corporate-institutional-v2-2026-08-11` alone accounts for
  ~190 of them), plus flow-3 `all-components.html is stale` and a block of flow-5 `ds.css`
  LIGHT-ISLAND failures that are **another agent's in-flight ds.css work**, not page work.
- **184 WARN lines name the 51 canonical pages** — every one is a work item and appears in
  the per-page tables below.
- **Zero inline `style=` across all 51 pages.** (`style="--…"` custom-property passing is
  sanctioned and present on 3 pages: `global-loan-solutions-v2` ×190, `api-banking-v2` ×3,
  `smarttrade-v2` ×1.) The "clean the inline styles" phase of the sweep is **already done**
  on the canonical set.

### Reading the flags

| flag | meaning |
|---|---|
| **OK** | clean mapping — a documented recipe or a still-current block; the sweep can emit without asking |
| **JUDGE** | no current equivalent, a lossy transform, or two docs disagreeing — Hakan decides (see §2) |
| **CUSTOM-KEEP** | intentional bespoke that renders on current atoms; CLAUDE.md — *"Custom work is fine when intended + it renders"* |
| **ASSET** | needs an image capture / move before the section can be emitted |

**Three findings that reshape the effort estimate**, all verified against the block files:

1. `blocks/cta-band.html`'s own root **is** `cmp ptf-ctaband surface-navy section-y` — the 49
   "anonymous-root" CTA bands are already canonical, not drift.
2. `blocks/site-header-v4.html` root is `cmp cmp-site-header ish-v4` and
   `blocks/footer-option1.html` root is `cmp cmp-footer-option1 surface-grey` — **all 51
   headers and all 51 footers already match verbatim.**
3. That is **151 of 452 sections (33%) already canonical.** Of the remaining 301, **213 need a
   re-compose onto a different block or composition** and **88 sit on still-current blocks**
   needing at most an atom pass or a v4 class rename.

---

## 1 · Per-page map


### Payments — `payments-v2-2026-08-25.html`

*Payments & Trade Finance · 8 sections · 67 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S** · content-source twin: `payments-v2-ram.html`*

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tabs-pills-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | Hero, Image BG (Left)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Seamless, secure,intelligent payments." · media: 1 video | **JUDGE** |
| 3 | Four pillars, scroll story<br>`cmp surface-grey` | `feature-scroll-story` / `-rev` — the `.ess` markup is the block's own but the root is BESPOKE (`cmp surface-*`), so the section is un-recognised: re-root to `cmp cmp-feature-scroll-story` (`.ess rev` = `-rev`) | H: "Move money faster." · 4× `ess-ch` · media: 4 img | **OK** |
| 4 | Emirates NBD Pay, Feature Spotlight<br>`cmp cmp-feature-spotlight surface-grey section-y` | `feature-spotlight` — **current block** | H: "Payments, reimagined." · media: 1 data-bg | **OK** |
| 5 | How can we help you, tabs-pills-grid service directory<br>`cmp cmp-tabs-pills-grid cmp-tabs surface-grey section-y` | `filter-grid` → ONE `cmp cmp-cards cards-kicker is-cols-3` grid + `data-filter` chips; delete the duplicated per-tab panels  ·  **inner classes undefined in ds.css — renders unstyled today** | H: "We understand that every business is unique." · 25× `tpl-pill` / 25× `tpl-pill-t` | **JUDGE** |
| 6 | Unlock new possibilities, cards-thumb 4-card grid<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 7 | CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward, together." | **OK** |
| 8 | /CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Trade & Supply Chain Finance — `trade-supply-chain-finance-v2-2026-08-25.html`

*Payments & Trade Finance · 11 sections · 81 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `trade-supply-chain-finance-v2-ram.html`*

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tabs-pills-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header — retail v4<br>`cmp cmp-hero-cinematic-pinned surface-navy` | `hero-cinematic-pinned` — **current block**; atom pass only: `scin-h1`→`type-display-lg on-surface`, `scin-sub`→`type-body-lg on-surface-mid`, `scin-ghost`→`btn btn-outline-light btn-lg` | H: "Transformingglobal flows." | **JUDGE** |
| 3 | 2. Three value pillars, capability tiles (lg:grid-cols-3)<br>`cmp cmp-highlights-tiles surface-white section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Integrated trade finance, end to end." · 3× `ht-tile` / 3× `ht-tile-title` | **OK** |
| 4 | 3. How can we help you, Tabbed solutions directory<br>`cmp cmp-tabs-pills-grid cmp-tabs surface-grey section-y` | `filter-grid` → ONE `cmp cmp-cards cards-kicker is-cols-3` grid + `data-filter` chips; delete the duplicated per-tab panels  ·  **inner classes undefined in ds.css — renders unstyled today** | H: "Solutions for the full flow of trade." · 14× `tpl-pill` / 14× `tpl-pill-t` | **JUDGE** |
| 5 | 4. Testimonial, quote band (navy, topic image)<br>`cmp cmp-quote-band surface-navy section-y` | `quote-band` — **current block** | media: 1 data-bg | **OK** |
| 6 | Channels, scroll-story (pinned image, swaps per channel)<br>`cmp cmp-scroll-tab surface-white section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "One platform for every trade." · 5× `ss-step` / 5× `ss-step-img` · media: 10 data-bg | **OK** |
| 7 | 6. News, card grid<br>`cmp cmp-cards-thumb-box surface-grey section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`) | H: "Shaping the future of global trade." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. Tutorials & Demos, card grid<br>`cmp cmp-cards-thumb-box is-cols-3 surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cols-3` | H: "See our platforms in action." · 3× `ct-card` · media: 3 data-bg | **OK** |
| 9 | 8. Unlock new possibilities, cross-link 4-card grid<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 10 | 9. CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward, together." | **OK** |
| 11 | /9. CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Digital Channels — `digital-channels-v2-2026-08-10.html`

*Payments & Trade Finance · 13 sections · 88 kb · gate: **0 FAIL / 6 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `digital-channels-v2-ram.html`*

<details><summary>gate lines naming this page (6)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-impact-stats is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | Hero, Video Left (businesswoman accountant bg video)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Seize opportunities now. Stay on top of your busines" · media: 1 video | **JUDGE** |
| 3 | Big Statement<br>`cmp cmp-big-statement surface-white section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Banking,your way." | **OK** |
| 4 | Smart solutions, capability tiles<br>`cmp cmp-highlights-tiles surface-white section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Smart solutions tailored to your needs." · 6× `ht-tile` / 6× `ht-tile-title` | **OK** |
| 5 | scroll-story (pinned image swaps per item)<br>`cmp cmp-scroll-tab surface-white section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "The digital channels your business runs on" · 8× `ss-step` / 8× `ss-step-img` · media: 16 data-bg | **OK** |
| 6 | Feature Spotlight, flagship channels<br>`cmp cmp-feature-spotlight surface-white section-y` | `feature-spotlight` — **current block** | H: "From sandbox to production in days." · media: 2 data-bg | **OK** |
| 7 | The App, businessONLINE X scroll-story hero (ported from businessONLINE X)<br>`cmp cmp-scroll-story-video ssv-light` | `scroll-story-video` — **current block**; §3b atom collapse: `ssv-op-h`/`ssv-op-sub`/`ssv-op-hint`/`ssv-sub`/`cap-*` sizes → `type-*` in markup | H: "Banking on the move." · media: 1 data-bg | **JUDGE** |
| 8 | Impact Stats, channel metrics<br>`cmp cmp-impact-stats surface-grey section-y` | `stats-row` → `cmp cmp-cards stats-row is-cols-4 is-divided`; alphanumeric figures drop `data-countup` | H: "The numbers behind the channels." · 4× `is-stat` | **OK** |
| 9 | Why our channels, Highlights Tiles<br>`cmp cmp-highlights-tiles surface-white section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Built for how business actually runs." · 4× `ht-tile` / 4× `ht-tile-title` | **OK** |
| 10 | FAQ, Accordion<br>`cmp cmp-accordion surface-grey section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 5× `acc-icon` / 5× `acc-inner` | **JUDGE** |
| 11 | Unlock new possibilities, related solutions<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 12 | CTA, Horizontal Marquee<br>`cmp cmp-cta-marquee surface-navy section-y` | `cta-marquee` — **current block**; the finale heading is `type-h1 on-surface` (not `type-h2`) | H: "Switch on the channels your business needs." · 10× `cm-item` | **OK** |
| 13 | /CTA, Horizontal Marquee<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### businessONLINE — `businessonline-x-v2-2026-08-04.html`

*Payments & Trade Finance · 16 sections · 95 kb · gate: **0 FAIL / 6 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **L** · content-source twin: `businessonline-x-v2-ram.html`*

<details><summary>gate lines naming this page (6)</summary>

- WARN cmp-bento-spotlight is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-photo is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-app-cinema is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN pos-ways (Ways to Accept) is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN old useful-links markup (inline strip) — rebuilt as the resource-row grid 2026-09-02; page renders degraded until the sweep migrates it (docs/MIGRATION.md)
- WARN 5 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header<br>`cmp cmp-scroll-story-video ssv-light` | `scroll-story-video` — **current block**; §3b atom collapse: `ssv-op-h`/`ssv-op-sub`/`ssv-op-hint`/`ssv-sub`/`cap-*` sizes → `type-*` in markup | H: "Banking on the move." | **JUDGE** |
| 3 | Why, three pillars<br>`cmp surface-white section-y` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked is-cols-3` (fixes the anonymous root too) | H: "Built to move at the speed you do." · 3× `pos-way` | **OK** |
| 4 | Deep feature grid, everything in the app<br>`cmp cmp-devices-features surface-grey section-y` | `devices-features` — **current block**; atom pass: `dvf-icon`→`icon-tile`, `dvf-title`→`type-h6`, `dvf-desc`→`type-body-sm` | H: "The full corporate toolkit, on mobile." · 8× `dvf-feat` | **OK** |
| 5 | Stats bento<br>`cmp cmp-bento-spotlight surface-white section-y` | `bento-spotlight` → `cmp cmp-bento bento-spotlight is-hover-lift is-hover-spotlight`; per-tile `is-w*/is-h*` spans replace `bs-grid--*` | H: "Small screen, full control." · 5× `bs-tile` · media: 1 data-bg | **OK** |
| 6 | Instant Banking Services, Feature Spotlight<br>`cmp cmp-feature-spotlight surface-grey section-y` | `feature-spotlight` — **current block** | H: "Everyday banking, done digitally" · media: 1 data-bg | **OK** |
| 7 | Payment Tracker, Feature Spotlight<br>`cmp cmp-feature-spotlight surface-white section-y` | `feature-spotlight` — **current block** | H: "Track every payment, end to end" · media: 1 data-bg | **OK** |
| 8 | Laptop Showcase<br>`cmp cmp-laptop-showcase surface-navy section-y` | `laptop-showcase` — **current block**; the CSS laptop (`ls-lid/screen/base`) → an `.ls-device-img` transparent PNG | H: "Your treasury,on one screen." · 3× `ls-step` / 3× `ls-step-num` · media: 1 data-bg | **ASSET** |
| 9 | /Laptop Showcase<br>`cmp cmp-bento-photo surface-navy section-y` | `bento-photo` → `cmp cmp-bento bento-photo is-hover-zoom` | H: "Built for trust. Protected by design." · 4× `bp-tile` / 4× `bp-tile-title` · media: 4 data-bg | **OK** |
| 10 | /Security<br>`cmp cmp-app-cinema surface-navy` | `scroll-scenes` → `cmp cmp-scroll-scenes` (pinned full-screen scenes) | H: "Download businessONLINE X." · media: 3 img, 1 video | **JUDGE** |
| 11 | FAQ, Accordion Offerings (matches other pages)<br>`cmp cmp-accordion surface-white section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 5× `acc-icon` / 5× `acc-inner` | **JUDGE** |
| 12 | /FAQ<br>`cmp cmp-content-block-sidebyside surface-grey section-y` | `content-block-sidebyside` — **current block** | H: "Support that&rsquo;salways on." | **OK** |
| 13 | Unlock new possibilities, Bento Image Cards (cross-links)<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 14 | CTA band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s get your business set up." | **OK** |
| 15 | Useful links<br>`cmp cmp-useful-links surface-grey` | `useful-links` (REBUILT 2026-09-02) → `ul-head > ds-eyebrow` + `ul-grid` of `a.ul-item` rows with type glyphs; the old `.ul-row` inline strip is degraded markup | eyebrow label + N text links | **OK** |
| 16 | Useful links<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Emirates NBD Pay — `emirates-nbd-pay-v2-2026-08-25.html`

*Payments & Trade Finance · 13 sections · 85 kb · gate: **0 FAIL / 5 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `emirates-nbd-pay-v2-ram.html`*

<details><summary>gate lines naming this page (5)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-metrics-type2 is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN pos-ways (Ways to Accept) is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | Hero, Video BG (Left)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Payment acceptance for business.Accept payments, you" · media: 1 video | **JUDGE** |
| 3 | Big Statement<br>`cmp cmp-big-statement surface-white section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Every wayto get paid." | **OK** |
| 4 | Ways to Accept<br>`cmp surface-grey section-y` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked is-cols-3` (fixes the anonymous root too) | H: "Meet customers at every checkout." · 3× `pos-way` | **OK** |
| 5 | Online & e-commerce, scroll story (Sell online in minutes)<br>`cmp cmp-feature-scroll-story surface-white` | `feature-scroll-story` / `-rev` — **current block** | H: "Sell online in minutes." · 4× `ess-ch` · media: 4 img | **ASSET** |
| 6 | Point of sale, scroll story (Point of sale that scales with you)<br>`cmp cmp-feature-scroll-story surface-grey` | `feature-scroll-story` / `-rev` — **current block** | H: "Point of sale that scales with you." · 3× `ess-ch` · media: 3 img | **ASSET** |
| 7 | Metrics, Type 2<br>`cmp cmp-metrics-type2 surface-white section-y` | `stats-hero-figure` → `cmp cmp-stats-hero-figure` (`ds-num is-xl is-light` hero figure + `ds-num-unit`) | hero figure + label + N supporting figures | **OK** |
| 8 | Value-added services, Highlights Tiles<br>`cmp cmp-highlights-tiles surface-grey section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Value-added services that lift every sale." · 4× `ht-tile` / 4× `ht-tile-title` | **OK** |
| 9 | Industries, Coverflow Carousel<br>`cmp cmp-coverflow-carousel surface-white section-y` | `coverflow-carousel` — **current block** | H: "Acceptance tailored to your industry." · media: 3 data-bg | **OK** |
| 10 | FAQ, Accordion<br>`cmp cmp-accordion surface-grey section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 5× `acc-icon` / 5× `acc-inner` | **OK** |
| 11 | Unlock new possibilities, cross-sell<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 12 | CTA, Horizontal Marquee<br>`cmp cmp-cta-marquee surface-navy section-y` | `cta-marquee` — **current block**; the finale heading is `type-h1 on-surface` (not `type-h2`) | H: "Start getting paid." · 12× `cm-item` | **OK** |
| 13 | /CTA, Horizontal Marquee<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### smartTRADE — `smarttrade-v2-2026-08-25.html`

*Payments & Trade Finance · 14 sections · 96 kb · gate: **0 FAIL / 8 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 1) · sweep effort: **L** · content-source twin: `smarttrade-v2-ram.html`*

<details><summary>gate lines naming this page (8)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-insight-split is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-spotlight is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tabs-pills-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-metrics-type1 is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-key-transactions is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-testimonials is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | Hero, Video BG (Center)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "smartTRADE, tradefinance, fully online." · media: 1 video | **JUDGE** |
| 3 | Insight Split<br>`cmp cmp-insight-split surface-white section-y` | `illustration-split` → `cmp cmp-illustration-split` | H: "Insights that move with your trade." | **OK** |
| 4 | Everything trade, Bento Spotlight<br>`cmp cmp-bento-spotlight surface-navy section-y` | `bento-spotlight` → `cmp cmp-bento bento-spotlight is-hover-lift is-hover-spotlight`; per-tile `is-w*/is-h*` spans replace `bs-grid--*` | H: "Your whole trade desk, on one portal." · 7× `bs-tile` · media: 1 data-bg | **OK** |
| 5 | Ease & speed, scroll story (Trade finance in a few clicks)<br>`cmp cmp-feature-scroll-story surface-white` | `feature-scroll-story` / `-rev` — **current block** | H: "Trade finance in a few clicks." · 4× `ess-ch` · media: 4 img | **ASSET** |
| 6 | /Ease & speed, scroll story<br>`cmp cmp-feature-scroll-story surface-grey` | `feature-scroll-story` / `-rev` — **current block** | H: "Real-time visibility, end to end." · 4× `ess-ch` · media: 4 img | **ASSET** |
| 7 | /Visibility & control, scroll story<br>`cmp cmp-tabs-pills-grid cmp-tabs surface-white section-y` | `filter-grid` → ONE `cmp cmp-cards cards-kicker is-cols-3` grid + `data-filter` chips; delete the duplicated per-tab panels  ·  **inner classes undefined in ds.css — renders unstyled today** | H: "Explore how smartTRADE supports your business." · 12× `tpl-pill` / 12× `tpl-pill-t` | **JUDGE** |
| 8 | /All features<br>`cmp cmp-metrics-type1 surface-grey section-y` | `stats-quad` → `cmp cmp-stats-quad` (`ds-num is-lg`) | H: "Trade, made faster. Proven by numbers." · 4× `m1-cell` | **OK** |
| 9 | /Metrics, Type 1<br>`cmp cmp-key-transactions surface-white section-y` | `fact-grid` → `cmp cmp-fact-grid` (glossary EMIT, capability rename) — **but MIGRATION §3 still routes this to `cards-tombstones`** | H: "Letters of credit, guarantees andcollections we powe" · 10× `kt-cell` | **JUDGE** |
| 10 | Testimonials<br>`cmp cmp-testimonials surface-grey section-y` | `cards-testimonials-carousel` → `cmp cmp-cards is-hover-zoom cards-testimonials` + `is-center-peek` (autoplay + play/pause as built) | H: "Trusted by traders across the region" · 5× `tc-card` · media: 5 data-bg | **OK** |
| 11 | FAQ<br>`cmp cmp-accordion surface-white section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 5× `acc-icon` / 5× `acc-inner` | **JUDGE** |
| 12 | /FAQ<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 13 | CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's get your trade moving." | **OK** |
| 14 | /CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### smartSCF — `smartscf-v2-2026-07-20.html`

*Payments & Trade Finance · 13 sections · 96 kb · gate: **0 FAIL / 8 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **L** · content-source twin: `smartscf-v2-ram.html`*

<details><summary>gate lines naming this page (8)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-content-block-numbers is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-feature-scroll-track is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-spotlight is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-carousel-center is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-trusted-partners-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-testimonials is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | Hero, Video BG (Left) · Overlay: Tint<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Pay suppliers early.Free up working capital." · media: 1 video | **JUDGE** |
| 3 | /Hero, Video BG (Left)<br>`cmp cmp-content-block-numbers surface-white section-y` | `proof-points` → `cmp cmp-proof-points` | H: "Working capital, optimised." · media: 1 img | **OK** |
| 4 | /Content Block, Numbers<br>`cmp cmp-feature-scroll-track surface-grey` | **no current equivalent** — the pinned scroll-track recipe is not generalized (MIGRATION §4.4). Candidates: (a) degrade to `cards-carousel` and lose the pin, (b) leave untouched and report | H: "Better for buyers. Better for suppliers." · 5× `cst-card` · media: 5 img | **JUDGE** |
| 5 | /Feature — Scroll Track<br>`cmp cmp-history-timeline surface-white section-y` | `history-timeline` — **current block** | H: "Seven steps from onboardingto early payment." · 7× `ht-node` | **OK** |
| 6 | Key features, scroll story (Built to run the whole programme)<br>`cmp cmp-feature-scroll-story surface-grey` | `feature-scroll-story` / `-rev` — **current block** | H: "Built to run the whole programme." · 4× `ess-ch` · media: 4 img | **ASSET** |
| 7 | Built to integrate, Bento Spotlight<br>`cmp cmp-bento-spotlight surface-white section-y` | `bento-spotlight` → `cmp cmp-bento bento-spotlight is-hover-lift is-hover-spotlight`; per-tile `is-w*/is-h*` spans replace `bs-grid--*` | H: "Plugs into how you already work." · 5× `bs-tile` · media: 1 data-bg | **OK** |
| 8 | /Built to integrate<br>`cmp cmp-carousel-center surface-grey section-y` | `cards-carousel` + **`is-center-peek`** (the mode now exists in ds.css — MIGRATION §3's JUDGE is stale) | H: "Built for everysupply chain." · 5× `cc-slide` · media: 5 data-bg | **JUDGE** |
| 9 | /Carousel, Center<br>`cmp cmp-trusted-partners-grid surface-white section-y` | `logo-wall` → `cmp cmp-logo-wall` (Columns + Mobile-columns axes) | H: "The scale of relationships we support." · 8× `tpg-cell` | **OK** |
| 10 | Testimonials<br>`cmp cmp-testimonials surface-grey section-y` | `cards-testimonials-carousel` → `cmp cmp-cards is-hover-zoom cards-testimonials` + `is-center-peek` (autoplay + play/pause as built) | H: "Trusted across the supply chain" · 5× `tc-card` · media: 5 data-bg | **OK** |
| 11 | FAQ<br>`cmp cmp-accordion surface-white section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 5× `acc-icon` / 5× `acc-inner` | **JUDGE** |
| 12 | CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Free up working capital across your supply chain." | **OK** |
| 13 | /CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### API Banking — `api-banking-v2-2026-07-29.html`

*Payments & Trade Finance · 12 sections · 81 kb · gate: **0 FAIL / 6 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 3) · sweep effort: **M** · content-source twin: `api-banking-v2-ram.html`*

<details><summary>gate lines naming this page (6)</summary>

- WARN cmp-hero-fullbleed is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-pillar-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-spotlight is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN old eco-fb markup (pre-atoms Ecosystem) — card paint moved to ds-card 2026-09-01; page renders degraded until the sweep migrates it (docs/MIGRATION.md)
- WARN old useful-links markup (inline strip) — rebuilt as the resource-row grid 2026-09-02; page renders degraded until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header<br>`cmp cmp-hero-fullbleed surface-navy` | `hero` → `cmp cmp-hero is-bottom surface-navy` (poster via `data-bg` fallback); `hfb-media/scrim/inner/eyebrow/title/sub/btn` all die | H: "Transform your businesswith API Banking." · media: 1 video | **JUDGE** |
| 3 | /Site Header<br>`cmp cmp-pillar-grid surface-white section-y` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked is-cols-N` | H: "How can our APIs transform your business?" · 3× `pg-card` | **OK** |
| 4 | /Site Header<br>`cmp cmp-feature-scroll-story api-dark api-bg surface-navy` | `feature-scroll-story` / `-rev` — **current block** | H: "Banking, as an API." · 4× `ess-ch` · media: 4 img | **ASSET** |
| 5 | /Site Header<br>`cmp cmp-bento-spotlight surface-white section-y` | `bento-spotlight` → `cmp cmp-bento bento-spotlight is-hover-lift is-hover-spotlight`; per-tile `is-w*/is-h*` spans replace `bs-grid--*` | H: "Everything a builder needs." · 7× `bs-tile` · media: 1 data-bg | **OK** |
| 6 | /Site Header<br>`cmp cmp-feature-scroll-story api-dark api-bg surface-navy` | `feature-scroll-story` / `-rev` — **current block** | H: "From idea to live in days." · 4× `ess-ch` · media: 4 img | **ASSET** |
| 7 | /Site Header<br>`cmp cmp-link-directory surface-white section-y` | `link-directory` — **current block** | H: "Ready-to-use APIs, by domain." · 3× `ld-col` / 3× `ld-col-h` | **OK** |
| 8 | /Site Header<br>`cmp eco-fb` | `ecosystem-devices` → root `cmp cmp-ecosystem eco-fb`; card interiors → `card-panel is-hover` + `icon-tile` + `type-h6`/`type-caption` + `btn btn-text btn-sm` | H: "One connected ecosystem." · media: 1 img | **OK** |
| 9 | /Site Header<br>`cmp cmp-accordion surface-grey section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 5× `acc-icon` / 5× `acc-inner` | **JUDGE** |
| 10 | /Site Header<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "From setup to launch, we build with you." | **OK** |
| 11 | /Site Header<br>`cmp cmp-useful-links surface-grey` | `useful-links` (REBUILT 2026-09-02) → `ul-head > ds-eyebrow` + `ul-grid` of `a.ul-item` rows with type glyphs; the old `.ul-row` inline strip is degraded markup | eyebrow label + N text links | **OK** |
| 12 | /Site Header<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Industry Specific Finance — `industry-specific-finance-v2-2026-08-10.html`

*Lending · 8 sections · 100 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `industry-specific-finance-v2-ram.html`*

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-story-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, Image Left, surface-navy<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Financing economic growthwith precision, scale, and " · media: 1 img | **JUDGE** |
| 3 | 2. WHY EMIRATES NBD, Highlights Tiles, surface-white<br>`cmp cmp-highlights-tiles surface-white section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Why Emirates NBD" · 6× `ht-tile` / 6× `ht-tile-title` | **OK** |
| 4 | 3. OUR AREAS OF EXPERTISE, Story Cards, surface-grey<br>`cmp cmp-story-cards surface-grey section-y` | **no current equivalent** — `cmp-story-cards` is RETIRED and `.sc-*` is undefined in ds.css (section renders unstyled today). Nearest: `cards` (Thumbnail, video card documented in `blocks/cards.html`) or `cards-boxed`  ·  **inner classes undefined in ds.css — renders unstyled today** | H: "Our areas of expertise" · 8× `sc-card` · media: 8 video | **JUDGE** |
| 5 | 4. ★ SECTOR EXPLORER, Vertical Tabs, surface-white, id=explorer<br>`cmp cmp-tabs surface-white section-y` | `tabs-*` v4 → `.tabs-vert`→`.tb-rail.is-vertical`, `.tab-vert`→`.tb-tab`, `.tabs-underline`→`.tb-rail.is-underline`, `.tab-ul`→`.tb-tab`, `.tab-panel`→`.tb-panel`; strip runtime ARIA  ·  **`.tabs-vert`/`.tab-vert` are UNDEFINED in ds.css today — this section renders unstyled** (single column, no rail) | H: "Take a closer look at each desk" | **OK** |
| 6 | 5. UNLOCK NEW POSSIBILITIES, Content Block Numbers, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 7 | 6. CTA Band, surface-navy, id=contact<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward, together." | **OK** |
| 8 | /6. CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Sustainable Finance — `sustainable-finance-v2-2026-07-27.html`

*Lending · 14 sections · 81 kb · gate: **0 FAIL / 5 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **L** · content-source twin: `sustainable-finance-v2-ram.html`*

<details><summary>gate lines naming this page (5)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-editorial-story is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, Image Left, surface-dark<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Financing the green-economy transition across MENAT." · media: 1 img | **JUDGE** |
| 3 | 3. WHAT WE OFFER, Highlights Tiles (4-up), surface-grey, id=solutions<br>`cmp cmp-highlights-tiles surface-grey section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "What we offer" · 4× `ht-tile` / 4× `ht-tile-title` | **OK** |
| 4 | 2. COMMITMENT, Editorial Story, surface-dark<br>`cmp cmp-editorial-story surface-navy` | `hero-editorial` → `cmp cmp-hero is-bottom`; poster-only `es-bgvid` → `data-bg`; `es-stat*` → a `ds-num` stat strip (countups carry over) | H: "Backing the region&rsquo;stransition." · media: 1 data-bg | **JUDGE** |
| 5 | 6. LANDMARK TRANSACTIONS, Card grid (4), surface-white, id=case-studies<br>`cmp cmp-cards-thumb-box is-cta-text surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text` | H: "Landmark transactions" · 4× `ct-card` · media: 4 data-bg | **OK** |
| 6 | 5. FEATURED SUCCESS STORY, Content Block Side by Side, surface-navy<br>`cmp cmp-feature-spotlight surface-navy section-y` | `feature-spotlight` — **current block** | H: "Our debut USD 750mn Green Bond." · media: 1 data-bg | **OK** |
| 7 | 4. WORKING TOGETHER, Content Block Numbers (3 steps), surface-white<br>`cmp cmp-kicker-cards surface-white section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Working together" · 3× `kc-card` | **OK** |
| 8 | 7. SECTORS & USE CASES, 6 image cards, surface-grey, id=sectors<br>`cmp cmp-cards-thumb-nobox is-cols-3 surface-grey section-y` | `cards-plain` → `cmp cmp-cards is-hover-zoom cards-plain is-cols-N`  ·  carry axes `is-cols-3` | H: "Sectors &amp; use cases" · 6× `ct-card` · media: 6 data-bg | **OK** |
| 9 | 8. MAKING CHANGE HAPPEN, Content section, surface-white<br>`cmp cmp-intro-side-by-side surface-white section-y` | `intro-side-by-side` — **current block**; in-place atom rewrite: `ip-ic`→`icon-tile`, `ip-t`/`ip-d`→`type-*` (exact pair still TODO in MIGRATION §3) | H: "A KPI &amp; target framework that drives transformat" · 3× `intro-pillar` / 3× `ip-ic` | **JUDGE** |
| 10 | 9. FRAMEWORKS & POLICIES, Content / CTA band, surface-grey<br>`cmp cmp-content-block-sidebyside surface-grey section-y` | `content-block-sidebyside` — **current block** | H: "Built on a published, externally-reviewed framework." | **OK** |
| 11 | 10. FAQ, Accordion Offerings, surface-white, id=faq<br>`cmp cmp-accordion surface-white section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 5× `acc-icon` / 5× `acc-inner` | **JUDGE** |
| 12 | 11. UNLOCK, pay-cross image cards, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 13 | 12. CTA Band, surface-navy, id=contact<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward, together." | **OK** |
| 14 | /12. CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Global Loan Solutions — `global-loan-solutions-v2-2026-07-27.html`

*Investment Banking · 14 sections · 91 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 190) · sweep effort: **M** · content-source twin: `global-loan-solutions-v2-ram.html`*

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-process-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 5 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, Image, surface-dark<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "The power of scale. The precision of a boutique." · media: 1 video | **JUDGE** |
| 3 | 2. PLATFORM INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "One platform, from first conversation to final close" | **OK** |
| 4 | 3. RANKINGS, surface-grey<br>`cmp cmp-big-statement surface-grey section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Ranked #1where it matters most." | **OK** |
| 5 | 4. GLOBAL REACH, surface-navy (immersive)<br>`cmp cmp-world-map surface-navy is-bleed section-y` | `world-map` / `world-map-stats` — **current block**; unified `data-behavior="world-map"` contract | H: "Capital and coverage, wherever your ambition takes y" | **OK** |
| 6 | 5. ORIGINATION & STRUCTURING, surface-grey<br>`cmp cmp-features-autoprogress surface-grey section-y` | `features-autoprogress` — **current block** | H: "Origination &amp; structuring." · 4× `fap-card` / 4× `fap-card-bar` · media: 4 data-bg | **OK** |
| 7 | 6. DISTRIBUTION, surface-white<br>`cmp cmp-process-cards surface-white section-y` | `cards-steps` → `cmp cmp-cards is-hover-fill cards-steps`; concatenate the per-letter `.p-word > span` back to plain text | H: "Primary &amp; secondary distribution." | **JUDGE** |
| 8 | 7. LOAN SOLUTIONS, surface-grey<br>`cmp cmp-kicker-cards surface-grey section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "A comprehensive suite, built around you." · 15× `kc-card` | **OK** |
| 9 | 8. TRUSTED PARTNERS, surface-white<br>`cmp cmp-bento-expand surface-white section-y` | `bento-expand` — **current block** | H: "Trusted partners, proven results." · 3× `be-panel` · media: 3 data-bg, 3 img | **OK** |
| 10 | 9. SUCCESS STORIES, surface-grey<br>`cmp cmp-cards-thumb-box is-cta-text is-cols-3 surface-grey section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text is-cols-3` | H: "Landmark financings, across the region." · 3× `ct-card` · media: 3 data-bg | **OK** |
| 11 | 9b. AWARDS, Solutions & Awards, surface-white<br>`cmp cmp-solutions-awards surface-white section-y` | `solutions-awards` — **current block** | H: "A bank that delivers." · 5× `sa-logo` / 5× `sa-logo-fill` | **OK** |
| 12 | 10. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 13 | 11. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 14 | /11. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Equity Capital Markets — `equity-capital-markets-v2-2026-08-11.html`

*Investment Banking · 12 sections · 81 kb · gate: **0 FAIL / 5 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `equity-capital-markets-v2-ram.html`*

<details><summary>gate lines naming this page (5)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-video-content is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-people-carousel is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Setting the benchmark in regional capital markets." · media: 1 video | **JUDGE** |
| 3 | 2. RANKINGS, Big Statement, surface-grey<br>`cmp cmp-big-statement surface-grey section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Ranked first,by the market." | **OK** |
| 4 | capabilities — Scroll Tab (pinned image swaps per item)<br>`cmp cmp-scroll-tab surface-white section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "Across the equity lifecycle." · 3× `ss-step` / 3× `ss-step-img` · media: 6 data-bg | **OK** |
| 5 | 7. SELECTED TRANSACTIONS, Video Content slider, surface-grey<br>`cmp cmp-video-content surface-grey section-y` | `synced-slider` → `cmp cmp-synced-slider` | H: "The house issuers trust with their biggest moves" · media: 4 data-bg | **OK** |
| 6 | 8. SUCCESS STORIES, surface-white<br>`cmp cmp-cards-thumb-box is-cta-text is-cols-3 surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text is-cols-3` | H: "Deals that set the standard." · 3× `ct-card` · media: 3 data-bg | **OK** |
| 7 | 4. CAPITAL ACCESS, surface-navy<br>`cmp cmp-content-block-sidebyside surface-navy section-y` | `content-block-sidebyside` — **current block** | H: "Direct access to USD 1.5tn of private capital." | **OK** |
| 8 | 5. HISTORY TIMELINE, surface-grey<br>`cmp cmp-history-timeline surface-grey section-y` | `history-timeline` — **current block** | H: "Three decades of market firsts." · 7× `ht-node` | **OK** |
| 9 | 6. PEOPLE, surface-white<br>`cmp cmp-people-carousel surface-white section-y` | `cards-people-carousel` → `cmp cmp-cards is-hover-zoom cards-people` on `cd-carousel`; tab rail → `chip chip-lg` + `data-tab` | H: "The bankers behind every landmark deal." · 9× `pc-card` · media: 9 data-bg | **OK** |
| 10 | 9. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 11 | 10. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 12 | /10. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Debt Capital Markets — `debt-capital-markets-v2-2026-07-27.html`

*Investment Banking · 11 sections · 73 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `debt-capital-markets-v2-ram.html`*

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-spotlight is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-people-carousel is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Unrivalled access to institutional and private capit" · media: 1 video | **JUDGE** |
| 3 | 2. CAPABILITIES, surface-white<br>`cmp cmp-intro-side-by-side surface-white section-y` | `intro-side-by-side` — **current block**; in-place atom rewrite: `ip-ic`→`icon-tile`, `ip-t`/`ip-d`→`type-*` (exact pair still TODO in MIGRATION §3) | H: "From sovereign Sukuk to FI hybrids." · 3× `intro-pillar` / 3× `ip-t` | **JUDGE** |
| 4 | 3. RANKINGS, Big Statement, surface-grey<br>`cmp cmp-big-statement surface-grey section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Top-ranked acrossregional debt markets." | **OK** |
| 5 | 4. SELECTED TRANSACTIONS, Bento Spotlight, surface-white<br>`cmp cmp-bento-spotlight surface-white section-y` | `bento-spotlight` → `cmp cmp-bento bento-spotlight is-hover-lift is-hover-spotlight`; per-tile `is-w*/is-h*` spans replace `bs-grid--*` | H: "Recent deals, led by Emirates NBD." · 7× `bs-tile` · media: 1 video | **OK** |
| 6 | 5. GROUP PLATFORM, surface-grey<br>`cmp cmp-content-block-sidebyside surface-grey section-y` | `content-block-sidebyside` — **current block** | H: "One of MENAT's deepest liquidity platforms." · media: 3 img | **OK** |
| 7 | 6. GLOBAL REACH, surface-navy<br>`cmp cmp-world-map surface-navy section-y` | `world-map` / `world-map-stats` — **current block**; unified `data-behavior="world-map"` contract | H: "Anchored in the region. Connected to the world." | **OK** |
| 8 | 7. PEOPLE, surface-grey<br>`cmp cmp-people-carousel surface-grey section-y` | `cards-people-carousel` → `cmp cmp-cards is-hover-zoom cards-people` on `cd-carousel`; tab rail → `chip chip-lg` + `data-tab` | H: "Specialists across origination, structuring and dist" · 9× `pc-card` · media: 9 data-bg | **OK** |
| 9 | 8. CROSS-SELL, surface-white<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 10 | 9. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 11 | /9. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Custody — `custody-v2-2026-08-14.html`

*Investment Banking · 9 sections · 68 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S** · content-source twin: `custody-v2-ram.html`*

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-feature-scroll-track is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Safeguarding your assets, so you can focus on growth" · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Built on trust, run with precision." | **OK** |
| 4 | 3. WHAT WE OFFER - Feature Tab Cards, surface-grey<br>`cmp cmp-feature-scroll-track surface-grey` | **no current equivalent** — the pinned scroll-track recipe is not generalized (MIGRATION §4.4). Candidates: (a) degrade to `cards-carousel` and lose the pin, (b) leave untouched and report | H: "A complete custody offering." · 7× `cst-card` · media: 7 img | **JUDGE** |
| 5 | 4. GLOBAL REACH, surface-navy<br>`cmp cmp-world-map surface-navy section-y` | `world-map` / `world-map-stats` — **current block**; unified `data-behavior="world-map"` contract | H: "Supporting your ambition, in every market." | **OK** |
| 6 | How we help, scroll-story (pinned image swaps per principle)<br>`cmp cmp-scroll-tab surface-white section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "A partner invested in your success." · 5× `ss-step` / 5× `ss-step-img` · media: 10 data-bg | **OK** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Agency — `agency-v2-2026-08-14.html`

*Investment Banking · 9 sections · 68 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S** · content-source twin: `agency-v2-ram.html`*

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-feature-scroll-track is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Innovative, efficient and client-focused agency solu" · media: 1 video | **JUDGE** |
| 3 | 2. WHY CHOOSE US, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Integrity and independence, at every table." | **OK** |
| 4 | 3. STATS BAND, Big Statement, surface-grey<br>`cmp cmp-big-statement surface-grey section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Trusted with the mostcomplex mandates." | **OK** |
| 5 | 4. WHY BANK WITH US, surface-white<br>`cmp cmp-feature-scroll-track surface-white` | **no current equivalent** — the pinned scroll-track recipe is not generalized (MIGRATION §4.4). Candidates: (a) degrade to `cards-carousel` and lose the pin, (b) leave untouched and report | H: "Full-service agency, end to end." · 7× `cst-card` · media: 7 img | **JUDGE** |
| 6 | 5. GLOBAL REACH, surface-navy<br>`cmp cmp-world-map surface-navy section-y` | `world-map` / `world-map-stats` — **current block**; unified `data-behavior="world-map"` contract | H: "Supporting your growth, in every market." · media: 1 img | **OK** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Our People — `our-people-v2-2026-08-16.html`

*Investment Banking · 9 sections · 85 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `our-people-v2-ram.html`*

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN is-portrait-bleed (Quote Band variant) is RETIRED (CSS deleted 2026-09-01) — renders as the plain band until the sweep
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "The future starts with our people." · media: 1 video | **JUDGE** |
| 3 | 4. LEADERS, surface-white<br>`cmp cmp-cards-thumb-nobox is-portrait is-cta-text surface-white section-y` | `cards-people` → `cmp cmp-cards is-hover-zoom cards-people` (the people-grid recipe: `is-portrait` + `data-modal-open` cards, `.op-modal` bios stay `cmp-modal` unchanged)  ·  carry axes `is-portrait is-cta-text` | H: "The people who set the standard." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 4 | 5. EXPERTS, surface-grey<br>`cmp cmp-cards-thumb-nobox is-portrait is-cta-text is-cols-3 surface-grey section-y` | `cards-people` → `cmp cmp-cards is-hover-zoom cards-people` (the people-grid recipe: `is-portrait` + `data-modal-open` cards, `.op-modal` bios stay `cmp-modal` unchanged)  ·  carry axes `is-portrait is-cta-text is-cols-3` | H: "The hands that get it done." · 3× `ct-card` · media: 3 data-bg | **OK** |
| 5 | 3. CEO QUOTE, surface-navy<br>`cmp cmp-quote-band is-portrait-bleed surface-navy section-y` | `quote-band` — **current block**  ·  `is-portrait-bleed` variant is RETIRED (gate WARNs) — emits as the plain band | media: 1 data-bg | **JUDGE** |
| 6 | 5b. PRODUCT SPECIALISTS, surface-white<br>`cmp cmp-cards-thumb-nobox is-portrait is-cta-text is-cols-3 surface-white section-y` | `cards-people` → `cmp cmp-cards is-hover-zoom cards-people` (the people-grid recipe: `is-portrait` + `data-modal-open` cards, `.op-modal` bios stay `cmp-modal` unchanged)  ·  carry axes `is-portrait is-cta-text is-cols-3` | H: "Deep expertise in every product." · 3× `ct-card` · media: 3 data-bg | **OK** |
| 7 | 6. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 8 | PERSON DETAIL OVERLAYS (DS modal recipe)<br>`cmp-modal` | `modal` — **current block**; `.overlay`→`.modal-overlay`, `modal-close`→`btn btn-outline btn-icon btn-sm` + `.sr-only`, panel → `card-panel` | H: "Farah Nasser" · 20× `op-modal-bio` · media: 10 data-bg | **OK** |
| 9 | /PERSON DETAIL OVERLAYS<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Success Story Library — `case-study-library-v2-2026-07-27.html`

*Investment Banking · 6 sections · 69 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S** · content-source twin: `case-study-library-v2-ram.html`*

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-dark<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Turning opportunity into impact." · media: 1 video | **JUDGE** |
| 3 | 2. FEATURED, surface-white<br>`cmp cmp-cards-thumb-box is-cta-text is-cols-3 surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text is-cols-3` | H: "The deals that made headlines." · 3× `ct-card` · media: 3 data-bg | **OK** |
| 4 | 3. LIBRARY + FILTERS, surface-grey<br>`cmp cmp-cards-thumb-box is-cta-text surface-grey section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text` | H: "Our track record." · 11× `ct-card` · media: 11 data-bg | **OK** |
| 5 | 4. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 6 | /4. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Securities Services — `securities-services-2026-08-14.html`

*Investment Banking · 9 sections · 69 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-feature-scroll-track is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Trusted expertise for every trade." · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Built for the modern trader." | **OK** |
| 4 | 3. WHAT WE OFFER, surface-grey<br>`cmp cmp-feature-scroll-track surface-grey` | **no current equivalent** — the pinned scroll-track recipe is not generalized (MIGRATION §4.4). Candidates: (a) degrade to `cards-carousel` and lose the pin, (b) leave untouched and report | H: "A complete trading offering." · 7× `cst-card` · media: 7 img | **JUDGE** |
| 5 | scroll-story (pinned image swaps per item)<br>`cmp cmp-scroll-tab surface-white section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "One ecosystem for every kind of trader." · 5× `ss-step` / 5× `ss-step-img` · media: 10 data-bg | **OK** |
| 6 | 5. GLOBAL REACH, surface-navy<br>`cmp surface-navy section-y` | **keep** — the sanctioned interim `gls-global` recipe: navy band + `section-head is-split` + `badge badge-solid` market pills (MIGRATION/glossary: candidate to formalize, not yet a component) | H: "Trade beyond borders." | **CUSTOM-KEEP** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Online Trading — `online-trading-2026-08-14.html`

*Investment Banking · 9 sections · 64 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-feature-scroll-track is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Trade smarter on a secure, digital-first platform." · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "A platform built around how you trade." | **OK** |
| 4 | 3. WHAT SETS US APART, surface-grey<br>`cmp cmp-kicker-cards surface-grey section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Everything you need to trade, in one place." · 7× `kc-card` | **OK** |
| 5 | 4. GLOBAL REACH, surface-navy<br>`cmp surface-navy section-y` | **keep** — the sanctioned interim `gls-global` recipe: navy band + `section-head is-split` + `badge badge-solid` market pills (MIGRATION/glossary: candidate to formalize, not yet a component) | H: "Integrated access across UAE and GCC markets." | **CUSTOM-KEEP** |
| 6 | 5. HOW CAN WE HELP, vertical tabs, surface-white<br>`cmp cmp-feature-scroll-track surface-white` | **no current equivalent** — the pinned scroll-track recipe is not generalized (MIGRATION §4.4). Candidates: (a) degrade to `cards-carousel` and lose the pin, (b) leave untouched and report | H: "See how the platform works for you." · 5× `cst-card` · media: 5 img | **JUDGE** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Margin Trading — `margin-trading-2026-08-14.html`

*Investment Banking · 9 sections · 67 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-feature-scroll-track is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Unlock more investing power from the portfolio you a" · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Borrow against your holdings, instead of selling the" | **OK** |
| 4 | 3. WHAT SETS US APART, surface-grey<br>`cmp cmp-feature-scroll-track surface-grey` | **no current equivalent** — the pinned scroll-track recipe is not generalized (MIGRATION §4.4). Candidates: (a) degrade to `cards-carousel` and lose the pin, (b) leave untouched and report | H: "Built for serious, experienced investors." · 7× `cst-card` · media: 7 img | **JUDGE** |
| 5 | 4. WHERE YOU CAN TRADE, surface-navy<br>`cmp surface-navy section-y` | **keep** — the sanctioned interim `gls-global` recipe: navy band + `section-head is-split` + `badge badge-solid` market pills (MIGRATION/glossary: candidate to formalize, not yet a component) | H: "Buying power across the region&rsquo;s leading marke" | **CUSTOM-KEEP** |
| 6 | 5. HOW IT WORKS, vertical tabs, surface-white<br>`cmp cmp-how-it-works-steps surface-white section-y` | `how-it-works-steps` — **still a live block + CATALOG entry**, but MIGRATION §3 routes it to `cards-number` | H: "From eligibility to active buying power, in five ste" · 5× `hiw-step` / 5× `hiw-step-marker` | **JUDGE** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Institutional Trading — `institutional-trading-2026-08-14.html`

*Investment Banking · 9 sections · 69 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-feature-scroll-track is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Execution shaped by regionalinsight, held to global " · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Structured to support you at every stage of executio" | **OK** |
| 4 | 3. WHAT SETS US APART, surface-grey<br>`cmp cmp-feature-scroll-track surface-grey` | **no current equivalent** — the pinned scroll-track recipe is not generalized (MIGRATION §4.4). Candidates: (a) degrade to `cards-carousel` and lose the pin, (b) leave untouched and report | H: "A full institutional execution offering." · 7× `cst-card` · media: 7 img | **JUDGE** |
| 5 | 4. GLOBAL REACH, surface-navy<br>`cmp surface-navy section-y` | **keep** — the sanctioned interim `gls-global` recipe: navy band + `section-head is-split` + `badge badge-solid` market pills (MIGRATION/glossary: candidate to formalize, not yet a component) | H: "Direct access to the exchanges and platforms you tra" | **CUSTOM-KEEP** |
| 6 | scroll-story (pinned image swaps per item)<br>`cmp cmp-scroll-tab surface-white section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "How we approach every order." · 5× `ss-step` / 5× `ss-step-img` · media: 10 data-bg | **OK** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### GCC Market Access — `gcc-market-access-2026-07-20.html`

*Investment Banking · 9 sections · 64 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-pillar-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Invest beyond borders, across the GCC." · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Regional reach, brokerage strength, one platform." | **OK** |
| 4 | 3. WHAT SETS US APART, surface-grey<br>`cmp cmp-kicker-cards surface-grey section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Access multiple markets with ease." · 7× `kc-card` | **OK** |
| 5 | 4. GLOBAL REACH, surface-navy<br>`cmp cmp-content-block-sidebyside surface-navy section-y` | `content-block-sidebyside` — **current block** | H: "One relationship, the whole region." | **OK** |
| 6 | 5. HOW CAN WE HELP, ways-to-accept triad, surface-white<br>`cmp cmp-pillar-grid surface-white section-y` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked is-cols-N` | H: "A comprehensive range of trading solutions." · 5× `pg-card` | **OK** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward,&nbsp;together." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Execution Capabilities — `execution-capabilities-2026-08-11.html`

*Markets · 9 sections · 68 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO (navy gradient, image-less)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Powered by insight. Built for performance. Engineere" · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "The widest research coverage in MENAT." | **OK** |
| 4 | capabilities — Scroll Tab (pinned image swaps per item)<br>`cmp cmp-scroll-tab surface-grey section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "One desk for every asset class." · 6× `ss-step` / 6× `ss-step-img` · media: 12 data-bg | **OK** |
| 5 | 4. PLATFORM / EXECUTE, surface-navy<br>`cmp cmp-content-block-sidebyside surface-navy section-y` | `content-block-sidebyside` — **current block** | H: "Institutional-grade execution, anywhere." | **OK** |
| 6 | 5. SOLUTIONS, surface-white<br>`cmp cmp-bento-expand surface-white section-y` | `bento-expand` — **current block** | H: "Solutions built around your mandate." · 3× `be-panel` · media: 3 data-bg | **OK** |
| 7 | 6. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "More from Global Markets &amp; Treasury." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 7. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Build your treasury strategy with us." | **OK** |
| 9 | /7. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Structured Solutions — `structured-solutions-2026-07-20.html`

*Markets · 12 sections · 85 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO (navy, image-less)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Your business is unique, so our solutions are built " · media: 1 video | **JUDGE** |
| 3 | 2. INTRO + CATEGORY NAV, surface-white<br>`cmp surface-white section-y` | **bespoke atom composition** — renders on current atoms (`section-head is-split`, `badge`/`badge-solid`, `dl-row`, `filter-*`, `type-*`); keep as-is | H: "Five disciplines, one structuring team." | **CUSTOM-KEEP** |
| 4 | 3. RISK & HEDGING, surface-grey<br>`cmp cmp-content-block-sidebyside surface-grey section-y` | `content-block-sidebyside` — **current block** | H: "Navigate volatility with smarter hedging." | **OK** |
| 5 | 4. FINANCING & LIQUIDITY, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Free up liquidity with asset-backed, structured fina" | **OK** |
| 6 | 5. INVESTMENT, surface-grey<br>`cmp cmp-content-block-sidebyside surface-grey section-y` | `content-block-sidebyside` — **current block** | H: "Put surplus funds to work, on your risk and liquidit" | **OK** |
| 7 | 6. PRECIOUS METALS, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Delivering trusted bullion expertise for real-asset " | **OK** |
| 8 | 7. ESG-LINKED, surface-grey<br>`cmp cmp-content-block-sidebyside surface-grey section-y` | `content-block-sidebyside` — **current block** | H: "Financing progress through sustainable, performance-" | **OK** |
| 9 | 8. INSIGHTS, surface-navy<br>`cmp cmp-cards-thumb-box is-cols-3 is-cta-text is-full-desc surface-navy section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  **`is-full-desc` has no axis on the cards compositions** (1 declaration in ds.css, dies with the `cmp-cards-thumb-box` zone)  ·  carry axes `is-cols-3 is-cta-text is-full-desc` | H: "Stay ahead of the markets." · 3× `ct-card` · media: 3 data-bg | **JUDGE** |
| 10 | 9. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore more of Global Markets &amp; Treasury." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 11 | 10. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Build your treasury strategy with us." | **OK** |
| 12 | /10. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### FX Hub — `fx-hub-2026-08-10.html`

*Markets · 10 sections · 69 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-magazine is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-navy<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Trade FX. Anytime. Anywhere." · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Self-service FX, built for direct dealers." | **OK** |
| 4 | 3. WHY / FEATURES, surface-grey<br>`cmp cmp-bento-magazine surface-grey section-y` | `bento-magazine` → `cmp cmp-bento bento-magazine is-hover-lift` | H: "Everything you need to trade FX, all in one place." · media: 1 data-bg, 1 video | **OK** |
| 5 | scroll-story (pinned image swaps per item)<br>`cmp cmp-scroll-tab surface-white section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "Trade, settle and manage from one platform." · 3× `ss-step` / 3× `ss-step-img` · media: 6 data-bg | **OK** |
| 6 | 5. SEE IN ACTION, underline tabs, surface-grey<br>`cmp cmp-tabs surface-grey section-y` | `tabs-*` v4 → `.tabs-vert`→`.tb-rail.is-vertical`, `.tab-vert`→`.tb-tab`, `.tabs-underline`→`.tb-rail.is-underline`, `.tab-ul`→`.tb-tab`, `.tab-panel`→`.tb-panel`; strip runtime ARIA | H: "See the FX Hub in action." · media: 3 data-bg | **OK** |
| 7 | 6. GETTING STARTED, steps, surface-white<br>`cmp cmp-how-it-works-steps surface-white section-y` | `how-it-works-steps` — **still a live block + CATALOG entry**, but MIGRATION §3 routes it to `cards-number` | H: "Up and trading in three steps." · 3× `hiw-step` / 3× `hiw-step-marker` | **JUDGE** |
| 8 | 7. CROSS-SELL, surface-grey<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Go further with Global Markets and Treasury." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 9 | 9. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Build your FX strategy with us." | **OK** |
| 10 | /9. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Initiatives / Partners Library — `initiatives-and-partners-v2-2026-08-11.html`

*Our Expertise & Partnerships · 8 sections · 75 kb · gate: **0 FAIL / 5 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M** · content-source twin: `initiatives-and-partners-v2-ram.html`*

<details><summary>gate lines naming this page (5)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-magazine is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, Image Left, surface-dark<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Partnerships that move markets." · media: 1 img | **JUDGE** |
| 3 | 2. FIRSTS & MILESTONES, Impact Stats, surface-white<br>`cmp cmp-bento-magazine surface-white section-y` | `bento-magazine` → `cmp cmp-bento bento-magazine is-hover-lift` | H: "Building the region&rsquo;s next-gen financial infra" · media: 2 data-bg | **OK** |
| 4 | 3. PARTNERSHIPS, Scroll-story (pinned video swaps per partner)<br>`cmp cmp-scroll-tab surface-grey section-y` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over; long `ss-points` → `list-check`, short labels stay `ss-chips` | H: "Seven partnerships, one payments backbone" · 7× `ss-step` / 7× `ss-step-img` · media: 14 data-bg | **OK** |
| 5 | 4. INITIATIVES / NEWS, Highlights Tiles (3-up), surface-white, id=initiatives<br>`cmp cmp-cards-thumb-box is-cols-2 is-cta-text surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cols-2 is-cta-text` | H: "Embedding finance where it matters&nbsp;most" · media: 2 data-bg | **OK** |
| 6 | 5. WHY OUR PARTNERSHIPS WORK, Highlights Tiles (3) + CTA, surface-grey<br>`cmp cmp-highlights-tiles surface-grey section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Why leading organisations choose us" · 3× `ht-tile` / 3× `ht-tile-title` | **OK** |
| 7 | 7. CTA Band, surface-navy, id=contact<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward, together." | **OK** |
| 8 | /7. CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Events Library — `events-library-2026-07-20.html`

*Our Expertise & Partnerships · 8 sections · 64 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-center is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-navy (compact)<br>`cmp cmp-hero-video-center surface-navy` | `hero` → `cmp cmp-hero is-center surface-navy` + `ov ov-black ov-radial` | H: "At the centre of insight and exchange." · media: 1 video | **JUDGE** |
| 3 | 2. FEATURED, surface-white<br>`cmp cmp-feature-spotlight surface-white section-y` | `feature-spotlight` — **current block** | H: "A partnership we are proud to have shaped." · media: 1 data-bg | **OK** |
| 4 | 3. UPCOMING EVENTS + FILTERS, surface-grey<br>`cmp cmp-cards-thumb-box is-cta-text surface-grey section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text` | H: "Where we will be next." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 5 | 4. LATEST EVENTS, surface-white<br>`cmp cmp-cards-thumb-box is-cta-text surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text` | H: "Where we have already been." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 6 | 4. LATEST EVENTS, surface-white<br>`cmp-pagination mt-10` | `pagination` — **current block**; `pg-*`→`pgn-*` if any legacy names survive | pager row | **OK** |
| 7 | 5. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 8 | /5. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Media Library — `media-library-2026-07-20.html`

*Insights & Research · 7 sections · 64 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-navy<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Explore the headlines driving change." · media: 1 video | **JUDGE** |
| 3 | 2. FEATURED, surface-white<br>`cmp cmp-feature-spotlight surface-white section-y` | `feature-spotlight` — **current block** | H: "Worth your attention this month." · media: 1 data-bg | **OK** |
| 4 | 3. LIBRARY + FILTERS, surface-grey<br>`cmp cmp-cards-thumb-box is-cta-text surface-grey section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text` | H: "The latest updates from Emirates NBD." · 9× `ct-card` · media: 9 data-bg | **OK** |
| 5 | 4. REPORTS & FACTSHEETS, surface-white<br>`cmp surface-white section-y` | **keep** — the `dl-row` molecule (minted 2026-08-29, registered LIGHT ISLAND) on a plain `cmp surface-*` band; canonical section-head + type atoms | H: "Trusted data. Transparent reporting." | **CUSTOM-KEEP** |
| 6 | 5. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 7 | /5. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Article Library — `article-library-2026-07-20.html`

*Insights & Research · 5 sections · 63 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-navy<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Stay ahead with our latest insights and perspectives" · media: 1 video | **JUDGE** |
| 3 | 2. LIBRARY + FILTERS, surface-white<br>`cmp cmp-cards-thumb-box is-cols-3 is-cta-text surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cols-3 is-cta-text` | H: "Every article from Emirates NBD Research." · 8× `ct-card` · media: 8 data-bg | **OK** |
| 4 | 3. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Turn our research into your next move." | **OK** |
| 5 | /3. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Article Example — `article-example-2026-07-20.html`

*Insights & Research · 7 sections · 60 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. ARTICLE HERO, surface-navy<br>`cmp cmp-article surface-navy art-hero` | `article` — **current block** (compound roots `.cmp-article.art-hero` / body) | H: "OPEC+ sticks with incremental increases in output" · media: 1 data-bg | **OK** |
| 3 | 2. KEY TAKEAWAYS, surface-grey<br>`cmp cmp-kicker-cards surface-grey section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Three takeaways from the decision." · 3× `kc-card` | **OK** |
| 4 | 3. ARTICLE BODY, surface-white<br>`cmp cmp-article surface-white section-y` | `article` — **current block** (compound roots `.cmp-article.art-hero` / body) | H: "Targets held steady into Q1 2026" · media: 1 img | **OK** |
| 5 | 4. RELATED ARTICLES, surface-grey<br>`cmp cmp-cards-thumb-box is-cta-text surface-grey section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text` | H: "More from Emirates NBD Research." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 6 | 5. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 7 | /5. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Tutorials & Platform Demos — `tutorials-platform-demos-2026-07-20.html`

*Support & Resources · 7 sections · 77 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO (navy, with platform image)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Your resource for tutorials, demos and how-to guides" · media: 1 video | **JUDGE** |
| 3 | 2. VIDEO TUTORIALS, tabbed cards, surface-white<br>`cmp cmp-cards-thumb-box is-cta-text surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  carry axes `is-cta-text` | H: "Learn each platform, step by step." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 4 | 3. DOWNLOADABLE GUIDES, surface-grey<br>`cmp surface-grey section-y` | **keep** — the `dl-row` molecule (minted 2026-08-29, registered LIGHT ISLAND) on a plain `cmp surface-*` band; canonical section-head + type atoms | H: "Keep the how-to on hand." · 20× `dl-row` | **CUSTOM-KEEP** |
| 5 | 4. FAQs, accordion, surface-white<br>`cmp cmp-accordion surface-white section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Answers to common questions." · 5× `acc-icon` / 5× `acc-inner` | **OK** |
| 6 | 5. CLOSING CONTACT CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Need more than a tutorial?" | **OK** |
| 7 | /5. CLOSING CONTACT CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Form Centre — `form-centre-2026-07-20.html`

*Support & Resources · 7 sections · 97 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-navy<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Every Corporate and Institutional banking document, " · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp surface-white section-y` | **bespoke atom composition** — renders on current atoms (`section-head is-split`, `badge`/`badge-solid`, `dl-row`, `filter-*`, `type-*`); keep as-is | H: "Review the terms, then complete the form." | **CUSTOM-KEEP** |
| 4 | 3. DOCUMENT LIBRARY + FILTERS, surface-grey<br>`cmp cmp-kicker-cards surface-grey section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Browse and download documents." · 77× `kc-card` | **OK** |
| 5 | 4. TO START TRADING, surface-white<br>`cmp surface-white section-y` | **bespoke atom composition** — renders on current atoms (`section-head is-split`, `badge`/`badge-solid`, `dl-row`, `filter-*`, `type-*`); keep as-is | H: "What you need to start trading in the UAE." | **CUSTOM-KEEP** |
| 6 | 5. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Not sure which form you need?" | **OK** |
| 7 | /5. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Fraud Awareness Hub — `fraud-awareness-hub-2026-07-20.html`

*Support & Resources · 10 sections · 69 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-pillar-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-navy<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "See the signs. Secure your business. Stay ahead of r" · media: 1 video | **JUDGE** |
| 3 | 2. INTRO, surface-white<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — **current block** | H: "Awareness is your strongest defence." | **OK** |
| 4 | 3. COMMON FRAUD THREATS, surface-grey<br>`cmp cmp-kicker-cards surface-grey section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Understanding common fraud threats." · 5× `kc-card` | **OK** |
| 5 | 4. VIDEO ADVICE, surface-white<br>`cmp cmp-cards-thumb-box surface-white section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`) | H: "Actionable advice, on demand." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 6 | 5. TESTIMONIAL, surface-grey<br>`cmp cmp-quote-band surface-grey section-y` | `quote-band` — **current block** | media: 1 data-bg | **OK** |
| 7 | 6. WORKING TOGETHER, surface-navy<br>`cmp cmp-pillar-grid is-cols-4 surface-navy section-y` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked is-cols-N` | H: "Working together to make banking safer." · 4× `pg-card` · media: 1 data-bg | **OK** |
| 8 | 7. FAQ, surface-white<br>`cmp cmp-accordion surface-white section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Frequently asked questions." · 6× `acc-icon` / 6× `acc-inner` | **OK** |
| 9 | 8. CLOSING CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Spot it. Report it. Stop it." | **OK** |
| 10 | /8. CLOSING CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### FAQs — `faqs-2026-07-20.html`

*Support & Resources · 6 sections · 92 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, compact, surface-navy<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Find the answers and guidance you need." · media: 1 video | **JUDGE** |
| 3 | 1b. FAQ SEARCH + CATEGORIES, surface-navy<br>`cmp surface-navy section-y` | **keep** — the generic `data-filter` DS behavior on a plain band (`filter-bar`/`filter-chips`/`filter-search`/`filter-count`/`filter-empty`) | search + chips + count | **CUSTOM-KEEP** |
| 4 | 2. FAQ ACCORDIONS, surface-white<br>`cmp cmp-accordion surface-white section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Getting Started" · 25× `acc-icon` / 25× `acc-inner` | **OK** |
| 5 | 3. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 6 | /3. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Contact Us — `contact-us-2026-07-20.html`

*Support & Resources · 7 sections · 60 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, surface-navy (image-less)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Get in touch." · media: 1 video | **JUDGE** |
| 3 | 2. INTRO + PRIMARY CONTACT CARDS, surface-white<br>`cmp cmp-kicker-cards surface-white section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Two ways to start a conversation." | **OK** |
| 4 | 3. PLATFORM SUPPORT, surface-grey<br>`cmp surface-grey section-y` | **bespoke atom composition** — renders on current atoms (`section-head is-split`, `badge`/`badge-solid`, `dl-row`, `filter-*`, `type-*`); keep as-is | H: "Help with businessONLINE and smartDEAL." | **CUSTOM-KEEP** |
| 5 | 4. RELATED SOLUTIONS, surface-white<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 6 | 5. CLOSING CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 7 | /5. CLOSING CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Start an application - Corporate Banking — `start-application-corporate-banking-2026-07-20.html`

*Support & Resources · 5 sections · 70 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-image-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO (compact header)<br>`cmp cmp-hero-image-left surface-navy` | `hero-image` → `cmp cmp-hero is-bottom surface-navy` + `media-cover data-bg`; the `.ov` atoms carry over, `hil-*` wrappers die | H: "Unlock the next stage of your growth." · media: 1 data-bg | **JUDGE** |
| 3 | 2. APPLICATION FORM, surface-grey<br>`cmp cmp-form-shell surface-grey section-y` | `form-shell` — **current block** | H: "Start your application" | **OK** |
| 4 | 3. CLOSING CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let&rsquo;s move forward, together." | **OK** |
| 5 | /3. CLOSING CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Start an application - Trading & Securities — `start-application-trading-securities-2026-07-20.html`

*Support & Resources · 5 sections · 69 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-image-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO (compact header)<br>`cmp cmp-hero-image-left surface-navy` | `hero-image` → `cmp cmp-hero is-bottom surface-navy` + `media-cover data-bg`; the `.ov` atoms carry over, `hil-*` wrappers die | H: "Unlock the next stage of your growth." · media: 1 data-bg | **JUDGE** |
| 3 | 2. APPLICATION FORM, surface-grey<br>`cmp cmp-form-shell surface-grey section-y` | `form-shell` — **current block** | H: "Thank you, your application has been received." | **OK** |
| 4 | 3. CLOSING CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let’s move forward, together." | **OK** |
| 5 | /3. CLOSING CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Support Form - Corporate Banking — `support-form-corporate-banking-2026-07-20.html`

*Support & Resources · 5 sections · 64 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-image-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO (compact, navy)<br>`cmp cmp-hero-image-left surface-navy` | `hero-image` → `cmp cmp-hero is-bottom surface-navy` + `media-cover data-bg`; the `.ov` atoms carry over, `hil-*` wrappers die | H: "Here to help, whatever your business needs." · media: 1 data-bg | **JUDGE** |
| 3 | 2. SUPPORT FORM, surface-grey<br>`cmp cmp-form-shell cmp-tabs surface-grey section-y` | `form-shell` — **current block** | H: "Reach your team." | **OK** |
| 4 | 3. CLOSING CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Here whenever you need us." | **OK** |
| 5 | /3. CLOSING CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Support Form - Trading & Securities — `support-form-trading-securities-2026-07-20.html`

*Support & Resources · 5 sections · 62 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-image-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO (compact)<br>`cmp cmp-hero-image-left surface-navy` | `hero-image` → `cmp cmp-hero is-bottom surface-navy` + `media-cover data-bg`; the `.ov` atoms carry over, `hil-*` wrappers die | H: "Here to help, whatever your business needs." · media: 1 data-bg | **JUDGE** |
| 3 | 2. SUPPORT FORM, surface-white<br>`cmp cmp-form-shell cmp-tabs surface-grey section-y` | `form-shell` — **current block** | H: "Thank you, your request is on its way." | **OK** |
| 4 | 3. CTA, surface-navy<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Here whenever you need us." | **OK** |
| 5 | /3. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Payment Tracker — `payment-tracker-2026-08-25.html`

*Support & Resources · 10 sections · 67 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-about-stats is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | Hero, Video BG (Left)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Every payment,tracked end to end" · media: 1 video | **JUDGE** |
| 3 | Big Statement, editorial opener<br>`cmp cmp-big-statement pt-bigstate surface-grey section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Chase nothing,see everything." | **OK** |
| 4 | Three core features, Bento Expand<br>`cmp cmp-bento-expand surface-white section-y` | `bento-expand` — **current block** | H: "Everything you need tofollow a payment." · 3× `be-panel` · media: 3 data-bg | **OK** |
| 5 | Payment lifecycle, How It Works Steps<br>`cmp cmp-how-it-works-steps surface-grey section-y` | `how-it-works-steps` — **still a live block + CATALOG entry**, but MIGRATION §3 routes it to `cards-number` | H: "Follow every stage, in real time" · 4× `hiw-step` / 4× `hiw-step-marker` | **JUDGE** |
| 6 | /Payment lifecycle<br>`cmp cmp-about-stats surface-white section-y` | `statement-stats` → `cmp cmp-statement-stats` | H: "Cross-border payments ride the Swift gpi network, re" | **OK** |
| 7 | What you can track, Highlights Tiles<br>`cmp cmp-highlights-tiles surface-grey section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "What you can track" · 4× `ht-tile` / 4× `ht-tile-title` | **OK** |
| 8 | CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Start tracking your payments" | **OK** |
| 9 | Explore the full range, cross-link 4-card grid<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 10 | /Explore the full range<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Commodities — `commodities-2026-08-04.html`

*Support & Resources · 10 sections · 68 kb · gate: **0 FAIL / 5 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (5)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-photo is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, Image BG (Left)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Commodity price risk, managed." · media: 1 video | **JUDGE** |
| 3 | 2. POSITIONING, Big Statement<br>`cmp cmp-big-statement surface-grey section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Certainty,not guesswork." | **OK** |
| 4 | 3. WHO WE WORK WITH, Highlights Tiles<br>`cmp cmp-highlights-tiles surface-white section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Who we work with" · 3× `ht-tile` / 3× `ht-tile-title` | **OK** |
| 5 | 4. HOW HEDGING WORKS, How It Works Steps<br>`cmp cmp-how-it-works-steps surface-grey section-y` | `how-it-works-steps` — **still a live block + CATALOG entry**, but MIGRATION §3 routes it to `cards-number` | H: "How hedging works" · 4× `hiw-step` / 4× `hiw-step-marker` | **JUDGE** |
| 6 | 5. WHAT THE DESK OFFERS, Bento Photographic<br>`cmp cmp-bento-photo surface-white section-y` | `bento-photo` → `cmp cmp-bento bento-photo is-hover-zoom` | H: "What the desk offers" · 5× `bp-tile` / 5× `bp-tile-title` · media: 5 data-bg | **OK** |
| 7 | 6. WHY EMIRATES NBD, content block (qualitative, no numbers)<br>`cmp cmp-kicker-cards surface-grey section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Why Emirates NBD" · 3× `kc-card` | **OK** |
| 8 | 7 + 8. CTA BAND with compliance caveat<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Talk to our Global Markets and Treasury desk" | **OK** |
| 9 | 9. CROSS-NAV, Bento Image Cards<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 10 | /9. CROSS-NAV<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Instant Banking Services — `instant-banking-services-2026-08-04.html`

*Support & Resources · 8 sections · 70 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-digital-tools-showcase is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, Video BG (Left)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Banking at your fingertips" · media: 1 video | **JUDGE** |
| 3 | 2. VALUE PROPS, Digital Tools Showcase<br>`cmp cmp-digital-tools-showcase surface-grey section-y` | `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb` on the carousel frame | H: "Do so much more" · media: 5 data-bg | **OK** |
| 4 | 3. PAYMENT TRACKER, Feature Spotlight<br>`cmp cmp-feature-spotlight surface-white section-y` | `feature-spotlight` — **current block** | H: "Track your payments on businessONLINE" · media: 1 data-bg | **OK** |
| 5 | 4. SERVICE CATALOGUE, Accordion<br>`cmp cmp-accordion surface-grey section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Everything you can do" · 5× `acc-head-text` / 5× `acc-head-sub` | **OK** |
| 6 | 5. CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Get started on businessONLINE" | **OK** |
| 7 | 6. CROSS-NAV, Bento Image Cards<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | /6. CROSS-NAV<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Smart CDM — `smart-cdm-2026-08-05.html`

*Support & Resources · 10 sections · 68 kb · gate: **0 FAIL / 5 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **M***

<details><summary>gate lines naming this page (5)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-services-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, product revealed (surface-dark)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Cash deposits, on your own floor." · media: 1 video | **JUDGE** |
| 3 | 2. BEAT 1, the weight of cash (surface-white)<br>`cmp cmp-big-statement surface-white section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Cash is slow, heavy, and easy to lose track of." | **OK** |
| 4 | /2. BEAT 1<br>`cmp cmp-kicker-cards surface-navy section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "So we brought the bank to you." · 4× `kc-card` | **OK** |
| 5 | 5. THE FACTS, features grid (surface-white)<br>`cmp cmp-services-grid surface-grey section-y` | `cards-number` → `cmp cmp-cards cards-number is-cols-3`; `sg-chip` row → `chip` atoms in a `flex flex-wrap gap-2` row | H: "Everything the machine does, in plain&nbsp;terms." · 6× `sg-card` / 6× `sg-card-h` | **OK** |
| 6 | 4. THE RANGE, four models (surface-grey)<br>`cmp cmp-highlights-tiles surface-white section-y` | `cards-icon` → `cmp cmp-cards cards-icon` (+`is-cols-N` from the old Tailwind cols) | H: "Four capacities, one machine." · 4× `ht-tile` / 4× `ht-tile-title` | **OK** |
| 7 | 6. FAQ, accordion (surface-grey)<br>`cmp cmp-accordion surface-grey section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Questions, answered." · 4× `acc-icon` / 4× `acc-inner` | **OK** |
| 8 | 8. CROSS-NAV, bento image cards (surface-white)<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 9 | 7. THE INVITATION, CTA band (surface-navy)<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Bring your cash deposits on site." | **OK** |
| 10 | /7. THE INVITATION<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Virtual Accounts — `virtual-accounts-2026-08-05.html`

*Support & Resources · 9 sections · 64 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-photo is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, product revealed (surface-dark)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Know who paid, the moment they pay." · media: 1 video | **JUDGE** |
| 3 | 2. BEAT 1, the daily hunt (surface-white)<br>`cmp cmp-big-statement surface-white section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "One account, every payer, no idea who is who." | **OK** |
| 4 | 4. THE FACTS, features grid (surface-grey)<br>`cmp cmp-bento-photo surface-grey section-y` | `bento-photo` → `cmp cmp-bento bento-photo is-hover-zoom` | H: "Everything Virtual Accounts does, in plain&nbsp;term" · 6× `bp-tile` / 6× `bp-tile-title` · media: 6 data-bg | **OK** |
| 5 | 5. HOW IT WORKS, numbered steps (surface-white)<br>`cmp cmp-how-it-works-timeline surface-white section-y` | `how-it-works-timeline` — **current block** | H: "From sign up to reconciled cash, in five&nbsp;steps." | **OK** |
| 6 | 6. FAQ, accordion (surface-grey)<br>`cmp cmp-accordion surface-grey section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Questions, answered." · 4× `acc-icon` / 4× `acc-inner` | **OK** |
| 7 | 7. CROSS-NAV, bento image cards (surface-white)<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 8 | 8. THE INVITATION, CTA band (surface-navy)<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Stop guessing who paid. Start matching it." | **OK** |
| 9 | /8. THE INVITATION<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### SWIFT for Corporates — `swift-corporates-2026-08-05.html`

*Support & Resources · 10 sections · 67 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, video (surface-dark)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "One channel. Every bank." · media: 1 video | **JUDGE** |
| 3 | 2. THE PROBLEM, big statement (surface-white)<br>`cmp cmp-big-statement surface-white section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "Many banks should not mean many portals." | **OK** |
| 4 | 3. THE FACTS, photographic bento (surface-grey)<br>`cmp cmp-cards-thumb-box is-cols-3 is-full-desc surface-grey section-y` | `cards-boxed` / `cards-boxed-carousel` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-N` (`card-panel` on the `cd-card` + `--card-pad:0`)  ·  **`is-full-desc` has no axis on the cards compositions** (1 declaration in ds.css, dies with the `cmp-cards-thumb-box` zone)  ·  carry axes `is-cols-3 is-full-desc` | H: "What SWIFT for Corporates gives&nbsp;you." · 3× `ct-card` · media: 3 data-bg | **JUDGE** |
| 5 | 3.5 THE CONNECTIVITY MODEL, SCORE explainer (surface-navy)<br>`cmp cmp-content-block-sidebyside surface-navy section-y` | `content-block-sidebyside` — **current block** | H: "Built on SCORE, the Standardised Corporate Environme" · 4× `ip-ic` | **OK** |
| 6 | 4. HOW IT WORKS, numbered steps (surface-white)<br>`cmp cmp-how-it-works-timeline surface-white section-y` | `how-it-works-timeline` — **current block** | H: "From sign up to reconciled reporting, in five&nbsp;s" | **OK** |
| 7 | 5. FAQ, accordion (surface-grey)<br>`cmp cmp-accordion surface-grey section-y` | `acc` → root rename `cmp-accordion`→`cmp-acc`; `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap, put `.measure` on prose), `.acc-pad` 2-col grids → a utility grid in the body; boxed rows → `acc-boxed`, long Q&A → `acc-faq` | H: "Questions, answered." · 3× `acc-icon` / 3× `acc-inner` | **OK** |
| 8 | 6. CROSS-NAV, bento image cards (surface-white)<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` / `cards-carousel` → `cmp cmp-cards is-hover-zoom cards-thumb`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK** |
| 9 | 7. THE INVITATION, CTA band (surface-navy)<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Bring your bank connectivity onto one secure channel" | **OK** |
| 10 | /7. THE INVITATION<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### smartGUARANTEES — `smartguarantees-2026-08-10.html`

*Support & Resources · 10 sections · 64 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-pillar-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | 1. HERO, video (surface-dark)<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Every bank guarantee, managed online." · media: 1 video | **JUDGE** |
| 3 | 2. WHAT IT IS, positioning split (surface-white)<br>`cmp cmp-big-statement surface-white section-y` | `big-statement` — **current block**; `bst-line` type → `type-display-xxl` in markup, `bst-link`→`btn btn-text btn-lg` | H: "The digital home for your guarantees." | **OK** |
| 4 | 3. WHAT YOU CAN DO, capability grid (surface-grey)<br>`cmp cmp-intro-side-by-side surface-grey section-y` | `intro-side-by-side` — **current block**; in-place atom rewrite: `ip-ic`→`icon-tile`, `ip-t`/`ip-d`→`type-*` (exact pair still TODO in MIGRATION §3) | H: "Everything a guarantee needs, in one place." · 8× `intro-pillar` / 8× `ip-ic` · media: 1 data-bg | **JUDGE** |
| 5 | 4. GUARANTEE COVERAGE, four items (surface-white)<br>`cmp cmp-kicker-cards surface-white section-y` | `cards-kicker` → `cmp cmp-cards cards-kicker is-cols-3`; a NUMERIC kicker emits `cards-number` instead | H: "Cover for every guarantee you issue or receive." · 4× `kc-card` | **OK** |
| 6 | 5. WHY IT MATTERS, qualitative checklist (surface-grey)<br>`cmp cmp-content-block-sidebyside surface-grey section-y` | `content-block-sidebyside` — **current block** | H: "Less paper, less chasing, more control." · media: 1 data-bg | **OK** |
| 7 | 6. PROOF, RTA statement (surface-navy)<br>`cmp cmp-content-block-sidebyside surface-navy section-y` | `content-block-sidebyside` — **current block** | H: "A government-grade deployment." | **OK** |
| 8 | 7. HOW IT FITS, ecosystem link cards (surface-white)<br>`cmp cmp-pillar-grid surface-white section-y` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked is-cols-N` | H: "Connected to the rest of your trade toolkit." · 3× `pg-card` | **OK** |
| 9 | 8. CONTACT, CTA band (surface-navy)<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Ready to move your guarantees online?" | **OK** |
| 10 | /8. CONTACT<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### DCM Tombstones — `debt-capital-markets-tombstones-2026-08-11.html`

*Support & Resources · 5 sections · 76 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tombstone-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header — retail v4<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Debt Capital Markets" · media: 1 img | **JUDGE** |
| 3 | /Site Header — retail v4<br>`cmp cmp-tombstone-grid surface-grey section-y` | `cards-tombstones` → `cmp cmp-cards cards-tombstones` (count + ESG-legend head row is part of the composition) | H: "Debt Capital Markets" · 56× `tomb-card` · media: 56 img | **OK** |
| 4 | /Site Header — retail v4<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 5 | /Site Header — retail v4<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Loan Syndications Tombstones — `loan-syndications-tombstones-2026-08-11.html`

*Support & Resources · 5 sections · 64 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tombstone-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header — retail v4<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Loan Syndications" · media: 1 img | **JUDGE** |
| 3 | /Site Header — retail v4<br>`cmp cmp-tombstone-grid surface-grey section-y` | `cards-tombstones` → `cmp cmp-cards cards-tombstones` (count + ESG-legend head row is part of the composition) | H: "Loan Syndications" · 30× `tomb-card` · media: 30 img | **OK** |
| 4 | /Site Header — retail v4<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 5 | /Site Header — retail v4<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### ECM Tombstones — `equity-capital-markets-tombstones-2026-08-11.html`

*Support & Resources · 5 sections · 65 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tombstone-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header — retail v4<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Equity Capital Markets" · media: 1 img | **JUDGE** |
| 3 | /Site Header — retail v4<br>`cmp cmp-tombstone-grid surface-grey section-y` | `cards-tombstones` → `cmp cmp-cards cards-tombstones` (count + ESG-legend head row is part of the composition) | H: "Equity Capital Markets" · 36× `tomb-card` · media: 36 img | **OK** |
| 4 | /Site Header — retail v4<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 5 | /Site Header — retail v4<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Agency Division Tombstones — `agency-division-tombstones-2026-08-11.html`

*Support & Resources · 5 sections · 57 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tombstone-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header — retail v4<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Agency Division" · media: 1 img | **JUDGE** |
| 3 | /Site Header — retail v4<br>`cmp cmp-tombstone-grid surface-grey section-y` | `cards-tombstones` → `cmp cmp-cards cards-tombstones` (count + ESG-legend head row is part of the composition) | H: "Agency Division" · 18× `tomb-card` · media: 18 img | **OK** |
| 4 | /Site Header — retail v4<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 5 | /Site Header — retail v4<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


### Corporate Finance Tombstones — `corporate-finance-tombstones-2026-08-11.html`

*Support & Resources · 5 sections · 61 kb · gate: **0 FAIL / 3 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 0) · sweep effort: **S***

<details><summary>gate lines naming this page (3)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tombstone-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **already canonical** (block root is `cmp cmp-site-header ish-v4`) | H: "Emirates NBD Bank Websites" · 14× `ish-col` / 14× `ish-col-h` · media: 14 img | **OK** |
| 2 | /Site Header — retail v4<br>`cmp cmp-hero-video-left surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` (or `data-bg`) + `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`; Place `is-bottom` | H: "Corporate Finance" · media: 1 img | **JUDGE** |
| 3 | /Site Header — retail v4<br>`cmp cmp-tombstone-grid surface-grey section-y` | `cards-tombstones` → `cmp cmp-cards cards-tombstones` (count + ESG-legend head row is part of the composition) | H: "Corporate Finance" · 29× `tomb-card` · media: 29 img | **OK** |
| 4 | /Site Header — retail v4<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (block root IS `cmp ptf-ctaband surface-navy section-y`; the anonymous root is the block's own) | H: "Let's move forward, together." | **OK** |
| 5 | /Site Header — retail v4<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **already canonical** | 21× `fo1-link` | **OK** |


---

## 2 · Summary — counts

### 2.1 Pages by sweep effort

Effort = **number of sections needing hands-on work** — i.e. everything except the 151
verbatim header / footer / CTA-band sections and the still-current blocks that need nothing.
Sum across all pages: **228**.

**S — ≤4 re-composes (28 pages)**
`payments-v2-2026-08-25` (4) · `custody-v2-2026-08-14` (4) · `gcc-market-access-2026-07-20` (4) · `structured-solutions-2026-07-20` (4) · `tutorials-platform-demos-2026-07-20` (4) · `form-centre-2026-07-20` (4) · `contact-us-2026-07-20` (4) · `instant-banking-services-2026-08-04` (4) · `virtual-accounts-2026-08-05` (4) · `swift-corporates-2026-08-05` (4) · `smartguarantees-2026-08-10` (4) · `agency-v2-2026-08-14` (3) · `case-study-library-v2-2026-07-27` (3) · `execution-capabilities-2026-08-11` (3) · `events-library-2026-07-20` (3) · `media-library-2026-07-20` (3) · `faqs-2026-07-20` (3) · `article-library-2026-07-20` (2) · `article-example-2026-07-20` (2) · the five tombstone pages (2 each) · `start-application-corporate-banking` (1) · `start-application-trading-securities` (1) · `support-form-corporate-banking` (1) · `support-form-trading-securities` (1)

**M — 5–8 re-composes (19 pages)**
`digital-channels-v2-2026-08-10` (8) · `emirates-nbd-pay-v2-2026-08-25` (8) · `api-banking-v2-2026-07-29` (8) · `trade-supply-chain-finance-v2-2026-08-25` (7) · `equity-capital-markets-v2-2026-08-11` (6) · `fx-hub-2026-08-10` (6) · `commodities-2026-08-04` (6) · `smart-cdm-2026-08-05` (6) · `industry-specific-finance-v2-2026-08-10` (5) · `global-loan-solutions-v2-2026-07-27` (5) · `debt-capital-markets-v2-2026-07-27` (5) · `our-people-v2-2026-08-16` (5) · `securities-services-2026-08-14` (5) · `online-trading-2026-08-14` (5) · `margin-trading-2026-08-14` (5) · `institutional-trading-2026-08-14` (5) · `initiatives-and-partners-v2-2026-08-11` (5) · `fraud-awareness-hub-2026-07-20` (5) · `payment-tracker-2026-08-25` (5)

**L — 9+ re-composes (4 pages)**
`smarttrade-v2-2026-08-25` (11) · `businessonline-x-v2-2026-08-04` (9) · `smartscf-v2-2026-07-20` (9) · `sustainable-finance-v2-2026-07-27` (9)

### 2.2 Sections by target composition — this orders the shards

452 sections total. **151 (33%) are already canonical** (rows 1–3). The `hero` row is the
single biggest bloc and is entirely gated on JUDGE #1.

| → target | sections |
|---|---|
| `site-header-v4` (verbatim) | 51 |
| `footer-option1` (verbatim) | 51 |
| `cta-band` (verbatim) | 49 |
| **`hero` / `hero-image` / `hero-editorial` (`cmp-hero`)** | **49** |
| `cards` / `cards-carousel` (cards-thumb) | 30 |
| `content-block-sidebyside` *(current block — no change)* | 25 |
| `cards-boxed` / `cards-boxed-carousel` | 17 |
| `acc` / `acc-boxed` / `acc-faq` | 14 |
| `big-statement` *(current)* | 12 |
| `cards-kicker` | 11 |
| `cards-icon` | 10 |
| `cmp-bento` compositions (spotlight / photo / magazine) | 10 |
| `scroll-showcase` | 9 |
| `feature-scroll-story` / `-rev` | 8 |
| `feature-spotlight` *(current)* | 8 |
| **(no target — pinned scroll-track)** | **7** |
| `cards-icon-linked` | 6 |
| `cards-tombstones` | 5 |
| `cards-plain` / `cards-people` | 4 |
| `world-map` / `world-map-stats` *(current)* | 4 |
| `form-shell` *(current)* | 4 |
| `how-it-works-steps` *(JUDGE vs `cards-number`)* | 4 |
| bespoke navy band + `badge-solid` pills *(CUSTOM-KEEP)* | 4 |
| bespoke `section-head` + type atoms *(CUSTOM-KEEP)* | 4 |
| `filter-grid` (cards-kicker + `data-filter`) | 3 |
| `quote-band` *(current)* | 3 |
| `intro-side-by-side` *(current)* | 3 |
| `bento-expand` *(current)* | 3 |
| `scroll-story-video`, `cta-marquee`, `useful-links`, `cards-testimonials-carousel`, `history-timeline`, `tabs-vertical`/`-underline`, `cards-people-carousel`, `article`, `how-it-works-timeline`, `dl-row` bespoke | 2 each (20) |
| `hero-cinematic-pinned`, `stats-row`, `stats-quad`, `stats-hero-figure`, `statement-stats`, `proof-points`, `illustration-split`, `synced-slider`, `scroll-scenes`, `cards-steps`, `cards-number`, `fact-grid`, `logo-wall`, `link-directory`, `ecosystem-devices`, `devices-features`, `laptop-showcase`, `coverflow-carousel`, `features-autoprogress`, `solutions-awards`, `modal`, `pagination`, `data-filter` bespoke | 1 each (23) |

### 2.3 JUDGE totals

**83 JUDGE-flagged sections, deduplicating to 17 decision patterns** (§3). Two patterns
account for 63 of the 83 (heroes 49, accordion 2-col bodies 14) — answering just those two
unblocks **75%** of the JUDGE surface.

**8 ASSET sections** — 7 `feature-scroll-story` device-shot bakes (each 3–4 2× transparent
PNGs, MANDATORY per the glossary bake recipe) plus the one `laptop-showcase` CSS-device → PNG
(J17).

**11 CUSTOM-KEEP sections** — bespoke by intent, rendering on current atoms.

---

## 3 · THE JUDGE LIST — for one sitting, item by item

Ordered by blast radius. Each item: what is lost / undecided, and 2 candidate treatments.
Answer with the letter.

---

**J1 · HERO FAMILY — 49 sections on 48 of 51 pages.** ★ answer this first
`cmp-hero-video-left` ×42, `-image-left` ×4, `-fullbleed` ×1, `-video-center` ×1,
`cmp-editorial-story` ×1. All RETIRED (CSS deleted 2026-09-01) — **48 of 51 pages currently
render an unstyled hero**. MIGRATION §4.6 parks the hero family as *"Phase 2; recipes to
come"*, while §4 already gives a per-hero mechanical transform (`cmp-hero` + `media-cover` +
an `ov` stack, Place axes replacing page utilities, `hvl-btn-secondary`→`btn-outline-light`).
*What is undecided:* the exact overlay wash per hero type — §4 itself says "JUDGE the wash".
- **(a)** Apply the §4 provisional transform now, one wash recipe per hero type
  (video-left → `ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`;
  image-left → `is-bottom` + its existing `.ov` atoms; video-center → `is-center` +
  `ov ov-black ov-radial`; fullbleed → `is-bottom`, poster via `data-bg`), and lock those four
  as the recipe. Every page goes gate-clean on its hero in the same pass.
- **(b)** Hold all heroes for a Phase-2 hero pass and sweep bodies only. Cost: all 48 pages
  keep a hero WARN and an unstyled hero until Phase 2 lands, and every page is touched twice.

**J2 · ACCORDION 2-COLUMN BODY (`.acc-pad`) — 14 sections on 12 pages.**
The `cmp-accordion`→`cmp-acc` root/class renames are mechanical (§4), but `.acc-pad` is a
2-column body grid with no slot in `cmp-acc`; MIGRATION §4 marks the body layout JUDGE.
- **(a)** A plain utility grid inside `.ac-inner` (`grid md:grid-cols-2 gap-x-10 gap-y-3`) —
  keeps the two columns, adds no CSS.
- **(b)** Flatten to one column + `.measure` on the prose — simplest, but changes the look of
  every long FAQ body on 12 pages.

**J3 · PINNED SCROLL-TRACK — 7 sections on 7 pages** (`agency-v2`, `custody-v2`,
`institutional-trading`, `margin-trading`, `online-trading`, `securities-services`,
`smartscf-v2`). `cmp-feature-scroll-track` is RETIRED and MIGRATION §4.4 says the pinning
recipe is hard-bound to `.cst-outer/.cst-pin/.cst-trackwrap` and has **not** been generalized,
so there is no `cards-scroll` pinned pan to emit. 5–7 cards per instance.
- **(a)** Degrade to a plain `cards-boxed-carousel` / `cards-carousel`; the horizontal *pin*
  is lost, the content and the horizontal read survive. Documented, reversible.
- **(b)** Generalize the `.cst-*` recipe into a `cmp-cards` pinned mode **before** the sweep
  reaches these 7 pages (blocks shard 2, but loses nothing).

**J4 · `how-it-works-steps` — 4 sections on 4 pages** (`commodities`, `fx-hub`,
`margin-trading`, `payment-tracker`). MIGRATION §3 has an AUTO recipe routing it to
`cards-number`, but `blocks/how-it-works-steps.html` is alive **and** listed in the CATALOG
under "Process & Steps". Two docs disagree.
- **(a)** Keep `how-it-works-steps` as a live component; delete the §3 recipe. The vertical
  numbered rail is a distinct pattern from a card grid.
- **(b)** Sweep to `cards-number` and retire the block + its CATALOG entry (the §3 decision
  row that also retired `services-grid`).

**J5 · `cmp-tabs-pills-grid` → filter — 3 sections on 3 pages** (`payments-v2` ×25 pills,
`trade-supply-chain-finance-v2` ×14, `smarttrade-v2` ×12). RETIRED, and `.tpl-*` is
**undefined in ds.css — these sections render unstyled today**. Tiles are label-only
(+ a short desc on TSCF).
- **(a)** ONE `filter-grid` — `cmp cmp-cards cards-kicker is-cols-3` + `data-filter` chips,
  delete the duplicated per-tab panels (the glossary EMIT; matches "faceted directory").
- **(b)** `tabs-underline` v4 rail + real `tb-panel`s — keeps the "pick an audience, then
  read an intro" reading that the per-tab `.tpl-intro` copy implies.

**J6 · `gls-global` NAVY PILL BAND — 4 sections on 4 pages** (`securities-services`,
`online-trading`, `margin-trading`, `institutional-trading`). Currently a plain
`cmp surface-navy section-y` + `section-head is-split` + 6–8 `badge badge-solid` market
pills. Renders fine; the glossary calls it "the sanctioned interim… candidate to formalize".
- **(a)** CUSTOM-KEEP the interim as-is (my default in the tables).
- **(b)** Fold onto the existing `market-band` block (`cmp market-band surface-navy`) so the
  four pages share one named component.

**J7 · `intro-side-by-side` ATOM PAIR — 3 sections on 3 pages** (`debt-capital-markets-v2`,
`smartguarantees`, `sustainable-finance-v2`). The block stays; MIGRATION §3 leaves the exact
`.ip-t` / `.ip-d` type pair as an explicit TODO ("pick the exact pair on first hit").
- **(a)** `type-h6 on-surface` / `type-body-sm on-surface-mid` — matches the cards-icon slots.
- **(b)** `type-body on-surface font-semibold block` / `type-body-sm on-surface-mid` — the
  `isf` panel precedent (glossary), quieter titles.

**J8 · `ssv-*` / `cap-*` TYPE CLASSES — 2 sections on 2 pages** (`businessonline-x-v2`,
`digital-channels-v2`). `scroll-story-video` is a current block, but `ssv-op-h`/`ssv-op-sub`/
`ssv-op-hint`/`ssv-sub`/`cap-*` sizes are page-only; §3b says SWEEP-collapse onto `type-*`,
noting "no gallery block teaches them".
- **(a)** Collapse to `type-*` in markup now, in the same pass as the rest of both pages.
- **(b)** Leave them; treat as a component-level cleanup when the businessONLINE-X family is
  next touched (the glossary's own "block-consistent authored markup" exemption).

**J9 · VERTICAL TABS — 2 sections on 2 pages** (`industry-specific-finance-v2` §5,
`fx-hub` §6). `.tabs-vert` / `.tab-vert` are **undefined in ds.css** — the ISF sector explorer
(8 panels, 17 eyebrows, strengths + stats + advantage) renders as a single unstyled column.
- **(a)** Mechanical v4 rename (`tb-rail is-vertical` / `tb-tab` / `tb-panel`, strip runtime
  ARIA) + compose the rich panel from atoms per the glossary `isf` recipe.
- **(b)** Re-express as a `filter-grid` (one grid, sector chips) — fewer moving parts, loses
  the per-sector narrative panels.

**J10 · `is-full-desc` — 2 sections on 2 pages** (`structured-solutions` §9,
`swift-corporates` §4). A `cmp-cards-thumb-box` modifier with **one** declaration in ds.css;
it dies with that zone, and the cards compositions have no unclamp axis (the glossary states
"nothing clamps in the composition").
- **(a)** Drop the class — verify at 1280/768/375 that `cards-boxed` descriptions are already
  unclamped, then delete the declaration with the zone.
- **(b)** Mint an `is-full-desc` axis on `cmp-cards` if the composition does clamp.

**J11 · `cmp-key-transactions` TARGET — 1 section** (`smarttrade-v2` §9, 10 deal cells).
MIGRATION §3 routes it to `cards-tombstones`; MIGRATION §5 **and** the freshly-reconciled
glossary route it to `cmp-fact-grid` (capability rename). The docs contradict.
- **(a)** `fact-grid` — the glossary EMIT column is the current source of truth; it keeps the
  5-up typographic strip look.
- **(b)** `cards-tombstones` — "one tombstone family", per the §3 recipe.

**J12 · `cmp-story-cards` — 1 section** (`industry-specific-finance-v2` §4, 8 cards).
RETIRED; `.sc-*` is **undefined in ds.css** so the section renders unstyled. The 8 `<video>`
elements have **zero `<source>`** — poster-only, i.e. not real video (the `es-bgvid`
precedent). Four colour tints (`sc-tint-sky/sand/rose/indigo`) have no composition equivalent.
- **(a)** `cards` (Thumbnail) with the poster moved to `data-bg` on a `media-cover`, tag →
  `chip`, tints dropped. Text-over-media, closest to the original.
- **(b)** `cards-boxed`, same poster→`data-bg`, text in a white panel below. Safer legibility,
  further from the original.

**J13 · `cmp-process-cards` LOSSES — 1 section** (`global-loan-solutions-v2` §7).
The `cards-steps` emit is documented, but the scroll fan-in entry, the gradient hover, the
per-letter blur reveal and the `.p-title` word pill have no slot.
- **(a)** Accept the losses and record the decision (MIGRATION §3 already anticipates this).
- **(b)** Add the fan-in as a `data-behavior` option before sweeping this page.

**J14 · `cmp-carousel-center` — 1 section** (`smartscf-v2` §8, 5 slides).
MIGRATION §3 marks this the one JUDGE recipe "pending the center-peek option" — but
**`is-center-peek` now exists in ds.css (6 declarations) and ships on
`cards-testimonials-carousel`.** The recipe text is stale.
- **(a)** Emit `cards-carousel is-center-peek` and update MIGRATION §3 to drop the JUDGE.
- **(b)** Emit start-aligned and accept the layout change.
  *(Same question settles the `data-carousel-toggle` pause/play control, which §3 also leaves
  TODO: keep it styled as `btn btn-outline btn-icon btn-sm` + `.sr-only`, or drop autoplay.)*

**J15 · `quote-band is-portrait-bleed` — 1 section** (`our-people-v2` §5, CEO quote).
The variant was DELETED 2026-09-01; the gate WARNs and it already renders as the plain band.
- **(a)** Accept the plain band (zero work; it is what ships today).
- **(b)** Reinstate `is-portrait-bleed` as a `cmp-quote-band` axis.

**J16 · `cmp-app-cinema` INTERIOR — 1 section** (`businessonline-x-v2` §10).
The root rename to `cmp-scroll-scenes` is documented, but the `aci-*` interior (app-store
buttons, QR, sheened device card, 3 imgs + 1 video) has no composition.
- **(a)** Rebuild the interior from atoms inside `scroll-scenes` (`btn` pairs, `card-panel`,
  `media-cover`).
- **(b)** Keep the interior as an intentional page-level custom section (CUSTOM-KEEP) and
  only re-root.

**J17 · `laptop-showcase` CSS DEVICE — 1 section, ASSET** (`businessonline-x-v2` §8).
MIGRATION §5: the CSS laptop (`ls-lid`/`ls-screen`/`ls-base`) becomes an `.ls-device-img`
transparent PNG. The asset does not exist yet.
- **(a)** Bake the 2× transparent PNG now (blocks this page's sweep until it exists).
- **(b)** Keep the CSS kit for this page — ds.css already keeps it "for pre-sweep pages".

**Resolved while mapping — no decision needed, recorded so nobody re-opens them:**
`emirates-nbd-pay-v2`'s `mt2-num` slots hold `All` / `PCI-DSS` — short compact labels, which
is exactly the glossary's sanctioned fix for the numbers-only rule; the earlier defect is
already repaired on the 08-25 version. And **`hvl-quick` appears on zero of the 51 canonical
pages** (only on `insights-research-2026-07-20`, a section landing page) — so the retired
hero-wayfinding slot does not gate J1.

---

## 4 · Proposed shard plan

Eight shards, grouped by dominant source pattern so one recipe is exercised repeatedly inside
a shard. **J1 (heroes) must be answered before any shard starts** — 48 of 51 pages contain one.

| # | shard | pages | dominant patterns |
|---|---|---|---|
| **1** | **PILOT — Payments product pages** | 7 — `commodities`, `smart-cdm`, `virtual-accounts`, `swift-corporates`, `smartguarantees`, `instant-banking-services`, `payment-tracker` | hero · big-statement · highlights-tiles→cards-icon · kicker-cards→cards-kicker · services-grid→cards-number · bento-photo · accordion→acc · how-it-works-timeline · cards-thumb→cards |
| **2** | Trading & IB service pages | 8 — `securities-services`, `online-trading`, `margin-trading`, `institutional-trading`, `gcc-market-access`, `execution-capabilities`, `custody-v2`, `agency-v2` | hero · content-block-sidebyside (verbatim) · **scroll-track (J3)** · scroll-tab→scroll-showcase · navy pill band (J6) · world-map · cards-thumb |
| **3** | Tombstone quintet | 5 — `debt-capital-markets-`, `loan-syndications-`, `equity-capital-markets-`, `agency-division-`, `corporate-finance-tombstones` | hero · tombstone-grid→cards-tombstones. Five near-identical 5-section pages — one recipe, five applications; ideal batch after the pilot |
| **4** | Flagship platform pages | 8 — `payments-v2`, `trade-supply-chain-finance-v2`, `digital-channels-v2`, `businessonline-x-v2`, `emirates-nbd-pay-v2`, `smarttrade-v2`, `smartscf-v2`, `api-banking-v2` | the three L pages live here · scroll-story-video (J8) · bento-spotlight · **tabs-pills-grid (J5)** · testimonials → cards-testimonials · app-cinema (J16) · laptop-showcase (J17) · useful-links rebuild · eco-fb |
| **5** | Deal & people pages | 5 — `global-loan-solutions-v2`, `equity-capital-markets-v2`, `debt-capital-markets-v2`, `our-people-v2`, `case-study-library-v2` | hero · big-statement + `rank-strip` · people-carousel→cards-people-carousel · bento-spotlight · world-map · cards-thumb-box→cards-boxed · **process-cards (J13)**, **portrait-bleed (J15)** |
| **6** | Library / filter pages | 6 — `article-library`, `article-example`, `media-library`, `events-library`, `tutorials-platform-demos`, `initiatives-and-partners-v2` | hero · cards-thumb-box→cards-boxed grids · feature-spotlight · `data-filter` bands · pagination · `dl-row` · article |
| **7** | Support, FAQ & forms | 8 — `faqs`, `contact-us`, `fraud-awareness-hub`, `form-centre`, `start-application` ×2, `support-form` ×2 | hero-image-left · form-shell (verbatim) · **accordion 2-col (J2)** · kicker-cards · pillar-grid→cards-icon-linked · quote-band |
| **8** | Sector & markets pages | 4 — `industry-specific-finance-v2`, `sustainable-finance-v2`, `fx-hub`, `structured-solutions` | **story-cards (J12)** · **vertical tabs (J9)** · editorial-story→hero-editorial · intro-side-by-side (J7) · bento-magazine · **`is-full-desc` (J10)** · cards-thumb-nobox→cards-plain |

**Pilot recommendation: `commodities-2026-08-04.html`.**
68 kb, 10 sections, 6 re-composes — and those 6 exercise **six distinct recipes**, four of
which are the highest-frequency in the estate (hero 49×, cards-thumb 30×, cards-kicker 11×,
cards-icon 10×) plus one `cmp-bento` composition and one JUDGE (`how-it-works-steps`, J4).
It also proves the three verbatim paths (header, footer, CTA band) end-to-end. Smallest page
that touches this many defect types.

**Immediate second: `smart-cdm-2026-08-05.html`** (68 kb, 10 sections, 6 re-composes) — adds
`accordion`→`acc` (14 sections estate-wide) and `services-grid`→`cards-number`. Together the
two pilots cover 10 distinct recipes and every top-frequency pattern except `cards-boxed`,
`scroll-showcase` and the verbatim `content-block-sidebyside`.

---

## 5 · Mechanical notes for the sweep recipe

**5.1 Asset paths — pages move to `/pages/`, so go absolute.**
Every asset reference on all 51 pages is **relative** today: `data-bg="assets/images/…"`,
`src="assets/js/ds.js?v=…"`, `href="assets/css/ds.css?v=…"`, `poster="assets/images/…"`,
and `<video><source src="assets/videos/…">`. Moving a page one directory down silently
breaks every one of them — and `data-bg` failures are invisible (a blank panel, no console
error). **Recommendation: rewrite to absolute `/assets/…` as the first mechanical step of
each page's sweep**, before any section work, and verify with a single grep per page:
`grep -o '="assets/' <page>.html` must return nothing. This is `server.js`-safe (it serves
the repo root) and makes the page location-independent, so `/pages/` moves become free.
Same rule for cross-page links (`href="custody-v2-….html"` → `/pages/custody-v2-….html`),
which are equally relative today and equally silent when they break.

**5.2 Header / footer swap — nothing to do.**
Verified against the block files: `blocks/site-header-v4.html` root is
`cmp cmp-site-header ish-v4`, `blocks/footer-option1.html` root is
`cmp cmp-footer-option1 surface-grey`, and **all 51 pages already carry those exact roots and
the same interiors** (14 `ish-col`, 12 `ish-site`, 21 `fo1-link` on every page). The sweep
should still **re-paste both blocks verbatim** rather than leave them, so that a future
header/footer change propagates from one source — but expect a zero-to-tiny diff, and treat
any non-trivial diff on a page as a signal that the page drifted, not that the block did.
Same applies to `blocks/cta-band.html` (49 sections, root `cmp ptf-ctaband surface-navy
section-y`) — the "anonymous root" there is the block's own design, not page drift; do not
"fix" it into a `cmp-*` class without a library-level decision.

**5.3 AR preview implications.**
- Blocks never carry RTL classes; logical properties + the `[dir="rtl"]` zone do the work
  (MIGRATION §1). Every re-composed section inherits correct RTL **for free** — but only for
  atoms that exist. Sections that stay CUSTOM-KEEP (the navy pill bands, the `dl-row` bands,
  the four `section-head` prose bands) must be spot-checked at `?dir=rtl`: they use
  `start-*`/`end-*` and `meta-dot`'s `margin-inline-end`, so they should be clean, but they
  are the only markup the sweep is not re-deriving from a block.
- Each RETIRED zone deleted from ds.css takes its `[dir="rtl"]` re-statements with it
  (MIGRATION §6 names `kt-link`, `pl-link`, `pg-go`, `dts-link`, the `pc-*` family). A page is
  only "swept" when its zone's RTL block can go too — so record the zone, not just the page.
- The AR preview renders the *page*, so a page swept section-by-section will show a mixed
  LTR/RTL state mid-sweep. **Sweep a page to completion before the RTL pass**, then check
  arrows, floats and padding at 1280 / 768 / 375 per MIGRATION §2.7.
- Hero Place axes (`is-bottom` / `is-center`) are logical, but the page-authored utilities
  they replace (`items-end`, `pt-28`, `pb-24`) are not the RTL risk — the wash direction is:
  `ov-gradient-l` is a **physical** left gradient. Confirm on the first RTL hero whether the
  hero wash should flip with direction; if it should, that is a J1 sub-decision.

**5.4 Order-of-operations inside one page** (proposed `/page-fix` loop, refining MIGRATION §2)
1. `<style>` grep — **all 51 canonical pages are clean**; no page is a whole-page JUDGE.
2. Absolute-path rewrite (5.1) + `?v=` cache-bust check.
3. Re-paste header, footer, CTA bands verbatim (5.2).
4. Section-by-section emit, top to bottom, per this map's table for that page.
5. `node scripts/verify.mjs` — zero NEW failures; the page's WARN lines should go to zero.
6. Screenshots at 1280 / 768 / 375 vs the pre-sweep page; then the RTL pass (5.3).
7. Record the byte delta and the ds.css zones the page stopped referencing (MIGRATION §6).

---

## DECISIONS (Hakan, 2026-09-02)

> Recorded from the JUDGE BOARD (`docs/audits/judge-board/index.html`, **Copy decisions**),
> pasted back **VERBATIM and untouched** — his words are the spec. Group keys are the board's
> (`<source root> → <target>`) and match §1 of this map. One box per group (73) plus the
> `is-full-desc` sub-question inside the cards-boxed group = 74 lines.
>
> **Nothing in this block may be paraphrased, reordered, corrected or "cleaned up".** Every
> interpretation the sweep needs lives in **SWEEP RECIPES** below, which quotes it and states
> the normalization separately. If a recipe and this block ever disagree, this block wins.

```text
cmp-site-header → site-header-v4: Do not touch this at all
cmp-footer-option1 → footer-option1: Do not touch this at all
(anonymous root) → cta-band: use our cta-band from library, but ensure we keep the content from the existing page
cmp-hero-video-left → hero: Use cmp cmp-hero surface-navy but ensure we keep the content from the existing page
cmp-hero-image-left → hero-image: ok with proposed but ensure we keep the content from the existing page
cmp-article → article: ok with proposed but ensure we keep the content from the existing page
cmp-hero-cinematic-pinned → hero-cinematic-pinned: ok with proposed, hero-cinematic-pinned but ensure we keep the content from the existing page
cmp-hero-fullbleed → hero: Use cmp cmp-hero surface-navy but ensure we keep the content from the existing page
cmp-editorial-story → hero-editorial: ok with proposal but ensure we keep the content and video from the existing page
cmp-hero-video-center → hero: Use cmp cmp-hero surface-navy but ensure we keep the content from the existing page
cmp-cards-thumb → cards: ok with proposal but ensure we keep the content and images from the existing page
cmp-cards-thumb-box → cards-boxed: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
is-full-desc modifier: ok with mock-j10.html
cmp-kicker-cards → cards-kicker: use Cards — Icon Linked
cmp-highlights-tiles → cards-icon: Cards — Icon Linked
cmp-tombstone-grid → cards-tombstones: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-pillar-grid → cards-icon-linked: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-cards-thumb-nobox → cards-people: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-testimonials → cards-testimonials-carousel: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-people-carousel → cards-people-carousel: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-story-cards → cmp-story-cards: use cards with media, ALT A keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-cards-thumb-nobox → cards-plain: ok with proposal, keep grey but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-digital-tools-showcase → cards-carousel: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-services-grid → cards-number: ok with proposal, but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-scroll-tab → scroll-showcase: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-feature-scroll-story → feature-scroll-story: ok with proposal, keep four columns but ensure we keep the content and video from the existing page. Add the CTAs if needed as per original.
cmp-feature-scroll-track → cards-carousel: cmp cmp-cards is-hover-zoom cards-plain surface-grey with scroll pin, keep the same content as per original
cmp-scroll-story-video → scroll-story-video: keep the original. This is beyond components.
cmp-app-cinema → scroll-scenes: change to scroll-scenes, port content
cmp-coverflow-carousel → coverflow-carousel: ok with proposal but keep the existing content
cmp-carousel-center → cards-carousel: ok with proposal but keep the existing content
cmp-features-autoprogress → features-autoprogress: ok with proposal but keep the existing content
cmp-process-cards → cards-steps: ok with proposal but keep the existing content
cmp-video-content → synced-slider: ok with proposal but keep the existing content
cmp-accordion → acc: ok with proposal but keep the existing content and the laoyut of inner content on each accordeon. What I mean is, if it is simple text, use simple text. Don't overcomplicate.
cmp-tabs-pills-grid → filter-grid: use tabs-directory
cmp-tabs → tabs-*: use tabs-vertical
(anonymous root) → data-filter: we need to build this
cmp-bento-spotlight → bento-spotlight: ok with proposal, but keep the existing content
cmp-bento-photo → bento-photo: ok with proposal, but keep the existing content and surface color, navy
cmp-bento-expand → bento-expand: ok with proposal, but keep the existing content and surface color, navy
cmp-bento-magazine → bento-magazine: ok with proposal, but keep the existing content and surface color, navy
cmp-impact-stats → stats-row: ok with proposal, but keep the existing content and surface color, navy
cmp-metrics-type2 → stats-hero-figure: ok with proposal, but keep the existing content and surface color, navy
cmp-metrics-type1 → stats-quad: ok with proposal, but keep the existing content and surface color, navy
cmp-key-transactions → fact-grid: ok with proposal, but keep the existing content and surface color, navy
cmp-content-block-numbers → proof-points: ok with proposal, but keep the existing content and surface color, navy
cmp-about-stats → statement-stats: ok with proposal, but left side should be built as a mockup as per original. We can make it an image render as well.
(anonymous root) → gls-global: ok with the proposal
(anonymous root) → section-head is-split: use our generic content component but build with atoms properly
(anonymous root) → dl-row: use our generic content component but build with atoms properly
cmp-content-block-sidebyside → content-block-sidebyside: use our generic content component but build with atoms properly
cmp-big-statement → big-statement: ok with proposal
cmp-feature-spotlight → feature-spotlight: ok with proposal
cmp-world-map → world-map: ok with proposal
cmp-how-it-works-steps → how-it-works-steps: ok with proposal how it works
cmp-form-shell → form-shell: recreate using atoms as per original
cmp-quote-band → quote-band: ok for proposal
cmp-intro-side-by-side → intro-side-by-side: ok for proposal a
cmp-cta-marquee → cta-marquee: ok for proposal
(anonymous root) → cards-icon-linked: ok for proposal
cmp-useful-links → useful-links: ok for proposal
cmp-history-timeline → history-timeline: ok for proposal
cmp-how-it-works-timeline → how-it-works-timeline: ok for proposal
(anonymous root) → feature-scroll-story: ok for proposal but keep the existing content
cmp-devices-features → devices-features: cards-icon-linked but with no background, and in 4 columns, no carousel
cmp-laptop-showcase → laptop-showcase: ok for proposal but keep the existing content and use the PNG from the original
cmp-insight-split → illustration-split: use insight split
cmp-trusted-partners-grid → logo-wall: ok for proposal but keep the original content
cmp-link-directory → link-directory: ok for proposal but keep the original content
(anonymous root) → ecosystem-devices: ok for proposal but keep the original content and for the image keep the one from suggestions
cmp-solutions-awards → solutions-awards: ok for proposal but keep the original content
cmp-modal → modal: ok for proposal but keep the original content
cmp-pagination → pagination: ok for proposal but keep the original content
```

### What these rulings close in §3 (THE JUDGE LIST)

All 17 JUDGE items are answered. Recorded so nobody re-opens them:

| item | answer | reading |
|---|---|---|
| **J1** heroes (49) | **root fixed:** `cmp cmp-hero surface-navy`, content preserved | not "(a) or (b)" — he named the root. The per-type *wash* is settled by rule (i): keep the section's OWN `.ov` atoms; only a hero with none gets the §3 J1(a) default. |
| **J2** accordion 2-col body (14) | **(b)-with-fidelity** | "if it is simple text, use simple text. Don't overcomplicate" — the body keeps the *original's* inner layout; a 2-col `.acc-pad` stays 2-col, prose stays prose. |
| **J3** pinned scroll-track (7) | **(b), already available** | he named `cmp cmp-cards is-hover-zoom cards-plain surface-grey with scroll pin` — that is `blocks/cards-plain-scroll.html` verbatim. The pin **is** generalized (`DS.recipe('scroll-track')` in ds.js, `.cd-scroll-outer/-pin/-wrap` in ds.css, 18 `*-scroll` blocks). §3 J3 and the glossary row saying "not generalized" are **STALE**. |
| **J4** how-it-works-steps (4) | **(a)** keep the block | "ok with proposal how it works" — MIGRATION §3's route to `cards-number` is dropped for this pattern. |
| **J5** tabs-pills-grid (3) | **neither — `tabs-directory`** | override, see (v). |
| **J6** gls-global navy band (4) | **(a)** CUSTOM-KEEP as-is | "ok with the proposal". |
| **J7** intro-side-by-side pair (3) | **(a)** `type-h6 on-surface` / `type-body-sm on-surface-mid` | "ok for proposal a" — literal. |
| **J8** ssv/cap type classes (2) | **(b)** leave | "keep the original. This is beyond components." → DO-NOT-TOUCH, see (vi). |
| **J9** vertical tabs (2) | **(a)** `tabs-vertical` | override of the "rename in place" wording, see (v). |
| **J10** `is-full-desc` (2) | **(a)** drop the class | "ok with mock-j10.html" = `docs/audits/judge-board/mock-j10.html`, titled *"J10 mock — is-full-desc dropped"*. |
| **J11** key-transactions (1) | **(a)** `fact-grid` | glossary EMIT wins; MIGRATION §3's `cards-tombstones` route for `cmp-key-transactions` is dead. |
| **J12** story-cards (1) | **(a) ALT A** — `cards` with media | "use cards with media, ALT A". |
| **J13** process-cards losses (1) | **(a)** accept the losses | "ok with proposal but keep the existing content". |
| **J14** carousel-center (1) | **(a)** `is-center-peek` | the mode exists (6 declarations in ds.css); §3's JUDGE text is stale. |
| **J15** quote-band portrait-bleed (1) | **(a)** plain band | "ok for proposal". |
| **J16** app-cinema interior (1) | **(a)** rebuild from atoms | "change to scroll-scenes, port content". |
| **J17** laptop-showcase asset (1) | **use the existing PNG** | `assets/images/device/laptop-showcase.png` **exists** (309 kb, the block's own `.ls-device-img`). §3 J17's "the asset does not exist yet" is stale. |

---


### Addendum (Hakan, 2026-09-02, post-shard-3)
- "I am ok as per the library for dont touch" — do-not-touch means AS PER THE
  LIBRARY: the canonical header/footer BLOCKS are untouchable; drifted page
  copies are REPLACED with the block markup verbatim (no content porting —
  global chrome). Byte-identical copies stay. Recipes g01/g02 updated.
- insight-split successor confirmed = illustration-split (the g51 reading).


### Addendum 2 (Hakan, 2026-09-02, post-pilot)
- HEADER: "we need the CORPORATE mega menu" — the corporate mega-menu IS the
  canon for this estate. blocks/site-header-v4.html updated to the estate's
  byte-identical corporate header (pages already carry it → zero page work);
  the retail lineup is gone from the block. This supersedes the frozen-block
  reading for this one correction.
- FOOTER 21-vs-19 fo1-link delta: verified content-neutral (zero hrefs/text
  lost — duplicates in the drifted strip). Block stays canon.
- COLUMNS: "as per the page's existing content column number" — the section's
  own card count sets is-cols-N (4 cards = is-cols-4), overriding both old
  CSS defaults and block demos. Applied to smart-cdm §4 + smartguarantees §5.
- Landing P-A/P-B/P-C/P-D: approved as proposed ("Others i am ok").

### Addendum 3 (Hakan, 2026-09-03, estate review) — BINDING for all future imports/fixes
Rulings from Hakan's page-by-page review. Each is a standing rule; the
importer, the sweep recipes and the judge board all inherit them.

> **SURFACE RENAME (2026-09-03).** Surfaces are ROLE-named, never colour-named:
> `surface-navy` → **`surface-primary`**, `surface-blue` → **`surface-accent`**
> (`surface-accent2` reserved; white/grey/grey-2/dark/image/clear/glass
> unchanged; TOKENS such as `--navy` and `.type-navy` unchanged). Every recipe
> written above this line predates the rename — **read `surface-navy` as
> `surface-primary` and `surface-blue` as `surface-accent`** throughout this
> document. The old spellings still paint (deprecated aliases in ds.css) but get
> none of the flip/island rules, and the verify gate warns on them, so emit the
> role names. See CONVENTIONS.md and docs/MIGRATION.md §5.

> **THE COLOUR LAW (2026-09-03, the same review — SUPERSEDES the surface
> rename note above and every colour instruction earlier in this document).**
>
> > Surfaces, inks and overlays are declared in MARKUP.
> > CSS never adapts content by context.
> > A different look on a different ground is a DIFFERENT MARKUP COMPOSITION.
>
> **Responsibility for layout, surface and colour choices belongs to the
> AUTHOR.** The library's job is that every vocabulary word renders exactly as
> declared. "The library is preselected compositions/markups to guide the
> author." So a section that should look different on navy than on white is a
> second composition — never a CSS rule that reaches down from the ground.
>
> **THE PALETTE — one palette, three prefixes; the same word as a ground, an
> ink and an overlay:** `white · soft · mute · primary · primary-soft ·
> accent · accent-soft · dark`, plus `ink-faint` (ornaments only) and the
> surface-only modes `image · clear · glass(-25/-50/-75)`. `ov-X` always
> carries the GROUND colour of X. Every ink resolves through exactly one BRAND
> token — one level of indirection, no second token layer.
>
> **THE PAIRING RULEBOOK — CATEGORICAL. STRENGTH NEVER MATTERS.**
> - LIGHT grounds (white/soft/mute/primary-soft/accent-soft): headlines+body
>   `ink-primary` · secondary `ink-mute` · accent moments `ink-accent` ·
>   ornaments `ink-soft`.
> - DARK grounds (primary/dark/the glass ladder): headlines+body `ink-white` ·
>   secondary `ink-soft` · accent moments `ink-accent-soft` · ornaments
>   `ink-mute`.
> - `surface-accent`: the dark rules, EXCEPT accent-role elements → `ink-white`.
> - `surface-image`: **the ink follows the OVERLAY'S COLOUR** (declared
>   intent) — `ov-dark`/`ov-primary` under the text ⇒ light ink family;
>   `ov-white` ⇒ dark ink family. Categorical, whatever the strength.
>   `ds-num-unit` over media goes `ink-white`, same as its number.
> - `surface-clear`: resolve through to the nearest real ground.
>
> **WHAT DIED:** all 190 surface-ancestor→descendant colour rules, the LIGHT
> ISLANDS group and its ~11 duplicated token-flips, and the entire
> relative-ink layer (`--on-surface*`, the `--ink-wNN` ramp, `--ink-media*` —
> 126 definitions). `type-*` lost its colour duty and is now scale, weight and
> spacing only. The deprecated spellings survive as inert aliases pinned to
> their old LIGHT-ground value, so a page still carrying one looks identical
> until this audit rewrites it — what they no longer do is FLIP.
>
> **A SELF-PAINTING PANEL DECLARES ITS GROUND.** The island rule is gone; a
> card, table wrapper, modal panel or dropdown that paints itself an opaque
> light box writes `surface-white`. Same for a container with a media child
> and an `.ov` wash: it IS a ground, so it writes `surface-image`.
>
> **ENFORCEMENT:** `verify.mjs` flow 8 — anti-context lint, no-new-indirection,
> closed vocabulary, and a per-block pairing check that resolves every text
> element's ground from the markup alone. A context rule is a GATE FAILURE,
> not a technique. Vocabulary + rulebook live in ONE file,
> `assets/js/ds-palette.js`, read by the gate AND by the gallery's Surface
> control, which now RECOMPOSES the demo markup instead of asking CSS to
> adapt. Every earlier instruction in this document that says "the flips
> handle it", "it is a light island" or "surface-adaptive" is VOID — declare it.
>
> **PAGE MIGRATION TABLE:** docs/MIGRATION.md §3b, first block of rows.

**Alignment & composition**
- BIG-STATEMENTS ARE ALWAYS CENTERED — `section-head is-center`, never the
  `text-center` utility, never left. If an authored line wraps, first drop
  type one step (display-xxl → display-xl), widening container-narrow →
  container-ds is allowed (DCM + agency precedent).
- tabs-directory section heads are `is-split` (block + every instance).
- A card grid whose count leaves a ragged remainder (5-in-3, 7-in-4) becomes
  a CAROUSEL (cd-carousel at SECTION level — outside container-ds; track
  aligns via --cd-edge) or the row is FILLED (bento tiles widened, e.g.
  is-w4×2 → is-w6×2 to complete 12). Never ship a dangling row.
- A row of N stat stacks is `grid grid-cols-2 md:grid-cols-N`, never a
  wrapping flex row (caption width must not push a stat to a second line).
- Fine print / captions under a CTA row get real air (mt-10, not mt-6).
- "Mobile-only" fallback blocks must actually be gated (`md:hidden`) — an
  ungated fallback rendering on desktop is a defect.

**Numbers (ds-num discipline)**
- Stat figures ride the `ds-num` atom — NEVER raw `type-display-*`.
- A number must fit its box on ONE line. Clipping or wrapping ⇒ size down
  (`is-sm`), don't grow the box. Quiet bands read `is-light` (hero-band
  stats: `is-sm is-light`, 32px/400 — sustainable-finance precedent).
- Text in a number slot ("High availability", "Bank-grade") = `is-sm`.

**Accordions**
- Bodies carry NO `measure` — full-row answers. Removed as MARKUP
  everywhere incl. blocks/acc*.html; never reintroduce via block paste.

**Buttons & controls**
- Icon-only buttons are ALWAYS circles: `.btn.btn-icon` rounds itself in
  ds.css. Never a square close/pause; `btn-pill` on icon buttons is
  redundant. Carousel play/pause = `.crl-toggle` (circle), never raw
  utility stacks.
- BUTTON ICONS ARE CLASSES, NOT MARKUP (Hakan, 2026-09-03). Button and
  control icons stop being inline `<svg>` blobs. The glyph lives ONCE in
  ds.css as a data-URI mask painted with `currentColor`; markup only names
  it with a modifier — `is-arrow`, `is-arrow-back`, `is-next`, `is-back`,
  `is-up`, `is-down`, `is-up-right`, `is-close`, `is-plus`, `is-minus`,
  `is-download`, `is-search`, `is-play`, `is-pause` — trailing by default,
  `is-ic-start` for a leading glyph. Scope: ALL buttons + ALL carousel /
  modal / drawer / menu navs (content icons — `icon-tile` and friends —
  are OUT, pending a separate ruling). RTL mirroring and forced-colors are
  solved once at the engine, so never add a per-component icon rule for
  either. Adding a glyph is a ds.css edit on a deliberate cadence, not a
  page-level choice. Brand marks (LinkedIn, store badges) are not glyphs
  and stay inline. Vocabulary table: CONVENTIONS.md § the glyph axis.
  Landed 2026-09-03: 1399 inline svgs swept across 72 pages + 72 blocks.

**Engines (behavior contracts, fixed 2026-09-03 — regressions are bugs)**
- Autoplay carousels LOOP: wrap is geometric (track at end of range), not
  index-based. Testimonials/coverflow wrap modulo.
- scroll-track scrubs 1:1 (--st-len = 100vh + overflow, measured from the
  LAST CARD's rect + the track's end padding) and ENDS with the last card
  at the container inset (padding-inline-end: --cd-edge on the track).
- Modals lock the page: data-lenis-prevent + lenis.stop() on open,
  restored on last close. Long content = modal-content-plain shape.
- history-timeline: pages carry the block's type atoms (type-h4/h6/
  body-sm) + btn-accent btn-icon btn-pill nav; the rail viewport bleeds
  to the screen edge (margin-inline-end: calc(50% - 50vw), logical).

**Contracts**
- Maps are v2 ONLY: data-points/data-routes with gazetteer ids (real
  lat/lng escape), engine-built mask-recolored artwork. Never a raw <img>
  of the map svg (invisible on navy — the ink can't recolor an image),
  never legacy data-dots payloads with pre-projected coords, never
  data-line-color literals.
- Device/app mocks: the baked PNG/poster/video IS the UI. No DOM-built app
  chrome layered on top (islands, headers, rings, rows — delete). Floating
  label badges OUTSIDE the device are fine.
- filter bands: the count line is `.filter-count` (block class, has its
  20px top margin), never re-rolled utilities.
- Directory patterns that jump to a tabs section can be ruled into MODALS
  (industry-specific-finance precedent) — per-page ruling, not automatic.

**Process**
- These review findings were: (a) agent infidelity to existing canon, or
  (b) latent library bugs surfacing under real content — NOT new judgment.
  Check pages against canon mechanically (dead-class lint: any page class
  with zero ds.css declarations is drift; block-copy diff; atoms-presence
  from ds.css "atoms pass" comments) before asking Hakan to look.
- OPEN (awaiting Hakan): events-library hero is is-center by faithful port
  of the original cmp-hero-video-center — normalize-vs-preserve for
  center-variant heroes not yet ruled.
- ILLUSTRATION DOCTRINE (Hakan, 2026-09-03 — final: "I say we do both"):
  TWO capabilities, chosen per use-case and timeline at authoring time:
  (1) LOTTIE with JSON files — a DS capability (vendored player,
  lazy-loaded recipe, JSON as an asset upload);
  (2) REGULAR MP4 played without controls — background baked in ("Mode 2";
  "People can bake the frame into the video if they need to").
  Rationale: on the CMS, code ships ~monthly while pages ship ~10×/day —
  illustrations are CONTENT (media uploads / assets), never per-piece
  code. Generalizes the device-mock PNG doctrine. Seamless video bakes
  demand color-managed encodes (BT.709 tags; a hair off shows a ghost
  rectangle) + the target surface in the DAM filename; no gradient/image
  surfaces. Lottie export rules: brand palette in-source, no baked text,
  mirrored export when directional, poster for reduced-motion. DOM-built
  mock UIs on pages remain banned.
  Restore the lost swift-corporates SCORE diagram via one of these
  (see BACKLOG).
- INK DOCTRINE (Hakan, 2026-09-03, verbatim): **"NO TEXT should have ALPHA
  as option. Let them be colors."** Every text ink in the DS is an OPAQUE
  colour — `color`, `-webkit-text-fill-color`, and the ink tokens each surface
  flips (`--on-surface*`, `--ink-*`). Hierarchy comes from the colour ramp,
  weight and size, never from alpha. Alpha stays legal for NON-TEXT paint:
  scrims/`ov`, glass surfaces, borders, shadows, backgrounds.
  CARVE-OUT, same day (Hakan, on reading the plan): element **`opacity:` is
  out of scope** — state dimming and structural animation on text-bearing
  elements may stay alpha: *"These can be alphas. It actually makes sense."*
  So inactive timeline steps, dimmed carousel slides, reveals and cross-fades
  are untouched. The ruling binds ink DEFINITIONS only.
  **This SUPERSEDES the proposed over-media ink rule.** Over-media ink is now
  CHOSEN, not composited: `--ink-media` #fff, `--ink-media-mid` #D7DEE6 (AA
  4.58:1), `--ink-media-cool` #D3DFF2 (AA 4.64:1), `--ink-media-faint`
  #9FA9B4 (DECORATIVE marks only, never body or label text). The AA reference
  ground is the DEFAULT `.ov` scrim — `rgba(var(--navy-rgb), .6)` over a light
  image region (#C0C0C0) = #516277 — where the old white-at-60% measured
  3.40:1, a fail. Secondary ink over media is deliberately brighter now.
  On SOLID surfaces the conversion is pixel-identical: `--ink-w30…--ink-w85`
  are `color-mix(in srgb, #ffffff NN%, <that surface's ground>)`, which IS
  alpha compositing — and unlike a frozen hex it still retints per brand.
  Enforced by `scripts/verify.mjs` flow 5 ("text ink with alpha").
- HERO EYEBROWS ARE WHITE (Hakan, 2026-09-03, post-sweep): on ALL heroes,
  on all pages, the eyebrow ink is ink-white (115 instances estate-wide +
  hero blocks; light-ground media-less heroes exempt by construction —
  none existed at ruling time).
  **SUPERSEDED IN SCOPE 2026-09-04 by the media-role ruling below** — which
  WIDENS it (every media ground, not only heroes) and does not contradict it.
  The hero half of this bullet still stands on its own for SOLID dark hero
  grounds, which the new ruling explicitly leaves unchanged.
- **ANY EYEBROW ON MEDIA, ANY TEXT-ONLY LINK ON MEDIA IS WHITE**
  (Hakan, 2026-09-04, verbatim):

  > any eyebrow on media, any text-only link on media is white.

  **SUPERSESSION.** This replaces the narrower hero/opener phrasing that had
  already been applied. It is a widening, not a reversal: everything the
  hero pass made white stays white. What changes is that the trigger is the
  GROUND'S PAINT, not the component's name — a photo under an eyebrow makes
  it white whether that eyebrow sits in a hero, a card, a bento tile or a
  band nobody has built yet.

  **SCOPE — precisely.**
  - MEDIA GROUNDS ONLY: `surface-image`, which is what `card-media` and every
    other photo/video ground already declares (the A7 sweep of 2026-09-03 put
    `surface-image` on all 291 `card-media` instances, so grounds are honest
    and no per-component special case is needed). Resolved exactly the way
    `ds-palette` resolves it, ov-direction included.
  - THE TWO ROLES: the EYEBROW (`ds-eyebrow`) and the TEXT-ONLY LINK
    (`btn-text` — CONVENTIONS' named quiet text-link atom — plus `be-link`,
    the one hand-rolled survivor that is genuinely a text-only link and
    genuinely sits on media). DELIBERATELY EXCLUDED: `art-c-link`, which is
    the whole clickable CARD, not a link atom (ds.css:4857 paints it
    background/border/radius/shadow); and `bc-link` / `sn-link` / `fo1-link` /
    `ds-skip-link`, which are navigation chrome and never occur on media.
  - SOLID DARK GROUNDS ARE UNCHANGED. `ink-accent-soft` stays legal there.
    The standing hero-eyebrow-white ruling also stays legal there. Both are
    admitted by `ALLOWED_INKS.dark`, and the sweep NEVER overwrites an ink an
    author already declared off media — it only declares a missing one.

  **ENCODING** (`assets/js/ds-palette.js` § 4b). A role-override map over the
  one pairing table, reached through the single function `inkForAtom()`, which
  the gate and the gallery both call. NOT a fourth PAIRING row: `media` is a
  kind that RESOLVES through the overlay's colour, so the four generic roles
  need no media row, and duplicating one would have thrown that resolution
  away. Off media both atoms read `PAIRING[kind].accent`, which is what they
  always were (313 `ink-accent` on light, 110 `ink-accent-soft` on dark).

  **ENFORCEMENT.** `verify.mjs` §8d (blocks) and §8f (pages, new) both call
  `mediaRoleCheck`. It FAILS the accent family on media rather than merely
  permitting white — white was already legal, so acceptance needed nothing;
  what was missing was the failure on the ink an author reaches for out of
  habit because it is correct on every other ground. An UN-INKED eyebrow or
  text-link on media fails the same way: `.ds-eyebrow` and `.btn-text` both
  default to `var(--blue)` and would paint accent by omission.

  **APPLIED.** 127 inks across 116 blocks (123 light-ground eyebrows →
  `ink-accent`, 4 `be-link` → `ink-white`); 20 across 7 pages, all on
  `surface-image` (18 `be-link` declared, 2 eyebrows `ink-accent-soft` →
  `ink-white`, on islamic-finance and insights-research). The other 65 pages
  were already compliant from the hero/opener pass. Sweep:
  `scripts/audit/ink-atoms.mjs`.

  **DOCUMENTED EDGE, not invented.** A LIGHT-family wash over media
  (`ov-white`/`ov-soft`/`ov-mute`) would put white on white. The estate has
  ZERO — all 389 media grounds carry `ov-primary`, `ov-dark` or a bare `.ov` —
  so the ruling is applied as written. If a light wash over media is ever
  authored, that is the moment to take the case back to Hakan.
- LIBRARY BUG found via this ruling (fixed 2026-09-03): container-narrow's
  880px cap was border-box, so at desktop --page-x (120px) the content
  measure collapsed to 640px — the real reason big-statements wrapped.
  Now `max-width: calc(880px + 2*var(--page-x))` (880px of CONTENT).
  Payment-tracker keeps display-xxl; size-down stays the remedy only when
  a line genuinely exceeds 880 content (agency, DCM).

## SWEEP RECIPES

One executable recipe per board group (**73 groups + the `is-full-desc` sub-item**), in map/board
order `g01…g73`. Each recipe is: **Emit** (the exact root class string + the block FILE to paste
verbatim) · **Port** (which slots take the old section's content) · **Note** (normalization,
override, or asset dependency). Every slug and class below was grep-verified against `blocks/`,
`assets/css/ds.css` and `assets/js/ds.js` on 2026-09-02.

**The invariant, before any recipe:** *paste the block file, change only content.* A recipe never
authorizes new markup, new `cmp-*` classes, inline `style=` (except `--var` passing), `<style>`,
`<script>` or `id=` on a page.

### Interpretation rules (stated once; referenced by number in the recipes)

**(i) "keep the content from the existing page"** — port **ALL** of the old section's text, media
(`<img>`, `<video>`/`<source>`, `data-bg`, `poster`), links (`href`) and accessibility strings
(`alt`, `aria-label`, `aria-labelledby`, `role`) into the target's slots. **Nothing invented,
nothing dropped.** A slot the target has no named home for goes into the nearest atom inside the
target (`ds-stack` + `type-*`), it does **not** get cut. Reveal/animation hooks (`data-reveal`,
`data-reveal-delay`, `data-animate`) come from the **block**, not the old section.
*Corollary:* "keep the content **and video**" on a section that has no video (most of them) means
"keep whatever media the original carries" — including a poster-only `data-bg`. It never means
go find a video.

**(ii) "Add the CTAs if needed as per original"** — diff the OLD section's CTA inventory against
the block demo's. If the old section had CTAs the demo lacks, add them from atoms:
`a.btn.btn-text` (inline/trailing link), `a.btn.btn-outline` / `.btn-accent` / `.btn-filled` (band
CTA — per the v4 button doctrine, not the legacy `btn-primary`/`btn-navy` aliases),
`btn-outline-light` / `btn-glass` on dark or image surfaces — placed inside the card's
`.ds-stack` or in a row after the grid. **Never add a CTA the original did not have**, and never
drop one it did.

**(iii) "keep the existing content and surface color, navy" / "keep grey"** — the swept section
**keeps its own `surface-*` class**, even when the block file's demo root ships a different one.
Paste the block, then restore the page's surface token (and its `section-y` / spacing state) on the
root. The demo's surface is demo content, not contract.

**(iv) "keep four columns" — NORMALIZED.** This phrase is Hakan's per-card boilerplate; it is a
*fidelity* instruction first and a *layout* instruction only where a columns axis exists.
- **Target HAS a columns axis** — `cmp-cards` (`is-cols-2/3/4/auto`), `cmp-logo-wall`,
  `cmp-fact-grid`, `cmp-link-directory` (their own `is-cols-4`): emit the column count **the
  original rendered**. Where the original was 4-up, emit `is-cols-4` explicitly (it is
  `.cmp-cards`'s default pin — `--cd-cols: 4` — but write it, so the intent is legible).
- **Target has NO columns axis** — `scroll-showcase`, `feature-scroll-story`, `statement-stats`,
  a pinned scroll track, or a carousel in `is-center-peek` (where `--cd-fit` does not apply): the
  phrase carries **no layout instruction**. Read it as (i) + (ii) only. **Never invent a column
  axis and never force 4-up on a peek carousel or a pinned pan.**
- Where the original's own count is 3, 5, 6, 8, 15 or 56, **the original's count wins** — "four"
  is the boilerplate, the original is the spec.

**(v) OVERRIDES — rulings that replace the board's proposal.** Old proposal struck; these are
BINDING recognition rules, not preferences:

| group | old proposal | Hakan 2026-09-02 |
|---|---|---|
| g10 `cmp-kicker-cards` | ~~`cards-kicker`~~ | **`cards-icon-linked`** — "use Cards — Icon Linked" |
| g11 `cmp-highlights-tiles` | ~~`cards-icon`~~ | **`cards-icon-linked`** — "Cards — Icon Linked" |
| g25 `cmp-tabs-pills-grid` | ~~`filter-grid` (one grid + `data-filter` chips)~~ | **`tabs-directory`** — "use tabs-directory" |
| g37 `cmp-tabs` | ~~`tabs-*` v4 rename in place~~ | **`tabs-vertical`** — "use tabs-vertical" |
| g46 `cmp-devices-features` | ~~`devices-features` atom pass~~ | **`cards-icon-linked`, no background, 4 columns, no carousel** |
| g15 `cmp-feature-scroll-track` | ~~`cards-carousel`, pin LOST~~ | **`cards-plain-scroll`** — the pin is KEPT |
| g21 `cmp-how-it-works-steps` | ~~MIGRATION §3 route to `cards-number`~~ | **keep `how-it-works-steps`** |
| g53 `cmp-key-transactions` | ~~MIGRATION §3 route to `cards-tombstones`~~ | **`fact-grid`** |

**(vi) DO-NOT-TOUCH — excluded from every transform in this sweep.** Not "low priority": these
sections are not opened at all, not re-pasted, not atom-passed, not re-rooted.

| group | ruling |
|---|---|
| g01 `cmp-site-header → site-header-v4` (51) | "Do not touch this at all" |
| g02 `cmp-footer-option1 → footer-option1` (51) | "Do not touch this at all" |
| g31 `cmp-scroll-story-video` (2) | "keep the original. This is beyond components." |

This **supersedes §5.2's** "re-paste both blocks verbatim anyway" advice for the header and footer:
the verified zero-diff plus an explicit do-not-touch means the sweep leaves all 102 sections
untouched. It also closes **J8** — the `ssv-*` / `cap-*` type-class collapse is cancelled.

---

### Heroes & top-of-page

**g01 · `cmp-site-header` → `site-header-v4` — 51 sections — NO RECIPE (rule vi).**
*Ruling: "Do not touch this at all"* — the section is not opened. Roots already match
`blocks/site-header-v4.html` verbatim (`cmp cmp-site-header ish-v4`, 14 `ish-col`, 12 `ish-site`).

**g02 · `cmp-footer-option1` → `footer-option1` — 51 sections — NO RECIPE (rule vi).**
*Ruling: "Do not touch this at all"* — roots already match `blocks/footer-option1.html`
(`cmp cmp-footer-option1 surface-grey`, 21 `fo1-link`).

**g03 · `(anonymous root)` → `cta-band` — 49 sections, 49 pages**
*Ruling: "use our cta-band from library, but ensure we keep the content from the existing page"*
- **Emit:** `<section class="cmp ptf-ctaband surface-navy section-y">` ← paste `blocks/cta-band.html`.
- **Port:** the page's own headline (22 distinct across the 49), supporting line, and CTA pair — rule (i)+(ii).
- **Note:** the anonymous root **is** the block's own design (§5.2); do not mint a `cmp-*` class for it. Zero-to-tiny diff expected; a large diff means the page drifted.

**g04 · `cmp-hero-video-left` → `hero` — 42 sections, 42 pages**
*Ruling: "Use cmp cmp-hero surface-navy but ensure we keep the content from the existing page"*
- **Emit:** `<section class="cmp cmp-hero surface-navy">` ← paste `blocks/hero.html` (its root is exactly that string).
- **Port:** eyebrow / H1 / sub / CTAs; the `<video>` becomes `video.media-cover` keeping `src`, `poster`, `muted/loop/playsinline`; `aria-label` carries over.
- **Note:** the page utilities on the old root (`relative overflow-hidden min-h-screen flex items-end pt-28 pb-24`) are **replaced by the Place axis** `is-bottom` — they never survive onto the new root. **Wash:** rule (i) — keep the section's OWN `.ov` atoms (the sampled instances carry `ov ov-black ov-tint ov-65`); only a hero with no `.ov` at all takes §3 J1(a)'s default (`ov ov-black ov-gradient-l ov-80` + `ov ov-gradient-t ov-50`). `hvl-btn-secondary` → `btn-outline-light`.

**g23 · `cmp-hero-image-left` → `hero-image` — 4 sections, 4 pages**
*Ruling: "ok with proposed but ensure we keep the content from the existing page"*
- **Emit:** `<section class="cmp cmp-hero is-bottom surface-navy">` ← paste `blocks/hero-image.html`.
- **Port:** eyebrow / H1 / sub / CTA; the image via `media-cover` + `data-bg`.
- **Note:** the two `.ov` atoms carry over **verbatim minus their `hil-*` aliases** (`ov ov-black ov-gradient-l ov-90 hil-scrim` → `ov ov-black ov-gradient-l ov-90`); all `hil-*` wrappers die.

**g44 · `cmp-hero-cinematic-pinned` → `hero-cinematic-pinned` — 1 section (`trade-supply-chain-finance-v2`)**
*Ruling: "ok with proposed, hero-cinematic-pinned but ensure we keep the content from the existing page"*
- **Emit:** `<section class="cmp cmp-hero-cinematic-pinned surface-navy">` ← paste `blocks/hero-cinematic-pinned.html`.
- **Port:** eyebrow, "Transforming global flows." headline, scroll cue, media.
- **Note:** atom pass only — `scin-h1`→`type-display-lg on-surface`, `scin-sub`→`type-body-lg on-surface-mid`, `scin-ghost`→`btn btn-outline-light btn-lg`. The pin behaviour is the block's.

**g57 · `cmp-hero-fullbleed` → `hero` — 1 section (`api-banking-v2`)**
*Ruling: "Use cmp cmp-hero surface-navy but ensure we keep the content from the existing page"*
- **Emit:** `<section class="cmp cmp-hero is-bottom surface-navy">` ← `blocks/hero.html` + the `is-bottom` Place axis.
- **Port:** the `<video>` → `video.media-cover`; **the poster currently passed as `style="--hfb-poster:url('assets/images/shared/common/api-bg.jpg')"` becomes `data-bg` on the media element** — this is the page's only remaining custom-prop hero hack and it must not be carried across.
- **Note:** `hfb-media/scrim/inner/eyebrow/title/sub/btn` all die. The section has no `.ov` atoms today, so it takes the J1(a) default wash.

**g61 · `cmp-editorial-story` → `hero-editorial` — 1 section (`sustainable-finance-v2`)**
*Ruling: "ok with proposal but ensure we keep the content and video from the existing page"*
- **Emit:** `<section class="cmp cmp-hero is-bottom surface-navy">` ← paste `blocks/hero-editorial.html`.
- **Port:** eyebrow / display headline / lead + the **4-up stat strip** (`es-stat-num`/`-unit`/`-lbl` → `ds-num` + `ds-num-unit` + `type-body-sm on-surface-mid`, countups carry over); both `.ov` atoms carry over.
- **Note:** rule (i) corollary — **this section has NO video.** Its media is `data-bg="assets/images/sustainable-finance/sf-editorial-poster.jpg"` on the root. "keep the video" = keep that poster as the `media-cover` `data-bg`.

**g68 · `cmp-hero-video-center` → `hero` — 1 section (`events-library`)**
*Ruling: "Use cmp cmp-hero surface-navy but ensure we keep the content from the existing page"*
- **Emit:** `<section class="cmp cmp-hero surface-navy">` ← `blocks/hero.html`, Place axis per the original's placement (the old root is `flex items-end justify-center` = bottom-centred).
- **Port:** headline, sub, `aria-label="Events"`, the `<video>` → `video.media-cover`.
- **Note:** no `.ov` today → §3 J1(a) centre recipe (`ov ov-black ov-radial`).

**g41 · `cmp-article` → `article` — 2 sections (`article-example`)**
*Ruling: "ok with proposed but ensure we keep the content from the existing page"*
- **Emit:** the block's compound roots — `<section class="cmp cmp-article surface-navy art-hero">` and the body root — ← paste `blocks/article.html`.
- **Port:** headline, standfirst, byline/meta, body prose, the hero `data-bg` and the in-body `<img>`.

### Cards family

**g05 · `cmp-cards-thumb` → `cards` — 28 sections, 28 pages**
*Ruling: "ok with proposal but ensure we keep the content and images from the existing page"*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-thumb is-cols-4 surface-<page's own> section-y">` ← paste `blocks/cards.html`. Carousel instances: `blocks/cards-carousel.html`.
- **Port:** section-head (eyebrow + h2 + lead) and every `ct-card` → `a.cd-card.justify-end` with its `data-bg`, title, description, arrow/CTA and `aria-label`. Rule (i): **all four images**, not a demo set.
- **Note:** rule (iv) — the sampled instances are 4-up → `is-cols-4`. **Never emit `blocks/cards-thumb.html`** (hidden legacy twin).

**g07 · `cmp-cards-thumb-box` → `cards-boxed` — 17 sections, 14 pages**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-boxed is-cols-<original> surface-<own> section-y">` ← paste `blocks/cards-boxed.html`; carousel sets → `blocks/cards-boxed-carousel.html`.
- **Port:** every card's media (`data-bg`), kicker/chip, title, description, link; `card-panel` on the `cd-card` with `--card-pad: 0`.
- **Note:** rule (iv) — 4-up instances get `is-cols-4`, the 3-up ones stay `is-cols-3`. Rule (ii) applies here more than anywhere: several instances carry a per-card CTA the demo omits.

**g07-sub · `is-full-desc` modifier — 2 sections (`structured-solutions` §9, `swift-corporates` §4)**
*Ruling: "ok with mock-j10.html"*
- **Do:** **drop the class.** `.cmp-cards-thumb-box.is-full-desc` is a single declaration (ds.css:5798) inside the retired `cmp-cards-thumb-box` zone; the `cards-boxed` composition has no clamp, so descriptions are already unclamped — which is what `mock-j10.html` ("J10 mock — is-full-desc dropped") demonstrates.
- **Note:** the declaration is deleted **with its zone**, not separately; do not mint an unclamp axis on `cmp-cards`.

**g10 · `cmp-kicker-cards` → ~~`cards-kicker`~~ **`cards-icon-linked`** — 11 sections, 11 pages** *(OVERRIDE)*
*Ruling: "use Cards — Icon Linked"*
- **Emit:** `<section class="cmp cmp-cards cards-icon-linked is-cols-<original> surface-<own> section-y">` ← paste `blocks/cards-icon-linked.html`.
- **Port:** each `kc-card` → `a.cd-card.card-panel.surface-clear > .ds-stack >` `span.icon-tile` + `h3.type-h6 on-surface` + `p.type-body-sm on-surface-mid` + `span.btn.btn-text`. The old **kicker** (number or short label) has no slot in this composition: rule (i) — it survives as the card's eyebrow atom (`span.type-eyebrow.type-blue`) at the top of the same `.ds-stack`, it is not dropped.
- **Note:** the instances range 3–15 cards; rule (iv) — use the original's count (`is-cols-3` for the 3-up, `is-cols-4` for 4-up, `is-cols-auto` for the 15-tile dense grid). A card with **no** link still emits `div.cd-card` (not `a`), CTA per rule (ii).

**g11 · `cmp-highlights-tiles` → ~~`cards-icon`~~ **`cards-icon-linked`** — 10 sections, 9 pages** *(OVERRIDE)*
*Ruling: "Cards — Icon Linked"*
- **Emit / Port:** identical to g10, from `ht-tile` / `ht-tile-title` / body / icon.
- **Note:** rule (iv) — instances are 3-up, 4-up and 6-up; take the original's count.

**g17 · `cmp-tombstone-grid` → `cards-tombstones` — 5 sections (the tombstone quintet)**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards cards-tombstones is-cols-4 surface-<own> section-y">` ← paste `blocks/cards-tombstones.html`.
- **Port:** the count + ESG-legend head row (part of the composition) and **every** deal cell — 56 / 30 / 36 / … per page, with its logo `<img>`, amount, role, year. Rule (i): no truncation to a demo set.
- **Note:** `.tomb-grid` has no ds.css rules left; the target grid is `.cd-grid`, whose default is 4 columns — "keep four columns" is literally satisfiable here (`is-cols-4`).

**g18 · `cmp-pillar-grid` → `cards-icon-linked` — 4 sections, 4 pages**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards cards-icon-linked is-cols-<original> surface-<own> section-y">` ← `blocks/cards-icon-linked.html`.
- **Port:** each `pg-card` → icon-tile + title + body + `btn btn-text` link; one instance also carries a `data-bg` — keep it.
- **Note:** originals are 3-up, 4-up and 5-up. Rule (iv): use those, not four. `pg-link` dies with its zone (and takes its `[dir="rtl"]` restatement — §5.3).

**g30 · `cmp-cards-thumb-nobox` → `cards-people` — 3 sections (`our-people-v2`)**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-people is-portrait is-cta-text is-cols-<4|3> surface-<own> section-y">` ← paste `blocks/cards-people.html`.
- **Port:** each `ct-card` → portrait `data-bg`, name, role, `data-modal-open` hook. The `.op-modal` bios stay in the `cmp-modal` section unchanged (see g67).
- **Note:** rule (iv) — the first grid is 4-up (`is-cols-4`), the other two are 3-up.

**g35 · `cmp-testimonials` → `cards-testimonials-carousel` — 2 sections (`smarttrade-v2`, `smartscf-v2`)**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-testimonials is-center-peek is-cols-2 surface-<own> section-y">` ← paste `blocks/cards-testimonials-carousel.html`.
- **Port:** all 5 `tc-card`s per instance — quote, attribution, role, portrait `data-bg`; autoplay + play/pause control as built (`btn btn-outline btn-icon btn-sm` + `.sr-only`).
- **Note:** **rule (iv) NORMALIZATION — "keep four columns" does not apply.** `is-center-peek` deliberately suppresses the `--cd-fit` column maths (`.cmp-cards:not(.is-center-peek) … --cd-fit: 4`); a centre-peek carousel shows one focused slide with neighbours peeking. Read the phrase as content + CTA fidelity only, and keep the block's `is-cols-2`.

**g38 · `cmp-people-carousel` → `cards-people-carousel` — 2 sections (`equity-capital-markets-v2`, `debt-capital-markets-v2`)**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-people surface-<own> section-y">` ← paste `blocks/cards-people-carousel.html`.
- **Port:** all 9 `pc-card`s per instance (portrait `data-bg`, name, role, LinkedIn link if present); the tab rail → `chip chip-lg` + `data-tab`.
- **Note:** rule (iv) — a `cmp-cards` carousel not in peek mode already fits 4 per view (`--cd-fit: 4`), so "four columns" is the default and needs no class.

**g60 · `cmp-story-cards` → `cards` (ALT A) — 1 section (`industry-specific-finance-v2` §4)**
*Ruling: "use cards with media, ALT A keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-thumb is-cols-4 surface-<own> section-y">` ← paste `blocks/cards.html`.
- **Port:** all **8** cards — title, body, tag → `chip`. The 8 `<video>` elements have **zero `<source>`**: they are posters, so each poster becomes `data-bg` on `span.media-cover` (the `es-bgvid` precedent). Rule (i): 8 cards, not 4.
- **Note:** the four tints (`sc-tint-sky/sand/rose/indigo`) have no composition equivalent and are dropped — that loss is what ALT A accepts. Rule (iv): the grid is 4-up per row over 8 cards → `is-cols-4`.

**g62 · `cmp-cards-thumb-nobox` → `cards-plain` — 1 section (`sustainable-finance-v2`)**
*Ruling: "ok with proposal, keep grey but ensure we keep the content and video … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-plain is-cols-3 surface-grey section-y">` ← paste `blocks/cards-plain.html`, then apply rule (iii): **`surface-grey`**, explicitly ruled.
- **Port:** all 6 `ct-card`s with their `data-bg`, title, description, link.

**g72 · `cmp-digital-tools-showcase` → `cards-carousel` — 1 section (`instant-banking-services`)**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-thumb surface-<own> section-y">` on the carousel frame ← paste `blocks/cards-carousel.html`.
- **Port:** all 5 tiles with their `data-bg`, title, description, link. `dts-link` dies with its zone (RTL restatement goes with it — §5.3).
- **Note:** rule (iv) — carousel default is 4 per view; no extra class.

**g73 · `cmp-services-grid` → `cards-number` — 1 section (`smart-cdm`)**
*Ruling: "ok with proposal, but ensure we keep the content and video … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-cards cards-number is-cols-3 surface-<own> section-y">` ← paste `blocks/cards-number.html`.
- **Port:** all 6 `sg-card` / `sg-card-h` pairs; the `sg-chip` row → `chip` atoms in a `flex flex-wrap gap-2` row.
- **Note:** no "four columns" in this ruling — the original is 3-up; keep `is-cols-3`.

**g33 · `(anonymous root)` → `cards-icon-linked` — 2 sections (`businessonline-x-v2`, `emirates-nbd-pay-v2`)**
*Ruling: "ok for proposal"*
- **Emit:** `<section class="cmp cmp-cards cards-icon-linked is-cols-3 surface-<own> section-y">` ← paste `blocks/cards-icon-linked.html` (this also fixes the anonymous root).
- **Port:** the 3 `pos-way` triads — icon, title, body, link.

### Scroll & motion

**g12 · `cmp-scroll-tab` → `scroll-showcase` — 9 sections, 9 pages**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-scroll-showcase surface-<own> section-y" data-behavior="scroll-showcase" data-scroll-pinned>` ← paste `blocks/scroll-showcase.html` (`-rev` where the original is reversed).
- **Port:** every `ss-step` with its `ss-step-img` `data-bg` pair (5 / 8 / 3 … steps per instance — rule (i), all of them), headings, body, and the points list: long `ss-points` → `list-check`, short labels stay `ss-chips`.
- **Note:** **rule (iv) does not apply** — `cmp-scroll-showcase` is a pinned step sequence with no columns axis. Content + CTA fidelity only.

**g14 · `cmp-feature-scroll-story` → `feature-scroll-story` — 7 sections, 4 pages — ASSET**
*Ruling: "ok with proposal, keep four columns … Add the CTAs if needed as per original."*
- **Emit:** `<section class="cmp cmp-feature-scroll-story surface-<own>">` ← paste `blocks/feature-scroll-story.html` (`-rev` variant where reversed).
- **Port:** all `ess-ch` chapters (3–4 per instance) with copy and device shot.
- **Note:** **ASSET, mandatory** — each chapter's device shot must be a **baked 2× transparent PNG** per the glossary bake recipe (`<img class="ess-shot-img">`); raw un-baked mockups are a lint failure. 7 sections × 3–4 shots. Rule (iv) does not apply (no columns axis).

**g43 · `(anonymous root)` → `feature-scroll-story` — 1 section (`payments-v2` §3)**
*Ruling: "ok for proposal but keep the existing content"*
- **Emit:** re-root to `<section class="cmp cmp-feature-scroll-story surface-grey">` (`.ess rev` → the `-rev` block).
- **Port:** nothing moves — the `.ess` interior is already the block's own markup; only the bespoke `cmp surface-*` root is replaced so the section is recognised.

**g15 · `cmp-feature-scroll-track` → ~~`cards-carousel`~~ **`cards-plain-scroll`** — 7 sections, 7 pages** *(OVERRIDE)*
*Ruling: "cmp cmp-cards is-hover-zoom cards-plain surface-grey with scroll pin, keep the same content as per original"*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-plain surface-grey" data-animate data-behavior="scroll-track">` ← paste **`blocks/cards-plain-scroll.html`**. His class string is that block's root **verbatim**; its interior is `.cd-scroll-outer[data-scroll-outer] > .cd-scroll-pin > (container-ds + section-head) + .cd-scroll-wrap[data-scroll-wrap] > .cd-track[data-track]`.
- **Port:** all 5–7 `cst-card`s per instance — image, title, body, link — into `.cd-card`s on the track; the section head becomes canonical `section-head is-split` (lead as an `.sh-lead` sibling of `.ds-stack`); drop the section `id`.
- **Note:** **the pin is NOT lost.** Verified 2026-09-02: `DS.recipe('scroll-track')` in `assets/js/ds.js`, `.cd-scroll-outer` (300vh) / `.cd-scroll-pin` (sticky, 100vh) / `.cd-scroll-wrap` in `assets/css/ds.css`, and 18 `*-scroll` composition blocks. §3 J3 and the importer-glossary `.cst-*` row both still say the recipe "has NOT been generalized" — **both are stale and are corrected by this ruling.** Rule (iii): he named `surface-grey`; keep it.

**g31 · `cmp-scroll-story-video` — 2 sections (`digital-channels-v2`, `businessonline-x-v2`) — DO NOT TOUCH**
*Ruling: "keep the original. This is beyond components."*
- **Do:** nothing. No re-root, no atom pass. The §3b `ssv-*` / `cap-*` → `type-*` collapse (J8) is **cancelled**; those page-only classes stay.

**g48 · `cmp-app-cinema` → `scroll-scenes` — 1 section (`businessonline-x-v2` §10)**
*Ruling: "change to scroll-scenes, port content"*
- **Emit:** `<section class="cmp cmp-scroll-scenes surface-navy">` ← paste `blocks/scroll-scenes.html`.
- **Port:** the whole `aci-*` interior, rebuilt from atoms inside the scenes (J16 answer (a)): app-store buttons → `btn` pair, QR + device card → `card-panel` + `media-cover`, the 3 `<img>` and the `<video>` all carry across.

**g50 · `cmp-coverflow-carousel` → `coverflow-carousel` — 1 section (`emirates-nbd-pay-v2`)**
*Ruling: "ok with proposal but keep the existing content"*
- **Emit:** `<section class="cmp cmp-coverflow-carousel surface-<own> section-y">` ← paste `blocks/coverflow-carousel.html`.
- **Port:** headline + all slides with their `data-bg` and captions.

**g55 · `cmp-carousel-center` → `cards-carousel is-center-peek` — 1 section (`smartscf-v2` §8)**
*Ruling: "ok with proposal but keep the existing content"*
- **Emit:** `<section class="cmp cmp-cards is-hover-zoom cards-thumb is-center-peek surface-<own> section-y">` ← `blocks/cards-carousel.html` + the `is-center-peek` axis.
- **Port:** all 5 `cc-slide`s with `data-bg`, title, body; keep the `data-carousel-toggle` pause/play control styled `btn btn-outline btn-icon btn-sm` + `.sr-only`.
- **Note:** `is-center-peek` exists (ds.css, 6 declarations); §3 J14's "pending" text is stale.

**g63 · `cmp-features-autoprogress` → `features-autoprogress` — 1 section (`global-loan-solutions-v2`)**
*Ruling: "ok with proposal but keep the existing content"*
- **Emit:** `<section class="cmp cmp-features-autoprogress surface-<own> section-y">` ← paste `blocks/features-autoprogress.html`.
- **Port:** all 4 `fap-card` / `fap-card-bar` pairs with their `data-bg`.

**g64 · `cmp-process-cards` → `cards-steps` — 1 section (`global-loan-solutions-v2` §7)**
*Ruling: "ok with proposal but keep the existing content"*
- **Emit:** `<section class="cmp cmp-cards is-hover-fill cards-steps surface-<own> section-y">` ← paste `blocks/cards-steps.html`.
- **Port:** every step's number, title and body. **Concatenate the per-letter `.p-word > span` spans back to plain text** before porting.
- **Note:** J13 (a) — the scroll fan-in entry, gradient hover, per-letter blur reveal and `.p-title` word pill have no slot and are **accepted losses**, recorded here.

**g66 · `cmp-video-content` → `synced-slider` — 1 section (`equity-capital-markets-v2`)**
*Ruling: "ok with proposal but keep the existing content"*
- **Emit:** `<section class="cmp cmp-synced-slider surface-<own> section-y">` ← paste `blocks/synced-slider.html`.
- **Port:** headline + all 4 slides with their `data-bg` and copy.
- **Note:** this is the section that produced the glossary's self-centring-block lint (#5) — verify the inner wrapper is `container-ds`, never a bare max-width+auto-margin grid.

### Accordions, tabs & filtering

**g08 · `cmp-accordion` → `acc` — 14 sections, 14 pages**
*Ruling: "ok with proposal but keep the existing content and the laoyut of inner content on each accordeon. What I mean is, if it is simple text, use simple text. Don't overcomplicate."*
- **Emit:** `<section class="cmp cmp-acc surface-<own> section-y">` ← paste `blocks/acc.html`; boxed rows → `blocks/acc-boxed.html`, long Q&A sets → `blocks/acc-faq.html`. One `data-acc` core — never `<details>`.
- **Port:** every row's question + body (5–25 rows per instance — rule (i), all of them). `.acc-icon`→`.ac-icon`, `.acc-inner`→`.ac-inner` (drop its 60ch cap; put `.measure` on prose).
- **Note:** **this is the J2 answer and it is a fidelity rule, not a layout rule.** The body keeps the ORIGINAL's inner layout: a prose body stays a single prose block with `.measure`; a genuine `.acc-pad` 2-column body keeps two columns via a plain utility grid inside `.ac-inner` (`grid md:grid-cols-2 gap-x-10 gap-y-3`, no new CSS). **Do not upgrade a simple text body into a grid, a card set or a two-column layout** — "Don't overcomplicate".

**g25 · `cmp-tabs-pills-grid` → ~~`filter-grid`~~ **`tabs-directory`** — 3 sections, 3 pages** *(OVERRIDE)*
*Ruling: "use tabs-directory"*
- **Emit:** `<section class="cmp cmp-tabs tabs-directory surface-<own> section-y">` ← paste `blocks/tabs-directory.html`.
- **Port:** the **tabs are kept, not collapsed** — rail `tb-rail is-underline` of `button.tb-tab[data-tab]`, one `.tb-panel[data-panel]` per tab holding its `.tpl-intro` lead (`type-body-lg on-surface-mid measure`) and its tiles as `div.cd-card.card-panel.is-flat` inside `.cmp-cards.is-cols-auto.is-hover-lift > .cd-grid`. All 25 / 14 / 12 pills per instance; keep tiles label-only (a short desc where TSCF has one) — do not invent descriptions.
- **Note:** the block was formalized **from this exact section** — `blocks/tabs-directory.html` ships the `payments-v2` copy ("How we can help you" / "We understand that every business is unique."), so the port is near-verbatim. The old `filter-grid` route (one grid + `data-filter` chips, panels deleted) is **struck**; the per-tab reading is preserved. `.tpl-*` had no ds.css and rendered unstyled — nothing to preserve from it.

**g37 · `cmp-tabs` → ~~`tabs-*` rename in place~~ **`tabs-vertical`** — 2 sections (`industry-specific-finance-v2` §5, `fx-hub` §6)** *(OVERRIDE)*
*Ruling: "use tabs-vertical"*
- **Emit:** `<section class="cmp cmp-tabs surface-<own> section-y">` ← paste `blocks/tabs-vertical.html`: wrap `div[data-tabs][data-tabs-swipe].flex.flex-col.md:flex-row.gap-8`, rail `div.tb-rail.is-vertical.shrink-0.md:w-56[role=tablist]` of `button.tb-tab[data-tab]`, panels column `div.flex-1.pt-2` of `div.tb-panel[data-panel]`.
- **Port:** ISF — all 8 sector panels with their 17 eyebrows, strengths lists, stats and advantage lines, composed from atoms per the glossary `isf` recipe (label → `ds-eyebrow`; strengths → `grid sm:grid-cols-2 gap-x-8 gap-y-5` of title `type-body on-surface font-semibold block` + body `type-body-sm on-surface-mid`; stats → `flex flex-wrap gap-10` of `ds-num is-sm` + `type-caption on-surface-mid`; advantage → `ds-eyebrow` + `type-body … measure`). FX Hub — panels plus their 3 `data-bg` media.
- **Note:** **strip the authored tab ARIA and ids** (`id=`, `role="tab"/"tabpanel"`, `aria-controls`, `aria-labelledby`, `tabindex`) — `ds.js` re-adds them. `.tabs-vert`/`.tab-vert` are undefined in ds.css today, so nothing is preserved from the old markup.

**g70 · `(anonymous root)` → `data-filter` — 1 section (`faqs` §3) — BUILD ITEM, not a transform**
*Ruling: "we need to build this"*
- **This is the one ruling that is not a sweep transform.** See **PRE-SHARD WORK ITEMS · WI-4** below for the full build definition.

### Bento

**g16 · `cmp-bento-spotlight` → `bento-spotlight` — 5 sections, 5 pages**
*Ruling: "ok with proposal, but keep the existing content"*
- **Emit:** `<section class="cmp cmp-bento bento-spotlight is-hover-lift is-hover-spotlight surface-<own> section-y">` ← paste `blocks/bento-spotlight.html`.
- **Port:** all 5–7 `bs-tile`s with their copy, the section `data-bg`, and each tile's link.
- **Note:** per-tile `is-w*` / `is-h*` spans replace the old `bs-grid--*` variants — read the span from the original's grid, don't guess.

**g27 · `cmp-bento-photo` → `bento-photo` — 3 sections, 3 pages**
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-bento bento-photo is-hover-zoom surface-<own> section-y">` ← paste `blocks/bento-photo.html`, then rule (iii): restore the page's surface (`surface-navy` where the page is navy — the block demo ships `surface-white`).
- **Port:** all 4–6 `bp-tile` / `bp-tile-title` pairs with their `data-bg`.

**g29 · `cmp-bento-expand` → `bento-expand` — 3 sections, 3 pages**
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-bento-expand surface-<own> section-y">` ← paste `blocks/bento-expand.html`; rule (iii).
- **Port:** all 3 `be-panel`s per instance with their `data-bg` and `<img>`.

**g39 · `cmp-bento-magazine` → `bento-magazine` — 2 sections (`fx-hub`, `initiatives-and-partners-v2`)**
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-bento bento-magazine is-hover-lift surface-<own> section-y">` ← paste `blocks/bento-magazine.html`; rule (iii).
- **Port:** all tiles, the `data-bg`s **and the `<video>`** on the fx-hub instance.

### Stats & facts

**g45 · `cmp-impact-stats` → `stats-row` — 1 section (`digital-channels-v2`)**
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-cards stats-row is-cols-4 is-divided surface-<own> section-y">` ← paste `blocks/stats-row.html`; rule (iii).
- **Port:** all 4 `is-stat` figures + labels. **Alphanumeric figures drop `data-countup`** (it only animates numbers).

**g49 · `cmp-metrics-type2` → `stats-hero-figure` — 1 section (`emirates-nbd-pay-v2`)**
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-stats-hero-figure surface-<own> section-y">` ← paste `blocks/stats-hero-figure.html`; rule (iii).
- **Port:** hero figure → `ds-num is-xl is-light` + `ds-num-unit`, its label, and the supporting figures.
- **Note:** the `mt2-num` slots on this page hold `All` / `PCI-DSS` — short compact labels, the sanctioned exception to the numbers-only rule (already repaired on the 08-25 version). Do not "fix" them again.

**g52 · `cmp-metrics-type1` → `stats-quad` — 1 section (`smarttrade-v2`)**
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-stats-quad surface-<own> section-y">` ← paste `blocks/stats-quad.html`; rule (iii).
- **Port:** all 4 `m1-cell` figures (`ds-num is-lg`) + labels.

**g53 · `cmp-key-transactions` → **`fact-grid`** — 1 section (`smarttrade-v2` §9)** *(OVERRIDE of MIGRATION §3)*
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-fact-grid is-cols-<original> surface-<own> section-y">` ← paste `blocks/fact-grid.html`; rule (iii).
- **Port:** all 10 `kt-cell` deals — amount, instrument, counterparty, year.
- **Note:** this settles J11 in favour of the glossary EMIT; **MIGRATION §3's `cards-tombstones` route for `cmp-key-transactions` is dead.** `kt-link` dies with its zone (RTL restatement with it — §5.3).

**g54 · `cmp-content-block-numbers` → `proof-points` — 1 section (`smartscf-v2`)**
*Ruling: "ok with proposal, but keep the existing content and surface color, navy"*
- **Emit:** `<section class="cmp cmp-proof-points surface-<own> section-y">` ← paste `blocks/proof-points.html`; rule (iii).
- **Port:** headline, all numbered points, and the `<img>`.

**g71 · `cmp-about-stats` → `statement-stats` — 1 section (`payment-tracker`) — PRE-SHARD ASSET**
*Ruling: "ok with proposal, but left side should be built as a mockup as per original. We can make it an image render as well."*
- **Emit:** `<section class="cmp cmp-statement-stats surface-<own> section-y" data-behavior="text-reveal">` ← paste `blocks/statement-stats.html`.
- **Port:** right side — the `data-tr-word` headline (word spans are the block's text-reveal contract, keep them) + the `as-stats` figures (`ds-num as-num` + `as-lbl`). Left side — eyebrow (`as-eyebrow` + `as-dot`), the `as-para` copy, and the **gpi tracker mockup** into the block's `as-media` slot (the demo ships `as-video` there).
- **Note:** see **WI-1** — the left-hand tracker is bespoke live UI (`tr-eyebrow`/`tr-row`/`tr-amt`/`tr-badge`/`tr-steps` driven by `data-pt-track` / `data-pt-step` / `data-pt-prog`) and must become a **block-level mock captured as an image render**, per the device-image doctrine.

### Kept as-is (CUSTOM-KEEP) & already-current blocks

**g20 · `(anonymous root)` → `gls-global` — 4 sections, 4 pages — KEEP**
*Ruling: "ok with the proposal"* — the proposal was CUSTOM-KEEP.
- **Do:** leave the navy band as-is (`cmp surface-navy section-y` + `section-head is-split` + 6–8 `badge badge-solid` market pills). Do **not** fold onto `market-band` (J6 (b) declined; `market-band` has no ds.css zone of its own).
- **Note:** it is one of the four bespoke sections the sweep does not re-derive from a block → **RTL spot-check required** at `?dir=rtl` (§5.3).

**g22 · `(anonymous root)` → `section-head is-split` — 4 sections, 3 pages**
*Ruling: "use our generic content component but build with atoms properly"*
- **Do:** keep the band, but **rebuild its interior from canonical atoms**: `section-head is-split` (lead as an `.sh-lead` SIBLING of `.ds-stack`, never inside it), `ds-eyebrow`, `type-h2 type-navy`, `type-body on-surface-mid`, `badge`/`badge-solid`, `dl-row`, `filter-*`. No new classes, no page CSS.
- **Note:** "generic content component" = the atom composition, not a new block. RTL spot-check (§5.3).

**g40 · `(anonymous root)` → `dl-row` — 2 sections (`media-library`, `tutorials-platform-demos`)**
*Ruling: "use our generic content component but build with atoms properly"*
- **Do:** as g22 — plain `cmp surface-*` band, canonical `section-head`, and the `dl-row` molecule (minted 2026-08-29, registered LIGHT ISLAND) for the 20 rows. Atoms only.
- **Note:** RTL spot-check (§5.3).

**g06 · `cmp-content-block-sidebyside` → `content-block-sidebyside` — 25 sections, 18 pages**
*Ruling: "use our generic content component but build with atoms properly"*
- **Emit:** `<section class="cmp cmp-content-block-sidebyside surface-<own> section-y">` ← paste `blocks/content-block-sidebyside.html`.
- **Port:** headline, copy, list/points, media, CTA — into the block's slots, **all type carried by `type-*` atoms**, no page-local type classes.
- **Note:** the block is current; this is the single largest verbatim-reuse bloc after header/footer/CTA. Treat any non-trivial structural diff as page drift.

**g09 · `cmp-big-statement` → `big-statement` — 12 sections, 12 pages** — *"ok with proposal"*
- **Emit:** `<section class="cmp cmp-big-statement surface-<own> section-y">` ← `blocks/big-statement.html`.
- **Port:** the statement lines and the link. `bst-line` → `type-display-xxl`; `bst-link` → `btn btn-text btn-lg`. Where a `rank-strip` follows (GLS, DCM) it stays the minted molecule.

**g13 · `cmp-feature-spotlight` → `feature-spotlight` — 8 sections, 7 pages** — *"ok with proposal"*
- **Emit:** `<section class="cmp cmp-feature-spotlight surface-<own> section-y">` ← `blocks/feature-spotlight.html`.
- **Port:** headline, copy, CTA, and the 1–2 `data-bg` media.

**g19 · `cmp-world-map` → `world-map` — 4 sections, 4 pages** — *"ok with proposal"*
- **Emit:** `<section class="cmp cmp-world-map surface-<own> section-y">` (or `world-map-stats` where the instance carries figures) ← `blocks/world-map.html` / `blocks/world-map-stats.html`.
- **Port:** headline, market list, pins/markers, stats; unify onto `data-behavior="world-map"`.

**g21 · `cmp-how-it-works-steps` → `how-it-works-steps` — 4 sections, 4 pages** *(OVERRIDE of MIGRATION §3)*
*Ruling: "ok with proposal how it works"*
- **Emit:** `<section class="cmp cmp-how-it-works-steps surface-<own> section-y">` ← `blocks/how-it-works-steps.html`.
- **Port:** all 3–5 `hiw-step` / `hiw-step-marker` pairs.
- **Note:** J4 (a) — the block **stays live** and keeps its CATALOG entry; **MIGRATION §3's AUTO recipe routing this pattern to `cards-number` is deleted.** The vertical numbered rail is a distinct pattern from a card grid.

**g24 · `cmp-form-shell` → `form-shell` — 4 sections, 4 pages**
*Ruling: "recreate using atoms as per original"*
- **Emit:** `<section class="cmp cmp-form-shell surface-<own> section-y">` ← paste `blocks/form-shell.html`.
- **Port:** **every field of the original form**, rebuilt from the form atoms (`blocks/form-elements.html`): label + input/select/textarea, consent checkbox, the fieldset card, the sticky aside, and the success panel. Audience tabs → `[data-aud]` / `[data-aud-panel]`; the form → `form[data-mock-form]` (ds.js owns validation + success). Dead page scripts are deleted.
- **Note:** "recreate using atoms as per original" = same fields, same order, same labels, same required-ness — atoms replace the bespoke `sac-*`/`sf-*` chrome, not the content.

**g26 · `cmp-quote-band` → `quote-band` — 3 sections, 3 pages** — *"ok for proposal"*
- **Emit:** `<section class="cmp cmp-quote-band surface-<own> section-y">` ← `blocks/quote-band.html` (`-rev` where reversed).
- **Port:** quote, attribution, role, portrait `data-bg`.
- **Note:** J15 (a) — `is-portrait-bleed` was DELETED 2026-09-01; the `our-people-v2` CEO quote **accepts the plain band** (which is already what ships).

**g28 · `cmp-intro-side-by-side` → `intro-side-by-side` — 3 sections, 3 pages**
*Ruling: "ok for proposal a"*
- **Emit:** `<section class="cmp cmp-intro-side-by-side surface-<own> section-y">` ← `blocks/intro-side-by-side.html`.
- **Port:** heading + lead one side, the 3–8 `intro-pillar`s the other; `ip-ic` → `icon-tile`.
- **Note:** **J7 answer (a) is now the locked pair: `ip-t` → `type-h6 on-surface`, `ip-d` → `type-body-sm on-surface-mid`.** MIGRATION §3's "pick the exact pair on first hit" TODO is closed for `cmp-intro-side-by-side` pillars. (It does not retro-change the glossary's `isf` panel recipe, which deliberately uses the quieter `type-body … font-semibold` title inside a tabs panel — a different context, not a contradiction.)

**g32 · `cmp-cta-marquee` → `cta-marquee` — 2 sections (`digital-channels-v2`, `emirates-nbd-pay-v2`)** — *"ok for proposal"*
- **Emit:** `<section class="cmp cmp-cta-marquee surface-navy section-y">` ← `blocks/cta-marquee.html`.
- **Port:** all 10–12 `cm-item`s + the CTA. **The finale heading is `type-h1 on-surface`, not `type-h2`** (lint #4).

**g34 · `cmp-useful-links` → `useful-links` — 2 sections (`businessonline-x-v2`, `api-banking-v2`)** — *"ok for proposal"*
- **Emit:** `<section class="cmp cmp-useful-links surface-grey">` ← paste `blocks/useful-links.html` (REBUILT 2026-09-02).
- **Port:** the eyebrow label + every link into `ul-head > ds-eyebrow` + `ul-grid` of `a.ul-item` rows with type glyphs. The old `.ul-row` inline strip is degraded markup — replaced, not preserved.

**g36 · `cmp-history-timeline` → `history-timeline` — 2 sections (`smartscf-v2`, `equity-capital-markets-v2`)** — *"ok for proposal"*
- **Emit:** `<section class="cmp cmp-history-timeline surface-<own> section-y">` ← `blocks/history-timeline.html`.
- **Port:** all 7 `ht-node`s per instance — year/step, title, body.

**g42 · `cmp-how-it-works-timeline` → `how-it-works-timeline` — 2 sections (`virtual-accounts`, `swift-corporates`)** — *"ok for proposal"*
- **Emit:** `<section class="cmp cmp-how-it-works-timeline surface-<own> section-y">` ← `blocks/how-it-works-timeline.html`.
- **Port:** all five steps with their copy.

**g46 · `cmp-devices-features` → ~~`devices-features`~~ **`cards-icon-linked`** — 1 section (`businessonline-x-v2`)** *(OVERRIDE)*
*Ruling: "cards-icon-linked but with no background, and in 4 columns, no carousel"*
- **Emit:** `<section class="cmp cmp-cards cards-icon-linked is-cols-4 surface-white section-y">` ← paste `blocks/cards-icon-linked.html` (the **static** block — explicitly **not** `cards-icon-linked-carousel` / `-scroll`).
- **Port:** all **8** `dvf-feat` tiles → `a.cd-card.card-panel.surface-clear > .ds-stack >` `icon-tile` + `type-h6` + `type-body-sm` (+ `btn btn-text` where the tile linked). Headline "The full corporate toolkit, on mobile." carries over.
- **Note:** **"no background" reads on two levels and both are satisfied by this emit** — the section drops its tinted band (`surface-grey` → `surface-white`), and the cards are the composition's own **clear** panels (`card-panel surface-clear`, the null surface). This is an explicit surface override, so rule (iii) does **not** apply here. The `devices-features` block and its device PNGs (`assets/images/device/dvf-laptop.png` / `dvf-phone.png`) are **not** used by this section any more.

**g47 · `cmp-laptop-showcase` → `laptop-showcase` — 1 section (`businessonline-x-v2` §8) — ASSET RESOLVED**
*Ruling: "ok for proposal but keep the existing content and use the PNG from the original"*
- **Emit:** `<section class="cmp cmp-laptop-showcase surface-navy section-y">` ← paste `blocks/laptop-showcase.html`.
- **Port:** eyebrow, "Your treasury, on one screen." headline, the `ls-sub` lead, all 3 `ls-step` / `ls-step-num` rows, and both live `ls-badge`s (badges stay UI).
- **Note:** the CSS laptop (`ls-lid` / `ls-screen` / `ls-screen-sheen` / `ls-base`) is replaced by `<img class="ls-device-img" src="/assets/images/device/laptop-showcase.png" alt="">` — **that PNG EXISTS** (309 kb, verified 2026-09-02), so §3 J17's "the asset does not exist yet" is stale and this section no longer blocks. See **WI-2** for the one open reading of "the PNG from the original".

**g51 · `cmp-insight-split` → `illustration-split` — 1 section (`smarttrade-v2`)**
*Ruling: "use insight split"*
- **Emit:** `<section class="cmp cmp-illustration-split surface-<own> section-y">` ← paste `blocks/illustration-split.html`.
- **Port:** eyebrow, headline, sub, CTA, and the `isp-*` illustration composition.
- **Note:** **the rename is name-only — `cmp-illustration-split` IS insight-split.** Verified: the block's interior is the same `isp-grid` / `isp-copy` / `isp-comp` / `isp-blob` / `isp-cta` family the page already uses, and `cmp-insight-split` has no ds.css zone (MIGRATION records it as a pure rename). "use insight split" is therefore satisfied by keeping the insight-split design under its current name. Page-only `isp-*` extras (`isp-tile`, `isp-spark s1/s2`, `isp-stage`) are content of the illustration — rule (i), they carry over.

**g56 · `cmp-trusted-partners-grid` → `logo-wall` — 1 section (`smartscf-v2`)** — *"ok for proposal but keep the original content"*
- **Emit:** `<section class="cmp cmp-logo-wall is-cols-4 surface-<own> section-y">` ← `blocks/logo-wall.html` (`is-cols-4` = `--lw-cols: 4`; Mobile-columns axis as the original renders).
- **Port:** all 8 `tpg-cell` logos with their `alt` text. Marquee variant only if the original scrolled — it does not.

**g58 · `cmp-link-directory` → `link-directory` — 1 section (`api-banking-v2`)** — *"ok for proposal but keep the original content"*
- **Emit:** `<section class="cmp cmp-link-directory surface-<own> section-y">` ← `blocks/link-directory.html`.
- **Port:** all 3 `ld-col` / `ld-col-h` columns and **every** link in them.

**g59 · `(anonymous root)` → `ecosystem-devices` — 1 section (`api-banking-v2`)**
*Ruling: "ok for proposal but keep the original content and for the image keep the one from suggestions"*
- **Emit:** `<section class="cmp cmp-ecosystem eco-fb">` ← paste `blocks/ecosystem-devices.html` (this fixes the anonymous root).
- **Port:** headline "One connected ecosystem." + every card: `card-panel is-hover` + `icon-tile` + `type-h6` / `type-caption` + `btn btn-text btn-sm` (replacing `eco-fb-ico/nm/ds/mo`).
- **Note:** **"the image from suggestions" = the proposed block's own asset, `/assets/images/ecosystem.png`** (332 kb, exists) — not the page's current image. This is the one place a ruling prefers the block's media over the page's. See **WI-3**.

**g65 · `cmp-solutions-awards` → `solutions-awards` — 1 section (`global-loan-solutions-v2`)** — *"ok for proposal but keep the original content"*
- **Emit:** `<section class="cmp cmp-solutions-awards surface-<own> section-y">` ← `blocks/solutions-awards.html`.
- **Port:** all 5 `sa-logo` / `sa-logo-fill` awards with their captions.

**g67 · `cmp-modal` → `modal` — 1 section (`our-people-v2`)** — *"ok for proposal but keep the original content"*
- **Emit:** `<div class="cmp cmp-modal …">` ← paste `blocks/modal.html`.
- **Port:** **all 20 `op-modal-bio` bios and 10 portraits.** `.overlay` → `.modal-overlay`; `modal-close` → `btn btn-outline btn-icon btn-sm` + `.sr-only`; panel → `card-panel`. The `data-modal-open` hooks on the g30 people cards must keep matching.

**g69 · `cmp-pagination` → `pagination` — 1 section (`events-library`)** — *"ok for proposal but keep the original content"*
- **Emit:** `<nav class="cmp cmp-pagination …">` ← `blocks/pagination.html`.
- **Port:** the pager row as-is; `pg-*` → `pgn-*` where legacy names survive. `pg-go` dies with its zone (RTL restatement with it — §5.3).

---

### PRE-SHARD WORK ITEMS

Four items must land **before** the shard that contains them; three of them are single sections,
one is a library build. Nothing else in the recipes above is blocked.

**WI-1 · `statement-stats` left-side mockup → image render** *(g71, `payment-tracker`, shard 1)*
*Ruling: "left side should be built as a mockup as per original. We can make it an image render as well."*
The current left side is bespoke live UI: `as-media as-track` holding `tr-eyebrow` / `tr-row` /
`tr-amt` / `tr-badge` / `tr-steps` with `data-pt-track`, `data-pt-step="0..3"`, `data-pt-prog`.
**Build:** author the gpi tracker as a **block-level mock** (the pattern `devices-features`,
`static-banner`, `checkout-card`, `pos-terminal`, `browser-checkout`, `api-request`,
`payment-link`, `phone-checkout`, `chat-pay-invite` all follow), then capture it once as a
**transparent PNG at 2×** via the Playwright capture rig and drop it into `assets/images/device/`;
`as-media` then holds an `<img>` with the section's existing `role="img"` description as `alt`.
Per the device-image doctrine (MIGRATION: CSS device kits are DELETED in favour of renders),
regenerate the PNG through the rig whenever the mock changes.
**Open:** the capture rig is referenced by 9 catalog dossiers but **no rig script is committed**
(`scripts/` holds `verify.mjs`, `site-index.mjs`, `build-all-components.mjs`,
`browser-checks/` only). Either commit the rig or record the bake command with the asset.

**WI-2 · `laptop-showcase` device PNG** *(g47, `businessonline-x-v2`, shard 4)*
*Ruling: "use the PNG from the original"*
`assets/images/device/laptop-showcase.png` exists (309 kb) and is what `blocks/laptop-showcase.html`
references — the block comment says *"pages supply their own render"*. **Default: use that PNG**,
which unblocks the section today. **The one open reading:** if "from the original" means a
page-specific render, the source is the page's current screen image
`assets/images/businessonline-x/ls-screen-2026-08-04.jpg?v=1`, which would need a rig bake into a
device render. Confirm in one line before the shard-4 sweep; everything else on this section is
unblocked either way.

**WI-3 · `ecosystem-devices` image** *(g59, `api-banking-v2`, shard 4)*
*Ruling: "for the image keep the one from suggestions"* — use `/assets/images/ecosystem.png`
(the proposed block's own asset, 332 kb, exists). No bake needed; just confirm the absolute path
survives §5.1's path rewrite.

**WI-4 · BUILD the FAQ filter band** *(g70, `faqs`, shard 7)*
*Ruling: "we need to build this"* — the only ruling that is a build, not a transform.
**What exists today** (verified in `faqs-2026-07-20.html` + `assets/js/ds.js`):
- `ds.js` already owns a **generic** `data-filter` capability (root `[data-filter]`, `[data-filter-grid]`,
  `[data-filter-item]` + one `data-filter-<key>` per item, `select[data-filter-key]` or
  `button[data-filter-key][data-filter-value]`, `[data-filter-search]`, `[data-filter-reset]`,
  `[data-filter-count]`, `[data-filter-empty]`; AND across keys, OR within a key).
- `ds.css` has the `.filter-bar` / `.filter-chips` / `.filter-chip` / `.filter-search` /
  `.filter-count` / `.filter-empty` utilities.
- `blocks/filter-grid.html` is the registered DEMO of that capability — but it filters items
  **inside its own root**.
**What is missing — the actual gap:** on `faqs` the controls and the items live in **two different
sections** (band §3 filters accordions in §4), so the page hangs `data-filter` on `<main id="main">`
and reaches across. The result is half-wired: the **category buttons are anchor jump-links, not
filter controls**; the accordion rows carry `data-filter-item` but **no `data-filter-<key>`**; there
is **no `data-filter-count`, no `data-filter-empty`, no `data-filter-reset`**; only free-text search
actually filters.
**Build (library-level, not page-level — filtering is a COMMON DS capability, never bespoke per page):**
1. A **filter-bar band composition** whose `data-filter` root legitimately spans the controls **and**
   the filtered region — either a single section holding both, or a documented "controls + target"
   contract so the root is never `<main>` and never an `id`.
2. Category chips as real controls: `button.filter-chip[data-filter-key="category"][data-filter-value="…"]`
   + `aria-pressed`, with an **All** chip (`value=""`), styled `btn btn-sm btn-outline-light` on a
   navy band; each accordion row gets `data-filter-category="…"`.
3. Wire `[data-filter-count]`, `[data-filter-empty]` and `[data-filter-reset]` — the capability
   supports all three and the page uses none.
4. Register the block, add its catalog dossier, add a glossary row, and keep `filter-grid` as the
   in-section demo of the same capability.
Until this lands, `faqs` §3 stays CUSTOM-KEEP and the page is swept **without** it.

**Standing ASSET obligation (not a blocker, but shard-4/5 scoped):** the 7 `feature-scroll-story`
sections (g14) each need 3–4 baked 2× transparent device PNGs per the glossary bake recipe. That is
7 of the map's 8 ASSET sections; the 8th (g47) is resolved by WI-2.

---

## LANDING PAGES EXTENSION (ruled into scope 2026-09-02)

> Hakan answered §0's scope question: **the nine section-landing pages are IN.** The estate is
> **60 pages, not 51.** This section inventories the nine in the same per-page format as §1.
> **READ-ONLY artefact** — nothing but this file was touched, nothing committed.
>
> **Key difference from the §1 inventory:** every section here is matched **first** against the
> **DECISIONS (Hakan, 2026-09-02)** ledger + **SWEEP RECIPES** above. A section whose pattern is
> already ruled is flagged **OK-RULED** and cites the group id — it needs no new judgment. Only a
> pattern with **no ruling anywhere** is flagged **NEEDS-JUDGING**, and carries a *model-proposed*
> target. Per the visual-judging doctrine, proposals are proposals: **Hakan judges.** Nothing here
> was transformed.

### The nine — how the list was derived

The criterion (from §0): *latest-version landing/overview pages linked from `site-index.html` that
were excluded from the 51.* `site-index.html` reaches them two ways, neither of which is an
`a.sx-link`, which is why the strict extraction missed them:

- **8 × `h2.sx-group-title > a`** — one per site-index group. Verified at `site-index.html`
  lines **75, 95, 109, 133, 148, 159, 173, 188** (line 209, "Missing pages", carries no anchor).
- **1 × the home hero link** — `corporate-institutional-v2-2026-08-25.html` at
  `site-index.html` lines **21** and **51**.

That is exactly the nine named in §0, no more and no less:

| # | page | site-index role | sections | kb | gate WARN | effort |
|---|---|---|---|---|---|---|
| **P1** | `corporate-institutional-v2-2026-08-25.html` | home / hero link (L21, L51) | 17 | 109 | 7 | **L** (12) |
| **P2** | `payments-trade-finance-v2-2026-08-25.html` | group landing — Payments & Trade Finance (L75) | 11 | 82 | 1 | **M** (5) |
| **P3** | `lending-v3-2026-07-27.html` | group landing — Lending (L95) | 12 | 91 | 4 | **M** (8) |
| **P4** | `investment-banking-v2-2026-08-10.html` | group landing — Investment Banking (L109) | 11 | 84 | 7 | **M** (8) |
| **P5** | `markets-2026-07-20.html` | group landing — Markets (L133) | 11 | 78 | 2 | **M** (6) |
| **P6** | `islamic-finance-2026-08-11.html` | group landing — Islamic Finance (L148; **no child pages**) | 11 | 85 | 5 | **M** (6) |
| **P7** | `our-expertise-partnerships-2026-08-11.html` | group landing — Our Expertise & Partnerships (L159) | 11 | 77 | 4 | **M** (6) |
| **P8** | `insights-research-2026-07-20.html` | group landing — Insights & Research (L173) | 10 | 73 | 2 | **M** (7) |
| **P9** | `support-resources-2026-07-20.html` | group landing — Support & Resources (L188) | 8 | 67 | 4 | **M** (5) |
| | **Total** | | **102** | | **36** | **63 re-composes** |

*Effort uses §2.1's definition — sections needing hands-on work, i.e. everything except the
verbatim header / footer / CTA-band and the still-current blocks that need nothing.*

### Baseline facts that hold for all nine (verified, not assumed)

1. **Header / footer chrome is byte-identical to the 51's.** MD5 of the `<header class="cmp
   cmp-site-header ish-v4">…</header>` element is `c0f089a245` and of the
   `<footer class="cmp cmp-footer-option1 surface-grey">…</footer>` element is `11724152bf` on
   **all nine AND on the four canonical pages spot-checked** (`payments-v2-2026-08-25`,
   `fx-hub-2026-08-10`, `faqs-2026-07-20`, `our-people-v2-2026-08-16`). Per the addendum
   (*"drifted chrome = re-paste verbatim; byte-identical stays"*) → **byte-identical, nothing to
   do**; rule (vi) g01/g02 DO-NOT-TOUCH applies unchanged.
   *Recorded for completeness:* both page copies differ from the **block files** in the same two
   fixed ways across all 60 pages — the header's `class="is-active" aria-current="page"` on the
   "Personal" utility link, and the footer's fuller CIB link set (**21 `fo1-link`** vs the block
   demo's 19). That is a block-file-vs-estate delta that predates this sweep and is **identical on
   the 51**; it is not per-page drift and is **not** a work item for these nine.
2. **Zero inline `style=` on eight of the nine.** The exception is P1, with **8 sanctioned
   custom-property passes** (`style="--fill:92%"` ×1, `style="--h:…%"` ×7), all inside its §5
   map-stat overlay. Zero `<style>` blocks and zero page `id=`-on-a-`cmp`-root violations beyond
   the anchor ids the 51 also carry (5–13 per page; `payments-v2` = 5, `fx-hub` = 7 for scale).
3. **Asset paths are relative on all nine** (22–53 `="assets/…"` refs per page) → §5.1's
   absolute-path rewrite applies identically. Cache-bust is `?v=261159` on ds.css **and** ds.js on
   every one of the nine — in step with the estate.
4. **Gate: 0 FAIL naming any of the nine**, 36 WARN total (`node scripts/verify.mjs` on this
   branch, 2026-09-02 → `264 failure(s), 376 warning(s)` overall; the FAILs belong to dated twins
   and another agent's in-flight ds.css work, exactly as §0's baseline records).
5. **Six of the nine carry the identical cross-sell band** ("Explore the full range of corporate
   solutions", 4× `ct-card`): P2, P3, P5, P6, P7, P8 — one g05 emit, six applications.

---

### P1 · Home — `corporate-institutional-v2-2026-08-25.html`

*Home / site-index hero link · 17 sections · 109 kb · gate: **0 FAIL / 7 WARN** · inline `style=`: **0** (custom-prop `style="--…"`: 8, all in §5) · sweep effort: **L** (12 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (7)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-digital-tools-showcase is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-editorial-story is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-video-tabs is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-testimonials is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 5 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi) "Do not touch this at all"; byte-identical to the block-set chrome carried by all 60 pages | H: "Emirates NBD Bank Websites" · 14× `ish-col` · 12× `ish-site` · media: 14 img | **OK-RULED** (g01) |
| 2 | Hero, Video BG (Left)<br>`cmp cmp-hero-video-left surface-navy relative overflow-hidden min-h-screen flex items-end pt-28 pb-24` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` + Place `is-bottom`; keep the section's OWN wash atoms (rule i / J1); drop the page-authored Tailwind utils from the root | H: "The bank behind the region's ambition." · media: 1 video · 2× `hvl-grad-*` overlay divs | **OK-RULED** (g04, J1) |
| 3 | Our Capabilities, Digital Tools Showcase<br>`cmp cmp-digital-tools-showcase section-y` | `cards-carousel` → `cmp cmp-cards …` — root carries **no `surface-*`**, so rule (iii) keeps the default surface | H: "The full breadth of corporate banking." · 5× `dts-card` / `dts-card-title` · media: 5 data-bg, 8 svg | **OK-RULED** (g72) |
| 4 | Editorial Story<br>`cmp cmp-editorial-story surface-image` + `data-bg` | `hero-editorial` → `cmp cmp-hero is-bottom`; `data-bg` → media-cover, `es-stat*` → fact atoms, keep the section's own `ov ov-gradient-b ov-80 ov-black` | H: "Scale you can build on." · 3× `es-stat` / `es-stat-num` · media: 1 data-bg | **OK-RULED** (g61) — mid-page instance, same as the judged `sustainable-finance-v2` one (its §L556) |
| 5 | Proven leadership — World Map scroll-story<br>`cmp cmp-world-map hp-map-story surface-navy` | `world-map` under the unified map contract — `data-behavior="world-map"` + `data-mode="story"`; the glossary names **`cmp-world-map hp-map-story surface-navy`** as the canonical story form, so the `hp-map-story` axis is contract, not drift | H: "Global reach. Local intelligence." · 4× `map-stat-card` / `stat-n` / `stat-l` · 2× `map-cap` · the 8 sanctioned `style="--…"` passes live here | **OK-RULED** (g19) |
| 6 | Why Emirates NBD, Highlights Tiles<br>`cmp cmp-highlights-tiles surface-white section-y` | ~~`cards-icon`~~ **`cards-icon-linked`** (override v) — `cmp cmp-cards cards-icon-linked is-cols-4` | H: "Built to carry your most demanding work." · 4× `ht-tile` / `ht-icon` / `ht-tile-body` · media: 4 svg | **OK-RULED** (g11) |
| 7 | Feature Spotlight<br>`cmp cmp-feature-spotlight surface-grey section-y` | `feature-spotlight` — **current block**, "ok with proposal" | H: "Run your whole relationship, online." · 2× `fsp-row` · 6× `fsp-check` · media: 2 data-bg | **OK-RULED** (g13) |
| 8 | Big Statement<br>`cmp cmp-big-statement surface-navy section-y` | `big-statement` — **current block**, "ok with proposal"; keeps its own navy (rule iii) | 3× `bst-l` / `bst-w` · 1× `bst-sub` | **OK-RULED** (g09) |
| 9 | (unnamed) video-backed scroll chapters<br>`cmp cmp-video-tabs surface-navy` | **PROPOSAL** — rename-in-place to `cmp cmp-video-chapters surface-navy` and paste `blocks/video-chapters.html`: the `vt-*` vocabulary is identical (`vt`, `vt-stage`, `vt-video-fill`, `vt-gradient`, `vt-layer`, `vt-content`, `vt-label`, `vt-heading`, `vt-bullets`, `vt-bullet`, `vt-suite`), `MIGRATION.md:535` records the 2026-09-01 rename, and ds.css has the `.cmp-video-chapters` zone. **No ledger line — Hakan judges.** | H: "Your command centre. One secure platform." · 7× `vt-bullets` / 28× `vt-bullet` · 6× `vt-suite` · media: 4 video | **NEEDS-JUDGING** (P-A) |
| 10 | Sector expertise, Industry Cards<br>`cmp surface-grey section-y` *(anonymous root)* | **PROPOSAL** — `cmp cmp-cards is-hover-zoom cards-thumb is-cols-3`, title-only cards (no desc, no CTA — the original has neither), `data-bg` per tile; this also fixes the anonymous root. Precedent: g05 (cards-thumb → cards) for the target, g33/g43/g59 for anonymous-root re-rooting. `hp-ind-grid`/`hp-ind-card` have ds.css declarations but **no block** and no ledger line — **Hakan judges.** | H: "Supporting the industries of tomorrow." · 6× `hp-ind-card` (label only) · media: 6 data-bg | **NEEDS-JUDGING** (P-B) |
| 11 | Testimonials, Centre Carousel<br>`cmp cmp-testimonials surface-white section-y` | `cards-testimonials-carousel` — "keep the content and images from the existing page" | H: "Trusted by the region's businesses" · 5× `tc-card` · 10× `tc-link` / `tc-ico` · media: 5 data-bg | **OK-RULED** (g35) |
| 12 | Our track record of delivery, Deal Timeline<br>`cmp cmp-history-timeline surface-white section-y` | `history-timeline` — "ok for proposal" | H: "Our track record of delivery." · 3× `ht-node` / `ht-year` / `ht-title` · 3× `badge` · media: 3 svg | **OK-RULED** (g36) |
| 13 | Awards & Recognition<br>`cmp cmp-solutions-awards surface-white section-y` | `solutions-awards` — "keep the original content" | H: "Recognised by the industry, year after year." · 3× `sa-logo` / `sa-logo-fill` · media: 4 svg | **OK-RULED** (g65) |
| 14 | Markets Articles, insights grid<br>`cmp cmp-cards-thumb-box is-cols-3 is-cta-text is-full-desc surface-grey section-y` | `cards-boxed` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-3` (`card-panel` + `--card-pad:0`); **drop `is-full-desc`** per J10 / g07-sub | H: "Thinking that moves business forward." · 3× `ct-card` / `ct-label` · media: 3 data-bg, 4 svg | **OK-RULED** (g07 + g07-sub) |
| 15 | FAQ, Accordion<br>`cmp cmp-accordion surface-white section-y` | `acc` → `cmp cmp-acc` as the SECTION root; body keeps the original's inner layout — "if it is simple text, use simple text" (J2) | H: "Frequently asked questions." · 5× `acc-inner` / `acc-pad` · media: 5 svg | **OK-RULED** (g08, J2) |
| 16 | CTA, Horizontal Marquee<br>`cmp cmp-cta-marquee surface-navy section-y` | `cta-marquee` — "ok for proposal"; per the glossary the closing heading is **`type-h1 on-surface`**, not `type-h2` | H: "Banking built for every ambition." · 10× `cm-item` | **OK-RULED** (g32) |
| 17 | Footer, Option 1<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

### P2 · Payments & Trade Finance — `payments-trade-finance-v2-2026-08-25.html`

*Group landing (site-index L75) · 11 sections · 82 kb · gate: **0 FAIL / 1 WARN** · inline `style=`: **0** · sweep effort: **M** (5 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (1)</summary>

- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

**The cleanest of the nine** — every retired root is already off this page; its only structural
debt is the `.ptf-dir` band and the loose modal wrapper.

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1 · Hero — Scroll Cinema<br>`cmp cmp-hero-cinematic-pinned surface-navy` | `hero-cinematic-pinned` — **current block**; atom pass only: `scin-h1`→`type-display-lg on-surface`, `scin-sub`→`type-body-lg on-surface-mid`, `scin-ghost`→`btn btn-outline-light btn-lg` | H: "Move money. Finance trade." · 3× `scin-phase` / `scin-inner` · 2× `scin-h2` / `scin-sub` | **OK-RULED** (g44) |
| 3 | 2 · Intro, side-by-side<br>`cmp cmp-intro-side-by-side surface-grey section-y` | `intro-side-by-side` — **current block**; J7(a): `type-h6 on-surface` / `type-body-sm on-surface-mid` on the pillar pair | H: "Payments and trade finance, built to move with you." · 3× `intro-pillar` / `ip-ic` / `ip-t` / `ip-d` · media: 3 svg | **OK-RULED** (g28, J7) |
| 4 | 4 · Bento — Expand (What we do)<br>`cmp cmp-bento-expand surface-white section-y` | `bento-expand` — **current block**; "keep the existing content and surface color" → rule (iii) keeps this one's **white**, not the ledger line's navy | H: "Multiple capabilities. One bank." · 3× `be-panel` / `be-eyebrow` / `be-title` / `be-detail` · media: 3 data-bg | **OK-RULED** (g29) |
| 5 | 6 · Big statement, Transaction Banking<br>`cmp cmp-big-statement surface-white section-y` | `big-statement` — **current block**, "ok with proposal"; keeps its own white | 3× `bst-l` / `bst-w` · 1× `bst-sub` (`is-center`) | **OK-RULED** (g09) |
| 6 | 7 · World Map, Animated Routes<br>`cmp cmp-world-map surface-grey section-y` | `world-map` — **current block**; unified map contract (`data-behavior="world-map"`) | H: "From Dubai to the world." · 4× route `n`/`l` pairs · media: 1 img | **OK-RULED** (g19) |
| 7 | 8 · Everything your treasury runs on + Product directory<br>`cmp surface-white section-y` *(anonymous root)*, `id="directory"` | `link-directory` → `cmp cmp-link-directory …` + `ld-grid` / `ld-col` / `ld-col-h`. **This is the exact source of the target block**: ds.css's `.cmp-link-directory` zone header records it was *"formalized 2026-08-27 from the `.ptf-dir` drift"*, and `.ld-*` reproduces `.ptf-dir`'s rules 1:1. Carries the section-head atoms already | H: "Everything your treasury runs on." · 3 columns × `ptf-dir-h` + link lists · **3 links carry `data-modal-open` → emit with §11** | **OK-RULED** (g58) |
| 8 | 9 · Unlock new possibilities<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-4`. NB `blocks/cards-thumb.html` is the HIDDEN legacy twin — never emit it | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg, 4 svg | **OK-RULED** (g05) |
| 9 | 11 · CTA, Horizontal Marquee<br>`cmp cmp-cta-marquee surface-navy section-y` | `cta-marquee` — "ok for proposal"; closing heading = `type-h1 on-surface`. **This page has no `cta-band`** — the marquee is the finale | H: "Ready to move forward?" · 10× `cm-item` | **OK-RULED** (g32) |
| 10 | Footer, Option 1<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |
| 11 | Trade product pop-ups<br>`cmp-modal` *(root missing the `cmp` prefix and any surface class)* | `modal` → paste `blocks/modal.html`'s root `cmp cmp-modal surface-grey section-y`; the 5 `.overlay.overlay-pad` panels port as-is (`modal-content-body-plain` variant). "keep the original content" | 5 panels · H: "Letters of Credit" + 4 more · `modal-lead` / `modal-list` / `modal-actions` each · triggers live in §7 | **OK-RULED** (g67) |

### P3 · Lending — `lending-v3-2026-07-27.html`

*Group landing (site-index L95) · 12 sections · 91 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** · sweep effort: **M** (8 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-impact-stats is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN pos-ways (Ways to Accept) is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1. HERO, Scroll Text Fade<br>`cmp cmp-hero-text-fade surface-navy` | **PROPOSAL** — keep `hero-text-fade` and do an atom pass only. `blocks/hero-text-fade.html` **exists**, ds.css has 15 `.cmp-hero-text-fade` / 12 `.sth-*` declarations, `library.js` lists it as **"Hero — Text Fade", `v4: true`, impact `showpiece`**, and the gate does **not** WARN on it — it is a current block, not retired markup. Precedent: **g44**, where the other pinned-scroll hero (`hero-cinematic-pinned`) was kept rather than folded into `hero`. **No ledger line — Hakan judges** (the only open question is whether J1's "use `cmp cmp-hero surface-navy`" was meant to swallow scroll-driven heroes too). | H: "Corporate lending, built around your needs." · 3× `sth-bg` / `sth-cap` / `sth-title` / `sth-sub` · `data-behavior="scroll-story" data-scrub-vh="340"` · media: 3 data-bg | **NEEDS-JUDGING** (P-C) |
| 3 | 2. STRENGTH, stats band<br>`cmp cmp-impact-stats surface-grey section-y` | `stats-row` — "keep the existing content and surface color" → rule (iii) keeps this one's **grey** | H: "The region's strongest balance sheet, behind your growth." · 4× `is-stat` / `is-num` / `is-label` | **OK-RULED** (g45) |
| 4 | 3. OUR CLIENTS, Highlights Tiles (4-up)<br>`cmp cmp-highlights-tiles surface-white section-y` | ~~`cards-icon`~~ **`cards-icon-linked`** (override v) — `is-cols-4` | H: "Capital for institutional and corporate clients of every size" · 4× `ht-tile` / `ht-icon` / `ht-tile-body` · media: 4 svg | **OK-RULED** (g11) |
| 5 | 4. INDUSTRIES, image cards (12)<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb`. **12 cards** — rule (iv): the original's count wins, this is not a 4-up | H: "Purpose-built solutions for strategic growth." · 12× `ct-card` / `ct-title` / `ct-desc` · media: 12 data-bg | **OK-RULED** (g05) |
| 6 | 5. RELATED SOLUTIONS, 2 image link cards<br>`cmp cmp-cards-thumb is-cta-text is-cols-2 surface-white section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-2`; carry the `is-cta-text` CTA style (rule ii — the CTAs exist, keep them) | H: "Where lending goes further." · 2× `ct-card` / `ct-eyebrow` · media: 2 data-bg, 2 svg | **OK-RULED** (g05) |
| 7 | 6. WHY ENBD, numbered reasons (5)<br>`cmp surface-grey section-y` *(anonymous root)*, `.pos-ways > .pos-way` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked …` (this also fixes the anonymous root). Doubly ruled: g33's own recognition rule is *"the 3 `pos-way` triads — icon, title, body, link"*, and `MIGRATION.md:525` maps `pos-ways`/`pos-way` (Ways to Accept) → **Cards — Icon Linked**. Interior head is already g22-canonical (`section-head is-split` + `sh-lead` sibling). **5** cards → rule (iv), the original's count wins. Trailing CTA `a.btn.btn-navy.btn-lg` → rebase to the v4 button doctrine (`btn-accent`/`btn-filled`), keep the CTA (rule ii) | H: "Intelligence, stability and partnership." · 5× `pos-way` / `pos-ico` + copy · 1 CTA · media: 5 svg | **OK-RULED** (g33) |
| 8 | 7. SUCCESS STORY, Feature Spotlight<br>`cmp cmp-feature-spotlight surface-navy section-y` | `feature-spotlight` — **current block**, "ok with proposal"; keeps its own navy | H: "Our first aircraft finance lease." · 2× `fsp-row` / `fsp-title` · media: 2 data-bg | **OK-RULED** (g13) |
| 9 | 8. INSIGHTS & NEWS, image cards (4)<br>`cmp cmp-cards-thumb-box surface-white section-y` | `cards-boxed` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-4` (`card-panel` + `--card-pad:0`) | H: "The latest from Emirates NBD." · 4× `ct-card` / `ct-eyebrow` / `ct-title` · media: 4 data-bg | **OK-RULED** (g07) |
| 10 | 9. UNLOCK, cross-links (4-up)<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-4` | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg, 4 svg | **OK-RULED** (g05) |
| 11 | 10. CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** (the block root IS `cmp ptf-ctaband surface-navy section-y`); "keep the content from the existing page" | H: "Let's move forward, together." · `ptf-ctarow` | **OK-RULED** (g03) |
| 12 | /10. CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

### P4 · Investment Banking — `investment-banking-v2-2026-08-10.html`

*Group landing (site-index L109) · 11 sections · 84 kb · gate: **0 FAIL / 7 WARN** · inline `style=`: **0** · sweep effort: **M** (8 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (7)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-bento-spotlight is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-editorial-story is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-key-transactions is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-people-carousel is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1. HERO, Cinematic<br>`cmp cmp-hero-video-left surface-navy relative overflow-hidden min-h-screen flex items-end pt-28 pb-24` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` + Place `is-bottom`; keep the section's own `ov ov-black ov-tint ov-70` (rule i / J1); drop the root's Tailwind utils | H: "Your ambition, powered by our network." · media: 1 video | **OK-RULED** (g04, J1) |
| 3 | 2. LEAGUE TABLES, Bento — Spotlight<br>`cmp cmp-bento-spotlight surface-white section-y` | `bento-spotlight` — "ok with proposal, but keep the existing content"; keeps its own white (rule iii) | H: "Ranked among the region's leading arrangers." · 7× `bs-tile` / `bs-glow` · 4× `bs-stat-num` / `bs-stat-lbl` · media: 1 data-bg, 2 svg | **OK-RULED** (g16) |
| 4 | 3. WHO WE SERVE (4-up)<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-4` | H: "Solutions tailored to every ambition." · 4× `ct-card` / `ct-title` / `ct-desc` · media: 4 data-bg | **OK-RULED** (g05) |
| 5 | scroll-story (pinned image swaps per item)<br>`cmp cmp-scroll-tab surface-white section-y`, `data-behavior="scroll-tab" data-scroll-pinned id="capabilities"` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; `ss-*` inners carry over | H: "A complete suite across raising, structuring and servicing capital." · 5× `ss-step` / `ss-name` / `ss-desc` · media: 10 data-bg | **OK-RULED** (g12) |
| 6 | 5. GLOBAL NETWORK, Editorial Story (bg video)<br>`cmp cmp-editorial-story surface-navy` | `hero-editorial` → `cmp cmp-hero is-bottom`; keep the section's three `.ov` atoms and the real `<video>` — "keep the content **and video** from the existing page" | H: "Anchored in the region. Connected to the world." · 4× `es-stat` / `es-stat-num` · media: 1 video | **OK-RULED** (g61) |
| 7 | 6. INSIGHTS, case-study cards (4)<br>`cmp cmp-cards-thumb-box is-cta-text surface-grey section-y` | `cards-boxed` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-4`; carry the `is-cta-text` CTAs (rule ii) | H: "Landmark deals, up close." · 4× `ct-card` / `ct-label` / `ct-title` · media: 4 data-bg, 4 svg | **OK-RULED** (g07) |
| 8 | 7. TOMBSTONES, Key Transactions<br>`cmp cmp-key-transactions surface-white section-y` | **`fact-grid`** — override (v) of MIGRATION §3's `cards-tombstones` route; J11 | H: "A track record you can see at a glance" · 8× `kt-cell` / `kt-type` / `kt-client` / `kt-amount` / `kt-year` | **OK-RULED** (g53, J11) |
| 9 | 8. OUR PEOPLE, Leaders/Experts carousel<br>`cmp cmp-people-carousel surface-grey section-y` | `cards-people-carousel` — "keep the content … from the existing page" | H: "The specialists behind every mandate." · 10× `pc-card` / `pc-name` / `pc-role` · 2× `pc-tab` (`data-tabs`) · media: 10 data-bg, 4 svg | **OK-RULED** (g38) |
| 10 | 10. CTA Band<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** | H: "Let's move forward, together." | **OK-RULED** (g03) |
| 11 | /10. CTA Band<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

### P5 · Markets — `markets-2026-07-20.html`

*Group landing (site-index L133) · 11 sections · 78 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** · sweep effort: **M** (6 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy relative overflow-hidden min-h-screen flex items-end pt-28 pb-24` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` + Place `is-bottom`; keep the section's own `hvl-grad-left` / `hvl-grad-top` washes as `.ov` atoms (rule i / J1) | H: "Navigate markets with precision and agility." · media: 1 video | **OK-RULED** (g04, J1) |
| 3 | 2. STRENGTHS<br>`cmp cmp-content-block-sidebyside surface-white section-y` | `content-block-sidebyside` — "use our generic content component but build with atoms properly"; the 6 `badge badge-neutral` pills stay atoms | H: "Six trading hubs, one connected desk." · 6× `badge badge-neutral` | **OK-RULED** (g06) |
| 4 | 3. WHY EMIRATES NBD<br>`cmp cmp-bento-expand surface-grey section-y` | `bento-expand` — **current block**; rule (iii) keeps this one's **grey** | H: "Three reasons to trade with us." · 3× `be-panel` / `be-eyebrow` / `be-title` / `be-detail` · media: 3 data-bg | **OK-RULED** (g29) |
| 5 | 4. PRODUCT OFFERING<br>`cmp cmp-cards-thumb-box is-cols-2 is-full-desc surface-white section-y` | `cards-boxed` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-2`; **drop `is-full-desc`** per J10 / g07-sub | H: "Execution that delivers." · 2× `ct-card` · 2× `badge badge-solid` · media: 2 data-bg | **OK-RULED** (g07 + g07-sub) |
| 6 | 5. TREASURY SOLUTIONS — Zoom Parallax<br>`cmp cmp-zoom-parallax surface-navy`, `data-behavior="zoom-parallax"` | **PROPOSAL** — keep `zoom-parallax` and do an atom pass only. `blocks/zoom-parallax.html` **exists**, ds.css has 9 `.cmp-zoom-parallax` declarations, `library.js` registers it (**"Zoom Parallax", impact `showpiece`**, and in the HEAVY + scroll-slug sets), and the gate does **not** WARN on it. Precedent: **g50** (`coverflow-carousel`, "ok with proposal but keep the existing content") — the other single-instance showpiece scroll component. **No ledger line — Hakan judges.** | H: "Solutions shaped around your risk and objectives." · 7× `px-item` / `px-card` / `px-img` · media: 7 data-bg | **NEEDS-JUDGING** (P-D) |
| 7 | 6. DIGITAL CAPABILITIES<br>`cmp cmp-cards-thumb-box is-cta-text is-full-desc surface-white section-y` | `cards-boxed` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-4`; carry the `is-cta-text` CTAs (rule ii); **drop `is-full-desc`** (J10) | H: "Trade and hedge on your terms." · 4× `ct-card` / `ct-title` / `ct-desc` · media: 4 data-bg, 4 svg | **OK-RULED** (g07 + g07-sub) |
| 8 | 7. RESEARCH<br>`cmp cmp-cards-thumb-box is-cols-3 is-cta-text is-full-desc surface-grey section-y` | `cards-boxed` → `… is-cols-3`; **drop `is-full-desc`** (J10) | H: "Stay ahead with global insights." · 3× `ct-card` / `ct-label` · media: 3 data-bg, 4 svg | **OK-RULED** (g07 + g07-sub) |
| 9 | 8. CROSS-SELL<br>`cmp cmp-cards-thumb surface-white section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-4` | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg | **OK-RULED** (g05) |
| 10 | 9. CTA<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical**; this instance also carries a `sh-lead`-style sub-line, port it (rule i) | H: "Build your treasury strategy with us." | **OK-RULED** (g03) |
| 11 | /9. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

### P6 · Islamic Finance — `islamic-finance-2026-08-11.html`

*Group landing (site-index L148 — the ONLY group with no child `sx-link` rows, so this page is the whole group) · 11 sections · 85 kb · gate: **0 FAIL / 5 WARN** · inline `style=`: **0** · sweep effort: **M** (6 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (5)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-kicker-cards is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1. HERO — Video Left<br>`cmp cmp-hero-video-left surface-navy relative overflow-hidden min-h-screen flex items-end pt-28 pb-24` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` + Place `is-bottom`; keep the section's own washes (rule i / J1) | H: "Principled finance. Designed for growth." · media: 1 video | **OK-RULED** (g04, J1) |
| 3 | 2. INTRO<br>`cmp cmp-intro-side-by-side surface-white section-y` | `intro-side-by-side` — **current block**; J7(a) atom pair | H: "Finance rooted in Islamic values." · `intro-lead` + a chip row | **OK-RULED** (g28, J7) |
| 4 | 3. ISLAMIC DEPOSIT PRODUCTS<br>`cmp cmp-kicker-cards surface-grey section-y` | ~~`cards-kicker`~~ **`cards-icon-linked`** (override v — "use Cards — Icon Linked"); **5** cards → rule (iv), the original's count wins | H: "Manage your money the Shariah-compliant way." · 5× `kc-card` / `kc-title` / `kc-body` | **OK-RULED** (g10) |
| 5 | 4. ISLAMIC TRADE FINANCE<br>`cmp cmp-bento-expand surface-white section-y` | `bento-expand` — **current block**; rule (iii) keeps its **white** | H: "Expert Islamic trade support for stronger supply chains." · 3× `be-panel` / `be-eyebrow` / `be-title` / `be-detail` · media: 3 data-bg | **OK-RULED** (g29) |
| 6 | 5. FINANCING — Scroll Tab (pinned image swaps)<br>`cmp cmp-scroll-tab surface-grey section-y`, `data-behavior="scroll-tab" data-scroll-pinned` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; the long `ss-points` already ride `list-check` — keep them | H: "Financing structured to fit how you grow." · 7× `ss-step` / `ss-name` / `ss-desc` / `list-check` · media: 14 data-bg | **OK-RULED** (g12) |
| 7 | 6. INVESTMENT BANKING / SUKUK<br>`cmp cmp-kicker-cards is-glass is-cols-2 surface-image section-y relative overflow-hidden` + `data-bg` | **`cards-icon-linked`** (override v) `is-cols-2`; rule (iii) keeps `surface-image` + the section's own `ov ov-black ov-tint ov-70`. **Normalization note:** `is-glass` has **0 declarations in ds.css** — it renders as nothing today; on an image/dark surface the canonical card is `cd-card card-clear` (its border rides `var(--on-surface-border)`), so the glass look is delivered by the card axis, not by resurrecting `is-glass` | H: "Investment banking backed by market-leading Sukuk insight." · 2× `kc-card` / `kc-kicker` / `kc-title` / `kc-body` · media: 1 data-bg | **OK-RULED** (g10) |
| 8 | 7. FAQs, accordion<br>`cmp cmp-accordion surface-white section-y` | `acc` → `cmp cmp-acc` as the SECTION root; body keeps the original's inner layout (J2 — "if it is simple text, use simple text") | H: "Islamic deposits, answered." · 5× `acc-inner` / `acc-pad` · media: 5 svg | **OK-RULED** (g08, J2) |
| 9 | 8. CROSS-SELL<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-4` | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg, 4 svg | **OK-RULED** (g05) |
| 10 | 9. CTA<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** | H: "Let's move forward, together." | **OK-RULED** (g03) |
| 11 | /9. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

### P7 · Our Expertise & Partnerships — `our-expertise-partnerships-2026-08-11.html`

*Group landing (site-index L159) · 11 sections · 77 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** · sweep effort: **M** (6 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-scroll-tab is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-tombstone-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left surface-navy relative overflow-hidden min-h-screen flex items-end pt-28 pb-24` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` + Place `is-bottom`; keep the section's own washes (rule i / J1) | H: "Your ambition, powered by our network." · media: 1 video | **OK-RULED** (g04, J1) |
| 3 | 2. INTRO / PURPOSE<br>`cmp cmp-intro-side-by-side surface-white section-y` | `intro-side-by-side` — **current block**; J7(a) atom pair | H: "One relationship, the full breadth of Corporate & Institutional Banking." · `intro-lead` | **OK-RULED** (g28, J7) |
| 4 | 3. SUPPORT — Scroll Tab (pinned image swaps)<br>`cmp cmp-scroll-tab surface-grey section-y`, `data-behavior="scroll-tab" data-scroll-pinned` | `scroll-showcase` → `cmp cmp-scroll-showcase` + `data-behavior="scroll-showcase"` + `data-scroll-pinned`; this instance has per-step CTAs (`ss-cta`) — keep them (rule ii) | H: "Your relationship with us is personal…" · 5× `ss-step` / `ss-name` / `ss-desc` / `ss-cta` · media: 10 data-bg | **OK-RULED** (g12) |
| 5 | 4. TRACK RECORD / TOMBSTONES<br>`cmp cmp-tombstone-grid is-cols-3 surface-white section-y` | `cards-tombstones`; rule (iv) — carry the original's **3** columns, not four | H: "Our track record of successful execution." · 3× `tomb-card` / `tomb-amount` / `tomb-lines` / `tomb-foot` | **OK-RULED** (g17) |
| 6 | 5. SUCCESS STORIES<br>`cmp cmp-cards-thumb-box is-cta-text is-full-desc surface-grey section-y` | `cards-boxed` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-4`; carry the CTAs (rule ii); **drop `is-full-desc`** (J10) | H: "Landmark deals across the region's capital markets." · 4× `ct-card` / `ct-label` · media: 4 data-bg, 4 svg | **OK-RULED** (g07 + g07-sub) |
| 7 | 6. PARTNERS<br>`cmp surface-navy section-y relative overflow-hidden` *(anonymous root)* + `span.gls-map` dotted map | **CUSTOM-KEEP** — g20's signature exactly: navy band + `section-head is-split` + badge pills, ruling *"ok with the proposal"* = keep as-is. Two per-instance notes: the pills here are `badge border on-surface-border` (not `badge-solid`), and the band also carries a trailing CTA row (`btn-primary` + `btn-outline-light`) — both stay (rule i/ii). **RTL spot-check required** at `?dir=rtl` (§5.3) — this is one of the sections the sweep does not re-derive from a block | H: "Partnering with industry leaders." · 5× `badge` · 1 CTA row (2 buttons) · media: 1 data-bg (dotted map) | **OK-RULED** (g20, J6) |
| 8 | 7. OUR PEOPLE<br>`cmp cmp-cards-thumb-nobox is-portrait surface-white section-y` | `cards-people`. *Disambiguation:* the ledger rules `cmp-cards-thumb-nobox` twice — → `cards-people` (g30) and → `cards-plain` (g62). `is-portrait` + people content puts this instance on **g30** | H: "The people behind the partnership." · 4× `ct-card` / `ct-title` / `ct-desc` · media: 4 data-bg | **OK-RULED** (g30) |
| 9 | 8. SOLUTIONS CROSS-SELL<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-4` | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg, 4 svg | **OK-RULED** (g05) |
| 10 | 9. CTA<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** | H: "Let's move forward, together." | **OK-RULED** (g03) |
| 11 | /9. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

### P8 · Insights & Research — `insights-research-2026-07-20.html`

*Group landing (site-index L173) · 10 sections · 73 kb · gate: **0 FAIL / 2 WARN** · inline `style=`: **0** · sweep effort: **M** (7 re-composes) · chrome: **byte-identical***

<details><summary>gate lines naming this page (2)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1. HERO — Video BG (Left)<br>`cmp cmp-hero-video-left surface-navy relative overflow-hidden min-h-screen flex items-end pt-28 pb-24` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` + Place `is-bottom`; keep the section's own washes (rule i / J1). **This hero also carries a `nav.hvl-quick` in-page jump list (4× `hvl-quick-t`/`-d`)** — port it into the hero's slot, nothing dropped (rule i) | H: "Intelligence that powers smarter decisions." · 4× `hvl-quick-t` / `hvl-quick-d` · media: 1 video | **OK-RULED** (g04, J1) |
| 3 | 2. INTRO<br>`cmp surface-white section-y` *(anonymous root)* | **"use our generic content component but build with atoms properly"** — keep the band, rebuild the interior from canonical atoms: `section-head is-split` with the lead as an `.sh-lead` SIBLING of `.ds-stack`. **RTL spot-check** (§5.3) | H: "Sector-specific expertise and analysis." · `measure` + `sh-lead` prose | **OK-RULED** (g22) |
| 4 | 3. ARTICLES<br>`cmp cmp-cards-thumb-box is-cols-3 is-cta-text is-full-desc surface-grey section-y` | `cards-boxed` → `… is-cols-3`; carry the CTAs (rule ii); **drop `is-full-desc`** (J10) | H: "The latest from our economists." · 3× `ct-card` / `ct-label` · media: 3 data-bg, 4 svg | **OK-RULED** (g07 + g07-sub) |
| 5 | 4. FEATURED SUCCESS STORY<br>`cmp surface-image section-y relative overflow-hidden` *(anonymous root)* + `data-bg` | g22 again — keep the band on its own `surface-image` + its two `.ov` atoms, rebuild the interior from atoms. **Interior spec:** `MIGRATION.md:417` retires `.stat-card`/`.stat-card-n`/`.stat-card-l` in favour of **`card-panel` + `ds-num` + a label** ("composition, not a class; retires at the sweep"). **RTL spot-check** (§5.3) | H: "Another landmark IPO for the DFM and UAE." · 2× `stat-card` / `stat-card-n` / `stat-card-l` · media: 1 data-bg | **OK-RULED** (g22) |
| 6 | 5. SUCCESS STORIES GRID<br>`cmp cmp-cards-thumb-box is-cta-text surface-grey section-y` | `cards-boxed` → `… is-cols-4`; carry the CTAs (rule ii) | H: "Transactions that moved the market." · 4× `ct-card` / `ct-label` / `ct-eyebrow` · media: 4 data-bg, 5 svg | **OK-RULED** (g07) |
| 7 | 6. NEWS & EVENTS<br>`cmp cmp-cards-thumb-box is-cta-text surface-white section-y` | `cards-boxed` → `… is-cols-4`; carry the CTAs (rule ii) | H: "Where our specialists take the stage." · 4× `ct-card` / `ct-eyebrow` · media: 4 data-bg | **OK-RULED** (g07) |
| 8 | 7. SOLUTIONS CROSS-SELL<br>`cmp cmp-cards-thumb surface-grey section-y` | `cards` → `cmp cmp-cards is-hover-zoom cards-thumb is-cols-4` | H: "Explore the full range of corporate solutions." · 4× `ct-card` · media: 4 data-bg, 4 svg | **OK-RULED** (g05) |
| 9 | 8. CTA<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical** | H: "Let's move forward, together." | **OK-RULED** (g03) |
| 10 | /8. CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

### P9 · Support & Resources — `support-resources-2026-07-20.html`

*Group landing (site-index L188) · 8 sections · 67 kb · gate: **0 FAIL / 4 WARN** · inline `style=`: **0** · sweep effort: **M** (5 re-composes) · chrome: **byte-identical** · smallest of the nine*

<details><summary>gate lines naming this page (4)</summary>

- WARN cmp-hero-video-left is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-pillar-grid is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN cmp-highlights-tiles is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)
- WARN 4 colour literal(s) in markup/styles — will not follow brand themes (legacy debt)

</details>

| # | section (root / marker) | → target block / composition | content to port | flag |
|---|---|---|---|---|
| 1 | —<br>`cmp cmp-site-header ish-v4` | `site-header-v4` — **NO RECIPE**, rule (vi); byte-identical | H: "Emirates NBD Bank Websites" · 14× `ish-col` · media: 14 img | **OK-RULED** (g01) |
| 2 | 1. HERO<br>`cmp cmp-hero-video-left relative overflow-hidden min-h-screen flex items-end pt-28 pb-24 surface-navy` | `hero` → `cmp cmp-hero surface-navy` + `video.media-cover` + Place `is-bottom`; keep the section's own `ov ov-black ov-tint ov-65` (rule i / J1) | H: "Intelligent support, wherever you are." · media: 1 video | **OK-RULED** (g04, J1) |
| 3 | 2. QUICK LINKS<br>`cmp cmp-pillar-grid is-cols-4 surface-white section-y` | `cards-icon-linked` → `cmp cmp-cards cards-icon-linked is-cols-4` — "keep four columns" is literal here, the original renders 4-up. `pg-go` dies with its ds.css zone, RTL restatement with it (§5.3) | H: "Four ways to get help, fast." · 4× `pg-card` / `pg-icon` / `pg-name` / `pg-desc` / `pg-go` · media: 4 svg | **OK-RULED** (g18) |
| 4 | 3. DIGITAL HELP & TUTORIALS<br>`cmp cmp-cards-thumb-box surface-grey section-y` | `cards-boxed` → `cmp cmp-cards is-hover-zoom cards-boxed is-cols-4` (`card-panel` + `--card-pad:0`) | H: "Learn the platform at your own pace." · 4× `ct-card` / `ct-title` / `ct-desc` · media: 4 data-bg | **OK-RULED** (g07) |
| 5 | 4. FORM CENTRE<br>`cmp surface-white section-y` *(anonymous root)* + `dl-row` rows | **"use our generic content component but build with atoms properly"** — plain `cmp surface-*` band, canonical `section-head`, and the `dl-row` molecule (minted 2026-08-29, registered LIGHT ISLAND) for the rows. Atoms only. **RTL spot-check** (§5.3) | H: "Form centre." · 3× `dl-row` / `dl-ico` / `dl-name` / `dl-meta` · media: 3 svg | **OK-RULED** (g40) |
| 6 | 5. SUPPORT + FRAUD<br>`cmp cmp-highlights-tiles surface-grey section-y` | ~~`cards-icon`~~ **`cards-icon-linked`** (override v); **2** tiles → rule (iv), the original's count wins; the tiles carry `ht-cta` links — keep them (rule ii) | H: "Help and protection, when it matters." · 2× `ht-tile` / `ht-icon` / `ht-tile-body` / `ht-cta` · media: 2 svg | **OK-RULED** (g11) |
| 7 | 6. CLOSING CTA<br>`cmp ptf-ctaband surface-navy section-y` | `cta-band` — **already canonical**; port the sub-line too (rule i) | H: "Still need a hand?" | **OK-RULED** (g03) |
| 8 | /7. CLOSING CTA<br>`cmp cmp-footer-option1 surface-grey` | `footer-option1` — **NO RECIPE**, rule (vi); byte-identical | 21× `fo1-link` · media: 8 svg | **OK-RULED** (g02) |

---

## LANDING-PAGES SUMMARY

### Totals

| | |
|---|---|
| pages | **9** (the estate becomes **60**, and **554 sections**) |
| sections inventoried | **102** |
| sections **OK-RULED** by an existing group | **98** |
| sections **NEEDS-JUDGING** | **4** |
| **ruled coverage** | **98 / 102 = 96.1 %** |
| distinct recipe groups exercised | **35** + the `is-full-desc` sub-item (g01, g02, g03, g04, g05, g07 + g07-sub, g08, g09, g10, g11, g12, g13, g16, g17, g18, g19, g20, g22, g28, g29, g30, g32, g33, g35, g36, g38, g40, g44, g45, g53, g58, g61, g65, g67, g72) |
| hands-on re-composes (§2.1 definition) | **63** |
| effort split | **1 L** (P1) · **8 M** · 0 S |
| gate | **0 FAIL naming any of the nine**; 36 WARN, all page-level work items in the tables above |
| chrome | **18 / 18 header+footer sections byte-identical** → rule (vi) DO-NOT-TOUCH, zero work |

**Why coverage is this high:** the nine were built from the same block vocabulary as their child
pages — the top five source patterns here (`cards-thumb` ×9, `cards-thumb-box` ×11,
`hero-video-left` ×6, `cta-band` ×7, `cmp-accordion`/`bento-expand`/`intro-side-by-side`) are the
same ones the 51 exercise, so the 2026-09-02 board already answered them.

### NEEDS-JUDGING — 4 patterns, 4 sections, 3 pages

Small enough for an **incremental judge board**; each carries a model proposal grounded in a
prior ruling. Two are "keep the current block" calls, one is a documented rename, one is a new
anonymous-root grid.

| id | pattern (source) | sections | proposal (model-proposed — Hakan judges) | prior-ruling precedent |
|---|---|---|---|---|
| **P-A** | `cmp-video-tabs` (P1 §9) | 1 | Rename in place to **`cmp-video-chapters`** and paste `blocks/video-chapters.html`; the `vt-*` inner vocabulary is already identical and ds.css has the zone. `MIGRATION.md:535` records the 2026-09-01 rename. | the mechanical-rename precedents (g37 `cmp-tabs` → `tabs-vertical`, g69 `pg-*` → `pgn-*`) |
| **P-B** | anonymous root + `hp-ind-grid` / `hp-ind-card` image tiles (P1 §10) | 1 | **`cmp cmp-cards is-hover-zoom cards-thumb is-cols-3`**, title-only (the original has no desc and no CTA — rule ii forbids inventing one); re-roots the anonymous section. | g05 (cards-thumb → cards) for the target; g33 / g43 / g59 for anonymous-root re-rooting; g60 ("use cards with media") for a label-only media card |
| **P-C** | `cmp-hero-text-fade` (P3 §2) | 1 | **KEEP `hero-text-fade`**, atom pass only. Current v4 block (`blocks/hero-text-fade.html`, 15 + 12 ds.css declarations, `library.js` "Hero — Text Fade", `v4: true`, showpiece) and the gate does **not** flag it. The real question: does J1's *"use `cmp cmp-hero surface-navy`"* swallow scroll-driven heroes? | **g44** — `hero-cinematic-pinned`, the other pinned-scroll hero, was kept rather than folded into `hero` |
| **P-D** | `cmp-zoom-parallax` (P5 §6) | 1 | **KEEP `zoom-parallax`**, atom pass only. Current block (`blocks/zoom-parallax.html`, 9 ds.css declarations, registered in `library.js` as a HEAVY showpiece + a scroll slug); no gate WARN. | **g50** — `coverflow-carousel`, the comparable single-instance showpiece scroll component, "ok with proposal but keep the existing content" |

**Not judgments — normalization notes already covered by a ruling** (listed so nobody re-opens them):
`is-glass` on P6 §7 has **0 ds.css declarations** → the glass card is delivered by `card-clear` on
the image surface, inside g10. `hp-map-story` on P1 §5 is **named in the importer glossary as the
canonical story form of the unified map contract**, so it is g19 contract, not drift.
`cmp-editorial-story` used mid-page (P1 §4, P4 §6) matches how g61 was already judged — the
`sustainable-finance-v2` instance Hakan ruled on is itself mid-page.

### Shard recommendation — **one shard of 9: "Shard 9 · Section landing pages"**

**Recommendation: keep the nine together as a single new shard, sequenced P2 → P9 → P5 → P6 → P7
→ P8 → P4 → P3 → P1** (cleanest first, heaviest last). Reasons, in order of weight:

1. **They share one spine, so one recipe run nine times.** Eight of nine open with the same hero
   family and close with `cta-band`/`cta-marquee`; **six carry the byte-identical "Explore the full
   range of corporate solutions" cross-sell band** (P2, P3, P5, P6, P7, P8) — one g05 emit, six
   applications. Splitting them by dominant pattern would scatter that repetition across four
   existing shards and lose it.
2. **All four NEEDS-JUDGING items live inside this shard.** The incremental judge board maps 1:1
   onto one shard, so the board can be answered once and the shard runs unblocked. Folded into
   shards 1/4/8, P-A/P-B would stall shard 4, P-C shard 1, P-D shard 8 — three shards blocked on
   four small decisions instead of one.
3. **They are the estate's front doors.** A landing page is the first thing a reviewer opens from
   `site-index`; sweeping them as a set gives one coherent "the site reads correctly end to end"
   review moment rather than nine scattered ones.
4. **Sequencing:** P2 first — 1 WARN, 5 re-composes, and it exercises `link-directory` (g58),
   `modal` (g67), `hero-cinematic-pinned` (g44) and `cta-marquee` (g32) in one page. P1 last — it
   is the only **L**, carries 12 re-composes and 2 of the 4 open judgments, and is the highest-
   visibility page in the estate.

**The one defensible alternative** (record it, don't take it silently): fold P4/P7 into shard 5
(deal & people — they share `people-carousel`, `key-transactions`, `tombstone-grid`) and P8 into
shard 6 (library/filter — four `cards-boxed` grids). That buys a little recipe adjacency at the
cost of reasons 1–3 above. Not recommended.

### Reconciliation

**102 sections. Every section of every one of the nine appears exactly once** in the tables above:

| page | sections in table | file scan | ✓ |
|---|---|---|---|
| P1 `corporate-institutional-v2-2026-08-25` | 17 | 17 | ✓ |
| P2 `payments-trade-finance-v2-2026-08-25` | 11 | 11 | ✓ |
| P3 `lending-v3-2026-07-27` | 12 | 12 | ✓ |
| P4 `investment-banking-v2-2026-08-10` | 11 | 11 | ✓ |
| P5 `markets-2026-07-20` | 11 | 11 | ✓ |
| P6 `islamic-finance-2026-08-11` | 11 | 11 | ✓ |
| P7 `our-expertise-partnerships-2026-08-11` | 11 | 11 | ✓ |
| P8 `insights-research-2026-07-20` | 10 | 10 | ✓ |
| P9 `support-resources-2026-07-20` | 8 | 8 | ✓ |
| **total** | **102** | **102** | ✓ |

*Scan method: every root-level `<header|section|footer|div|main>` whose class list starts with
`cmp` , plus a sweep for root-level elements that do NOT carry a `cmp` root (result: none beyond
the block interiors — `container-ds`, `ish-*`, `fo1-*`, `ov`, `es-inner`, `vt`, `sth`, `tc`,
`overlay overlay-pad`). P2's `div.cmp-modal` wrapper is counted as one section holding 5 overlay
panels.*

**Flag totals across the 102:** OK-RULED **98** · NEEDS-JUDGING **4** · CUSTOM-KEEP **1**
(P7 §7, inside its OK-RULED g20 row) · ASSET **0** — none of the nine needs a device bake or an
image capture before its sections can be emitted.
