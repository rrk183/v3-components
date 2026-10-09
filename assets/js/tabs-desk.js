/* Tabs - Desk reel (cmp-tabs-desk), shared script
   Extracted from blocks/tabs-desk.html so pages can link it instead of an
   inline <script>. Boots every [data-tabs-desk] on the page (guarded, safe
   alongside the block's own copy). Additions: --td-n desk count for the pin
   length, and optional per-desk CTA links (data-td-href / data-td-label). */
(function () {
  'use strict';
  var mqPin = window.matchMedia('(prefers-reduced-motion: no-preference)');
  var mqMob = window.matchMedia('(max-width: 1023px) and (prefers-reduced-motion: no-preference)');
  var REDUCED = !mqPin.matches;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function bg(el) { var u = el.getAttribute('data-bg'); if (u && !el.style.backgroundImage) el.style.backgroundImage = 'url("' + u + '")'; }
  function init(root) {
    if (root.__td) return; root.__td = true;
    var track = root.querySelector('.td-track');
    var reel = root.querySelector('.td-reel');
    var words = [].slice.call(reel.children);
    var chips = [].slice.call(root.querySelectorAll('[data-td-intent]'));
    var shots = [].slice.call(root.querySelectorAll('.td-shot'));
    var facts = [].slice.call(root.querySelectorAll('.td-fact > div'));
    shots.forEach(bg);
    var n = words.length, cur = -1;
    root.style.setProperty('--td-n', n);   // pinned track length follows the desk count
    // Optional per-desk link: chips may carry data-td-href (+ data-td-label);
    // the [data-td-cta] button then follows the selected desk.
    var cta = root.querySelector('[data-td-cta]');
    function show(i) {
      i = clamp(i, 0, n - 1);
      if (i === cur) return;
      cur = i;
      reel.style.setProperty('--i', i);
      [words, shots, facts].forEach(function (set) { set.forEach(function (el, k) { el.classList.toggle('is-on', k === i); }); });
      facts.forEach(function (f, k) { if (k === i) f.removeAttribute('aria-hidden'); else f.setAttribute('aria-hidden', 'true'); });
      chips.forEach(function (c, k) { c.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      if (cta && chips[i] && chips[i].getAttribute('data-td-href')) { cta.setAttribute('href', chips[i].getAttribute('data-td-href')); if (chips[i].getAttribute('data-td-label')) cta.textContent = chips[i].getAttribute('data-td-label'); }
    }
    function progress() {
      if (!mqPin.matches) return;
      var r = track.getBoundingClientRect();
      var travel = track.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      show(Math.floor(clamp(-r.top / travel, 0, 0.9999) * n));
    }
    function jump(i) {
      if (!mqPin.matches) { show(i); return; }
      var travel = track.offsetHeight - window.innerHeight;
      var y = window.pageYOffset + track.getBoundingClientRect().top + ((i + 0.5) / n) * travel;
      if (window.DS && DS.lenis && DS.lenis.scrollTo) DS.lenis.scrollTo(y); else window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
      show(i);
    }
    chips.forEach(function (c, k) { c.addEventListener('click', function () { jump(k); }); });
    // phones / tablets: only sentence, chips and photo pin; the copy and CTAs follow the scrub
    var panel = root.querySelector('.td-panel'), copy = root.querySelector('.td-copy');
    var after = document.createElement('div'); after.className = 'container-ds td-after';
    track.parentNode.insertBefore(after, track.nextSibling);
    function place() {
      if (mqMob.matches) { if (panel.parentNode !== after) after.appendChild(panel); }
      else if (panel.parentNode !== copy) copy.appendChild(panel);
    }
    place();
    if (mqMob.addEventListener) mqMob.addEventListener('change', function () { place(); progress(); });
    // the blank is one clipped line: shrink the sentence if the longest desk is wider than the column
    var sentence = root.querySelector('.td-sentence'), slot = root.querySelector('.td-slot');
    function fit() {
      sentence.style.fontSize = '';
      var avail = slot.clientWidth, widest = 0;
      words.forEach(function (w) { widest = Math.max(widest, w.scrollWidth); });
      if (avail > 0 && widest > avail) sentence.style.fontSize = Math.floor(parseFloat(getComputedStyle(sentence).fontSize) * (avail / widest) * 0.98) + 'px';
    }
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);
    show(0); progress();
  }
  function boot() { [].forEach.call(document.querySelectorAll('[data-tabs-desk]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
