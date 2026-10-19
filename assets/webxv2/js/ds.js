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
     <span class="bp-img" data-bg="/assets/webxv2/images/x.jpg"></span>
     The runtime sets background-image, so component HTML carries no inline CSS. */
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

  /* ── Reduced motion · autoplay videos stand down ──────────────────────────
     A muted autoplay+loop video is DECORATION (illustration video / ambient
     hero wash), and decoration must not move for a reduced-motion reader.
     One global affordance so no page or block carries per-instance code:
     a video that is autoplay + loop + has a poster is paused and reset to its
     poster (preload='none' + load() re-raises the show-poster flag without
     fetching the media). Deliberately narrow:
       · no poster  → left alone (stopping it would leave a blank box);
       · [controls] → user-driven media, never ours to stop;
       · scrubbed videos (scroll-frames / scroll-story) carry no autoplay.
     This is why the Mode-2 illustration-video contract REQUIRES a poster. */
  register(function reducedMotionVideo(scope) {
    if (!prefersReduced) return;
    all(scope, 'video[autoplay][loop][poster]:not([controls]):not([data-rm-still])').forEach(function (v) {
      v.setAttribute('data-rm-still', '');
      v.removeAttribute('autoplay'); v.autoplay = false; v.loop = false;
      try { v.pause(); v.preload = 'none'; v.load(); } catch (e) {}
    });
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
          // Reserve the final width BEFORE counting so the column doesn't reflow
          // as digits are added (0 → 18 → 180). Render the target, lock min-width,
          // then animate from 0. tabular-nums (CSS) keeps digit widths equal.
          el.textContent = fmt(el, target);
          if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
          el.style.minWidth = Math.ceil(el.getBoundingClientRect().width) + 'px';
          var dur = (parseFloat(el.getAttribute('data-duration') || '2')) * 1000, start = null;
          (function tick(now) {
            if (start === null) start = now;
            var p = Math.min((now - start) / dur, 1);
            el.textContent = fmt(el, ease(p) * target);
            if (p < 1) requestAnimationFrame(tick);
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
     product doesn't do. Track fill is published as --range-fill for CSS (.range atom).
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
        el.style.setProperty('--range-fill', f * 100 + '%');
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
        el.style.setProperty('--range-fill', (f * 100) + '%');
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
      // Inks are declared in markup: the active trigger carries the "on" ink
      // (e.g. ink-primary) and the others the "off" ink (e.g. ink-mute). Read
      // that pair once and move it with the state, so the selected tab is
      // always the one that reads strongest.
      function inkOf(t) { return t && [].filter.call(t.classList, function (c) { return c.indexOf('ink-') === 0; })[0]; }
      var onT = triggers.filter(function (t) { return t.classList.contains('active'); })[0] || triggers[0];
      var offT = triggers.filter(function (t) { return t !== onT; })[0];
      var inkOn = inkOf(onT), inkOff = inkOf(offT);
      if (inkOn === inkOff) inkOn = inkOff = null;

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
          if (inkOn && inkOff && (t.classList.contains(inkOn) || t.classList.contains(inkOff))) { t.classList.toggle(inkOn, on); t.classList.toggle(inkOff, !on); }
          if (on) current = i;
        });
        panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === key); });
        // Roving tabindex: only the active tab is in the focus order.
        triggers.forEach(function (t) { t.setAttribute('tabindex', t.getAttribute('data-tab') === key ? '0' : '-1'); });
        revealActive(triggers[current]);
        if (timer) paintBar();
        // Carousels (and other measured widgets) inside a just-shown panel
        // measured 0 scroll range while display:none and hid their nav.
        // The engines all re-measure on resize — nudge them.
        window.dispatchEvent(new Event('resize'));
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
      /* Optional deep links: <div data-tabs data-tabs-hash> opens the tab whose
         key matches the URL hash (page.html#ecm), and keeps the hash in step
         when the reader switches tabs, so a tab can be linked and shared. */
      if (root.hasAttribute('data-tabs-hash')) (function () {
        function fromHash() {
          var k = decodeURIComponent((location.hash || '').slice(1));
          if (k && triggers.some(function (t) { return t.getAttribute('data-tab') === k; })) activate(k);
        }
        window.addEventListener('hashchange', fromHash);
        triggers.forEach(function (t) {
          t.addEventListener('click', function () { if (history.replaceState) history.replaceState(null, '', '#' + t.getAttribute('data-tab')); });
        });
      })();
      function play() { if (!ms || !canAnimate) return; stop(); paintBar(); timer = setInterval(function () { activate(triggers[(current + 1) % triggers.length].getAttribute('data-tab')); }, ms); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }

      /* Swipe left/right on the PANELS switches tabs (phones). Opt-in via
         data-tabs-swipe on the root. Horizontal-dominant gestures only, and
         never when the touch started inside something horizontally scrollable
         (a table, a nested carousel) — that swipe belongs to the scroller. */
      if (root.hasAttribute('data-tabs-swipe')) (function () {
        var sx = 0, sy = 0, ok = false;
        function hscrollable(el) {
          for (; el && el !== root; el = el.parentElement) {
            if (el.scrollWidth > el.clientWidth + 4) {
              var o = getComputedStyle(el).overflowX;
              if (o === 'auto' || o === 'scroll') return true;
            }
          }
          return false;
        }
        panels.forEach(function (p) {
          p.addEventListener('touchstart', function (e) {
            ok = !hscrollable(e.target); sx = e.touches[0].clientX; sy = e.touches[0].clientY;
          }, { passive: true });
          p.addEventListener('touchend', function (e) {
            if (!ok) return;
            var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
            var step = (dx < 0 ? 1 : -1) * (getComputedStyle(root).direction === 'rtl' ? -1 : 1);
            var ni = current + step;
            if (ni < 0 || ni >= triggers.length) return;
            activate(triggers[ni].getAttribute('data-tab')); if (ms) play();
          }, { passive: true });
        });
      })();

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
      var hashKey = root.hasAttribute('data-tabs-hash') ? decodeURIComponent((location.hash || '').slice(1)) : '';
      var init = (hashKey && triggers.filter(function (t) { return t.getAttribute('data-tab') === hashKey; })[0]) || triggers.filter(function (t) { return t.classList.contains('active'); })[0] || triggers[0];
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
        var s = slides[Math.max(0, Math.min(maxIndex, i))];
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
      var centerMode = !!root.closest('.is-center-peek');
      function current() {
        // Rect-based, same alignment edges as to(): nearest slide = the one whose
        // aligned edge (or center, in center-peek mode) is closest to the track's.
        var rtl = isRTL(track), tr = track.getBoundingClientRect();
        var min = Infinity, idx = 0;
        slides.forEach(function (s, i) {
          var sr = s.getBoundingClientRect();
          var d = centerMode
            ? Math.abs((sr.left + sr.right) / 2 - (tr.left + tr.right) / 2)
            : Math.abs(rtl ? (sr.right - tr.right) : (sr.left - tr.left));
          if (d < min) { min = d; idx = i; }
        });
        return Math.min(idx, maxIndex);
      }
      // Wide slides make the tail unreachable by start-alignment: cap the
      // navigable index by real scroll range, hide the dead dots, and let
      // autoplay wrap at the cap instead of freezing on it.
      var maxIndex = slides.length - 1;
      function measureMax() {
        var maxS = track.scrollWidth - track.clientWidth;
        if (centerMode || maxS <= 4) { maxIndex = maxS <= 4 ? 0 : slides.length - 1; }
        else {
          // The last stop is the FIRST slide whose start-alignment clamps to the
          // end of the scroll range: to() lands it end-aligned, revealing the
          // tail. (Capping at the last fully-alignable slide left the final
          // partial card visible but unreachable — arrows died one step early.)
          var o0 = slides[0].offsetLeft; maxIndex = slides.length - 1;
          for (var mi = 0; mi < slides.length; mi++) {
            if (Math.abs(slides[mi].offsetLeft - o0) >= maxS - 8) { maxIndex = mi; break; }
          }
        }
        if (centerMode) maxIndex = slides.length - 1;
        dots.forEach(function (d, i) { d.hidden = i > maxIndex; });
        // No scroll range → the whole nav row is a lie: hide arrows too.
        var canNav = maxIndex > 0;
        if (prev) prev.hidden = !canNav;
        if (next) next.hidden = !canNav;
      }
      var prev = root.querySelector('[data-carousel-prev]'), next = root.querySelector('[data-carousel-next]');
      if (prev) prev.addEventListener('click', function () { to(current() - 1); });
      if (next) next.addEventListener('click', function () { to(current() + 1); });

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
        slides.forEach(function (s, i) {
          s.classList.toggle('is-current', i === c);
          // mixed-media slides: only the current slide's video runs
          var v = s.querySelector('video');
          if (v) { if (i === c) { if (v.paused) { try { v.play().catch(function () {}); } catch (e) {} } } else if (!v.paused) v.pause(); }
        });
      }
      track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
      measureMax(); sync();
      window.addEventListener('resize', function () { measureMax(); sync(); });
      setTimeout(function () { measureMax(); sync(); }, 400);

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

      // Tap-to-travel: clicking a slide you're not "on" navigates to it
      // instead of following the card's link. Center-peek: any non-current
      // slide (the dimmed neighbours ARE navigation). Start-aligned mode:
      // only slides partially clipped by the track viewport — fully visible
      // cards keep their normal link behaviour. Post-drag ghost clicks are
      // already swallowed by dragify's capture-phase click guard.
      track.addEventListener('click', function (e) {
        var s = e.target.closest('[data-carousel-slide]');
        if (!s || !track.contains(s)) return;
        var i = slides.indexOf(s);
        if (i < 0) return;
        var go;
        if (centerMode) { go = !s.classList.contains('is-current'); }
        else {
          var tr = track.getBoundingClientRect(), sr = s.getBoundingClientRect();
          go = sr.left < tr.left - 2 || sr.right > tr.right + 2;
        }
        if (!go) return;
        e.preventDefault(); e.stopPropagation();
        to(Math.min(i, maxIndex));
      });

      // Autoplay + a play/pause toggle ([data-carousel-toggle]). data-autoplay
      // present → plays by default; hover pauses; the toggle is an explicit,
      // sticky pause (hover won't resume a user-paused carousel).
      var ms = parseInt(root.getAttribute('data-autoplay') || '0', 10);
      if (ms > 0 && canAnimate) {
        var timer = null, userPaused = false;
        function step() {
          // Wrap on GEOMETRY, not only on index: maxIndex can be measured
          // before layout settles, leaving it too high — then current() never
          // reaches it and to(c+1) clamps in place, freezing the loop at the
          // end of the range. If the track is physically at its end, wrap.
          measureMax();
          var c = current();
          var maxS = track.scrollWidth - track.clientWidth;
          var atEnd = c >= maxIndex || (maxS > 4 && Math.abs(Math.abs(track.scrollLeft) - maxS) < 4);
          to(atEnd ? 0 : c + 1);
        }
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
    var down = false, moved = false, sx = 0, sl = 0;
    var pid = null;
    // Capture is deferred to first movement (below), so native HTML5 link/image
    // dragging would otherwise kick in when a drag starts ON an anchor card —
    // suppress it; horizontal drag is ours.
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;    // native touch is fine
      down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; pid = e.pointerId;
      // NOTE: capture + drag state start on first real MOVEMENT, not here —
      // setPointerCapture on pointerdown retargets the eventual click to the
      // track, which broke plain clicks on slides (tap-to-travel, links).
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 10) {
        moved = true;
        // Suspend scroll-snap for the duration of the drag: mandatory/proximity
        // snap yanks each programmatic scrollLeft back, so the track wouldn't
        // visibly follow the cursor. Restored on release, which then settles.
        el.style.scrollSnapType = 'none';
        el.classList.add('is-dragging');
        try { el.setPointerCapture(pid); } catch (err) {}
      }
      if (moved) el.scrollLeft = sl - dx;
    });
    function end() { if (!down) return; down = false; el.style.scrollSnapType = ''; el.classList.remove('is-dragging'); }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
  register(function dragScroll(scope) { all(scope, '[data-drag-scroll]:not([data-drag-bound])').forEach(dragify); });

  /* ── Form shell ── auto-wired drivers for cmp-form-shell pages.
     1. Audience tabs: [data-aud] triggers switch [data-aud-panel] panels
        (WAI-ARIA tabs pattern with roving tabindex + arrow keys).
     2. Mock forms: form[data-mock-form] validates required fields + the
        consent checkbox on submit, then swaps the form for its card's
        .sac-success panel. Prototype-only — no network submit. */
  register(function formShell(scope) {
    all(scope, '.cmp-form-shell:not([data-fsh-bound])').forEach(function (root) {
      root.setAttribute('data-fsh-bound', '');
      var tabs = all(root, '[data-aud]');
      function activate(tab, setFocus) {
        var aud = tab.getAttribute('data-aud');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.setAttribute('tabindex', on ? '0' : '-1');
        });
        all(root, '[data-aud-panel]').forEach(function (p) { p.hidden = (p.getAttribute('data-aud-panel') !== aud); });
        if (setFocus) tab.focus();
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { activate(tab, false); });
        tab.addEventListener('keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === 'Home') next = tabs[0];
          else if (e.key === 'End') next = tabs[tabs.length - 1];
          if (next) { e.preventDefault(); activate(next, true); }
        });
      });
      all(root, 'form[data-mock-form]').forEach(function (form) {
        var card = form.closest('.sac-card');
        var success = card ? card.querySelector('.sac-success') : null;
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var valid = true, firstInvalid = null;
          all(form, 'input[required], select[required], textarea[required]').forEach(function (el) {
            if (el.type === 'checkbox') return;
            var field = el.closest('.field');
            var ok = el.value && el.value.trim() !== '';
            if (field) field.classList.toggle('error', !ok);
            el.setAttribute('aria-invalid', ok ? 'false' : 'true');
            if (!ok) { valid = false; if (!firstInvalid) firstInvalid = el; }
          });
          var consent = form.querySelector('input[name="consent"]');
          var consentErr = form.querySelector('[data-consent-error]');
          if (consent && !consent.checked) {
            valid = false;
            consent.setAttribute('aria-invalid', 'true');
            if (consentErr) consentErr.hidden = false;
            if (!firstInvalid) firstInvalid = consent;
          } else if (consent) {
            consent.setAttribute('aria-invalid', 'false');
            if (consentErr) consentErr.hidden = true;
          }
          if (!valid) { if (firstInvalid) firstInvalid.focus(); return; }
          form.classList.add('is-hidden');
          if (success) {
            success.classList.add('is-visible');
            success.setAttribute('tabindex', '-1');
            success.focus();
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
        form.addEventListener('input', function (e) {
          var field = e.target.closest('.field');
          if (field && field.classList.contains('error') && e.target.value && e.target.value.trim() !== '') {
            field.classList.remove('error');
            e.target.setAttribute('aria-invalid', 'false');
          }
          if (e.target.name === 'consent' && e.target.checked) {
            e.target.setAttribute('aria-invalid', 'false');
            var ce = form.querySelector('[data-consent-error]');
            if (ce) ce.hidden = true;
          }
        });
      });
    });
  });

  /* ── Payment track ── auto-wired looping step animation for the .as-track
     mockup: [data-pt-track] holds .tr-step items + a [data-pt-prog] bar.
     Starts when ~30% visible, then loops released → credited. Respects
     prefers-reduced-motion (renders the final "all done" state instead). */
  register(function ptTrack(scope) {
    all(scope, '[data-pt-track]:not([data-pt-bound])').forEach(function (root) {
      root.setAttribute('data-pt-bound', '');
      var steps = all(root, '.tr-step'), prog = root.querySelector('[data-pt-prog]');
      if (!steps.length || !prog) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        steps.forEach(function (s) { s.classList.add('done'); });
        prog.style.width = '100%';
        return;
      }
      var i = -1, timers = [];
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function reset() { steps.forEach(function (s) { s.classList.remove('on', 'done'); }); prog.style.width = '0%'; i = -1; }
      function tick() {
        i++;
        if (i >= steps.length) { later(function () { reset(); later(tick, 600); }, 1500); return; }
        steps.forEach(function (s, k) { s.classList.toggle('done', k < i); });
        var cur = steps[i];
        cur.classList.remove('done'); cur.classList.add('on');
        prog.style.width = (i / (steps.length - 1) * 100) + '%';
        later(function () { cur.classList.remove('on'); cur.classList.add('done'); }, 500);
        later(tick, 1050);
      }
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { reset(); tick(); io.disconnect(); } });
        }, { threshold: .3 });
        io.observe(root);
      } else { reset(); tick(); }
    });
  });

  /* ── .ess progress dots ── light the dot for whichever .ess-ch chapter is most
     visible as the scroll-story scrubs. Reads chapter opacity (driven by the
     [data-anim] engine), so it stays in sync without duplicating the windows. */
  register(function essDots(scope) {
    all(scope, '.ess:not([data-ess-dots-bound])').forEach(function (ess) {
      var wrap = ess.querySelector('.ess-dots');
      var chapters = all(ess, '.ess-ch');
      var dots = wrap ? all(wrap, 'i') : [];
      if (!wrap || !dots.length || !chapters.length) return;
      ess.setAttribute('data-ess-dots-bound', '');
      var last = -1;
      function setActive(i) { if (i === last) return; last = i; dots.forEach(function (dot, k) { dot.classList.toggle('is-on', k === i); }); }
      if (!canAnimate) { setActive(0); return; }   // reduced motion: chapters show stacked
      function update() {
        var best = 0, bestOp = -1;
        chapters.forEach(function (ch, i) { var op = parseFloat(getComputedStyle(ch).opacity) || 0; if (op > bestOp) { bestOp = op; best = i; } });
        setActive(Math.min(best, dots.length - 1));
      }
      update();
      window.addEventListener('scroll', update, { passive: true });
      if (window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', update);
      window.addEventListener('resize', update);
    });
  });

  /* ── Filter ── generic, data-attribute-driven grid filtering. ANY card grid
     becomes filterable with no bespoke code:
       <section data-filter>
         <select data-filter-key="sector"><option value="">All</option>…</select>
         … or pill buttons: <button data-filter-key="sector" data-filter-value="ecm">ECM</button>
         <button data-filter-reset>Reset</button>            (optional)
         <span data-filter-count></span>                     (optional — gets visible count)
         <div data-filter-empty hidden>No matches</div>      (optional — shown when 0)
         <div data-filter-grid> …items with data-filter-<key>="value"… </div>
       </section>
     An item shows only if, for EVERY active key, its data-filter-<key> matches
     (a space/comma list on the item counts as a match on any token). An empty
     select value / an un-pressed pill = that key inactive. Hides via [hidden].
     Optional text search: <input data-filter-search> — case-insensitive
     substring match against each item's visible text, ANDed with the keys. */
  /* Video explainer: click-to-play film WITH sound. The <video> ships with
     native controls (no-JS fallback); JS swaps them for the branded play
     button until first play, then hands back to the native controls, and
     returns to the poster when the film ends. */
  register(function videoExplainer(scope) {
    all(scope, '[data-video-explainer]:not([data-vx-bound])').forEach(function (frame) {
      frame.setAttribute('data-vx-bound', '');
      var v = frame.querySelector('video'), btn = frame.querySelector('.vx-play');
      if (!v || !btn) return;
      v.controls = false; btn.hidden = false;
      // Optional phone cut: data-vx-mq picks it (e.g. portrait 9:16 for phones);
      // swapped only while idle so a playing film is never interrupted.
      var srcEl = v.querySelector('source'), mq = frame.getAttribute('data-vx-mq');
      if (srcEl && mq && window.matchMedia && frame.getAttribute('data-vx-src-m')) {
        var D = { src: srcEl.getAttribute('src'), poster: v.getAttribute('poster') };
        var M = { src: frame.getAttribute('data-vx-src-m'), poster: frame.getAttribute('data-vx-poster-m') || D.poster };
        var mql = window.matchMedia(mq);
        var pick = function () {
          if (frame.classList.contains('is-playing')) return;
          var cut = mql.matches ? M : D;
          frame.classList.toggle('is-m', mql.matches);
          if (srcEl.getAttribute('src') !== cut.src) { srcEl.setAttribute('src', cut.src); v.setAttribute('poster', cut.poster); v.load(); }
        };
        pick();
        if (mql.addEventListener) mql.addEventListener('change', pick); else if (mql.addListener) mql.addListener(pick);
        v.addEventListener('ended', pick);
      }
      btn.addEventListener('click', function () {
        frame.classList.add('is-playing'); v.controls = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () { frame.classList.remove('is-playing'); v.controls = false; });
        v.focus();
      });
      v.addEventListener('ended', function () { frame.classList.remove('is-playing'); v.controls = false; v.load(); btn.focus(); });
    });
  });

  register(function filter(scope) {
    all(scope, '[data-filter]:not([data-filter-bound])').forEach(function (root) {
      root.setAttribute('data-filter-bound', '');
      var grid = root.querySelector('[data-filter-grid]') || root;
      var items = all(grid, '[data-filter-item]');
      if (!items.length) items = Array.prototype.slice.call(grid.children);
      var countEl = root.querySelector('[data-filter-count]');
      var totalEl = root.querySelector('[data-filter-total]');
      var emptyEl = root.querySelector('[data-filter-empty]');
      var active = {};
      var query = '';
      /* Optional "Show more": data-filter-step="9" on the root shows the first
         N matching items; a [data-filter-more] button reveals the next N. Any
         filter change starts again from N. [data-filter-count] then reports
         how many are on screen and [data-filter-total] how many match. */
      var step = parseInt(root.getAttribute('data-filter-step') || '0', 10);
      var limit = step;
      var moreBtn = root.querySelector('[data-filter-more]');
      var moreWrap = moreBtn && (moreBtn.closest('[data-filter-more-wrap]') || moreBtn);
      function matches(item) {
        for (var key in active) {
          var want = active[key]; if (!want) continue;
          var have = (item.getAttribute('data-filter-' + key) || '').toLowerCase();
          if (have.split(/[\s,]+/).indexOf(want.toLowerCase()) === -1) return false;
        }
        if (query && (item.textContent || '').toLowerCase().indexOf(query) === -1) return false;
        return true;
      }
      function apply(keepLimit) {
        if (!keepLimit) limit = step;
        var matched = 0, shown = 0;
        items.forEach(function (it) {
          var ok = matches(it);
          if (ok) matched++;
          var vis = ok && (!step || matched <= limit);
          it.hidden = !vis; if (vis) shown++;
        });
        if (countEl) countEl.textContent = String(shown);
        if (totalEl) totalEl.textContent = String(matched);
        if (emptyEl) emptyEl.hidden = matched !== 0;
        if (moreWrap) moreWrap.hidden = !step || shown >= matched;
      }
      if (moreBtn) moreBtn.addEventListener('click', function () {
        var before = items.filter(function (it) { return !it.hidden; }).length;
        limit += step; apply(true);
        // move focus to the first newly revealed item for keyboard users
        var next = items.filter(function (it) { return !it.hidden; })[before];
        if (next) { if (!next.matches('a,button,[tabindex]')) next.setAttribute('tabindex', '-1'); next.focus({ preventScroll: false }); }
        if (window.DS && DS.refresh) DS.refresh(root);
      });
      all(root, 'select[data-filter-key]').forEach(function (sel) {
        active[sel.getAttribute('data-filter-key')] = sel.value || '';
        sel.addEventListener('change', function () { active[sel.getAttribute('data-filter-key')] = sel.value || ''; apply(); });
      });
      all(root, 'button[data-filter-key][data-filter-value]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-filter-key'), val = btn.getAttribute('data-filter-value');
          var group = all(root, 'button[data-filter-key="' + key + '"]');
          if (active[key] === val) { active[key] = ''; btn.setAttribute('aria-pressed', 'false'); }
          else { active[key] = val; group.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); }); }
          apply();
        });
      });
      all(root, 'input[data-filter-search]').forEach(function (inp) {
        inp.addEventListener('input', function () { query = (inp.value || '').trim().toLowerCase(); apply(); });
      });
      all(root, '[data-filter-reset]').forEach(function (r) {
        r.addEventListener('click', function () {
          for (var k in active) active[k] = '';
          query = '';
          all(root, 'select[data-filter-key]').forEach(function (s) { s.value = ''; });
          all(root, 'input[data-filter-search]').forEach(function (s) { s.value = ''; });
          all(root, 'button[data-filter-key][data-filter-value]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
          apply();
        });
      });
      apply();
    });
  });

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
    function open(id) {
      var m = document.getElementById(id);
      if (!m) return;
      // Lenis hijacks the wheel document-wide: without these, wheel input keeps
      // scrolling the page BEHIND the overlay and never reaches the modal's own
      // scroller. data-lenis-prevent exempts the overlay subtree; stop() freezes
      // the page for the modal's lifetime.
      m.setAttribute('data-lenis-prevent', '');
      m.classList.add('open');
      document.documentElement.style.overflow = 'hidden';
      if (window.DS && DS.lenis && DS.lenis.stop) DS.lenis.stop();
    }
    function close(m) {
      if (!m) return;
      m.classList.remove('open');
      if (!document.querySelector('.open')) {
        document.documentElement.style.overflow = '';
        if (window.DS && DS.lenis && DS.lenis.start) DS.lenis.start();
      }
    }
    document.addEventListener('click', function (e) {
      var o = e.target.closest('[data-modal-open]'); if (o) { e.preventDefault(); open(o.getAttribute('data-modal-open')); return; }
      var c = e.target.closest('[data-modal-close]'); if (c) { e.preventDefault(); var id = c.getAttribute('data-modal-close'); close(id ? document.getElementById(id) : c.closest('.open')); return; }
      if (e.target.matches && e.target.matches('[data-modal-dismiss]')) close(e.target);
    });
    document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; var o = document.querySelectorAll('.open'); if (o.length) close(o[o.length - 1]); });
    window.openModal = open; window.closeModal = function (id) { close(document.getElementById(id)); };
  }
  register(function () { bindModals(); });

  /* ── Tier 1 · .range atom track fill ──────────────────────────────────────
     The .range slider paints its filled portion from --range-fill, which CSS
     alone cannot derive from an <input>'s value. One delegated listener keeps
     ANY .range live; behaviors (calculators) also republish it on their own
     programmatic updates. Bound once, page-level. */
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.classList || !el.classList.contains('range')) return;
    var min = +el.min || 0, max = +el.max || 100;
    var f = max > min ? (+el.value - min) / (max - min) : 0;
    el.style.setProperty('--range-fill', f * 100 + '%');
  });

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
      // legacy behavior names on already-shipped pages (renamed 2026-09-01)
      var BEHAVIOR_ALIASES = { 'video-content': 'synced-slider', 'scroll-tab': 'scroll-showcase' };
      if (!recipes[name] && BEHAVIOR_ALIASES[name]) name = BEHAVIOR_ALIASES[name];
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

  /* recipe: lottie — vector illustration from a JSON asset (capability 1 of the
     illustration doctrine; the other is the chromeless baked-background MP4).
       <div class="lot-stage" data-behavior="lottie"
            data-lottie-src="assets/webxv2/lottie/name.json"
            data-lottie-loop="true" data-lottie-speed="1">
         <img class="lot-poster" src="assets/webxv2/lottie/name.png" alt="">
       </div>
     The player is VENDORED (assets/webxv2/js/lottie_light.min.js, pinned) and
     LAZY-LOADED on first sighting — same pattern as Lenis: loadScript() +
     dsBaseDir(), one <script> for the whole page however many stages exist.
     The poster <img> is the still: it is the sizer, it is what shows before
     the player lands, and under prefers-reduced-motion it is ALL that ever
     shows — the recipe returns before the network is touched.
     RTL: the engine does NOT mirror. A directional animation needs a MIRRORED
     EXPORT (doctrine) — the JSON is content, and content is authored per
     direction, exactly like a directional image.
     No IDs, no inline styles: the mount div is engine-made and the swap is a
     class (.is-lottie-on) on the stage. */
  var lottiePending = null;   // queued stages while the player loads
  recipe('lottie', function (stage) {
    if (!canAnimate) return;                       // reduced motion: poster stays, no fetch
    var src = stage.getAttribute('data-lottie-src');
    if (!src) return;
    var mount = function () {
      if (!window.lottie || stage.hasAttribute('data-lottie-mounted')) return;
      stage.setAttribute('data-lottie-mounted', '');
      var box = document.createElement('div');
      box.className = 'lot-anim';
      box.setAttribute('aria-hidden', 'true');
      stage.appendChild(box);
      var anim = window.lottie.loadAnimation({
        container: box, renderer: 'svg', autoplay: true,
        loop: stage.getAttribute('data-lottie-loop') !== 'false',
        path: src
      });
      var speed = parseFloat(stage.getAttribute('data-lottie-speed') || '1');
      if (speed && speed !== 1) anim.setSpeed(speed);
      anim.addEventListener('DOMLoaded', function () { stage.classList.add('is-lottie-on'); });
      anim.addEventListener('data_failed', function () {
        box.remove(); stage.removeAttribute('data-lottie-mounted');   // poster stays = the fallback
        if (window.console) console.warn('[DS] lottie: could not load ' + src);
      });
    };
    if (window.lottie) { mount(); return; }
    if (lottiePending) { lottiePending.push(mount); return; }
    lottiePending = [mount];
    loadScript(dsBaseDir() + 'lottie_light.min.js', function () {
      var q = lottiePending || []; lottiePending = null;
      q.forEach(function (fn) { fn(); });
    });
  });

  /* recipe: scroll-frames — image-sequence (sprite) or video scrubbing on scroll.
       <div data-behavior="scroll-frames" data-scrub-vh="300"
            data-source="images" data-count="121"
            data-path="assets/webxv2/images/hero-frames/ezgif-frame-###.jpg" data-start="1">
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
    var s = document.currentScript || document.querySelector('script[src*="ds.js"], script[src*="ds.min.js"]');
    return (s && s.src) ? s.src.replace(/[^/]*$/, '') : 'assets/webxv2/js/';
  }
  // ds.js's folder, captured NOW (document.currentScript is null once it has run).
  // Every asset the runtime builds a URL for resolves from here — never from the
  // site root — so the bundle works wherever it is hosted (assets/webxv2/js/ here
  // and in the CMS): DS.asset('images/x.svg') → <js folder>/../images/x.svg
  var DS_JS_DIR = new URL(dsBaseDir(), location.href).href;
  function asset(path) { return new URL('../' + path, DS_JS_DIR).href; }
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
  window.DS = { refresh: run, register: register, recipe: recipe, canAnimate: canAnimate, dragScroll: dragify, isRTL: isRTL, asset: asset };
  // Header: when the active customer segment is Wholesale Banking,
  // point the brand logo at the Wholesale Banking home so clicking it returns the user
  // there (only inside Wholesale Banking; other segments keep their own logo href).
  function linkSegmentLogo(scope) {
    var root = scope || document;
    var seg = root.querySelector('.ish-segments a.is-active');
    if (!seg || !/institutional|wholesale/i.test(seg.textContent || '')) return;
    // Logo always returns to the Wholesale Banking home (Ram, 2026-10-01). A host
    // that knows its home URL declares it: <html data-home-url="/wholesale/">
    // (the CMS should — its home page URL is its own). Otherwise it's resolved
    // from ds.js's own folder (assets/webxv2/js/ → three levels up = site root),
    // which works from sub-folders (ibv2/) and file:// alike.
    var home = document.documentElement.getAttribute('data-home-url') ||
               new URL('../../../cib-home-final.html', DS_JS_DIR).href;
    root.querySelectorAll('a.ish-logo').forEach(function (a) { a.setAttribute('href', home); });
  }
  function boot() { run(document); linkSegmentLogo(document); initSmoothScroll(); }
  // Defer the first scan a tick: recipes are registered via DS.recipe() AFTER
  // this IIFE (appended below), so they must be in the registry before we scan.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();

/* ═══════════════════════════════════════════════════════════════════════════
   TIER-3 RECIPES (registered after the core; each self-contained & element-scoped)
═══════════════════════════════════════════════════════════════════════════ */

/* world-map v2 — the unified map contract (2026-08-28).
   Authoring surface (all data-*, no coordinates in page markup):
     data-map="dots"            map style (registry below: artwork + calibration + gazetteer)
     data-points='[{"id":"dubai","label":"Dubai","side":"below","major":true,"hub":true}, …]'
                                id resolves via the style's CITY GAZETTEER (calibrated once,
                                shared by every page). Escape hatches: {"x":…,"y":…} artwork
                                coords, or {"lat":…,"lng":…} naive equirect projection.
     data-routes='[["dubai","london"], …]'   arcs by point id (optional — points-only is valid)
     data-focus="x,y" data-zoom="1..3"       manual framing override; DEFAULT = auto-fit the
                                             points' bounding box (kills per-page offset tuning)
     data-labels="all|major|none"            chip layer; ≤767px shows only "major" points unless
                                             data-labels-mobile="all"
     data-anim="draw|pulse|none"             draw loop timing is baked (2s / .3 stagger / 2s hold)
   Colors ride tokens: --wm-line (arc/dot ink; surface-aware default) and --wm-map-ink
   (artwork recolor via CSS mask — one artwork, every brand/surface).
   Labels are HTML chips (px type, translatable) — never SVG text (unreadable on phones). */
var WM_STYLES = {
  dots: {
    src: DS.asset('images/shared/common/dotted-map-clear.svg'),
    w: 800, h: 400,
    /* calibrated on the shipped artwork (proven positions harvested from live pages;
       dubai x cross-checks hp-map-story's hand-drawn 530.8) — extend here, never per page.
       Entries may be cities OR country centroids — a point is a point. */
    cities: {
      dubai:[530.8,168.3], riyadh:[511.7,169.7], cairo:[477.4,154.9], istanbul:[472.4,124.4],
      london:[398.7,95], frankfurt:[427.3,105], moscow:[491.6,93], mumbai:[570,185.3],
      singapore:[638.7,234.6], shanghai:[677.9,151.6], jakarta:[645.4,255.6]
    },
    /* the artwork is NOT true equirect — its latitudes are vertically compressed
       (legacy pages hand-fudged every lat to compensate). This piecewise curve maps
       REAL latitude → artwork latitude, calibrated from the 11 proven cities, so any
       point given as real-world {"lat","lng"} lands accurately (validated: predicts
       CIB's hand-drawn Tokyo x=718 to within 0.4px). Longitude is true equirect. */
    latCurve: [[-6.21,-25.011],[1.35,-15.56],[19.08,6.595],[24.71,13.642],[25.20,14.256],
               [30.04,20.306],[31.23,21.788],[41.01,34.01],[50.11,42.75],[51.51,47.25],[55.76,48.15]]
  },
  hex: {
    src: DS.asset('images/shared/common/hex-map-base.svg'),
    accentSrc: DS.asset('images/shared/common/hex-map-accent.svg'),       /* highlighted market tiles (cluster) */
    accentSingleSrc: DS.asset('images/shared/common/hex-map-accent-single.svg'), /* one tile per market */
    w: 1705, h: 984,
    chip: 'flag',        /* flag chips + leader lines + hex ripples (the hx-* CSS family) */
    off: 52,             /* leader length: point → chip anchor, artwork units */
    padX: 130, padY: 95, /* auto-fit padding — room for chips + leaders */
    geo: false,          /* hex artwork has no lat/lng calibration — gazetteer or x/y only */
    /* freed from the recipe's hardcoded MARKERS (2026-08-28), then SNAPPED to
       true tile centroids (the legacy coords anchored a hex VERTEX — a
       systematic ~24-unit offset) so accent tile, ripple, leader and chip are
       concentric. Extend here; snap any new market to its tile centroid. */
    cities: {
      uk:[144.1,318.2], de:[288.7,365.2], ru:[500.9,333.9], at:[327.3,428],
      tr:[491.2,537.7], eg:[462.3,647.5], ksa:[587.6,694.5], uae:[674.4,678.8],
      "in":[886.6,741.6], cn:[1262.6,506.4], sg:[1139.6,864], id:[1178.4,926.9]
    }
  }
};
function wmHexPts(cx,cy,R){ var o=''; for(var i=0;i<6;i++){ var a=Math.PI/180*(60*i-90); o+=(cx+R*Math.cos(a)).toFixed(1)+','+(cy+R*Math.sin(a)).toFixed(1)+' '; } return o.trim(); }
function wmProject(style, lat, lng){
  var P=style.latCurve, a;
  if(P){
    if(lat<=P[0][0]) a=P[0][1]+(lat-P[0][0])*(P[1][1]-P[0][1])/(P[1][0]-P[0][0]);
    else if(lat>=P[P.length-1][0]){ var p=P[P.length-2], q=P[P.length-1]; a=q[1]+(lat-q[0])*(q[1]-p[1])/(q[0]-p[0]); }
    else for(var i=0;i<P.length-1;i++) if(lat>=P[i][0]&&lat<=P[i+1][0]){ a=P[i][1]+(lat-P[i][0])/(P[i+1][0]-P[i][0])*(P[i+1][1]-P[i][1]); break; }
  } else a=lat;
  return [(lng+180)*(style.w/360)+8, (90-a)*(style.h/180)];
}
function wmV2(root){
  var svgNS='http://www.w3.org/2000/svg';
  var animate = !!(window.DS && DS.canAnimate);
  var d=root.dataset;
  var style=WM_STYLES[d.map||'dots']; if(!style) return;
  var pts; try{ pts=JSON.parse(d.points||'[]'); }catch(e){ pts=[]; }
  if(!pts.length) return;
  var routes; try{ routes=JSON.parse(d.routes||'[]'); }catch(e){ routes=[]; }

  var flagMode = style.chip==='flag';
  var wmSec = root.closest('.cmp-world-map');
  if(wmSec) wmSec.classList.add('wm-style-'+(d.map||'dots')); /* per-style CSS defaults (e.g. hex ink) */
  /* hex options: data-ripples (rings per market, default 2, 0 = none) and
     data-accent="single|cluster|none" — SINGLE (one hex per market) is the
     default (review 2026-08-28: "make each as one hex"); cluster = the
     artwork's multi-tile groups */
  var RIPN = d.ripples!=null ? Math.max(0, parseInt(d.ripples,10)||0) : 2;
  var accentSrc = style.accentSingleSrc || style.accentSrc;
  if(d.accent==='none') accentSrc=null;
  else if(d.accent==='cluster') accentSrc=style.accentSrc;

  /* resolve positions: gazetteer id → explicit x/y → calibrated lat/lng
     (geo:false styles have no projection — gazetteer or x/y only) */
  var byId={};
  pts.forEach(function(p){
    var xy = style.cities[p.id] || (p.x!=null ? [p.x,p.y] :
      (p.lat!=null && style.geo!==false ? wmProject(style, p.lat, p.lng) : null));
    if(!xy){ if(window.console) console.warn('world-map: unresolvable point "'+p.id+'"'+(style.geo===false?' (hex style: gazetteer id or x/y required)':'')); return; }
    p._x=xy[0]; p._y=xy[1]; byId[p.id]=p;
  });
  pts=pts.filter(function(p){ return p._x!=null; });
  if(!pts.length) return;

  /* flag mode: chip anchors sit a leader-length away from the point */
  if(flagMode){
    var OFF=style.off||52;
    pts.forEach(function(p){
      var s=p.side||'right';
      p._ax = s==='left' ? p._x-OFF : (s==='bottom' ? p._x : p._x+OFF);
      p._ay = s==='bottom' ? p._y+OFF : p._y;
    });
  }

  /* framing: manual focus/zoom, else auto-fit bbox + padding, clamped to artwork */
  var vb;
  if(d.focus){
    var f=d.focus.split(',').map(Number), z=parseFloat(d.zoom)||1.5;
    var fw=style.w/z, fh=style.h/z;
    vb={x:Math.max(0,Math.min(style.w-fw,f[0]-fw/2)), y:Math.max(0,Math.min(style.h-fh,f[1]-fh/2)), w:fw, h:fh};
  } else {
    var xs=pts.map(function(p){return p._x;}), ys=pts.map(function(p){return p._y;});
    if(flagMode){ pts.forEach(function(p){ xs.push(p._ax); ys.push(p._ay); }); }
    var PX=style.padX||70, PY=style.padY||50;
    var x0=Math.max(0,Math.min.apply(0,xs)-PX), x1=Math.min(style.w,Math.max.apply(0,xs)+PX);
    var y0=Math.max(0,Math.min.apply(0,ys)-PY), y1=Math.min(style.h,Math.max.apply(0,ys)+PY);
    vb={x:x0, y:y0, w:x1-x0, h:y1-y0};
    /* keep the band in a sane aspect range [1.6 … 2.4] */
    var ar=vb.w/vb.h;
    if(ar<1.6){ var nw=Math.min(style.w,vb.h*1.6); vb.x=Math.max(0,Math.min(style.w-nw,vb.x-(nw-vb.w)/2)); vb.w=nw; }
    else if(ar>2.4){ var nh=Math.min(style.h,vb.w/2.4); vb.y=Math.max(0,Math.min(style.h-nh,vb.y-(nh-vb.h)/2)); vb.h=nh; }
  }
  root.classList.add('wm-v2');
  /* story mode (data-mode="story"): the map is a scroll-story stage's background
     — box-driven cover framing like is-bleed, but the choreography (art fade,
     arc draws, point/chip reveals) is SCRUBBED from the .ess scroll progress
     instead of self-running. The engine keeps driving the content overlays. */
  var storyMode = d.mode==='story';
  /* is-bleed (helper class on the section): the map covers the section box —
     the frame is then box-driven (coverFrame below), not aspect-driven */
  var bleed = storyMode || !!root.closest('.cmp-world-map.is-bleed');
  if(!bleed) root.style.setProperty('--wm-ar', vb.w+' / '+vb.h);

  /* artwork layer(s) — CSS masks so tokens recolor them (artwork is flat色);
     hex adds a second, accent layer (the highlighted market tiles) */
  if(flagMode) root.classList.add('hx-map'); /* hex chrome: 4-side fade + spacing */
  var artLayers=[];
  /* artwork URLs ride the site ?v= (read from the style.css link) so artwork
     edits reach browsers through the same cache-bust ritual as css/js */
  var wmV=(function(){ var l=document.querySelector('link[href*="style.css"], link[href*="style.min.css"]'); var m=l&&l.href.match(/[?&]v=(\w+)/); return m?m[1]:null; })();
  function mkArt(srcUrl, cls){
    var a=document.createElement('div'); a.className=cls; a.setAttribute('aria-hidden','true');
    ['mask','-webkit-mask'].forEach(function(pre){
      a.style.setProperty(pre+'-image','url("'+srcUrl+(wmV?'?v='+wmV:'')+'")');
      a.style.setProperty(pre+'-repeat','no-repeat');
    });
    root.appendChild(a); artLayers.push(a); return a;
  }
  mkArt(style.src, 'wm-art'+(flagMode?' hx-base':''));
  if(accentSrc) mkArt(accentSrc, 'wm-art wm-art-accent'+(flagMode?' hx-base':''));
  if(!bleed){
    var sx=style.w/vb.w*100, sy=style.h/vb.h*100;
    var px=(style.w-vb.w)>0 ? vb.x/(style.w-vb.w)*100 : 0, py=(style.h-vb.h)>0 ? vb.y/(style.h-vb.h)*100 : 0;
    artLayers.forEach(function(a){ ['mask','-webkit-mask'].forEach(function(pre){
      a.style.setProperty(pre+'-size', sx+'% '+sy+'%');
      a.style.setProperty(pre+'-position', px+'% '+py+'%');
    }); });
  }

  function el(tag,attrs){ var n=document.createElementNS(svgNS,tag); if(attrs)Object.keys(attrs).forEach(function(k){ n.setAttribute(k,String(attrs[k])); }); return n; }
  var svg=el('svg',{ viewBox:vb.x+' '+vb.y+' '+vb.w+' '+vb.h, preserveAspectRatio:'xMidYMid meet', 'aria-hidden':'true' });
  svg.setAttribute('class','wm-svg');
  root.appendChild(svg);

  var mode=d.anim||'draw';
  if(mode==='none') animate=false;

  /* arcs */
  var DUR=2, STAG=0.3, PAUSE=2, arcs=[];
  routes.forEach(function(r,i){
    var a=byId[r[0]], b=byId[r[1]]; if(!a||!b) return;
    var midX=(a._x+b._x)/2, arcLift=Math.max(8, Math.min(Math.abs(a._x-b._x)*0.36, 55)), midY=Math.min(a._y,b._y)-arcLift;
    var path=el('path',{ d:'M '+a._x+' '+a._y+' Q '+midX+' '+midY+' '+b._x+' '+b._y, fill:'none','stroke-width':'1','stroke-linecap':'round', opacity:'0.85' });
    path.style.stroke='var(--wm-line)';
    svg.appendChild(path);
    var len=path.getTotalLength();
    path.style.strokeDasharray=len;
    path.style.strokeDashoffset=(animate&&(mode==='draw'||storyMode))?len:0;
    arcs.push({ path:path, len:len, start:i*STAG, end:i*STAG+DUR });
  });

  /* points (SVG) + label chips (HTML) — two renderers, one contract:
     dots: pulse circles + text chips · hex: ripple hexagons + leaders + flag chips */
  var labels=document.createElement('div'); labels.className='wm-labels'+(flagMode?' hx-chips':'');
  if(!flagMode) labels.setAttribute('aria-hidden','true'); /* flag chips are interactive */
  root.appendChild(labels);
  pts.forEach(function(p,i){
    if(flagMode){
      if(animate){ for(var k=0;k<RIPN;k++){ var rp=el('polygon',{points:wmHexPts(p._x,p._y,34)}); rp.setAttribute('class','hx-ripple'); rp.style.animationDelay=(i*0.12+k*1.7)+'s'; svg.appendChild(rp); } }
      var ln=el('line',{x1:p._x,y1:p._y,x2:p._ax,y2:p._ay}); ln.setAttribute('class','hx-leader'); ln.setAttribute('data-id',p.id); svg.appendChild(ln);
      if(p.label && d.labels!=='none'){
        var b=document.createElement('button'); b.type='button';
        b.className='hx-chip'+(p.side==='left'?' p-left':(p.side==='bottom'?' p-bottom':''))+(p.major?' is-major':'')+(p.hub?' is-hub':'');
        b.setAttribute('data-id',p.id);
        b.dataset.x=p._ax; b.dataset.y=p._ay;
        b.style.left=((p._ax-vb.x)/vb.w*100)+'%';
        b.style.top=((p._ay-vb.y)/vb.h*100)+'%';
        b.style.transitionDelay=(0.5+i*0.05)+'s';
        b.innerHTML='<img class="hx-flag" src="'+DS.asset('images/shared/flags/'+(p.flag||'')+'.svg')+'" alt="" loading="lazy"><span class="hx-name"></span>';
        b.querySelector('.hx-name').textContent=p.label;
        labels.appendChild(b);
      }
      return;
    }
    var R=p.hub?6.5:4.5, g=el('g');
    g.appendChild(el('circle',{cx:p._x,cy:p._y,r:R+6,opacity:'0.12'})).style.fill='var(--wm-line)';
    if(animate){ var ring=el('circle',{cx:p._x,cy:p._y,r:R,fill:'none','stroke-width':'1.4'}); ring.style.stroke='var(--wm-line)'; ring.setAttribute('class','wm-pulse'); g.appendChild(ring); }
    g.appendChild(el('circle',{cx:p._x,cy:p._y,r:R})).style.fill='var(--wm-line)';
    g.appendChild(el('circle',{cx:p._x,cy:p._y,r:R*0.4,fill:'#fff'}));
    if(storyMode && animate){ g.style.opacity='0'; }
    p._g=g;
    svg.appendChild(g);
    if(p.label && d.labels!=='none'){
      var chip=document.createElement('span');
      chip.className='wm-chip'+(p.major?' is-major':'')+(p.hub?' is-hub':'');
      chip.setAttribute('data-side', p.side||'above');
      chip.textContent=p.label;
      chip.dataset.x=p._x; chip.dataset.y=p._y;
      chip.style.left=((p._x-vb.x)/vb.w*100)+'%';
      chip.style.top=((p._y-vb.y)/vb.h*100)+'%';
      if(animate && !storyMode){ chip.style.opacity='0'; chip.style.transition='opacity .5s ease'; chip.style.transitionDelay=(0.4+i*0.15)+'s'; }
      else if(animate && storyMode){ chip.style.opacity='0'; }
      p._chip=chip;
      labels.appendChild(chip);
    }
  });
  if(animate && !flagMode && !storyMode) requestAnimationFrame(function(){ Array.prototype.forEach.call(labels.children,function(c){ c.style.opacity='1'; }); });

  /* collision pass — the recipe GUARANTEES the no-overlap invariant at every
     width (the gate checks it; this enforces it). When two visible chips would
     overlap, the lower-priority one hides: hub > major > rest, then DOM order. */
  function collide(){
    var chips=Array.prototype.slice.call(labels.children);
    chips.forEach(function(c){ c.removeAttribute('data-wm-hidden'); c.style.marginLeft=''; });
    var mr=root.getBoundingClientRect(); if(!mr.width) return; /* hidden doc: retried on resize/visibility */
    var vis=chips.filter(function(c){ return getComputedStyle(c).display!=='none'; });
    /* clamp into the map box first — a chip's px width doesn't scale with the
       artwork, so at narrow widths it can outgrow the frame padding */
    vis.forEach(function(c){
      var b=c.getBoundingClientRect(), dx=0;
      if(b.left<mr.left+3) dx=(mr.left+3)-b.left;
      else if(b.right>mr.right-3) dx=(mr.right-3)-b.right;
      if(dx) c.style.marginLeft=dx+'px';
    });
    var order=vis.map(function(c,i){
      return { c:c, i:i, r: c.classList.contains('is-hub')?0 : c.classList.contains('is-major')?1 : 2 };
    }).sort(function(a,b){ return a.r-b.r || a.i-b.i; });
    var kept=[];
    order.forEach(function(o){
      var b=o.c.getBoundingClientRect();
      var hit=kept.some(function(k){ return !(b.right<k.left||k.right<b.left||b.bottom<k.top||k.bottom<b.top); });
      if(hit) o.c.setAttribute('data-wm-hidden',''); else kept.push(b);
    });
  }
  collide(); /* sync — never gated behind a rAF a hidden tab would freeze */
  requestAnimationFrame(collide); /* settle pass after layout */
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ collide(); }); /* chip widths grow when the webfont lands */
  window.addEventListener('resize', function(){ requestAnimationFrame(collide); });
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) collide(); });

  /* hex chrome: focus interactions + the is-in reveal (drives the hx-* CSS) */
  if(flagMode){
    var hexSec=root.closest('.cmp-world-map')||root;
    function setFocus(id,on){
      hexSec.classList.toggle('hx-focus',on);
      Array.prototype.forEach.call(labels.querySelectorAll('.hx-chip'),function(c){ c.classList.toggle('is-active', on && c.getAttribute('data-id')===id); });
      Array.prototype.forEach.call(svg.querySelectorAll('.hx-leader'),function(l){ l.classList.toggle('is-lit', on && l.getAttribute('data-id')===id); });
    }
    ['mouseover','focusin'].forEach(function(ev){ labels.addEventListener(ev,function(e){ var c=e.target.closest('.hx-chip'); if(c) setFocus(c.getAttribute('data-id'),true); }); });
    ['mouseout','focusout'].forEach(function(ev){ labels.addEventListener(ev,function(e){ if(e.target.closest('.hx-chip')) setFocus(null,false); }); });
    var hxShown=false;
    function hxReveal(){ if(hxShown) return; hxShown=true; hexSec.classList.add('is-in'); }
    if('IntersectionObserver' in window){
      var hio=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ hxReveal(); hio.disconnect(); } }); },{threshold:.15});
      hio.observe(root);
    } else hxReveal();
  }

  /* bleed mode: cover the box — expand the auto-fit frame (centered, may run
     past the artwork; the edge fade absorbs it) to the box's aspect, then keep
     svg viewBox, artwork mask (px) and chip anchors in sync on every resize */
  if(bleed){
    var coverFrame=function(){
      var bw=root.clientWidth, bh=root.clientHeight; if(!bw||!bh) return;
      /* content-aware: reserve the zones of ALL overlaid content (header at the
         top, stat strips at the bottom, …) — the points compose into the free
         band between them, never behind text */
      var sec=root.closest('.cmp-world-map'), safeTop=0, safeBot=0;
      if(sec){
        var sr2=sec.getBoundingClientRect();
        var sibs=sec.querySelectorAll('.container-ds > :not(.wm-map):not(.wm-space)');
        Array.prototype.forEach.call(sibs, function(s){
          var r=s.getBoundingClientRect(); if(!r.height) return;
          var mid=(r.top+r.bottom)/2;
          if(mid < sr2.top+sr2.height/2) safeTop=Math.max(safeTop,(r.bottom-sr2.top)/sr2.height+.04);
          else safeBot=Math.max(safeBot,(sr2.bottom-r.top)/sr2.height+.04);
        });
        safeTop=Math.min(.55,Math.max(0,safeTop)); safeBot=Math.min(.55,Math.max(0,safeBot));
      }
      var free=Math.max(.18, 1-safeTop-safeBot);
      /* tight band → degrade chip density to the majors instead of colliding */
      if(free*bh < 320) root.setAttribute('data-wm-density','major');
      else root.removeAttribute('data-wm-density');
      var A=bw/bh, f={x:vb.x,y:vb.y,w:vb.w,h:vb.h};
      var needH=vb.h/free;
      f.y=vb.y-safeTop*needH; f.h=needH;
      if(f.w/f.h < A){ var nw=f.h*A; f.x-=(nw-f.w)/2; f.w=nw; }
      else { var nh=f.w/A, extra=nh-f.h, tShare=(safeTop+safeBot)>0 ? safeTop/(safeTop+safeBot) : .5;
        f.y-=extra*tShare; f.h=nh; }
      svg.setAttribute('viewBox', f.x+' '+f.y+' '+f.w+' '+f.h);
      var sc=bw/f.w;
      artLayers.forEach(function(a){ ['mask','-webkit-mask'].forEach(function(pre){
        a.style.setProperty(pre+'-size', (style.w*sc)+'px '+(style.h*sc)+'px');
        a.style.setProperty(pre+'-position', (-f.x*sc)+'px '+(-f.y*sc)+'px');
      }); });
      Array.prototype.forEach.call(labels.children, function(c){
        c.style.left=((parseFloat(c.dataset.x)-f.x)/f.w*100)+'%';
        c.style.top=((parseFloat(c.dataset.y)-f.y)/f.h*100)+'%';
      });
      requestAnimationFrame(collide);
    };
    coverFrame();
    if('ResizeObserver' in window){ new ResizeObserver(coverFrame).observe(root); }
    else window.addEventListener('resize', coverFrame);
  }

  /* story scrub: distribute the choreography across data-anim-window (default
     .04-.46 of the stage's scrub progress) — art fades, hub lands, arcs draw
     staggered, each point+chip reveals as its arc arrives. Self-driven from the
     .ess geometry (never via the engine's [data-anim] scan — init order). */
  if(storyMode){
    var essRoot=root.closest('[data-behavior="scroll-story"]');
    var W=(d.animWindow||'0.04-0.46').split('-').map(Number), wa=W[0], wb=W[1]||wa+0.4, ws=wb-wa;
    var items=[];
    artLayers.forEach(function(a){ if(animate) a.style.opacity='0'; items.push({set:function(k){ a.style.opacity=k; }, t0:wa, t1:wa+.2*ws}); });
    var n=arcs.length, st=n>1 ? Math.min(.06*ws, (ws*.4)/(n-1)) : 0, dur=.3*ws, a0=wa+.22*ws;
    arcs.forEach(function(a,i){
      var s=a0+i*st;
      items.push({set:function(k){ a.path.style.strokeDashoffset=a.len*(1-k); }, t0:s, t1:Math.min(wb,s+dur), ease:true});
      a._t1=Math.min(wb,s+dur);
    });
    pts.forEach(function(p,i){
      var t0;
      if(p.hub) t0=wa+.1*ws;
      else{
        /* reveal when the first arc touching this point finishes */
        var touch=null;
        routes.forEach(function(r,ri){ if(touch===null && (r[0]===p.id||r[1]===p.id) && arcs[ri]) touch=arcs[ri]._t1; });
        t0 = touch!=null ? Math.max(wa,touch-.06*ws) : a0+i*st;
      }
      var t1=Math.min(wb,t0+.08*ws);
      if(p._g) items.push({set:function(k){ p._g.style.opacity=k; }, t0:t0, t1:t1});
      if(p._chip) items.push({set:function(k){ p._chip.style.opacity=k; }, t0:t0, t1:t1});
    });
    var settle=function(){ items.forEach(function(it){ it.set(1); }); };
    if(!animate || !essRoot){ settle(); }
    else{
      var easeFn=function(x){ return 1-Math.pow(1-x,3); };
      var lastP=-1;
      var applyP=function(){
        var sc=essRoot.offsetHeight-window.innerHeight;
        var p=sc<=0?1:Math.max(0,Math.min(1,-essRoot.getBoundingClientRect().top/sc));
        if(p===lastP) return; lastP=p;
        items.forEach(function(it){
          var k=(p-it.t0)/(it.t1-it.t0); k=k<0?0:k>1?1:k;
          it.set(it.ease?easeFn(k):k);
        });
      };
      applyP();
      window.addEventListener('scroll', applyP, {passive:true});
      if(window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', applyP);
      window.addEventListener('resize', function(){ lastP=-1; applyP(); });
    }
    return; /* story never runs the self-playing draw loop */
  }

  if(!animate || mode!=='draw' || !arcs.length) return;

  /* draw loop (baked timing), paused off-screen */
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
}

/* world-map — animated SVG route arcs + city dots. rAF-driven (no SMIL, no libs).
   v2 contract above (data-points); the data-dots path below is the legacy shape,
   kept until the page sweep completes. Overlay uses slice so it tracks the base. */
DS.recipe('world-map', function (root) {
  if(root.dataset.points) return wmV2(root);
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
DS.recipe('synced-slider', function (root) {
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
    if (props.opacity) {
      var op = v('opacity', 1);
      el.style.opacity = op;
      // a faded-out beat must not catch clicks meant for the visible one stacked under it
      el.style.pointerEvents = parseFloat(op) < 0.05 ? 'none' : '';
    }
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

    // Optional background scrub (scroll-story-scrub)
    var video = null, canvas = null, ctx = null, count = 0, startIdx = 1, pathTpl = '', pad = 3, imgs = null, cur = 0, started = false, step = 1, drawn = -1;
    function src(i) { return pathTpl.replace(/#+/, String(i).padStart(pad, '0')); }
    // a decoded frame is safe to paint without a main-thread decode stall
    function ready(im) { return im && im._ok; }
    // nearest decoded frame to i, so a frame still in flight never blanks or hitches the scrub
    function nearest(i) { if (ready(imgs[i])) return i; for (var d = 1; d < count; d++) { if (i - d >= 0 && ready(imgs[i - d])) return i - d; if (i + d < count && ready(imgs[i + d])) return i + d; } return -1; }
    function ensureSize() { var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.offsetWidth * dpr), h = Math.round(canvas.offsetHeight * dpr); if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; } }
    // data-fit="auto" (opt-in): on a portrait / narrow stage, a landscape
    // sequence is AUTO-FRAMED instead of cover-cropped. Each frame is measured
    // once on load (flat bg colour + the bounding box of what differs from it);
    // full-bleed frames still cover, object frames fit their devices into the
    // band set by data-fit-band ("top,bottom" as stage fractions), and the
    // per-frame transform is averaged over neighbouring frames so the camera
    // glides instead of jittering. Text then owns the zone above the band.
    var fitMode = root.getAttribute('data-fit') === 'auto', fitBand = (root.getAttribute('data-fit-band') || '0.4,0.9').split(',').map(parseFloat), probe = null;
    var fitMax = parseFloat(root.getAttribute('data-fit-max')) || 768;
    function fitOn() { return fitMode && canvas.offsetWidth < fitMax && canvas.offsetHeight > canvas.offsetWidth; }
    function analyse(im) {
      if (im._fit !== undefined) return im._fit;
      im._fit = null;
      try {
        var pw = 160, ph = Math.max(1, Math.round(pw * im.naturalHeight / im.naturalWidth));
        if (!probe) probe = document.createElement('canvas');
        probe.width = pw; probe.height = ph; var pc = probe.getContext('2d', { willReadFrequently: true });
        pc.drawImage(im, 0, 0, pw, ph); var d = pc.getImageData(0, 0, pw, ph).data;
        var px = function (x, y) { var o = (y * pw + x) * 4; return [d[o], d[o + 1], d[o + 2]]; };
        var cs = [px(1, 1), px(pw - 2, 1), px(1, ph - 2), px(pw - 2, ph - 2)];
        var bg = [0, 1, 2].map(function (k) { return Math.round((cs[0][k] + cs[1][k] + cs[2][k] + cs[3][k]) / 4); });
        var spread = cs.reduce(function (m, c) { return Math.max(m, Math.abs(c[0] - bg[0]) + Math.abs(c[1] - bg[1]) + Math.abs(c[2] - bg[2])); }, 0);
        var bleed = spread > 30 || (bg[0] + bg[1] + bg[2]) / 3 < 190;
        var x0 = pw, y0 = ph, x1 = -1, y1 = -1;
        if (!bleed) for (var y = 0; y < ph; y++) for (var x = 0; x < pw; x++) { var o = (y * pw + x) * 4; if (Math.abs(d[o] - bg[0]) + Math.abs(d[o + 1] - bg[1]) + Math.abs(d[o + 2] - bg[2]) > 45) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
        var k = im.naturalWidth / pw;
        if (x1 < 0) bleed = true;
        im._fit = { bg: 'rgb(' + bg.join(',') + ')', rgb: bg.join(','), bleed: bleed, x: x0 * k, y: y0 * k, w: (x1 - x0 + 1) * k, h: (y1 - y0 + 1) * k };
      } catch (e) { /* tainted canvas (file://) : fall back to cover */ }
      return im._fit;
    }
    function frameT(im, W, H) {
      var f = analyse(im), iw = im.naturalWidth, ih = im.naturalHeight, s;
      if (!f || f.bleed) { s = Math.max(W / iw, H / ih); return { s: s, ox: (W - iw * s) / 2, oy: (H - ih * s) / 2 }; }
      var padX = W * 0.06, tTop = H * fitBand[0], tBot = H * fitBand[1], tw = W - padX * 2, th = tBot - tTop;
      var rw = f.w * 1.06, rh = f.h * 1.06, cx = f.x + f.w / 2, cy = f.y + f.h / 2;
      s = Math.min(tw / rw, th / rh, Math.max(W / iw, H / ih));
      return { s: s, ox: W / 2 - cx * s, oy: (tTop + tBot) / 2 - cy * s };
    }
    function drawFit(im, W, H) {
      var R = 7, n = 0, ls = 0, ox = 0, oy = 0;
      for (var j = Math.max(0, cur - R); j <= Math.min(count - 1, cur + R); j++) {
        var m = imgs[j]; if (!ready(m) || (m._fit === undefined && j !== cur)) continue;
        var t = frameT(m, W, H), wgt = R + 1 - Math.abs(j - cur);
        ls += Math.log(t.s) * wgt; ox += t.ox * wgt; oy += t.oy * wgt; n += wgt;
      }
      var s = Math.exp(ls / n), f = analyse(im);
      var iw = im.naturalWidth, ih = im.naturalHeight, dx = ox / n, dy = oy / n, dw = iw * s, dh = ih * s;
      ctx.fillStyle = (f && f.bg) || '#fff'; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(im, dx, dy, dw, dh);
      // feather any frame edge that lands inside the stage into the backdrop
      if (f && f.rgb) {
        var F = Math.round(Math.min(W, H) * 0.12), c0 = 'rgba(' + f.rgb + ',1)', c1 = 'rgba(' + f.rgb + ',0)';
        var edge = function (x0, y0, x1, y1, rx, ry, rw, rh) { var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh); };
        if (dy > 0) edge(0, dy, 0, dy + F, 0, dy - 1, W, F + 1);
        if (dy + dh < H) edge(0, dy + dh, 0, dy + dh - F, 0, dy + dh - F, W, F + 1);
        if (dx > 0) edge(dx, 0, dx + F, 0, dx - 1, 0, F + 1, H);
        if (dx + dw < W) edge(dx + dw, 0, dx + dw - F, 0, dx + dw - F, 0, F + 1, H);
      }
    }
    function draw() { var k = nearest(cur); if (k < 0 || k === drawn) return; var im = imgs[k], c0 = cur; cur = k; drawn = k; ensureSize(); var W = canvas.width, H = canvas.height; root.classList.toggle('is-fit', fitOn()); if (fitOn()) { drawFit(im, W, H); cur = c0; return; } cur = c0; var s = Math.max(W / im.naturalWidth, H / im.naturalHeight); ctx.clearRect(0, 0, W, H); ctx.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); }
    // Fit analysis (a getImageData pass per frame) runs in idle time, never inside a scroll frame.
    var aq = [], aBusy = false;
    function pumpAnalyse() { if (aBusy || !aq.length) return; aBusy = true; var ric = window.requestIdleCallback || function (f) { return setTimeout(f, 16); }; ric(function () { aBusy = false; var im = aq.shift(); if (im) { analyse(im); drawn = -1; } pumpAnalyse(); }); }
    function startPreload() {
      if (started || !canvas) return; started = true;
      // small-screen sequence (data-path-sm / data-step-sm): lighter frames, fewer of them
      var sm = root.getAttribute('data-path-sm');
      if (sm && canvas.offsetWidth < fitMax && canvas.offsetHeight > canvas.offsetWidth) { pathTpl = sm; pad = (sm.match(/#+/) || ['###'])[0].length; step = parseInt(root.getAttribute('data-step-sm') || '1', 10) || 1; count = Math.floor((count - 1) / step) + 1; imgs = new Array(count); }
      for (var i = 0; i < count; i++) { (function (i) {
        var im = new Image(); im.decoding = 'async';
        im.onload = function () {
          var done = function () { im._ok = true; if (fitMode) { aq.push(im); pumpAnalyse(); } if (Math.abs(i - cur) <= 7) { drawn = -1; draw(); } };
          if (im.decode) im.decode().then(done, done); else done();
        };
        im.src = src(startIdx + i * step); imgs[i] = im;
      })(i); }
    }
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
      return;
    }

    var lastP = -1;
    function update() { var p = progress(); if (p === lastP) return; lastP = p; for (var i = 0; i < els.length; i++) applyEl(els[i].el, els[i].props, p); if (scrub) updateScrub(p); }
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
    (function loop() { update(); requestAnimationFrame(loop); })();
    window.addEventListener('scroll', update, { passive: true });
    if (window.DS && window.DS.lenis && window.DS.lenis.on) window.DS.lenis.on('scroll', update);
    window.addEventListener('resize', function () { lastP = -1; if (canvas) { ensureSize(); drawn = -1; draw(); } });
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
    var outer = root.querySelector('.cst-outer, [data-scroll-outer]');
    var track = root.querySelector('[data-track]');
    var wrap  = root.querySelector('.cst-trackwrap, [data-scroll-wrap]');
    if(!outer || !track || !wrap) return;
    var maxX = 0;
    var clamp = function(v,a,b){ return v<a?a:(v>b?b:v); };
    /* Short screens (a phone held landscape): when the pinned head + cards do
       not fit one screen, the section unpins (.is-swipe) and the row swipes
       natively instead of panning on scroll (device audit 2026-10-14). */
    var pin = root.querySelector('.cd-scroll-pin');
    var swipe = false;
    function fitMode(){
      if(!pin) return;
      root.classList.remove('is-swipe');
      var cs = getComputedStyle(pin), kids = pin.children, need = 0;
      for(var i=0;i<kids.length;i++){ need += Math.max(kids[i].getBoundingClientRect().height, kids[i].scrollHeight); }  /* scrollHeight: the flex row shrinks the card strip, its cards do not */
      need += (parseFloat(cs.rowGap) || 0) * Math.max(0, kids.length - 1);
      var room = pin.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
      var tooTall = need > room + 2;
      if(tooTall !== swipe || tooTall){
        swipe = tooTall;
        root.classList.toggle('is-swipe', swipe);
        if(swipe){
          track.style.transform = '';
          if(!wrap.hasAttribute('data-drag-bound')){ wrap.setAttribute('data-drag-scroll',''); if(window.DS && DS.refresh) DS.refresh(root); }
        }
      }
    }
    function measure(){
      fitMode();
      if(swipe){ maxX = 0; outer.style.removeProperty('--st-len'); return; }
      /* The track starts at the container inset inside the full-bleed wrap, so
         the pan must cover that offset too or the last card never clears the
         viewport edge. Read the offset with the transform cleared (same frame,
         nothing paints), then restore. */
      var prev = track.style.transform;
      track.style.transform = 'none';
      var wr = wrap.getBoundingClientRect();
      var lastEl = track.lastElementChild;
      var lr = (lastEl || track).getBoundingClientRect();
      track.style.transform = prev;
      /* Travel = distance from the wrap's start edge to the last card's far
         edge, plus the track's end padding (the end stop — scrollWidth does
         NOT include inline-end padding on a non-scrolling element), minus the
         viewport. Measured from the last child's rect so container insets and
         card geometry are all accounted for, in either direction. */
      var padEnd = parseFloat(getComputedStyle(track).paddingInlineEnd) || 0;
      var extent = (window.DS && DS.isRTL && DS.isRTL(track)) ? (wr.right - lr.left) : (lr.right - wr.left);
      maxX = Math.max(0, extent + padEnd - wrap.clientWidth);
      /* Size the scrub distance to the actual overflow (1px scroll = 1px pan);
         the CSS 300vh is only the pre-measure fallback. */
      if (maxX > 0) outer.style.setProperty('--st-len', 'calc(100vh + ' + Math.round(maxX) + 'px)');
      else outer.style.removeProperty('--st-len');
    }
    function frame(){
      if(swipe){ track.style.transform = ''; return; }
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
    /* is-mobile-swipe axis: below 768 the section is unpinned (CSS) and the
       track swipes natively — the scrub transform must stand down there, and
       mouse users get the DS dragScroll behavior (scrollbar is hidden). */
    if(root.classList.contains('is-mobile-swipe')){
      var mq=window.matchMedia('(min-width: 768px)');
      var baseFrame=frame;
      frame=function(){ if(!mq.matches){ track.style.transform=''; return; } baseFrame(); };
      var syncMode=function(){
        if(!mq.matches){
          if(!wrap.hasAttribute('data-drag-bound')){ wrap.setAttribute('data-drag-scroll',''); if(window.DS && DS.refresh) DS.refresh(root); }
        } else { wrap.scrollLeft = 0; }
        frame();
      };
      syncMode();
      if(mq.addEventListener) mq.addEventListener('change', syncMode); else if(mq.addListener) mq.addListener(syncMode);
    }
  });

  /* recipe: scroll-tab — sticky visual + scroll-linked steps. Whichever step
     sits nearest the viewport middle becomes active, crossfading its paired
     image and updating the step counter. */
  DS.recipe('scroll-showcase', function (root) {
    var imgs=root.querySelectorAll(".ss-img"); var num=root.querySelector("[data-ss-num]");
    var steps=root.querySelectorAll(".ss-step"); var cur=-1;
    // the total always matches the steps on the page, whatever the markup says
    if(num && num.nextSibling && num.nextSibling.nodeType===3) num.nextSibling.textContent=" / "+steps.length;
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

  /* recipe: fan-in — generalized process-cards entry: items start scattered
     (fanned, blurred, transparent) and assemble into the grid on first view.
     Items: [data-fan] or .cd-card or .p-card. Desktop only; reduced-motion /
     no-IO assembles immediately. */
  DS.recipe('fan-in', function (root) {
    var cards=[].slice.call(root.querySelectorAll('[data-fan], .cd-card, .p-card'));
    if(!cards.length) return;
    var lg=window.matchMedia('(min-width:1024px)').matches;
    var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var scatter=['translateX(70%) translateY(14px) rotate(-13deg)','translateX(24%) translateY(5px) rotate(-5deg)','translateX(-24%) translateY(5px) rotate(5deg)','translateX(-70%) translateY(14px) rotate(13deg)'];
    root.classList.add('fan-armed');
    if(lg && !reduce){cards.forEach(function(c,i){c.style.transition='none';c.style.transform=scatter[i%scatter.length];c.style.zIndex=10+i;});void root.offsetWidth;}
    function assemble(){root.classList.add('fan-in');requestAnimationFrame(function(){cards.forEach(function(c){c.style.transition='';c.style.transform='';});});}
    if(reduce){assemble();return;}
    try{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){assemble();io.disconnect();}});},{threshold:.2});io.observe(root);}catch(e){assemble();}
  });

  /* inViewFilm — shared by the film recipes (media-chat, film-stats-band).
     video[data-src] (data-src-m = phone cut, under 768px) loads only when its
     host reaches the viewport, plays while a quarter of the host is in view
     and pauses otherwise. The pause button (hidden in markup) appears once
     the film plays and toggles it; a user pause sticks. Callers skip it under
     reduced motion, so the poster stays. */
  function inViewFilm(v, host, btn) {
    if (!v || !('IntersectionObserver' in window)) return;
    var userPaused = false, inView = false, label = btn && btn.querySelector('.sr-only');
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    // a play() refused while the media was still loading, or while the tab was
    // hidden, is retried once the film can play / the tab is visible again
    var resume = function () { if (inView && !userPaused && v.paused && !document.hidden) play(); };
    v.addEventListener('canplay', resume);
    document.addEventListener('visibilitychange', resume);
    var load = function () {
      if (v.getAttribute('src')) return;
      var m = v.getAttribute('data-src-m');
      v.src = (m && window.matchMedia('(max-width: 767px)').matches) ? m : v.getAttribute('data-src');
    };
    v.addEventListener('playing', function () { v.classList.add('is-playing'); if (btn) btn.hidden = false; });
    if (btn) btn.addEventListener('click', function () {
      userPaused = !userPaused;
      if (userPaused) v.pause(); else play();
      btn.classList.toggle('is-pause', !userPaused); btn.classList.toggle('is-play', userPaused);
      if (label) label.textContent = userPaused ? 'Play video' : 'Pause video';
    });
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) load();
        inView = e.intersectionRatio >= 0.25;
        if (inView) { if (!userPaused) play(); }
        else if (v.getAttribute('src')) v.pause();
      });
    }, { threshold: [0, 0.25] }).observe(host);
  }

  /* recipe: media-chat — the Media Split, Live Chat block (cmp-media-chat-split).
     Film: see inViewFilm. Chat: [data-chat-step] items reveal in order on
     first view; a step holding .mcs-typing shows the typing dots first. The
     root is armed (steps hidden) only when it can animate, so JS-off /
     reduced motion show the whole thread and the poster. */
  DS.recipe('media-chat', function (root) {
    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    var v = root.querySelector('video[data-src]');
    if (v) inViewFilm(v, v.closest('.mcs-media') || root, root.querySelector('[data-mcs-pause]'));

    var steps = [].slice.call(root.querySelectorAll('[data-chat-step]'));
    if (!steps.length) return;
    root.classList.add('mcs-armed');
    steps.forEach(function (s) { if (s.querySelector('.mcs-typing')) s.setAttribute('data-typing', ''); });
    var io = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      var t = 0;
      steps.forEach(function (s) {
        setTimeout(function () { s.classList.add('is-in'); }, t);
        if (s.hasAttribute('data-typing')) { t += 900; setTimeout(function () { s.removeAttribute('data-typing'); }, t); }
        t += 800;
      });
    }, { threshold: 0.4 });
    io.observe(root.querySelector('.mcs-chat') || root);
  });

  /* recipe: expand-duo — the Expand Duo block (cmp-expand-duo). Hover, focus
     (keyboard users tabbing into a pane's link) or tap opens a pane: it gets
     .is-active and widens; the other narrows. The root is armed (collapse
     states on) only when motion is allowed; the CSS applies them from 768px
     up, so phones, JS-off and reduced motion keep both panes fully open. */
  DS.recipe('expand-duo', function (root) {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var panes = [].slice.call(root.querySelectorAll('[data-exd-pane]'));
    if (panes.length < 2) return;
    if (!panes.some(function (p) { return p.classList.contains('is-active'); })) panes[0].classList.add('is-active');
    var open = function (p) { panes.forEach(function (x) { x.classList.toggle('is-active', x === p); }); };
    panes.forEach(function (p) {
      p.addEventListener('mouseenter', function () { open(p); });
      p.addEventListener('focusin', function () { open(p); });
      p.addEventListener('click', function () { if (!p.classList.contains('is-active')) open(p); });
    });
    root.classList.add('exd-armed');
  });

  /* recipe: film-stats-band — the Film Stats Band block (cmp-film-stats-band).
     Only the film moves here (see inViewFilm); the figures count up through
     the runtime's [data-countup] tier. Reduced motion: poster only. */
  DS.recipe('film-stats-band', function (root) {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var v = root.querySelector('video[data-src]');
    if (v) inViewFilm(v, v.closest('.fsb-film') || root, root.querySelector('[data-fsb-pause]'));
  });

  /* recipe: tabs-desk — the Tabs - Desk reel block (cmp-tabs-desk). Moved here
     on 2026-10-10 from the block's inline <script> (port of the newer shared
     assets/webxv2/js/tabs-desk.js) so instances receive master changes. Chips pick a
     desk at every size (aria-pressed); with motion on, the pinned track's
     scroll rolls the reel, photo and desk card. Sets --td-n (desk count, pin
     length) and --td-hdr (the sticky site header's height, so the pin starts
     below it). Phones/tablets: the copy and CTAs move after the pinned track.
     Optional per-desk CTA: chips may carry data-td-href (+ data-td-label,
     + data-td-target) and the [data-td-cta] link follows the selected desk. Guarded by __td, so it
     is safe on pages that still load tabs-desk.js. */
  DS.recipe('tabs-desk', function (root) {
    if (root.__td) return; root.__td = true;
    var mqPin = window.matchMedia('(prefers-reduced-motion: no-preference)');
    var mqMob = window.matchMedia('(max-width: 1023px) and (prefers-reduced-motion: no-preference)');
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var track = root.querySelector('.td-track'), reel = root.querySelector('.td-reel');
    if (!track || !reel) return;
    var words = [].slice.call(reel.children);
    var chips = [].slice.call(root.querySelectorAll('[data-td-intent]'));
    var shots = [].slice.call(root.querySelectorAll('.td-shot'));
    var facts = [].slice.call(root.querySelectorAll('.td-fact > div'));
    shots.forEach(function (el) { var u = el.getAttribute('data-bg'); if (u && !el.style.backgroundImage) el.style.backgroundImage = 'url("' + u + '")'; });
    var n = words.length, cur = -1, cta = root.querySelector('[data-td-cta]');
    root.style.setProperty('--td-n', n);
    // the pin starts below whatever part of the site header stays on screen
    // (the fixed / sticky bar, e.g. .ish-brand), not the whole header block
    var header = document.querySelector('.cmp-site-header'), bar = null;
    var setHdr = function () {
      if (header && !bar) {
        var els = [header].concat([].slice.call(header.querySelectorAll('*')));
        for (var k = 0; k < els.length; k++) { if (/fixed|sticky/.test(getComputedStyle(els[k]).position)) { bar = els[k]; break; } }
      }
      root.style.setProperty('--td-hdr', (bar ? Math.round(bar.getBoundingClientRect().height) : 0) + 'px');
    };
    setHdr();
    function show(i) {
      i = clamp(i, 0, n - 1);
      if (i === cur) return;
      cur = i;
      reel.style.setProperty('--i', i);
      [words, shots, facts].forEach(function (set) { set.forEach(function (el, k) { el.classList.toggle('is-on', k === i); }); });
      facts.forEach(function (f, k) { if (k === i) f.removeAttribute('aria-hidden'); else f.setAttribute('aria-hidden', 'true'); });
      chips.forEach(function (c, k) { c.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      if (cta && chips[i] && chips[i].getAttribute('data-td-href')) {
        cta.setAttribute('href', chips[i].getAttribute('data-td-href'));
        if (chips[i].getAttribute('data-td-label')) cta.textContent = chips[i].getAttribute('data-td-label');
        // data-td-target="_blank" on a chip opens that desk's link in a new tab
        var tg = chips[i].getAttribute('data-td-target');
        if (tg) { cta.setAttribute('target', tg); cta.setAttribute('rel', 'noopener'); } else { cta.removeAttribute('target'); cta.removeAttribute('rel'); }
      }
    }
    function progress() {
      if (!mqPin.matches) return;
      if (header && !bar) setHdr();
      var r = track.getBoundingClientRect(), travel = track.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      show(Math.floor(clamp(-r.top / travel, 0, 0.9999) * n));
    }
    function jump(i) {
      if (!mqPin.matches) { show(i); return; }
      var travel = track.offsetHeight - window.innerHeight;
      var y = window.pageYOffset + track.getBoundingClientRect().top + ((i + 0.5) / n) * travel;
      if (window.DS && DS.lenis && DS.lenis.scrollTo) DS.lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: 'smooth' });
      show(i);
    }
    chips.forEach(function (c, k) { c.addEventListener('click', function () { jump(k); }); });
    var panel = root.querySelector('.td-panel'), copy = root.querySelector('.td-copy');
    var after = document.createElement('div'); after.className = 'container-ds td-after';
    track.parentNode.insertBefore(after, track.nextSibling);
    function place() {
      if (!panel || !copy) return;
      if (mqMob.matches) { if (panel.parentNode !== after) after.appendChild(panel); }
      else if (panel.parentNode !== copy) copy.appendChild(panel);
    }
    place();
    if (mqMob.addEventListener) mqMob.addEventListener('change', function () { place(); progress(); });
    // the blank is one clipped line: shrink the sentence if the longest desk is wider than the column
    var sentence = root.querySelector('.td-sentence'), slot = root.querySelector('.td-slot');
    function fit() {
      if (!sentence || !slot) return;
      sentence.style.fontSize = '';
      var avail = slot.clientWidth, widest = 0;
      words.forEach(function (w) { widest = Math.max(widest, w.scrollWidth); });
      if (avail > 0 && widest > avail) sentence.style.fontSize = Math.floor(parseFloat(getComputedStyle(sentence).fontSize) * (avail / widest) * 0.98) + 'px';
    }
    fit();
    window.addEventListener('resize', function () { fit(); setHdr(); progress(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('scroll', progress, { passive: true });
    show(0); progress();
  });

  /* recipe: app-download — the App Download Panel (cmp-app-download-panel).
     QR: each [data-qr-os] chip carries data-qr-src / data-qr-alt; a click
     swaps the [data-qr-img] and sets aria-pressed. Phones: [data-app-link]
     points at the visitor's own store (data-ios / data-android). Float: the
     phone and chip bob (.adp-float) while the panel is in view and the tab is
     visible, never under reduced motion or on a static instance (.is-static).
     QR and store link work regardless. */
  DS.recipe('app-download', function (root) {
    [].forEach.call(root.querySelectorAll('[data-qr]'), function (tile) {
      var img = tile.querySelector('[data-qr-img]'), btns = [].slice.call(tile.querySelectorAll('[data-qr-os]'));
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          if (img && b.getAttribute('data-qr-src')) { img.src = b.getAttribute('data-qr-src'); img.alt = b.getAttribute('data-qr-alt') || img.alt; }
        });
      });
    });
    var android = /android/i.test(navigator.userAgent);
    [].forEach.call(root.querySelectorAll('[data-app-link]'), function (a) {
      var href = a.getAttribute(android ? 'data-android' : 'data-ios');
      if (href) a.setAttribute('href', href);
      a.setAttribute('aria-label', 'Download the app on ' + (android ? 'Google Play' : 'the App Store'));
    });
    if (root.classList.contains('is-static') || window.matchMedia('(prefers-reduced-motion:reduce)').matches || !('IntersectionObserver' in window)) return;
    var inView = false, settled = false;
    var sync = function () { root.classList.toggle('adp-float', settled && inView && !document.hidden); };
    new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      if (inView && !settled) setTimeout(function () { settled = true; sync(); }, 700);
      sync();
    }, { threshold: 0.15 }).observe(root);
    document.addEventListener('visibilitychange', sync);
  });

  /* recipe: markets-map — World Map - V2 (hex-reach-map block). Scroll-scrubbed
     dot-matrix world map: the headline docks, the camera flies chapter by
     chapter (data-view boxes), market pins pop and their countries light up,
     then the closing overview. Ported 2026-10-12 from the block's inline
     script (one instance per root, no IDs). Markets, chapters and copy are
     markup: .cm__markets li[data-country|data-lon|data-lat|data-chapter|
     data-place|data-home]. Options: .cm__eyebrow (fades in as the headline
     docks); .cm__count (rolling market counter) or .cm__figs (static stats
     row) or neither. WebGL with a 2D canvas fallback; reduced motion renders
     the final overview with no scrub. Land-dot grid + country names below. */
  var CM_DOTS = '1F023h1J0i3h220f3h2o0V2W3l022W44011r470b1r4M011e4X011e5C021e5H041e5M011e|1K013h1M093h1X053h230a3h2e013h2n0X2W3X031r41011r43031r49081r5D011e5F081e|1L033h1P093h1Z0a3h2o0W2W3X061r44031r4a021r4d031r5G071e5Q011e|1x043h1N093h1Y0b3h2a013h2k102W3Y051r44041r5G071e5O021e5R011e|1A053h1H013h1O063h1W043h210a3h2i112W3Y0d1r5L011e5P051e|1o053h1y073h1H043h1O033h1S013h1V0e3h2e142W3X011r3Z021r42011r44041r49021r5N071e|1E023h1J023h1Q013h1S013h1V013h1X013h1Z0b3h2e142W43051r4a031r5N021e5W011e|1m013h1o033h1B023h1E023h1I013h1V013h1X033h21063h2f122W3i012W40061r4a041r|1o043h1y013h1K033h1Q023h1V023h1Y093h2i012W2k012W2m0X2W41061r4a041r5R031e|1g043h1y013h1V083h2i132W41041r5z011e5P051e|1f053h1J033h1T0e3h2h122W3k022W43021r57021e5P081e|1d043h1i023h1s023h1E013h1G013h1K063h1R0a3h22043h2j0Y2W3k012W55041e5O081e5X061e|1c053h1l023h1s033h1B033h1F033h1L013h1O053h23023h2j072W2r0S2W50011e52061e5H031e5N0h1e|1e013h1h013h1j063h1s033h1w013h1z013h1B013h1D053h1L013h1O043h2u0P2W4X081e5E0q1e6z031e6D021e|1g023h1j013h1l063h1u043h1B033h1F033h1L013h1P033h1T013h1Y063h2w0O2W4W061e5B0t1e6x011e6z061e6H021e|1i043h1n0a3h1y023h1E033h1J043h1O0h3h2w0M2W3j012W3l012W4U051e5y0w1e6y071e6G031e6K031e|1o053h1K033h1P0g3h2y0M2W4U051e5w0y1e6A021e6D041e6N031e|1m043h1K013h1R013h1T0b3h2y0M2W4S051e5w0v1e|1a063h1h013h2z0K2W4S041e5w0u1e63011e6D011e|1a0a3h1E033h1L063h2z0J2W4Q051e5x0r1e60011e63011e6i011e6E011e|1a0b3h1w033h1D053h1L063h1U043h20033h24043h2z0E2W3f042W4R041e5i011e5p0y1e600b1e6h031e6D041e|190a3h1l013h1u013h1x013h1E033h1K063h1T033h1X063h24053h2A0F2W4P041e5b021e5o071e5w0p1e5X0e1e6h071e|19093h1j043h1o023h1s013h1v033h1C013h1F043h1L043h1T033h1Y063h25013h28023h2B0B2W3d042W4P041e5a031e5h011e5m011e5p0v1e5V0u1e|18083h1h093h1r023h1u043h1C073h1L023h1S043h1X063h26043h2A0D2W3e032W4O041e59051e5h011e5k011e5o101e6C081e|18073h1h0d3h1v043h1E053h1L023h1S053h1Y0d3h2A0F2W4O041e59051e5h011e5l041e5r0Y1e6D071e6L041e|19053h1g0e3h1v043h1F033h1K023h1R053h1X0e3h2A022W2D0D2W4N051e58061e5f021e5i071e5s0X1e6s011e6C071e6K041e|00031e1b033h1i013h1l0e3h1G013h1L033h1S063h1Z0h3h2B012W2D0z2W3d032W4Q031e58051e5f031e5k151e6t021e6w031e6A0g1e7r011e|00021e0t020h1h0i3h1J053h1S013h1V0j3h2F0w2W3e032W4f011r4i011r4P041e56081e5f0b1e5s0Y1e6s0q1e6W031e7q021e|0q0a0h1i053h1o0c3h1K053h1T0n3h2h023h2B032W2F0u2W3a032W3f012W3h012W4c011r4e021r4i031r4T021e58061e5h0b1e5t1z1e|0o0h0h15013h1l023h1q0c3h1J063h1W0m3h2j013h2B012W2D0x2W3c012W4b0b1r4W011e57071e5g1M1e|0n0q0h11023h15023h19013h1j0l3h1K053h21023h25013h280d3h2B032W2H0z2W47011r4a071r4h022K4j021r4o011e4X021e57071e5g1M1e7d011e7g031e|0m0s0h0O023h0W013h0Y023h11063h18013h1b033h1j0h3h1G023h1M043h1X043h290a3h2C022W2G0y2W45011r47091r4g042K4k011r4l031e4Y051e58061e5f1O1e74061e7b011e7g091e|0m0s0h0O043h0V0m3h1o083h1x063h1G043h1M053h1Y053h26013h28013h2a0a3h2H0w2W43011r45051r4a012K4b051r4g042K4k011r4l081e4J031e4Z061e59051e5g021e5j1V1e7g0b1e|00011e0i0w0h0O0y3h1n063h1w013h1H033h1N043h1S023h1Y053h2b073h2G0v2W41011r43011r45041r49010N4a012K4b021r4d012K4e011r4f052K4k0b1e4J011e4P011e4V021e4Y091e59051e5g031e5k1J1e740o1e|00031e0i0w0h0O0z3h1u043h1I013h1N043h1S033h1X053h2d083h2D022W2G0s2W42011r44031r47060N4d072K4k0d1e4E021e4N011e4P011e4S051e4Y0h1e5h031e5l271e|00051e0j0v0h0O0x3h1v063h1G0e3h1V073h28023h2b0b3h2n013h2C0s2W3Z011r44011r45080N4d082K4l0d1e4D041e4K0v1e5h2b1e|00071e0l0t0h0O0G3h1v0f3h1L0a3h1W073h28033h2e0b3h2C0r2W43011r44090N4d092K4m0e1e4E011e4J0v1e5h041e5m261e|00061e0l0t0h0O0G3h1v0f3h1L0h3h2e0c3h2C0q2W42021r44090N4d072K4k0g1e4D021e4I0v1e5g2c1e|00071e08031e0o0q0h0O1e3h2e0e3h2D0p2W41031r440a0N4e072K4l041e4q0a1e4E0w1e5b021e5f2d1e|000c1e0j020h0o0q0h0O183h1Y013h2c0g3h2C012W2E0m2W3f012m3o012m40031r430a0N4d082K4l051e4s071e4B011e4D0y1e5e2e1e|00011e020b1e0h0x0h0O193h1Z013h2c093h2o033h2D0j2W2X012W3f012m3h012m3j072m3Z031r420c0N4e082K4m061e4A2S1e|00011e02091e0f0z0h0O143h1T023h1W023h2c083h2n033h2D0h2W3d042m3j082m3Z021r410a0N4f062K4l061e4y2U1e|00011e06041e0i0w0h0O183h1X033h280d3h2o023h2E0g2W3h0b2m3Z031r42090N4g062K4m061e4z2T1e|07021e0h060h0p0p0h0O173h1W053h270g3h2E0f2W3g0b2m3Y031r41090N4e072K4l071e4u031e4y2P1e7p011e|09011e0p0p0h0O173h1X053h28013h2d0b3h2F0e2W3h092m3X041r410a0N4e082K4m071e4w2T1e|0p0p0h0O0Z3h1O033h1V053h21023h2e0a3h2F0e2W3g012m3i062m3V041r3Z0a0N4d092K4m081e4v2V1e|0b020h0o0q0h0O123h1X023h28013h2g033h2l043h2G0d2W3k022m3U021r3X021r3Z0a0N4c0a2K4m351e|0k0u0h0O123h2g043h2m023h2G0b2W3S061r3Y080N4b0c2K4n341e|0k0u0h0O113h20023h2i043h2H0a2W3T061r3Z070N4a0d2K4n2K1e780g1e7p021e|0i0w0h0O103h1Z013h24013h27063h2k023h2H0a2W3P0a1r3Z060N4a0c2K4m2K1e770f1e|0i0w0h0O103h27083h2I092W3Q091r3Z070N4b0b2K4m2D1e73031e780c1e|0i0w0h0O0Y3h27083h2I082W3P0a1r3Z060N4a0a2K4k2E1e72021e770b1e|0l0g0h0C040h0H070h0O0Y3h270b3h2J022W2M052W3Q091r3Z060N4b092K4k2D1e73011e770b1e|09010h0j030h0n0d0h0B040h0I060h0O0X3h270a3h2j013h2N022W3P0a1r3Z070N4b052K4j2D1e74071e7e011e|0h020h0l0e0h0B040h0O020h0R0V3h28093h2o013h2O022W3R081r3Z090N4m2z1e74031e78011e7a011e|0n0b0h0B010h0Q020h0S023h0U020h0W0P3h270a3h2n023h3P091r3Y080N4f022N4j2u1e6R031e73031e|0o0a0h0S050h0X0P3h270c3h2n023h3R051r3Y080N4d062N4j2m1e6R021e72041e77011e|0t050h0S020h0W010h0X0Q3h260d3h2l053h3E010w3Q041r3X070N4b072N4i2m1e71041e76011e|0t040h0z010h0U010h0W030h0Z0P3h280c3h2l053h3A010w3C030w3S021r3Y070N4f042N4j2l1e70051e|0t020h0y010h0U050h0Z0P3h280j3h3z010w3B050w3Y060N46010N4b01234e02234g022N4i2k1e6Y081e|0s030h0x020h0V010h0Y020h100P3h1Q013h290j3h3C050w3V022Y3Z050N4b02234e05234j2j1e6Y081e|0r020h0W040h100T3h290j3h3B050w3T032Y3Z050N4a09234j2h1e6X091e|0q020h0X050h120T3h25013h290j3h3C040w3U032Y3Z050N4a01234b041X4f04234j2h1e6X0a1e|0n030h0X050h120U3h280l3h3A010w3C040w3T032Y3X022Y3Z020N4a061X4g01234h033x4k011e4l013x4m2c1e6W081e|0n010h0Z010h12010h130V3h1Z013h280n3h3D040w3U032Y3Y012Y4a081X4i053x4n0M1e59022a5b1n1e6X081e|0k010h0Y020h11103h250r3h3y012h3z020w3C050w3U012x3W022Y45011i48041e4c041X4g063x4m0L1e57052a5c1k1e6z011e6W091e|12103h250s3h3y012h3z030w3D010v3F040w3V022x3Z022x44091i4d031X4g073x4n0G1e53092a5c071e5j012a5k1f1e6X061e|0Y023h12013h140X3h250p3h2v033h3w052h3F040w3U072x410c1i4d0a3x4n0C1e4Z0g2a5f021e5h022a5j1g1e6B021e6X051e|0f020h0Z013h12013h140Y3h260u3h3x042h3D010w3F050w3R011z3S0a2x420c1i4e0b3x4p0B1e500l2a5l0U1e6f043a6j0l1e6F021e6X051e|0Z013h13013h150X3h260t3h3x042h3D080w3P031z3S092x410c1i4d0a3x4n0C1e4Z0m2a5l0S1e6d073a6k0k1e6F021e6X031e7i010h|150Y3h270t3h3x042h3E070w3P031z3S0a2x420b1i4d0b3x4o021e4q010y4r0y1e4Z0n2a5m0S1e6e073a6l0j1e6F021e6Y021e|02010h04010h150Y3h260t3h3w022h3C080w3O021z3Q0b2x410c1i4d013x4e030y4h053x4m050y4r0x1e4Y0o2a5m0p1e5L021J5N0q1e6d083a6l0j1e6F011e6X021e|160Y3h250s3h3F060w3N013w3O011z3P013w3Q011z3R0b2x420c1i4e0d0y4r0l1e4M042a4Q0a1e500n2a5n0o1e5L051J5Q0n1e6d093a6m0i1e6G011e6Y011e|14013h171o3h2y013h3D040w3L012B3M043w3Q0b2x41022Z430b1i4e0e0y4s0i1e4K072a4R021e4T032a4W031e4Z0q2a5p021e5r012a5s0i1e5K061J5Q0m1e6c0a3a6m0h1e6F021e|15033h191e3h2r033h2x023h3C010w3E010w3L042B3P023w3R082x3Z052Z44011i45012Z46071i4d0i0y4v0d1e4I012a4J011e4K0J2a5t091e5C041J5G051e5L071J5S011e5T031J5W0g1e6c0b3a6n0g1e6G021e6W011e|16033h1a1b3h2o023h2x023h3J062B3P013w3Q011W3R082x3Z082Z47051i4c0l0y4x0a1e4H0N2a5u061e5A091J5J011e5K0d1J5X071e64041J68013a69011e6a0c3a6m0h1e6F031e|18023h1b0A3h1L010h1M0y3h2n013h2q023h2x033h2B023h3G010t3H0b2B3S082x40072Z47040Z4b011i4c0n0y4z081e4H0Q2a5x011e5y0s1J60021e62061J680i3a6q0d1e6F021e|18023h1c0A0h1M0w3h2k043h2w063h3E012B3H0c2B3T072x40013D41012Z42023D44012Z45060Z4b0n0y4y091e4H0P2a5w023a5y0z1J670j3a6q0d1e6F011e|19010h1c0E0h1Q033h1T010h1U0o3h2j053h2w073h3E0f2B3T072x40053D45030Z48042n4c050y4h011f4i021K4k0e0y4y0a1e4I0N2a5v043a5z0z1J680j3a6r041e6v013a6w061e|190N0h1W0s3h2v013h2x043h2C013h3F0d2B3S022x3U010M3V032x3Y013D3Z012x40043D44072n4b071f4i021K4k0c0y4w0d1e4J0L2a5u073a5B0A1J6b0k3a6v061e6F011e|1a0O0h1Y0k3h2i020h2k043h2A013h3H0b2B3S030M3V011Y3W083D44072n4b081f4j021K4l0b0y4y0c1e4K0L2a5v063a5B0C1J6d0i3a6v061e6F021e|1a0O0h1Y0j3h2h030h2k043h3G0b2B3R050M3W032e3Z033D42021044062n4a091f4j021K4l010y4p040y4v0e1e4J022a4P0C2a5r0a3a5B0z1J6a0k3a6u061e6G011e|1a0Q0h200d3h2e033h2h030h2k053h2s013h3I0a2B3S020M3U072e41021043023345032n480114490a1f4j011K4k020y4q011e4r010y4w0e1e4P0C2a5r0b3a5C0w1J680n3a6v051e6F011e|1a0Q0h200c3h2d033h2g040h2k033h2o043h3I0a2B3S072e400110410633470214490a1f4j020y4p031e4v0d1e4O072a4V01084W0u2a5q0b3a5B0w1J670n3a6u051e6N011e|1a0S0h22093h2b0a0h2o043h3I0a2B3S072e42013343043r4701334803144b091f4q031e4v0d1e4N062a4T05084Y0q2a5o0h3a5F0o1J63013a64021J660m3a6s061e6F012c6M011e|1a0R0h21083h29090h2j010h2m023h3H0b2B3S072e42013343043r4705144c081f4w0b1e4L082a4T06084Z0p2a5o0i3a5G0m1J620p3a6r061e6E022c6K011e|1a0S0h22073h29090h2m023h3H0c2B3W042e43023345033r4804144c013n4d041f4h023n4j011f4y0a1e4N062a4T0708500o2a5o0k3a5I0l1J630o3a6r061e6F042c|190S0h21043h250b0h3x0a0T3H062B3Q012B3W042e45023r47011I4804144c073n4y022y4A081e4N062a4T0c08550j2a5o0k3a5I0j1J610q3a6r041e6E062c|1a0S0h22043h260b0h3y0b0T3J012B3K010T3L022B3X042e46013r47021I4902274b01144c073n4A032y4D051e4P042a4T0d0856072a5d01255e012a5f08255n012a5o0m3a5K0h1J610q3a6r011e6D052c|190R0h20033h230d0h3y0f0T3U012B3Y042e47011I48013P4901274a021V4c063n4A052y4F041e4O012a4P020A4R022a4T02084V030A4Y070855062a5b01085c0c255o0s3a5Q051J5V0t3a6o021s6C012c6G012c|1a160h3y031h3B0c0T3Z052e48023P4a031V4d043n4h020B4o060B4B052y4G013C4H021e4J013C4R010A4S012a4T01084U040A4Y090857032a5a01085b0b255m123a6o021s|1a130h3y021h3A0a0T3U012e41042e48013P49021V4b062v4h0e0B4z030B4C033J4F053C4R090A50080858012a5904085d08255l0Z3a6k051s|1a120h3y031h3B090T3U022e42052e48023P4a022v4d012v4h010B4k0j0B4D033J4G063C4P0c0A5109085a020J5c02085e05255j0V3a6g043a6k051s6D022c|1a120h3x031h3A090T3U012e43012e48013P49032v4g0o0B4E013J4F053C4P0c0A51080859010J5a06255g0W3a6f033a6i051s6C032c|1b110h3x031h3A090T3U022e44012e49042v4i0m0B4E012j4F013C4G013J4H013C4I012j4J023C4P0e0A53050858050J5d01255e020J5g0W3a6f013a6k031s6D022c|1a110h3x031h3A090T4a022v4h0n0B4E042j4I013C4Q0e0A54040858070J5f0V3a6j041s6C022c|1c0X0h2a010h3y021h3A090T43012e4b012v4d012v4h0n0B4E062j4Q030A4T022j4V0b0A56030859030J5c013Q5d040J5h0U3a6j031s6m020U6C022c|1c0Y0h3x021h3z090T3Z032e4a032v4i0m0B4E062j4Q010A4R052j4W0a0A56020858030J5b013Q5c050J5h0U3a6d013a6l030U6B032c|1d0W0h3B060T3R013O3V010C42012e4b022v4f012v4i0h0B4z030L4C032i4F072j4Q082j4Y060A54043Q58010J59043Q5d010J5e033Q5h0Z3a6m030U6A042c|1c0X0h3B010T3K093O3T030C4k020B4o030B4t010B4u060L4A052i4F0k2j4Z050A54093Q5d051p5i0W3a6l040U6y052c|1e0W0h3J0b3O3U030C4t070L4A062i4G0k2j50020A520b3Q5d061p5j0U3a6m030U6y062c|1e0V0h3B021G3H0d3O3U030C4d032v4p01304t070L4A062i4G0j2j4Z0e3Q5d061p5j013R5k012l5l0R3a6l030U6t082c6C012c|1f0T0h3B061G3H0d3O3U030C4p01314t070L4A062i4G0j2j4Z0d3Q5c041p5g012l5h021p5j032l5m0Q3a6l020U6s032c6w022c|1g0R0h3A071G3H0b3O3S040C4s01224t050L4y072i4F0j2j4Y0e3Q5c041p5g062l5m0R3a6r012c6u012c6w012c|1i0O0h3z081G3H0c3O3T050C4t040L4x092i4G0j2j4Z0c3Q5b051p5g062l5m0S3a6l010U6q022c6t012c|1i0N0h3x0a1G3H0c3O3T040C3X031Z4a021Z4s012f4t020L4v022b4x092i4G0i2j4Y0c3Q5a061p5g062l5m0S3a6p032c|1j041M1n0H0h3x0b1G3I0d3O3V030C3Y051Z49041Z4s012g4t052b4y0a2i4I0h2j4Z0b3Q5a081p5i042l5m0T3a6q022c|1j061M1p050h1u021M1w0x0h3w081G3E0h3O3V010C3W071Z48071Z4r012f4s032b4v04164z092i4I0h2j4Z093Q58081p5g062l5m0T3a6q012c|1k021M1o0a1M1y0v0h3x081G3F0g3O3V010C3W0a1Z49061Z4f052R4l062R4r022f4t022b4v06164B072i4I0j2j51063Q570a1p5h062l5n0S3a|1k021M1o0a1M1y0u0h3w061G3C0j3O3V0c1Z48071Z4f0c2R4r012f4s032b4v07164C072i4K0f2j4Z073Q560a1p5g082l5o0Q3a|1l021M1p0a1M1z030h1C011M1D0c0h1Q030h1Y010h20030h3x041G3B0l3O3W0j1Z4f0d2R4s022b4u0a164E042i4I01264M0d2j4Z011p50063Q56091p5f092l5o031C5r0P3a|1m021M1p0b1M1A010h1B031M1E070h1Q010h1S010h20030h3r010T3v041G3z0m3O3V0k1Z4f0c2R4s0d164F022i4H01264M0d2j4Z0f1p5e0a2l5o051C5t0e3a5H012l5I0x3a|1n011M1q0f1M1F040h21030h3o010T3r010T3v031G3y0o3O3W0j1Z4f0a2R4q022R4s0g164I01264N0e2j510d1p5e0b2l5p051C5u0b3a5F042l5J0w3a|1m021M1q0f1M1F030h21030h3s061G3y0n3O3V0k1Z4f0c2R4s0h164N0e2j510c1p5d0d2l5q061C5w023a5y012l5z033t5C023a5E062l5K013k5L0t3a|1m031M1s0e1M1G020h21030h3s061G3y0o3O3W0j1Z4f0c2R4t0h164P0d2j52091p5b0j2l5u041C5y012l5z043t5D072l5K023k5M0s3a|1o021M1s0e1M1G020h22020h26013B3r031G3u041H3y011O3z0m3O3V0k1Z4f0b2R4t0i164Q012j4U082j52081p5a0l2l5v031C5y092l5H043k5L0s3a|1p021M1t0f1M1I010h22030h3r031G3u041H3y031O3B0k3O3V0k1Z4f0c2R4u0h164T011q4V052j500b1p5b0n2l5y023z5A072l5H053k5M0q3a|1p011M1t0f1M23010h3q031G3t091O3C0k3O3W0j1Z4f0c2R4u0h164M011g4S010x4X032j50051p56051p5b0o2l5z013z5A062l5G053k5L0r3a|1q011M1v0d1M27013B29013B3q031G3t011H3u071O3B031Q3E0i3O3W0j1Z4f0d2R4v0h164M011g4R020x4T011q57051p5c0m2l5y063z5E032l5H033k5K0r3a6e010K|1q021M1v0d1M3p031G3s011H3t071O3A041Q3E0k3O3Y0h1Z4f0d2R4v0i164O010x4Q030x4T011q57021p590q2l5z033z5C042l5G043k5K0q3a6d020K|1s011M1x0b1M3p021G3r031H3u071O3B051Q3G0j3O3Z0g1Z4f0e2R4x0h164O040x4S051q590q2l5z033z5C012l5D013z5E012l5F073k5M0n3a6d020K|1x0a1M2004323o031G3r011H3s091O3B061Q3H0g3O3X041u41011Z42033e450a1Z4f0e2R4x0i164P030x4S051q5b0o2l5z043z5D012l5E083k5M073a5T03045W0b3a6d010K|1y0a1M1Z01322205323o031G3r021H3t081O3B081Q3J0d3O3W071u43043e47081Z4f0f2R4x0l164S061q5a042l5f0k2l5z013z5B013z5D013z5E012l5F073k5M033a5P01245Q06045W093a|1y0a1M2001322602323n031G3q021H3s091O3B081Q3J0b3O3U081u42063e48071Z4f0f0R4x0l164S051q5a032l5e0j2l5D0a3k5N023a5P02245R06045X013a5Z033a|0u010h1y0b1M1R051M2703323o0d1O3B0a1Q3L083O3T0a1u43073e4a051Z4f0g0R4y0k164S051q5b022l5f0i2l5E0a3k5O03245R050460013a|1x0c1M1R041M2804323o0d1O3B0a1Q3L063O3R0c1u43083e4b041Z4f0f0R4y0j164R041q5e0i2l5E083k5M020H5O05245T0204|0v020h1y0c1M1R041M2d022p2f032T3o0e1O3C0b1Q3N043O3R0c1u430b3e4e0h0R4A0g164Q051q5e0g2l5F063k5L030H5O05245T02045Z033a|1z0b1M1Q041M2e012p2f032T3o0d1O3B0d1Q3O0f1u430b3e4e0h0R4A0d164N081q5e0f2l5F053k5K050H5P04245T01045Y023a|1B0b1M1N071M27022d2c032p2f012T2l020g3p0d1O3C0d1Q3P0e1u430b3e4e0i0R4A09164J05034O061q5f0e2l5G043k5K050H5P05245U01045Z013a6e011j|1C0e1M1Q022t1S023v2r013L3o0d1O3B0d1Q3O0f1u430b3e4e0i0R4B07164I06034O041q5f0d2l5G043k5K040H5O01245P040H5T01245U01046d021j|1F0b1M1Q032t1T013v3o0e1O3C0d1Q3P0e1u430b3e4e0h0R4v022O4C01164D04034H01164I07034P031q5f0c2l5G033k5K013k5L090H5U02245W01046e021j|1G0b1M1R012t1S013v3o03153r0b1O3C0c1Q3O0e1u420c3e4e0g0R4u032O4C0c035f0b2l5G023k5K023k5M070H5T03245W01046d021j6J010c|1J011M1N021M1P052t1U052o3o04153s0a1O3C0c1Q3O0e1u420b3e4d0h0R4u042O4C0c035g082l5L013k5M090H5V02245X01046d021j|1O011M1P032t1S082o3e013g3n06153t011O3u0e1Q3I013m3J011Q3K0h1u410b3e4c0h0R4t052O4C0a035g072l5K013k5L090H5U03245X01046d021j6J010c|1P032t1S012Q1T052o1Y031v3o06153u0d1Q3H033m3K0h1u410b3e4c0i0R4u022O4w032M4z012O4C08035h072l5L013k5M070H5T013j5U01245V023j5X02046e011j|1R032Q1U022o1W041v3n02153p012z3q03153t0c1Q3F053m3K051u3P011t3Q0a1u400b3e4b0i0R4t072M4A012O4C06035g082l5L013k5M040H5Q073j5X02046f021j|1V012o1W041v3o07153v091Q3E073m3L041u3P051t3U021u3W051t41013i42093e4b0j0R4u072M4B012O4D02035h072l5M020H5P020H5R063j5X02046e011j6h011j|1V041v3n01153o032r3r032s3u091Q3D083m3L021u3N0e1t41013i420a3e4c0g0R4s092M4B012O4P01035h062l5L013k5M010H5Q073j5X02046i011j|1W041v2e01392f01052h01053p032r3s062s3y041Q3C0a3m3M023u3O0e1t42013i43093e4c0d0R4p010Q4q020R4s092M4B012V4M010W5i062l5L023k5R053j5W0304|1X01351Y011v2c02392e01052g03053p012r3q082s3y041Q3C063m3I012w3J013m3K043u3O0c1t40023i420a3e4c0c0R4o010Q4p030R4s082M4A012V4B012M4C010X4H030X4K020W5i052l5L013k5S033j5V03046f011j6i011j|1X03352a04392e01052g07052p02052s010D3r082s3z01343A021Q3C043m3G042w3K043u3O0d1t41023i43083e4b023f4d0b0R4o020Q4q010R4r0b2M4C080X4K030W5j052l5T03046c011j6j011j|1X04352a03392d01052g0c053r022s3t02123v032s3y07343F042w3J010F3K033u3N0d1t40013i41093e4a033f4d020R4f020Q4h030R4k060Q4q010R4r0b2M4C080X4K020W5j032l5n010S5L010H5T02046g011j|20013521011n24041n2a04392e0f053s04123w032s3z07343G042w3K010F3L023u3N0d1t40023i42073e49043f4d020R4f0c0Q4r0d2M4E060X4K020W5j032l5o010S5L020H6a011j6k011j|20041n27011n2806392e0g053s04123w01203x012s3y08343G042w3K010F3L013u3M0d1t3Z033i42053e47073f4e0b0Q4p0h2M4G030X4J020W5j022l5n020S5L020H6g051j|23021n27011n2806392e0g052u022q3t03123w01203x022s3z07343G042w3K010F3L023u3N0c1t3Z043i43013e440c3f4g0a0Q4q0i2M4I030W5o020S5M020H6h051j|2707392e0f052t032q3u04203y07343F052w3K010F3L013u3M0c1t3Y043i420e3f4g0b0Q4r0g2M4H030W5n030S5N010H6i031j|280a392i0b052t042q3v04203z06343F052w3K020F3M013u3P061t3V073i420f3f4h0b0Q4s0f2M4H030W5o020S5O011S5P010H68021S6i021j|280c392k08052s052q2y030P3w03203z06343F042w3P051t3U083i420g3f4i0a0Q4s0d2M4F040W5N011S5O010H5P011S67041S6j011j|280c392k0a052u042q2y030P2B032B3y02203A02343G012w3Q041t3U083i42063f48013649073f4g02364i0a0Q4s01294t0c2M4F040W5I032k5O041S67051S|280c392k08052s023p2u022q2w050P2B032B3Q011t3U083i42053f4703364a023f4c09364l050Q4q04294u082M4C060W5I032k5O031S65013o66021S68012k69021S|280d392l04052p013p2q01052r043p2v022q2x050P2C032B2F013p3U012P3W073i43043f470f364m010Q4n010z4o010Q4p020z4r05294w022M4y03294B070W5J032k5P031S65021S67032k|270d392k05052p053p2u032q2x040P2B032B2E013p3V083i43013f440337470f364m050z4r08294z070W5K032k5P021S63031S66042k|260f392l05052q053p2v032q2y010P2z023p2B032B2E023p3W083i440337470g364n050z4s08294A060W5L032k5Q031S62051S67042k|250c392h043p2l04052p063p2v012q2w0b3p3V022P3X032A400637460g364m060z4s07294z050W5L042k5R011S5Z011S61051S66042k6m012k|25022S270c392j033p2m02052o0j3p3W062A420437460g364m050z4r09294A030W5K012k5M042k5Z0d2k6d032k6i012k6n012k|24042S2809392h0p3p3V062A410537460f364l050z4q09294z030W5M062k5Z0a2k6c012k6m012k|1Q012S24072S2b011k2c06392i0n3p2G033p3V062A410537460f364l060z4r09294A020W5L012k5N052k5Z0b2k|23072S2a021k2c06392i0m3p2F033p2J033p3U072A410437450g364l010z4m040I4q09294z020W5L012k5N062k60092k6c012k6e022k6q052k|24062S2a031k2d05392i0q3p2J053p3V072A420337450g364l021d4n060I4t07295M012k5O052k5U012k60082k6c032k6j012k6s032k6x042k|23062S29071k2g02392i0w3p3V032A3Y0637440g364k011d4l013l4m080I4u05295O072k60082k6b042k6u012k6y052k|25022S270a1k2h01392i0D3p3X012A3Y0637440h364l023l4n090I4w03295P062k5X012k63052k6c012k6e022k6l012k6n042k6t032k6x072k6E021m6R011m|23011k24022S260a1k2g01392h0E3p3X0637430h364k023l4m090I4v03295Q052k66012k6c012k6e022k6l012k6t0b2k6E031m|23021k25012S260a1k2g0H3p3Y0337410136420137430i364l0c0I4x01295R042k6d012k6f012k6x072k6E061m6S021m|230a1k2d0M3p3Y013M3Z0l364k0d0I5S032k6c012k6z052k6E061m6R011m|240a1k2e0M3p3Z0m364l0c0I6t012k6v012k6A042k6E071m6O031m|24091k2d0N3p3Z053M440h364l0c0I5U042k6A032k6D091m6W011m|25081k2d0O3p40053M45033648023M4a0c364m0c0I5W092k6B032k6E081m6Y010Y|25071k2c0O3p40053M45033648033M4b0b364m0b0I5Z062k6k012k6A042k6E031m6J031m70010Y|26071k2d0N3p400b3M4b09364k03024n0b0I65012k67032k6b012k6d022k6g022k6l010G6D012k6E031m6L021m6Z010Y73010Y|26071k2d0N3p3Z0c3M4b08364j05024o0a0I6j010G6E021m6L031m|27081k2f013p2g011k2h053p2m023s2o0B3p400c3M4c08364k06024q011T4r070I6d012k6i012k6M031m72010Y|27091k2g043p2k033s2n0B3p400b3M4b08364j07024q011T4r080I6P011m74010Y|280a1k2i053s2n0B3p410d3M4e01024f05364k06024q021T4s060I4y011F|280a1k2i053s2n0A3p400e3M4e02024g01364h01024i01364j06024p021T4r081F4C01386q013E6t013E6F013E72010Y|290a1k2j073s2q0x3p410d3M4e06024k01364l05024q011T4r081F4K011U6r083E6F023E|29091k2i093s2r0u3p3Z0c3M4b09024k01364l04024p021T4r081F4J021U6q073E6E033E|290a1k2j0b3s2u0r3p3Z0c3M4b0e024p031T4s071F4J031U6q093E6F023E|29091k2i0b3s2t0s3p3Z0c3M4b0d024o031F4r021T4t061F4I031U6k033E6p083E6E043E|2b071k2i0c3s2u0r3p3Z0c3M4b0b024m061F4s011T4t061F4I041U6j043E6o093E6F053E7b0107|2b071k2i0c3s2u0r3p3Y0d3M4b09024k02014m051F4r021T4t051F4G041U6i0h3E6E053E|2e051k2j0d3s2w0p3p3Y0e3M4c08024k05014p091F4E071U6i0i3E6E063E7r012L|2f031k2i0e3s2w0p3p3Y013M3Z011E400c3M4c06024i07014p071F4D071U6g013E6i0j3E6D073E|2g021k2i0f3s2x0o3p3Y091E47053M4c041E4g02024i08014q051F4E071U6g0v3E7p012L|2h013d2i0f3s2x0n3p3Y0c1E4a063q4g09014p051F4D071U6f0v3E|0d011x2h023d2j0e3s2x0n3p3Z0b1E4a073q4h08014p041F4E061U6f0w3E|2h023d2j093s2s041l2w0o3p3Z0b1E4a073q4h08014p031F4E051U6e0y3E|2h023d2j093s2s051l2x0n3p400a1E4a083q4i07014p031F4E061U6b0D3E|2h023d2j083s2r061l2x0l3p400a1E4a083q4i06014o041F4D061U680G3E78012H|2h033d2k073s2r061l2x0m3p41091E4a0a3q4k04014o041F4D061U670I3E79022H|2h033d2k013s2l033K2o013s2p023K2r081l2z0i3p41071E480c3q4k030V4n051F4C061U650K3E7a012H|2h043d2l073K2s081l2A0h3p42071E490a3q4j050V4o051F4D061U650M3E|2h043d2l073K2s081l2A0d3p41071E48093q4h060V4n051F4D051U640N3E|2h033d2k0b3K2v071l2C093p42071E49093q4i060V4o051F4D051U650N3E|2g033d2j0d3K2w051l2B093p42061E48010V49073q4g080V4o031F4D041U640O3E|2h023d2j0e3K2x041l2B083p42071E49010V4a033q4d010V4e023q4g080V4o021F4F011U650P3E|2g033d2j0d3K2w051l2B013K2C063p42061E48010V49033q4c0b0V4n010O4o011F640P3E|2h033d2k0d3K2x041l2B013K2C073p43061E49010V4a013q4b0c0V4n010O4o011F650P3E|2g023d2i0f3K2x021l2z023K2B073p42061E480h0V650O3E|2g023d2i0i3K2A093p43061E490g0V660O3E|2f023d2h0i3K2z093p44010V45031E480b0V4j01214k040V660O3E|2g023d2i0h3K2z093p450e0V4j02214l030V670N3E|2f023d2h0g3K2x0a3p450d0V4i02214k030V660N3E|2f023d2h0g3K2x02092z083p460h0V670M3E|2f023d2h0g3K2x03092A063p460f0V670M3E|2g013d2h0g3K2x05092C023p470e0V680h3E6s0r3E|2f023d2h0f3K2w06092C023p460e0V670d3E6u0o3E|2g013d2h0g3K2x06092D013p460d0V680b3E6v0n3E|2f023d2h0f3K2w06092C013p460b0V670b3E6w033E6A0h3E|2f033d2i0e3K2x050947050V67063E6x013E6A0h3E|2e033d2h0f3K2y030948010V67043E6w013E6z0h3E|2e033d2h0h3K6B0f3E7j021w|2e033d2h0g3K6y013E6B0e3E|2e023d2g0j3K6C0e3E|2d033d2g0i3K6C0d3E7l011w|2d033d2g0i3K6D0c3E7l021w7p011w|2d033d2g0h3K6F033E6J033E7l041w|2d033d2g0b3K2s023K7l041w|2d023d2f0c3K7k041w|2d023d2f0c3K7m021w|2c033d2f0c3K7l021w|2c033d2f093K6J043E7i011w7k031w|2c013d2e013d2f083K6J043E7h031w|2c013d2e013d2f0b3K6J043E7h031w|2c023d2e0a3K6J033E7g031w|2e013d2f093K6K023E7f041w|04011w2d023d2f083K7d041w|2d033d2g073K7c051w|2d023d2f073K7b051w|2c033d2f063K7b051w|2b043d2f053K7b041w|2b043d2f063K|2c033d2f073K|2c023d2e093K|2a043d2e083K|2b033d2e073K|2a033d2d073K59022I|2b023d2d073K|2b023d2d053K|2b013d2d023d2f043K|2a013d2c023d2e043K2v010n|2b013d2d023d2f043K2u020n|2c063d|2d023d2h023d2j013K|2d033d2i013d|2d023d2g033d2j023K|2g033d2j023K|2i013d2k053K|2i013d|2k013d|';
  var CM_NAMES = ["Zimbabwe","Zambia","Yemen","Vietnam","Venezuela","Vatican","Vanuatu","Uzbekistan","Uruguay","Micronesia","Marshall Is.","N. Mariana Is.","U.S. Virgin Is.","Guam","American Samoa","Puerto Rico","United States of America","S. Geo. and the Is.","Br. Indian Ocean Ter.","Saint Helena","Pitcairn Is.","Anguilla","Falkland Is.","Cayman Is.","Bermuda","British Virgin Is.","Turks and Caicos Is.","Montserrat","Jersey","Guernsey","Isle of Man","United Kingdom","United Arab Emirates","Ukraine","Uganda","Turkmenistan","Turkey","Tunisia","Trinidad and Tobago","Tonga","Togo","Timor-Leste","Thailand","Tanzania","Tajikistan","Taiwan","Syria","Switzerland","Sweden","eSwatini","Suriname","S. Sudan","Sudan","Sri Lanka","Spain","South Korea","South Africa","Somalia","Somaliland","Solomon Is.","Slovakia","Slovenia","Singapore","Sierra Leone","Seychelles","Serbia","Senegal","Saudi Arabia","São Tomé and Principe","San Marino","Samoa","St. Vin. and Gren.","Saint Lucia","St. Kitts and Nevis","Rwanda","Russia","Romania","Qatar","Portugal","Poland","Philippines","Peru","Paraguay","Papua New Guinea","Panama","Palau","Pakistan","Oman","Norway","North Korea","Nigeria","Niger","Nicaragua","New Zealand","Niue","Cook Is.","Netherlands","Aruba","Curaçao","Nepal","Nauru","Namibia","Mozambique","Morocco","W. Sahara","Montenegro","Mongolia","Moldova","Monaco","Mexico","Mauritius","Mauritania","Malta","Mali","Maldives","Malaysia","Malawi","Madagascar","Macedonia","Luxembourg","Lithuania","Liechtenstein","Libya","Liberia","Lesotho","Lebanon","Latvia","Laos","Kyrgyzstan","Kuwait","Kosovo","Kiribati","Kenya","Kazakhstan","Jordan","Japan","Jamaica","Italy","Israel","Palestine","Ireland","Iraq","Iran","Indonesia","India","Iceland","Hungary","Honduras","Haiti","Guyana","Guinea-Bissau","Guinea","Guatemala","Grenada","Greece","Ghana","Germany","Georgia","Gambia","Gabon","France","St. Pierre and Miquelon","Wallis and Futuna Is.","St-Martin","St-Barthélemy","Fr. Polynesia","New Caledonia","Fr. S. Antarctic Lands","Åland","Finland","Fiji","Ethiopia","Estonia","Eritrea","Eq. Guinea","El Salvador","Egypt","Ecuador","Dominican Rep.","Dominica","Djibouti","Greenland","Faeroe Is.","Denmark","Czechia","N. Cyprus","Cyprus","Cuba","Croatia","Côte d'Ivoire","Costa Rica","Dem. Rep. Congo","Congo","Comoros","Colombia","China","Macao","Hong Kong","Chile","Chad","Central African Rep.","Cabo Verde","Canada","Cameroon","Cambodia","Myanmar","Burundi","Burkina Faso","Bulgaria","Brunei","Brazil","Botswana","Bosnia and Herz.","Bolivia","Bhutan","Benin","Belize","Belgium","Belarus","Barbados","Bangladesh","Bahrain","Bahamas","Azerbaijan","Austria","Australia","Indian Ocean Ter.","Heard I. and McDonald Is.","Norfolk Island","Ashmore and Cartier Is.","Armenia","Argentina","Antigua and Barb.","Angola","Andorra","Algeria","Albania","Afghanistan","Siachen Glacier","Antarctica","Sint Maarten"];
  DS.recipe('markets-map', function (root) {
    if (root.__cm) return; root.__cm = true;
    /* ---------- land dot grid (Miller projection, hex-offset rows) ---------- */
    var S = 0.78, RH = S*0.866, YTOP = 104.98795075686634;
    var COBALT=[25/255,93/255,242/255], SOFT=[132/255,170/255,234/255], LAND=[207/255,211/255,218/255], LAND_A=1;

    function miller(lat){ return 1.25*Math.log(Math.tan(Math.PI/4+0.4*lat*Math.PI/180))*180/Math.PI; }
    var B='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function b2(s,i){ return B.indexOf(s[i])*62+B.indexOf(s[i+1]); }

    var px=[], py=[], pk=[];
    CM_DOTS.split('|').forEach(function(row,r){
      var y=YTOP-r*RH, off=(r%2)?S/2:0;
      for(var i=0;i<row.length;i+=6){
        var c0=b2(row,i), n=b2(row,i+2), k=b2(row,i+4);
        for(var c=c0;c<c0+n;c++){ px.push(-180+off+c*S); py.push(y); pk.push(k); }
      }
    });

    /* ---------- DOM ---------- */
    var stage=root.querySelector('.cm__stage');
    var canvas=root.querySelector('.cm__canvas');
    var frameEl=root.querySelector('.cm__frame');
    var veil=root.querySelector('.cm__veil');
    var lines=[].slice.call(root.querySelectorAll('.cm__line'));
    var lead=root.querySelector('.cm__lead');
    var eyebrow=root.querySelector('.cm__eyebrow');
    var stat=root.querySelector('.cm__stat');
    var chapters=[].slice.call(root.querySelectorAll('.cm__chapter'));
    var strips=[].slice.call(root.querySelectorAll('.cm__strip'));
    var pinsEl=root.querySelector('.cm__pins');
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* palette is read from the section's CSS tokens, so a surface swap repaints the dots too */
    var probe=document.createElement('span'); probe.style.display='none'; root.appendChild(probe);
    function rgbOf(v){ probe.style.color=''; probe.style.color='var('+v+')'; var m=getComputedStyle(probe).color.match(/[\d.]+/g)||[0,0,0]; return [m[0]/255,m[1]/255,m[2]/255]; }
    function readPalette(){
      COBALT=rgbOf('--cm-dot'); SOFT=rgbOf('--cm-dot-soft'); LAND=rgbOf('--cm-land');
      LAND_A=parseFloat(getComputedStyle(root).getPropertyValue('--land-a'))||1;
      if(gl&&prog){ gl.uniform3fv(U.cLand,LAND); gl.uniform3fv(U.cOn,COBALT); gl.uniform3fv(U.cSoft,SOFT); gl.uniform1f(U.la,LAND_A); }
      /* surface-image: the photo paints the pinned stage, not the 600vh track */
      var bg=root.classList.contains('surface-image')&&root.getAttribute('data-bg');
      stage.style.backgroundImage=bg?"url('"+bg+"')":'';
    }

    strips.forEach(function(s){ for(var d=0;d<=10;d++){ var e=document.createElement('span'); e.textContent=d%10; s.appendChild(e);} });
    /* phones and foldables: the map shows dots only, so one line under the stats
       rule names the region and the place whose dot lit up last (CSS shows it
       below 1024px). Built once, updated every frame. */
    var chaptersEl=root.querySelector('.cm__chapters'), places=null, placeName=null, placeEl=null, placeCh=-1, placeCur=null, placeT=0;
    if(chaptersEl){
      places=document.createElement('div'); places.className='cm__places'; places.setAttribute('aria-hidden','true');
      places.innerHTML='<span class="cm__places-name"></span><span class="cm__places-sep">-</span><span class="cm__places-place"></span>';
      chaptersEl.parentNode.insertBefore(places, chaptersEl.nextSibling);
      placeName=places.children[0]; placeEl=places.children[2];
    }

    var markets=[].slice.call(root.querySelectorAll('.cm__markets li')).map(function(li){
      var m={ name:li.textContent.trim(), chapter:+li.dataset.chapter, country:li.dataset.country||'',
        x:+li.dataset.lon, y:miller(+li.dataset.lat), place:li.dataset.place||'r', home:li.hasAttribute('data-home') };
      var el=document.createElement('div');
      el.className='cm-pin'+(m.home?' cm-pin--home':''); el.dataset.place=m.place;
      el.innerHTML='<span class="cm-pin__halo"></span><span class="cm-pin__dot"></span><span class="cm-pin__label"></span>';
      el.querySelector('.cm-pin__label').textContent=m.name;
      pinsEl.appendChild(el); m.el=el; m.halo=el.firstChild;
      return m;
    });
    var totalEl=root.querySelector('.cm__total'); if(totalEl) totalEl.textContent=markets.length+' ';

    /* tiny markets (Singapore) get at least one dot */
    /* dots carry a country index; remap to market slots (0 = not a market) */
    var MAX=24;
    if(markets.length>MAX-1){ console.warn('markets map: max '+(MAX-1)+' markets'); markets=markets.slice(0,MAX-1); }
    var slotOf={};
    markets.forEach(function(m,j){ m.code=j+1; var ci=CM_NAMES.indexOf(m.country); if(ci<0) console.warn('markets map: unknown country "'+m.country+'"'); else slotOf[ci+1]=m.code; });
    for(var i=0;i<pk.length;i++) pk[i]=slotOf[pk[i]]||0;
    var radius=new Float32Array(MAX), centers=new Float32Array(MAX*2), REACH=45;
    markets.forEach(function(m){
      centers[m.code*2]=m.x; centers[m.code*2+1]=m.y;
      var has=false, r=0, bx0=m.x, bx1=m.x, by0=m.y, by1=m.y;
      for(var i=0;i<pk.length;i++) if(pk[i]===m.code){
        var dx=px[i]-m.x, dy=py[i]-m.y, d=Math.sqrt(dx*dx+dy*dy); has=true;
        if(d<140) r=Math.max(r,d);   /* wave radius; overseas territories further away stay grey */
        if(d>REACH) continue;        /* framing box: mainland only */
        bx0=Math.min(bx0,px[i]); bx1=Math.max(bx1,px[i]); by0=Math.min(by0,py[i]); by1=Math.max(by1,py[i]);
      }
      if(!has){ px.push(m.x); py.push(m.y); pk.push(m.code); }
      radius[m.code]=Math.max(r,1.2);
      m.box=[bx0,by0,bx1,by1];   /* projected units */
    });
    var N=px.length;

    /* ---------- timeline (derived from the markup) ---------- */
    var views=chapters.map(function(c){ return c.dataset.view.split(',').map(Number); });
    var WORLD=[-95,-48,125,78], FINAL=[-18,-40,160,76];
    /* widen a view [w,s,e,n] (degrees) to hold some markets */
    function invMiller(y){ return (Math.atan(Math.exp(y*Math.PI/180/1.25))-Math.PI/4)/0.4*180/Math.PI; }
    function widen(v,list,pad){
      v=v.slice();
      list.forEach(function(m){
        v[0]=Math.min(v[0],m.box[0]-pad); v[2]=Math.max(v[2],m.box[2]+pad);
        v[1]=Math.min(v[1],invMiller(m.box[1])-pad); v[3]=Math.max(v[3],invMiller(m.box[3])+pad);
      });
      return v;
    }
    views=views.map(function(v,i){ return widen(v,markets.filter(function(m){return m.chapter===i;}),3); });
    FINAL=widen(FINAL,markets,4);
    var T_INTRO=0.06, T_DOCK=0.14, T_END=0.86, T_FINAL=0.95;
    var nCh=chapters.length, chLen=(T_END-T_DOCK)/nCh;
    var chStart=[]; for(var i=0;i<nCh;i++) chStart.push(T_DOCK+i*chLen);
    /* each chapter: camera move in the first 30%, reveals spread over the rest */
    markets.forEach(function(m){
      var same=markets.filter(function(o){return o.chapter===m.chapter;});
      var idx=same.indexOf(m), n=same.length;
      var a=chStart[m.chapter]+chLen*(m.chapter===0?0.05:0.28), b=chStart[m.chapter]+chLen*0.95;
      var step=(b-a)/n;
      m.t0=a+idx*step; m.t1=m.t0+clamp(step*1.5,chLen*0.22,chLen*0.34);
    });
    /* camera keyframes: [time, box, cover?, useFrame?] */
    var keys=[[0,WORLD,1,0],[T_INTRO,WORLD,1,0]];
    for(i=0;i<nCh;i++){
      var arrive=i===0?T_DOCK:chStart[i]+chLen*0.3;
      keys.push([arrive,views[i],0,1]);
      if(i<nCh-1) keys.push([chStart[i+1],views[i],0,1]);
    }
    keys.push([T_END,views[nCh-1],0,1],[T_FINAL,FINAL,0,1],[1,FINAL,0,1]);

    /* ---------- easing ---------- */
    function clamp(v,a,b){ return v<a?a:v>b?b:v; }
    function lin(t,a,b){ return clamp((t-a)/(b-a),0,1); }
    function ease(t){ return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
    function easeOut(t){ return 1-Math.pow(1-t,3); }
    function smooth(t){ return t*t*(3-2*t); }

    /* ---------- layout measure ---------- */
    var tbox=null, W=1,H=1,DPR=1, frame={x:0,y:0,w:1,h:1}, lineGeo=[];
    var mqMobile=window.matchMedia('(max-width: 767px)');
    /* fixed / sticky bars at the top of the page (site header bar, in-page
       sub-nav): the pinned stage starts below them so they never cover the copy */
    var TOP=0;
    function barsBottom(){
      var b=0, vh=window.innerHeight;
      [].forEach.call(document.querySelectorAll('.cmp-site-header, .cmp-site-header *, .cmp-subnav, header, nav'),function(el){
        if(root.contains(el)) return;
        var cs=getComputedStyle(el); if(!/fixed|sticky/.test(cs.position)||cs.display==='none'||cs.visibility==='hidden') return;
        var h=el.getBoundingClientRect().height, t=parseFloat(cs.top); if(!h||isNaN(t)) return;
        var bottom=t+h; if(bottom<vh*0.3) b=Math.max(b,bottom);
      });
      return Math.round(b);
    }
    function measure(){
      TOP=barsBottom(); root.style.setProperty('--cm-top',TOP+'px');
      /* scroll length grows with the number of chapters so each beat keeps the same pace */
      if(!reduce) root.style.height=(mqMobile.matches?140+nCh*105:160+nCh*120)+'vh';
      var sr=stage.getBoundingClientRect();
      W=sr.width; H=sr.height; DPR=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(W*DPR); canvas.height=Math.round(H*DPR);
      /* the closing lead's own bar lift is netted out of the stacked position */
      if(lead&&stat){
        lead.style.bottom='';
        var shareCol=Math.min(lead.offsetLeft+lead.offsetWidth,stat.offsetLeft+stat.offsetWidth)-Math.max(lead.offsetLeft,stat.offsetLeft)>lead.offsetWidth*0.5;
        if(window.innerWidth<1024 && shareCol){
          /* phones and landscape foldables: lead and stats share a column, so the
             lead sits a fixed 28px above the stats block, whatever its height */
          lead.style.top='auto';
          var lift=parseFloat(getComputedStyle(lead).marginBottom)||0;
          lead.style.bottom=(stage.clientHeight-stat.offsetTop+28-lift)+'px';
        } else { lead.style.bottom=''; lead.style.top=''; }
      }
      var fr=frameEl.getBoundingClientRect();
      frame={x:fr.left-sr.left,y:fr.top-sr.top,w:fr.width,h:fr.height};
      /* the map never runs under the lead or stats: when either sits across a
         large part of the map's width (stacked tablet, foldable and phone
         layouts), the map area ends just above it. Desktop places the copy
         beside the map, so this never triggers there (device audit 2026-10-14). */
      [].forEach.call(root.querySelectorAll('.cm__lead, .cm__stat'),function(el){
        var l=el.offsetLeft, t=el.offsetTop, w=el.offsetWidth;
        var over=Math.min(l+w,frame.x+frame.w)-Math.max(l,frame.x);
        if(over>frame.w*0.3 && t<frame.y+frame.h && t>frame.y) frame.h=Math.max(frame.h*0.5,t-frame.y-28);
      });
      lines.forEach(function(l){ l.style.transform='none'; });
      var widest=0, rects=lines.map(function(l){ var r=l.getBoundingClientRect(); widest=Math.max(widest,r.width); return r; });
      var k=Math.min(1.45,(W*0.88)/widest);
      var lh=rects[0].height*k, cy=H*0.46-(lh*rects.length)/2;
      /* docked headline box (stage coords): pins fade where they would cross it */
      tbox=rects.reduce(function(b,q){ return [Math.min(b[0],q.left-sr.left),Math.min(b[1],q.top-sr.top),Math.max(b[2],q.right-sr.left),Math.max(b[3],q.bottom-sr.top)]; },[1e9,1e9,-1e9,-1e9]);
      lineGeo=rects.map(function(r,j){
        var cx=r.left-sr.left+r.width/2, ccy=r.top-sr.top+r.height/2;
        return {dx:W/2-cx, dy:(cy+lh*(j+0.5))-ccy, k:k};
      });
      if(gl) gl.viewport(0,0,canvas.width,canvas.height);
    }

    /* camera: fit a lon/lat box into a screen rect */
    function fit(box,cover,useFrame){
      var x0=box[0], x1=box[2], y0=miller(box[1]), y1=miller(box[3]);
      var R=useFrame?frame:{x:0,y:0,w:W,h:H};
      var sx=R.w/(x1-x0), sy=R.h/(y1-y0), s=cover?Math.max(sx,sy):Math.min(sx,sy);
      return {s:s, cx:(x0+x1)/2, cy:(y0+y1)/2, rx:R.x+R.w/2, ry:R.y+R.h/2};
    }
    function camera(t){
      for(var i=1;i<keys.length;i++) if(t<=keys[i][0]||i===keys.length-1){
        var A=keys[i-1], Bk=keys[i], u=ease(lin(t,A[0],Bk[0]||1e-6));
        var a=fit(A[1],A[2],A[3]), b=fit(Bk[1],Bk[2],Bk[3]);
        return { s:Math.exp(Math.log(a.s)+(Math.log(b.s)-Math.log(a.s))*u),
          cx:a.cx+(b.cx-a.cx)*u, cy:a.cy+(b.cy-a.cy)*u, rx:a.rx+(b.rx-a.rx)*u, ry:a.ry+(b.ry-a.ry)*u };
      }
    }

    /* ---------- WebGL dot renderer ---------- */
    var gl=null, prog, U={};
    try{ gl=canvas.getContext('webgl',{antialias:true,premultipliedAlpha:true,alpha:true}); }catch(e){}
    if(gl){
      var vs='attribute vec2 p;attribute float k;attribute float rn;'+
      'uniform vec2 res;uniform float s;uniform vec2 c;uniform vec2 rc;uniform float dpr;uniform float spx;'+
      'uniform float pr[24];uniform vec2 ct[24];uniform float rad[24];uniform float base;uniform float fin;uniform float la;'+
      'uniform vec3 cLand;uniform vec3 cOn;uniform vec3 cSoft;'+
      'varying vec4 col;'+
      'void main(){'+
      ' vec2 sp=vec2(rc.x+(p.x-c.x)*s, rc.y-(p.y-c.y)*s);'+
      ' gl_Position=vec4(sp.x/res.x*2.-1., 1.-sp.y/res.y*2., 0., 1.);'+
      ' float r=0.;'+
      ' if(k>.5){ int i=int(k+.5); float d=distance(p,ct[i])/rad[i];'+
      '   r=clamp((pr[i]*1.45-d-rn*.18)/.28,0.,1.); }'+
      ' float z=smoothstep(4.,16.,spx);'+
      ' float g=max(spx*mix(.52,.30,z),1.1);'+
      ' float on=max(spx*mix(.86,.48,z),1.7);'+
      ' float pop=sin(r*3.14159)*.38;'+
      ' float size=mix(g,on,smoothstep(0.,1.,r))*(1.+pop);'+
      ' gl_PointSize=size*dpr;'+
      ' vec3 blue=mix(cOn,cSoft,fin);'+
      ' vec3 cc=mix(cLand,blue,smoothstep(0.,.6,r));'+
      ' float a=mix(base*la,1.,smoothstep(0.,.6,r));'+
      ' col=vec4(cc*a,a);'+
      '}';
      var fs='precision mediump float;varying vec4 col;'+
      'void main(){ vec2 q=gl_PointCoord*2.-1.; float d=dot(q,q); float e=fwidthFallback(); if(d>1.) discard; gl_FragColor=col*smoothstep(1.,.55,d);}';
      fs=fs.replace('float e=fwidthFallback();','');
      function sh(t,src){ var o=gl.createShader(t); gl.shaderSource(o,src); gl.compileShader(o); if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
      try{
        prog=gl.createProgram();
        gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
        gl.linkProgram(prog); gl.useProgram(prog);
        var buf=new Float32Array(N*4);
        for(i=0;i<N;i++){ buf[i*4]=px[i]; buf[i*4+1]=py[i]; buf[i*4+2]=pk[i]; buf[i*4+3]=((i*2654435761)>>>0)%1000/1000; }
        var vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb); gl.bufferData(gl.ARRAY_BUFFER,buf,gl.STATIC_DRAW);
        [['p',2,0],['k',1,8],['rn',1,12]].forEach(function(a){ var l=gl.getAttribLocation(prog,a[0]); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l,a[1],gl.FLOAT,false,16,a[2]); });
        ['res','s','c','rc','dpr','spx','pr','ct','rad','base','fin','la','cLand','cOn','cSoft'].forEach(function(n){ U[n]=gl.getUniformLocation(prog,n); });
        gl.uniform2fv(U.ct,centers); gl.uniform1fv(U.rad,radius);
        gl.uniform3fv(U.cLand,LAND); gl.uniform3fv(U.cOn,COBALT); gl.uniform3fv(U.cSoft,SOFT); gl.uniform1f(U.la,LAND_A);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      }catch(err){ console.warn(err); gl=null; }
    }
    var ctx2d=gl?null:canvas.getContext('2d');
    function hex(c){ return 'rgb('+c.map(function(v){return Math.round(v*255);}).join(',')+')'; }
    new MutationObserver(function(){ readPalette(); render(current); }).observe(root,{attributes:true,attributeFilter:['class','data-bg']});

    /* ---------- render one state ---------- */
    var progs=new Float32Array(MAX);
    function render(t){
      var cam=camera(t);
      var dock=ease(lin(t,T_INTRO,T_DOCK));          /* 0 intro, 1 docked */
      var fin=smooth(lin(t,T_END+0.01,T_FINAL));
      var base=0.42+0.58*dock;
      markets.forEach(function(m){ progs[m.code]=reduce?1:lin(t,m.t0,m.t1); });

      /* dots */
      var spx=S*cam.s;
      if(gl){
        gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(U.res,W,H); gl.uniform1f(U.s,cam.s); gl.uniform2f(U.c,cam.cx,cam.cy); gl.uniform2f(U.rc,cam.rx,cam.ry);
        gl.uniform1f(U.dpr,DPR); gl.uniform1f(U.spx,spx); gl.uniform1fv(U.pr,progs);
        gl.uniform1f(U.base,base); gl.uniform1f(U.fin,fin);
        gl.drawArrays(gl.POINTS,0,N);
      } else if(ctx2d){
        ctx2d.setTransform(DPR,0,0,DPR,0,0); ctx2d.clearRect(0,0,W,H);
        var g=Math.max(spx*.3,1.05)/2, on=Math.max(spx*.46,1.5)/2;
        for(var i=0;i<N;i++){
          var X=cam.rx+(px[i]-cam.cx)*cam.s, Y=cam.ry-(py[i]-cam.cy)*cam.s;
          if(X<-10||Y<-10||X>W+10||Y>H+10) continue;
          var lit=pk[i]&&progs[pk[i]]>0.4;
          ctx2d.globalAlpha=lit?1:base*LAND_A; ctx2d.fillStyle=hex(lit?(fin>.5?SOFT:COBALT):LAND);
          ctx2d.beginPath(); ctx2d.arc(X,Y,lit?on:g,0,6.283); ctx2d.fill();
        }
      }

      /* headline: FLIP from centred intro to docked corner */
      var q=1-dock;
      lines.forEach(function(l,j){
        var gq=lineGeo[j]; if(!gq) return;
        var sc=1+(gq.k-1)*q;
        l.style.transform='translate3d('+(gq.dx*q).toFixed(2)+'px,'+(gq.dy*q).toFixed(2)+'px,0) scale('+sc.toFixed(4)+')';
      });
      veil.style.opacity=dock.toFixed(3);
      if(eyebrow) eyebrow.style.opacity=dock.toFixed(3);

      /* stat block + chapters */
      stat.style.opacity=smooth(lin(t,T_DOCK-0.035,T_DOCK+0.01)).toFixed(3);
      var bestCh=0, bestO=-1;
      chapters.forEach(function(c,i){
        var a=i===0?T_DOCK-0.03:chStart[i]-0.012, b=i===nCh-1?2:chStart[i+1]-0.012;
        var inn=smooth(lin(t,a,a+0.022)), out=i===nCh-1?0:smooth(lin(t,b,b+0.022));
        var o=inn*(1-out);
        if(o>bestO){ bestO=o; bestCh=i; }
        c.style.opacity=o.toFixed(3);
        c.style.transform='translate3d(0,'+((1-inn)*8-out*8).toFixed(2)+'px,0)';
      });

      /* rolling counter */
      var count=0; markets.forEach(function(m){ count+=smooth(lin(progs[m.code],0.18,0.62)); });
      var ones=count-10*Math.floor(count/10), tens=Math.floor(count/10)+Math.max(0,ones-9);
      if(strips.length>1){ strips[0].style.transform='translate3d(0,'+(-tens).toFixed(4)+'em,0)';
      strips[1].style.transform='translate3d(0,'+(-ones).toFixed(4)+'em,0)'; }

      /* pins */
      var shrink=1-0.14*fin;
      markets.forEach(function(m){
        var p=progs[m.code];
        var X=cam.rx+(m.x-cam.cx)*cam.s, Y=cam.ry-(m.y-cam.cy)*cam.s;
        var o=smooth(lin(p,0.12,0.42)); m.lit=o;
        /* pins drifting out of the map area (over the copy) fade away */
        var M=36, out=Math.max(frame.x-X, X-(frame.x+frame.w), frame.y-Y, Y-(frame.y+frame.h), 0);
        o*=1-smooth(clamp(out/M,0,1));
        if(tbox&&dock>0.5){ var tx=Math.max(tbox[0]-12-X, X-tbox[2]-12, 0), ty=Math.max(tbox[1]-12-Y, Y-tbox[3]-12, 0); o*=smooth(clamp(Math.max(tx,ty)/24,0,1)); }
        var pop=0.6+0.4*easeOut(lin(p,0.12,0.5));
        m.el.style.opacity=o.toFixed(3);
        m.el.style.transform='translate3d('+X.toFixed(2)+'px,'+Y.toFixed(2)+'px,0) scale('+(pop*shrink).toFixed(4)+')';
        var h=lin(p,0.2,0.85);
        m.halo.style.opacity=(Math.sin(h*Math.PI)*0.9).toFixed(3);
        m.halo.style.transform='scale('+(0.3+h*1.1).toFixed(3)+')';
      });

      /* the place line: region name, then the last place in it that has lit up */
      if(places){
        places.style.opacity=Math.min(1,bestO*1.2).toFixed(3);
        if(bestCh!==placeCh){ placeCh=bestCh; placeName.textContent=chapters[bestCh].textContent.trim(); }
        var cur=null; markets.forEach(function(m){ if(m.chapter===bestCh && m.lit>0.5) cur=m.name; });
        places.classList.toggle('has-place', !!cur);
        if(cur!==placeCur){
          placeCur=cur; placeEl.classList.add('is-swap'); clearTimeout(placeT);
          placeT=setTimeout(function(){ placeEl.textContent=placeCur||''; placeEl.classList.remove('is-swap'); },160);
        }
      }

      /* closing line */
      var l=smooth(lin(t,T_END+0.02,T_FINAL));
      lead.style.opacity=l.toFixed(3);
      lead.style.transform='translate3d(0,'+((1-l)*14).toFixed(2)+'px,0)';
    }

    /* ---------- damped scroll loop (inertia makes the scrub feel fluid) ---------- */
    var target=0, current=0, last=0, running=false;
    function readScroll(){
      var r=root.getBoundingClientRect(), span=r.height-H;
      target=span>0?clamp((TOP-r.top)/span,0,1):0;
    }
    function tick(now){
      var dt=Math.min(0.05,(now-(last||now))/1000); last=now;
      var k=1-Math.exp(-dt*7.5);
      current+=(target-current)*k;
      if(Math.abs(target-current)<0.00005) current=target;
      render(current);
      if(current!==target) requestAnimationFrame(tick); else { running=false; last=0; }
    }
    function kick(){ readScroll(); if(!running){ running=true; requestAnimationFrame(tick); } }

    function init(){
      root.classList.add('cm-armed');
      readPalette();
      measure();
      if(reduce){ render(1); return; }
      var deep=/cm=([\d.]+)/.exec(location.hash);
      if(deep){ var top=root.getBoundingClientRect().top+window.scrollY-TOP; window.scrollTo(0,top+(root.offsetHeight-H)*clamp(+deep[1],0,1)); }
      readScroll(); current=target; render(current);
      window.addEventListener('scroll',kick,{passive:true});
    }
    window.addEventListener('resize',function(){ measure(); if(reduce) render(1); else { readScroll(); current=target; render(current);} });
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(init); else window.addEventListener('load',init);
  });

  /* recipe: global-reach — the Global Reach network film (master world-map,
     moved here 2026-10-13 from global-reach.js and its light fork). A
     scroll-scrubbed canvas map pins full-screen: intro line, flight from Dubai
     along the routes, then the copy and four stats. Instance-scoped (no IDs),
     so any number per page. Options on the root:
       data-routes="dubai-london dubai-cairo …"  route set (default: the home
         film's seven); cities and timings come from the tables below.
       data-end-camera="k x y"  end-frame camera (default "1 1190 462").
     Canvas colours read from the --gr-* tokens the ground sets in style.css.
     ?t=<seconds> in the URL freezes the timeline (QA). */
  DS.recipe('global-reach', function (root) {
    var reach = root.querySelector('.gr-reach'), frame = root.querySelector('.gr-reach__frame'),
        stage = root.querySelector('.gr-stage'), cv = root.querySelector('.gr-map'),
        track = root.querySelector('.gr-scrub'), hint = root.querySelector('.gr-scrub__hint');
    if (!reach || !frame || !stage || !cv || !track || !cv.getContext) return;
    root.classList.add('gr-armed');
    var ctx = cv.getContext('2d'), pin = reach.parentElement;
    /* land dots (hex grid, pre-baked from Natural Earth 50m) */
    var GRID = { x0: 465.72, y0: -67.2, s: 11, dy: 9.526 };
    var ROWS=["00000000000000000000000000000000000000000","ffe00000000000000000000000000000000000000","ffec0000000000000000000000000000000000000","ffffc0000000000a6380200e00000000000000000","fffd0000057e00000000000f80000000000000000","fff800000fc000000000000070000000000000000","fffe0000039800000000000008000000000000000","fff2000000000000006000007b800000000000000","fffe0000000000000e00003fffc0001d800000000","fff4000000000000300000ffff400000000000000","ffe800000000000030000ffffcdc6802000000000","fff0000000000000c01c2ffffffff80f800000000","ffd8000000000000e03d3bfffffffdeff80000c00","ffa00000003f8000083dffffffffffffffc000000","ffe00000007ff802039d7fffffffffffffffbf000","f800000003fffe33fffdffffffffffffffffffc00","f800000003ffdf97fffdfffffffffffffffffff80","a01a800007fff0ffffffffffffffffffffffff7e4","000fe0000fe3f4ffffffffffffffffffffffff1c2","000f00003fcffbfffffffffffffffffffffffe000","000000007f1fffffffffffffffffffffffffff000","00000001ff3fffffffffffffffffffffff37f0000","00000010ff1fffffffffffffffffffffff07e0000","00000001ff81fffffffffffffffffffffc1000000","00000000cf0ffffffffffffffffffffc003000000","000000c02e8ffffffffffffffffffff000f000000","000000c0371ffffffffffffffffffff000f800000","000000e0303fffffffffffffffffffc001e000000","0000033025ffffffffffffffffffffe000e000000","000006f0fffffffffffffffffffffffa01c000008","00000779fffffffffffffffffffffffe00c000080","0000007bfffffffffffffffffffffffa000000000","00000087fffffffffffffffffffffffb010000000","0000001ffffffffffffffffffffffff8000000000","0000007ffffffffffffffffffffffffa000000000","0000003ffffff9ffffffffffffffffe2000000000","0000001fffff93fc7fffffffffffffe0000000000","0000001ff3ff17f1ffffffffffffffc0400000000","0000001f99ff01f9ffffffffffffffc3400000000","000007fc18fe00f8fffffffffffffc0e000000000","000003fc263f387cfffffffffffffc00000000000","000003f04370fffcfffffffffffef808000000000","000003f02133fffc7ffffffffffe9004000000000","000003e00033fff87ffffffffff83008000000000","000003e00611fffe7ffffffffffd880c000000000","0000010fe010affffffffffffffe1838000000000","0000009ff00c17fffffffffffffe18f8000000000","000001ffe0000ffffffffffffffe0240000000000","000003fff0000fffffffffffffff0200000000000","000007fffc700fffffffffffffff0200000000000","000007ffff3f7fffffffffffffff0200000000000","000007fffffffffbffffffffffff0000000000000","000007fffffffff9ffffffffffff0000000000000","00001fffffffeff9fffffffffffe0000000000000","00001ffffffff7fe6ffffffffffe0000000000000","00003fffffffe7fc3ffffffffffc0000000000000","00003ffffffff3ff201ffffffffc0000000000000","00007ffffffff3fff01ffffffff90000000000000","00007ffffffff9fff807ffffffe10000000000000","0000fffffffff9fff80fff1ffd800000000000000","00007ffffffffcfff803ff0ffc000000000000000","0000fffffffff8fff003fc0ff9000000000000000","00007ffffffffc7fe001fc07f9018000000000000","0000fffffffffe7fc003f807f8010000000000000","00007ffffffffe3f0001f000fe018000000000000","0000fffffffffe7e0001e001fe010000000000000","00007fffffffffbc0000e000ff010000000000000","0000ffffffffffa00001e000fe010000000000000","00007fffffffffc00000e0009f002000000000000","00007fffffffffce0000e0001c000000000000000","00001ffffffffffe0000600084004000000000000","00001ffffffffffc0000500080002000000000000","00001ffffffffffe0000180000003000000000000","00000ffffffffffc0000100040084000000000000","000007f0fffffffc00000000600c0000000000000","00000200bffffff80000000260180000000000000","000000001ffffff800000001b0380000000000000","000000003fffffe000000001a0780800000000000","000000001fffffe000000000e1fc2800000000000","000000003fffffc000000000e1fa0800000000000","000000003fffff800000000070f80100000000000","000000003fffff000000000078f30160000000000","000000001fffff00000000003efa81bc080000000","800000001ffffe0000000000380301fe000000000","c00000000ffffe00000000000800001f800000000","e000000007fffc00000000000000009f900000000","f000000007fffe000000000003e0000fc08000000","f000000007fffe000000000000e0001e408000000","f000000007fffe000000000000002002201000000","e000000007fffe000000000000000000300000000","c000000003ffff000000000000000102000000000","8000000007ffff0000000000000003c2000000000","8000000007ffff0600000000000003c2000000000","800000000fffff040000000000001787000000000","800000000fffff0c0000000000003fc3800100000","800000000ffffe3c0000000000007fe7000001000","800000000ffffc1c0000000000007fff800080000","000000000ffff83c000000000000ffff800080000","8000000007fff01c000000000000ffffc00000000","0000000007fff03800000000000fffffc00400000","0000000003fff83800000000001fffffe00000000","0000000003fff03800000000003ffffff00000000","0000000003fff83800000000001ffffff80000000","0000000003ffe03000000000003ffffffc0000000","0000000003ffe00000000000001ffffffc0000000","0000000003ffc00000000000003ffffff80000000","0000000001ffe00000000000001ffffffc0000000","0000000001ff800000000000001ffffffc0000000","0000000000ff800000000000000ffffffc0000000","0000000000ff000000000000001ffffff80000000","00000000007f000000000000000fe07ff80000000","0000000000fc000000000000001f807ff00000000","000000000040000000000000000c004ff00000000","0000000000000000000000000000002ff00010000","00000000000000000000000000000007f00000000","00000000000000000000000000000007e0000e000","00000000000000000000000000000000000006000","0000000000000000000000000000000000000c000","00000000000000000000000000000000a00014000","00000000000000000000000000000000c00030000","00000000000000000000000000000000400030000","000000000000000000000000000000000000c0000","000000000000000000000000000000000000c0000","00000000000000000000000000000000000180000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000080000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000"];
    var DOTS = [], GALL = [];
    ROWS.forEach(function (row, r) {
      var off = r % 2 ? GRID.s / 2 : 0;
      for (var i = 0; i < row.length; i++) {
        var n = parseInt(row[i], 16);
        for (var b = 0; b < 4; b++) {
          var x = GRID.x0 + off + (i * 4 + b) * GRID.s, y = GRID.y0 + r * GRID.dy;
          GALL.push(x, y);
          if (n & (8 >> b)) DOTS.push(x, y);
        }
      }
    });
    /* projection (world space = the 1920x1080 end frame) */
    function P(lon, lat) { return [1190 + (lon - 55.3) * 7.6, 462 - (lat - 25.2) * 9]; }
    var CITY = {
      dubai:     { n: 'Dubai',     ar: 'دبي',      p: P(55.27, 25.20),  lab: [22, -20, 'left'], labTall: [0, -24, 'center'], hub: 1 },
      london:    { n: 'London',    ar: 'لندن',     p: P(-0.13, 51.51),  lab: [-18, -2, 'right'], labTall: [0, -22, 'center'] },
      cairo:     { n: 'Cairo',     ar: 'القاهرة',  p: P(31.24, 30.04),  lab: [-16, 6, 'right'] },
      riyadh:    { n: 'Riyadh',    ar: 'الرياض',   p: P(46.68, 24.71),  lab: [-44, 26, 'center'] },
      mumbai:    { n: 'Mumbai',    ar: 'مومباي',   p: P(72.88, 19.08),  lab: [46, 26, 'center'] },
      singapore: { n: 'Singapore', ar: 'سنغافورة', p: P(103.82, 1.35),  lab: [0, 28, 'center'] },
      shanghai:  { n: 'Shanghai',  ar: 'شنغهاي',   p: P(121.47, 31.23), lab: [-16, -2, 'right'] },
      tokyo:     { n: 'Tokyo',     ar: 'طوكيو',    p: P(139.69, 35.69), lab: [4, -22, 'center'] },
      moscow:    { n: 'Moscow',    ar: 'موسكو',    p: P(37.62, 55.76),  lab: [0, -20, 'center'] },
      bahrain:   { n: 'Bahrain',   ar: 'البحرين',  p: P(50.59, 26.23),  lab: [-14, -9, 'right'], labTall: [0, 24, 'center'] },
      istanbul:  { n: 'Istanbul',  ar: 'إسطنبول',  p: P(28.98, 41.01),  lab: [-16, -2, 'right'] },
      berlin:    { n: 'Berlin',    ar: 'برلين',    p: P(13.40, 52.52),  lab: [0, -20, 'center'] },
      vienna:    { n: 'Vienna',    ar: 'فيينا',    p: P(16.37, 48.21),  lab: [-16, 2, 'right'] },
      beijing:   { n: 'Beijing',   ar: 'بكين',     p: P(116.40, 39.90), lab: [-16, -2, 'right'] },
      jakarta:   { n: 'Jakarta',   ar: 'جاكرتا',   p: P(106.85, -6.21), lab: [0, 26, 'center'] }
    };
    /* route timings: start (s), duration (s), bow, bow side */
    var ROUTE = {
      'dubai-london': [3.7, 1.5, .30, 'n'], 'dubai-cairo': [4.0, 1.1, .26, 'n'], 'dubai-riyadh': [4.25, .8, .30, 'n'],
      'dubai-mumbai': [4.5, 1.0, .24, 'n'], 'dubai-singapore': [4.8, 1.7, .22, 'n'],
      'dubai-moscow': [3.85, 1.3, .12, 'n'], 'dubai-berlin': [3.9, 1.4, .16, 'n'], 'dubai-vienna': [4.05, 1.3, .07, 'n'],
      'dubai-istanbul': [4.15, 1.1, .10, 'n'], 'dubai-bahrain': [4.35, .6, .45, 'n'],
      'singapore-shanghai': [7.0, 1.3, .14, 'w'], 'singapore-tokyo': [7.3, 1.5, .20, 'w'],
      'singapore-beijing': [7.15, 1.4, .16, 'w'], 'singapore-jakarta': [7.0, .9, .25, 'w']
    };
    var routes = (root.getAttribute('data-routes') || 'dubai-london dubai-cairo dubai-riyadh dubai-mumbai dubai-singapore singapore-shanghai singapore-tokyo').trim().split(/\s+/).filter(function (k) { return ROUTE[k]; });
    var C = { dubai: CITY.dubai };
    var ARCS = routes.map(function (k) {
      var ab = k.split('-'), a = ab[0], b = ab[1], t = ROUTE[k];
      C[a] = CITY[a]; C[b] = CITY[b];
      var A = CITY[a].p, B = CITY[b].p, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      var dx = B[0] - A[0], dy = B[1] - A[1], Ln = Math.hypot(dx, dy), nx = -dy / Ln, ny = dx / Ln, side = t[3];
      if ((side === 'n' && ny > 0) || (side === 'w' && nx > 0) || (side === 'e' && nx < 0)) { nx = -nx; ny = -ny; }
      return { a: a, b: b, t0: t[0], d: t[1], A: A, B: B, Q: [mx + nx * Ln * t[2], my + ny * Ln * t[2]] };
    });
    /* Singapore's label moves aside when Jakarta sits below it */
    var LAB = {}; Object.keys(C).forEach(function (k) { LAB[k] = { lab: C[k].lab, labTall: C[k].labTall }; });
    if (C.jakarta) LAB.singapore = { lab: [16, 10, 'left'], labTall: [0, 28, 'center'] };
    var ARRIVE = { dubai: 3.0 }; ARCS.forEach(function (r) { ARRIVE[r.b] = r.t0 + r.d; });
    /* layouts: each camera pins Dubai at screen (x,y) with zoom k */
    var endCam = (root.getAttribute('data-end-camera') || '1 1190 462').trim().split(/\s+/).map(parseFloat);
    var LAYOUT = {
      wide: { W: 1920, H: 1080, label: 20, hubLabel: 25, cam: { k: 1.75, x: 960, y: 560 },
        moves: [[3.3, 5.2, { k: 1.37, x: 832, y: 557 }], [9.4, 11.2, { k: endCam[0], x: endCam[1], y: endCam[2] }]] },
      tall: { W: 1080, H: 1500, label: 24, hubLabel: 30, cam: { k: 1.4, x: 540, y: 760 },
        moves: [[3.3, 5.2, { k: .9, x: 445, y: 800 }], [9.4, 11.2, { k: .84, x: 430, y: 800 }]] }
    };
    var T = { introIn: [0, .9], introOut: [2.6, 3.3], mapUp: [2.4, 3.4], eyebrow: 10.3, title: 10.5, body: 10.8, stats: [11.6, 11.9, 12.2, 12.5], END: 13.6 };
    function clamp(v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, v)); }
    function prog(t, a, b) { return clamp((t - a) / (b - a)); }
    function eOut(x) { return 1 - Math.pow(1 - x, 3); }
    function eIO(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function lerp(a, b, x) { return a + (b - a) * x; }
    var anim = {}; Array.prototype.slice.call(root.querySelectorAll('[data-anim]')).forEach(function (el) { anim[el.getAttribute('data-anim')] = el; });
    /* lite = touch / small screens: drop the costly per-frame effects and idle the loop when settled */
    var lite = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 820;
    var L = LAYOUT.wide, scale = 1, dpr = 1, mscale = 1, mox = 0, moy = 0, pw = 0, ph = 0;
    function layout() {
      var portrait = frame.parentElement.clientWidth < 760 && window.innerHeight > window.innerWidth;
      reach.classList.toggle('gr-is-portrait', portrait);
      L = portrait ? LAYOUT.tall : LAYOUT.wide;
      scale = frame.clientWidth / L.W;
      if (portrait) {
        /* stage height tracks the frame; copy, map and stats compose in a band capped at 1900 units */
        L.H = Math.max(1180, Math.round(L.W * frame.clientHeight / frame.clientWidth));
        var HC = Math.min(L.H, 1900);
        stage.style.setProperty('--gr-pad', Math.round((L.H - HC) / 2) + 'px');
        stage.style.setProperty('--gr-t', Math.max(.74, Math.min(1, HC / 1900)).toFixed(3));
        L.kScale = Math.max(.5, Math.min(1, HC / 2100));
        var hdr = (document.querySelector('.cmp-site-header') || {}).offsetHeight || 64;
        var topU = Math.max(110 + Math.round((L.H - HC) / 2), Math.round((hdr + 28) / scale));
        stage.style.setProperty('--gr-top', topU + 'px');
        L.dy = Math.round(L.H / 2 - 805 + Math.max(0, topU - 110 - (L.H - HC) / 2) / 2);
        stage.style.height = L.H + 'px';
      } else { L.kScale = 1; stage.style.height = ''; }
      stage.style.transform = 'scale(' + scale + ')';
      dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
      pw = pin.clientWidth; ph = pin.clientHeight;
      /* landscape scales by width so the end frame always shows every city; portrait covers */
      mscale = L === LAYOUT.tall ? Math.max(pw / L.W, ph / L.H) : pw / L.W;
      mox = (pw - L.W * mscale) / 2; moy = (ph - L.H * mscale) / 2;
      cv.width = Math.round(pw * dpr); cv.height = Math.round(ph * dpr);
      draw(now());
    }
    function mix(a, b, x) { return { k: lerp(a.k, b.k, x), x: lerp(a.x, b.x, x), y: lerp(a.y, b.y, x) }; }
    function camera(t) {
      var c = L.cam, from = L.cam;
      L.moves.forEach(function (m) { if (t >= m[0]) c = mix(from, m[2], eIO(prog(t, m[0], m[1]))); from = m[2]; });
      var D = C.dubai.p, k = c.k * (L.kScale || 1);
      return { k: k, tx: c.x - D[0] * k, ty: c.y + (L.dy || 0) - D[1] * k };
    }
    function qpt(r, u) { var v = 1 - u; return [v * v * r.A[0] + 2 * v * u * r.Q[0] + u * u * r.B[0], v * v * r.A[1] + 2 * v * u * r.Q[1] + u * u * r.B[1]]; }
    /* canvas palette: RGB triplets from the --gr-* tokens on the root; unset = the navy film */
    var PAL_DEF = { ocean: '130,160,220', oceanA: '1', land: '150,180,228', landA: '1', arc: '58,118,255', glow: '120,165,255', glowA: '1', glowEdge: '47,109,255', glowLite: '96,150,240', shadowA: '.9', ring: '110,160,255', node: '58,118,255', core: '255,255,255', label: '255,255,255', head: '207,224,255' };
    var pal = PAL_DEF;
    function readPal() {
      var cs = getComputedStyle(root), o = {};
      Object.keys(PAL_DEF).forEach(function (k) { o[k] = cs.getPropertyValue('--gr-' + k.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); })).trim().replace(/\s+/g, '') || PAL_DEF[k]; });
      ['oceanA', 'landA', 'glowA', 'shadowA'].forEach(function (k) { o[k] = parseFloat(o[k]); if (isNaN(o[k])) o[k] = parseFloat(PAL_DEF[k]); });
      pal = o;
    }
    readPal();
    /* Arabic (lang="ar" on the section or <html>): city labels in Arabic, Tajawal */
    var AR = /^ar\b/i.test(((root.closest('[lang]') || document.documentElement).getAttribute('lang') || ''));
    var FONT = AR ? "'Tajawal','Plus Jakarta Sans',sans-serif" : "'Plus Jakarta Sans',sans-serif";
    new MutationObserver(function () { readPal(); draw(now()); }).observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    function glowDot(x, y, rad, alpha) {
      alpha *= pal.glowA;
      if (lite) { ctx.fillStyle = 'rgba(' + pal.glowLite + ',' + (alpha * .5).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, rad * .7, 0, 7); ctx.fill(); return; }
      var g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(' + pal.glow + ',' + alpha + ')'); g.addColorStop(1, 'rgba(' + pal.glowEdge + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
    }
    function draw(t) {
      var cam = camera(t), S = function (p) { return [p[0] * cam.k + cam.tx, p[1] * cam.k + cam.ty]; };
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(mscale * dpr, 0, 0, mscale * dpr, mox * dpr, moy * dpr);
      var cx0 = -mox / mscale - 4, cx1 = (pw - mox) / mscale + 4, cy0 = -moy / mscale - 4, cy1 = (ph - moy) / mscale + 4;
      /* soft light that follows Dubai */
      var hub = S(C.dubai.p);
      pin.style.setProperty('--gx', ((hub[0] * mscale + mox) / pw * 100).toFixed(1) + '%');
      pin.style.setProperty('--gy', ((hub[1] * mscale + moy) / ph * 100).toFixed(1) + '%');
      /* land dots, bucketed by alpha to keep fillStyle changes low */
      var mapA = lerp(.28, 1, eIO(prog(t, T.mapUp[0], T.mapUp[1])));
      var r = 1.55 * Math.pow(cam.k, .75), sig2 = 2 * Math.pow((L.W < L.H ? 1000 : 620) * Math.max(1, cam.k * .8), 2), B = 10, paths = [], i, x, y;
      for (i = 0; i < B; i++) paths.push(new Path2D());
      /* faint full-grid underlay (ocean + land) so the dotted map reaches both margins */
      var bg = new Path2D(), bgStep = lite ? 4 : 2;
      for (i = 0; i < GALL.length; i += bgStep) {
        x = GALL[i] * cam.k + cam.tx; y = GALL[i + 1] * cam.k + cam.ty;
        if (x < cx0 || y < cy0 || x > cx1 || y > cy1) continue;
        bg.moveTo(x + r, y); bg.arc(x, y, r, 0, 6.2832);
      }
      ctx.fillStyle = 'rgba(' + pal.ocean + ',' + (.05 * mapA * pal.oceanA).toFixed(3) + ')'; ctx.fill(bg);
      for (i = 0; i < DOTS.length; i += 2) {
        x = DOTS[i] * cam.k + cam.tx; y = DOTS[i + 1] * cam.k + cam.ty;
        if (x < cx0 || y < cy0 || x > cx1 || y > cy1) continue;
        var d2 = (x - hub[0]) * (x - hub[0]) + (y - hub[1]) * (y - hub[1]);
        var a = .12 + .88 * Math.exp(-d2 / sig2), bi = Math.min(B - 1, Math.floor(a * B));
        paths[bi].moveTo(x + r, y); paths[bi].arc(x, y, r, 0, 6.2832);
      }
      for (i = 0; i < B; i++) { ctx.fillStyle = 'rgba(' + pal.land + ',' + ((i + .5) / B * .5 * mapA * pal.landA).toFixed(3) + ')'; ctx.fill(paths[i]); }
      /* arcs */
      ctx.lineCap = 'round';
      ARCS.forEach(function (rc, ri) {
        var u = eOut(prog(t, rc.t0, rc.t0 + rc.d)); if (u <= 0) return;
        var N = 64, n = Math.max(2, Math.ceil(N * u)), j, q;
        ctx.beginPath();
        for (j = 0; j <= n; j++) { q = S(qpt(rc, Math.min(u, j / N))); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
        if (!lite) { ctx.shadowColor = 'rgba(' + pal.glowEdge + ',' + pal.shadowA + ')'; ctx.shadowBlur = 10; }
        ctx.strokeStyle = 'rgba(' + pal.arc + ',.95)'; ctx.lineWidth = 2.2; ctx.stroke();
        ctx.shadowBlur = 0;
        if (u < 1) { var h = S(qpt(rc, u)); glowDot(h[0], h[1], 18, .85); ctx.fillStyle = 'rgb(' + pal.head + ')'; ctx.beginPath(); ctx.arc(h[0], h[1], 2.6, 0, 7); ctx.fill(); }
        /* travelling light packets once the story has finished */
        if (t > T.END) {
          var per = 5.5, ph2 = ((t - T.END + ri * .8) % per) / per;
          if (ph2 < .45) { var w = ph2 / .45; q = S(qpt(rc, eIO(w))); glowDot(q[0], q[1], 10, .7 * Math.sin(w * Math.PI)); }
        }
      });
      /* city nodes + labels */
      ctx.textBaseline = 'middle';
      Object.keys(C).forEach(function (key) {
        var c = C[key], ta = ARRIVE[key]; if (ta === undefined || t < ta) return;
        var a = eOut(prog(t, ta, ta + .5)), pt = S(c.p), x = pt[0], y = pt[1];
        var rp = prog(t, ta, ta + 1.1);
        if (rp > 0 && rp < 1) { ctx.strokeStyle = 'rgba(' + pal.ring + ',' + (.7 * (1 - rp)) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 4 + rp * (c.hub ? 34 : 22), 0, 7); ctx.stroke(); }
        if (c.hub && t > T.END) { var ip = ((t - T.END) % 3) / 3; ctx.strokeStyle = 'rgba(' + pal.ring + ',' + (.45 * (1 - ip)) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 5 + ip * 26, 0, 7); ctx.stroke(); }
        glowDot(x, y, c.hub ? 20 : 12, .6 * a);
        ctx.fillStyle = 'rgba(' + pal.node + ',' + a + ')'; ctx.beginPath(); ctx.arc(x, y, c.hub ? 5.5 : 4, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(' + pal.core + ',' + a + ')'; ctx.beginPath(); ctx.arc(x, y, c.hub ? 2.6 : 1.9, 0, 7); ctx.fill();
        var fs = c.hub ? L.hubLabel : L.label, k = L === LAYOUT.tall ? 1.5 : 1;
        ctx.font = (c.hub ? 600 : 500) + ' ' + fs + 'px ' + FONT;
        var lb = (L === LAYOUT.tall && LAB[key].labTall) || LAB[key].lab;
        ctx.textAlign = lb[2];
        ctx.fillStyle = 'rgba(' + pal.label + ',' + (.94 * a) + ')';
        ctx.fillText(AR ? c.ar : c.n, x + lb[0] * k, y + lb[1] * k + (1 - a) * 6);
      });
      /* HTML copy, driven by the same clock */
      var inA = eOut(prog(t, T.introIn[0], T.introIn[1])), outA = eIO(prog(t, T.introOut[0], T.introOut[1]));
      set('intro', inA * (1 - outA), (1 - inA) * 18 - outA * 10, outA * 6);
      [['eyebrow', T.eyebrow], ['title', T.title], ['body', T.body]].forEach(function (e) { var x = eOut(prog(t, e[1], e[1] + .9)); set(e[0], x, (1 - x) * 22); });
      T.stats.forEach(function (t0, i) {
        var x = eOut(prog(t, t0, t0 + .9)); set('stat' + i, Math.min(1, x * 1.4), (1 - x) * 18);
        var st = anim['stat' + i]; if (st && st.firstElementChild) st.firstElementChild.style.transform = 'scaleX(' + eIO(prog(t, t0 - .2, t0 + .8)) + ')';
      });
    }
    /* opacity honours the line's tier (--gr-o from gr-tier-2/3) */
    var base = {};
    Object.keys(anim).forEach(function (k) { base[k] = parseFloat(getComputedStyle(anim[k]).getPropertyValue('--gr-o')) || 1; });
    function set(k, o, y, blur) {
      var el = anim[k]; if (!el) return;
      el.style.opacity = (o * base[k]).toFixed(3);
      el.style.transform = (k === 'intro' ? 'translateY(-50%) ' : '') + 'translateY(' + y.toFixed(1) + 'px)';
      el.style.filter = blur ? 'blur(' + blur.toFixed(1) + 'px)' : '';
    }
    /* clock: scroll position drives the timeline */
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var qs = new URLSearchParams(location.search), fixedT = qs.has('t') ? parseFloat(qs.get('t')) : null, T0 = 1.0;
    var shown = T0, endAt = 0, raf = 0, visible = false;
    function target() { var r = track.getBoundingClientRect(), run = r.height - innerHeight; return lerp(T0, T.END, clamp(-r.top / run)); }
    function now() { return fixedT !== null ? fixedT : reduce ? T.END : shown; }
    function step() {
      raf = 0;
      var goal = target(), moving = Math.abs(goal - shown) >= .002;
      shown = moving ? shown + (goal - shown) * .14 : goal;
      var t = shown, ambient = !lite && shown >= T.END;
      if (ambient) { if (!endAt) endAt = performance.now(); t = T.END + .001 + (performance.now() - endAt) / 1000; } else endAt = 0;
      draw(t);
      if (hint) hint.style.opacity = clamp(1 - (shown - T0) / .6).toFixed(2);
      if (visible && !reduce && fixedT === null && (moving || ambient)) raf = requestAnimationFrame(step);
    }
    function kick() { if (visible && !raf && !reduce && fixedT === null) raf = requestAnimationFrame(step); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible = e.isIntersecting; if (visible) kick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } });
    }).observe(track);
    addEventListener('scroll', kick, { passive: true });
    if (window.DS && DS.lenis && DS.lenis.on) DS.lenis.on('scroll', kick);
    if (hint && (reduce || fixedT !== null)) hint.style.display = 'none';
    addEventListener('resize', function () { layout(); kick(); });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { layout(); draw(now()); });
    layout();
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
    b.innerHTML='<img class="hx-flag" src="'+DS.asset('images/shared/flags/'+m.flag+'.svg')+'" alt="" loading="lazy">'
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
    window.addEventListener('resize', function () { lastY = -1; update(); if (window.innerWidth > 1280) closeDrawer(); });
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

    // Mobile drawer — below 1280px the primary .ish-menu is hidden (CSS) and the
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
      // PLAIN-LINK NAV (2026-09-07): a satellite site (ibv2/ = Emirates NBD
      // Capital) ships .ish-menu as bare <a> links with no [data-mega]. The v4
      // segment accordions would have nothing to drill into, so the bar
      // collapses to the compact selector and the links mirror as a flat list.
      var plainLinks = Array.prototype.filter.call(root.querySelectorAll('.ish-menu > a'), function (a) { return a.getAttribute('href'); });
      var isPlain = !megas.length && plainLinks.length > 0;
      if (segs && isV4 && !isPlain) {
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
      if (isPlain) {
        var pcols = document.createElement('div'); pcols.className = 'ish-drawer-cols';
        var pcol = document.createElement('div'); pcol.className = 'ish-col';
        plainLinks.forEach(function (a) { var c = a.cloneNode(true); c.className = ''; pcol.appendChild(c); });
        pcols.appendChild(pcol); viewRoot.appendChild(pcols);
      }
      // 2. Mega-menus — one collapsible section each. (v4 WITH a segment bar:
      //    skipped — the segment accordions above carry the nav; Login is
      //    skipped too. A v4 satellite with no .ish-segments has nothing else
      //    carrying the nav, so its megas mirror here like v1/v2.)
      if (!isV4 || !segs) megas.forEach(function (m) {
        var trig = m.querySelector('.ish-menu-trigger'); var inner = m.querySelector('.ish-panel-inner');
        if (inner) section(trig ? trig.textContent.replace(/\s+/g, ' ').trim() : '', inner.cloneNode(true));
      });
      // v4 satellite, mixed nav: bare .ish-menu links follow the mega
      // sections so the drawer mirrors the bar's order.
      if (isV4 && !segs && megas.length && plainLinks.length) {
        var scols = document.createElement('div'); scols.className = 'ish-drawer-cols';
        var scol = document.createElement('div'); scol.className = 'ish-col';
        plainLinks.forEach(function (a) { var c = a.cloneNode(true); c.className = ''; scol.appendChild(c); });
        scols.appendChild(scol); viewRoot.appendChild(scols);
      }
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
