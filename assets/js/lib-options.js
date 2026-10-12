/* lib-options.js — GALLERY-ONLY option controls that recompose a block's
   MARKUP for preview (never loaded by pages). Shared by the inline gallery
   render (library.js) and the device frames (frame.html) so both previews
   apply an option identically. Each option mirrors what an author does in
   real markup, as documented in the block's dossier.

   motion: 'off'  → .is-static on the root (author switch: no float)
   app:    'off'  → delete .adp-get (badges + QR) and the phone-only
           .adp-app-btn (author: panel without app promotion)
   btns:   '1' | '2s' | '3' → rebuild .adp-btns in button-role order:
           primary btn-filled, secondary btn-accent, tertiary btn-outline.
           ('' = as built: primary + tertiary)
   meyebrow: 'on' → add the optional .cm__eyebrow to World Map - V2
   mstats: 'row' → swap the counter for a 3-item .cm__figs stats row
           (+ .is-figs on the root); 'off' → delete the counter
           (demo figures; authors use their own) */
(function () {
  var ROLES = ['btn-filled', 'btn-accent', 'btn-outline'];
  var SETS = { '1': [0], '2s': [0, 1], '3': [0, 1, 2] };
  var DEMO_3RD = 'Request a call back';
  function btns(root, v) {
    var box = root.querySelector('.adp-btns');
    if (!box || !SETS[v]) return;
    var phoneBtn = box.querySelector('.adp-app-btn');
    var old = [].slice.call(box.querySelectorAll('.btn:not(.adp-app-btn)'));
    var labels = old.map(function (a) { return a.textContent.trim(); });
    var hrefs = old.map(function (a) { return a.getAttribute('href') || '#'; });
    if (labels.length < 3) { labels.push(DEMO_3RD); hrefs.push('#'); }
    old.forEach(function (a) { a.remove(); });
    SETS[v].forEach(function (role, i) {
      var a = document.createElement('a');
      a.className = 'btn ' + ROLES[role] + ' btn-lg';
      a.href = hrefs[i]; a.textContent = labels[i];
      box.insertBefore(a, phoneBtn || null);
    });
  }
  function motion(root, v) {
    var cmp = root.querySelector('.cmp') || root;
    if (v === 'off') cmp.classList.add('is-static');
  }
  function app(root, v) {
    if (v !== 'off') return;
    [].forEach.call(root.querySelectorAll('.adp-get, .adp-app-btn'), function (el) { el.remove(); });
  }
  function meyebrow(root, v) {
    if (v !== 'on') return;
    var t = root.querySelector('.cm__title');
    if (!t || root.querySelector('.cm__eyebrow')) return;
    var cmp = root.querySelector('.cmp-markets-map') || root;
    var dark = /surface-(primary|dark|accent|image)\b/.test(cmp.className);
    var e = document.createElement('span');
    e.className = 'ds-eyebrow cm__eyebrow ' + (dark ? 'ink-accent-soft' : 'ink-accent');
    e.textContent = 'Global reach';
    t.parentNode.insertBefore(e, t);
  }
  var DEMO_FIGS = [['165+', 'Bilateral and syndicated deals, YTD 2025'], ['USD 90bn+', 'Primary deals across global markets in 2024'], ['110+', 'Secondary trades placed, USD 4.3bn notional']];
  function mstats(root, v) {
    var c = root.querySelector('.cm__count');
    if (!c || (v !== 'row' && v !== 'off')) return;
    var cmp = root.querySelector('.cmp-markets-map') || root;
    if (v === 'off') { c.remove(); return; }
    var ul = document.createElement('ul'); ul.className = 'cm__figs';
    DEMO_FIGS.forEach(function (f) {
      var li = document.createElement('li'); li.className = 'cm__fig';
      li.innerHTML = '<span class="cm__fig-num"></span><span class="cm__fig-label"></span>';
      li.firstChild.textContent = f[0]; li.lastChild.textContent = f[1]; ul.appendChild(li);
    });
    c.replaceWith(ul); cmp.classList.add('is-figs');
  }
  window.LibOptions = {
    MOTION: [['', 'Motion · On'], ['off', 'Motion · Off']],
    APP: [['', 'App row · On'], ['off', 'App row · Off']],
    MEYEBROW: [['', 'Eyebrow · Off'], ['on', 'Eyebrow · On']],
    MSTATS: [['', 'Stats · Counter'], ['row', 'Stats · Row of 3'], ['off', 'Stats · Off']],
    BTNS: [['', 'Buttons · As built'], ['1', '1 · Primary'], ['2s', '2 · Primary + Secondary'], ['3', '3 · Primary + Secondary + Tertiary']],
    apply: function (root, o) { if (!root || !o) return; if (o.btns) btns(root, o.btns); if (o.motion) motion(root, o.motion); if (o.app) app(root, o.app); if (o.meyebrow) meyebrow(root, o.meyebrow); if (o.mstats) mstats(root, o.mstats); }
  };
})();
