/* ══════════════════════════════════════════════════════════════════════════
   cib-home-flow.js · Wholesale Banking home "flow" motion system (vanilla, no dependencies)
   Loaded in <head> without defer so the motion class is on <html> before
   first paint; everything else waits for DOMContentLoaded. Copied from
   cib-v7a.js where reused (never linked) and re-cut for continuous,
   scroll-linked motion instead of slide builds:

   · Hero: MOVED TO ds.js ([data-hf-hero], 2026-11-03) so it also works
     pasted into a CMS rich-text field. Was: "the frame that becomes the row": the viewport is the phone screen
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
  function frame() { ticking = false; renderScroll(); checkBands(); renderSectors(); }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function remeasure() { readViewport(); measureScroll(); request(); }

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
      ios: { src: 'assets/webxv2/images/cib-home-flow/qr-appstore.svg', alt: 'QR code to download ENBD Business from the App Store' },
      android: { src: 'assets/webxv2/images/cib-home-flow/qr-googleplay.svg', alt: 'QR code to download ENBD Business from Google Play' }
    };
    $$('[data-qr]').forEach(function (tile) {
      if (tile.closest('[data-master]')) return;   // master instances are wired by ds.js
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
      if (a.closest('[data-master]')) return;   // master instances are wired by ds.js
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
    initOnce();
    initLoops();
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
