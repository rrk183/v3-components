/* ─────────────────────────────────────────────────────────────────────────
   Lightweight client-side password gate ("simple browser stuff" — the native
   prompt(), no login screen). For light protection of a STATIC deployment so
   it can be shared for testing. The password is read from window.SITE_PASSWORD
   (set in assets/js/gate-config.js, injected at build time from the SITE_PASSWORD
   env var). Empty password = open (local dev).

   NOTE: this is a static site, so the password lives client-side — it deters
   casual access, it is not real security. Don't put anything sensitive behind it.
───────────────────────────────────────────────────────────────────────────*/
(function () {
  var pw = (window.SITE_PASSWORD || '').trim();
  if (!pw) return;                                   // no password configured → open
  var KEY = 'enbd-ds-unlocked';
  try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) {}
  var ok = false, tries = 0;
  while (tries < 5) {
    var attempt = window.prompt('Password required — Emirates NBD Design System');
    if (attempt === null) break;                     // cancelled
    if (attempt === pw) { ok = true; break; }
    tries++;
  }
  if (ok) { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} return; }
  document.documentElement.innerHTML =
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;color:#072447;background:#F4F7FB">' +
    '<div style="text-align:center"><p style="font-size:15px;font-weight:600">Access denied</p>' +
    '<p style="font-size:13px;color:#6B7280">Reload the page to try again.</p></div></body>';
  if (window.stop) window.stop();
})();
