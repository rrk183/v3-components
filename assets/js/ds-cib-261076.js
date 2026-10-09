/* ═══════════════════════════════════════════════════════════════════════════
   ds.js — Emirates NBD Design System runtime (single pre-deployed file)

   One self-wiring behaviour registry. Loaded once per page; it scans the DOM
   on load and initialises whatever component markup is present — driven purely
   by classes + data-attributes, ID-free, multi-instance safe. Paste a
   component's HTML anywhere this runtime is loaded and it just works.

   Public API:
     DS.refresh(scope?)   re-scan a subtree after injecting markup (CMS / SPA)
     DS.register(fn)      add a behaviour (fn receives a scope element)

   Animation gate: animations only run inside an element flagged [data-animate]
   (or .animate). Outside that, content stays static/visible — so non-animated
   pages and reduced-motion users get clean, instant content.

   Tiers
     1 simple        [data-reveal], [data-countup]
     2 interactions  [data-tabs], [data-accordion], [data-carousel], modals
     3 recipes       [data-behavior="scroll-frames" | "zoom-parallax" | …]
═══════════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.DS) return;

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = ('IntersectionObserver' in window) && !prefersReduced;

  // Cached viewport height for scroll-progress math. On mobile the address bar
  // shows/hides as you scroll, which changes window.innerHeight every frame and
  // makes scroll-driven recipes (scroll-frames, scroll-story, ib-hero, zoom-
  // parallax) jitter/clip. We cache the height and refresh it ONLY on a real
  // WIDTH change (orientation/resize), ignoring address-bar-driven height churn.
  // (Ported from the antig branch's mobile scroll-engine fix.)
  var vpH = window.innerHeight;
  (function () {
    var w = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth !== w) { w = window.innerWidth; vpH = window.innerHeight; }
    }, { passive: true });
  })();

  var behaviors = [];
  function register(fn) { behaviors.push(fn); }
  function run(scope) {
    var s = scope || document;
    for (var i = 0; i < behaviors.length; i++) {
      try { behaviors[i](s); } catch (e) { if (window.console) console.error('[DS] behaviour error:', e); }
    }
  }
  function all(scope, sel) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function animated(el) { return !!el.closest('[data-animate], .animate'); }
  // RTL awareness — one runtime serves both directions; markup never knows about
  // Arabic. Horizontal-scroll math must adapt: in an RTL scroll container,
  // scrollLeft runs 0 → -(scrollWidth - clientWidth) (0 = the start position,
  // which is the RIGHT edge). Read the live computed direction, never a flag.
  function isRTL(el) { try { return getComputedStyle(el).direction === 'rtl'; } catch (e) { return false; } }

  /* ── Per-instance background image — keeps markup style-free ───────────────
     <span class="bp-img" data-bg="/assets/images/x.jpg"></span>
     The runtime sets background-image, so component HTML carries no inline CSS. */
  /* .sac-checkpill.is-checked — a <label> cannot react to its own checked input
     without the parent pseudo-class, and the verify gate budgets that to one use
     across ds.css (already spent). A class is cheaper and survives DS.refresh.
     Selects are NOT handled here: the runtime already syncs .field.has-value. */
  register(function checkPills(scope) {
    all(scope, '.sac-checkpill:not([data-pill-bound])').forEach(function (pill) {
      var input = pill.querySelector('input');
      if (!input) return;
      pill.setAttribute('data-pill-bound', '');
      var sync = function () { pill.classList.toggle('is-checked', input.checked); };
      input.addEventListener('change', sync);
      sync();
    });
  });

  register(function backgrounds(scope) {
    var apply = function (el) {
      if (el.hasAttribute('data-bg-done')) return;
      el.setAttribute('data-bg-done', '');
      el.style.backgroundImage = "url('" + el.getAttribute('data-bg') + "')";
    };
    var els = all(scope, '[data-bg]:not([data-bg-done])');
    if (!('IntersectionObserver' in window)) {
      els.forEach(apply);
      return;
    }
    var MARGIN = 300;
    var nearViewport = function (el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var vw = window.innerWidth || document.documentElement.clientWidth;
      return r.bottom >= -MARGIN && r.top <= vh + MARGIN && r.right >= -MARGIN && r.left <= vw + MARGIN;
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          apply(entry.target);
        }
      });
    }, { rootMargin: MARGIN + 'px' });
    els.forEach(function (el) { io.observe(el); });
    /* Safety net: if IO never delivers intersections in this environment
       (unusual scroll root / overflow:clip), don't strand images — apply any
       element that is near the viewport on load and whenever the page scrolls. */
    var sweep = function () {
      all(document, '[data-bg]:not([data-bg-done])').forEach(function (el) {
        if (nearViewport(el)) { io.unobserve(el); apply(el); }
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep, { passive: true });
    if (document.readyState === 'complete') sweep();
    else window.addEventListener('load', sweep, { once: true });
  });

  /* ── Tier 1 · scroll reveal ──────────────────────────────────────────────
     Hidden start-state (CSS) only applies under .ds-reveal-ready AND inside
     [data-animate]; we add .ds-reveal-ready only when we can actually animate,
     so JS-off / reduced-motion / dead-IO never leaves content stuck hidden. */
  register(function reveal(scope) {
    var els = all(scope, '[data-reveal]:not([data-reveal-bound])').filter(animated);
    if (!els.length) return;

    if (!canAnimate) {
      els.forEach(function (el) { el.setAttribute('data-reveal-bound', ''); el.classList.add('is-revealed'); });
      return;
    }
    document.documentElement.classList.add('ds-reveal-ready');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target, once = el.getAttribute('data-reveal-once') !== 'false';
        if (e.isIntersecting) {
          var d = parseFloat(el.getAttribute('data-reveal-delay') || '0');
          if (d) el.style.transitionDelay = d + 's';
          el.classList.add('is-revealed');
          if (once) io.unobserve(el);
        } else if (!once) {
          el.classList.remove('is-revealed');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { el.setAttribute('data-reveal-bound', ''); io.observe(el); });

    // IO-independent safety net (embedded/offscreen webviews that never deliver
    // IO entries) — geometric pass guarantees in-view items reveal regardless.
    if (!reveal._netBound) {
      reveal._netBound = true;
      var ticking = false;
      function pass() {
        ticking = false;
        var vh = window.innerHeight || document.documentElement.clientHeight;
        all(document, '[data-reveal][data-reveal-bound]:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-revealed');
        });
      }
      function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(pass); } }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      requestAnimationFrame(pass);
      setTimeout(pass, 200);
    }
  });

  /* ── Tier 1 · count-up ──────────────────────────────────────────────────
     <span data-countup="99.4" data-decimals="1" data-suffix="%"></span> */
  register(function countup(scope) {
    var els = all(scope, '[data-countup]:not([data-countup-bound])');
    if (!els.length) return;
    var ease = function (p) { return 1 - Math.pow(1 - p, 4); };
    function fmt(el, v) {
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      return (el.getAttribute('data-prefix') || '') + v.toFixed(dec) + (el.getAttribute('data-suffix') || '');
    }
    els.forEach(function (el) {
      el.setAttribute('data-countup-bound', '');
      var target = parseFloat(el.getAttribute('data-countup')) || 0;
      if (!canAnimate || !animated(el)) { el.textContent = fmt(el, target); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(el);
          // Reserve the final box BEFORE counting so it doesn't reflow as
          // digits are added (0 → 18 → 180) — width AND height, since a later
          // font swap can shift line-box height too, not just glyph width.
          // Render the target, lock min-width/min-height, then animate from 0.
          function reserve() {
            // Measure the TARGET text regardless of whatever is on screen
            // right now (mid-count or already final) — swap, measure, restore,
            // all synchronous so nothing paints in between. Sub-pixel, NOT
            // ceil()'d: rounding every one of several count-ups sharing a row
            // up by a fraction of a px each adds up across the row, and right
            // at a flex-wrap breakpoint that's enough to flip it to wrapped —
            // exactly when this reservation runs, i.e. exactly when counting
            // starts. min-width/min-height accept fractional px natively.
            var cur = el.textContent;
            el.textContent = fmt(el, target);
            var rect = el.getBoundingClientRect();
            var w = rect.width, h = rect.height;
            el.textContent = cur;
            el.style.minWidth = w + 'px';
            el.style.minHeight = h + 'px';
          }
          el.textContent = fmt(el, target);
          if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
          reserve();
          // font-display:swap can replace the fallback font's glyphs — and
          // their metrics — at any point while this is counting, especially
          // for a stat block near the top of the page whose count-up starts
          // on load, before the webfont is in. document.fonts.ready alone
          // isn't enough: it only reflects loads already requested by the
          // time we check it, and a weight nothing else on the page uses yet
          // may not be requested until THIS text first renders with it — so
          // listen for every load that completes while we're still counting,
          // not just a one-time check, and stop once the count settles.
          var dur = (parseFloat(el.getAttribute('data-duration') || '2')) * 1000, start = null;
          var fontsWatchable = document.fonts && document.fonts.addEventListener;
          if (fontsWatchable) document.fonts.addEventListener('loadingdone', reserve);
          (function tick(now) {
            if (start === null) start = now;
            var p = Math.min((now - start) / dur, 1);
            el.textContent = fmt(el, ease(p) * target);
            if (p < 1) requestAnimationFrame(tick);
            else if (fontsWatchable) document.fonts.removeEventListener('loadingdone', reserve);
          })(performance.now());
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  });

  /* ── Tier 2 · loan calculator ────────────────────────────────────────────
     <section data-behavior="loan-calculator">   (data-currency = optional TEXT prefix)
       <input type="radio" name="…" data-lc-type data-key="auto" data-rate="5.99"
              data-min data-max data-amount data-term-min data-term-max data-term>
       optional sub-choice: <div data-lc-subgroup data-for="auto">
                              <input type="radio" data-lc-sub data-for="auto" data-rate="2.99">
       <input type="range" data-lc-amount>   <output data-lc-amount-out>
       <input type="range" data-lc-term>     <output data-lc-term-out>
         …OR radio cards: <input type="radio" data-lc-term-opt value="3">
       <input inputmode="numeric" data-lc-amount-field>   (optional, type-to-set)
       compare rows: <li data-lc-row="2"> <span data-lc-row-monthly>
                                          <span data-lc-row-interest>
       <output data-lc-monthly> <output data-lc-total> <output data-lc-interest>
       <output data-lc-rate>    <span data-lc-term-unit>
     Standard amortised payment: P·r / (1 − (1+r)^−n), r = annual/12. Picking a
     loan TYPE re-ranges both sliders from that radio's data-* (each product has
     its own floor/ceiling/tenor), so the controls can never offer an amount the
     product doesn't do. Track fill is published as --lc-fill for CSS.
     A11y: labels WRAP their inputs (no ids — blocks may appear twice on a
     page); each range gets an aria-valuetext so it announces "AED 30,000", not
     "30000"; only the monthly figure is aria-live, so changing a slider
     announces one number instead of the whole panel. */
  register(function loanCalculator(scope) {
    all(scope, '[data-behavior="loan-calculator"]:not([data-lc-bound])').forEach(function (root) {
      root.setAttribute('data-lc-bound', '');
      var amt = root.querySelector('[data-lc-amount]');
      var term = root.querySelector('[data-lc-term]');
      // Term is EITHER a range slider or a set of radio cards (the compare
      // variant picks its tenor by choosing a card, so it has no slider).
      var termOpts = all(root, '[data-lc-term-opt]');
      if (!amt || (!term && !termOpts.length)) return;
      function termVal() {
        if (term) return +term.value;
        var c = termOpts.filter(function (o) { return o.checked; })[0];
        return c ? +c.value : +termOpts[0].value;
      }
      var types = all(root, '[data-lc-type]');
      var field = root.querySelector('[data-lc-amount-field]');
      var lang = document.documentElement.getAttribute('lang') || 'en';
      var cur = root.getAttribute('data-currency') || '';

      function fmt(n) {
        try { return new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(Math.round(n)); }
        catch (e) { return String(Math.round(n)); }
      }
      // Money = NUMBER only. The dirham symbol is drawn by CSS (.lc-money::before,
      // a masked SVG) rather than written as text: U+20C3 only ships with Unicode
      // 18.0 (Sept 2026) and is tofu in today's fonts, and a CSS glyph also lands
      // on the correct side of the number in Arabic with no extra logic.
      // data-currency stays as an escape hatch for a TEXT prefix if one is wanted.
      function money(n) { return (cur ? cur + ' ' : '') + fmt(n); }
      function set(el, txt) { if (el) el.textContent = txt; }
      function fill(el) {
        var min = +el.min || 0, max = +el.max || 100;
        var f = max > min ? (+el.value - min) / (max - min) : 0;
        el.style.setProperty('--lc-fill', f * 100 + '%');
      }
      // Active loan type wins; fall back to the section's own data-rate.
      function activeType() {
        return types.filter(function (t) { return t.checked; })[0] || null;
      }
      // Optional per-product SUB-choice (e.g. Auto → New / Used), each with its
      // own rate. A sub-group declares data-for="<type key>"; only the group
      // belonging to the selected product is shown, and a checked sub-option
      // overrides its parent's rate.
      var subs = all(root, '[data-lc-sub]');
      var subGroups = all(root, '[data-lc-subgroup]');
      function activeKey() {
        var t = activeType();
        return t ? t.getAttribute('data-key') : null;
      }
      function activeSub() {
        var k = activeKey();
        return subs.filter(function (s) {
          return s.checked && s.getAttribute('data-for') === k;
        })[0] || null;
      }
      function rate() {
        var s = activeSub();
        if (s && s.getAttribute('data-rate')) return parseFloat(s.getAttribute('data-rate'));
        var t = activeType();
        return parseFloat((t && t.getAttribute('data-rate')) || root.getAttribute('data-rate') || '0');
      }
      function syncSubGroups() {
        var k = activeKey();
        subGroups.forEach(function (g) { g.hidden = g.getAttribute('data-for') !== k; });
      }
      // One place computes a payment; the headline and every comparison row
      // call it, so they can never disagree.
      function payment(P, apr, yrs) {
        var n = Math.max(1, Math.round(yrs * 12)), r = apr / 100 / 12;
        var m = r > 0 ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
        return { monthly: m, total: m * n, interest: m * n - P };
      }
      function paint() {
        var P = +amt.value, yrs = termVal(), apr = rate();
        var res = payment(P, apr, yrs);
        var monthly = res.monthly, total = res.total;
        // Comparison rows: same amount and rate, one row per tenor. Rows whose
        // tenor the selected product doesn't offer are hidden, not shown empty.
        all(root, '[data-lc-row]').forEach(function (row) {
          var t = parseFloat(row.getAttribute('data-lc-row'));
          var lo = term ? +term.min : +(row.getAttribute('data-term-min') || 0);
          var hi = term ? +term.max : Infinity;
          var inRange = !term || (t >= lo && t <= hi);
          row.hidden = !inRange;
          if (!inRange) return;
          var rr = payment(P, apr, t);
          set(row.querySelector('[data-lc-row-monthly]'), money(rr.monthly));
          set(row.querySelector('[data-lc-row-interest]'), money(rr.interest));
          row.classList.toggle('is-active', Math.abs(t - yrs) < 0.01);
        });
        set(root.querySelector('[data-lc-monthly]'), money(monthly));
        set(root.querySelector('[data-lc-total]'), money(total));
        set(root.querySelector('[data-lc-interest]'), money(total - P));
        set(root.querySelector('[data-lc-rate]'), apr.toFixed(2) + '%');
        set(root.querySelector('[data-lc-amount-out]'), money(P));
        set(root.querySelector('[data-lc-term-out]'), yrs);
        var unit = root.querySelector('[data-lc-term-unit]');
        if (unit) set(unit, yrs === 1 ? (unit.getAttribute('data-singular') || 'Year')
                                      : (unit.getAttribute('data-plural') || 'Years'));
        // The tenor can be shown in MONTHS instead of years — the slider still
        // steps in years, this is only how the chosen value reads.
        var months = Math.max(1, Math.round(yrs * 12));
        set(root.querySelector('[data-lc-term-months]'), fmt(months));
        var munit = root.querySelector('[data-lc-months-unit]');
        if (munit) set(munit, months === 1 ? (munit.getAttribute('data-singular') || 'Month')
                                           : (munit.getAttribute('data-plural') || 'Months'));
        amt.setAttribute('aria-valuetext', money(P));
        if (term) term.setAttribute('aria-valuetext', yrs + ' ' + (yrs === 1 ? 'year' : 'years'));
        if (field && document.activeElement !== field) field.value = fmt(P);
        fill(amt); if (term) fill(term);
      }
      // Re-range both sliders to the newly selected product, clamping the
      // current values into the new window rather than resetting them.
      function applyType(t) {
        if (!t) return;
        var a = { min: 'data-min', max: 'data-max', val: 'data-amount' };
        if (t.getAttribute(a.min)) amt.min = t.getAttribute(a.min);
        if (t.getAttribute(a.max)) amt.max = t.getAttribute(a.max);
        if (t.getAttribute(a.val)) amt.value = t.getAttribute(a.val);
        amt.value = Math.min(+amt.max, Math.max(+amt.min, +amt.value));
        if (term) {
          if (t.getAttribute('data-term-min')) term.min = t.getAttribute('data-term-min');
          if (t.getAttribute('data-term-max')) term.max = t.getAttribute('data-term-max');
          if (t.getAttribute('data-term')) term.value = t.getAttribute('data-term');
          term.value = Math.min(+term.max, Math.max(+term.min, +term.value));
          set(root.querySelector('[data-lc-term-min]'), +term.min);
          set(root.querySelector('[data-lc-term-max]'), +term.max);
          // Optional unit spans beside each bound, pluralised for that bound.
          [['[data-lc-term-min-unit]', +term.min], ['[data-lc-term-max-unit]', +term.max]].forEach(function (pair) {
            var u = root.querySelector(pair[0]);
            if (u) set(u, pair[1] === 1 ? (u.getAttribute('data-singular') || 'Year')
                                        : (u.getAttribute('data-plural') || 'Years'));
          });
        }
        // Range bounds are also printed as text under each slider.
        set(root.querySelector('[data-lc-amount-min]'), money(+amt.min));
        set(root.querySelector('[data-lc-amount-max]'), money(+amt.max));
      }

      amt.addEventListener('input', paint);
      if (term) term.addEventListener('input', paint);
      termOpts.forEach(function (o) { o.addEventListener('change', paint); });
      subs.forEach(function (s) { s.addEventListener('change', paint); });
      types.forEach(function (t) {
        t.addEventListener('change', function () { applyType(t); syncSubGroups(); paint(); });
      });
      if (field) {
        // Type-to-set: accept digits only, clamp on blur/Enter so a half-typed
        // number never snaps the slider mid-keystroke.
        field.addEventListener('input', function () {
          var v = parseInt(field.value.replace(/[^\d]/g, ''), 10);
          if (!isNaN(v)) { amt.value = Math.min(+amt.max, Math.max(+amt.min, v)); paint(); }
        });
        field.addEventListener('blur', function () { field.value = fmt(+amt.value); });
        field.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); field.blur(); } });
      }
      applyType(activeType());
      syncSubGroups();
      paint();

    });
  });

  /* rewards-calculator — minimal spend->reward estimator (sliders only).
       <section data-behavior="rewards-calculator" data-divisor="3.6725" data-multiplier="12">
         input[type=range][data-rc-spend][data-rate=…]  (per-category weight)
         output[data-rc-out]     per-row live value
         output[data-rc-total]   the single result figure
     total = sum(value x rate) / divisor x multiplier (divisor: e.g. AED->USD;
     multiplier: e.g. 12 for per-year). Currency glyphs come from CSS (.aed). */
  register(function rewardsCalculator(scope) {
    all(scope, '[data-behavior="rewards-calculator"]:not([data-rc-bound])').forEach(function (root) {
      root.setAttribute('data-rc-bound', '');
      var sliders = all(root, '[data-rc-spend]');
      var total = root.querySelector('[data-rc-total]');
      if (!sliders.length || !total) return;
      var lang = document.documentElement.getAttribute('lang') || 'en';
      var divisor = parseFloat(root.getAttribute('data-divisor')) || 1;
      var multiplier = parseFloat(root.getAttribute('data-multiplier')) || 1;
      function fmt(n) { return new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(Math.round(n)); }
      function fill(el) {
        var f = (el.value - el.min) / ((el.max - el.min) || 1);
        el.style.setProperty('--lc-fill', (f * 100) + '%');
      }
      function paint() {
        var sum = 0;
        sliders.forEach(function (s) {
          sum += (parseFloat(s.value) || 0) * (parseFloat(s.getAttribute('data-rate')) || 1);
          var out = s.closest('.lc-field') && s.closest('.lc-field').querySelector('[data-rc-out]');
          if (out) out.textContent = fmt(s.value);
          s.setAttribute('aria-valuetext', fmt(s.value));
          fill(s);
        });
        total.textContent = fmt(sum / divisor * multiplier);
      }
      sliders.forEach(function (s) { s.addEventListener('input', paint); });
      paint();
    });
  });

  /* marquee — constant PIXEL speed regardless of content count.
       <section data-behavior="marquee" data-speed="48">  (px per second)
     CSS owns the animation (cmp-marquee-scroll, --mq-speed fallback 45s);
     this recipe only sets --mq-speed = setWidth / data-speed, so adding or
     removing cards never changes the apparent pace. Recomputed if the set
     resizes (font swap). No JS = the CSS fallback still scrolls. */
  register(function marquee(scope) {
    all(scope, '[data-behavior="marquee"]:not([data-mq-bound])').forEach(function (root) {
      root.setAttribute('data-mq-bound', '');
      var track = root.querySelector('.mq-track');
      var set = root.querySelector('.mq-set');
      if (!track || !set) return;
      var pxs = parseFloat(root.getAttribute('data-speed')) || 48;
      function pace() {
        var w = set.getBoundingClientRect().width;
        if (w > 0) track.style.setProperty('--mq-speed', (w / pxs).toFixed(2) + 's');
      }
      pace();
      try { new ResizeObserver(pace).observe(set); } catch (e) {}
    });
  });

  /* stories — Instagram-style story rail + runtime-built fullscreen viewer.
       <section data-behavior="stories">
         .st-group > button.st-chip (.st-ring > img.st-face, .st-name)
                   > .st-slides[hidden] > .st-slide[data-media][data-video?][data-dur?]
     The viewer is built on first open and appended to the section (so all
     styling stays scoped under .cmp-stories): segmented bars, auto-advance,
     rAF timing for images, real duration for videos, tap thirds prev/next,
     hold to pause, swipe or chevrons for group nav, Escape/× to close.
     A chip greys (.is-seen) once its LAST slide has been reached. Per-visit
     only — nothing persists. */
  register(function stories(scope) {
    all(scope, '[data-behavior="stories"]:not([data-st-bound])').forEach(function (root) {
      root.setAttribute('data-st-bound', '');
      var groups = all(root, '.st-group').map(function (g) {
        return {
          chip: g.querySelector('.st-chip'),
          face: g.querySelector('.st-face'),
          name: (g.querySelector('.st-name') || {}).textContent || '',
          slides: all(g, '.st-slide'),
          max: -1
        };
      }).filter(function (g) { return g.chip && g.slides.length; });
      if (!groups.length) return;

      var rtl = (document.documentElement.getAttribute('dir') === 'rtl');
      var viewer = null, stage, barsEl, headFace, headName, mediaEl, capEl, vid;
      var gi = 0, si = 0, raf = 0, t0 = 0, elapsed = 0, dur = 5, isVideo = false, playing = false;

      function build() {
        viewer = document.createElement('div');
        viewer.className = 'st-viewer';
        viewer.setAttribute('role', 'dialog');
        viewer.setAttribute('aria-modal', 'true');
        viewer.setAttribute('tabindex', '-1');
        viewer.innerHTML =
          '<button class="st-gnav st-gnav-prev" type="button" aria-label="Previous story"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>' +
          '<div class="st-stage">' +
            '<div class="st-bars"></div>' +
            '<div class="st-head"><img class="st-head-face" alt="" /><span class="st-head-name"></span>' +
              '<button class="st-close" type="button" aria-label="Close stories"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>' +
            '<div class="st-media"></div>' +
            '<div class="st-scrim" aria-hidden="true"></div>' +
            '<div class="st-caption"></div>' +
          '</div>' +
          '<button class="st-gnav st-gnav-next" type="button" aria-label="Next story"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>';
        root.appendChild(viewer);
        stage = viewer.querySelector('.st-stage');
        barsEl = viewer.querySelector('.st-bars');
        headFace = viewer.querySelector('.st-head-face');
        headName = viewer.querySelector('.st-head-name');
        mediaEl = viewer.querySelector('.st-media');
        capEl = viewer.querySelector('.st-caption');
        vid = document.createElement('video');
        vid.muted = true; vid.playsInline = true; vid.setAttribute('playsinline', '');
        vid.preload = 'auto'; vid.className = 'st-video';
        vid.addEventListener('ended', function () { if (playing) next(); });
        vid.addEventListener('error', function () { if (isVideo && playing) next(); });
        viewer.querySelector('.st-close').addEventListener('click', close);
        viewer.querySelector('.st-gnav-prev').addEventListener('click', function () { jumpGroup(-1); });
        viewer.querySelector('.st-gnav-next').addEventListener('click', function () { jumpGroup(1); });
        // tap thirds / hold-to-pause / horizontal swipe for group nav
        var px = 0, pt = 0, held = false;
        stage.addEventListener('pointerdown', function (e) {
          if (e.target.closest('.st-close, a')) return;
          px = e.clientX; pt = performance.now(); held = playing; pause();
        });
        stage.addEventListener('pointerup', function (e) {
          if (e.target.closest('.st-close, a')) return;
          var dx = e.clientX - px, quick = performance.now() - pt < 250;
          if (Math.abs(dx) > 60) { jumpGroup((rtl ? dx > 0 : dx < 0) ? 1 : -1); return; }
          if (quick && Math.abs(dx) < 10) {
            var r = stage.getBoundingClientRect();
            var startThird = rtl ? (e.clientX > r.right - r.width / 3) : (e.clientX < r.left + r.width / 3);
            if (startThird) prev(); else next();
            return;
          }
          if (held) resume();
        });
        stage.addEventListener('pointercancel', function () { if (held) resume(); });
      }

      function fill(i, f) {
        var seg = barsEl.children[i];
        if (seg) seg.firstChild.style.transform = 'scaleX(' + Math.max(0, Math.min(1, f)) + ')';
      }
      function tick() {
        if (!playing) return;
        var f;
        if (isVideo) { f = vid.duration ? vid.currentTime / vid.duration : 0; }
        else {
          elapsed = performance.now() - t0;
          f = elapsed / (dur * 1000);
          if (f >= 1) { next(); return; }
        }
        fill(si, f);
        raf = requestAnimationFrame(tick);
      }
      function pause() {
        playing = false;
        cancelAnimationFrame(raf);
        if (isVideo) { try { vid.pause(); } catch (e) {} }
        else elapsed = performance.now() - t0;
      }
      function resume() {
        if (!viewer || !viewer.classList.contains('is-open')) return;
        playing = true;
        if (isVideo) { try { vid.play(); } catch (e) {} }
        else t0 = performance.now() - elapsed;
        raf = requestAnimationFrame(tick);
      }
      function show() {
        var g = groups[gi], slide = g.slides[si];
        g.max = Math.max(g.max, si);
        if (g.max >= g.slides.length - 1) g.chip.classList.add('is-seen');
        headFace.src = g.face ? g.face.src : ''; headName.textContent = g.name;
        barsEl.innerHTML = '';
        g.slides.forEach(function (_, i) {
          var seg = document.createElement('span'); seg.className = 'st-bar';
          var inner = document.createElement('span'); inner.className = 'st-bar-fill';
          if (i < si) inner.style.transform = 'scaleX(1)';
          seg.appendChild(inner); barsEl.appendChild(seg);
        });
        isVideo = slide.hasAttribute('data-video');
        mediaEl.innerHTML = ''; mediaEl.style.backgroundImage = '';
        cancelAnimationFrame(raf); elapsed = 0;
        if (isVideo) {
          mediaEl.appendChild(vid);
          vid.src = slide.getAttribute('data-media'); vid.currentTime = 0;
        } else {
          mediaEl.style.backgroundImage = "url('" + slide.getAttribute('data-media') + "')";
          dur = parseFloat(slide.getAttribute('data-dur')) || 5;
          t0 = performance.now();
        }
        capEl.innerHTML = '';
        all(slide, ':scope > *').forEach(function (n) { capEl.appendChild(n.cloneNode(true)); });
        stage.classList.remove('st-ov-tint', 'st-ov-scrim');
        var ov = slide.getAttribute('data-overlay');
        if (ov) stage.classList.add('st-ov-' + ov);
        playing = true;
        if (isVideo) { try { vid.play(); } catch (e) {} }
        raf = requestAnimationFrame(tick);
      }
      function next() {
        var g = groups[gi];
        fill(si, 1);
        if (si < g.slides.length - 1) { si++; show(); }
        else if (gi < groups.length - 1) { gi++; si = 0; show(); }
        else close();
      }
      function prev() {
        if (si > 0) { si--; show(); }
        else if (gi > 0) { gi--; si = 0; show(); }
        else { si = 0; show(); }
      }
      function jumpGroup(d) {
        var t = gi + d;
        if (t < 0 || t >= groups.length) { close(); return; }
        gi = t; si = 0; show();
      }
      function onKey(e) {
        if (e.key === 'Escape') { close(); }
        else if (e.key === 'ArrowRight') { rtl ? prev() : next(); }
        else if (e.key === 'ArrowLeft') { rtl ? next() : prev(); }
      }
      function open(idx) {
        if (!viewer) build();
        gi = idx; si = 0;
        viewer.classList.add('is-open');
        document.documentElement.classList.add('st-lock');
        document.addEventListener('keydown', onKey);
        show();
        viewer.focus();
      }
      function close() {
        pause();
        if (viewer) viewer.classList.remove('is-open');
        try { vid.removeAttribute('src'); vid.load(); } catch (e) {}
        document.documentElement.classList.remove('st-lock');
        document.removeEventListener('keydown', onKey);
        var chip = groups[gi] && groups[gi].chip;
        if (chip) chip.focus();
      }
      groups.forEach(function (g, i) {
        g.chip.addEventListener('click', function () { open(i); });
      });
    });
  });

  /* ── Tier 2 · tabs ───────────────────────────────────────────────────────
     <div data-tabs>
       <button data-tab="a" class="active">A</button> …
       <div data-panel="a" class="active">…</div> …
     </div>
     Container-scoped: keys need only be unique within their own [data-tabs]. */
  register(function tabs(scope) {
    all(scope, '[data-tabs]:not([data-tabs-bound])').forEach(function (root) {
      root.setAttribute('data-tabs-bound', '');
      function owned(sel) { return all(root, sel).filter(function (el) { return el.closest('[data-tabs]') === root; }); }
      var triggers = owned('[data-tab]'), panels = owned('[data-panel]');
      if (!triggers.length) return;

      // Optional auto-advance: <div data-tabs data-autoplay="4000"> cycles tabs.
      // An optional [data-tabs-progress] bar inside the root fills 0→100% each
      // cycle. Pauses on hover; a manual click restarts the timer from there.
      var ms = parseInt(root.getAttribute('data-autoplay') || '0', 10);
      // progress bar(s): a [data-tabs-progress] inside each trigger drives a
      // per-active-item bar; otherwise a single shared bar is used.
      var perBars = triggers.map(function (t) { return t.querySelector('[data-tabs-progress]'); });
      var hasPer = perBars.some(Boolean);
      var bar = hasPer ? null : owned('[data-tabs-progress]')[0];
      var current = 0, timer = null;

      function fill(el) { if (!el) return; el.style.transition = 'none'; el.style.width = '0%'; void el.offsetWidth; el.style.transition = 'width ' + ms + 'ms linear'; el.style.width = '100%'; }
      function paintBar() {
        if (hasPer) { perBars.forEach(function (b) { if (b) { b.style.transition = 'none'; b.style.width = '0%'; } }); fill(perBars[current]); }
        else fill(bar);
      }
      function activate(key) {
        triggers.forEach(function (t, i) {
          var on = t.getAttribute('data-tab') === key;
          t.classList.toggle('active', on); t.setAttribute('aria-selected', on);
          if (on) current = i;
        });
        panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === key); });
        // Roving tabindex: only the active tab is in the focus order.
        triggers.forEach(function (t) { t.setAttribute('tabindex', t.getAttribute('data-tab') === key ? '0' : '-1'); });
        revealActive(triggers[current]);
        if (timer) paintBar();
      }
      /* On mobile the tab bars scroll horizontally with the scrollbar hidden, so
         an active tab past the edge would be invisible — the reader could not
         tell which tab they are on. Bring it into view inside its OWN bar:
         scrollLeft math, never scrollIntoView, which would also scroll the page
         (and, in the gallery, the card's iframe). */
      function scroller(el) {
        var bar = el && el.parentElement;
        while (bar && bar !== root.parentElement && bar.scrollWidth <= bar.clientWidth + 1) bar = bar.parentElement;
        return (bar && bar.scrollWidth > bar.clientWidth + 1) ? bar : null;
      }
      function revealActive(el) {
        var bar = scroller(el); if (!bar) return;
        var b = bar.getBoundingClientRect(), e = el.getBoundingClientRect(), pad = 16;
        if (e.left < b.left + pad) bar.scrollLeft -= (b.left + pad - e.left);
        else if (e.right > b.right - pad) bar.scrollLeft += (e.right - (b.right - pad));
        markOverflow(bar);
      }
      /* Hidden scrollbars leave no sign that the row continues past the edge —
         a reader sees 2-3 tabs and cannot tell there are more. Flag which side
         still has content so CSS can fade that edge. RTL reports scrollLeft as
         negative in some engines, hence the abs(). */
      function markOverflow(bar) {
        if (!bar) return;
        var max = bar.scrollWidth - bar.clientWidth;
        if (max <= 1) { bar.removeAttribute('data-ovf'); return; }
        var s = Math.abs(bar.scrollLeft);
        bar.setAttribute('data-ovf', s <= 1 ? 'end' : (s >= max - 1 ? 'start' : 'both'));
      }
      (function () {
        var bar = triggers[0] && triggers[0].parentElement;
        if (!bar) return;
        markOverflow(bar);
        bar.addEventListener('scroll', function () { markOverflow(bar); }, { passive: true });
        window.addEventListener('resize', function () { markOverflow(bar); });
        if (window.ResizeObserver) { try { new ResizeObserver(function () { markOverflow(bar); }).observe(bar); } catch (e) {} }
      })();
      function play() { if (!ms || !canAnimate) return; stop(); paintBar(); timer = setInterval(function () { activate(triggers[(current + 1) % triggers.length].getAttribute('data-tab')); }, ms); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }

      triggers.forEach(function (t, i) {
        t.setAttribute('role', 'tab'); t.style.cursor = 'pointer';
        t.addEventListener('click', function () { activate(t.getAttribute('data-tab')); if (ms) play(); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(t.getAttribute('data-tab')); if (ms) play(); return; }
          var ni = -1;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ni = (i + 1) % triggers.length;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ni = (i - 1 + triggers.length) % triggers.length;
          else if (e.key === 'Home') ni = 0;
          else if (e.key === 'End') ni = triggers.length - 1;
          if (ni < 0) return;
          e.preventDefault();
          var nt = triggers[ni];
          activate(nt.getAttribute('data-tab')); nt.focus(); if (ms) play();
        });
      });
      var init = triggers.filter(function (t) { return t.classList.contains('active'); })[0] || triggers[0];
      activate(init.getAttribute('data-tab'));

      if (ms && canAnimate) {
        // Optional accessible pause/play toggle: a [data-tabs-toggle] button
        // inside the root halts/resumes autoplay (WCAG 2.2.2). Hover-pause stays
        // suspended while the user has explicitly paused.
        var toggle = owned('[data-tabs-toggle]')[0];
        var userPaused = false;
        if (toggle) {
          var realPlay = play, realStop = stop;
          play = function () { if (!userPaused) realPlay(); };
          stop = realStop;
          var tLbl = toggle.querySelector('.fap-pause-lbl');
          toggle.addEventListener('click', function () {
            userPaused = !userPaused;
            toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
            toggle.setAttribute('aria-label', userPaused ? 'Resume automatic feature rotation' : 'Pause automatic feature rotation');
            if (tLbl) tLbl.textContent = userPaused ? 'Play' : 'Pause';
            if (userPaused) { realStop(); } else { realPlay(); }
          });
        }
        root.addEventListener('pointerenter', stop);
        root.addEventListener('pointerleave', play);
        play();
      }
    });
  });

  /* ── Tier 2 · accordion ───────────────────────────────────────────────────
     <div data-accordion>            ( data-accordion="multi" → many open )
       <div data-acc>
         <button data-acc-head>…</button>
         <div data-acc-body><div class="acc-inner">…</div></div>
       </div> …
     </div>
     Open/close is the CSS grid-rows trick (.is-open on the item); JS just toggles. */
  register(function accordion(scope) {
    all(scope, '[data-accordion]:not([data-accordion-bound])').forEach(function (root) {
      root.setAttribute('data-accordion-bound', '');
      var multi = root.getAttribute('data-accordion') === 'multi';
      var items = all(root, '[data-acc]').filter(function (it) { return it.closest('[data-accordion]') === root; });
      items.forEach(function (item, idx) {
        var head = item.querySelector('[data-acc-head]');
        if (!head) return;
        head.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
        // Programmatically link trigger → panel for screen readers.
        var body = item.querySelector('[data-acc-body]');
        if (body) {
          if (!body.id) body.id = (root.id || 'acc') + '-panel-' + idx + '-' + Math.random().toString(36).slice(2, 7);
          head.setAttribute('aria-controls', body.id);
          if (!body.getAttribute('role')) body.setAttribute('role', 'region');
          if (!head.id) head.id = body.id + '-head';
          if (!body.getAttribute('aria-labelledby')) body.setAttribute('aria-labelledby', head.id);
        }
        head.addEventListener('click', function () {
          var open = item.classList.contains('is-open');
          if (!multi) items.forEach(function (o) { o.classList.remove('is-open'); var h = o.querySelector('[data-acc-head]'); if (h) h.setAttribute('aria-expanded', 'false'); });
          item.classList.toggle('is-open', !open);
          head.setAttribute('aria-expanded', !open ? 'true' : 'false');
        });
      });
    });
  });

  /* ── Tier 2 · carousel (scroll-snap) ──────────────────────────────────────
     <div data-carousel>
       <div data-carousel-track>
         <div data-carousel-slide>…</div> …
       </div>
       <button data-carousel-prev>‹</button>
       <button data-carousel-next>›</button>
       <div data-carousel-dots></div>      (optional; filled by JS)
     </div>                                ( data-autoplay="6000" → ms interval ) */
  register(function carousel(scope) {
    all(scope, '[data-carousel]:not([data-carousel-bound])').forEach(function (root) {
      root.setAttribute('data-carousel-bound', '');
      var track = root.querySelector('[data-carousel-track]');
      if (!track) return;
      dragify(track);                                          // mouse-drag horizontal (Lenis owns vertical)
      var slides = all(track, '[data-carousel-slide]');
      if (!slides.length) return;
      var snapTimer = null;
      function to(i) {
        var s = slides[Math.max(0, Math.min(slides.length - 1, i))];
        if (!s) return;
        // Compute the scroll target honouring the slide's scroll-snap-align: centre-aligned
        // slides (centred-peek carousels) target the slide centre, start-aligned slides
        // target the left edge. We briefly disable mandatory scroll-snap so the smooth
        // programmatic scroll isn't yanked back to the origin snap point, then restore it
        // once the scroll settles. (Without this, mandatory snap defeats arrows/dots/autoplay.)
        var max = track.scrollWidth - track.clientWidth;
        var rtl = isRTL(track);
        var align = '';
        try { align = getComputedStyle(s).scrollSnapAlign || ''; } catch (e) {}
        // Geometry-based targeting (getBoundingClientRect), NOT offsetLeft math:
        // offsetLeft is measured against whatever ancestor happens to be the
        // offsetParent, and that coordinate space differs per block (and flips
        // meaning under RTL). Rects are visual and direction-agnostic: the target
        // is simply current scrollLeft + the on-screen distance still to travel.
        // Alignment edge: centre→centres meet; LTR start→left edges meet;
        // RTL start→RIGHT edges meet. Browser-native clamp bounds respected:
        // LTR scrollLeft ∈ [0, max], RTL scrollLeft ∈ [-max, 0].
        var tr = track.getBoundingClientRect(), sr = s.getBoundingClientRect();
        var delta;
        if (align.indexOf('center') !== -1) delta = (sr.left + sr.width / 2) - (tr.left + tr.width / 2);
        else if (rtl) delta = sr.right - tr.right;
        else delta = sr.left - tr.left;
        var left = track.scrollLeft + delta;
        if (rtl) { if (left < -max) left = -max; if (left > 0) left = 0; }
        else { if (left < 0) left = 0; if (left > max) left = max; }
        // Suspend mandatory snap and move the track ourselves. We can't rely on native
        // scrollTo({behavior:'smooth'}) — the page's smooth-scroll layer (Lenis) swallows
        // programmatic smooth scrolls on inner containers, leaving the track at 0. We set
        // the FINAL scrollLeft synchronously first (so nav is correct even if rAF is
        // throttled, e.g. background tab), then tween back→forth purely as visual polish.
        // Restoring snap afterwards pins the track to the destination slide.
        if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
        track.style.scrollSnapType = 'none';
        var start = track.scrollLeft, delta = left - start;
        // Authoritative landing, scheduled on a setTimeout (fires even when rAF is throttled,
        // e.g. a background tab): pins to the target and restores snap. The rAF tween below
        // is best-effort visual polish layered on top.
        function settle() { track.scrollLeft = left; track.style.scrollSnapType = ''; sync(); }
        if (Math.abs(delta) < 1 || !canAnimate) { snapTimer = setTimeout(settle, 60); return; }
        var dur = 420, t0 = null, done = false;
        snapTimer = setTimeout(function () { if (!done) { done = true; settle(); } }, dur + 80);
        function ease(p) { return 1 - Math.pow(1 - p, 3); }
        function frame(ts) {
          if (done) return;
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          track.scrollLeft = start + delta * ease(p);
          if (p < 1) requestAnimationFrame(frame);
          else { done = true; clearTimeout(snapTimer); settle(); }
        }
        requestAnimationFrame(frame);
      }
      function current() {
        // Rect-based, same alignment edges as to(): nearest slide = the one whose
        // aligned edge is closest to the track's matching edge on screen.
        var rtl = isRTL(track), tr = track.getBoundingClientRect();
        var min = Infinity, idx = 0;
        slides.forEach(function (s, i) {
          var sr = s.getBoundingClientRect();
          var d = Math.abs(rtl ? (sr.right - tr.right) : (sr.left - tr.left));
          if (d < min) { min = d; idx = i; }
        });
        return idx;
      }
      var prev = root.querySelector('[data-carousel-prev]'), next = root.querySelector('[data-carousel-next]');
      // Wrap at the ends — same modulo the autoplay step() below already uses,
      // so manual arrows and autoplay agree: next past the last slide is the
      // first, prev before the first is the last, never a dead click.
      if (prev) prev.addEventListener('click', function () { to((current() - 1 + slides.length) % slides.length); });
      if (next) next.addEventListener('click', function () { to((current() + 1) % slides.length); });

      var dotsWrap = root.querySelector('[data-carousel-dots]'), dots = [];
      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var b = document.createElement('button'); b.className = 'carousel-dot'; b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          b.addEventListener('click', function () { to(i); }); dotsWrap.appendChild(b); dots.push(b);
        });
      }
      // .is-current on the slide as well as the dot: lets a block animate its
      // own content per slide (hero-carousel blurs its copy in) without each
      // one re-deriving the active index from scroll position.
      function sync() {
        var c = current();
        dots.forEach(function (d, i) { d.classList.toggle('active', i === c); });
        slides.forEach(function (s, i) { s.classList.toggle('is-current', i === c); });
      }
      track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
      sync();

      // Drag release. Mandatory snap re-engages the instant dragify drops
      // .is-dragging, which yanks the track to the nearest slide — the drag
      // feels sharp and unfinished. Hand the release to to() instead: it holds
      // snap off and runs the same eased 420ms tween the arrows use, so a drag
      // ENDS the way every other navigation does. Touch is left alone — the
      // browser's own fling + snap already feels right.
      var dragFrom = null;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch' && e.button === 0) dragFrom = track.scrollLeft;
      }, true);
      function settleAfterDrag() {
        if (dragFrom === null) return;
        var moved = Math.abs(track.scrollLeft - dragFrom) > 4;
        dragFrom = null;
        if (!moved) return;                       // a click, not a drag
        track.style.scrollSnapType = 'none';      // hold it off across the handoff
        to(current());
      }
      track.addEventListener('pointerup', settleAfterDrag, true);
      track.addEventListener('pointercancel', settleAfterDrag, true);

      // Autoplay + a play/pause toggle ([data-carousel-toggle]). data-autoplay
      // present → plays by default; hover pauses; the toggle is an explicit,
      // sticky pause (hover won't resume a user-paused carousel).
      var ms = parseInt(root.getAttribute('data-autoplay') || '0', 10);
      if (ms > 0 && canAnimate) {
        var timer = null, userPaused = false;
        function step() { to((current() + 1) % slides.length); }
        function startTimer() { if (!timer && !userPaused) timer = setInterval(step, ms); }
        function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
        var toggle = root.querySelector('[data-carousel-toggle]');
        function setPaused(p) {
          userPaused = p; root.classList.toggle('is-paused', p);
          if (toggle) { toggle.setAttribute('aria-pressed', String(!p)); toggle.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
          if (p) stopTimer(); else startTimer();
        }
        if (toggle) toggle.addEventListener('click', function () { setPaused(!userPaused); });
        root.addEventListener('mouseenter', stopTimer);
        root.addEventListener('mouseleave', startTimer);
        if (toggle) { toggle.setAttribute('aria-pressed', 'true'); toggle.setAttribute('aria-label', 'Pause'); }
        startTimer();
      }
    });
  });

  /* ── Tier 2 · drag-to-scroll (horizontal scrollers: carousels, timeline) ───
     Lets a mouse drag the track sideways (touch/arrows handle their own). Snap
     is suspended mid-drag (.is-dragging) so it glides, then snaps on release.
     A drag suppresses the trailing click so cards/links don't fire after a drag. */
  function dragify(el) {
    if (!el || el.hasAttribute('data-drag-bound')) return;
    el.setAttribute('data-drag-bound', ''); el.setAttribute('data-drag-scroll', '');
    var down = false, moved = false, dragging = false, sx = 0, sl = 0, pid = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;    // native touch is fine
      down = true; moved = false; dragging = false; sx = e.clientX; sl = el.scrollLeft; pid = e.pointerId;
      // Do NOT capture the pointer here: setPointerCapture on pointerdown retargets the
      // trailing click to the track, which kills clicks on child card links. We capture
      // (and suspend scroll-snap) only once a real drag starts — see pointermove.
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!dragging && Math.abs(dx) > 10) {
        dragging = true; moved = true;
        el.style.scrollSnapType = 'none';        // snap yanks programmatic scrollLeft back
        el.classList.add('is-dragging');
        try { el.setPointerCapture(pid); } catch (err) {}
      }
      if (dragging) el.scrollLeft = sl - dx;
    });
    function end() { if (!down) return; down = false; dragging = false; el.style.scrollSnapType = ''; el.classList.remove('is-dragging'); }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
  register(function dragScroll(scope) { all(scope, '[data-drag-scroll]:not([data-drag-bound])').forEach(dragify); });

  /* ── Tier 2 · footer link accordions (footer-option1) ─────────────────────
     Below lg the four link columns collapse into independent accordion rows.
     Auto-wired by class — existing pasted copies of the block get the behavior
     with no markup change; the QR/social column has no .fo1-col-head so it is
     untouched. CSS gates the collapse to <=1023px; on desktop the classes are
     inert and the columns render exactly as before. */
  register(function fo1Accordions(scope) {
    all(scope, '.cmp-footer-option1 .fo1-col-head:not([data-fo1-bound])').forEach(function (h) {
      h.setAttribute('data-fo1-bound', '');
      var col = h.parentElement, list = h.nextElementSibling;
      if (!col || !list || list.tagName !== 'UL') return;
      col.classList.add('fo1-acc');
      h.setAttribute('role', 'button'); h.setAttribute('tabindex', '0'); h.setAttribute('aria-expanded', 'false');
      var toggle = function () {
        var open = col.classList.toggle('is-open');
        h.setAttribute('aria-expanded', String(open));
      };
      h.addEventListener('click', toggle);
      h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
  });

  /* ── Tier 2 · footer segment dropdown (footer-option1) ────────────────────
     The "You are currently browsing" pill opens a styled menu (.fo1-seg-menu)
     instead of a native select. Auto-wired by class: toggle .is-open on the
     .fo1-seg wrapper, sync aria-expanded, close on outside click / Escape,
     and on selection mirror the choice into the pill label + .is-active. */
  register(function fo1SegDropdown(scope) {
    all(scope, '.fo1-seg[data-dropdown]:not([data-fo1-seg-bound])').forEach(function (seg) {
      seg.setAttribute('data-fo1-seg-bound', '');
      var pill = seg.querySelector('.fo1-pill');
      var menu = seg.querySelector('.fo1-seg-menu');
      if (!pill || !menu) return;
      var label = pill.querySelector('.fo1-pill-label');
      var setOpen = function (open) {
        seg.classList.toggle('is-open', open);
        pill.setAttribute('aria-expanded', String(open));
      };
      pill.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(!seg.classList.contains('is-open'));
      });
      menu.addEventListener('click', function (e) {
        var item = e.target.closest('[role="menuitem"]');
        if (!item) return;
        if (item.getAttribute('href') === '#') e.preventDefault();
        menu.querySelectorAll('.is-active').forEach(function (a) { a.classList.remove('is-active'); });
        item.classList.add('is-active');
        if (label) label.textContent = item.textContent.trim();
        setOpen(false);
        pill.focus();
      });
      document.addEventListener('click', function (e) {
        if (seg.classList.contains('is-open') && !seg.contains(e.target)) setOpen(false);
      });
      seg.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && seg.classList.contains('is-open')) { setOpen(false); pill.focus(); }
      });
    });
  });

  /* ── Tier 2 · overflow-safe segment bar (site-header v2, smart collapse) ──
     Priority+ nav. The block AUTHORS an empty "More" dropdown
     (.ish-ovf-wrap[data-dropdown], hidden); this behavior measures the
     segment nav on load/resize/font-load and marks links that do not fit
     with .is-ovf (display:none via CSS), mirroring them as clones into the
     panel. The ORIGINAL nav keeps every link, so the mobile drawer and the
     active-segment chip (both built from .ish-segments) stay complete. The
     active link is never collapsed. scrollWidth/clientWidth comparisons are
     direction-agnostic, so the same math holds in RTL. The site-header
     recipe wires the dropdown's open/close (it is a normal [data-dropdown]). */
  register(function ishOverflowNav(scope) {
    all(scope, '.ish-v2 .ish-segwrap:not([data-ovf-bound])').forEach(function (wrap) {
      wrap.setAttribute('data-ovf-bound', '');
      var nav = wrap.querySelector('.ish-segments');
      var ovf = wrap.querySelector('.ish-ovf-wrap');
      var panel = ovf && ovf.querySelector('.ish-ovf-panel');
      if (!nav || !ovf || !panel) return;
      var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
      function fits() { return nav.scrollWidth <= nav.clientWidth + 1; }
      function layout() {
        links.forEach(function (a) { a.classList.remove('is-ovf'); });
        panel.innerHTML = ''; ovf.hidden = true;
        // Authored [data-ovf] links ALWAYS live in the More menu (a permanent
        // dropdown for secondary segments) — unless one is the active segment,
        // which never collapses. Auto-collapse then tops this up when even the
        // remaining links do not fit.
        var hidden = links.filter(function (a) { return a.hasAttribute('data-ovf') && !a.classList.contains('is-active'); });
        hidden.forEach(function (a) { a.classList.add('is-ovf'); });
        if (hidden.length) ovf.hidden = false;
        if (!fits()) {
          ovf.hidden = false;                        // trigger claims its width first
          for (var i = links.length - 1; i > 0 && !fits(); i--) {
            if (links[i].classList.contains('is-active') || links[i].classList.contains('is-ovf')) continue;
            links[i].classList.add('is-ovf'); hidden.push(links[i]);
          }
        }
        hidden.sort(function (a, b) { return links.indexOf(a) - links.indexOf(b); });
        hidden.forEach(function (a) {
          var c = a.cloneNode(true); c.classList.remove('is-ovf');
          c.setAttribute('role', 'menuitem'); panel.appendChild(c);
        });
        if (!hidden.length) ovf.hidden = true;
      }
      layout();
      var raf = 0;
      var kick = function () { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(layout); };
      window.addEventListener('resize', kick);
      if (window.ResizeObserver) new ResizeObserver(kick).observe(wrap);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);
    });
  });

  /* ── Tier 2 · scroll-strip segment bar fades (site-header v2-scroll) ──────
     Mirrors the strip's scroll position as .at-start/.at-end on the nav;
     CSS fades only the edges that actually hide links. |scrollLeft| keeps
     the classes logical (start/end), so RTL works without special cases. */
  register(function ishSegFades(scope) {
    all(scope, '.ish-v2-scroll .ish-segments:not([data-fade-bound])').forEach(function (nav) {
      nav.setAttribute('data-fade-bound', '');
      function sync() {
        var max = nav.scrollWidth - nav.clientWidth;
        var pos = Math.abs(nav.scrollLeft);
        nav.classList.toggle('at-start', pos < 2);
        nav.classList.toggle('at-end', max <= 0 || pos > max - 2);
      }
      nav.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      if (window.ResizeObserver) new ResizeObserver(sync).observe(nav);
      sync();
    });
  });

  /* ── Tier 2 · floating-label selects ───────────────────────────────────────
     A <select> cannot expose "an option is chosen" to CSS ([value] is a static
     attribute; :valid needs `required`), so the runtime mirrors it: the .field
     wrapper gets .has-value whenever the select holds a non-empty value
     (on init + on change). CSS floats the label off that class. */
  register(function fieldSelects(scope) {
    all(scope, '.field > select:not([data-fs-bound])').forEach(function (s) {
      s.setAttribute('data-fs-bound', '');
      var sync = function () { if (s.parentElement) s.parentElement.classList.toggle('has-value', !!s.value); };
      s.addEventListener('change', sync);
      sync();
    });
  });

  /* ── Tier 2 · modals (delegated, page-level; bound once) ─────────────────── */
  function bindModals() {
    if (bindModals._done) return; bindModals._done = true;
    function open(id) { var m = document.getElementById(id); if (m) { m.classList.add('open'); document.documentElement.style.overflow = 'hidden'; } }
    function close(m) { if (!m) return; m.classList.remove('open'); if (!document.querySelector('.open')) document.documentElement.style.overflow = ''; }
    document.addEventListener('click', function (e) {
      var o = e.target.closest('[data-modal-open]'); if (o) { e.preventDefault(); open(o.getAttribute('data-modal-open')); return; }
      var c = e.target.closest('[data-modal-close]'); if (c) { e.preventDefault(); var id = c.getAttribute('data-modal-close'); close(id ? document.getElementById(id) : c.closest('.open')); return; }
      if (e.target.matches && e.target.matches('[data-modal-dismiss]')) close(e.target);
    });
    document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; var o = document.querySelectorAll('.open'); if (o.length) close(o[o.length - 1]); });
    window.openModal = open; window.closeModal = function (id) { close(document.getElementById(id)); };
  }
  register(function () { bindModals(); });

  /* ── Tier 2 · data-href (turn any element into a link) ────────────────────
     Add data-href="/path" to make a card/tile clickable + keyboard-accessible
     (Enter / Space). data-href-target="_blank" opens a new tab. For a dialog
     instead of navigation, use data-modal-open. Bound once, page-level. */
  function bindLinks() {
    if (bindLinks._done) return; bindLinks._done = true;
    function go(el, e) {
      var href = el.getAttribute('data-href'); if (!href) return;
      e.preventDefault();
      if (el.getAttribute('data-href-target') === '_blank') window.open(href, '_blank', 'noopener');
      else window.location.href = href;
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('a,button,[data-modal-open]')) return; // real controls win
      var el = e.target.closest('[data-href]'); if (el) go(el, e);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var el = e.target && e.target.closest && e.target.closest('[data-href]');
      if (el && el === e.target) go(el, e);
    });
  }
  register(function (scope) {
    bindLinks();
    all(scope, '[data-href]:not([data-href-ready])').forEach(function (el) {
      el.setAttribute('data-href-ready', '');
      if (el.tagName !== 'A' && el.tagName !== 'BUTTON') {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'link');
      }
    });
  });

  /* ── Tier 3 · recipe registry ─────────────────────────────────────────────
     <section data-behavior="name" …config…> … </section>
     Each recipe initialises its own elements from data-attrs + child slots. */
  var recipes = {};
  function recipe(name, fn) { recipes[name] = fn; }
  register(function (scope) {
    all(scope, '[data-behavior]:not([data-behavior-bound])').forEach(function (el) {
      var name = el.getAttribute('data-behavior');
      if (!recipes[name]) return;
      el.setAttribute('data-behavior-bound', '');
      try { recipes[name](el); } catch (e) { if (window.console) console.error('[DS] recipe "' + name + '":', e); }
    });
  });

  /* recipe: zoom-parallax — scroll-driven scale of [data-scale-max] layers. */
  recipe('zoom-parallax', function (section) {
    function progress() { var r = section.getBoundingClientRect(); var sc = section.offsetHeight - vpH; return sc <= 0 ? 0 : Math.max(0, Math.min(1, -r.top / sc)); }
    function update() { var p = progress(); all(section, '[data-scale-max]').forEach(function (l) { var max = parseFloat(l.getAttribute('data-scale-max')) || 1; l.style.transform = 'scale(' + (1 + (max - 1) * p) + ')'; }); }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  });

  /* recipe: hover-video — cards holding a muted/looping <video class="sc-vid">
     (preload=none, poster shown at rest) play on hover/focus and reset on leave.
     Wires play/pause off the card so authoring stays inline-JS-free. */
  recipe('hover-video', function (section) {
    all(section, '.sc-vid').forEach(function (vid) {
      var card = vid.closest('.sc-card') || vid.closest('a') || vid.parentElement;
      if (!card) return;
      var play = function () { if (prefersReduced) return; var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
      var stop = function () { vid.pause(); try { vid.currentTime = 0; } catch (e) {} };
      card.addEventListener('mouseenter', play);
      card.addEventListener('mouseleave', stop);
      card.addEventListener('focus', play);
      card.addEventListener('blur', stop);
    });
  });

  /* recipe: scroll-frames — image-sequence (sprite) or video scrubbing on scroll.
       <div data-behavior="scroll-frames" data-scrub-vh="300"
            data-source="images" data-count="121"
            data-path="assets/images/hero-frames/ezgif-frame-###.jpg" data-start="1">
         <div data-sf-stage><canvas data-sf-canvas></canvas></div>   (sticky stage)
       </div>
     For video: data-source="video" + a <video data-sf-video> inside the stage.
     Progress is container-relative (works wherever the block sits on a page). */
  recipe('scroll-frames', function (root) {
    var vh = parseFloat(root.getAttribute('data-scrub-vh')) || 300;
    root.style.height = vh + 'vh';
    var stage = root.querySelector('[data-sf-stage]') || root;
    var source = root.getAttribute('data-source') || 'images';

    function progress() {
      var sc = root.offsetHeight - vpH;
      return sc <= 0 ? 0 : Math.max(0, Math.min(1, -root.getBoundingClientRect().top / sc));
    }

    if (source === 'video') {
      var video = root.querySelector('[data-sf-video], video');
      if (!video) return;
      video.pause();
      var lastVP = -1;
      function onV() { var p = progress(); if (p === lastVP) return; lastVP = p; if (video.duration) video.currentTime = p * video.duration; }
      window.addEventListener('scroll', onV, { passive: true });
      if (window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', onV);
      (function loopV() { onV(); requestAnimationFrame(loopV); })();   // rAF: robust under Lenis / programmatic scroll
      if (video.readyState >= 1) onV(); else video.addEventListener('loadedmetadata', function () { lastVP = -1; onV(); });
      return;
    }

    // images / sprite sequence
    var canvas = root.querySelector('[data-sf-canvas], canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var count = parseInt(root.getAttribute('data-count') || '0', 10);
    var startIdx = parseInt(root.getAttribute('data-start') || '1', 10);
    var pathTpl = root.getAttribute('data-path') || '';
    if (!count || !pathTpl) return;
    var pad = (pathTpl.match(/#+/) || ['###'])[0].length;
    function src(i) { return pathTpl.replace(/#+/, String(i).padStart(pad, '0')); }

    var imgs = new Array(count), cur = 0, raf = 0;
    function ensureSize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.round(canvas.offsetWidth * dpr), h = Math.round(canvas.offsetHeight * dpr);
      if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; }
    }
    function draw() {
      var im = imgs[cur]; if (!im || !im.complete || !im.naturalWidth) return;  // frame not loaded yet → keep last
      ensureSize();
      var W = canvas.width, H = canvas.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      var dW = im.naturalWidth * s, dH = im.naturalHeight * s;
      ctx.clearRect(0, 0, W, H); ctx.drawImage(im, (W - dW) / 2, (H - dH) / 2, dW, dH);
    }
    function onScroll() { var c = Math.round(progress() * (count - 1)); if (c === cur) return; cur = c; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    // Draw each frame as soon as it is BOTH needed and loaded — no waiting for
    // the whole (heavy) sequence, so the canvas shows content immediately and
    // scrubbing fills in progressively as later frames decode.
    var started = false;
    function startPreload() {
      if (started) return; started = true;
      for (var i = 0; i < count; i++) {
        (function (i) {
          var im = new Image();
          im.onload = function () { if (i === cur) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } };
          im.src = src(startIdx + i);
          imgs[i] = im;
        })(i);
      }
      onScroll();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', onScroll);
    (function loopF() { onScroll(); requestAnimationFrame(loopF); })();   // rAF: robust under Lenis / programmatic scroll
    window.addEventListener('resize', function () { ensureSize(); draw(); });
    // LAZY: a frame sequence can be tens of MB — only fetch it once the hero is
    // near the viewport, so off-screen heroes never block initial page load.
    if ('IntersectionObserver' in window) {
      var sfIo = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { sfIo.disconnect(); startPreload(); }
      }, { rootMargin: '150% 0px' });
      sfIo.observe(root);
    } else {
      startPreload();
    }
  });

  /* ── Smooth scroll (Lenis, lazy) ──────────────────────────────────────────
     Momentum/lerp page scroll for that "buttery" feel. Lazy-loads lenis from
     the same dir as ds.js. Off for reduced-motion, coarse-pointer/touch (native
     momentum already smooth), or when <html data-no-smooth> / window.DS_NO_SMOOTH.
     Lenis owns vertical scroll everywhere (no native handoff = no jitter);
     horizontal scrollers are drag-scrollable instead. #anchors scroll via Lenis. */
  function dsBaseDir() {
    var s = document.currentScript || document.querySelector('script[src*="ds.js"]');
    return (s && s.src) ? s.src.replace(/[^/]*$/, '') : 'assets/js/';
  }
  function loadScript(src, cb) {
    var s = document.createElement('script'); s.src = src; s.defer = true;
    s.onload = cb; s.onerror = function () { if (window.console) console.warn('[DS] failed to load ' + src); };
    document.head.appendChild(s);
  }
  function initSmoothScroll() {
    var html = document.documentElement;
    if (!canAnimate) return;                                   // reduced-motion / no-IO
    if (html.hasAttribute('data-no-smooth') || window.DS_NO_SMOOTH) return;
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;  // touch: native is smooth
    loadScript(dsBaseDir() + 'lenis.min.js', function () {
      if (!window.Lenis) return;
      var lenis = new Lenis({ duration: 1.05, lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
        var id = a.getAttribute('href'); if (!id || id.length < 2) return;
        var target = document.querySelector(id); if (!target) return;
        e.preventDefault(); lenis.scrollTo(target);
      });
      window.DS.lenis = lenis;
    });
  }

  /* ── Boot + public API ──────────────────────────────────────────────────── */
  window.DS = { refresh: run, register: register, recipe: recipe, canAnimate: canAnimate, dragScroll: dragify, isRTL: isRTL };
  function boot() { run(document); initSmoothScroll(); }
  // Defer the first scan a tick: recipes are registered via DS.recipe() AFTER
  // this IIFE (appended below), so they must be in the registry before we scan.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   TIER-3 RECIPES (registered after the core; each self-contained & element-scoped)
═══════════════════════════════════════════════════════════════════════════ */

/* world-map — animated SVG route arcs + city dots. rAF-driven (no SMIL, no libs).
   Arcs draw in staggered, hold, then redraw on a loop; dots pulse via CSS;
   labels fade in once. Overlay uses slice so it tracks the object-cover base. */
DS.recipe('world-map', function (root) {
  var svgNS='http://www.w3.org/2000/svg';
  var animate = !!(window.DS && DS.canAnimate);
  var d=root.dataset;
  var LINE=d.lineColor||(getComputedStyle(root).getPropertyValue('--blue')||'').trim()||'#2765FF',
      INK=(getComputedStyle(root).getPropertyValue('--navy')||'').trim()||'#072447',
      INK_RGB=(getComputedStyle(root).getPropertyValue('--navy-rgb')||'').trim()||'7,36,71', XO=parseFloat(d.xOffset)||0, YO=parseFloat(d.yOffset)||0,
      DUR=parseFloat(d.animDur)||1.5, STAG=parseFloat(d.stagger)||0.45, PAUSE=parseFloat(d.pause)||2.4;
  var dots; try { dots=JSON.parse(d.dots||'[]'); } catch(e){ dots=[]; }
  if(!dots.length) return;
  function project(lat,lng){ return { x:(lng+180)*(800/360)+XO, y:(90-lat)*(400/180)+YO }; }
  function curve(s,e){ var midX=(s.x+e.x)/2, midY=Math.min(s.y,e.y)-50; return 'M '+s.x+' '+s.y+' Q '+midX+' '+midY+' '+e.x+' '+e.y; }
  function el(tag,attrs){ var n=document.createElementNS(svgNS,tag); if(attrs)Object.keys(attrs).forEach(function(k){ n.setAttribute(k,String(attrs[k])); }); return n; }
  var svg=el('svg',{ viewBox:'0 0 800 400', preserveAspectRatio:'xMidYMid slice', 'aria-hidden':'true' }); svg.setAttribute('class','wm-overlay');
  root.appendChild(svg);

  /* arcs */
  var arcs=[];
  dots.forEach(function(dot,i){
    var s=project(dot.start.lat,dot.start.lng), e=project(dot.end.lat,dot.end.lng);
    var path=el('path',{ d:curve(s,e), fill:'none', stroke:LINE, 'stroke-width':'1.5', 'stroke-linecap':'round', opacity:'0.85' });
    svg.appendChild(path);
    var len=path.getTotalLength();
    path.style.strokeDasharray=len;
    path.style.strokeDashoffset=animate?len:0;
    arcs.push({ path:path, len:len, start:i*STAG, end:i*STAG+DUR });
  });

  /* city dots + labels (deduped) */
  var seen={}, labels=[];
  dots.forEach(function(dot){ [dot.start,dot.end].forEach(function(ep){
    var key=ep.lat.toFixed(1)+','+ep.lng.toFixed(1); if(seen[key]) return; seen[key]=1;
    var pt=project(ep.lat,ep.lng), g=el('g');
    g.appendChild(el('circle',{cx:pt.x,cy:pt.y,r:'11',fill:LINE,opacity:'0.12'}));
    if(animate){ var ring=el('circle',{cx:pt.x,cy:pt.y,r:'5',fill:'none',stroke:LINE,'stroke-width':'1.4'}); ring.setAttribute('class','wm-pulse'); g.appendChild(ring); }
    g.appendChild(el('circle',{cx:pt.x,cy:pt.y,r:'5',fill:LINE}));
    g.appendChild(el('circle',{cx:pt.x,cy:pt.y,r:'2',fill:'#fff'}));
    if(ep.label){
      var city=ep.label, boxW=Math.ceil(city.length*5.6+20), boxH=21,
          side=ep.labelSide||'above', off=(side==='below')?14:(-boxH-11), boxX=pt.x-boxW/2, boxY=pt.y+off;
      var lg=el('g',{opacity:animate?'0':'1'}); lg.style.pointerEvents='none';
      var rect=el('rect',{x:boxX,y:boxY,width:boxW,height:boxH,rx:'5',fill:'#ffffff',stroke:'rgba('+INK_RGB+',0.10)','stroke-width':'0.75'});
      rect.style.filter='drop-shadow(0 2px 6px rgba(7,36,71,0.18))'; lg.appendChild(rect);
      var text=el('text',{x:pt.x,y:boxY+boxH/2+3.6,'text-anchor':'middle',fill:INK,'font-size':'10.5','font-weight':'600','font-family':(getComputedStyle(document.body).fontFamily||'Plus Jakarta Sans, sans-serif')}); text.textContent=city; lg.appendChild(text);
      g.appendChild(lg); labels.push(lg);
    }
    svg.appendChild(g);
  }); });

  if(!animate) return;

  /* labels fade in once, staggered */
  requestAnimationFrame(function(){ labels.forEach(function(lg,i){ lg.style.transition='opacity .5s ease'; lg.style.transitionDelay=(0.4+i*0.18)+'s'; lg.setAttribute('opacity','1'); }); });

  /* arcs: rAF dash loop, paused when off-screen */
  var drawEnd=(arcs.length-1)*STAG+DUR, total=drawEnd+PAUSE, t0=null, raf=null;
  function ease(p){ return 1-Math.pow(1-p,3); }
  function frame(ts){
    if(t0===null) t0=ts;
    var t=((ts-t0)/1000)%total;
    arcs.forEach(function(a){
      var p = t<=a.start?0 : t>=a.end?1 : (t-a.start)/(a.end-a.start);
      a.path.style.strokeDashoffset = a.len*(1-ease(p));
    });
    raf=requestAnimationFrame(frame);
  }
  function start(){ if(!raf){ t0=null; raf=requestAnimationFrame(frame); } }
  function stop(){ if(raf){ cancelAnimationFrame(raf); raf=null; } }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ en.forEach(function(e){ e.isIntersecting?start():stop(); }); }, {threshold:0.05}).observe(root);
  } else { start(); }
});

/* card-rotator — true content-swap. Each [data-rotator-slot] holds several
   [data-rotator-card] variants; the recipe cross-fades through them on an
   interval, staggered per slot, so cards leave and new ones arrive (the slot's
   position can differ per variant). data-interval (ms/card), data-stagger
   (ms between slots). Reduced-motion / single-variant slots stay static. */
DS.recipe('card-rotator', function (root) {
  var animate = !!(window.DS && DS.canAnimate);
  var interval = parseInt(root.getAttribute('data-interval') || '4500', 10);
  var stagger = parseInt(root.getAttribute('data-stagger') || '1200', 10);
  var slots = Array.prototype.slice.call(root.querySelectorAll('[data-rotator-slot]'));
  var timers = [];
  slots.forEach(function (slot, si) {
    var cards = Array.prototype.slice.call(slot.querySelectorAll('[data-rotator-card]'));
    if (!cards.length) return;
    cards.forEach(function (c, i) { c.classList.toggle('is-active', i === 0); });
    if (!animate || cards.length < 2) return;
    var idx = 0;
    function next() {
      var cur = cards[idx]; idx = (idx + 1) % cards.length; var nx = cards[idx];
      cur.classList.remove('is-active'); cur.classList.add('is-leaving');
      nx.classList.add('is-active');
      setTimeout(function () { cur.classList.remove('is-leaving'); }, 700);
    }
    function startTimer() { if (!timers[si]) timers[si] = setInterval(next, interval); }
    setTimeout(startTimer, si * stagger);
    root.addEventListener('mouseenter', function () { clearInterval(timers[si]); timers[si] = null; });
    root.addEventListener('mouseleave', startTimer);
  });
});

/* timeline — swipeable horizontal timeline (scroll-snap, centred active node).
   No libs. Pure scroll-snap for the swipe; tiny rAF read on scroll marks the
   centred node (.is-active / .is-past) + drives the progress-line width. Arrows
   and node clicks scroll the nearest node to centre. Slots:
   [data-timeline-viewport] (scroller) > [data-timeline-track] > N [data-timeline-node],
   [data-timeline-fill] (progress line), [data-timeline-prev]/[data-timeline-next]. */
DS.recipe('timeline', function (root) {
  var vp = root.querySelector('[data-timeline-viewport]');
  var track = root.querySelector('[data-timeline-track]');
  var fill = root.querySelector('[data-timeline-fill]');
  var nodes = Array.prototype.slice.call(root.querySelectorAll('[data-timeline-node]'));
  var prev = root.querySelector('[data-timeline-prev]');
  var next = root.querySelector('[data-timeline-next]');
  if (!vp || !nodes.length) return;
  if (DS.dragScroll) DS.dragScroll(vp);                      // mouse-drag horizontal (Lenis owns vertical)
  var active = 0, ticking = false;
  var smooth = !!(window.DS && DS.canAnimate);
  function pad() {
    // leading/trailing room so the first & last node can sit dead-centre
    var p = Math.max(0, vp.clientWidth / 2 - nodes[0].offsetWidth / 2);
    track.style.paddingLeft = p + 'px'; track.style.paddingRight = p + 'px';
  }
  // Geometry-based (getBoundingClientRect) rather than offsetLeft math — rects
  // are visual px, identical logic in LTR and RTL regardless of which ancestor
  // is the offsetParent. Only the FILL flips: it measures the "past" side of
  // the line, which grows from the LEFT track edge in LTR, the RIGHT in RTL.
  function rectCenter(el) { var r = el.getBoundingClientRect(); return r.left + r.width / 2; }
  function update() {
    ticking = false;
    var vr = vp.getBoundingClientRect(), mid = vr.left + vr.width / 2, best = 0, bestD = Infinity;
    nodes.forEach(function (n, i) { var d = Math.abs(rectCenter(n) - mid); if (d < bestD) { bestD = d; best = i; } });
    active = best;
    nodes.forEach(function (n, i) { n.classList.toggle('is-active', i === active); n.classList.toggle('is-past', i < active); });
    if (fill) {
      var lineHost = track || vp, hr = lineHost.getBoundingClientRect(), c = rectCenter(nodes[active]);
      fill.style.width = Math.max(0, Math.round(DS.isRTL(vp) ? (hr.right - c) : (c - hr.left))) + 'px';
    }
    if (prev) prev.disabled = active <= 0;
    if (next) next.disabled = active >= nodes.length - 1;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function go(i) {
    i = Math.max(0, Math.min(nodes.length - 1, i));
    var vr = vp.getBoundingClientRect();
    vp.scrollTo({ left: vp.scrollLeft + (rectCenter(nodes[i]) - (vr.left + vr.width / 2)), behavior: smooth ? 'smooth' : 'auto' });
  }
  vp.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { pad(); onScroll(); });
  if (prev) prev.addEventListener('click', function () { go(active - 1); });
  if (next) next.addEventListener('click', function () { go(active + 1); });
  nodes.forEach(function (n, i) {
    n.addEventListener('click', function () { go(i); });
    n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); } });
  });
  pad();
  requestAnimationFrame(update);
});

/* testimonials — centre-mode carousel: a large active card flanked by faded
   prev/next peeks, quote + "read case study" below, autoplay with pause, pill
   dots. No libs. Cards are authored in order; the recipe positions whichever
   three are prev/active/next (CSS `order`), builds the dots, and cycles. Slots:
   [data-tc-strip] > N [data-tc-card] (each: .tc-media>.tc-img + [data-tc-toggle],
   .tc-foot-side, .tc-foot-active), [data-tc-dots]. data-autoplay (ms). */
DS.recipe('testimonials', function (root) {
  var strip = root.querySelector('[data-tc-strip]');
  var cards = Array.prototype.slice.call(root.querySelectorAll('[data-tc-card]'));
  var dotsWrap = root.querySelector('[data-tc-dots]');
  var n = cards.length; if (!strip || !n) return;
  var animate = !!(window.DS && DS.canAnimate);
  var apAttr = root.getAttribute('data-autoplay');
  var autoplay = apAttr !== '0';
  var ms = parseInt(apAttr || '4000', 10);
  var active = 0, playing = animate && autoplay, timer = null, dots = [];
  var toggles = Array.prototype.slice.call(root.querySelectorAll('[data-tc-toggle]'));
  function syncToggles() {
    toggles.forEach(function (t) {
      t.setAttribute('aria-pressed', String(playing));
      t.setAttribute('aria-label', playing ? 'Pause testimonials' : 'Play testimonials');
    });
  }

  if (dotsWrap) {
    cards.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tc-dot'; b.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b); dots.push(b);
    });
  }
  function layout() {
    var prev = (active - 1 + n) % n, next = (active + 1) % n;
    cards.forEach(function (c, i) {
      c.classList.remove('is-active', 'is-prev', 'is-next', 'is-shown'); c.style.order = '';
      if (i === active) { c.classList.add('is-active', 'is-shown'); c.style.order = '2'; }
      else if (i === prev) { c.classList.add('is-prev', 'is-shown'); c.style.order = '1'; }
      else if (i === next) { c.classList.add('is-next', 'is-shown'); c.style.order = '3'; }
      // The prev/next cards are mouse-clickable (advance carousel) → make them
      // keyboard-operable too: roving tabindex + button semantics. Active card is
      // not a control (it's the current slide), so it leaves the tab order.
      if (i === prev || i === next) {
        c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button');
      } else {
        c.setAttribute('tabindex', '-1'); c.removeAttribute('role');
      }
    });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === active); });
  }
  function restart() { if (timer) { clearInterval(timer); timer = null; } if (playing && animate && autoplay) timer = setInterval(function () { goTo(active + 1); }, ms); }
  function goTo(i) { active = ((i % n) + n) % n; layout(); restart(); }
  function setPlaying(p) { playing = p && autoplay; root.classList.toggle('is-paused', !playing); syncToggles(); restart(); }

  root.addEventListener('click', function (e) {
    if (e.target.closest('[data-tc-toggle]')) { e.stopPropagation(); setPlaying(!playing); return; }
    if (e.target.closest('[data-tc-prev]')) { e.stopPropagation(); goTo(active - 1); return; }
    if (e.target.closest('[data-tc-next]')) { e.stopPropagation(); goTo(active + 1); return; }
    if (e.target.closest('a')) return;
    var card = e.target.closest('[data-tc-card]');
    if (card && !card.classList.contains('is-active')) goTo(cards.indexOf(card));
  });
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var card = e.target.closest('[data-tc-card]');
    if (card && !card.classList.contains('is-active')) { e.preventDefault(); goTo(cards.indexOf(card)); }
  });
  if (!animate || !autoplay) root.classList.add('is-paused');
  if (!autoplay) {
    toggles.forEach(function (t) { t.setAttribute('hidden', ''); t.setAttribute('aria-hidden', 'true'); t.setAttribute('tabindex', '-1'); });
  } else {
    syncToggles();
  }
  layout(); restart();
});

/* video-content — one active index drives three synced regions: left text/stat,
   centre image + a restacking deal-card deck, right testimonial. Autoplay with
   pause-on-hover, progress pill + dots. No libs. Crossfading regions carry
   [data-vc-swap] data-vc-index; the deck cards carry [data-vc-card] data-vc-index
   (positioned by slot); [data-vc-dots] (built here), [data-vc-progress] (bar).
   data-interval (ms). Reduced-motion → static first slide. */
DS.recipe('video-content', function (root) {
  var animate = !!(window.DS && DS.canAnimate);
  var ms = parseInt(root.getAttribute('data-interval') || '4000', 10);
  var swaps = Array.prototype.slice.call(root.querySelectorAll('[data-vc-swap]'));
  var cards = Array.prototype.slice.call(root.querySelectorAll('[data-vc-card]'));
  var dotsWrap = root.querySelector('[data-vc-dots]');
  var bar = root.querySelector('[data-vc-progress]');
  var N = cards.length; if (!N) return;
  var active = 0, playing = animate, timer = null, dots = [];
  if (dotsWrap) {
    for (var k = 0; k < N; k++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'vc-dot';
      b.setAttribute('aria-label', 'Slide ' + (i + 1));
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b); dots.push(b);
    })(k);
  }
  function paintBar() {
    if (!bar) return;
    bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth;
    if (animate && playing) { bar.style.transition = 'width ' + ms + 'ms linear'; bar.style.width = '100%'; }
  }
  function apply() {
    swaps.forEach(function (el) { el.classList.toggle('is-active', parseInt(el.getAttribute('data-vc-index'), 10) === active); });
    cards.forEach(function (c) {
      var i = parseInt(c.getAttribute('data-vc-index'), 10), slot = (i - active + N) % N;
      c.style.zIndex = String(N - slot);
      c.style.transform = 'translateY(' + (slot * 44) + 'px) scale(' + (1 - slot * 0.025) + ')';
      c.style.opacity = slot === 0 ? '1' : slot === 1 ? '0.88' : slot === 2 ? '0.7' : '0.45';
    });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === active); });
    paintBar();
  }
  function restart() { if (timer) { clearInterval(timer); timer = null; } if (animate && playing) timer = setInterval(function () { goTo(active + 1); }, ms); }
  function goTo(i) { active = ((i % N) + N) % N; apply(); restart(); }
  root.addEventListener('mouseenter', function () { if (timer) { clearInterval(timer); timer = null; } if (bar) { var w = getComputedStyle(bar).width; bar.style.transition = 'none'; bar.style.width = w; } });
  root.addEventListener('mouseleave', function () { if (playing) restart(); });
  apply(); restart();
});

/* coverflow — coverflow: a sharp centre card flanked by blurred/scaled/dimmed
   side cards (CSS transform + filter), with synced eyebrow/title/desc, a faint
   blurred backdrop of the active image, numbered nav + Explore. Autoplay, pause
   on hover, click a side card or use prev/next to advance. No libs. Slots:
   [data-fr-stage] > N [data-fr-card] (data-bg = image, data-fr-href = link),
   [data-fr-text] (synced copy), [data-fr-bg], [data-fr-prev]/[data-fr-next],
   [data-fr-count], [data-fr-explore]. data-interval (ms). */
DS.recipe('coverflow', function (root) {
  var animate = !!(window.DS && DS.canAnimate);
  var ms = parseInt(root.getAttribute('data-interval') || '5000', 10);
  var cards = Array.prototype.slice.call(root.querySelectorAll('[data-fr-card]'));
  var texts = Array.prototype.slice.call(root.querySelectorAll('[data-fr-text]'));
  var bg = root.querySelector('[data-fr-bg]');
  var prev = root.querySelector('[data-fr-prev]');
  var next = root.querySelector('[data-fr-next]');
  var countEl = root.querySelector('[data-fr-count]');
  var explore = root.querySelector('[data-fr-explore]');
  var N = cards.length; if (!N) return;
  var active = 0, timer = null, half = Math.floor(N / 2);
  function layout() {
    var sign = DS.isRTL(root) ? -1 : 1;   // RTL: "next" fans out to the LEFT
    cards.forEach(function (c, i) {
      var raw = (i - active + N) % N, offset = raw > half ? raw - N : raw;
      var dist = Math.abs(offset), center = offset === 0, visible = dist <= 2;
      var x = offset * 300 * sign, z = -dist * 180, scale = center ? 1 : 0.82, ry = offset * -18 * sign;
      c.style.zIndex = center ? 30 : 20 - dist;
      c.style.transform = 'translate3d(' + x + 'px,0,' + z + 'px) rotateY(' + ry + 'deg) scale(' + scale + ')';
      c.style.opacity = visible ? (center ? 1 : Math.max(0.12, 1 - dist * 0.45)) : 0;
      c.style.filter = 'blur(' + (center ? 0 : dist * 5) + 'px) brightness(' + (center ? 1 : 0.55) + ')';
      c.style.pointerEvents = visible ? 'auto' : 'none';
      c.classList.toggle('is-center', center);
    });
    texts.forEach(function (t) { t.classList.toggle('is-active', parseInt(t.getAttribute('data-fr-index'), 10) === active); });
    if (countEl) countEl.textContent = (active + 1) + ' / ' + N;
    if (bg) { var img = cards[active].getAttribute('data-bg'); if (img) bg.style.backgroundImage = "url('" + img + "')"; }
    if (explore) {
      var lbl = cards[active].getAttribute('aria-label') || '';
      var href = cards[active].getAttribute('data-fr-href'); if (href) explore.setAttribute('href', href);
      explore.setAttribute('aria-label', 'Explore' + (lbl ? ' ' + lbl : ''));
    }
    // Only the centre card is a tab stop / activation target (WCAG 2.4.3/2.4.7).
    cards.forEach(function (c, i) { c.setAttribute('tabindex', i === active ? '0' : '-1'); c.classList.toggle('is-focus', i === active); });
  }
  var stopped = false; // becomes true once user interacts (WCAG 2.2.2 Pause, Stop, Hide)
  function stop() { stopped = true; if (timer) { clearInterval(timer); timer = null; } }
  function go(i) { active = ((i % N) + N) % N; layout(); restart(); }
  function restart() { if (timer) { clearInterval(timer); timer = null; } if (animate && !stopped) timer = setInterval(function () { go(active + 1); }, ms); }
  if (prev) prev.addEventListener('click', function () { stop(); go(active - 1); });
  if (next) next.addEventListener('click', function () { stop(); go(active + 1); });
  cards.forEach(function (c, i) {
    c.addEventListener('click', function () { stop(); if (i !== active) go(i); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stop(); if (i !== active) go(i); } });
    c.addEventListener('focus', function () { stop(); });
  });
  root.addEventListener('mouseenter', function () { if (timer) { clearInterval(timer); timer = null; } });
  root.addEventListener('mouseleave', function () { restart(); });
  layout(); restart();
});

/* spotlight — cursor-following glow. On pointer move over the container, the
   tile under the cursor gets --mx/--my (local px) so a CSS radial highlight
   tracks the pointer. Pure micro-interaction; reduced-motion users just lose
   the glow (CSS gates it). Slots: [data-behavior="spotlight"] > [data-spotlight-tile]. */
DS.recipe('spotlight', function (root) {
  if (!(window.DS && DS.canAnimate)) return;
  root.addEventListener('pointermove', function (e) {
    var t = e.target.closest && e.target.closest('[data-spotlight-tile]');
    if (!t || !root.contains(t)) return;
    var r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
});

/* sticky-scroll — scrollytelling. A media pane pins while text steps scroll
   past; the step crossing the viewport centre becomes active and swaps the
   pinned media. No libs (IntersectionObserver). Reduced-motion → first media,
   all steps lit. Slots: [data-behavior="sticky-scroll"] with N [data-ss-step]
   and N [data-ss-media-item] (index-aligned by DOM order). */
DS.recipe('sticky-scroll', function (root) {
  var steps = Array.prototype.slice.call(root.querySelectorAll('[data-ss-step]'));
  var medias = Array.prototype.slice.call(root.querySelectorAll('[data-ss-media-item]'));
  var bgs = Array.prototype.slice.call(root.querySelectorAll('[data-ss-bg]'));   // optional per-step backdrops
  if (!steps.length) return;
  function setActive(i) {
    steps.forEach(function (s, idx) { s.classList.toggle('is-active', idx === i); });
    medias.forEach(function (m, idx) { m.classList.toggle('is-active', idx === i); });
    bgs.forEach(function (b, idx) { b.classList.toggle('is-active', idx <= i); });  // cumulative: each new bg slides up & covers
  }
  if (!(window.DS && DS.canAnimate)) { steps.forEach(function (s) { s.classList.add('is-active'); }); if (medias[0]) medias[0].classList.add('is-active'); if (bgs[0]) bgs[0].classList.add('is-active'); return; }
  setActive(0);
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { var i = steps.indexOf(e.target); if (i >= 0) setActive(i); } });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  steps.forEach(function (s) { io.observe(s); });
});

/* hover-list — a list of rows; hovering a row reveals a preview image that
   follows the cursor (lerped). Desktop/fine-pointer only (touch keeps the list
   as plain links). Slots: [data-behavior="hover-list"] with [data-hl-preview]
   and N [data-hl-row] (each data-hl-img="/path"). */
DS.recipe('hover-list', function (root) {
  if (!(window.DS && DS.canAnimate)) return;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  var preview = root.querySelector('[data-hl-preview]');
  var rows = Array.prototype.slice.call(root.querySelectorAll('[data-hl-row]'));
  if (!preview || !rows.length) return;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  function loop() { cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; preview.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)'; raf = requestAnimationFrame(loop); }
  rows.forEach(function (r) {
    r.addEventListener('pointerenter', function () { var img = r.getAttribute('data-hl-img'); if (img) preview.style.backgroundImage = "url('" + img + "')"; preview.classList.add('is-on'); r.classList.add('is-hover'); if (!raf) loop(); });
    r.addEventListener('pointerleave', function () { r.classList.remove('is-hover'); });
  });
  root.addEventListener('pointermove', function (e) { var rect = root.getBoundingClientRect(); tx = e.clientX - rect.left; ty = e.clientY - rect.top; });
  root.addEventListener('pointerleave', function () { preview.classList.remove('is-on'); if (raf) { cancelAnimationFrame(raf); raf = null; } });
});

/* ib-hero — cinematic hero: cycles an active index every data-interval,
   crossfading every [data-ibh-slide="i"] layer (background images AND the
   floating card-sets) in sync, so the photo changes while the deal cards
   reposition + change content together. Pauses on hover. No libs. */
DS.recipe('ib-hero', function (root) {
  var animate = !!(window.DS && DS.canAnimate);
  var ms = parseInt(root.getAttribute('data-interval') || '6500', 10);
  var layers = Array.prototype.slice.call(root.querySelectorAll('[data-ibh-slide]'));
  if (!layers.length) return;
  function idxOf(el) { return parseInt(el.getAttribute('data-ibh-slide'), 10); }
  var n = Math.max.apply(null, layers.map(idxOf)) + 1;
  var active = 0, timer = null, dots = [];
  // slide-navigator dots
  var nav = root.querySelector('[data-ibh-nav]');
  if (nav) {
    for (var k = 0; k < n; k++) (function (i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'ibc-dot';
      b.setAttribute('aria-label', 'Slide ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      nav.appendChild(b); dots.push(b);
    })(k);
  }
  function apply() {
    layers.forEach(function (el) { el.classList.toggle('is-active', idxOf(el) === active); });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === active); });
  }
  apply();
  if (!animate || n < 2) return;
  function start() { if (!timer) timer = setInterval(function () { active = (active + 1) % n; apply(); }, ms); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function go(i) { active = ((i % n) + n) % n; apply(); if (timer) { stop(); start(); } }
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  start();
});


/* recipes: scroll-story / scroll-story-scrub — DECLARATIVE scroll timelines.
   Author a timeline as markup: each element carries data-anim JSON keyframes,
   keyed by a progress range "a-b" (0..1) mapping props to [from,to]. The recipe
   reads the block's container-relative scroll progress and interpolates every
   element — no per-story JS. Props: x,y,z (px), scale, rotate, rotateX, rotateY
   (deg), opacity, blur (px). A prop may appear in several ranges; between ranges
   its last value holds. Robust rAF driver (works under Lenis / programmatic scroll).
     <div data-behavior="scroll-story" data-scrub-vh="500">
       <div class="stage">                          (sticky/pinned via your CSS)
         <h1 data-anim='{"0-0.2":{"y":[60,0],"opacity":[0,1]},"0.7-0.9":{"opacity":[1,0]}}'>…</h1>
       </div>
     </div>
   scroll-story-scrub adds a pinned background scrub driven by the same progress:
     data-source="images" data-count data-path data-start  + <canvas data-story-canvas>
     data-source="video"                                   + <video  data-story-video>  */
(function () {
  // Cached viewport height (address-bar guard) — this is a SEPARATE IIFE from the
  // one at the top of the file, so it needs its own copy; the scroll-story recipes
  // below reference vpH for scroll-progress math. Refresh only on real width change.
  var vpH = window.innerHeight;
  (function () { var w = window.innerWidth; window.addEventListener('resize', function () { if (window.innerWidth !== w) { w = window.innerWidth; vpH = window.innerHeight; } }, { passive: true }); })();
  function eio(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function parseAnim(el) {
    var raw = el.getAttribute('data-anim'); if (!raw) return null;
    var spec; try { spec = JSON.parse(raw); } catch (e) { if (window.console) console.warn('[DS] bad data-anim JSON', el); return null; }
    // Optional uniform progress offset: shifts every keyframe window later, so a
    // mockup/card can lag its sibling text by a hair (a scroll-driven stagger).
    var delay = parseFloat(el.getAttribute('data-anim-delay')) || 0;
    var props = {};
    Object.keys(spec).forEach(function (range) {
      var m = range.split('-'), a = parseFloat(m[0]) + delay, b = parseFloat(m[1]) + delay; if (isNaN(a) || isNaN(b)) return;
      var kf = spec[range];
      Object.keys(kf).forEach(function (p) { (props[p] = props[p] || []).push({ a: a, b: b, from: kf[p][0], to: kf[p][1] }); });
    });
    Object.keys(props).forEach(function (k) { props[k].sort(function (x, y) { return x.a - y.a; }); });
    return Object.keys(props).length ? props : null;
  }
  // Interpolate numbers OR unit values ("85vw","40px","100%") — keeps the unit.
  function lerpV(a, b, t) {
    if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
    var na = parseFloat(a), nb = parseFloat(b), unit = String(typeof a === 'string' ? a : b).replace(/^[+-]?[\d.]+/, '');
    return (na + (nb - na) * t) + unit;
  }
  function valueAt(segs, p) {
    if (p <= segs[0].a) return segs[0].from;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (p <= s.b) { if (p < s.a) return segs[i - 1] ? segs[i - 1].to : s.from; return lerpV(s.from, s.to, eio((p - s.a) / (s.b - s.a))); }
    }
    return segs[segs.length - 1].to;
  }
  // Transform-axis props compose into one transform; the rest map to CSS / text.
  var TR = { x: 1, y: 1, z: 1, scale: 1, rotate: 1, rotateX: 1, rotateY: 1 };
  function applyEl(el, props, p) {
    var v = function (k, d) { return props[k] ? valueAt(props[k], p) : d; };
    // unit-aware translate axis: number → px, string → as-is (e.g. "110vh","50%")
    var u = function (k) { var val = props[k] ? valueAt(props[k], p) : 0; return typeof val === 'number' ? val + 'px' : val; };
    var hasTransform = false, k;
    for (k in TR) { if (props[k]) { hasTransform = true; break; } }
    if (hasTransform) el.style.transform = 'translate3d(' + u('x') + ',' + u('y') + ',' + u('z') + ') rotateX(' + v('rotateX', 0) + 'deg) rotateY(' + v('rotateY', 0) + 'deg) rotate(' + v('rotate', 0) + 'deg) scale(' + v('scale', 1) + ')';
    if (props.opacity) el.style.opacity = v('opacity', 1);
    if (props.blur) el.style.filter = 'blur(' + v('blur', 0) + 'px)';
    if (props.width) el.style.width = v('width');
    if (props.height) el.style.height = v('height');
    if (props.borderRadius) el.style.borderRadius = v('borderRadius');
    if (props.strokeDashoffset) el.style.strokeDashoffset = v('strokeDashoffset');
    if (props.count) el.textContent = Math.round(v('count', 0));
  }

  function story(root, scrub) {
    var animate = !!(window.DS && DS.canAnimate);
    var vh = parseFloat(root.getAttribute('data-scrub-vh')) || 300;
    if (window.innerWidth < 1024) vh = Math.min(vh, 300);
    root.style.height = vh + 'vh';
    var els = Array.prototype.slice.call(root.querySelectorAll('[data-anim]')).map(function (el) { return { el: el, props: parseAnim(el) }; }).filter(function (x) { return x.props; });

    // First-beat content is authored as a scroll-driven fade-in from progress 0
    // ("0-x": opacity [0,1]) — which leaves the hero EMPTY before the user
    // scrolls. Snap those zero-start entry windows to their settled state so
    // slide 1 is readable on load, and play a soft time-based intro instead.
    // Only fully-hidden entries qualify (opacity from 0); whole-story scrub
    // overlays ("0-1" opacity .4→.74 etc.) keep their authored ramp.
    var intro = [];
    els.forEach(function (x) {
      var op = x.props.opacity;
      if (!op || op[0].a > 0.001 || parseFloat(op[0].from) !== 0) return;
      Object.keys(x.props).forEach(function (k) {
        x.props[k].forEach(function (s) { if (s.a <= 0.001) s.from = s.to; });
      });
      intro.push(x.el);
    });

    function progress() { var sc = root.offsetHeight - vpH; return sc <= 0 ? 0 : Math.max(0, Math.min(1, -root.getBoundingClientRect().top / sc)); }

    // Progress dots (.ess-dots i) — one per .ess-ch chapter. A chapter "becomes
    // active" at the start of its fade-in window (opacity 0→1); the first
    // chapter has no fade-in (it's visible from progress 0), so it activates at 0.
    var dotEls = Array.prototype.slice.call(root.querySelectorAll('.ess-dots i'));
    var chEls = Array.prototype.slice.call(root.querySelectorAll('.ess-ch'));
    var chThresholds = (dotEls.length && dotEls.length === chEls.length) ? chEls.map(function (ch, i) {
      if (i === 0) return 0;
      var op = (parseAnim(ch) || {}).opacity;
      return (op && op.length && parseFloat(op[0].from) === 0) ? op[0].a : 0;
    }) : null;
    function updateDots(p) {
      if (!chThresholds) return;
      var idx = 0;
      for (var i = 0; i < chThresholds.length; i++) { if (p >= chThresholds[i]) idx = i; }
      for (var j = 0; j < dotEls.length; j++) dotEls[j].classList.toggle('is-active', j === idx);
    }

    // Optional background scrub (scroll-story-scrub)
    var video = null, canvas = null, ctx = null, count = 0, startIdx = 1, pathTpl = '', pad = 3, imgs = null, cur = 0, started = false;
    function src(i) { return pathTpl.replace(/#+/, String(i).padStart(pad, '0')); }
    function ensureSize() { var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.offsetWidth * dpr), h = Math.round(canvas.offsetHeight * dpr); if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; } }
    function draw() { var im = imgs[cur]; if (!im || !im.complete || !im.naturalWidth) return; ensureSize(); var W = canvas.width, H = canvas.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight); ctx.clearRect(0, 0, W, H); ctx.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); }
    function startPreload() { if (started || !canvas) return; started = true; for (var i = 0; i < count; i++) { (function (i) { var im = new Image(); im.onload = function () { if (i === cur) draw(); }; im.src = src(startIdx + i); imgs[i] = im; })(i); } }
    if (scrub) {
      if ((root.getAttribute('data-source') || 'images') === 'video') { video = root.querySelector('[data-story-video], video'); if (video) video.pause(); }
      else {
        canvas = root.querySelector('[data-story-canvas], canvas');
        count = parseInt(root.getAttribute('data-count') || '0', 10); startIdx = parseInt(root.getAttribute('data-start') || '1', 10); pathTpl = root.getAttribute('data-path') || '';
        if (canvas && count && pathTpl) { ctx = canvas.getContext('2d'); pad = (pathTpl.match(/#+/) || ['###'])[0].length; imgs = new Array(count); } else canvas = null;
      }
    }
    function updateScrub(p) { if (video && video.duration) video.currentTime = p * video.duration; if (canvas) { cur = Math.round(p * (count - 1)); draw(); } }

    if (!animate) {
      els.forEach(function (x) { x.el.style.opacity = 1; x.el.style.transform = 'none'; x.el.style.filter = 'none'; });
      if (canvas) { startPreload(); cur = Math.round((count - 1) * 0.5); }
      updateDots(0);
      return;
    }

    var lastP = -1;
    function update() { var p = progress(); if (p === lastP) return; lastP = p; for (var i = 0; i < els.length; i++) applyEl(els[i].el, els[i].props, p); if (scrub) updateScrub(p); updateDots(p); }
    // Soft one-time load-in for the snapped first beat (CSS animations override
    // the inline styles update() writes, so the two don't fight). Only when the
    // story actually starts at the top — a mid-story reload follows scroll as-is.
    if (intro.length && progress() < 0.02) {
      intro.forEach(function (el, i) {
        el.style.animation = 'ds-story-intro .8s ' + (i * 90) + 'ms cubic-bezier(.16,1,.3,1) both';
        // Clear once played — a finished fill:both animation keeps overriding the
        // inline styles update() writes, which would pin the beat visible forever.
        el.addEventListener('animationend', function h() { el.removeEventListener('animationend', h); el.style.animation = ''; });
      });
    }
    update();
    // Gate the perpetual rAF loop + scroll/lenis listeners behind visibility —
    // a long page can stack many scroll-story instances (all-components.html
    // has 11+), each running requestAnimationFrame forever with a layout-forcing
    // getBoundingClientRect() per frame; without this, every instance keeps
    // ticking even miles off-screen, and the accumulated cost janks scrolling
    // by the time a reader reaches the later ones.
    var inView = true;
    if ('IntersectionObserver' in window) {
      inView = false;
      var vio = new IntersectionObserver(function (entries) { inView = entries[entries.length - 1].isIntersecting; }, { rootMargin: '50% 0px' });
      vio.observe(root);
    }
    (function loop() { if (inView) update(); requestAnimationFrame(loop); })();
    window.addEventListener('scroll', function () { if (inView) update(); }, { passive: true });
    if (window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', function () { if (inView) update(); });
    window.addEventListener('resize', function () { lastP = -1; if (canvas) ensureSize(); });
    if (scrub && canvas) {
      if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (e) { if (e.some(function (x) { return x.isIntersecting; })) { io.disconnect(); startPreload(); } }, { rootMargin: '200% 0px' }); io.observe(root); }
      else startPreload();
    }
  }

  DS.recipe('scroll-story', function (root) { story(root, false); });
  DS.recipe('scroll-story-scrub', function (root) { story(root, true); });

  /* recipe: text-reveal — scroll-linked word fill. Words wrapped in
     [data-tr-word] go from muted to full colour as the block scrolls through
     the viewport (scrubbed to scroll position, not a one-shot reveal). CSS owns
     the two colours via [data-tr-word] / .is-on, so a brand themes it for free.
     Reduced-motion / no-IntersectionObserver reveals every word at once. */
  DS.recipe('text-reveal', function (root) {
    var words = Array.prototype.slice.call(root.querySelectorAll('[data-tr-word]'));
    if (!words.length) return;
    // NB: canAnimate/vpH are locals of the FIRST IIFE and are NOT in scope here.
    // Reaching for them threw a ReferenceError that the recipe dispatcher's
    // try/catch swallowed, leaving the block bound but inert (words never filled).
    if (!(window.DS && DS.canAnimate)) { words.forEach(function (w) { w.classList.add('is-on'); }); return; }
    var raf = null;
    function paint() {
      raf = null;
      var r = root.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var start = vh * 0.82, end = vh * 0.34;
      var span = (start - end) + r.height;
      var p = span > 0 ? (start - r.top) / span : 0;
      if (p < 0) p = 0; else if (p > 1) p = 1;
      var n = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('is-on', i < n);
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(paint); }
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', onScroll);
  });

  /* recipe: scroll-track — a horizontal card track that pans as the section
     scrolls. The outer element is tall; the track translates by the scroll
     progress through it, so the row reads as a sideways scroll driven by the
     page. Re-measures on resize and after images decode. */
  DS.recipe('scroll-track', function (root) {
    var outer = root.querySelector('.cst-outer');
    var track = root.querySelector('[data-track]');
    var wrap  = root.querySelector('.cst-trackwrap');
    if(!outer || !track || !wrap) return;
    var maxX = 0;
    var clamp = function(v,a,b){ return v<a?a:(v>b?b:v); };
    function measure(){ maxX = Math.max(0, track.scrollWidth - wrap.clientWidth); }
    function frame(){
      var r = outer.getBoundingClientRect();
      var dist = r.height - window.innerHeight;
      var p = dist>0 ? clamp(-r.top/dist, 0, 1) : 0;
      // RTL lays the row out right-to-left, so the overflow — and therefore the
      // pan — runs the other way. Panning negative there drags the track further
      // off-screen instead of revealing the rest of it.
      var sign = (window.DS && DS.isRTL && DS.isRTL(track)) ? 1 : -1;
      track.style.transform = 'translate3d(' + (sign*p*maxX) + 'px,0,0)';
    }
    var ticking=false;
    function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ frame(); ticking=false; }); } }
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', function(){ measure(); frame(); });
    root.querySelectorAll('img').forEach(function(im){
      if(!im.complete) im.addEventListener('load', function(){ measure(); frame(); }, {once:true});
    });
    measure(); frame();
    setTimeout(function(){ measure(); frame(); }, 350);
  });

  /* recipe: scroll-tab — sticky visual + scroll-linked steps. Whichever step
     sits nearest the viewport middle becomes active, crossfading its paired
     image and updating the step counter. */
  DS.recipe('scroll-tab', function (root) {
    var imgs=root.querySelectorAll(".ss-img"); var num=root.querySelector("[data-ss-num]");
    var steps=root.querySelectorAll(".ss-step"); var cur=-1;
    function tick(){
      var rr=root.getBoundingClientRect();
      if(rr.bottom<0 || rr.top>window.innerHeight){ requestAnimationFrame(tick); return; }
      var mid=window.innerHeight/2, best=0, bd=Infinity;
      for(var i=0;i<steps.length;i++){ var r=steps[i].getBoundingClientRect(); var c=r.top+r.height/2; var d=Math.abs(c-mid); if(d<bd){ bd=d; best=i; } }
      if(best!==cur){ cur=best; for(var j=0;j<imgs.length;j++){ imgs[j].classList.toggle("active", j===best); } if(num) num.textContent=(best+1); }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* recipe: scroll-scatter — VideoTabs: four scattered video cards converge and
     card 1 expands full-bleed, then three fullscreen tab phases with prev/next
     chevron nav + a scroll indicator. Ported from the v1 inline implementation;
     a rAF loop drives it so it is robust under Lenis smooth-scroll, and the
     click-nav delegates to Lenis.scrollTo. */
  DS.recipe('scroll-scatter', function (root) {
    if (root.dataset.vsInit) return;
    root.dataset.vsInit = '1';

    var VW = 1366, VH = 768;
    function p(px, total){ return (px / total) * 100; }
    var isMobile = window.innerWidth < 768;
    var isTablet = window.innerWidth >= 768 && window.innerWidth < 1100;
    var POS;
    if (isMobile) {
      POS = { c1:{l:0,t:6,w:28,h:22}, c2:{l:4,t:44,w:40,h:28}, c3:{l:50,t:8,w:44,h:30}, c4:{l:53,t:54,w:36,h:26} };
    } else {
      var c1BaseW = p(128, VW), c1W = isTablet ? c1BaseW * 1.5 : c1BaseW;
      POS = { c1:{l:p(432,VW),t:p(178,VH),w:c1W,h:p(198,VH)}, c2:{l:p(118,VW),t:p(395,VH),w:p(251,VW),h:p(323,VH)}, c3:{l:p(882,VW),t:p(111,VH),w:p(464,VW),h:p(238,VH)}, c4:{l:p(820,VW),t:p(420,VH),w:p(333,VW),h:p(238,VH)} };
    }
    var CX = (100 - POS.c1.w) / 2, CY = (100 - POS.c1.h) / 2, TEXT_GAP = 1.5;
    function lerp(a,b,t){ return a + (b-a)*t; }
    function inv(v,a,b){ return Math.min(1, Math.max(0, (v-a)/(b-a))); }
    function s(id, styles){ var el = document.getElementById(id); if (el) Object.assign(el.style, styles); }
    function getProgress(c){ if(!c) return 0; var rect=c.getBoundingClientRect(); var total=c.offsetHeight-window.innerHeight; return total<=0?0:Math.max(0,Math.min(1,-rect.top/total)); }
    var indicator = document.getElementById('vt-scroll-indicator');

    function onScroll(){
      var c1El=document.getElementById('c1-container'), c2El=document.getElementById('c2-container'), c3El=document.getElementById('c3-container'), c4El=document.getElementById('c4-container');
      var v=getProgress(c1El);
      var fadeIn=inv(v,0,0.18), move=inv(v,0,0.35), sideOp=Math.max(0,fadeIn-inv(v,0.18,0.35)), c1Expand=inv(v,0.35,0.55);
      var c1L=lerp(lerp(POS.c1.l,CX,move),0,c1Expand), c1T=lerp(lerp(POS.c1.t,CY,move),0,c1Expand);
      var c1W=lerp(POS.c1.w,100,c1Expand), c1H=lerp(POS.c1.h,100,c1Expand), c1R=lerp(12,0,c1Expand);
      s('card1',{opacity:String(fadeIn),left:c1L+'%',top:c1T+'%',width:c1W+'%',height:c1H+'%',borderRadius:c1R+'px'});
      var text1Op=Math.max(0,fadeIn-inv(v,0.35,0.50));
      s('text1',{opacity:String(text1Op),left:c1L+'%',top:(c1T+c1H+TEXT_GAP)+'%'});
      s('card1-gradient',{opacity:String(inv(v,0.52,0.62))});
      var lP=inv(v,0.58,0.66); s('label1',{opacity:String(lP),transform:'translateY('+lerp(16,0,lP)+'px)'});
      var hP=inv(v,0.62,0.70); s('heading1',{opacity:String(hP),transform:'translateY('+lerp(32,0,hP)+'px)'});
      var bP=inv(v,0.65,0.74); s('bullets1',{opacity:String(bP),transform:'translateY('+lerp(20,0,bP)+'px)'});
      s('next-hint-1',{opacity:String(inv(v,0.72,0.80))});
      ['c2','c3','c4'].forEach(function(key,i){
        var pos=POS[key];
        var cL=lerp(pos.l,CX,move), cT=lerp(pos.t,CY,move), cW=lerp(pos.w,POS.c1.w,move), cH=lerp(pos.h,POS.c1.h,move);
        s('card'+(i+2),{opacity:String(sideOp),left:cL+'%',top:cT+'%',width:cW+'%',height:cH+'%',borderRadius:'12px'});
        s('text'+(i+2),{opacity:String(sideOp),left:cL+'%',top:(cT+cH+TEXT_GAP)+'%'});
      });
      var v2=getProgress(c2El);
      var l2=inv(v2,0.02,0.12); s('c2-label',{opacity:String(l2),transform:'translateY('+lerp(16,0,l2)+'px)'});
      var h2=inv(v2,0.06,0.18); s('c2-heading',{opacity:String(h2),transform:'translateY('+lerp(32,0,h2)+'px)'});
      var s2a=inv(v2,0.12,0.22); s('c2-suite1',{opacity:String(s2a),transform:'translateY('+lerp(20,0,s2a)+'px)'});
      var b2a=inv(v2,0.18,0.30); s('c2-bullets1',{opacity:String(b2a),transform:'translateY('+lerp(20,0,b2a)+'px)'});
      var s2b=inv(v2,0.26,0.36); s('c2-suite2',{opacity:String(s2b),transform:'translateY('+lerp(20,0,s2b)+'px)'});
      var b2b=inv(v2,0.32,0.44); s('c2-bullets2',{opacity:String(b2b),transform:'translateY('+lerp(20,0,b2b)+'px)'});
      s('c2-prev-hint',{opacity:String(inv(v2,0.20,0.30))}); s('c2-next-hint',{opacity:String(inv(v2,0.28,0.38))});
      var v3=getProgress(c3El);
      var l3=inv(v3,0.02,0.12); s('c3-label',{opacity:String(l3),transform:'translateY('+lerp(16,0,l3)+'px)'});
      var h3=inv(v3,0.06,0.18); s('c3-heading',{opacity:String(h3),transform:'translateY('+lerp(32,0,h3)+'px)'});
      var s3a=inv(v3,0.12,0.22); s('c3-suite1',{opacity:String(s3a),transform:'translateY('+lerp(20,0,s3a)+'px)'});
      var b3a=inv(v3,0.18,0.30); s('c3-bullets1',{opacity:String(b3a),transform:'translateY('+lerp(20,0,b3a)+'px)'});
      var s3b=inv(v3,0.26,0.36); s('c3-suite2',{opacity:String(s3b),transform:'translateY('+lerp(20,0,s3b)+'px)'});
      var b3b=inv(v3,0.32,0.44); s('c3-bullets2',{opacity:String(b3b),transform:'translateY('+lerp(20,0,b3b)+'px)'});
      s('c3-prev-hint',{opacity:String(inv(v3,0.20,0.30))}); s('c3-next-hint',{opacity:String(inv(v3,0.28,0.38))});
      var v4=getProgress(c4El);
      var l4=inv(v4,0.02,0.12); s('c4-label',{opacity:String(l4),transform:'translateY('+lerp(16,0,l4)+'px)'});
      var h4=inv(v4,0.06,0.18); s('c4-heading',{opacity:String(h4),transform:'translateY('+lerp(32,0,h4)+'px)'});
      var s4a=inv(v4,0.12,0.22); s('c4-suite1',{opacity:String(s4a),transform:'translateY('+lerp(20,0,s4a)+'px)'});
      var b4a=inv(v4,0.18,0.30); s('c4-bullets1',{opacity:String(b4a),transform:'translateY('+lerp(20,0,b4a)+'px)'});
      var s4b=inv(v4,0.26,0.36); s('c4-suite2',{opacity:String(s4b),transform:'translateY('+lerp(20,0,s4b)+'px)'});
      var b4b=inv(v4,0.32,0.44); s('c4-bullets2',{opacity:String(b4b),transform:'translateY('+lerp(20,0,b4b)+'px)'});
      s('c4-prev-hint',{opacity:String(inv(v4,0.20,0.30))});
      if (indicator) indicator.style.opacity = v > 0.08 ? '0' : String(1 - v/0.08);
    }

    function initCards(){
      var place=function(id,pos){ s(id,{opacity:'0',left:pos.l+'%',top:pos.t+'%',width:pos.w+'%',height:pos.h+'%',borderRadius:'12px'}); };
      place('card1',POS.c1); place('card2',POS.c2); place('card3',POS.c3); place('card4',POS.c4);
      var placeText=function(id,pos){ s(id,{opacity:'0',left:pos.l+'%',top:(pos.t+pos.h+TEXT_GAP)+'%'}); };
      placeText('text1',POS.c1); placeText('text2',POS.c2); placeText('text3',POS.c3); placeText('text4',POS.c4);
    }

    function easeInOutQuart(t){ return t<0.5 ? 8*t*t*t*t : 1-Math.pow(-2*t+2,4)/2; }
    var _raf=null;
    function scrollToCard(containerId, prog){
      var el=document.getElementById(containerId); if(!el) return;
      var scrollable=el.offsetHeight-window.innerHeight;
      var elTop=el.getBoundingClientRect().top + (window.DS&&DS.lenis ? DS.lenis.scroll : window.scrollY);
      var target=elTop+Math.max(0,scrollable*prog);
      var start=window.scrollY, dist=target-start;
      if (Math.abs(dist)<2) return;
      var lenis=(window.DS&&DS.lenis&&typeof DS.lenis.scrollTo==='function')?DS.lenis:null;
      if (lenis){ lenis.scrollTo(target,{duration:Math.min(1.4,Math.max(0.7,Math.abs(dist)*0.0006)),easing:easeInOutQuart,lock:true,force:true}); return; }
      if(_raf) cancelAnimationFrame(_raf);
      var startTime=null, dur=Math.min(1400,Math.max(700,Math.abs(dist)*0.6));
      function step(ts){ if(!startTime) startTime=ts; var t=Math.min((ts-startTime)/dur,1); window.scrollTo(0,start+dist*easeInOutQuart(t)); if(t<1){_raf=requestAnimationFrame(step);}else{_raf=null;} }
      _raf=requestAnimationFrame(step);
    }
    function wireHint(id, targetId, prog){
      var el=document.getElementById(id); if(!el) return;
      var inner=el.querySelector('.hint-inner');
      el.addEventListener('click', function(){
        if(inner){ inner.classList.remove('tapped'); void inner.offsetWidth; inner.classList.add('tapped'); inner.addEventListener('animationend', function(){ inner.classList.remove('tapped'); }, {once:true}); }
        scrollToCard(targetId, prog);
      });
    }
    wireHint('next-hint-1','c2-container',0.50);
    wireHint('c2-next-hint','c3-container',0.50);
    wireHint('c3-next-hint','c4-container',0.50);
    wireHint('c2-prev-hint','c1-container',0.85);
    wireHint('c3-prev-hint','c2-container',0.50);
    wireHint('c4-prev-hint','c3-container',0.50);

    initCards();
    (function loop(){ onScroll(); requestAnimationFrame(loop); })();
  });

  /* hp-map-story: on narrow (mobile) viewports, recentre the dotted world map
     on Dubai (viewBox x530) so its arcs stay in frame; full spread on tablet+desktop. */
  (function () {
    function fitMap() {
      var maps = document.querySelectorAll('.hp-map-story .map-svg');
      var vb = window.innerWidth < 768 ? '130 0 800 400' : '0 0 800 400';
      for (var i = 0; i < maps.length; i++) maps[i].setAttribute('viewBox', vb);
    }
    fitMap();
    window.addEventListener('resize', fitMap, { passive: true });
  })();

  /* recipe: process-cards — the cards start scattered (fanned out with a
     rotation) and assemble into their grid the first time the section enters
     the viewport. Desktop only; reduced-motion/no-IO assembles immediately. */
  DS.recipe('process-cards', function (root) {
    var cards=[].slice.call(root.querySelectorAll('.p-card'));
    var lg=window.matchMedia('(min-width:1024px)').matches;
    var scatter=['translateX(70%) translateY(14px) rotate(-13deg)','translateX(24%) translateY(5px) rotate(-5deg)','translateX(-24%) translateY(5px) rotate(5deg)','translateX(-70%) translateY(14px) rotate(13deg)'];
    root.classList.add('ps-armed');
    if(lg){cards.forEach(function(c,i){c.style.transition='none';c.style.transform=scatter[i]||'';c.style.zIndex=10+i;});void root.offsetWidth;}
    function assemble(){root.classList.add('ps-in');requestAnimationFrame(function(){cards.forEach(function(c){c.style.transition='';c.style.transform='';});});}
    try{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){assemble();io.disconnect();}});},{threshold:.2});io.observe(root);}catch(e){assemble();}
  });

  /* recipe: hex-reach-map — builds the reach map's live layer over the supplied
     hex-grid artwork: hexagonal ripple rings, leader lines and flag chips are
     drawn per market from the MARKERS table below. Colours come from CSS
     classes (never set here) so a brand themes the map for free. */
  DS.recipe('hex-reach-map', function (root) {
    root.setAttribute('data-hx-ready','');

    var VB={x:0, y:250, w:1360, h:710};
    var OFF=52;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    var MARKERS=[
    {id:'uk', name:'UK',        flag:'gb', x:152.5,  y:353.2, place:'left'},
    {id:'de', name:'Germany',   flag:'de', x:268.2,  y:353.2, place:'right'},
    {id:'ru', name:'Russia',    flag:'ru', x:480.3,  y:321.8, place:'right'},
    {id:'at', name:'Austria',   flag:'at', x:316.4,  y:421.2, place:'right'},
    {id:'tr', name:'Turkey',    flag:'tr', x:470.7,  y:525.7, place:'right'},
    {id:'eg', name:'Egypt',     flag:'eg', x:441.8,  y:635.5, place:'left'},
    {id:'ksa',name:'KSA',       flag:'sa', x:567.1,  y:682.5, place:'bottom'},
    {id:'ae', name:'UAE',       flag:'ae', x:655.8,  y:670.0, place:'right'},
    {id:'in', name:'India',     flag:'in', x:866.0,  y:729.6, place:'right'},
    {id:'cn', name:'China',     flag:'cn', x:1242.1, y:494.3, place:'left'},
    {id:'sg', name:'Singapore', flag:'sg', x:1180.9, y:844.3, place:'left'},
    {id:'id', name:'Indonesia', flag:'id', x:1167.0, y:909.6, place:'left'}
    ];

    function anchor(m){
    if(m.place==='left')   return {x:m.x-OFF, y:m.y};
    if(m.place==='bottom') return {x:m.x,      y:m.y+OFF};
    return {x:m.x+OFF, y:m.y};
    }
    MARKERS.forEach(function(m){ m.a=anchor(m); });

    var NS='http://www.w3.org/2000/svg';
    var ripG=root.querySelector('[data-hx-ripples]');
    var leadersG=root.querySelector('[data-hx-leaders]');
    var chipsG=root.querySelector('[data-hx-chips]');

    // hexagon ripple rings (2 per market, staggered) — pointy-top to match the grid
    function hexPts(cx,cy,R){var o='';for(var i=0;i<6;i++){var a=Math.PI/180*(60*i-90);o+=(cx+R*Math.cos(a)).toFixed(1)+','+(cy+R*Math.sin(a)).toFixed(1)+' ';}return o.trim();}
    if(!reduce){
    MARKERS.forEach(function(m,idx){
      for(var k=0;k<2;k++){
        var c=document.createElementNS(NS,'polygon');
        c.setAttribute('class','hx-ripple'); c.setAttribute('points',hexPts(m.x,m.y,34));
        c.style.animationDelay=(idx*0.12 + k*1.7)+'s';
        ripG.appendChild(c);
      }
    });
    }

    // leader lines (cluster -> label)
    MARKERS.forEach(function(m){
    var ln=document.createElementNS(NS,'line');
    ln.setAttribute('class','hx-leader'); ln.setAttribute('data-id',m.id);
    ln.setAttribute('x1',m.x); ln.setAttribute('y1',m.y); ln.setAttribute('x2',m.a.x); ln.setAttribute('y2',m.a.y);
    leadersG.appendChild(ln);
    });

    // glass flag chips
    MARKERS.forEach(function(m,idx){
    var b=document.createElement('button');
    b.type='button';
    b.className='hx-chip'+(m.place==='left'?' p-left':(m.place==='bottom'?' p-bottom':''));
    b.setAttribute('data-id',m.id);
    b.style.left=((m.a.x - VB.x)/VB.w*100)+'%';
    b.style.top=((m.a.y - VB.y)/VB.h*100)+'%';
    b.style.transitionDelay=(0.5+idx*0.05)+'s';
    b.innerHTML='<img class="hx-flag" src="assets/images/shared/flags/'+m.flag+'.svg" alt="" loading="lazy">'
               +'<span class="hx-name">'+m.name+'</span>';
    chipsG.appendChild(b);
    });

    function setFocus(id,on){
    root.classList.toggle('hx-focus',on);
    root.querySelectorAll('.hx-chip').forEach(function(c){ c.classList.toggle('is-active', on && c.getAttribute('data-id')===id); });
    root.querySelectorAll('.hx-leader').forEach(function(l){ l.classList.toggle('is-lit', on && l.getAttribute('data-id')===id); });
    }
    chipsG.addEventListener('mouseover',function(e){ var c=e.target.closest('.hx-chip'); if(c) setFocus(c.getAttribute('data-id'),true); });
    chipsG.addEventListener('mouseout', function(e){ var c=e.target.closest('.hx-chip'); if(c) setFocus(null,false); });
    chipsG.addEventListener('focusin', function(e){ var c=e.target.closest('.hx-chip'); if(c) setFocus(c.getAttribute('data-id'),true); });
    chipsG.addEventListener('focusout',function(e){ var c=e.target.closest('.hx-chip'); if(c) setFocus(null,false); });

    var shown=false;
    function reveal(){ if(shown) return; shown=true; root.classList.add('is-in'); }
    if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ reveal(); io.disconnect(); } }); },{threshold:.15});
    io.observe(root);
    } else { reveal(); }
  });

  /* recipe: site-header — the utility (segment) bar scrolls away in normal flow;
     the brand row is fixed and slides up from below the utility bar to top:0 as
     you scroll, then stays pinned. It is transparent over a dark hero and gains
     .is-solid (white bar) past a small threshold. data-solid forces solid. */
  DS.recipe('site-header', function (root) {
    var brand = root.querySelector('.ish-brand');
    var util = root.querySelector('.ish-utility');
    var forceSolid = root.hasAttribute('data-solid');
    var threshold = parseFloat(root.getAttribute('data-solid-after')) || 8;
    var lastY = -1;
    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y === lastY) return; lastY = y;
      var uh = util ? util.offsetHeight : 0;
      if (brand) brand.style.top = Math.max(0, uh - y) + 'px';   // dock under utility, then pin at 0
      root.classList.toggle('is-solid', forceSolid || y > threshold);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    // Desktop again → drop the drawer. The threshold is NOT repeated here: the
    // CSS nav-breakpoint zone hides .ish-burger on desktop, so "burger hidden"
    // IS the desktop test — retune the breakpoint in ds.css and this follows.
    window.addEventListener('resize', function () { lastY = -1; update(); if (burger && getComputedStyle(burger).display === 'none') closeDrawer(); });
    if (window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', update);

    // Dropdowns — mega-menus (hover + click), the Login menu and the search
    // panel (click). All mutually exclusive; close on Escape or outside click.
    var megas = Array.prototype.slice.call(root.querySelectorAll('[data-mega]'));
    var dropdowns = Array.prototype.slice.call(root.querySelectorAll('[data-dropdown]')); // Login, More
    var searchWrap = root.querySelector('[data-search]');

    function setExpanded(wrap, sel, v) { if (!wrap) return; var b = wrap.querySelector(sel); if (b) b.setAttribute('aria-expanded', v ? 'true' : 'false'); }
    function caret(trigger, panel) { if (trigger && panel) { var r = trigger.getBoundingClientRect(); panel.style.setProperty('--caret-x', (r.left + r.width / 2) + 'px'); } }
    function syncSolid() {
      var menuish = megas.some(function (m) { return m.classList.contains('is-open'); }) || (searchWrap && searchWrap.classList.contains('is-open'));
      root.classList.toggle('is-menu-open', !!menuish);
    }
    function closeMegas() { megas.forEach(function (m) { m.classList.remove('is-open'); setExpanded(m, '.ish-menu-trigger', false); }); }
    function closeDropdowns() { dropdowns.forEach(function (d) { d.classList.remove('is-open'); var b = d.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); }); }
    function closeSearch() { if (searchWrap) { searchWrap.classList.remove('is-open'); setExpanded(searchWrap, '.ish-search', false); } }
    function closeAll() { closeMegas(); closeDropdowns(); closeSearch(); closeDrawer(); syncSolid(); }

    function openMega(m) {
      closeDropdowns(); closeSearch(); closeMegas(); m.classList.add('is-open');
      setExpanded(m, '.ish-menu-trigger', true);
      caret(m.querySelector('.ish-menu-trigger'), m.querySelector('.ish-panel'));
      syncSolid();
    }
    megas.forEach(function (m) {
      m.addEventListener('mouseenter', function () { openMega(m); });
      var btn = m.querySelector('.ish-menu-trigger');
      if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); if (m.classList.contains('is-open')) closeAll(); else openMega(m); });
    });
    // megas are hover-driven: close them when the pointer leaves the brand row
    // (but leave click-driven search/login alone)
    if (brand) brand.addEventListener('mouseleave', function () { closeMegas(); syncSolid(); });

    dropdowns.forEach(function (d) {
      var btn = d.querySelector('button');
      if (btn) btn.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !d.classList.contains('is-open');
        closeAll(); if (willOpen) { d.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
    if (searchWrap) {
      var searchBtn = searchWrap.querySelector('.ish-search');
      var input = searchWrap.querySelector('.ish-search-input');
      if (searchBtn) searchBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !searchWrap.classList.contains('is-open');
        closeAll();
        if (willOpen) {
          searchWrap.classList.add('is-open'); setExpanded(searchWrap, '.ish-search', true);
          caret(searchBtn, searchWrap.querySelector('.ish-search-panel'));
          syncSolid();
          if (input) setTimeout(function () { try { input.focus(); } catch (e) {} }, 60);
        }
      });

      // Autosuggest — type-ahead over this header's OWN nav links (mega panels,
      // utility rows, websites list, Popular chips), so the pool always mirrors
      // the real nav with no extra content contract. The list is injected here
      // (like the drawer fill) so every existing page copy gets it. Suggestions
      // appear from 3 typed characters; ↑/↓ + Enter navigate, click follows the
      // link, and the existing Escape/outside-click close the whole sheet.
      var sform = searchWrap.querySelector('.ish-search-form');
      if (input && sform && !searchWrap.querySelector('.ish-suggest')) {
        var sug = document.createElement('div');
        sug.className = 'ish-suggest'; sug.setAttribute('role', 'listbox'); sug.hidden = true;
        sform.parentNode.insertBefore(sug, sform.nextSibling);
        input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false');
        var sugPool = null, sugItems = [], sugActive = -1;
        var escHtml = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
        var harvest = function () {
          sugPool = []; var seen = {};
          Array.prototype.forEach.call(root.querySelectorAll('a[href]'), function (a) {
            if (a.closest('.ish-suggest')) return;
            var label = (a.textContent || '').trim().replace(/\s+/g, ' ');
            if (!label || label.length > 60) return;
            var key = label.toLowerCase();
            if (seen[key]) return; seen[key] = 1;
            // Segment tag = the source group's own heading (mega/websites column
            // .ish-col-h, or the Popular row label) — DOM-derived so the AR
            // preview shows it translated. Links without a headed group get none.
            var src = '';
            var grp = a.closest('.ish-col'), grpH = grp && grp.querySelector('.ish-col-h');
            if (grpH) src = grpH.textContent;
            else { var pop = a.closest('.ish-search-pop'), popL = pop && pop.querySelector('.ish-search-pop-lbl'); if (popL) src = popL.textContent; }
            src = (src || '').trim().replace(/\s+/g, ' ').slice(0, 32);
            sugPool.push({ label: label, lower: key, href: a.getAttribute('href') || '#', src: src });
          });
        };
        var sugHide = function () { sug.hidden = true; sug.innerHTML = ''; sugItems = []; sugActive = -1; input.setAttribute('aria-expanded', 'false'); };
        var sugShow = function (q) {
          if (!sugPool) harvest();
          var needle = q.toLowerCase();
          var hits = sugPool.filter(function (o) { return o.lower.indexOf(needle) !== -1; }).slice(0, 7);
          if (!hits.length) { sugHide(); return; }
          sug.innerHTML = hits.map(function (o) {
            var i = o.lower.indexOf(needle);
            return '<a role="option" aria-selected="false" href="' + escHtml(o.href) + '">' +
              '<span class="ish-sug-t">' + escHtml(o.label.slice(0, i)) + '<b>' + escHtml(o.label.slice(i, i + q.length)) + '</b>' + escHtml(o.label.slice(i + q.length)) + '</span>' +
              (o.src ? '<span class="ish-sug-src">' + escHtml(o.src) + '</span>' : '') +
            '</a>';
          }).join('');
          sugItems = Array.prototype.slice.call(sug.children); sugActive = -1;
          sug.hidden = false; input.setAttribute('aria-expanded', 'true');
        };
        input.addEventListener('input', function () {
          var q = input.value.trim();
          if (q.length >= 3) sugShow(q); else sugHide();
        });
        input.addEventListener('keydown', function (e) {
          if (sug.hidden || !sugItems.length) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            sugActive = (sugActive + (e.key === 'ArrowDown' ? 1 : -1) + sugItems.length) % sugItems.length;
            sugItems.forEach(function (el, i) { el.classList.toggle('is-active', i === sugActive); el.setAttribute('aria-selected', i === sugActive ? 'true' : 'false'); });
          } else if (e.key === 'Enter') {
            var pick = sugItems[sugActive] || sugItems[0];
            if (pick) { e.preventDefault(); pick.click(); }
          }
        });
        // Fresh sheet on every toggle; re-harvest per open so late DOM changes
        // (drawer fill, AR translation) are reflected.
        if (searchBtn) searchBtn.addEventListener('click', function () { sugHide(); sugPool = null; });

        // Recent searches — a chips row injected between the suggestions and
        // Popular. Persisted in localStorage (shared across header copies),
        // newest first, deduped, capped at 6. Carries the .ish-search-pop
        // classes so the Popular styling + phone layout apply for free, and
        // the existing sibling rule hides it while suggestions are showing.
        var RECENT_KEY = 'ds-ish-recent-searches';
        function readRecent() { try { var v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
        var recentBox = document.createElement('div');
        recentBox.className = 'ish-search-pop ish-search-recent';
        recentBox.hidden = true;
        var popRow = sform.parentNode.querySelector('.ish-search-pop:not(.ish-search-recent)');
        if (popRow) popRow.parentNode.insertBefore(recentBox, popRow); else sform.parentNode.appendChild(recentBox);
        function renderRecent() {
          var list = readRecent();
          if (!list.length) { recentBox.hidden = true; recentBox.innerHTML = ''; return; }
          recentBox.innerHTML = '<span class="ish-search-pop-lbl">Recent</span>'
            + list.map(function (q) { return '<a href="#">' + escHtml(q) + '</a>'; }).join('')
            + '<button type="button" class="ish-search-recent-clear">Clear</button>';
          recentBox.hidden = false;
        }
        function saveRecent(q) {
          q = (q || '').trim(); if (q.length < 2) return;
          var list = readRecent().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
          list.unshift(q);
          try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))); } catch (e) {}
          renderRecent();
        }
        // Record real search actions: a suggestion pick…
        sug.addEventListener('click', function (e) {
          var a = e.target.closest('a'); if (!a) return;
          var t = a.querySelector('.ish-sug-t');
          saveRecent(t ? t.textContent : a.textContent);
        });
        // …a Popular/Recent chip tap (Clear handled first), …
        sform.parentNode.addEventListener('click', function (e) {
          if (e.target.closest('.ish-search-recent-clear')) {
            e.preventDefault();
            try { localStorage.removeItem(RECENT_KEY); } catch (err) {}
            renderRecent(); return;
          }
          var chip = e.target.closest('.ish-search-pop a');
          if (chip) saveRecent(chip.textContent);
        });
        // …or Enter on a typed query (when no suggestion is active).
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && (sug.hidden || !sugItems.length)) saveRecent(input.value);
        });
        if (searchBtn) searchBtn.addEventListener('click', renderRecent);
        renderRecent();
      }
    }

    // Mobile drawer — at the nav breakpoint (ds.css zone; currently ≤1399px)
    // the primary .ish-menu is hidden (CSS) and the
    // search trigger's panel is hidden, leaving the nav unreachable. The block
    // ships a hamburger (.ish-burger[data-burger]) and an empty drawer shell
    // (.ish-drawer[data-drawer]); we fill the shell from this page's own
    // mega-menus + search so it always mirrors the real nav, then wire toggling.
    // Older page copies may predate the markup — inject it so the fix still
    // reaches them (ds.js is loaded site-wide).
    var burger = root.querySelector('[data-burger]');
    var drawer = root.querySelector('[data-drawer]');
    var brandBar = brand && brand.querySelector('.ish-bar');
    if (!burger && brandBar) {
      burger = document.createElement('button');
      burger.className = 'ish-burger'; burger.type = 'button';
      burger.setAttribute('data-burger', ''); burger.setAttribute('aria-haspopup', 'true');
      burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-controls', 'ish-drawer');
      burger.setAttribute('aria-label', 'Open menu');
      burger.innerHTML = '<span class="ish-burger-bars" aria-hidden="true"><span></span><span></span><span></span></span>';
      brandBar.appendChild(burger);
    }
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'ish-drawer'; drawer.id = 'ish-drawer'; drawer.setAttribute('data-drawer', '');
      drawer.innerHTML = '<div class="ish-drawer-backdrop" data-drawer-close></div>'
        + '<div class="ish-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">'
        + '<div class="ish-drawer-head"><span class="ish-drawer-logo" aria-hidden="true"></span>'
        + '<button class="ish-drawer-close" type="button" data-drawer-close aria-label="Close menu">'
        + '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        + '</button></div><div class="ish-drawer-body"></div></div>';
      root.appendChild(drawer);
    }

    // Everything except search + language (which stay in the bar) lives in the
    // drawer on mobile: segments, the mega-menus, other websites, support/contact,
    // and login. The utility row itself is hidden on mobile (CSS).
    var drawerCloseSub = null;   // set by buildDrawer; closeDrawer resets the child panel
    function buildDrawer() {
      var body = drawer && drawer.querySelector('.ish-drawer-body');
      if (!body) return;
      // Two sliding views: the ROOT (segments + accordion sections) and a CHILD
      // panel. Accordion groups that have headed sub-groups (.ish-col with an
      // .ish-col-h) render those as drill-down rows — tapping slides the child
      // panel in with that group's links; Back slides the root back.
      body.innerHTML = '<div class="ish-drawer-track">'
        + '<div class="ish-drawer-view ish-drawer-view-root"></div>'
        + '<div class="ish-drawer-view ish-drawer-view-sub">'
        +   '<button class="ish-drawer-back" type="button"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg><span>Back</span></button>'
        +   '<div class="ish-drawer-sub-links"></div>'
        + '</div></div>';
      var viewRoot = body.querySelector('.ish-drawer-view-root');
      var subLinks = body.querySelector('.ish-drawer-sub-links');
      var backBtn = body.querySelector('.ish-drawer-back');
      var panelEl = body.parentElement, lastGroupBtn = null;
      function openSub(label, node, fromBtn) {
        // No panel title — the cloned content's own .ish-col-h group headings
        // provide the context; the label feeds assistive tech only.
        subLinks.setAttribute('aria-label', label);
        subLinks.innerHTML = ''; subLinks.appendChild(node);
        panelEl.classList.add('is-sub'); lastGroupBtn = fromBtn;
        try { backBtn.focus({ preventScroll: true }); } catch (e) {}
      }
      drawerCloseSub = function () {
        panelEl.classList.remove('is-sub');
        if (lastGroupBtn) { try { lastGroupBtn.focus({ preventScroll: true }); } catch (e) {} lastGroupBtn = null; }
      };
      backBtn.addEventListener('click', drawerCloseSub);
      // Smooth accordions + one-open-at-a-time. Native <details> toggling is an
      // instant snap, so each section's content is wrapped in a .ish-drawer-secbody
      // whose height animates (CSS transition); the summary click drives
      // open/close and collapses the previously open section in the same beat.
      var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
      function secBody(det) { return det.querySelector(':scope > .ish-drawer-secbody'); }
      function expandSec(det) {
        var b = secBody(det);
        det.open = true;
        if (!b || REDUCED) return;
        var h = b.scrollHeight;
        b.style.height = '0px'; b.getBoundingClientRect();
        b.style.height = h + 'px';
        var done = function () { b.style.height = ''; b.removeEventListener('transitionend', done); };
        b.addEventListener('transitionend', done); setTimeout(done, 420);
      }
      function collapseSec(det) {
        var b = secBody(det);
        if (!b || REDUCED) { det.open = false; return; }
        b.style.height = b.scrollHeight + 'px'; b.getBoundingClientRect();
        b.style.height = '0px';
        var done = function () { det.open = false; b.style.height = ''; b.removeEventListener('transitionend', done); };
        b.addEventListener('transitionend', done); setTimeout(done, 420);
      }
      function wireAccordions() {
        Array.prototype.forEach.call(viewRoot.querySelectorAll('details'), function (det) {
          var sum = det.querySelector(':scope > summary');
          if (!sum || secBody(det)) return;
          var b = document.createElement('div'); b.className = 'ish-drawer-secbody';
          while (sum.nextSibling) b.appendChild(sum.nextSibling);
          det.appendChild(b);
          sum.addEventListener('click', function (e) {
            e.preventDefault();
            if (det.open) { collapseSec(det); return; }
            Array.prototype.forEach.call(viewRoot.querySelectorAll('details[open]'), function (o) { if (o !== det) collapseSec(o); });
            expandSec(det);
          });
        });
      }
      // The slide is transform-driven; the body must never actually scroll
      // sideways. Focus()/tabbing can creep scrollLeft on the overflow-hidden
      // body (browsers scroll-to-reveal) — pin it back.
      body.addEventListener('scroll', function () { if (body.scrollLeft) body.scrollLeft = 0; }, { passive: true });
      var CARET = '<svg class="ish-drawer-caret" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      function section(label, contentNode, parent) {
        if (!contentNode) return;
        var det = document.createElement('details');
        det.className = 'ish-drawer-sec';
        var sum = document.createElement('summary');
        sum.textContent = label;
        sum.insertAdjacentHTML('beforeend', CARET);
        det.appendChild(sum);
        contentNode.classList.remove('ish-panel-inner', 'ish-more-panel', 'ish-dropdown', 'container-ds');
        // Headed sub-groups become child-panel rows; unheaded leftovers stay flat.
        var headed = Array.prototype.filter.call(contentNode.querySelectorAll('.ish-col'), function (c) {
          return c.querySelector('.ish-col-h') && c.querySelector('a');
        });
        if (headed.length) {
          var wrap = document.createElement('div'); wrap.className = 'ish-drawer-groups';
          headed.forEach(function (c) {
            var gLabel = c.querySelector('.ish-col-h').textContent.replace(/\s+/g, ' ').trim();
            var row = document.createElement('button');
            row.type = 'button'; row.className = 'ish-drawer-group';
            var t = document.createElement('span'); t.textContent = gLabel;
            row.appendChild(t); row.insertAdjacentHTML('beforeend', CARET);
            row.addEventListener('click', function () {
              openSub(gLabel, c.cloneNode(true), row);   // keep .ish-col-h — it titles the panel
            });
            wrap.appendChild(row);
            c.remove();
          });
          det.appendChild(wrap);
          if (contentNode.querySelector('a')) { contentNode.classList.add('ish-drawer-cols'); det.appendChild(contentNode); }
        } else {
          contentNode.classList.add('ish-drawer-cols');
          det.appendChild(contentNode);
        }
        (parent || viewRoot).appendChild(det);
      }
      // 1. Customer segments.
      //    v4: segments ARE the drawer's main navigation — each segment is an
      //    accordion whose subnav rows drill into the child panel (Back
      //    returns). Until segments carry their own nav in markup, every
      //    segment shows the site's nav groups (mega columns, deduped by
      //    heading). The mega/Login root sections are dropped for v4.
      //    v1/v2: a full-bleed dropdown row showing the current selection.
      var segs = root.querySelector('.ish-segments');
      var isV4 = root.classList.contains('ish-v4');
      if (segs && isV4) {
        // Subnav rows = the TOP menu categories (one per mega); drilling opens
        // the child panel with that category's headed link groups intact.
        var cats = [];
        megas.forEach(function (m) {
          var trig = m.querySelector('.ish-menu-trigger'); var inner = m.querySelector('.ish-panel-inner');
          if (!trig || !inner || !inner.querySelector('a')) return;
          cats.push({ label: trig.textContent.replace(/\s+/g, ' ').trim(), inner: inner });
        });
        Array.prototype.forEach.call(segs.querySelectorAll('a'), function (a) {
          var det = document.createElement('details');
          det.className = 'ish-drawer-sec' + (a.classList.contains('is-active') ? ' ish-drawer-sec-active' : '');
          var sum = document.createElement('summary');
          sum.textContent = a.textContent.replace(/\s+/g, ' ').trim();
          sum.insertAdjacentHTML('beforeend', CARET);
          det.appendChild(sum);
          var wrap = document.createElement('div'); wrap.className = 'ish-drawer-groups';
          cats.forEach(function (g) {
            var row = document.createElement('button');
            row.type = 'button'; row.className = 'ish-drawer-group';
            var t = document.createElement('span'); t.textContent = g.label;
            row.appendChild(t); row.insertAdjacentHTML('beforeend', CARET);
            row.addEventListener('click', function () {
              var clone = g.inner.cloneNode(true);
              clone.classList.remove('ish-panel-inner', 'container-ds');
              openSub(g.label, clone, row);
            });
            wrap.appendChild(row);
          });
          det.appendChild(wrap);
          viewRoot.appendChild(det);
        });
      } else if (segs) {
        var active = segs.querySelector('.is-active');
        var det = document.createElement('details');
        det.className = 'ish-drawer-seg';
        det.innerHTML = '<summary class="ish-drawer-seg-trigger"><span class="ish-drawer-seg-now">' + (active ? active.textContent.replace(/\s+/g, ' ').trim() : 'Select') + '</span>' + CARET + '</summary><div class="ish-drawer-seg-list">' + segs.innerHTML + '</div>';
        viewRoot.appendChild(det);
      }
      // 2. Mega-menus — one collapsible section each. (v4: skipped — the
      //    segment accordions above carry the nav; Login is skipped too.)
      if (!isV4) megas.forEach(function (m) {
        var trig = m.querySelector('.ish-menu-trigger'); var inner = m.querySelector('.ish-panel-inner');
        if (inner) section(trig ? trig.textContent.replace(/\s+/g, ' ').trim() : '', inner.cloneNode(true));
      });
      // 3. Other websites + Login — stay in the scrollable nav group (Login kept as our dropdown).
      //    v4 keeps the websites section too (an accordion after the segment
      //    accordions, matching the bar's "Our Websites" label); only Login is
      //    dropped there (it lives in the drawer head as a chip instead).
      var more = root.querySelector('.ish-more-panel'); if (more) section(isV4 ? 'Our Websites' : 'Our other websites', more.cloneNode(true));
      var login = root.querySelector('.ish-login-wrap .ish-dropdown'); if (login && !isV4) section('Login', login.cloneNode(true));
      // 4. Persistent quick-action ICON BAR pinned to the bottom (the "other links" area).
      var ICONS = {
        'branches & atms': '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        'support centre': '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3.2"></circle><path d="m5.6 5.6 3.6 3.6m5.6 5.6 3.6 3.6m0-12.8-3.6 3.6m-5.6 5.6-3.6 3.6"></path></svg>',
        'contact us': '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L3 21l1.9-5.8A8.5 8.5 0 1 1 21 11.5z"></path></svg>'
      };
      var GENERIC = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"></circle></svg>';
      var utilLinks = root.querySelectorAll('.ish-util-link');
      if (utilLinks.length) {
        var foot = document.createElement('div'); foot.className = 'ish-drawer-foot';
        var bar = document.createElement('div'); bar.className = 'ish-drawer-iconbar';
        utilLinks.forEach(function (a) {
          // Icon source, in preference order: an AUTHORED template in the link
          // (<span class="ish-util-icon" hidden> holding an svg / img / icon-font
          // element — swap the icon by editing the block markup), then the
          // legacy label-keyed map, then the generic circle.
          var iconTpl = a.querySelector('.ish-util-icon');
          var label = '';
          Array.prototype.forEach.call(a.childNodes, function (n) {
            if (n.nodeType === 3) label += n.textContent;
            else if (n.nodeType === 1 && !(n.classList && n.classList.contains('ish-util-icon'))) label += n.textContent;
          });
          label = label.replace(/\s+/g, ' ').trim();
          var item = document.createElement('a');
          item.href = a.getAttribute('href') || '#'; item.className = 'ish-drawer-icon';
          if (iconTpl) {
            var ic = iconTpl.cloneNode(true);
            ic.removeAttribute('hidden');
            item.appendChild(ic);
          } else {
            item.insertAdjacentHTML('beforeend', ICONS[label.toLowerCase()] || GENERIC);
          }
          var lbl = document.createElement('span'); lbl.textContent = label;
          item.appendChild(lbl);
          bar.appendChild(item);
        });
        foot.appendChild(bar);
        var panel = body.parentElement;   // footer is a sibling of the scrolling body so it stays pinned
        var oldFoot = panel.querySelector('.ish-drawer-foot'); if (oldFoot) oldFoot.remove();
        panel.appendChild(foot);
      }
      // Animate all accordions; v4 opens the active segment by default.
      wireAccordions();
      if (isV4) {
        var act0 = viewRoot.querySelector('details.ish-drawer-sec-active') || viewRoot.querySelector('details.ish-drawer-sec');
        if (act0) act0.open = true;
        // Phone (≤639): the bar hides the Login pill — a sleek Login chip in
        // the drawer HEAD (before the ✕) opens the portals in the child panel.
        var loginDrop = root.querySelector('.ish-login-wrap .ish-dropdown');
        var headEl = panelEl.querySelector('.ish-drawer-head');
        if (loginDrop && headEl && !headEl.querySelector('.ish-drawer-login-btn')) {
          var lbtn = document.createElement('button');
          lbtn.type = 'button'; lbtn.className = 'ish-drawer-login-btn';
          lbtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path></svg><span>Login</span>';
          lbtn.addEventListener('click', function () {
            var clone = loginDrop.cloneNode(true);
            clone.classList.remove('ish-dropdown');   // shed the floating-card styling
            openSub('Login', clone, lbtn);
          });
          headEl.insertBefore(lbtn, headEl.querySelector('.ish-drawer-close'));
        }
      }
    }
    buildDrawer();

    function openDrawer() {
      closeMegas(); closeDropdowns(); closeSearch();
      root.classList.add('is-nav-open');
      if (burger) burger.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('ish-nav-lock');
    }
    function closeDrawer() {
      root.classList.remove('is-nav-open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('ish-nav-lock');
      if (drawerCloseSub) drawerCloseSub();   // reopen at the root view
    }
    if (burger) burger.addEventListener('click', function (e) {
      e.preventDefault();
      if (root.classList.contains('is-nav-open')) closeDrawer(); else openDrawer();
    });
    if (drawer) drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-drawer-close]') || e.target.closest('a')) closeDrawer();
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    document.addEventListener('click', function (e) {
      if (!(e.target.closest && e.target.closest('[data-mega],[data-dropdown],[data-search],[data-burger],[data-drawer]'))) closeAll();
    });
  });
})();

/* ═══ V7 IMPORT — RECOVERED RECIPES ═════════════════════════════════════════
   Three components arrived in the v7 import with their markup but without the
   inline scripts that drove them, so they shipped inert. Ported here as real
   recipes, addressed by data-behavior and using only the public DS surface
   (DS.canAnimate, window.innerHeight) — a ported recipe that reaches for
   another IIFE's locals throws a ReferenceError the dispatcher swallows. */

/* recipe: editorial-story-video — plays the .es-bgvid background video only
   while the section is on screen. Reduced-motion users keep the poster frame. */
DS.recipe('editorial-story-video', function (root) {
  var v = root.querySelector('.es-bgvid');
  if (!v) return;
  if (!(window.DS && DS.canAnimate)) return;
  var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
  if (!('IntersectionObserver' in window)) return play();
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) play(); else v.pause(); });
  }, { threshold: 0.1 }).observe(root);
});

/* recipe: process-steps — the .p-card row rests scattered (desktop only) and
   assembles into line the first time the section scrolls into view. */
DS.recipe('process-steps', function (root) {
  var cards = Array.prototype.slice.call(root.querySelectorAll('.p-card'));
  if (!cards.length) return;
  var scatter = [
    'translateX(70%) translateY(14px) rotate(-13deg)',
    'translateX(24%) translateY(5px) rotate(-5deg)',
    'translateX(-24%) translateY(5px) rotate(5deg)',
    'translateX(-70%) translateY(14px) rotate(13deg)'
  ];
  var assemble = function () {
    root.classList.add('ps-in');
    requestAnimationFrame(function () {
      cards.forEach(function (c) { c.style.transition = ''; c.style.transform = ''; });
    });
  };
  // no scatter for reduced motion or narrow viewports — the row is simply in line
  if (!(window.DS && DS.canAnimate) || !window.matchMedia('(min-width: 1024px)').matches) {
    root.classList.add('ps-armed'); return assemble();
  }
  root.classList.add('ps-armed');
  cards.forEach(function (c, i) {
    c.style.transition = 'none';
    c.style.transform = scatter[i] || '';
    c.style.zIndex = 10 + i;
  });
  void root.offsetWidth;   // flush the resting state before transitions resume
  try {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { assemble(); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(root);
  } catch (e) { assemble(); }
});

/* recipe: video-tabs-scatter — corporate-institutional's four-panel scroll.
   Panel 1 rests four cards scattered across the stage; they converge to centre,
   the lead card expands full-bleed, then each following panel fades its copy in
   and offers prev/next affordances that scroll between panels.

   Everything is addressed by data-vt within the section root — the source page
   carried 41 ids, which the contract forbids and which would collide the moment
   the component appeared twice. Geometry is percentage-based off a 1366x768
   reference so the scatter holds its composition at any viewport. */
DS.recipe('video-tabs-scatter', function (root) {
  var el = function (name) { return root.querySelector('[data-vt="' + name + '"]'); };
  var set = function (name, styles) { var n = el(name); if (n) Object.assign(n.style, styles); };
  var VW = 1366, VH = 768;
  var pct = function (px, total) { return (px / total) * 100; };

  var POS;
  var narrow = window.innerWidth < 768;
  var mid = window.innerWidth >= 768 && window.innerWidth < 1100;
  if (narrow) {
    POS = { c1: { l: 0, t: 6, w: 28, h: 22 }, c2: { l: 4, t: 44, w: 40, h: 28 },
            c3: { l: 50, t: 8, w: 44, h: 30 }, c4: { l: 53, t: 54, w: 36, h: 26 } };
  } else {
    var c1w = pct(128, VW) * (mid ? 1.5 : 1);
    POS = { c1: { l: pct(432, VW), t: pct(178, VH), w: c1w,          h: pct(198, VH) },
            c2: { l: pct(118, VW), t: pct(395, VH), w: pct(251, VW), h: pct(323, VH) },
            c3: { l: pct(882, VW), t: pct(111, VH), w: pct(464, VW), h: pct(238, VH) },
            c4: { l: pct(820, VW), t: pct(420, VH), w: pct(333, VW), h: pct(238, VH) } };
  }
  var CX = (100 - POS.c1.w) / 2, CY = (100 - POS.c1.h) / 2, GAP = 1.5;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var inv = function (v, a, b) { return Math.min(1, Math.max(0, (v - a) / (b - a))); };

  // reduced motion / no-JS-animation: show the copy in place, skip the choreography
  if (!(window.DS && DS.canAnimate)) {
    ['card1', 'card2', 'card3', 'card4'].forEach(function (n, i) {
      var k = 'c' + (i + 1);
      set(n, { opacity: '1', left: POS[k].l + '%', top: POS[k].t + '%', width: POS[k].w + '%', height: POS[k].h + '%' });
      set('text' + (i + 1), { opacity: '1', left: POS[k].l + '%', top: (POS[k].t + POS[k].h + GAP) + '%' });
    });
    ['label1', 'heading1', 'bullets1'].forEach(function (n) { set(n, { opacity: '1', transform: 'none' }); });
    ['c2', 'c3', 'c4'].forEach(function (c) {
      ['-label', '-heading', '-suite1', '-bullets1', '-suite2', '-bullets2'].forEach(function (s) {
        set(c + s, { opacity: '1', transform: 'none' });
      });
    });
    return;
  }

  var progress = function (node) {
    if (!node) return 0;
    var total = node.offsetHeight - window.innerHeight;
    return total <= 0 ? 0 : Math.max(0, Math.min(1, -node.getBoundingClientRect().top / total));
  };

  function place(name, p) {
    set(name, { opacity: '0', left: p.l + '%', top: p.t + '%', width: p.w + '%', height: p.h + '%', borderRadius: '12px' });
  }
  function placeText(name, p) { set(name, { opacity: '0', left: p.l + '%', top: (p.t + p.h + GAP) + '%' }); }

  function onScroll() {
    var v = progress(el('c1-container'));
    var fade = inv(v, 0, 0.18), move = inv(v, 0, 0.35);
    var side = Math.max(0, fade - inv(v, 0.18, 0.35));
    var grow = inv(v, 0.35, 0.55);

    var l = lerp(lerp(POS.c1.l, CX, move), 0, grow);
    var t = lerp(lerp(POS.c1.t, CY, move), 0, grow);
    var w = lerp(POS.c1.w, 100, grow), h = lerp(POS.c1.h, 100, grow);
    set('card1', { opacity: String(fade), left: l + '%', top: t + '%', width: w + '%', height: h + '%', borderRadius: lerp(12, 0, grow) + 'px' });
    set('text1', { opacity: String(Math.max(0, fade - inv(v, 0.35, 0.50))), left: l + '%', top: (t + h + GAP) + '%' });
    set('card1-gradient', { opacity: String(inv(v, 0.52, 0.62)) });

    var a = inv(v, 0.58, 0.66); set('label1', { opacity: String(a), transform: 'translateY(' + lerp(16, 0, a) + 'px)' });
    var b = inv(v, 0.62, 0.70); set('heading1', { opacity: String(b), transform: 'translateY(' + lerp(32, 0, b) + 'px)' });
    var c = inv(v, 0.65, 0.74); set('bullets1', { opacity: String(c), transform: 'translateY(' + lerp(20, 0, c) + 'px)' });
    set('next-hint-1', { opacity: String(inv(v, 0.72, 0.80)) });

    ['c2', 'c3', 'c4'].forEach(function (key, i) {
      var p = POS[key];
      var cl = lerp(p.l, CX, move), ct = lerp(p.t, CY, move);
      var cw = lerp(p.w, POS.c1.w, move), ch = lerp(p.h, POS.c1.h, move);
      set('card' + (i + 2), { opacity: String(side), left: cl + '%', top: ct + '%', width: cw + '%', height: ch + '%', borderRadius: '12px' });
      set('text' + (i + 2), { opacity: String(side), left: cl + '%', top: (ct + ch + GAP) + '%' });
    });

    ['c2', 'c3', 'c4'].forEach(function (key) {
      var pv = progress(el(key + '-container'));
      var steps = [['-label', 0.02, 0.12, 16], ['-heading', 0.06, 0.18, 32], ['-suite1', 0.12, 0.22, 20],
                   ['-bullets1', 0.18, 0.30, 20], ['-suite2', 0.26, 0.36, 20], ['-bullets2', 0.32, 0.44, 20]];
      steps.forEach(function (s) {
        var k = inv(pv, s[1], s[2]);
        set(key + s[0], { opacity: String(k), transform: 'translateY(' + lerp(s[3], 0, k) + 'px)' });
      });
      set(key + '-prev-hint', { opacity: String(inv(pv, 0.20, 0.30)) });
      set(key + '-next-hint', { opacity: String(inv(pv, 0.28, 0.38)) });
    });

    var cue = el('vt-scroll-indicator'), first = el('c1-container');
    if (cue && first) {
      var span = first.offsetHeight - window.innerHeight;
      var k = span > 0 ? Math.min(1, (window.scrollY - first.offsetTop) / span) : 0;
      cue.style.opacity = k > 0.08 ? '0' : String(1 - k / 0.08);
    }
  }

  var ease = function (t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; };
  var raf = null;
  function scrollToPanel(name, at) {
    var node = el(name); if (!node) return;
    var target = node.offsetTop + Math.max(0, (node.offsetHeight - window.innerHeight) * at);
    var from = window.scrollY, dist = target - from;
    if (Math.abs(dist) < 2) return;
    // Lenis owns the scroll position on these pages; a manual rAF loop fights it
    var lenis = (window.DS && DS.lenis && typeof DS.lenis.scrollTo === 'function') ? DS.lenis : null;
    if (lenis) {
      return lenis.scrollTo(target, { duration: Math.min(1.4, Math.max(0.7, Math.abs(dist) * 0.0006)), easing: ease, lock: true, force: true });
    }
    var ms = Math.min(1400, Math.max(700, Math.abs(dist) * 0.6)), t0 = null;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      var t = Math.min((ts - t0) / ms, 1);
      window.scrollTo(0, from + dist * ease(t));
      raf = t < 1 ? requestAnimationFrame(step) : null;
    });
  }

  [['next-hint-1', 'c2-container', 0.50], ['c2-next-hint', 'c3-container', 0.50],
   ['c3-next-hint', 'c4-container', 0.50], ['c2-prev-hint', 'c1-container', 0.85],
   ['c3-prev-hint', 'c2-container', 0.50], ['c4-prev-hint', 'c3-container', 0.50]
  ].forEach(function (wire) {
    var node = el(wire[0]); if (!node) return;
    node.addEventListener('click', function () {
      var inner = node.querySelector('.hint-inner');
      if (inner) {
        inner.classList.remove('tapped');
        void inner.offsetWidth;
        inner.classList.add('tapped');
        inner.addEventListener('animationend', function () { inner.classList.remove('tapped'); }, { once: true });
      }
      scrollToPanel(wire[1], wire[2]);
    });
  });

  place('card1', POS.c1); place('card2', POS.c2); place('card3', POS.c3); place('card4', POS.c4);
  placeText('text1', POS.c1); placeText('text2', POS.c2); placeText('text3', POS.c3); placeText('text4', POS.c4);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
