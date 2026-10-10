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
      var emptyEl = root.querySelector('[data-filter-empty]');
      var active = {};
      var query = '';
      function matches(item) {
        for (var key in active) {
          var want = active[key]; if (!want) continue;
          var have = (item.getAttribute('data-filter-' + key) || '').toLowerCase();
          if (have.split(/[\s,]+/).indexOf(want.toLowerCase()) === -1) return false;
        }
        if (query && (item.textContent || '').toLowerCase().indexOf(query) === -1) return false;
        return true;
      }
      function apply() {
        var shown = 0;
        items.forEach(function (it) { var ok = matches(it); it.hidden = !ok; if (ok) shown++; });
        if (countEl) countEl.textContent = String(shown);
        if (emptyEl) emptyEl.hidden = shown !== 0;
      }
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
            data-lottie-src="assets/lottie/name.json"
            data-lottie-loop="true" data-lottie-speed="1">
         <img class="lot-poster" src="assets/lottie/name.png" alt="">
       </div>
     The player is VENDORED (assets/js/lottie_light.min.js, pinned) and
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
  // Header: when the active customer segment is Corporate & institutional,
  // point the brand logo at the C&IB home so clicking it returns the user
  // there (only inside C&IB; other segments keep their own logo href).
  function linkSegmentLogo(scope) {
    var root = scope || document;
    var seg = root.querySelector('.ish-segments a.is-active');
    if (!seg || !/institutional/i.test(seg.textContent || '')) return;
    // Logo always returns to the new C&IB home (Ram, 2026-10-01), resolved from
    // ds.js's own URL so it works from sub-folders (ibv2/) and file:// alike.
    var ds = document.querySelector('script[src*="assets/js/ds.js"]');
    var home = ds ? new URL('../../cib-home-final.html', ds.src).href : 'cib-home-final.html';
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
    src: '/assets/images/shared/common/dotted-map-clear.svg',
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
    src: '/assets/images/shared/common/hex-map-base.svg',
    accentSrc: '/assets/images/shared/common/hex-map-accent.svg',       /* highlighted market tiles (cluster) */
    accentSingleSrc: '/assets/images/shared/common/hex-map-accent-single.svg', /* one tile per market */
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
  /* artwork URLs ride the site ?v= (read from the ds.css link) so artwork
     edits reach browsers through the same cache-bust ritual as css/js */
  var wmV=(function(){ var l=document.querySelector('link[href*="ds.css"]'); var m=l&&l.href.match(/[?&]v=(\w+)/); return m?m[1]:null; })();
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
        b.innerHTML='<img class="hx-flag" src="/assets/images/shared/flags/'+(p.flag||'')+'.svg" alt="" loading="lazy"><span class="hx-name"></span>';
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
    function measure(){
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
     assets/js/tabs-desk.js) so instances receive master changes. Chips pick a
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
    b.innerHTML='<img class="hx-flag" src="/assets/images/shared/flags/'+m.flag+'.svg" alt="" loading="lazy">'
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
