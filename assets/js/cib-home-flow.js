/* ══════════════════════════════════════════════════════════════════════════
   cib-home-flow.js · C&IB home "flow" motion system (vanilla, no dependencies)
   Loaded in <head> without defer so the motion class is on <html> before
   first paint; everything else waits for DOMContentLoaded. Copied from
   cib-v7a.js where reused (never linked) and re-cut for continuous,
   scroll-linked motion instead of slide builds:

   · Hero "the frame that becomes the row": the viewport is the phone screen
     (skyline loops), the camera pulls back to the phone in front of the
     HQ, the real ENBD Business screen assembles and scrolls, then the phone
     shrinks into the first tile (Digital solutions) as its card forms around
     it, the five photo tiles fan out beside it, the world fades to the white
     canvas, the pin releases and the row is a scroll-snap carousel (DS
     btn-icon arrows). The skyline clip loops while it is on screen.
   · Section clips play ONCE when the pointer enters their band (touch: 50%
     in view, keyboard: focus); a clip longer than 5s gets the DS pause
     btn-icon while it plays (WCAG 2.2.2)
   · [data-parallax="n"] media drift by n px (y) across the section
   · [data-hf-drift] carousel tracks drift 40px sideways into place with the
     scroll until the user touches them
   · Lending "With a desk for ____.": desktop pin rolls the reel, photo and
     desk card with the scroll; the chips choose at every size
   · [data-seq] UI fragments (chat typing, payment) appear in order
   · network film: mobile sequence swap + reduced-motion still (DS recipe)
   · QR iOS | Android toggle, skip-link focus
   Count-ups and carousels are the DS recipes (ds-cib-v6-base.js).
   Reduced motion: no pin, no parallax, no drift, posters only.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var root = document.documentElement;
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var REDUCED = mqReduce.matches;

  if (!REDUCED) root.classList.add('hf-js');

  /* Network film (DS scroll-frames): pick the sequence for this breakpoint
     BEFORE the DS recipe initialises (this listener is registered first, the
     DS script is deferred); under reduced motion the recipe is not bound at
     all and the last frame shows as a still. */
  document.addEventListener('DOMContentLoaded', function () {
    // two players (desktop landscape / phone portrait), CSS shows one; each gets
    // its own still under the canvas, loaded only when that player is near view
    Array.prototype.forEach.call(document.querySelectorAll('.hf-netfilm__scrub'), function (sf) {
      var img = sf.querySelector('.hf-netfilm__still');
      if (REDUCED) { sf.removeAttribute('data-behavior'); if (img) img.src = img.getAttribute('data-still'); return; }
      if (!img) return;
      var first = sf.getAttribute('data-path').replace(/#+/, '001');
      var put = function () { img.src = first; };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); put(); } }, { rootMargin: '150% 0px' });
        io.observe(sf);
      } else put();
    });
  });

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  function absTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }

  var vw = 0, vh = 0, isMobile = false;
  function readViewport() { vw = window.innerWidth; vh = window.innerHeight; isMobile = vw < 768; }
  function videoSrc(v) { return (isMobile && v.getAttribute('data-src-m')) || v.getAttribute('data-src'); }

  /* ── Section clips: play ONCE, then hold the last clean frame ─────────── */
  var clips = [], lastY = null;
  var NOHOVER = window.matchMedia ? window.matchMedia('(hover: none)').matches : false;
  function prime(c) {
    if (!c || c.primed || REDUCED) return; c.primed = true;
    var v = c.v; v.preload = 'auto'; v.src = videoSrc(v); v.load();
    v.addEventListener('loadedmetadata', function () { if (c.a > 0 && v.currentTime < c.a) v.currentTime = c.a; }, { once: true });
  }
  function isLong(c) {
    var end = c.b > 999 ? (c.v.duration || 0) : c.b;
    return end - c.a > 5;
  }
  function syncBtn(c) {
    var b = c.btn; if (!b) return;
    var show = c.played && !c.done && isLong(c);
    b.hidden = !show;
    var paused = c.v.paused;
    b.classList.toggle('is-pause', !paused);
    b.classList.toggle('is-play', paused);
    b.querySelector('.sr-only').textContent = paused ? 'Play video' : 'Pause video';
  }
  function start(c) {
    if (!c || c.played || REDUCED) return;
    c.played = true; prime(c);
    var v = c.v;
    var go = function () {
      if (v.currentTime < c.a) v.currentTime = c.a;
      var pr = v.play();
      if (pr && pr.then) pr.then(function () { v.classList.add('is-ready'); syncBtn(c); }, function () { c.played = false; syncBtn(c); });
      else { v.classList.add('is-ready'); syncBtn(c); }
    };
    if (v.readyState >= 2) go(); else v.addEventListener('canplay', go, { once: true });
    var stop = function (t) { if (t >= c.b) { v.pause(); c.done = true; syncBtn(c); return true; } return false; };
    if (v.requestVideoFrameCallback) {
      var f = function (now, meta) { if (!stop(meta.mediaTime)) v.requestVideoFrameCallback(f); };
      v.requestVideoFrameCallback(f);
    } else {
      v.addEventListener('timeupdate', function tu() { if (stop(v.currentTime)) v.removeEventListener('timeupdate', tu); });
    }
    v.addEventListener('ended', function () { c.done = true; syncBtn(c); }, { once: true });
    v.addEventListener('pause', function () { syncBtn(c); });
    v.addEventListener('play', function () { syncBtn(c); });
  }
  function checkBands() {
    if (lastY === null) return;
    for (var i = 0; i < clips.length; i++) {
      var c = clips[i]; if (c.played || c.hero) continue;
      var r = c.band.getBoundingClientRect();
      if (lastY >= r.top && lastY <= r.bottom) start(c);
    }
  }
  function initOnce() {
    clips = $$('video[data-once]').map(function (v) {
      var w = v.getAttribute('data-once').split(',').map(parseFloat);
      var band = v.closest('section') || v.parentNode;
      var host = v.closest('[data-hf-band]') || band;
      return { v: v, a: w[0], b: w[1], band: band, btn: host.querySelector('[data-hf-pause]') };
    });
    if (REDUCED || !clips.length) return;
    clips.forEach(function (c) {
      if (!c.btn) return;
      c.btn.addEventListener('click', function () {
        if (c.v.paused) { var pr = c.v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else c.v.pause();
      });
    });
    if ('IntersectionObserver' in window) {
      var ioPre = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { prime(e.target.__clip); ioPre.unobserve(e.target); } });
      }, { rootMargin: '100% 0px 100% 0px' });
      clips.forEach(function (c) { c.band.__clip = c; ioPre.observe(c.band); });
      if (NOHOVER) {
        var ioHalf = new IntersectionObserver(function (es) {
          es.forEach(function (e) { var c = e.target.__clip; if (c && !c.hero && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= vh * 0.5)) start(c); });
        }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
        clips.forEach(function (c) { ioHalf.observe(c.band); });
      }
    }
    clips.forEach(function (c) {
      c.band.addEventListener('focusin', function () { start(c); });
    });
    window.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; lastY = e.clientY; request(); }, { passive: true });
  }

  /* ── Section loops: [data-loop] clips play continuously (muted, no hover
     trigger), loaded as they approach and paused while off screen ──────── */
  function initLoops() {
    var loops = $$('video[data-loop]');
    if (REDUCED || !loops.length) return;
    loops.forEach(function (v) {
      v.loop = true; v.muted = true;
      v.addEventListener('playing', function () { v.classList.add('is-ready'); }, { once: true });
    });
    function load(v) { if (v.__loaded) return; v.__loaded = true; v.preload = 'auto'; v.src = videoSrc(v); v.load(); }
    function play(v) { load(v); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    if (!('IntersectionObserver' in window)) { loops.forEach(play); return; }
    var ioNear = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { load(e.target); ioNear.unobserve(e.target); } });
    }, { rootMargin: '100% 0px 100% 0px' });
    var ioOn = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) play(e.target); else if (!e.target.paused) e.target.pause(); });
    }, { threshold: 0.01 });
    loops.forEach(function (v) { ioNear.observe(v); ioOn.observe(v); });
  }

  /* ── HERO · pull-back, app screen, fan-out into the row ──────────────── */
  var hero = null, H = {}, heroP = 0;
  var PW = 273, PH = 564, SW = 249, SH = 540, SR = 42;   // phone + screen design size
  var WW = Math.round(SH * 16 / 9), WH = SH;              // wallpaper covers the screen (16:9 film)
  // timeline (share of the pinned run)
  var T = { pull: .34, wallOut: [.34, .05], top: .36, tab: .385, bands: [.40, .42, .44, .47],
            capL: .45, capR: .50, scroll: [.50, .17], capsOut: .69, fan: [.70, .20], world: [.74, .14],
            head: .84, ctas: .88, row: .92 };

  function coverScale(w, h, r, halfW, halfH) {
    // smallest scale so the rounded screen rect contains the viewport, corners included
    var s = Math.max(2 * halfW / w, 2 * halfH / h);
    for (var i = 0; i < 400; i++) {
      var W2 = w * s / 2, H2 = h * s / 2, R = r * s;
      var dx = Math.max(0, halfW - (W2 - R)), dy = Math.max(0, halfH - (H2 - R));
      if (halfW <= W2 && halfH <= H2 && (dx * dx + dy * dy) <= R * R) return s;
      s *= 1.01;
    }
    return s;
  }

  // tiles are a fixed size (the act 4 card: 323 x 540, mobile 380 x 590), set in CSS
  function sizeTiles() { return H.tiles[0] ? H.tiles[0].el.offsetHeight : (isMobile ? 590 : 540); }
  // the phone's resting scale inside the Digital solutions card (above its text block)
  function sizeCardPhone() {
    var bodyH = H.digBody.offsetHeight + 8;
    H.el.style.setProperty('--dig-body', bodyH + 'px');
    var sw = H.slot.clientWidth, sh = H.slot.clientHeight;
    var ps = Math.max(0.2, Math.min(sh / PH, (sw - 24) / PW));
    H.el.style.setProperty('--ps', ps.toFixed(4));
    return ps;
  }

  function measureHero() {
    if (!H.el) return;
    if (!hero) {                                   // static (reduced motion): size the row, phone at rest in its card
      sizeCardPhone();
      H.scrollMax = Math.max(0, H.scroll.offsetHeight - (H.view.offsetHeight - H.tab.offsetHeight));
      H.scroll.style.transform = 'translate3d(0,' + (-H.scrollMax) + 'px,0)';
      return;
    }
    var brand = document.querySelector('.cmp-site-header .ish-brand');
    var hdr = (brand && brand.offsetHeight) || (isMobile ? 64 : 68);
    var rowTop = hdr + (isMobile ? 14 : 24), rowBot = isMobile ? 18 : 28;
    H.el.style.setProperty('--row-top', rowTop + 'px');
    H.el.style.setProperty('--row-bot', rowBot + 'px');
    // clear transforms so the composed layout can be measured
    H.phone.style.transform = '';
    H.tiles.forEach(function (t) { t.el.style.transform = ''; t.el.style.opacity = ''; });
    H.track.scrollLeft = 0;
    var tcs = getComputedStyle(H.track);
    var trackExtra = parseFloat(tcs.marginTop) + parseFloat(tcs.paddingTop) + parseFloat(tcs.paddingBottom);
    var ccs = getComputedStyle(H.ctas);
    var ctaH = H.ctas.offsetHeight + parseFloat(ccs.marginTop);
    var tileH = sizeTiles();
    // the composed row may be taller than the viewport (mobile 590px tiles): the
    // stage grows to fit and the pin simply releases with the CTAs below the fold
    H.stageH = Math.max(vh, Math.ceil(rowTop + rowBot + H.head.offsetHeight + trackExtra + tileH + ctaH));
    H.el.style.setProperty('--stage-h', H.stageH + 'px');
    H.el.style.setProperty('--stage-extra', (H.stageH - vh) + 'px');
    H.el.style.setProperty('--hero-top', Math.max(0, H.el.getBoundingClientRect().top + window.pageYOffset) + 'px');   // at rest the stage starts below the utility bar
    var psCard = sizeCardPhone();
    var stageR = H.stage.getBoundingClientRect(), slotR = H.slot.getBoundingClientRect(), trackR = H.track.getBoundingClientRect();
    H.cx = slotR.left - stageR.left + slotR.width / 2;          // resting place in the card
    H.cy = slotR.top - stageR.top + slotR.height / 2;
    H.X0 = vw / 2;                                              // centre stage after the pull-back
    H.Y0 = Math.min(trackR.top - stageR.top + parseFloat(tcs.paddingTop) + tileH / 2, vh * 0.56);
    H.sBig = Math.min(tileH * (isMobile ? 0.84 : 0.98), vh - 2 * rowTop) / PH;      // centred, clear of the header
    H.psCard = psCard;
    H.el.style.setProperty('--pcy', Math.round(H.Y0) + 'px');
    H.el.style.setProperty('--phw', Math.round(PW * H.sBig) + 'px');
    H.el.style.setProperty('--phh', Math.round(PH * H.sBig) + 'px');
    H.s0 = coverScale(SW, SH, SR, vw / 2 + 2, vh / 2 + 2);
    // short viewports: the scroll cue sits 48px below the headline
    if (H.cue) { var h1 = H.copy.querySelector('h1'); H.el.style.setProperty('--cue-top', Math.round(h1.getBoundingClientRect().bottom - stageR.top + 48) + 'px'); }
    var dr = H.dig.getBoundingClientRect();
    H.digCX = dr.left - stageR.left + dr.width / 2;
    var tl = trackR.left - stageR.left;
    H.tiles.forEach(function (t) { t.cx = tl + t.el.offsetLeft + t.el.offsetWidth / 2; });
    H.top = absTop(hero);
    H.run = hero.offsetHeight - H.stageH;
    H.wall.style.setProperty('--ww', WW + 'px');
    H.wall.style.setProperty('--wh', WH + 'px');
    H.scrollMax = Math.max(0, H.scroll.offsetHeight - (H.view.offsetHeight - H.tab.offsetHeight));
  }

  var lastP = -1;
  function renderHero() {
    if (!hero || !H.run) return;
    var p = clamp((window.pageYOffset - H.top) / H.run, 0, 1);
    if (Math.abs(p - lastP) < 0.0002) return;
    lastP = p; heroP = p;
    var q = easeInOut(clamp(p / T.pull, 0, 1));
    var r = clamp((p - T.fan[0]) / T.fan[1], 0, 1);
    var m = easeInOut(clamp(r / 0.45, 0, 1));                 // the phone shrinks into its card
    // pull-back: full-screen phone to the centre of the row; then into the card
    var S = Math.exp(lerp(Math.log(H.s0), Math.log(H.sBig), q));
    S = Math.exp(lerp(Math.log(S), Math.log(H.psCard), m));
    var X = lerp(H.X0, H.cx, m);
    var Y = lerp(lerp(vh / 2, H.Y0, q), H.cy, m);
    var tx = X - H.cx, ty = Y - H.cy;
    var dCover = Math.max(vw / WW, (vh + 2 * Math.abs(vh / 2 - Y)) / WH) * 1.02;
    var D = Math.min(S, dCover);
    H.phone.style.transform = (m >= 1) ? '' : 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + S.toFixed(4) + ')';
    H.wall.style.transform = 'scale(' + (D / S).toFixed(4) + ')';
    // the clip hands over to the plate as soon as the pull-back starts; the
    // transparent screen then shows the same plate, so there is no seam
    var wallOp = 1 - clamp((p - 0.01) / 0.04, 0, 1);
    H.wall.style.opacity = wallOp.toFixed(3);
    // phone chrome only once it is within 1.6x of its resting size
    var pk = m > 0 ? 1 : clamp(Math.log(1.6 * H.sBig / S) / Math.log(1.6), 0, 1);
    H.phone.style.setProperty('--pk', pk.toFixed(3)); H.phonePk = pk;
    H.phone.style.setProperty('--pk2', clamp((pk - 0.7) / 0.3, 0, 1).toFixed(3));
    H.phone.style.setProperty('--app', clamp((p - T.wallOut[0]) / T.wallOut[1], 0, 1).toFixed(3));
    H.plate.style.transform = 'scale(' + (1.08 - 0.08 * q).toFixed(4) + ')';
    H.world.style.opacity = (1 - easeInOut(clamp((p - T.world[0]) / T.world[1], 0, 1))).toFixed(3);
    // the card chrome (navy surface, tag, text) forms around the phone as it lands
    H.el.style.setProperty('--chrome', easeOut(clamp((r - 0.28) / 0.34, 0, 1)).toFixed(3));
    H.copy.style.opacity = (1 - clamp(p / 0.12, 0, 1)).toFixed(3);
    H.copy.style.transform = 'translateY(' + (-60 * easeOut(clamp(p / 0.15, 0, 1))).toFixed(1) + 'px)';
    H.copy.style.visibility = p > 0.14 ? 'hidden' : 'visible';
    var veil = (1 - 0.65 * clamp(p / 0.15, 0, 1));
    H.veil.style.opacity = veil.toFixed(3);
    if (H.wveil) H.wveil.style.opacity = (veil * (1 - wallOp)).toFixed(3);   // same tint on the plate once it shows through
    if (H.cue) { H.cue.style.opacity = (1 - clamp(p / 0.03, 0, 1)).toFixed(3); H.cue.style.visibility = p > 0.03 ? 'hidden' : 'visible'; }
    // the real screen assembles, then scrolls like a real app
    for (var i = 0; i < T.bands.length; i++) H.bands[i].classList.toggle('is-in', p >= T.bands[i]);
    H.tabbar.classList.toggle('is-in', p >= T.tab);
    H.topbar.classList.toggle('is-in', p >= T.top);
    var sc = easeInOut(clamp((p - T.scroll[0]) / T.scroll[1], 0, 1));
    H.scroll.style.transform = 'translate3d(0,' + (-Math.round(H.scrollMax * sc)) + 'px,0)';
    // glass captions: in beside the phone, drift, then leave before the fan-out
    var fl = clamp((p - T.capL) / 0.25, 0, 1);
    H.capL.style.setProperty('--drift', (-22 * fl).toFixed(1) + 'px');
    H.capR.style.setProperty('--drift', (18 * fl).toFixed(1) + 'px');
    var out = p >= T.capsOut;
    var phoneReads = H.phonePk >= 0.95;                        // captions only once it reads as a phone
    H.capL.classList.toggle('is-in', p >= T.capL && !out && phoneReads);
    H.capR.classList.toggle('is-in', p >= T.capR && !out && phoneReads);
    H.capL.classList.toggle('is-out', out);
    H.capR.classList.toggle('is-out', out);
    // then the five photo tiles fan out beside the Digital solutions card
    for (var k = 0; k < H.tiles.length; k++) {
      var t = H.tiles[k];
      var e = easeOut(clamp((r - 0.38 - k * 0.05) / 0.37, 0, 1));
      if (e >= 1) { t.el.style.transform = ''; t.el.style.opacity = ''; continue; }
      var sx = (H.digCX - t.cx) * (1 - e);
      t.el.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,0,0) scale(' + (0.9 + 0.1 * e).toFixed(4) + ')';
      t.el.style.opacity = clamp(e * 1.5, 0, 1).toFixed(3);
    }
    H.row.classList.toggle('is-head', p >= T.head);
    H.row.classList.toggle('is-ctas', p >= T.ctas);
    var rowOn = p >= T.row;
    H.track.classList.toggle('is-row', rowOn);
    if (!rowOn && H.track.scrollLeft) H.track.scrollLeft = 0;
    heroVideoVisible(wallOp > 0);
  }

  /* ── Hero clip: loops seamlessly while it is on screen ──────────────────
     The end frame differs from the first, so the last 0.5s crossfades the
     video out onto the poster (the clip's first frame) and the loop restarts
     from that same frame. Paused when off screen, when the tab is hidden and
     under reduced motion (poster only). The control is hidden until focused. */
  var HV = { v: null, want: true, onScreen: true, btn: null };
  function heroVideoVisible(on) {
    if (!HV.v || on === HV.onScreen) return;
    HV.onScreen = on;
    if (HV.btn) HV.btn.hidden = !on;
    syncHeroVideo();
  }
  function syncHeroVideo() {
    var v = HV.v; if (!v) return;
    var run = HV.want && HV.onScreen && !document.hidden;
    if (run && v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
    else if (!run && !v.paused) v.pause();
  }
  function initHeroVideo() {
    var v = document.querySelector('[data-hero-video]');
    HV.btn = document.querySelector('[data-hf-heropause]');
    if (!v) return;
    if (REDUCED) { if (HV.btn) HV.btn.hidden = true; return; }
    HV.v = v; v.loop = true;
    v.preload = 'auto'; v.src = videoSrc(v); v.load();
    var FADE = 0.5;
    var tick = function () {
      var d = v.duration;
      if (d) { var left = d - v.currentTime; v.style.opacity = left < FADE ? Math.max(0, left / FADE).toFixed(3) : '1'; }
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick);
    };
    v.addEventListener('playing', function () { v.classList.add('is-ready'); }, { once: true });
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick); else v.addEventListener('timeupdate', tick);
    syncHeroVideo();
    document.addEventListener('visibilitychange', syncHeroVideo);
    if (HV.btn) HV.btn.addEventListener('click', function () {
      HV.want = !HV.want;
      HV.btn.setAttribute('aria-pressed', HV.want ? 'false' : 'true');
      syncHeroVideo();
    });
  }

  function tweenScroll(track, to) {
    var from = track.scrollLeft, d = to - from;
    if (Math.abs(d) < 1) return;
    track.style.scrollSnapType = 'none';
    if (REDUCED) { track.scrollLeft = to; track.style.scrollSnapType = ''; return; }
    var t0 = null, dur = 420;
    (function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      track.scrollLeft = from + d * easeOut(k);
      if (k < 1) requestAnimationFrame(step); else track.style.scrollSnapType = '';
    })(performance.now());
  }

  function initHero() {
    H.el = document.querySelector('[data-hf-hero]');
    if (!H.el) return;
    H.stage = H.el.querySelector('.hf-hero__stage');
    H.world = H.el.querySelector('.hf-hero__world');
    H.dig = H.el.querySelector('[data-hf-digital]');
    H.slot = H.el.querySelector('.hf-tile--digital .hf-phone-slot');
    H.digBody = H.el.querySelector('.hf-tile--digital .hf-tile__body');
    H.phone = H.el.querySelector('.hf-phone');
    H.wall = H.el.querySelector('.hf-wall');
    H.veil = H.el.querySelector('.hf-wall__veil');
    H.wveil = H.el.querySelector('.hf-hero__veil');
    H.plate = H.el.querySelector('.hf-hero__plate');
    H.copy = H.el.querySelector('.hf-hero__copy');
    H.cue = H.el.querySelector('.hf-hero__cue');
    H.scroll = H.el.querySelector('.hf-app__scroll');
    H.bands = $$('.hf-band[data-band]', H.el).slice(0, 4);
    H.tabbar = H.el.querySelector('.hf-band--tab');
    H.topbar = H.el.querySelector('.hf-band--top');
    H.view = H.el.querySelector('.hf-app__view');
    H.tab = H.tabbar;
    H.capL = H.el.querySelector('.hf-hero__cap--l');
    H.capR = H.el.querySelector('.hf-hero__cap--r');
    H.row = H.el.querySelector('[data-hf-row]');
    H.head = H.el.querySelector('.hf-row__head');
    H.track = H.el.querySelector('[data-hf-track]');
    H.ctas = H.el.querySelector('.hf-hero__ctas');
    H.tiles = $$('[data-hf-tile]', H.el).map(function (el) { return { el: el }; });

    // DS btn-icon arrows: one tile per press, eased (snap held off while moving)
    var prev = H.el.querySelector('[data-hf-prev]'), next = H.el.querySelector('[data-hf-next]');
    function stepBy(dir) {
      var tr = H.track, max = tr.scrollWidth - tr.clientWidth;
      var step = (H.tiles[0] ? H.tiles[0].el.offsetWidth : 300) + 16;
      var target = clamp(Math.round((tr.scrollLeft + dir * step) / step) * step, 0, max);
      tweenScroll(tr, target);
    }
    function syncArrows() {
      var tr = H.track, max = tr.scrollWidth - tr.clientWidth;
      if (prev) prev.disabled = tr.scrollLeft <= 2;
      if (next) next.disabled = tr.scrollLeft >= max - 2;
    }
    if (prev) prev.addEventListener('click', function () { stepBy(-1); });
    if (next) next.addEventListener('click', function () { stepBy(1); });
    H.track.addEventListener('scroll', function () { requestAnimationFrame(syncArrows); }, { passive: true });
    H.syncArrows = syncArrows;

    if (REDUCED) { hero = null; return; }        // static final composition
    hero = H.el;
    hero.classList.add('is-live');
    // keyboard users tabbing into the row land on the composed end state
    H.row.addEventListener('focusin', function () {
      if (lastP < T.row) window.scrollTo(0, H.top + H.run * 0.97);
    });
  }

  /* ── Scroll-linked: parallax (y) + carousel drift (x) ────────────────── */
  var paras = [], drifts = [];
  function measureScroll() {
    paras.forEach(function (o) { o.top = absTop(o.host); o.h = o.host.offsetHeight; });
  }
  function renderScroll() {
    var y = window.pageYOffset;
    for (var j = 0; j < paras.length; j++) {
      var o = paras[j], t2 = o.top - y;
      if (t2 > vh + 100 || t2 + o.h < -100) continue;
      var t = clamp((vh - t2) / (vh + o.h), 0, 1);
      var py = ((t - 0.5) * 2 * o.n).toFixed(1);
      if (py === o.last) continue; o.last = py;
      o.el.style.transform = 'translate3d(0,' + py + 'px,0)';
    }
    for (var d = 0; d < drifts.length; d++) {
      var dr = drifts[d]; if (dr.off) continue;
      var rt = dr.el.getBoundingClientRect().top;
      if (rt > vh + 50 || rt < -dr.el.offsetHeight) continue;
      var x = Math.round(40 * (1 - easeOut(clamp((vh - rt) / (vh * 0.7), 0, 1))));
      if (x === dr.last) continue; dr.last = x;
      dr.el.style.transform = x ? 'translate3d(' + x + 'px,0,0)' : '';
    }
  }
  function initScrollFx() {
    if (REDUCED) return;
    paras = $$('[data-parallax]').map(function (el) {
      return { el: el, host: el.closest('.hf-film') || el.parentNode, n: parseFloat(el.getAttribute('data-parallax')) || 20 };
    });
    drifts = $$('[data-hf-drift]').map(function (el) {
      var dr = { el: el, off: false, last: null };
      var host = el.closest('.cd-carousel') || el;
      var stop = function () { if (dr.off) return; dr.off = true; el.style.transform = ''; };
      ['pointerdown', 'wheel', 'touchstart', 'keydown', 'focusin'].forEach(function (ev) { host.addEventListener(ev, stop, { passive: true }); });
      return dr;
    });
  }

  /* ── One rAF loop, driven by scroll / resize ─────────────────────────── */
  var ticking = false;
  function frame() { ticking = false; renderHero(); renderScroll(); checkBands(); renderSectors(); }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function remeasure() { readViewport(); measureHero(); measureScroll(); lastP = -1; request(); if (H.syncArrows) H.syncArrows(); }

  /* ── [data-seq] (IntersectionObserver, once) ─────────────────────────── */
  function runSeq(host) {
    if (host.classList.contains('hf-chat')) {
      var bubble = host.querySelector('.hf-chat__bubble'), reply = host.querySelector('.hf-chat__reply');
      bubble.classList.add('is-in');
      setTimeout(function () { bubble.removeAttribute('data-typing'); }, 900);
      setTimeout(function () { reply.classList.add('is-in'); }, 1700);
      return;
    }
    $$('.hf-seq', host).forEach(function (el, i) { setTimeout(function () { el.classList.add('is-in'); }, i * 110); });
  }
  function initSeq() {
    var hosts = $$('[data-seq]');
    if (REDUCED || !('IntersectionObserver' in window)) { hosts.forEach(function (h) { $$('.hf-seq', h).forEach(function (el) { el.classList.add('is-in'); }); }); return; }
    $$('.hf-chat__bubble').forEach(function (b) { b.setAttribute('data-typing', ''); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runSeq(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    hosts.forEach(function (h) { io.observe(h); });
  }

  /* ── Lending "With a desk for ____." (copied from personal-home-v3's ask,
     renamed): desktop pin + scroll rolls the reel, photo and desk card; the
     chips choose at every size (aria-pressed); inactive desk cards are
     aria-hidden inside the polite live region. ── */
  // the scrub runs at every size (phones and foldables too); reduced motion keeps the static stack
  var mqAskPin = window.matchMedia('(prefers-reduced-motion: no-preference)');
  var mqAskMob = window.matchMedia('(max-width: 1023px) and (prefers-reduced-motion: no-preference)');
  function initAsk() {
    var root = document.querySelector('[data-hf-ask]');
    if (!root) return;
    var track = root.querySelector('.hf-ask-track');
    var reel = root.querySelector('.hf-ask-reel');
    var words = [].slice.call(reel.children);
    var chips = [].slice.call(root.querySelectorAll('[data-hf-intent]'));
    var shots = [].slice.call(root.querySelectorAll('.hf-ask-shot'));
    var facts = [].slice.call(root.querySelectorAll('.hf-ask-fact > div'));
    var n = words.length, cur = -1;
    function show(i) {
      i = Math.max(0, Math.min(n - 1, i));
      if (i === cur) return;
      cur = i;
      reel.style.setProperty('--i', i);
      [words, shots, facts].forEach(function (set) { set.forEach(function (el, k) { el.classList.toggle('is-on', k === i); }); });
      facts.forEach(function (f, k) { if (k === i) f.removeAttribute('aria-hidden'); else f.setAttribute('aria-hidden', 'true'); });
      chips.forEach(function (c, k) { c.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      var row = chips[0] && chips[0].parentNode;          // phones: keep the active chip in view
      if (row && row.scrollWidth > row.clientWidth + 1) {
        var c = chips[i], left = c.offsetLeft - (row.clientWidth - c.offsetWidth) / 2;
        row.scrollTo({ left: Math.max(0, left), behavior: REDUCED ? 'auto' : 'smooth' });
      }
    }
    function progress() {
      if (!mqAskPin.matches) return;
      var r = track.getBoundingClientRect();
      var travel = track.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      show(Math.floor(clamp(-r.top / travel, 0, 0.9999) * n));
    }
    function jump(i) {
      if (!mqAskPin.matches) { show(i); return; }
      var travel = track.offsetHeight - window.innerHeight;
      var y = window.pageYOffset + track.getBoundingClientRect().top + ((i + 0.5) / n) * travel;
      if (window.DS && DS.lenis && DS.lenis.scrollTo) DS.lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: 'smooth' });
      show(i);
    }
    chips.forEach(function (c, k) { c.addEventListener('click', function () { jump(k); }); });
    // phones / tablets: only sentence, chips and photo are pinned; the copy and CTAs follow the scrub
    var panel = root.querySelector('.hf-ask-panel'), copy = root.querySelector('.hf-ask-copy');
    var after = document.createElement('div'); after.className = 'container-ds hf-ask-after';
    track.parentNode.insertBefore(after, track.nextSibling);
    function place() {
      if (mqAskMob.matches) { if (panel.parentNode !== after) after.appendChild(panel); }
      else if (panel.parentNode !== copy) copy.appendChild(panel);
    }
    place();
    if (mqAskMob.addEventListener) mqAskMob.addEventListener('change', function () { place(); progress(); });
    // the blank is one clipped line: shrink the sentence if the longest desk is wider than the column
    var sentence = root.querySelector('.hf-ask-sentence'), slot = root.querySelector('.hf-ask-slot');
    function fit() {
      sentence.style.fontSize = '';
      var avail = slot.clientWidth, widest = 0;
      words.forEach(function (w) { widest = Math.max(widest, w.scrollWidth); });
      if (avail > 0 && widest > avail) sentence.style.fontSize = Math.floor(parseFloat(getComputedStyle(sentence).fontSize) * (avail / widest) * 0.98) + 'px';
    }
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    ASK = progress;
    show(0); progress();
  }
  var ASK = null;
  function renderSectors() { if (ASK) ASK(); }

  /* ── CTA float: runs while the panel is in view and the tab is visible ── */
  function initFloat() {
    var cta = document.querySelector('.hf-cta');
    if (!cta || REDUCED || !('IntersectionObserver' in window)) return;
    var inView = false, settled = false;
    var sync = function () { cta.classList.toggle('is-float', settled && inView && !document.hidden); };
    new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting;
      if (inView && !settled) setTimeout(function () { settled = true; sync(); }, 700);   // after the panel settles in
      sync();
    }, { threshold: 0.15 }).observe(cta);
    document.addEventListener('visibilitychange', sync);
  }

  /* ── App QR tile: iOS | Android swaps the QR (DS chips, aria-pressed) ── */
  function initQr() {
    var QR = {
      ios: { src: 'assets/images/cib-home-flow/qr-appstore.svg', alt: 'QR code to download ENBD Business from the App Store' },
      android: { src: 'assets/images/cib-home-flow/qr-googleplay.svg', alt: 'QR code to download ENBD Business from Google Play' }
    };
    $$('[data-qr]').forEach(function (tile) {
      var img = tile.querySelector('[data-qr-img]'), btns = $$('[data-qr-os]', tile);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var os = b.getAttribute('data-qr-os');
          btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
          img.src = QR[os].src; img.alt = QR[os].alt;
        });
      });
    });
    /* phones: the single store button opens the visitor's own store */
    var android = /android/i.test(navigator.userAgent);
    $$('[data-app-link]').forEach(function (a) {
      a.href = a.getAttribute(android ? 'data-android' : 'data-ios') || a.href;
      a.setAttribute('aria-label', 'Download ENBD Business on ' + (android ? 'Google Play' : 'the App Store'));
    });
  }

  /* ── Skip link: move focus into main (the smooth-scroll layer eats the hash jump) ── */
  function initSkip() {
    var link = document.querySelector('.ds-skip-link'), main = document.getElementById('main');
    if (!link || !main) return;
    link.addEventListener('click', function () {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      setTimeout(function () { main.focus(); }, 0);
    });
  }

  function boot() {
    readViewport();
    initHero();
    initOnce();
    initLoops();
    initHeroVideo();
    initScrollFx();
    initSeq();
    initAsk();
    initSkip();
    initQr();
    initFloat();
    remeasure();
    window.addEventListener('scroll', request, { passive: true });
    var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(remeasure, 120); });
    window.addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
