/* ─────────────────────────────────────────────────────────────────────────
   Emirates NBD DS — tiny zero-dependency static server with optional HTTP
   Basic Auth (the browser's native 401 credential prompt — no login screen,
   enforced server-side). Deploy on DigitalOcean as a **Web Service**.

   Env vars:
     PORT           port to listen on (DigitalOcean sets this; default 8080)
     SITE_PASSWORD  if set, the whole site is gated behind HTTP Basic Auth.
                    Leave unset/empty to serve openly.
     SITE_USER      (cosmetic) any username is accepted; only the password
                    is checked.
───────────────────────────────────────────────────────────────────────────*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = parseInt(process.env.PORT || '8080', 10);
const PASSWORD = process.env.SITE_PASSWORD || '';
const REALM = 'Emirates NBD Design System';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8', '.map': 'application/json',
};

function withinRoot(filePath) {
  const rel = path.relative(ROOT, filePath);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function safeEqual(a, b) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function authed(req) {
  if (!PASSWORD) return true;
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const pass = decoded.slice(decoded.indexOf(':') + 1);
  return safeEqual(pass, PASSWORD);
}

const server = http.createServer((req, res) => {
  if (!authed(req)) {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="' + REALM + '", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    return res.end('Authentication required.');
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad request.');
  }
  // A folder URL serves its index (satellite sites such as /ibv2/ — 2026-09-07);
  // a folder without the trailing slash redirects to it so relative links hold.
  if (urlPath === '' || urlPath.endsWith('/')) urlPath += 'index.html';

  const filePath = path.resolve(ROOT, '.' + urlPath);
  if (!withinRoot(filePath)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      res.writeHead(301, { Location: urlPath + '/' });
      return res.end();
    }
    if (err || stat.isDirectory()) {
      // Legacy dated/versioned URLs (2026-09-03 clean-slug rename): a missing
      // root page named name-vN[-YYYY-MM-DD].html redirects to the family's
      // stable slug when that exists — old shared links land on the current
      // page instead of a 404. Generic by rule, no hand-kept map.
      const m = urlPath.match(/^\/([a-z0-9-]+?)(?:-v\d+)?(?:-\d{4}-\d{2}-\d{2})?\.html$/);
      if (m) {
        const clean = path.resolve(ROOT, m[1] + '.html');
        if (clean !== filePath && withinRoot(clean) && fs.existsSync(clean)) {
          res.writeHead(301, { Location: '/' + m[1] + '.html' });
          return res.end();
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found.');
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = TYPES[ext] || 'application/octet-stream';
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=3600';
    const total = stat.size;

    // Range request (video/audio streaming & seeking) → 206 Partial Content.
    // Without this, browsers must download the whole file before playing.
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (m) {
        let start = m[1] === '' ? null : parseInt(m[1], 10);
        let end = m[2] === '' ? null : parseInt(m[2], 10);
        if (start === null) {
          if (!end) {
            res.writeHead(416, { 'Content-Range': 'bytes */' + total });
            return res.end();
          }
          start = Math.max(total - end, 0);
          end = total - 1;
        }
        if (end === null || end >= total) end = total - 1;
        if (isNaN(start) || isNaN(end) || start > end || start < 0) {
          res.writeHead(416, { 'Content-Range': 'bytes */' + total });
          return res.end();
        }
        res.writeHead(206, {
          'Content-Type': type,
          'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
          'Accept-Ranges': 'bytes',
          'Content-Length': (end - start + 1),
          'Cache-Control': cache,
        });
        if (req.method === 'HEAD') return res.end();
        return fs.createReadStream(filePath, { start: start, end: end }).pipe(res);
      }
    }

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': total,
      'Accept-Ranges': 'bytes',
      'Cache-Control': cache,
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('Emirates NBD DS on :' + PORT + (PASSWORD ? ' (HTTP Basic Auth on)' : ' (open)'));
});
