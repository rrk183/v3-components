/* Language switch (C&IB Arabic editions, 2026-10-07).
   The DS language buttons (.ish-lang, .ish-lang-m in the header, .fo1-lang in the
   footer) have no destination of their own. Each page names its other edition on
   <html data-lang-alt="...">: English pages point at <page>-ar.html, Arabic pages
   back at <page>.html. The current scroll section (#hash) is carried across.
   On Arabic pages the few aria-labels ds.js writes at runtime are localised too. */
(function () {
  'use strict';
  var root = document.documentElement;
  var alt = root.getAttribute('data-lang-alt');
  if (alt) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.ish-lang, .ish-lang-m, .fo1-lang');
      if (!b) return;
      e.preventDefault();
      location.href = alt + (location.hash || '');
    });
  }

  if ((root.getAttribute('lang') || '').slice(0, 2) !== 'ar') return;
  var exact = {
    'Open menu': 'فتح القائمة', 'Close menu': 'إغلاق القائمة', 'Play': 'تشغيل', 'Pause': 'إيقاف مؤقت',
    'Pause testimonials': 'إيقاف الشهادات مؤقتاً', 'Play testimonials': 'تشغيل الشهادات',
    'Pause automatic feature rotation': 'إيقاف التدوير التلقائي مؤقتاً',
    'Resume automatic feature rotation': 'استئناف التدوير التلقائي', 'Explore': 'استكشف'
  };
  var pre = [[/^Go to slide (\d+)$/, 'انتقل إلى الشريحة $1'], [/^Slide (\d+)$/, 'الشريحة $1'],
             [/^Show testimonial (\d+)$/, 'عرض الشهادة $1'], [/^Explore (.+)$/, 'استكشف $1']];
  function fix(el) {
    var v = el.getAttribute('aria-label');
    if (!v || /[؀-ۿ]/.test(v)) return;
    var n = exact[v];
    if (!n) for (var i = 0; i < pre.length && !n; i++) if (pre[i][0].test(v)) n = v.replace(pre[i][0], pre[i][1]);
    if (n) el.setAttribute('aria-label', n);
  }
  function sweep() { var l = document.querySelectorAll('[aria-label]'); for (var i = 0; i < l.length; i++) fix(l[i]); }
  document.addEventListener('DOMContentLoaded', function () {
    sweep();
    if (window.MutationObserver) new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === 'attributes') fix(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) if (m.addedNodes[j].nodeType === 1) {
          if (m.addedNodes[j].hasAttribute('aria-label')) fix(m.addedNodes[j]);
        }
      }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-label'] });
  });
})();
