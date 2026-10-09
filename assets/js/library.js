/* ═══════════════════════════════════════════════════════════════════════════
   library.js — shared catalog + preview/control logic for the component library.
   Used by index.html (home directory) and category.html (per-category page).
   Not part of the DS runtime; this only powers the gallery chrome.
═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var HEAVY = new Set(['hero-image-sequence', 'video-chapters', 'zoom-parallax', 'scroll-scenes']);
  // Pinned/scroll-driven components must render in a fixed-height iframe (which
  // scrolls its tall content natively) so position:sticky pins and scroll
  // progress advances — injecting a 640vh component inline into a card breaks it.
  // Keep in sync with any block carrying a scroll-driven data-behavior
  // (scroll-story[-scrub], scroll-frames, zoom-parallax, ib-hero, sticky-scroll):
  // these MUST render in the fixed-height scrolling iframe, never inline.
  var SCROLL_SLUGS = new Set(['hero-cinematic-pinned', 'tabs-desk', 'scroll-scenes', 'hero-text-fade', 'scroll-story', 'scroll-story-video', 'feature-scroll-story', 'hero-image-sequence', 'phone-scroll', 'desktop-scroll', 'video-chapters', 'site-header', 'site-header-v2', 'site-header-v2-scroll', 'site-header-v4', 'zoom-parallax', 'scroll-showcase', 'scroll-showcase-rev', 'hex-reach-map', 'world-map', 'cards-scroll', 'cards-boxed-scroll', 'cards-plain-scroll', 'cards-icon-scroll', 'cards-icon-linked-scroll', 'cards-number-scroll', 'cards-kicker-scroll', 'cards-steps-scroll', 'cards-case-study-scroll', 'cards-people-scroll', 'cards-partners-scroll', 'cards-tombstones-scroll', 'cards-testimonials-scroll', 'cards-promo-scroll', 'cards-tiles-scroll', 'cards-illustrated-scroll', 'cards-dashboard-scroll', 'cards-quote-scroll']);
  var DEV_W = { desktop: 0, tablet: 820, mobile: 400, foldable: 434 };
  // Foldable canvases (inner, unfolded screen): primary = iPhone Fold 434x576
  // (3:4); Galaxy Z Fold 8 = the wider 4:3 at the same height. Scroll/pinned
  // components get the real device height so 100vh heroes show as on device.
  var FOLDS = [['', 'Folded'], ['fold8', 'Open']];   // Folded = 434x576, Open = 768x576
  var FOLD_WH = { '': [434, 576], fold8: [768, 576] };
  var OV_MAP = { tint: 'ov-tint ov-60', 'grad-up': 'ov-gradient-b ov-70', 'grad-down': 'ov-gradient-t ov-70', scrim: 'ov-scrim ov-50', vignette: 'ov-vignette ov-70', 'grad-left': 'ov-gradient-l ov-70', 'grad-right': 'ov-gradient-r ov-70' };
  // Surfaces are ROLE-named, never colour-named (RULING 2026-09-03) — so the
  // gallery labels read "Primary"/"Accent" too: under Emirates Islamic the
  // primary surface paints purple, and a "Navy" label would be a lie.
  // THE PALETTE'S grounds, in palette order. Flipping one RECOMPOSES the
  // demo markup (see DSPalette.recompose) — it does not ask CSS to adapt.
  var SURFACES = [['', 'Surface · Default'], ['surface-white', 'White'], ['surface-soft', 'Soft'], ['surface-mute', 'Mute'], ['surface-primary-soft', 'Primary soft'], ['surface-accent-soft', 'Accent soft'], ['surface-primary', 'Primary'], ['surface-dark', 'Dark'], ['surface-accent', 'Accent'], ['surface-clear', 'Clear (no paint)'], ['surface-image', 'Image']];
  // Extra Surface option offered ONLY for the "Bento Grids" category: an abstract
  // background image behind the mosaic. surface-image is a STANDALONE dark surface
  // (ds.css twins every surface-primary-keyed rule), so no surface-primary pairing.
  var BENTO_BG_SURFACE = ['surface-image', 'Background Image'];
  var OVERLAYS = [['', 'Overlay · None'], ['tint', 'Tint'], ['grad-up', 'Gradient ↑'], ['grad-down', 'Gradient ↓'], ['grad-left', 'Gradient ←'], ['grad-right', 'Gradient →'], ['scrim', 'Scrim'], ['vignette', 'Vignette']];
  // Brand themes (themes.css). GLOBAL control in the topbar, not per-card:
  // a theme repaints the whole system, so the gallery shows one brand at a
  // time. Inline-rendered cards inherit from <html data-theme>; iframes get
  // ?theme= at creation and a postMessage on live switches.
  var THEMES = [['', 'Brand · Emirates NBD'], ['ei', 'Emirates Islamic']];
  // surface-image never gets its image from CSS: sections carry data-bg
  // (real pages author it per brand); the gallery supplies the preview
  // asset for the active theme. Keep in sync with frame.html.
  var SURFACE_IMAGE_ASSET = { '': 'assets/images/bento-bg-placeholder.svg', ei: 'assets/images/bento-bg-ei.svg' };
  function surfaceImageAsset(t) { return SURFACE_IMAGE_ASSET[t] || SURFACE_IMAGE_ASSET['']; }
  // header previews + the gallery's own brand row follow the active theme
  var BRAND_LOGO_ASSET = { ei: '/assets/images/ei-logo.svg' };
  var BRAND_NAME = { '': 'Emirates NBD', ei: 'Emirates Islamic' };
  function currentTheme() { try { return localStorage.getItem('ds-theme') || ''; } catch (e) { return ''; } }
  function applyTheme(t) {
    try { t ? localStorage.setItem('ds-theme', t) : localStorage.removeItem('ds-theme'); } catch (e) {}
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('.surface-image[data-bg]').forEach(function (el) {
      el.setAttribute('data-bg', surfaceImageAsset(t));
      el.style.backgroundImage = "url('" + surfaceImageAsset(t) + "')";
    });
    document.querySelectorAll('.cmp-site-header').forEach(function (h) {
      if (BRAND_LOGO_ASSET[t]) h.style.setProperty('--brand-logo', "url('" + BRAND_LOGO_ASSET[t] + "')");
      else h.style.removeProperty('--brand-logo');
    });
    var brand = document.querySelector('.lib-brand');
    if (brand) {
      var label = (BRAND_NAME[t] || BRAND_NAME['']) + ' \u00b7 Component Library';
      brand.childNodes.forEach(function (n) { if (n.nodeType === 3 && n.nodeValue.trim()) n.nodeValue = ' ' + label; });
    }
    document.querySelectorAll('iframe.lib-if').forEach(function (f) {
      try { f.contentWindow.postMessage({ type: 'libTheme', theme: t }, '*'); } catch (e) {}
    });
  }
  function mountThemeSwitch() {
    var top = document.querySelector('.lib-top');
    if (!top || top.querySelector('.lib-theme')) return;
    var sel = document.createElement('select');
    sel.className = 'lib-select lib-theme'; sel.title = 'Brand theme (themes.css)';
    sel.innerHTML = THEMES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('');
    sel.value = currentTheme();
    sel.addEventListener('change', function () { applyTheme(sel.value); });
    var count = top.querySelector('.lib-count');
    top.insertBefore(sel, count || null);
    applyTheme(sel.value);
  }
  var HEADS = [['', 'Header · As built'], ['is-left', 'Left (pinned)'], ['is-center', 'Centered'], ['is-right', 'Right'], ['is-split', 'Split (L/R)']];
  // Content-alignment variants for blocks that opt in via `align: true` in the
  // catalog (blocks without a .section-head, where the Header control never
  // shows — e.g. cta-band). Values are real .cmp variant classes in ds.css.
  var ALIGNS = [['', 'Align · As built'], ['is-left', 'Left'], ['is-center', 'Centered'], ['is-right', 'Right']];
  // Where a full-bleed block sits its copy vertically (catalog: place: true).
  var PLACES = [['', 'Content · As built'], ['is-top', 'Top'], ['is-middle', 'Middle'], ['is-bottom', 'Bottom']];
  // Desktop column count for grid card blocks that opt in via `cols: true`
  // (values are real .is-cols-* variant classes in ds.css; default = 4-up).
  var COLS = [['', 'Columns · As built'], ['is-cols-4', '4 up'], ['is-cols-3', '3 up'], ['is-cols-2', '2 up'], ['is-cols-auto', 'Uncapped (full-bleed)']];
  // Per-card CTA style for card blocks that opt in via `cta: true`
  // (values are real .is-cta-* variant classes in ds.css; default = circle).
  var CTAS = [['', 'CTA · Circle'], ['is-cta-text', 'Text link'], ['is-cta-btn', 'Button']];
  // Card-surface axis for cmp-cards compositions (cardsurf: true): applied to
  // every .cd-card in the preview — the card's own surface, independent of the
  // section surface.
  // Hover treatment for cmp-cards (hover: true): root modifier swap.
  var HOVERS = [['', 'Hover · As built'], ['is-hover-zoom', 'Lift + media zoom'], ['is-hover-lift', 'Lift only'], ['is-hover-fill', 'Brand fill'], ['is-hover-none', 'None']];
  var MSPEEDS = [['', 'Speed \u00b7 As built'], ['80s', 'Slow'], ['45s', 'Medium'], ['20s', 'Fast']];
  var WALLCOLS = [['', 'Columns \u00b7 As built'], ['is-cols-3', '3 up'], ['is-cols-4', '4 up'], ['is-cols-5', '5 up']];
  var DIRCOLS = [['', 'Columns \u00b7 As built'], ['is-cols-2', '2 up'], ['is-cols-3', '3 up'], ['is-cols-4', '4 up']];
  var LINKCOLS = [['', 'Columns \u00b7 As built'], ['is-cols-1', '1 up'], ['is-cols-2', '2 up'], ['is-cols-3', '3 up']];
  var MCOLS = [['', 'Mobile \u00b7 As built'], ['is-m-cols-1', 'Mobile \u00b7 1 col'], ['is-m-cols-2', 'Mobile \u00b7 2 cols']];
  var WMINKS = [['', 'Map ink \u00b7 Default'], ['is-ink-faint', 'Faint'], ['is-ink-strong', 'Strong']];
  var GUTTERS = [['', 'Gutter \u00b7 As built'], ['10px', 'Tight'], ['16px', 'Default'], ['24px', 'Roomy']];
  var BENTO_HOVERS = [['', 'Hover \u00b7 As built'], ['is-hover-lift', 'Lift'], ['is-hover-zoom', 'Media zoom'], ['is-hover-spotlight', 'Spotlight glow'], ['is-hover-lift is-hover-zoom', 'Lift + zoom'], ['is-hover-none', 'None']];
  // Carousel behavior controls (carouselctl: true): autoplay + nav visibility.
  var MALIGNS = [['', 'Mobile \u00b7 Stands down'], ['is-m-align', 'Mobile \u00b7 Keeps alignment']];
  var AUTOPLAYS = [['', 'Autoplay · As built'], ['on', 'On (7s)'], ['off', 'Off']];
  var NAVS = [['', 'Nav · As built'], ['arrows', 'Arrows'], ['dots', 'Dots'], ['both', 'Arrows + dots'], ['none', 'None']];
  function applyCarousel(scope, auto, nav) {
    scope.querySelectorAll('[data-carousel]').forEach(function (c) {
      if (auto === 'on') c.setAttribute('data-autoplay', '7000');
      if (auto === 'off') c.removeAttribute('data-autoplay');
      var tog = c.querySelector('[data-carousel-toggle]');
      if (tog) tog.hidden = !c.hasAttribute('data-autoplay');
      if (nav) {
        var arrows = c.querySelectorAll('[data-carousel-prev], [data-carousel-next]');
        var dots = c.querySelector('[data-carousel-dots]');
        arrows.forEach(function (b) { b.hidden = (nav === 'dots' || nav === 'none'); });
        if (dots) dots.hidden = (nav === 'arrows' || nav === 'none');
      }
    });
  }
  // Every row is LOOK + PAINT (+ FINISH). is-* never carries a colour, so the
  // grey tiles spell their fill out: `card-panel surface-grey is-tile`.
  var CARDSURFS = [['', 'Cards · As built'], ['none', 'Boxless'], ['card-panel surface-clear', 'Clear (no paint)'], ['card-panel surface-glass', 'Glass (frosted)'], ['card-panel surface-glass-25', 'Glass 25'], ['card-panel surface-glass-50', 'Glass 50'], ['card-panel surface-glass-75', 'Glass 75'], ['card-panel surface-white', 'White (raised)'], ['card-panel surface-soft is-tile', 'Soft tile'], ['card-panel surface-mute is-tile', 'Mute tile'], ['card-panel surface-accent-soft is-tile', 'Accent-soft tile'], ['card-panel surface-primary', 'Primary'], ['card-panel surface-accent', 'Accent'], ['card-media', 'Media'], ['card-panel surface-image', 'Image']];
  // Strip list — every class any row can apply, plus the retired spellings
  // (is-grey, card-clear, is-fill-NN) so an as-built card carrying one is
  // still cleaned before the next paint goes on.
  var CARD_PAINT = ['card-panel', 'card-media', 'surface-clear', 'surface-glass', 'surface-glass-25', 'surface-glass-50', 'surface-glass-75', 'ds-card', 'is-tile', 'is-flat', 'is-grey', 'card-clear', 'is-fill-25', 'is-fill-50', 'is-fill-75', // The deprecated colour names stay in the STRIP list (not the offer list) so a
// stale card carrying one is still cleaned before the new paint is applied.
'surface-white', 'surface-soft', 'surface-mute', 'surface-primary', 'surface-primary-soft', 'surface-accent', 'surface-accent-soft', 'surface-navy', 'surface-blue', 'surface-grey', 'surface-grey-2', 'surface-image', 'p-6'];
  function applyCardSurf(scope, v) {
    if (!v) return;
    scope.querySelectorAll('.cd-card').forEach(function (el) {
      var P0 = window.DSPalette;
      var fromWord0 = P0 ? P0.surfaceOn(el) : null;
      if (fromWord0 === 'surface-clear') fromWord0 = null; // clear resolves THROUGH
      var fromKind = P0 ? P0.kindOf(fromWord0 || P0.surfaceOn(el.closest('[class*="surface-"]:not(.cd-card)') || scope) || 'surface-white') : 'light';
      // remember the card's authored --card-pad once, restore it each pass
      if (el.dataset.libPad === undefined) el.dataset.libPad = el.style.getPropertyValue('--card-pad') || '';
      if (el.dataset.libPad) el.style.setProperty('--card-pad', el.dataset.libPad); else el.style.removeProperty('--card-pad');
      CARD_PAINT.forEach(function (c) { el.classList.remove(c); });
      el.removeAttribute('data-bg'); el.style.backgroundImage = '';
      if (v !== 'none') v.split(' ').forEach(function (c) { el.classList.add(c); });
      // cards CONTAINING media pad their own body — an applied paint must not
      // wrap the media in frame padding (Boxed stays flush, Hakan review)
      if (v !== 'none' && el.querySelector(':scope > .media-cover, :scope > :not(.media-frame) > .media-cover')) { el.classList.remove('p-6'); el.style.setProperty('--card-pad', '0px'); }
      if (v.indexOf('surface-image') > -1) el.setAttribute('data-bg', surfaceImageAsset(currentTheme()));
      // A card ground swap is a COMPOSITION change: the card's inner inks must
      // remap to the new ground's pairing (glass/media = dark kind; boxless
      // resolves through to the section) — found by Hakan: Glass 50 on primary
      // kept the boxed card's dark inks (2026-09-03).
      var P = window.DSPalette;
      if (P) {
        var afterWord = P.surfaceOn(el);
        if (afterWord === 'surface-clear') afterWord = null; // clear resolves THROUGH, like boxless
        var toKind = afterWord ? P.kindOf(afterWord)
          : el.classList.contains('card-media') ? P.kindOf('surface-image')
          : P.kindOf(P.surfaceOn(el.closest('[class*="surface-"]:not(.cd-card)') || scope) || 'surface-white');
        if (fromKind !== toKind) {
          var targets = el.querySelectorAll(P.INKS.map(function (i) { return '.' + i; }).join(','));
          targets.forEach(function (t) {
            var a = t.parentElement, shielded = false;
            while (a && a !== el) { var sw = P.surfaceOn(a); if (sw && sw !== 'surface-clear') { shielded = true; break; } a = a.parentElement; }
            var ownW = P.surfaceOn(t);
            if (shielded || (ownW && ownW !== 'surface-clear')) return;
            P.INKS.forEach(function (ink) {
              if (!t.classList.contains(ink)) return;
              var nx = P.remapInk(ink, fromKind, toKind);
              if (nx !== ink) { t.classList.remove(ink); t.classList.add(nx); }
            });
          });
        }
      }
    });
  }
  // Card OVERLAY axis (cardov: true): restyles the .ov INSIDE each card (or
  // injects one over the card's media) — the section Overlay control's twin.
  function applyCardOv(scope, key) {
    if (!key) return;
    var cls = OV_MAP[key] || '';
    scope.querySelectorAll('.cd-card').forEach(function (el) {
      var ov = el.querySelector(':scope > .ov');
      if (key === 'off') { if (ov) ov.hidden = true; return; }
      if (!ov) {
        var media = el.querySelector(':scope > .media-cover');
        if (!media) return;
        ov = document.createElement('span'); ov.className = 'ov lib-cardov'; ov.setAttribute('aria-hidden', 'true');
        media.insertAdjacentElement('afterend', ov);
      }
      ov.hidden = false;
      ov.className = ov.className.replace(/\bov-(tint|scrim|gradient-[btlr]|vignette)\b/g, '').replace(/\s+/g, ' ').trim();
      cls.split(' ').forEach(function (c) { if (c) ov.classList.add(c); });
    });
  }
  var ICON = {
    desktop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    tablet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
    foldable: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16" stroke-dasharray="2 2"/></svg>'
  };

  // impact = visual/narrative weight (loudest → quietest):
  //   showpiece  full cinematic / scroll-driven — the stop-scrolling moments
  //   statement  big, anchors a section
  //   supporting communicates well, not the star
  //   utility    functional, deliberately quiet
  var IMPACT_TIERS = ['showpiece', 'statement', 'supporting', 'utility'];
  var IMPACT_LABEL = { showpiece: 'Showpiece', statement: 'Statement', supporting: 'Supporting', utility: 'Utility' };

  var CATALOG = [
    { cat: 'Navigation', sub: 'Wayfinding — the global site header and footer.', items: [
      { name: 'Site Header (v1 — superseded)', hidden: true, impact: 'utility', whenToUse: 'Superseded by the canonical Site Header (v4). Kept in the library because ~77 pages already paste it; not offered for new work.', variants: [{ label: 'Default', slug: 'site-header' }] },
      { name: 'Site Header v2 — overflow-safe nav (superseded)', hidden: true, impact: 'utility', whenToUse: 'Header variant whose segment bar absorbs any number of links — compare smart "More" collapse vs a scrollable strip. Demo carries 12 segments.', variants: [{ label: 'Smart More', slug: 'site-header-v2' }, { label: 'Scroll strip', slug: 'site-header-v2-scroll' }] },
      { name: 'Site Header', impact: 'utility', whenToUse: 'THE site header — global top nav and brand bar that starts every page. Corporate & institutional segment lineup (the corporate mega-menu is the estate canon, Hakan 2026-09-02). Earlier v1/v2 headers are superseded and hidden from the gallery.', variants: [{ label: 'Default', slug: 'site-header-v4' }] },
      { name: 'Sub-nav — in-page anchors', impact: 'utility', whenToUse: 'Sticky jump-links to the sections of a long page; sits under the hero.', variants: [{ label: 'Default', slug: 'subnav' }] },
      { name: 'Footer — Standard', impact: 'utility', whenToUse: 'Full 3-band site footer: link columns, QR + social, legal bar.', variants: [{ label: 'Default', slug: 'footer-option1' }] },
      { name: 'Footer — Compact (hidden)', hidden: true, impact: 'utility', whenToUse: 'Compact closer — minimal links + legal, for focused / landing pages.', variants: [{ label: 'Default', slug: 'footer-option2' }] },
    ] },
    { cat: 'FAQs / Accordion', sub: 'Expand-and-collapse panels for FAQs, product suites and disclosures.', items: [
      { name: 'Accordion', v4: true, impact: 'supporting', reviewed: false, whenToUse: 'THE accordion shell (cmp-acc v4): one data-accordion behavior, heads and bodies are compositions. Bodies take ANY HTML — this demo holds prose + CTA, a list-check, a whole cmp-cards duo and a table. The open disc rides the ACCENT. Single-open by default; data-accordion="multi" allows many open. ', variants: [{ label: 'Default', slug: 'acc' }], overlays: [] },
      { name: 'Accordion — FAQ Split', v4: true, comp: true, impact: 'supporting', reviewed: false, whenToUse: 'cmp-acc composition: sticky left rail (section header + ds-card help panel with icon-tile and btn) beside single-open Q&A rows. Replaces faq-split with utilities + atoms — zero CSS of its own.', variants: [{ label: 'Default', slug: 'acc-faq' }], overlays: [] },
      { name: 'Accordion — Boxed', v4: true, comp: true, impact: 'supporting', reviewed: false, whenToUse: 'cmp-acc composition: each row IS a ds-card tile (the shell drops its hairline on card rows); spacing is a grid gap, padding via --card-pad. For accordions that must read as panels on grey or navy sections.', variants: [{ label: 'Default', slug: 'acc-boxed' }], overlays: [] },
    ] },
    { cat: 'Tabs', sub: 'Tabbed content switchers — underline, pill, card and vertical.', items: [      { name: 'Filter Grid', v4: true, impact: 'utility', reviewed: false, comp: true, whenToUse: 'A filterable card grid — filter pills plus faceted selects over a grid, with a live count and empty state. Demonstrates the generic data-filter behaviour: filtering is a common DS capability, so ANY card grid (this shows the cmp-cards kicker composition) becomes filterable by adding data-attributes — never a page-local script.', variants: [{ label: 'Default', slug: 'filter-grid' }], overlays: [] },
      { name: 'Feature Tab Cards', v4: true, impact: 'supporting', whenToUse: 'Group related features into switchable tab cards.', variants: [{ label: 'Default', slug: 'feature-tab-cards' }] },
      { name: 'Tabs — Underline', v4: true, align: true, impact: 'supporting', reviewed: false, whenToUse: 'THE tabs shell (cmp-tabs v4), default rail: a quiet underline marks the active tab; the accent flips on dark surfaces. Panels take ANY HTML — this demo holds a prose+media split, a whole cmp-cards grid and a table.', variants: [{ label: 'Default', slug: 'tabs-underline' }], overlays: [] },
      { name: 'Tabs — Pills', v4: true, align: true, comp: true, impact: 'supporting', reviewed: false, whenToUse: 'cmp-tabs composition: the rail is bare chip atoms with data-tab — ZERO tab CSS. The chip selected state is the active state, and chips flip on dark surfaces (the old pill-dark twin is deleted). Panels here: ds-num stat rows.', variants: [{ label: 'Default', slug: 'tabs-pill' }], overlays: [] },
      { name: 'Tabs — Cards', v4: true, align: true, comp: true, impact: 'supporting', reviewed: false, whenToUse: 'cmp-tabs composition: each trigger is a ds-card + icon-tile + type-* composition on the button — good when each tab needs selling. The active ring and icon flip are the only component hooks. Panels: media + copy splits.', variants: [{ label: 'Default', slug: 'tabs-card' }], overlays: [] },
      { name: 'Tabs — Toggle', v4: true, comp: true, align: true, impact: 'supporting', reviewed: false, whenToUse: 'cmp-tabs composition, the segmented toggle: chip atoms grouped in the .is-tray pill well, active segment raised white (frosted tray on dark). The audience/mode switch — 2\u20134 short segments; panels take ANY HTML (here a cmp-cards duo per segment).', variants: [{ label: 'Default', slug: 'tabs-toggle' }], overlays: [] },
      { name: 'Tabs — Directory', v4: true, comp: true, align: true, impact: 'supporting', reviewed: false, whenToUse: 'cmp-tabs composition, the pills-in-content directory: an underline rail over dense auto-filling grids of ds-card tiles — one short service name each. Reach for it when a tab holds MANY short items (10+ names) rather than a few rich cards. Tiles are cmp-cards on the auto columns axis; zero CSS of its own.', variants: [{ label: 'Default', slug: 'tabs-directory' }], overlays: [] },
      { name: 'Tabs — Experience', v4: true, comp: true, align: true, impact: 'statement', reviewed: false, whenToUse: 'cmp-tabs composition, the experience pattern: a media stage (media-frame + icon-tile badge + type atoms) that swaps per tab, with a centered chips rail below; auto-advances every 7s and swipes on phones. Replaces the experience-tabs component - atoms flip surfaces correctly.', variants: [{ label: 'Default', slug: 'tabs-experience' }], overlays: [] },
      { name: 'Tabs — Vertical', v4: true, impact: 'supporting', reviewed: false, whenToUse: 'The underline rotated: a start-border indicator via logical properties (RTL mirrors free). Suits long label sets that would wrap horizontally; panels sit alongside.', variants: [{ label: 'Default', slug: 'tabs-vertical' }], overlays: [] },
      { name: 'Tabs - Desk reel', v4: true, comp: true, impact: 'statement', reviewed: false, whenToUse: 'From the C&IB home lending act: "With a desk for ____." A chips rail (chip chip-lg, aria-pressed) picks a sector desk; the blank rolls like a reel, the photo crossfades and a card-panel names the desk. With motion on, the stage pins and scroll rolls through the six desks; copy and CTAs follow the pin on phones. Reduced motion: no pin, chips still choose. Self-contained (scoped style + inline script), one or many per page.', variants: [{ label: 'Default', slug: 'tabs-desk' }], overlays: [] },
    ] },
    { cat: 'Heroes', sub: 'Page openers — image, video, scroll and editorial.', items: [
      { name: 'Hero', v4: true, carouselctl: true, malign: true, reviewed: false, impact: 'showpiece', align: true, place: true, whenToUse: 'THE hero (cmp-hero v4): media is CONTENT (video / data-bg image / none — the surface paints), washes are .ov atoms, copy is a ds-stack. Align (left/center/right) x Place (top/middle/bottom) on the root; every combo stands down to bottom-start on phones. Title is tag-agnostic — one h1 per page.', variants: [{ label: 'Single (video)', slug: 'hero' }, { label: 'Carousel', slug: 'hero-slides' }] },
      { name: 'Hero — Image', v4: true, malign: true, carouselctl: true, comp: true, reviewed: false, impact: 'showpiece', align: true, place: true, whenToUse: 'cmp-hero composition: image media (media-cover + data-bg + --focus focal point), copy anchored bottom-start — the full-bleed opener.', variants: [{ label: 'Single', slug: 'hero-image' }, { label: 'Carousel', slug: 'hero-image-slides' }] },
      { name: 'Hero — Editorial', v4: true, malign: true, carouselctl: true, comp: true, reviewed: false, impact: 'showpiece', align: true, place: true, whenToUse: 'cmp-hero composition, the editorial-story anatomy: display-XL headline pinned low + a countup ds-num stat strip under a hairline. The extras slot is pure composition — utilities + atoms.', variants: [{ label: 'Single', slug: 'hero-editorial' }, { label: 'Carousel', slug: 'hero-editorial-slides' }] },
      { name: 'Hero — Image Sequence', v4: true, impact: 'showpiece', whenToUse: 'Scroll-scrubbed image sequence — a premium product reveal opener.', variants: [{ label: 'Default', slug: 'hero-image-sequence' }] },
      { name: 'Hero — Cinematic (pinned)', v4: true, impact: 'showpiece', whenToUse: 'Pinned scrollytelling opener — scrubbed frames plus phased text.', variants: [{ label: 'Dark', slug: 'hero-cinematic-pinned' }] },
      { name: 'Scroll Story', v4: true, align: true, place: true, impact: 'showpiece', whenToUse: 'Anchor a product narrative as the hero scroll act.', variants: [{ label: 'Dark', slug: 'scroll-story' }], overlays: [] },
      { name: 'Scroll Story — Video', v4: true, align: true, place: true, impact: 'showpiece', whenToUse: 'Scrubbed video story — a high-drama narrative opener.', variants: [{ label: 'Dark', slug: 'scroll-story-video' }] },
      { name: 'Hero — Text Fade', v4: true, align: true, place: true, impact: 'showpiece', whenToUse: 'Minimal scroll opener where typography fades in on scroll.', variants: [{ label: 'Dark', slug: 'hero-text-fade' }] },
      { name: 'Big Statement', v4: true, align: true, impact: 'statement', whenToUse: 'A single bold sentence that frames the whole page.', variants: [{ label: 'Default', slug: 'big-statement' }], overlays: [] },
    ] },
    { cat: 'Cards', sub: 'THE card collection — one component, many compositions; Grid, Carousel, Scroll and List layouts share one option set.', items: [
      { name: 'Cards — Thumbnail', v4: true, align: true, impact: 'statement', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'THE card component, media composition: the whole card is a link — media-cover fills the frame, an .ov paints the scrim, white type over it, a chip label, a btn CTA. The component owns only grid + frame; everything inside is atoms, so slots are added or removed freely. Columns control sets 4/3/2/auto; the Carousel variant fills the width and scrolls.', variants: [{ label: 'Grid', slug: 'cards' }, { label: 'Carousel', slug: 'cards-carousel' }, { label: 'Scroll', slug: 'cards-scroll' }], overlays: [] },
      { name: 'Cards — List', v4: true, align: true, comp: true, impact: 'supporting', reviewed: false, whenToUse: 'cmp-cards composition on the LIST layout (the 4th layout mode): a single column of hairline rows — media-frame thumb at the start, title + subdescription stack, trailing arrow pushed to the end. The listing pattern: rows navigate; for collapsing rows use the Accordion instead.', variants: [{ label: 'Default', slug: 'cards-list' }], overlays: [] },
      { name: 'Cards — Boxed', v4: true, align: true, impact: 'statement', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: media on top, copy in a ds-card panel below (the card IS a ds-card with --card-pad:0). Case-study, article, product and category cards. A light island on dark surfaces automatically.', variants: [{ label: 'Grid', slug: 'cards-boxed' }, { label: 'Carousel', slug: 'cards-boxed-carousel' }, { label: 'Scroll', slug: 'cards-boxed-scroll' }], overlays: [] },
      { name: 'Cards — Plain', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: rounded media tile with the copy sitting directly on the section surface — the lightest media card. Surface-adaptive type.', variants: [{ label: 'Grid', slug: 'cards-plain' }, { label: 'Carousel', slug: 'cards-plain-carousel' }, { label: 'Scroll', slug: 'cards-plain-scroll' }], overlays: [] },
      { name: 'Cards — Icon', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true,whenToUse: 'cmp-cards composition, media-less: icon-tile + title + body in a soft tile (ds-card is-tile). THE replacement for highlights-tiles / feature cards. Link a card by making it an <a> and adding a btn-text.', variants: [{ label: 'Grid', slug: 'cards-icon' }, { label: 'Carousel', slug: 'cards-icon-carousel' }, { label: 'Scroll', slug: 'cards-icon-scroll' }], overlays: [] },
      { name: 'Cards — Number', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition, media-less and icon-less: a ds-num kicker + title + body in a raised ds-card. THE replacement for services-grid / how-it-works-steps numbered cards (minus services-grid’s floating corner number badge — deliberately dropped).', variants: [{ label: 'Grid', slug: 'cards-number' }, { label: 'Carousel', slug: 'cards-number-carousel' }, { label: 'Scroll', slug: 'cards-number-scroll' }], overlays: [] },
      { name: 'Cards — Kicker', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition, media-less and icon-less: a WORD kicker (type-eyebrow) + title + body in a raised ds-card. THE replacement for kicker-cards — principles, benefits and differentiators as titled points.', variants: [{ label: 'Grid', slug: 'cards-kicker' }, { label: 'Carousel', slug: 'cards-kicker-carousel' }, { label: 'Scroll', slug: 'cards-kicker-scroll' }], overlays: [] },
      { name: 'Cards \u2014 Head aside', v4: true, comp: true, reviewed: false, impact: 'supporting', whenToUse: 'cmp-cards LAYOUT modifier (is-head-aside): the section head \u2014 eyebrow, headline, lead \u2014 sits in a left column and the card grid on the right, head vertically centred beside it. Composes with ANY cmp-cards composition — media or media-less, grid or carousel right cell (kicker + tiles demoed; center-peek excluded) — and is-cols-N; 2-up reads best. Stacks head-over-cards below 1024px.', variants: [{ label: 'Default', slug: 'cards-aside' }], overlays: [] },
      { name: 'Cards — Icon Linked', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: the whole card is a link — icon-tile + title + body + a btn-text in a clear outlined card (card-clear). THE replacement for the ways-to-accept / pillar-grid linked-triad pattern.', variants: [{ label: 'Grid', slug: 'cards-icon-linked' }, { label: 'Carousel', slug: 'cards-icon-linked-carousel' }, { label: 'Scroll', slug: 'cards-icon-linked-scroll' }], overlays: [] },
      { name: 'Cards — Illustrated', v4: true, align: true, impact: 'statement', reviewed: false, cols: true, carouselctl: true, comp: true, hover: true, whenToUse: 'Harvested from the Feature Cards bento: a DARK designed card — icon eyebrow + headline + an isolated SVG illustration (content — swap per card) + bullet list + corner arrow.', variants: [{ label: 'Grid', slug: 'cards-illustrated' }, { label: 'Carousel', slug: 'cards-illustrated-carousel' }, { label: 'Scroll', slug: 'cards-illustrated-scroll' }], overlays: [] },
      { name: 'Cards — Dashboard', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, carouselctl: true, comp: true, hover: true, whenToUse: 'Harvested from the businessONLINE bento tile: a dark product card with a strip of glass mini stat panels (dash-tile atoms) — pitch a platform with live-looking numbers.', variants: [{ label: 'Grid', slug: 'cards-dashboard' }, { label: 'Carousel', slug: 'cards-dashboard-carousel' }, { label: 'Scroll', slug: 'cards-dashboard-scroll' }], overlays: [] },
      { name: 'Cards — Quote', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, carouselctl: true, comp: true, hover: true, whenToUse: 'Harvested from the Magazine bento pull-quote tile: navy card, display quote mark, quote + attribution. Zero bespoke CSS.', variants: [{ label: 'Grid', slug: 'cards-quote' }, { label: 'Carousel', slug: 'cards-quote-carousel' }, { label: 'Scroll', slug: 'cards-quote-scroll' }], overlays: [] },
      { name: 'Cards — Steps', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: a Step chip + trailing arrow, the step title, and a big ds-num pinned to the bottom of a clear card. THE replacement for process-cards (its fan-in entry/hover animation = future data-behavior option).', variants: [{ label: 'Grid', slug: 'cards-steps' }, { label: 'Carousel', slug: 'cards-steps-carousel' }, { label: 'Scroll', slug: 'cards-steps-scroll' }], overlays: [] },
      { name: 'Cards — Case Study', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: boxed media card with the category chip on the media’s bottom edge, then title + a meta-dot fact row (sector · country · date · read time). THE replacement for case-study-card.', variants: [{ label: 'Grid', slug: 'cards-case-study' }, { label: 'Carousel', slug: 'cards-case-study-carousel' }, { label: 'Scroll', slug: 'cards-case-study-scroll' }], overlays: [] },
      { name: 'Cards — People', v4: true, align: true, impact: 'statement', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: portrait person cards — whole-card link, taller media frame, gradient wash, name + role + a View profile pill. THE replacement for people-grid / people-carousel (pair with cmp-modal .op-modal for bios).', variants: [{ label: 'Grid', slug: 'cards-people' }, { label: 'Carousel', slug: 'cards-people-carousel' }, { label: 'Scroll', slug: 'cards-people-scroll' }], overlays: [] },
      { name: 'Cards — Partners', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: flat logo tiles — the partner mark centred, name + relationship line below, and a see-all btn-text foot. THE replacement for partner-logos.', variants: [{ label: 'Grid', slug: 'cards-partners' }, { label: 'Carousel', slug: 'cards-partners-carousel' }, { label: 'Scroll', slug: 'cards-partners-scroll' }], overlays: [] },
      { name: 'Cards — Tombstones', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition: flat deal tombstones — logo well, amount, detail lines, hairline rule and a country · date meta foot, optional ESG badge. THE replacement for tombstone-grid / key-transactions.', variants: [{ label: 'Grid', slug: 'cards-tombstones' }, { label: 'Carousel', slug: 'cards-tombstones-carousel' }, { label: 'Scroll', slug: 'cards-tombstones-scroll' }], overlays: [] },
      { name: 'Cards — Testimonials', v4: true, align: true, impact: 'supporting', reviewed: false, cols: true, cardov: true, carouselctl: true, comp: true, hover: true, cardsurf: true, whenToUse: 'cmp-cards composition, the estate testimonials pattern: clean media card with the client quote BELOW it, author + case-study link. The Carousel variant is CENTER-PEEK (active slide centered, neighbors dimmed — the is-center-peek carousel mode) with autoplay + play/pause as built.', variants: [{ label: 'Grid', slug: 'cards-testimonials' }, { label: 'Carousel', slug: 'cards-testimonials-carousel' }, { label: 'Scroll', slug: 'cards-testimonials-scroll' }], overlays: [] },      { name: 'Cards — Thumbnail (legacy, superseded)', hidden: true, impact: 'statement', cols: true, cta: true, whenToUse: 'Flexible portrait-card grid — image or video, text over a scrim. Every per-card slot is optional (label pill, eyebrow, title, description, and one CTA). The CTA control switches its style (circle icon / text link / solid button); the Columns control sets desktop count (4/3/2-up). Covers cross-sell links, story cards and category tiles from one component; stacks on mobile, and the Carousel variant fills the width and scrolls on every breakpoint.', variants: [{ label: 'Grid', slug: 'cards-thumb' }, { label: 'Carousel', slug: 'cards-thumb-carousel' }], overlays: [] },
      { name: 'Cards — Promo', v4: true, align: true, impact: 'statement', reviewed: false, comp: true, hover: true, cols: true, carouselctl: true, cardsurf: true, cardov: true, whenToUse: 'cmp-cards composition, the app-store promo card for ISOLATED imagery: text on top, a free-standing product visual centered (phone/laptop illustration atoms or a circular media-frame cutout — swap in real cutout images per page), filled icon button bottom-end. Contrast with Cards — Tiles, which is the full-bleed imagery strategy.', variants: [{ label: 'Grid', slug: 'cards-promo' }, { label: 'Carousel', slug: 'cards-promo-carousel' }, { label: 'Scroll', slug: 'cards-promo-scroll' }], overlays: [] },
      { name: 'Cards — Tiles', v4: true, align: true, impact: 'statement', reviewed: false, comp: true, hover: true, cols: true, carouselctl: true, cardsurf: true, cardov: true, whenToUse: 'cmp-cards composition, the get-to-know tile for FULL-BLEED imagery: tall media-cover card, copy at the TOP over a top gradient, glass plus-button bottom-end. Contrast with Cards — Promo, the isolated-imagery strategy. The Thumbnail composition with four class swaps.', variants: [{ label: 'Grid', slug: 'cards-tiles' }, { label: 'Head aside', slug: 'cards-tiles-aside' }, { label: 'Aside carousel', slug: 'cards-tiles-aside-carousel' }, { label: 'Carousel', slug: 'cards-tiles-carousel' }, { label: 'Scroll', slug: 'cards-tiles-scroll' }], overlays: [] },      { name: 'Cards — Thumbnail Box (legacy, superseded)', hidden: true, impact: 'statement', cols: true, cta: true, whenToUse: 'The below-media sibling of Cards — Thumbnail: media on top, content in a light box below (dark text), only the label pill straddling the media. Same optional slots and the same CTA + Columns controls, so it repurposes as case-study, article, product or category cards. The Carousel variant fills the width and scrolls.', variants: [{ label: 'Grid', slug: 'cards-thumb-box' }, { label: 'Carousel', slug: 'cards-thumb-box-carousel' }], overlays: [] },
    ] },
    { cat: 'Feature Sections', sub: 'Explaining capabilities — media, copy and lists.', items: [
      { name: 'Illustration Split', v4: true, impact: 'supporting', whenToUse: 'Split layout pairing an insight with an illustration.', variants: [{ label: 'Default', slug: 'illustration-split' }, { label: 'Reversed', slug: 'illustration-split-rev' }] },
      { name: 'Statement + Stats', v4: true, impact: 'statement', whenToUse: 'An about section whose headline fills word-by-word on scroll, with count-up proof stats.', variants: [{ label: 'Default', slug: 'statement-stats' }], overlays: [] },
      { name: 'Synced Slider', v4: true, impact: 'statement', whenToUse: 'Auto-cycling video slider synced to copy.', variants: [{ label: 'Default', slug: 'synced-slider' }] },
      { name: 'Events', v4: true, impact: 'supporting', whenToUse: 'List of events with a featured panel.', variants: [{ label: 'Default', slug: 'events' }] },
      { name: 'Proof Points', v4: true, impact: 'supporting', whenToUse: 'Workhorse copy block — numbers, side-by-side or stacked.', variants: [
        { label: 'Numbers', slug: 'proof-points' }, { label: 'No numbers', slug: 'content-block-nonumbers' },
        { label: 'Side by side', slug: 'content-block-sidebyside' }, { label: 'Stack', slug: 'content-block-stack' }] },
    
      { name: 'Intro — Side by Side', v4: true, impact: 'supporting', reviewed: false, whenToUse: 'A two-column section intro: eyebrow, heading and lead on the left; a short list of icon-pillars (icon + title + line) on the right. Opens a topic area by naming its two or three core capabilities. Collapses to one column on mobile.', variants: [{ label: 'Default', slug: 'intro-side-by-side' }], overlays: [] },


      { name: 'Feature Spotlight', v4: true, impact: 'statement', whenToUse: 'Alternating large media and tight copy for a key feature.', variants: [{ label: 'Default', slug: 'feature-spotlight' }] },
      { name: 'Features — Auto-progress', v4: true, impact: 'supporting', whenToUse: 'Auto-advancing tabbed features that play through themselves.', variants: [{ label: 'Default', slug: 'features-autoprogress' }] },
      { name: 'Coverflow Carousel', impact: 'statement', whenToUse: 'Coverflow 3D carousel for a premium browse feel.', variants: [{ label: 'Default', slug: 'coverflow-carousel' }] },
      { name: 'Marquee', v4: true, mspeed: true, impact: 'supporting', whenToUse: 'Continuously scrolling strip for any repeated content — pauses on hover, resumes on leave. Demo: FX rate cards.', variants: [{ label: 'FX Cards', slug: 'marquee' }], overlays: [] },
      { name: 'Stories', impact: 'statement', whenToUse: 'Instagram-style story rail: gradient-ringed avatars opening a fullscreen viewer — segmented bars, auto-advance, image + video slides, tap/hold/swipe. Rings grey once fully seen.', variants: [{ label: 'Default', slug: 'stories' }], overlays: [] },
      { name: 'Ticker', v4: true, reviewed: false, mspeed: true, impact: 'statement', whenToUse: 'Bloomberg-style tape scrolling ANY repeated content — the capability is the component, the deals are demo content (same doctrine as Marquee). Band paint rides surface tokens.', variants: [{ label: 'Deals', slug: 'ticker' }] },
      { name: 'Quote Band', impact: 'statement', reviewed: false, whenToUse: 'One strong voice: a topic image beside a large pull-quote and name/role citation on a dark band. Reversed variant flips the columns (quote left, image right). For several voices reach for the Cards quote/testimonial compositions.', variants: [{ label: 'Default', slug: 'quote-band' }, { label: 'Reversed', slug: 'quote-band-rev' }, { label: 'Carousel', slug: 'quote-band-carousel' }], overlays: [], carouselctl: true },
      { name: 'Solutions & Awards', impact: 'supporting', whenToUse: 'List solutions and awards as credibility.', variants: [{ label: 'Default', slug: 'solutions-awards' }] },
      { name: 'Logo Wall', v4: true, reviewed: false, mspeed: true, cols: true, colsOpts: 'wall', mcols: true, impact: 'supporting', whenToUse: 'Partner or client logos as a wall — dividers are column-agnostic, so the Columns axis (3/4/5) and the Mobile columns axis (1/2) just work; logos grayscale, colour on hover. Marquee variant for a scrolling strip.', variants: [{ label: 'Grid', slug: 'logo-wall' }, { label: 'Marquee', slug: 'logo-wall-marquee' }] },
      { name: 'Market Band', impact: 'supporting', reviewed: false, whenToUse: 'A navy band with a split header and a row of solid market pills — a COMPOSITION of atoms carrying only the market-band marker class, live on five trading pages. For the map-textured original, put the same content on a world-map is-bleed section.', variants: [{ label: 'Default', slug: 'market-band' }], overlays: [] },
      { name: 'Link Directory', cols: true, colsOpts: 'dir', impact: 'supporting', reviewed: false, whenToUse: 'A categorized directory of text links — category headings over short link lists, laid out in columns, with an optional CTA. Reach for it to index "X by domain / by category" into deeper pages or sections (e.g. APIs by domain). Columns 2/3/4 axis (3 by default); recomposed per ground; collapses to one column on mobile.', variants: [{ label: 'Default', slug: 'link-directory' }], overlays: [] },
      { name: 'Useful Links', v4: true, cols: true, colsOpts: 'links', impact: 'utility', reviewed: false, whenToUse: 'A resource-row grid for the foot of a page: a ds-eyebrow head over columned hairline link rows. Each row carries a title, an optional meta line and a TYPE glyph \u2014 arrow = page, download = PDF (meta: PDF \u00b7 size), up-right = external (meta: the domain). Optional icon-tile marks, all-or-none per instance. Columns 1/2/3, default 3; stacks on mobile.', variants: [{ label: 'Default', slug: 'useful-links' }], overlays: [] },
    ] },
    { cat: 'Process & Steps', sub: 'Sequenced explanations — numbered steps and timelines.', items: [
      { name: 'How It Works — Steps', v4: true, impact: 'supporting', whenToUse: 'A numbered "how it works" sequence with a short list under each step.', variants: [{ label: 'Default', slug: 'how-it-works-steps' }], overlays: [] },
      { name: 'How It Works — Timeline', v4: true, impact: 'supporting', whenToUse: 'The same sequence as a connected timeline of numbered nodes.', variants: [{ label: 'Default', slug: 'how-it-works-timeline' }], overlays: [] },
    ] },
    { cat: 'Blogs & Articles', sub: 'Article, insight and case-study cards.', items: [
      { name: 'Article Card (hidden)', legacy: true, hidden: true, impact: 'supporting', whenToUse: 'Retired 2026-08-29 (Hakan): research/insight card grids use the cards-thumb family. Files kept for old dated pages; not offered for new work.', variants: [{ label: 'Default', slug: 'article-card' }], overlays: [] },
      { name: 'Article', v4: true, impact: 'statement', reviewed: false, whenToUse: 'The long-form article template — navy hero with byline, then a 68ch editorial body with lead, figures and a download rule. Compose a full article page from it plus Cards \u2014 Kicker takeaways and a Cards \u2014 Case Study related grid.', variants: [{ label: 'Default', slug: 'article' }], overlays: [] },
    ] },
    { cat: 'Bento Grids', sub: 'Mosaic layouts that summarize many capabilities at a glance.', items: [
      { name: 'Feature Highlight', v4: true, comp: true, bentohover: true, gutter: true, impact: 'supporting', whenToUse: 'One highlighted feature: media tile + ghost copy tile + three supporting cards.', variants: [{ label: 'Default', slug: 'feature-highlight' }], overlays: [] },
      { name: 'Bento — Feature Cards', v4: true, comp: true, bentohover: true, gutter: true, impact: 'statement', whenToUse: 'Summarize 4–6 capabilities as a rich, scannable mosaic.', variants: [{ label: 'Default', slug: 'bento-grid' }] },
      { name: 'Bento — Image Cards', v4: true, comp: true, bentohover: true, gutter: true, impact: 'statement', whenToUse: 'Summarize offerings as photo-led mosaic tiles.', variants: [{ label: 'Default', slug: 'bento-image-cards' }] },
      { name: 'Bento — Photographic', v4: true, comp: true, bentohover: true, gutter: true, impact: 'statement', whenToUse: 'Photo-forward bento — summarize themes through imagery.', variants: [{ label: 'Default', slug: 'bento-photo' }] },
      { name: 'Bento — Photographic (small)', v4: true, comp: true, bentohover: true, gutter: true, impact: 'statement', reviewed: false, whenToUse: 'The Photographic composition at the SMALL row unit — identical markup, only --bn-row changes (200px to 110px). Proof that tile sizing is per-markup: spans per tile, the row unit per section.', variants: [{ label: 'Default', slug: 'bento-photo-small' }], overlays: [] },
      { name: 'Bento — Spotlight', v4: true, comp: true, bentohover: true, gutter: true, impact: 'showpiece', whenToUse: 'Summarize while featuring one hero tile with a spotlight focus.', variants: [{ label: 'Default', slug: 'bento-spotlight' }] },
      { name: 'Bento — Magazine', v4: true, comp: true, bentohover: true, gutter: true, impact: 'statement', whenToUse: 'Editorial magazine-style mosaic to summarize a topic.', variants: [{ label: 'Default', slug: 'bento-magazine' }] },
      { name: 'Bento — Expand', impact: 'statement', whenToUse: 'Summarize capabilities in tiles that expand for detail.', variants: [{ label: 'Default', slug: 'bento-expand' }] },
    ] },
    { cat: 'Product & Device Showcases', sub: 'Product surfaces shown on real devices.', items: [
      { name: 'Product Showcase', v4: true, reviewed: false, impact: 'statement', whenToUse: 'Highlight a product feature set around a central visual.', variants: [{ label: 'Default', slug: 'product-showcase' }] },
      { name: 'Laptop Showcase', v4: true, reviewed: false, impact: 'statement', whenToUse: 'Product-on-laptop hero with floating spec badges.', variants: [{ label: 'Dark', slug: 'laptop-showcase' }] },
      { name: 'Devices & Features', v4: true, reviewed: false, impact: 'supporting', whenToUse: 'Pair a device visual with a feature list.', variants: [{ label: 'Default', slug: 'devices-features' }] },
      { name: 'Ecosystem (device + scroller)', v4: true, reviewed: false, impact: 'statement', whenToUse: 'Show an ecosystem — device image beside a product scroller.', variants: [{ label: 'Default', slug: 'ecosystem-devices' }], surfaces: [] },
    ] },
    { cat: 'Storytelling & Scroll', sub: 'Narrative sections — timeline, maps, ticker.', items: [
      { name: 'History Timeline', impact: 'statement', whenToUse: 'Walk through milestones on an animated timeline.', variants: [{ label: 'Default', slug: 'history-timeline' }] },
      { name: 'World Map - V1', v4: true, impact: 'showpiece', reviewed: false, whenToUse: 'Global reach network film, from the C&IB home (cib-home-final): "Your ambition, powered by our network." A scroll-scrubbed canvas map pins full-screen, opens on the intro line, flies from Dubai along routes to London, Cairo, Riyadh, Mumbai, Singapore, Shanghai and Tokyo, then lands on the Global reach / Local intelligence copy and four ranking stats. Landscape 16:9 on desktop and tablet, a recomposed portrait layout on phones; all copy is real HTML (sr-only mirror for screen readers), reduced motion shows the end state. Self-contained: global-reach.css + global-reach.js, one per page.', variants: [{ label: 'Default', slug: 'world-map' }] },
      { name: 'World Map - V2', v4: true, reviewed: false, impact: 'showpiece', whenToUse: 'Scroll-scrubbed dot-matrix world map: the headline docks, the camera flies UAE, region, Europe, Asia while market pins light up and a rolling counter tallies the markets. Copy and markets are editable HTML.', variants: [{ label: 'Default', slug: 'hex-reach-map' }], overlays: [] },
      { name: 'Video Chapters (scroll)', v4: true, reviewed: false, impact: 'showpiece', whenToUse: 'Pinned scroll sequence of numbered chapters over crossfading looping video backdrops — NOT tabs (renamed 2026-09-01); copy per chapter animates in as you scroll.', variants: [{ label: 'Default', slug: 'video-chapters' }] },
      { name: 'Zoom Parallax', impact: 'showpiece', whenToUse: 'Scroll-scaled image grid that zooms into view — pure spectacle.', variants: [{ label: 'Default', slug: 'zoom-parallax' }] },
      { name: 'Scroll Showcase', v4: true, impact: 'showpiece', whenToUse: 'A sticky visual whose image swaps as the reader scrolls through paired steps — not tabs: scroll drives it. Media left by default; the rev variant pins it right.', variants: [{ label: 'Media left', slug: 'scroll-showcase' }, { label: 'Media right', slug: 'scroll-showcase-rev' }], overlays: [] },
      { name: 'Feature Scroll Story', v4: true, impact: 'showpiece', reviewed: false, whenToUse: 'Pinned, scrubbed narrative on a light surface: numbered chapters crossfade in sync with product-UI mockup images (baked transparent PNGs) and floating HTML callouts. Reach for it to walk through 3–4 capabilities as a scroll act. Mockup right (default) or left (rev) — alternate sides across two stories on one page for rhythm.', variants: [{ label: 'Mockup right', slug: 'feature-scroll-story' }, { label: 'Mockup left', slug: 'feature-scroll-story-rev' }], overlays: [] },
      { name: 'Device Showcase (scroll)', v4: true, reviewed: false, impact: 'showpiece', whenToUse: 'Scroll-driven device demo: the device is a stack of transparent PNG renders (chrome + screen) that crossfade as each step is centred — pages swap the images. Device side per variant.', variants: [{ label: 'Phone', slug: 'phone-scroll' }, { label: 'Phone — device left', slug: 'phone-scroll-rev' }, { label: 'Desktop', slug: 'desktop-scroll' }, { label: 'Desktop — device right', slug: 'desktop-scroll-rev' }] },
      { name: 'Scroll Scenes', v4: true, reviewed: false, impact: 'showpiece', whenToUse: 'A pinned scroll sequence of full-screen SCENES — glowing title acts building to a promo finale. The app-download story is demo content (renamed from app-cinema 2026-09-01; runs on the generic scroll-story engine).', variants: [{ label: 'Download App', slug: 'scroll-scenes' }], surfaces: [], overlays: [] },
    ] },
    { cat: 'Stats', sub: 'Metrics, awards, transactions and partners.', items: [
      { name: 'Stats \u2014 Row', v4: true, comp: true, reviewed: false, cols: true, impact: 'statement', whenToUse: 'Headline metrics with count-up — prove scale fast. A cmp-cards composition: is-divided hairline cells of ds-num figures; Columns axis works like any cards grid.', variants: [{ label: 'Default', slug: 'stats-row' }], overlays: [] },
      { name: 'Stats \u2014 Quad', v4: true, reviewed: false, impact: 'supporting', whenToUse: 'A 2\u00d72 divided grid of ds-num figures with labels \u2014 four proof points as one calm block.', variants: [{ label: 'Default', slug: 'stats-quad' }] },
      { name: 'Stats \u2014 Hero Figure', v4: true, reviewed: false, impact: 'statement', whenToUse: 'ONE giant figure (ds-num is-xl) beside supporting ds-num stats in a divided row \u2014 when a single number IS the story.', variants: [{ label: 'Default', slug: 'stats-hero-figure' }] },
      { name: 'Fact Grid', v4: true, reviewed: false, cols: true, colsOpts: 'wall', mcols: true, impact: 'supporting', whenToUse: 'A hairline grid of compact typographic fact cells (eyebrow \u00b7 title \u00b7 value \u00b7 meta) \u2014 the FACTS are content; deals are the demo. 5-up by default; Columns 3/4/5 + Mobile columns 1/2 axes. For the logo-card wall use Cards \u2014 Tombstones.', variants: [{ label: 'Deals', slug: 'fact-grid' }] },
    ] },
    { cat: 'CTA & Banners', sub: 'Conversion moments and promotional bands.', items: [
      { name: 'CTA Marquee', v4: true, mspeed: true, impact: 'statement', whenToUse: 'Bold scrolling marquee call-to-action band.', variants: [{ label: 'Default', slug: 'cta-marquee' }] },
      { name: 'Static Banner', impact: 'supporting', whenToUse: 'Simple promotional banner.', variants: [{ label: 'Default', slug: 'static-banner' }] },
      { name: 'CTA Band', impact: 'supporting', whenToUse: 'Compact closing call-to-action band.', variants: [{ label: 'Default', slug: 'cta-band' }], overlays: [], align: true },
    ] },
    { cat: 'Tools & Calculators', sub: 'Interactive tools that compute a real answer — not mockups.', items: [
      { name: 'Loan Calculator', impact: 'statement', whenToUse: 'Live monthly-payment estimate — sliders for amount and term, with the monthly figure and total cost in a result panel alongside.', variants: [{ label: 'Default', slug: 'loan-calculator' }], overlays: [] },
      { name: 'Rewards Calculator (split)', impact: 'statement', whenToUse: 'Minimal per-category spend sliders (label + value + slider) beside a free content column — weighted-sum result, e.g. miles per year. Repurposable via data attributes.', variants: [{ label: 'Default', slug: 'rewards-calculator' }], overlays: [] },
    ] },
    { cat: 'Payment UI', sub: 'PNG-generation boilerplate — capture these mocks as transparent images for scroll stories and device slots; never paste them raw on pages.', items: [
      { name: 'Checkout Card', impact: 'supporting', whenToUse: 'Capture source: hosted-checkout card mock. Render, capture to a transparent PNG, use the image in scroll stories / device slots — not a page block.', variants: [{ label: 'Default', slug: 'checkout-card' }] },
      { name: 'POS Terminal', impact: 'supporting', whenToUse: 'Capture source: POS terminal mock for in-person payment imagery. Capture to PNG; not a page block.', variants: [{ label: 'Default', slug: 'pos-terminal' }] },
      { name: 'Phone Checkout', impact: 'supporting', whenToUse: 'Capture source: phone checkout mock for mobile-payment imagery. Capture to PNG; not a page block.', variants: [{ label: 'Default', slug: 'phone-checkout' }] },
      { name: 'Payment Link', impact: 'supporting', whenToUse: 'Capture source: payment-link card mock. Capture to PNG; not a page block.', variants: [{ label: 'Default', slug: 'payment-link' }] },
      { name: 'Chat Pay Invite', impact: 'supporting', whenToUse: 'Capture source: chat pay-invite mock. Capture to PNG; not a page block.', variants: [{ label: 'Default', slug: 'chat-pay-invite' }] },
      { name: 'Browser Checkout', impact: 'supporting', whenToUse: 'Capture source: browser-window checkout mock. Capture to PNG; not a page block.', variants: [{ label: 'Default', slug: 'browser-checkout' }] },
      { name: 'API Request', impact: 'supporting', whenToUse: 'Capture source: API request/response mock for developer imagery. Capture to PNG; not a page block.', variants: [{ label: 'Default', slug: 'api-request' }] },
    ] },
    { cat: 'UI Elements', sub: 'Building blocks — forms, badges, overlays, tables.', items: [
      { name: 'Form Elements', v4: true, impact: 'utility', reviewed: false, whenToUse: 'The form atom family — floating-label fields (input/textarea/select), checkbox, radio, toggle, upload drop area and search input. All keyboard-reachable with visible focus; labels via aria-label + sibling label, never for/id. Never hand-roll a form control.', variants: [{ label: 'Default', slug: 'form-elements' }], overlays: [] },
      { name: 'Form Shell', v4: true, impact: 'supporting', reviewed: false, whenToUse: 'The full form-page pattern — audience pill-tabs over a card of fieldsets with validation and a success state, beside a sticky what-happens-next aside. Reach for it for application and support-request pages; the mock submit is wired by ds.js.', variants: [{ label: 'Default', slug: 'form-shell' }], overlays: [] },
      { name: 'Breadcrumb', v4: true, impact: 'utility', reviewed: false, whenToUse: 'The crumb trail under the header — links + separator (slash or chevron), last crumb is plain text marking the current page. Sits at the top of deep pages; keep it to one line.', variants: [{ label: 'Default', slug: 'breadcrumb' }], overlays: [] },
      { name: 'Pagination', v4: true, impact: 'utility', reviewed: false, whenToUse: 'Page controls for long lists — numbered buttons, prev/next, compact and with-count variants. Icon-only chevrons carry labels; the active page is marked, disabled ends are real disabled buttons.', variants: [{ label: 'Default', slug: 'pagination' }], overlays: [] },
      { name: 'Buttons', v4: true, impact: 'utility', reviewed: false, whenToUse: 'The sanctioned button atom family — filled, outline (outline-light is THE outline for dark surfaces), sizes, icon and disabled states. Flip the Surface control to check any variant on navy; never invent a new button class.', variants: [{ label: 'Default', slug: 'buttons' }], overlays: [] },
      { name: 'Section Header', impact: 'utility', reviewed: false, comp: true, whenToUse: 'COMPOSITION — the standard section header from pure atoms: ds-stack (eyebrow + tag-agnostic title) + optional sh-lead + optional sh-action. Every header carries the alignment axis — use the Header control here to flip left / centred / right / split live. Never wrap a header in a bespoke flex row.', variants: [{ label: 'Default', slug: 'section-header' }], overlays: [] },
      { name: 'Typography', v4: true, impact: 'utility', reviewed: false, whenToUse: 'The type atom ramp — every .type-* size, weight and colour class, plus THE tag-agnostic rule: the HTML tag carries semantics (one h1 per page), the class carries the size. An h2 with class type-h1 renders identically to an h1 with it. Never size text with a tag.', variants: [{ label: 'Default', slug: 'typography' }], overlays: [] },
      { name: 'Icon Tiles & Numbers', v4: true, impact: 'utility', reviewed: false, whenToUse: 'The standard marks for cards and feature rows: icon-tile (one squared icon container — sizes, shapes, fills; any inline SVG drops in) and ds-num (one big-stat ramp with an accent unit), beside the stat-card panel. Never hand-roll an icon square or a number clamp.', variants: [{ label: 'Default', slug: 'icon-tiles' }], overlays: [] },
      { name: 'Card Surfaces', v4: true, impact: 'utility', reviewed: false, whenToUse: 'EVERY card type in one board, copy-paste ready: the ds-card looks (raised/tile/grey/flat/hover), the clear card + glass ladder (each a declared ground), and the dark-card regime (a surface class on the frame). A card DECLARES its own ground (card-panel surface-white, … surface-glass): flip the section Surface and the card keeps the ground it names, because the composition says so — not because a CSS rule rescued it. Never hand-roll a white card.', variants: [{ label: 'Default', slug: 'card-surfaces' }], overlays: [] },
      { name: 'Illustration Video', v4: true, impact: 'supporting', reviewed: false, whenToUse: 'ILLUSTRATION CAPABILITY 2 of 2 (doctrine: Addendum 3, 2026-09-03): a looping MP4 with the background BAKED IN and no player chrome — muted/autoplay/loop/playsinline/poster, never controls. Reach for it when the artwork is rendered (3D, photographic, textured) or the piece is too heavy to draw. The bake targets a FLAT face, so one file per surface (the filename says which) and BT.709 colour tags are mandatory — a hair off shows a ghost rectangle. Reduced motion is handled globally by ds.js: poster instead of playback. For drawn artwork reach for Lottie.', variants: [{ label: 'Default', slug: 'illustration-video' }], overlays: [] },
      { name: 'Lottie', v4: true, impact: 'supporting', reviewed: false, whenToUse: 'ILLUSTRATION CAPABILITY 1 of 2 (doctrine: Addendum 3, 2026-09-03): drawn vector illustration shipped as a JSON asset and rendered as live SVG — a few KB, resolution-free, TRANSPARENT, so one file sits on every surface and brand. One data-behavior="lottie" contract; the pinned player (lottie-web 5.12.2 light) is vendored and lazy-loaded by ds.js, so pages never carry a script. The poster is the sizer, the fallback and the whole reduced-motion state. Directional animations need a mirrored export — the engine does not flip. For rendered or photographic artwork reach for Illustration Video.', variants: [{ label: 'Default', slug: 'lottie' }], overlays: [] },
      { name: 'Badges, Tags & Lists', v4: true, impact: 'utility', whenToUse: 'Small content atoms: status badges, category tags and the checked-bullet list (list-check) — all generic, all recomposed per ground.', variants: [{ label: 'Default', slug: 'badges-tags' }] },
      { name: 'Modal', v4: true, impact: 'utility', reviewed: false, whenToUse: 'Overlay dialog for a focused task — confirm, destructive-confirm, cover and plain shapes, wired by the data-modal recipe. A light island: its panel keeps light ink on any surface. Classes currently require the cmp-modal ancestor — do not paste the inner markup alone.', variants: [{ label: 'Default', slug: 'modal' }], overlays: [] },
      { name: 'Toast', v4: true, impact: 'utility', reviewed: false, whenToUse: 'Transient toast messages and inline notification banners in the five role tones (success/error/warning/info/neutral). Static showcase — pages position and dismiss them. Classes currently require the cmp-toast ancestor — do not paste the inner markup alone.', variants: [{ label: 'Default', slug: 'toast' }], overlays: [] },
      { name: 'Table', v4: true, impact: 'utility', whenToUse: 'Tabular data.', variants: [{ label: 'Default', slug: 'table' }] },
      { name: 'Empty State', v4: true, impact: 'utility', reviewed: false, whenToUse: 'Placeholder for no-content states — full card (icon + title + body + action) and compact inline row, with an error tone for failures. A light island on dark surfaces.', variants: [{ label: 'Default', slug: 'empty-state' }], overlays: [] },
    ] },
  ];;

  var slugId = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); };
  var groupById = function (id) { for (var i = 0; i < CATALOG.length; i++) if (slugId(CATALOG[i].cat) === id) return CATALOG[i]; return null; };
  // `hidden: true` keeps a block IN the library (its file, CSS and dossier stay,
  // and pages that already paste it are untouched) while dropping its card from
  // the gallery — for superseded variants we no longer want anyone picking.
  // Catalogued-but-hidden also keeps the blocks<->catalog<->dossier contract
  // whole, which the verify gate checks.
  var shown = function (g) { return g.items.filter(function (i) { return !i.hidden; }); };
  var variantTotal = function () { return CATALOG.reduce(function (n, g) { return n + shown(g).reduce(function (m, i) { return m + i.variants.length; }, 0); }, 0); };
  var itemTotal = function () { return CATALOG.reduce(function (n, g) { return n + shown(g).length; }, 0); };

  /* ── overlay helpers (inline mode) ─────────────────────────────────────── */
  // Each entry: { host, media }. media is set when the picture is an ELEMENT
  // (video / scrubbed canvas) rather than a CSS background — the overlay must
  // then slot after that sibling, not behind it.
  function overlayHosts(scope) {
    var found = []; var seen = new Set();
    scope.querySelectorAll('*').forEach(function (el) {
      if (found.length > 8) return;
      if ((el.tagName === 'VIDEO' || el.tagName === 'CANVAS') && el.parentElement) {
        if (!seen.has(el.parentElement)) { seen.add(el.parentElement); found.push({ host: el.parentElement, media: el }); }
        return;
      }
      try { var bg = getComputedStyle(el).backgroundImage; if (bg && bg.indexOf('url(') !== -1 && !seen.has(el)) { seen.add(el); found.push({ host: el, media: null }); } } catch (e) {}
    });
    return found;
  }
  function applyOverlay(scope, key) {
    scope.querySelectorAll('.lib-ov').forEach(function (o) { o.remove(); });
    var cls = OV_MAP[key]; if (!cls) return;
    overlayHosts(scope).forEach(function (entry) {
      var h = entry.host;
      if (getComputedStyle(h).position === 'static') h.style.position = 'relative';
      var o = document.createElement('div'); o.className = 'ov lib-ov ' + cls;
      if (entry.media) {
        // Element media (video/canvas): insert as the media's NEXT SIBLING —
        // DOM order paints the tint above the media but below the copy and
        // authored scrims that follow it, with no z-index games. (z:-1 here
        // would drop the tint BEHIND the media — the old invisible-overlay bug.)
        entry.media.insertAdjacentElement('afterend', o);
      } else {
        var copy = h.querySelector('h1,h2,h3,h4,h5,h6,p,a,button,li');
        if (copy) {
          // Copy shares the host with the background. If the copy sits in a
          // positive z-index layer (hero pattern: media z:0, content z:2+),
          // slot the tint one level below it — above every media layer,
          // incl. pseudo-element mirrors (e.g. Ken Burns ::before at z:0)
          // that a z:-1 child would end up BEHIND. Only when the copy is
          // unlayered fall back to isolate + z:-1 to stay under the text.
          var zProtect = 0;
          for (var n = copy; n && n !== h; n = n.parentElement) {
            var zs = getComputedStyle(n).zIndex;
            if (zs !== 'auto' && parseInt(zs, 10) > 0) { zProtect = parseInt(zs, 10); break; }
          }
          if (zProtect > 0) { o.style.zIndex = String(zProtect - 1); }
          else { h.style.isolation = 'isolate'; o.style.zIndex = '-1'; }
        }
        h.appendChild(o);
      }
    });
  }

  // is-split is a flex row, so EVERY direct child becomes its own column. Eyebrow +
  // heading must live in ONE wrapper or they scatter apart. Wrap loose children
  // (everything except the .sh-lead) into a .ds-stack so the row only sees
  // [group] [lead]. No-op when the block already groups them (most do).
  function groupSplit(h) {
    if (h.querySelector(':scope > .ds-stack')) return;
    var lead = h.querySelector(':scope > .sh-lead');
    var loose = [].filter.call(h.children, function (c) { return c !== lead; });
    if (!loose.length) return;
    var grp = document.createElement('div'); grp.className = 'ds-stack';
    h.insertBefore(grp, lead || null);
    loose.forEach(function (c) { grp.appendChild(c); });
  }
  // Override the header alignment variant (Header control). '' = as built;
  // 'left' = strip variants; 'is-center'/'is-split' = force that layout.
  function applyHead(scope, head) {
    if (!head) return;
    scope.querySelectorAll('.section-head, .section-head-sm').forEach(function (h) {
      h.classList.remove('is-left', 'is-center', 'is-right', 'is-split');
      if (head === 'is-split') groupSplit(h);
      h.classList.add(head);
    });
  }

  // Content-alignment override (Align control, opt-in per catalog item).
  // '' = as built; is-left / is-center / is-right are variant classes on .cmp.
  function applyAlign(scope, align) {
    var cmp = scope.querySelector('.cmp'); if (!cmp) return;
    cmp.classList.remove('is-left', 'is-center', 'is-right');
    if (align) cmp.classList.add(align);
  }
  function applyCols(scope, cols) {
    var cmp = scope.querySelector('.cmp'); if (!cmp) return;
    if (!cols) return;                       // As built — never strip authored columns
    cmp.classList.remove('is-cols-5', 'is-cols-4', 'is-cols-3', 'is-cols-2', 'is-cols-auto');
    cmp.classList.add(cols);
  }
  function applyCta(scope, cta) {
    var cmp = scope.querySelector('.cmp'); if (!cmp) return;
    cmp.classList.remove('is-cta-text', 'is-cta-btn');
    if (cta) cmp.classList.add(cta);
  }

  /* ── Arabic / RTL preview (EN·AR toggle) ──────────────────────────────────
     Flips the preview to dir="rtl" + lang="ar" + .lang-ar (Tajawal via
     fonts.css/ds.css). Content stays as authored — this tests layout
     mirroring + the Arabic typeface, and doubles as the RTL audit tool. */
  function applyRtl(scope, rtl) {
    if (rtl) { scope.setAttribute('dir', 'rtl'); scope.setAttribute('lang', 'ar'); scope.classList.add('lang-ar'); }
    else { scope.removeAttribute('dir'); scope.removeAttribute('lang'); scope.classList.remove('lang-ar'); }
  }

  /* ── render a card per its state (device / surface / overlay / header / rtl) ── */
  async function renderInline(stage, slug, surface, overlay, head, rtl, align, place, cols, cta, cardsurf, cardov, hover, cauto, cnav, malign, gutter, wmink, mcols, mspeed) {
    stage.innerHTML = '<div class="lib-load"><small>Loading…</small></div>';
    try {
      stage.innerHTML = await (await fetch('blocks/' + slug + '.html', { cache: 'no-store' })).text();
      var cmp = stage.querySelector('.cmp');
      // THE SURFACE CONTROL IS A MARKUP SWAP (Hakan, 2026-09-03): flipping the
      // ground shows a DIFFERENT COMPOSITION, recomposed by the pairing
      // rulebook in assets/js/ds-palette.js — the same rulebook the gate
      // enforces. No CSS adapts anything.
      if (cmp && surface) DSPalette.recompose(cmp, surface);
      if (cmp && /\bsurface-image\b/.test(surface || '')) cmp.setAttribute('data-bg', surfaceImageAsset(currentTheme()));
      applyHead(stage, head);
      applyAlign(stage, align);
      if (malign) { var mc = stage.querySelector('.cmp'); if (mc) mc.classList.add(malign); }
      if (gutter) { var gc = stage.querySelector('.cmp'); if (gc) gc.style.setProperty('--bn-gap', gutter); }
      if (wmink) { var wc = stage.querySelector('.cmp'); if (wc) wc.classList.add(wmink); }
      if (mcols) { var mc = stage.querySelector('.cmp'); if (mc) { mc.classList.remove('is-m-cols-1', 'is-m-cols-2'); mc.classList.add(mcols); } }
      if (mspeed) { stage.querySelectorAll('.marquee').forEach(function (m) { m.style.setProperty('--marquee-dur', mspeed); }); }
      applyCols(stage, cols);
      applyCta(stage, cta);
      applyCardSurf(stage, cardsurf);
      applyCardOv(stage, cardov);
      applyCarousel(stage, cauto, cnav);
      if (hover) { var c9 = stage.querySelector('.cmp'); if (c9) { c9.classList.remove('is-hover-zoom','is-hover-lift','is-hover-fill','is-hover-spotlight','is-hover-none'); hover.split(' ').forEach(function (h) { c9.classList.add(h); });
        if (hover === 'is-hover-spotlight') { var g9 = c9.querySelector('.bn-grid'); if (g9 && !g9.hasAttribute('data-behavior')) g9.setAttribute('data-behavior', 'spotlight'); c9.querySelectorAll('.bn-tile').forEach(function (t) { t.setAttribute('data-spotlight-tile', ''); }); if (window.DS && DS.refresh) DS.refresh(c9); } } }
      if (place) { var c0 = stage.querySelector('.cmp'); if (c0) { c0.classList.remove('is-top','is-middle','is-bottom'); c0.classList.add(place); } }
      applyRtl(stage, rtl);
      // AR preview copy: swap visible strings via the gallery dictionary —
      // before refresh (clones inherit Arabic) and after (injected strings).
      if (rtl && window.ARP) ARP.translate(stage);
      if (window.DS) DS.refresh(stage);
      if (rtl && window.ARP) ARP.translate(stage);
      if (overlay) applyOverlay(stage, overlay);
      toggleHeadCtrl(stage, !!stage.querySelector('.section-head, .section-head-sm'));
    } catch (e) { stage.innerHTML = '<div class="lib-load"><small>Could not load ' + slug + '</small></div>'; }
  }
  // The Header control only makes sense on blocks with a .section-head — hide it
  // otherwise so it's never a misleading no-op (heroes, modals, bespoke headers).
  function toggleHeadCtrl(node, has, canSplit) {
    var card = node.closest ? node.closest('.lib-card') : node; if (!card) return;
    var sel = card.querySelector('.lib-select[data-role="head"]');
    if (!sel) return;
    sel.style.display = has ? '' : 'none';
    // Split is ALWAYS offered (Hakan 2026-09-01) — a header without a lead
    // simply renders like Left. (The old n/a guardrail also had a bug: the
    // inline desktop path never passed canSplit, disabling Split everywhere.)
  }
  function renderFrame(stage, slug, surface, overlay, dev, head, rtl, align, place, cols, cta, cardsurf, cardov, hover, cauto, cnav, malign, gutter, wmink, mcols, mspeed) {
    var params = new URLSearchParams({ c: slug });
    if (place) params.set('place', place);
    if (surface) params.set('surface', surface);
    if (overlay) params.set('overlay', overlay);
    if (head) params.set('head', head);
    if (rtl) params.set('rtl', '1');
    if (align) params.set('align', align);
    if (cols) params.set('cols', cols);
    if (cta) params.set('cta', cta);
    if (cardsurf) params.set('cardsurf', cardsurf);
    if (cardov) params.set('cardov', cardov);
    if (hover) params.set('hover', hover);
    if (cauto) params.set('cauto', cauto);
    if (cnav) params.set('cnav', cnav);
    if (malign) params.set('malign', malign);
    if (gutter) params.set('gutter', gutter);
    if (wmink) params.set('wmink', wmink);
    if (mcols) params.set('mcols', mcols);
    if (mspeed) params.set('mspeed', mspeed);
    if (currentTheme()) params.set('theme', currentTheme());
    var vw = DEV_W[dev], devH = 0;
    if (dev === 'foldable') { var cardEl = stage.closest('.lib-card'), fwh = FOLD_WH[(cardEl && cardEl.dataset.fold) || ''] || FOLD_WH['']; vw = fwh[0]; devH = fwh[1]; }
    var vpStyle = vw ? 'width:' + vw + 'px' : 'width:100%';   // desktop scroll components → full width
    stage.innerHTML = '<div class="lib-vp" style="' + vpStyle + '"><iframe class="lib-if" src="frame.html?' + params + '" title="' + slug + '"' + (devH ? ' data-devh="' + devH + '"' : '') + '></iframe></div>';
  }
  function heavyPlaceholder(card) {
    var stage = card.querySelector('.lib-stage'); stage.className = 'lib-stage';
    stage.innerHTML = '<div class="lib-load"><span class="lib-play">▶</span><b>Load live preview</b><small>Heavy component — click to render</small></div>';
    stage.querySelector('.lib-load').addEventListener('click', function () { card.dataset.armed = '1'; render(card); });
  }
  function render(card) {
    var stage = card.querySelector('.lib-stage');
    var slug = card.dataset.slug, dev = card.dataset.dev, surface = card.dataset.surface, overlay = card.dataset.overlay, head = card.dataset.head, rtl = card.dataset.rtl, align = card.dataset.align;
    var place = card.dataset.place || '';
    var cols = card.dataset.cols || '';
    var cta = card.dataset.cta || '';
    var cardsurf = card.dataset.cardsurf || '';
    var cardov = card.dataset.cardov || '';
    var hover = card.dataset.hover || '';
    var cauto = card.dataset.cauto || '';
    var cnav = card.dataset.cnav || '';
    var malign = card.dataset.malign || '';
    var gutter = card.dataset.gutter || '';
    var wmink = card.dataset.wmink || '';
    var mcols = card.dataset.mcols || '';
    var mspeed = card.dataset.mspeed || '';
    if (HEAVY.has(slug) && !card.dataset.armed) { heavyPlaceholder(card); return; }
    // Scroll/pinned components ALWAYS use the (fixed-height, natively scrolling)
    // iframe — even on desktop — so the sticky pin + scroll progress work.
    if (dev === 'desktop' && !SCROLL_SLUGS.has(slug)) { stage.className = 'lib-stage'; renderInline(stage, slug, surface, overlay, head, rtl, align, place, cols, cta, cardsurf, cardov, hover, cauto, cnav, malign, gutter, wmink, mcols, mspeed); }
    else { stage.className = 'lib-stage lib-stage-framed'; renderFrame(stage, slug, surface, overlay, dev, head, rtl, align, place, cols, cta, cardsurf, cardov, hover, cauto, cnav, malign, gutter, wmink, mcols, mspeed); }
  }

  function selectHTML(role, opts, hidden) { return '<select class="lib-select"' + (hidden ? ' style="display:none"' : '') + ' data-role="' + role + '">' + opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select>'; }

  /* ── ⓘ dossier panel — the library is the CANONICAL home of each
     component's how-to (Hakan 2026-09-01): the same docs/catalog/<slug>.md
     the page-builder reads, rendered for humans in a slide-over. ── */
  function mdToHtml(md) {
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var out = [], lines = md.split('\n'), inCode = false, inList = false, inTable = false;
    var inline = function (s) {
      return s.replace(/`([^`]+)`/g, function (_, c) { return '<code>' + c + '</code>'; })
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\[\[([a-z0-9-]+)\]\]/g, '<code>$1</code>');
    };
    var closeAll = function () { if (inList) { out.push('</ul>'); inList = false; } if (inTable) { out.push('</table>'); inTable = false; } };
    var para = [];
    var flushP = function () { if (para.length) { out.push('<p>' + para.join(' ') + '</p>'); para = []; } };
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i], l = esc(raw);
      if (/^```/.test(raw)) { closeAll(); flushP(); out.push(inCode ? '</pre>' : '<pre>'); inCode = !inCode; continue; }
      if (inCode) { out.push(l + '\n'); continue; }
      if (/^\|/.test(raw)) {
        if (/^\|[\s:-]+\|/.test(raw.replace(/\|/g, '|'))) continue;
        if (!inTable) { closeAll(); flushP(); out.push('<table>'); inTable = true; }
        var cells = l.replace(/^\||\|$/g, '').split('|').map(function (c) { return '<td>' + inline(c.trim()) + '</td>'; }).join('');
        out.push('<tr>' + cells + '</tr>'); continue;
      }
      if (/^### /.test(raw)) { closeAll(); flushP(); out.push('<h4>' + inline(l.slice(4)) + '</h4>'); continue; }
      if (/^## /.test(raw)) { closeAll(); flushP(); out.push('<h3>' + inline(l.slice(3)) + '</h3>'); continue; }
      if (/^# /.test(raw)) { closeAll(); flushP(); out.push('<h2>' + inline(l.slice(2)) + '</h2>'); continue; }
      if (/^[-*] /.test(raw)) { if (inTable) { out.push('</table>'); inTable = false; } if (!inList) { flushP(); out.push('<ul>'); inList = true; } out.push('<li>' + inline(l.slice(2)) + '</li>'); continue; }
      if (/^\s+/.test(raw) && (inList || inTable)) { /* hard-wrapped continuation */ out[out.length - 1] = out[out.length - 1].replace(/<\/(li|td)>(<\/tr>)?$/, ' ' + inline(l.trim()) + '</$1>$2'); continue; }
      if (!raw.trim()) { closeAll(); flushP(); continue; }
      closeAll(); para.push(inline(l.trim()));
    }
    closeAll(); flushP(); if (inCode) out.push('</pre>');
    return out.join('');
  }
  function ensureInfoPanel() {
    var ov = document.querySelector('.lib-info-overlay');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.className = 'lib-info-overlay';
    ov.innerHTML = '<div class="lib-info-panel" role="dialog" aria-label="Component usage"><button class="lib-info-close" aria-label="Close">\u00d7</button><div class="lib-info-body"></div></div>';
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.lib-info-close')) ov.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ov.classList.remove('open'); });
    document.body.appendChild(ov);
    return ov;
  }
  function openInfo(card) {
    var ov = ensureInfoPanel(), body = ov.querySelector('.lib-info-body');
    var slug = card.dataset.slug, slug0 = card.dataset.slug0 || slug;
    body.innerHTML = '<p>Loading\u2026</p>';
    ov.classList.add('open');
    fetch('docs/catalog/' + slug + '.md')
      .then(function (r) { if (!r.ok && slug !== slug0) return fetch('docs/catalog/' + slug0 + '.md'); return r; })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (t) { body.innerHTML = mdToHtml(t); body.scrollTop = 0; })
      .catch(function () { body.innerHTML = '<p>No dossier found for \u201c' + slug + '\u201d.</p>'; });
  }

  function buildCard(item, catName) {
    var slug0 = item.variants[0].slug;
    var heavy = item.variants.some(function (v) { return HEAVY.has(v.slug); });
    var card = document.createElement('div');
    card.className = 'lib-card';
    card.dataset.slug = slug0; card.dataset.slug0 = slug0; card.dataset.dev = 'desktop'; card.dataset.surface = ''; card.dataset.overlay = ''; card.dataset.head = ''; card.dataset.rtl = ''; card.dataset.align = ''; card.dataset.cols = ''; card.dataset.cta = ''; card.dataset.cardsurf = ''; card.dataset.cardov = ''; card.dataset.hover = ''; card.dataset.cauto = ''; card.dataset.cnav = '';
    card.dataset.search = (item.name + ' ' + item.variants.map(function (v) { return v.slug; }).join(' ') + ' ' + catName + ' ' + (item.impact || '') + ' ' + (item.whenToUse || '')).toLowerCase();
    var chips = item.variants.length > 1
      ? '<div class="lib-chips">' + item.variants.map(function (v, i) { return '<button class="lib-chip' + (i === 0 ? ' active' : '') + '" data-slug="' + v.slug + '">' + v.label + '</button>'; }).join('') + '</div>' : '';
    var seg = '<div class="lib-seg">' + ['desktop', 'tablet', 'mobile', 'foldable'].map(function (d, i) { return '<button data-dev="' + d + '"' + (i === 0 ? ' class="active"' : '') + ' title="' + d + '">' + ICON[d] + '</button>'; }).join('') + '</div>';
    var langSeg = '<div class="lib-seg lib-lang" title="Preview direction — EN (LTR) / AR (RTL + Tajawal)">' +
      '<button data-rtl="" class="active" title="English · LTR">EN</button>' +
      '<button data-rtl="1" title="عربي · RTL">AR</button></div>';
    // Per-block surface support. `surfaces` on a catalog item constrains the
    // Surface control: [] = single-surface by design (e.g. artwork with a
    // baked-in background) — the control is dropped entirely rather than
    // offered as a silent no-op; a non-empty list filters the options.
    var surfaceOpts = !item.surfaces ? SURFACES.slice()
      : item.surfaces.length === 0 ? null
      : SURFACES.filter(function (s) { return !s[0] || item.surfaces.indexOf(s[0]) !== -1; });
    // Bento Grids get the extra "Background Image" surface appended.
    if (surfaceOpts && catName === 'Bento Grids') surfaceOpts = surfaceOpts.concat([BENTO_BG_SURFACE]);
    // surfaces: [] drops the control entirely (same convention as overlays) —
    // for blocks whose surface is their own media, e.g. a full-bleed hero.
    var surfaceSel = (item.surfaces && item.surfaces.length === 0) ? ''
      : (surfaceOpts ? selectHTML('surface', surfaceOpts) : '');
    // Same convention for overlays: [] = drop the Overlay control (block has no
    // background media, so every overlay would be a silent no-op — e.g. cta-band).
    var overlaySel = (item.overlays && item.overlays.length === 0) ? '' : selectHTML('overlay', OVERLAYS);
    // Align control is opt-in (align: true) — only for blocks with real
    // is-left / is-center / is-right variant classes in ds.css.
    var alignSel = item.align ? selectHTML('align', ALIGNS) : '';
    var placeSel = item.place ? selectHTML('place', PLACES) : '';
    var malignSel = item.malign ? selectHTML('malign', MALIGNS) : '';
    var gutterSel = item.gutter ? selectHTML('gutter', GUTTERS) : '';
    var wminkSel = item.wmink ? selectHTML('wmink', WMINKS) : '';
    var mcolsSel = item.mcols ? selectHTML('mcols', MCOLS) : '';
    var mspeedSel = item.mspeed ? selectHTML('mspeed', MSPEEDS) : '';
    var colsSel = item.cols ? selectHTML('cols', item.colsOpts === 'wall' ? WALLCOLS : item.colsOpts === 'dir' ? DIRCOLS : item.colsOpts === 'links' ? LINKCOLS : COLS) : '';
    var ctaSel = item.cta ? selectHTML('cta', CTAS) : '';
    var cardSel = item.cardsurf ? selectHTML('cardsurf', CARDSURFS) : '';
    var hoverSel = item.bentohover ? selectHTML('hover', BENTO_HOVERS) : item.hover ? selectHTML('hover', HOVERS) : '';
    var cAutoSel = item.carouselctl ? selectHTML('cauto', AUTOPLAYS) : '';
    var cNavSel = item.carouselctl ? selectHTML('cnav', NAVS) : '';
    var cardOvSel = item.cardov ? selectHTML('cardov', [['', 'Card overlay · As built'], ['off', 'None']].concat(OVERLAYS.slice(1))) : '';
    var impact = item.impact || 'utility';
    card.innerHTML =
      '<div class="lib-head">' +
        '<span class="lib-name">' + item.name + '</span>' +
        '<span class="lib-impact lib-impact-' + impact + '" title="Visual impact: ' + impact + '">' + (IMPACT_LABEL[impact] || impact) + '</span>' +
        '<span class="lib-slug">' + slug0 + (item.variants.length > 1 ? ' +' + (item.variants.length - 1) : '') + '</span>' +
        '<button class="lib-info" title="How to use this component — opens the dossier" aria-label="How to use">i</button>' +
        (heavy ? '<span class="lib-tag-heavy">heavy</span>' : '') +
        (item.comp ? '<span class="lib-tag-comp" title="A COMPOSITION — pure atoms on an existing component root; no CSS of its own">Composition</span>' : '') +
        (item.v4 ? '<span class="lib-tag-new" title="Rebuilt on the v4 atom/composition architecture in the standardization pass">New</span>' : '') +
        (item.legacy ? '<span class="lib-tag-legacy" title="Superseded by a v4 component — updated or retired at the sweep">Legacy</span>' : '') +
        (item.reviewed === false ? '<span class="lib-tag-unreviewed" title="New block — not yet reviewed by the front-end team">Unreviewed</span>' : '') +
        '<div class="lib-ctrls">' + chips + seg + selectHTML('fold', FOLDS, true) + langSeg + selectHTML('head', HEADS, true) + alignSel + placeSel + malignSel + gutterSel + wminkSel + colsSel + mcolsSel + mspeedSel + ctaSel + hoverSel + cAutoSel + cNavSel + cardSel + cardOvSel + surfaceSel + overlaySel +
          '<button class="lib-btn lib-replay" title="Replay animations">↻</button>' +
          '<button class="lib-btn lib-copy">Copy HTML</button>' +
        '</div>' +
        (item.whenToUse ? '<p class="lib-when">' + item.whenToUse + '</p>' : '') +
      '</div>' +
      '<div class="lib-stage"></div>';
    return card;
  }

  /* ── wire interactions on a main element + lazy render + global listeners ── */
  var _globalsBound = false;
  function bindGlobals() {
    if (_globalsBound) return; _globalsBound = true;
    window.addEventListener('message', function (e) {
      if (!e.data || e.data.type !== 'libFrameHeight') return;
      // Scroll/pinned components get a FIXED viewport height so the iframe
      // scrolls its (tall) content natively — that's what lets position:sticky
      // pin and scroll-driven recipes advance. Others size to their content.
      var h = e.data.scroll
        ? Math.round(Math.min(760, Math.max(560, window.innerHeight * 0.84)))
        : Math.max(160, e.data.h);
      document.querySelectorAll('iframe.lib-if').forEach(function (f) {
        if (f.contentWindow === e.source) { if (e.data.scroll && f.dataset.devh) h = +f.dataset.devh; f.style.height = h + 'px'; if (e.data.scroll) f.setAttribute('scrolling', 'yes'); toggleHeadCtrl(f, !!e.data.hasHead, !!e.data.canSplit); }
      });
    });
  }
  function toast(msg) {
    var t = document.getElementById('libToast'); if (!t) return;
    t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }
  function wire(main) {
    bindGlobals();
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); render(e.target); } }); }, { rootMargin: '320px 0px' });
    main.querySelectorAll('.lib-card').forEach(function (c) { io.observe(c); });

    main.addEventListener('click', function (e) {
      var card = e.target.closest('.lib-card'); if (!card) return;
      var chip = e.target.closest('.lib-chip');
      if (chip) { card.querySelectorAll('.lib-chip').forEach(function (c) { c.classList.toggle('active', c === chip); }); card.dataset.slug = chip.dataset.slug; if (!HEAVY.has(chip.dataset.slug)) card.dataset.armed = ''; render(card); return; }
      var lang = e.target.closest('.lib-lang button');
      if (lang) { card.querySelectorAll('.lib-lang button').forEach(function (b) { b.classList.toggle('active', b === lang); }); card.dataset.rtl = lang.dataset.rtl; render(card); return; }
      var seg = e.target.closest('.lib-seg button');
      if (seg) { card.querySelectorAll('.lib-seg button').forEach(function (b) { b.classList.toggle('active', b === seg); }); card.dataset.dev = seg.dataset.dev; var fs = card.querySelector('.lib-select[data-role="fold"]'); if (fs) fs.style.display = seg.dataset.dev === 'foldable' ? '' : 'none'; render(card); return; }
      if (e.target.closest('.lib-info')) { openInfo(card); return; }
      if (e.target.closest('.lib-replay')) { render(card); return; }
      if (e.target.closest('.lib-copy')) {
        var slug = card.dataset.slug;
        var surf = card.dataset.surface;
        // copy the composition the author is LOOKING AT, recomposed from the
        // block source (not the live DOM, which carries runtime clones)
        fetch('blocks/' + slug + '.html').then(function (r) { return r.text(); })
          .then(function (html) { return navigator.clipboard.writeText(surf ? DSPalette.recomposeHTML(html, surf) : html); })
          .then(function () { toast('Copied ' + slug + '.html' + (surf ? ' · ' + surf : '')); })
          .catch(function () { toast('Copy failed'); });
      }
    });
    main.addEventListener('change', function (e) {
      var sel = e.target.closest('.lib-select'); if (!sel) return;
      var card = e.target.closest('.lib-card'); card.dataset[sel.dataset.role] = sel.value; render(card);
    });
  }

  /* ── build the per-category page ───────────────────────────────────────── */
  function mountCategory(catId, main) {
    var g = groupById(catId) || CATALOG[0];
    var head = document.createElement('div');
    var legend = '<div class="lib-legend">' + IMPACT_TIERS.map(function (t) {
      return '<span class="lib-impact lib-impact-' + t + '">' + IMPACT_LABEL[t] + '</span>';
    }).join('') + '<span class="lib-legend-note">visual impact, loudest → quietest</span></div>';
    head.innerHTML = '<p class="lib-cat-h">Category</p><h1 class="lib-cat-title">' + g.cat + '</h1><p class="lib-cat-sub">' + g.sub + '</p>' + legend;
    main.appendChild(head);
    shown(g).forEach(function (item) { main.appendChild(buildCard(item, g.cat)); });
    var empty = document.createElement('p'); empty.className = 'lib-empty'; empty.id = 'libEmpty'; empty.textContent = 'No components match your search.'; main.appendChild(empty);
    wire(main);
    return g;
  }
  function buildSideNav(navEl, activeId) {
    CATALOG.forEach(function (g) {
      var id = slugId(g.cat);
      var a = document.createElement('a');
      a.href = 'category.html?cat=' + id;
      if (id === activeId) a.className = 'active';
      a.innerHTML = g.cat + '<span>' + shown(g).length + '</span>';
      navEl.appendChild(a);
    });
  }
  function buildHome(grid) {
    CATALOG.forEach(function (g) {
      var a = document.createElement('a');
      a.className = 'lib-dir-card'; a.href = 'category.html?cat=' + slugId(g.cat);
      a.innerHTML = '<div class="lib-dir-cat">' + g.cat + '</div><div class="lib-dir-sub">' + g.sub + '</div>' +
        '<div class="lib-dir-foot"><span class="lib-dir-count">' + shown(g).length + ' components</span><span class="lib-dir-go">Open →</span></div>';
      grid.appendChild(a);
    });
  }
  function filterCards(main, q) {
    q = (q || '').trim().toLowerCase(); var any = false;
    main.querySelectorAll('.lib-card').forEach(function (card) { var m = !q || card.dataset.search.indexOf(q) !== -1; card.style.display = m ? '' : 'none'; if (m) any = true; });
    var empty = document.getElementById('libEmpty'); if (empty) empty.style.display = any ? 'none' : 'block';
  }

  // Theme switch mounts on any page with a .lib-top bar (index + category).
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountThemeSwitch);
  else mountThemeSwitch();

  window.LIB = { CATALOG: CATALOG, IMPACT_TIERS: IMPACT_TIERS, IMPACT_LABEL: IMPACT_LABEL, slugId: slugId, itemTotal: itemTotal, variantTotal: variantTotal, mountCategory: mountCategory, buildSideNav: buildSideNav, buildHome: buildHome, filterCards: filterCards };
})();
