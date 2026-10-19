/* Product scrub (ENBD Business hero, promoted from the scrub lab 2026-10-20).
   Scroll scrubs chained Rotato green-screen sequences (iPhone spin, laptop
   pull-back, device family). ONE WebGL canvas draws each frame and keys its
   green glass in the shader, showing the live app screen warped through that
   frame's tracked quad, so plate and screen can never drift apart. Layout per
   screen shape: text zone + device zone (text aligned with the header logo),
   mirrored in RTL. Captions and opener are HTML (.ps-cap[data-cap], .ps-opener).
   Assets: data-assets on [data-product-scrub] (seq-NAME folders: frames + quads.json,
   screens/ textures). Every frame's screen coverage is audited before shipping
   (green fully covered by its quad). Reduced motion: final frame, no scrub. */
(function () {
  var root = document.querySelector('[data-product-scrub]');
  if (!root) return;
  var stage = root.querySelector('.ps-stage'), world = root.querySelector('.ps-world');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FW = 1920, FH = 1080, VER = '?v=6';

  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function seg(p, a) { return Math.max(0, Math.min(1, (p - a[0]) / (a[1] - a[0]))); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function band(t, p) {
    if (p < t[0]) return 0; if (p < t[1]) return ease((p - t[0]) / (t[1] - t[0]));
    if (t.length < 4 || p < t[2]) return 1; if (p < t[3]) return 1 - ease((p - t[2]) / (t[3] - t[2])); return 0;
  }
  /* unit square -> quad homography, inverted: frame px -> screen uv (column-major mat3) */
  function invHomography(q) {
    var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1], x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
    var dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    var g = 0, h = 0, den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(sx) > 1e-9 || Math.abs(sy) > 1e-9) { g = (sx * dy2 - dx2 * sy) / den; h = (dx1 * sy - sx * dy1) / den; }
    var a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
    // M = [[a,b,c],[d,e,f],[g,h,1]] (row-major); inverse via the adjugate
    var A = e - f * h, B = -(d - f * g), C = d * h - e * g, D = -(b - c * h), E = a - c * g, F = -(a * h - b * g), G = b * f - c * e, Hh = -(a * f - c * d), I = a * e - b * d;
    var det = a * A + b * B + c * C;
    var inv = [A / det, D / det, G / det, B / det, E / det, Hh / det, C / det, F / det, I / det];   // row-major
    return [inv[0], inv[3], inv[6], inv[1], inv[4], inv[7], inv[2], inv[5], inv[8]];          // column-major
  }

  /* ── WebGL ───────────────────────────────────────────────────────────── */
  var canvas = document.createElement('canvas'); canvas.className = 'ps-gl'; canvas.setAttribute('aria-hidden', 'true');
  world.insertBefore(canvas, world.firstChild);
  var gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) { root.classList.add('ps-nogl'); return; }
  var MAXT = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D uF,uS0,uS1,uS2;',
    'uniform vec3 uCam;uniform vec2 uStage;uniform float uDpr,uOp;',
    'uniform mat3 uH0,uH1,uH2;uniform vec4 uB0,uB1,uB2;uniform vec4 uT0,uT1,uT2;',
    // uB: sw, sh, radius px, mode (0 = fit width + scroll, 1 = fit height, centred)
    // uT: imgW, imgH, scroll px, on (1/0)
    'float rbox(vec2 p,vec2 s,float r){vec2 q=abs(p-s*.5)-s*.5+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}',
    'vec4 scr(sampler2D t,mat3 Hi,vec4 b,vec4 m,vec2 fp,vec4 bg){',
    '  if(m.w<.5)return bg; vec3 h=Hi*vec3(fp,1.); if(h.z<=0.)return bg; vec2 uv=h.xy/h.z;',
    '  if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.)return bg; vec2 sp=uv*b.xy;',
    '  if(rbox(sp,b.xy,b.z)>0.)return bg; vec2 tc;',
    '  if(b.w<.5){tc=vec2(uv.x,(sp.y+m.z)/(b.x*m.y/m.x));}else{float dw=b.y*m.x/m.y;tc=vec2((sp.x-(b.x-dw)*.5)/dw,uv.y);}',
    '  return vec4(texture2D(t,tc).rgb,1.);}',
    'void main(){',
    '  vec2 sp=vec2(gl_FragCoord.x,uStage.y*uDpr-gl_FragCoord.y)/uDpr;',
    '  vec2 fp=(sp-uCam.yz)/uCam.x;',
    '  if(fp.x<0.||fp.y<0.||fp.x>1920.||fp.y>1080.){gl_FragColor=vec4(0.);return;}',
    '  vec4 c=texture2D(uF,fp/vec2(1920.,1080.));',
    // key the green glass HERE: the live screen can only show through real green
    '  float gr=c.g-max(c.r,c.b); float k=clamp((gr-.06)/.22,0.,1.)*c.a;',
    '  float sheen=clamp((min(c.r,c.b)-.08)/.78,0.,1.)*k*.55;',
    '  vec3 plate=vec3(c.r,gr>0.?max(c.r,c.b):c.g,c.b); float pa=c.a*(1.-k/max(c.a,.0001));',
    '  vec4 bg=vec4(0.);',
    '  bg=scr(uS0,uH0,uB0,uT0,fp,bg); bg=scr(uS1,uH1,uB1,uT1,fp,bg); bg=scr(uS2,uH2,uB2,uT2,fp,bg);',
    '  float sa=bg.a*k; vec3 srgb=bg.rgb*sa;',
    '  srgb=srgb*(1.-sheen)+vec3(sheen); sa=sa+sheen*(1.-sa);',
    '  float fy=fp.y/1080.; float fade=smoothstep(0.,.07,fy)*smoothstep(1.,.93,fy);',
    '  vec3 rgb=plate*pa+srgb*(1.-pa); float a=pa+sa*(1.-pa);',
    '  gl_FragColor=vec4(rgb,a)*fade*uOp;}'
  ].join('\n');
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  var prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var locP = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(locP); gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['uF', 'uS0', 'uS1', 'uS2', 'uCam', 'uStage', 'uDpr', 'uOp', 'uH0', 'uH1', 'uH2', 'uB0', 'uB1', 'uB2', 'uT0', 'uT1', 'uT2'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform1i(U.uF, 0); gl.uniform1i(U.uS0, 1); gl.uniform1i(U.uS1, 2); gl.uniform1i(U.uS2, 3);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  function tex() {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    return t;
  }
  function upload(t, img) {
    var src = img, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (iw > MAXT || ih > MAXT) {   // downscale to the GPU limit
      var k = MAXT / Math.max(iw, ih), cv = document.createElement('canvas');
      cv.width = Math.floor(iw * k); cv.height = Math.floor(ih * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); src = cv;
    }
    gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  }
  var SCREEN_TEX = {};   // url -> {tex, w, h, ready}
  function screenTex(url) {
    if (SCREEN_TEX[url]) return SCREEN_TEX[url];
    var o = SCREEN_TEX[url] = { tex: tex(), w: 1, h: 1, ready: false }, im = new Image();
    im.onload = function () { upload(o.tex, im); o.w = im.naturalWidth; o.h = im.naturalHeight; o.ready = true; last = -1; request(); };
    im.src = url + VER; return o;
  }

  /* ── layout ──────────────────────────────────────────────────────────── */
  var W, H, prof, TZ, DZ, hdr, small, dpr;
  var caps = [].slice.call(root.querySelectorAll('[data-cap]')).map(function (el) { return { el: el, t: el.getAttribute('data-cap').split(',').map(Number) }; });
  var opener = root.querySelector('.ps-opener'), RTL = (document.documentElement.getAttribute('dir') || '').toLowerCase() === 'rtl';
  function measure() {
    W = stage.clientWidth;
    var pr = document.createElement('div'); pr.style.cssText = 'position:fixed;top:0;height:100vh;height:100svh;width:0;visibility:hidden';
    document.body.appendChild(pr); H = Math.min(stage.clientHeight, pr.offsetHeight || stage.clientHeight); pr.remove();
    var brand = document.querySelector('.cmp-site-header .ish-brand'); hdr = (brand && brand.offsetHeight) || 72;
    var edge = W < 768 ? 20 : W < 1280 ? 40 : 64, a = W / H, top = hdr + 16;
    // align the text with the header logo (the header sits in a centred container)
    var logo = document.querySelector('.cmp-site-header .ish-logo-img, .cmp-site-header .ish-logo');
    var lr = logo ? logo.getBoundingClientRect() : null, bl = lr ? Math.round(RTL ? W - lr.right : lr.left) : 0;
    if (bl > 0 && bl < W / 3) edge = bl;
    prof = a >= 1.2 ? 'wide' : a < .85 ? 'tall' : 'square';
    if (prof === 'wide') {
      TZ = { x: edge, y: top, w: Math.min(W * .36, 560), h: H - top - 24 };
      DZ = { x: TZ.x + TZ.w + 24, y: top, w: W - (TZ.x + TZ.w + 24) - edge, h: H - top - 24 };
    } else {
      var th = prof === 'tall' ? H * .3 : H * .26;
      TZ = { x: edge, y: top + 8, w: W - edge * 2, h: th };
      DZ = { x: edge * .5, y: TZ.y + th + 8, w: W - edge, h: H - (TZ.y + th + 8) - 16 };
    }
    if (RTL && prof === 'wide') { TZ.x = W - TZ.x - TZ.w; DZ.x = W - DZ.x - DZ.w; }
    if (RTL && prof !== 'wide') { TZ.x = W - TZ.x - TZ.w; }
    small = W < 900 || H < 600;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    caps.forEach(function (c) {
      var el = c.el; el.style.left = TZ.x + 'px'; el.style.width = TZ.w + 'px';
      var h = el.offsetHeight; el.style.top = (prof === 'wide' ? TZ.y + (TZ.h - h) / 2 : TZ.y + H * .07) + "px";   // phones: a little below the header (Ram)
    });
    if (opener) { opener.style.top = '0px'; opener.style.height = H + 'px'; }   // full-screen opener, as on the live page
    last = -1;
  }
  function zone(b) {
    if (prof === 'wide') { var s = Math.min(DZ.w / b.w, DZ.h / b.h); return { s: s, x: DZ.x + DZ.w / 2 - b.cx * s, y: DZ.y + DZ.h / 2 - b.cy * s }; }
    // phones / portrait (Ram): use the full screen width, and sit a little above
    // the middle of the space under the text (never up into the text)
    var t = Math.min((W - 12) / b.w, DZ.h / b.h), cy = Math.max(DZ.y + b.h * t / 2, DZ.y + DZ.h * .42);
    return { s: t, x: W / 2 - b.cx * t, y: cy - b.cy * t };
  }
  function cover(cx, cy, minW) { var s = Math.max(H / FH, W / minW) * 1.03; return { s: s, x: W / 2 - cx * s, y: H / 2 - cy * s }; }
  function mix(a, b, k) { return { s: lerp(a.s, b.s, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) }; }

  /* ── shots ───────────────────────────────────────────────────────────── */
  var SQ = root.getAttribute('data-assets') || '', SC = SQ + 'screens/';
  function Shot(cfg) { var s = this; s.cfg = cfg; s.frames = []; s.frameTex = tex(); s.uploaded = 0; s.want = 1; s.scr = cfg.screens.map(function (z) { return screenTex(SC + z.img); }); }
  Shot.prototype.load = function () { var s = this; return fetch(SQ + s.cfg.dir + 'quads.json' + VER).then(function (r) { return r.json(); }).then(function (j) { s.Q = j.quads; s.N = j.count; if (s.cfg.order) s.Q = s.Q.map(function (q) { return s.cfg.order.map(function (k) { return q[k]; }); }); }); };
  Shot.prototype.src = function (i) { return SQ + this.cfg.dir + (small ? 'sm/' : 'lg/') + 'f' + ('00' + i).slice(-3) + '.webp' + VER; };
  /* a frame counts as loaded only once it is fully DECODED (ImageBitmap), so
     the GPU never receives a half-ready image and keeps showing the old plate */
  Shot.prototype.img = function (i) {
    var s = this, f = s.frames[i]; if (f) return f;
    f = s.frames[i] = { ready: false, bmp: null };
    var im = new Image(); im.decoding = 'async';
    im.onload = function () {
      var done = function (b) { f.bmp = b; f.ready = true; if (i === s.want) { last = -1; request(); } };
      if (window.createImageBitmap) createImageBitmap(im).then(done, function () { im.decode ? im.decode().then(function () { done(im); }) : done(im); });
      else if (im.decode) im.decode().then(function () { done(im); }); else done(im);
    };
    im.src = s.src(i); return f;
  };
  Shot.prototype.preload = function () { var s = this, k = 1; (function next() { var n = 0; while (k <= s.N && n < 6) { s.img(k++); n++; } if (k <= s.N) setTimeout(next, 50); })(); };
  /* the frame actually shown: the wanted one, or the nearest loaded one before
     it. Its own quads drive the screens, so plate and screen always match. */
  Shot.prototype.frameShown = function () {
    for (var j = this.want; j >= 1; j--) { var f = this.frames[j]; if (f && f.ready) return j; }
    return 0;
  };
  Shot.prototype.draw = function (p) {
    var s = this, c = s.cfg, o = c.opacity(p);
    if (o < .002) return;
    s.want = Math.max(1, Math.min(s.N, c.frame(p, s.N)));
    s.img(s.want);
    var i = s.frameShown(); if (!i) return;
    if (i !== s.uploaded) { gl.activeTexture(gl.TEXTURE0); upload(s.frameTex, s.frames[i].bmp); s.uploaded = i; }
    var k = c.cam(p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, s.frameTex);
    gl.uniform3f(U.uCam, k.s, k.x, k.y); gl.uniform2f(U.uStage, W, H); gl.uniform1f(U.uDpr, dpr); gl.uniform1f(U.uOp, o);
    var q = s.Q[i - 1], list = q && q[0] && Array.isArray(q[0][0]) ? q : [q];
    if (q && c.order) list = q;
    for (var n = 0; n < 3; n++) {
      var z = c.screens[n], t = s.scr[n], qq = list[n];
      gl.activeTexture(gl.TEXTURE1 + n); gl.bindTexture(gl.TEXTURE_2D, t ? t.tex : s.frameTex);
      if (!z || !qq || !t.ready) { gl.uniform4f(U['uT' + n], 1, 1, 0, 0); continue; }
      gl.uniformMatrix3fv(U['uH' + n], false, new Float32Array(invHomography(qq)));
      gl.uniform4f(U['uB' + n], z.sw, z.sh, (z.radius || 0) * z.sw, z.mode || 0);
      var scroll = c.scroll && z.scroll !== false ? c.scroll(p) * Math.max(0, z.sw * t.h / t.w - z.sh) : 0;
      gl.uniform4f(U['uT' + n], t.w, t.h, scroll, 1);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* timeline: 0 opener | .05-.30 iPhone spins | .31-.50 camera pushes into its
     screen | .56-.62 dissolve to the laptop dashboard | .60-.76 pull back to
     the laptop | .765-.785 hand over to the family | .785-.92 family turns |
     .94+ close */
  var SPIN_BOX = { cx: 960, cy: 540, w: 506, h: 1012 }, FAMILY_BOX = { cx: 854, cy: 480, w: 1560, h: 860 }, FAMILY_BOX_TALL = { cx: 854, cy: 480, w: 1510, h: 820 };
  /* the family is fitted whole from its first frame (devices bbox 373-1503 x
     154-856); the laptop's pull-back ends exactly matched to the family's
     laptop, so the hand-over lines up and nothing is ever cut */
  var FAMILY_START_BOX = { cx: 938, cy: 505, w: 1240, h: 800 };
  var L_END = { cx: 385, cy: 457, w: 656 }, F_START = { cx: 870, cy: 415, w: 509 };
  /* phones / portrait: the laptop is fitted on its own (big), the family starts
     lined up on it and zooms out to the whole group while it turns.
     wide screens: the family is fitted whole from its first frame. */
  var LAPTOP_BOX = { cx: 523, cy: 571, w: 960, h: 800 };
  function laptopEnd() {
    if (prof !== 'wide') return zone(LAPTOP_BOX);
    var f = zone(FAMILY_START_BOX), k = f.s * F_START.w / L_END.w; return { s: k, x: f.x + F_START.cx * f.s - L_END.cx * k, y: f.y + F_START.cy * f.s - L_END.cy * k };
  }
  /* hand-over (Ram): no cross-fade between two different laptops (it ghosts).
     The laptop fades out first, then the family fades in already framed in
     full, settling in from 94% scale. */
  function familyStart(p) {
    var z = zone(FAMILY_START_BOX), k = .94 + .06 * ease(seg(p, [.776, .8])), cx = z.x + 938 * z.s, cy = z.y + 505 * z.s;
    return { s: z.s * k, x: cx - 938 * z.s * k, y: cy - 505 * z.s * k };
  }
  var shots = [
    new Shot({ dir: 'seq-spin/', screens: [{ img: 'phone-home-tex.jpg', sw: 390, sh: 850, radius: .13 }],
      frame: function (p, N) { return 1 + Math.round(ease(seg(p, [.05, .3])) * (N - 1)); },
      cam: function (p) { var sc = Math.max(W / 430, H / 937) * 1.06; return mix(zone(SPIN_BOX), { s: sc, x: W / 2 - 960 * sc, y: H / 2 - 540 * sc }, ease(seg(p, [.31, .5]))); },
      opacity: function (p) { return ease(seg(p, [.03, .07])) * (1 - ease(seg(p, [.57, .62]))); },
      scroll: function (p) { return .5 * ease(seg(p, [.26, .6])); } }),
    new Shot({ dir: 'seq-laptop/', screens: [{ img: 'desktop-home-tex.jpg', sw: 1440, sh: 931, radius: .006 }],
      frame: function (p, N) { return 1 + Math.round(ease(seg(p, [.6, .76])) * (N - 1)); },
      cam: function (p) { return mix(cover(960, 540, 1920), laptopEnd(), ease(seg(p, [.63, .76]))); },
      opacity: function (p) { return ease(seg(p, [.56, .62])) * (1 - ease(seg(p, [.758, .772]))); },
      scroll: function (p) { return .12 * ease(seg(p, [.62, .8])); } }),
    /* family quads are [laptop, tablet, phone]; drawn tablet first (it sits behind) */
    new Shot({ dir: 'seq-family/', order: [1, 0, 2],
      screens: [{ img: 'desktop-home-tex.jpg', sw: 834, sh: 1118, radius: .03, mode: 1, scroll: false }, { img: 'desktop-home-tex.jpg', sw: 1440, sh: 929, radius: .006, scroll: false }, { img: 'phone-home-tex.jpg', sw: 390, sh: 873, radius: .13, scroll: false }],
      frame: function (p, N) { return 1 + Math.round(ease(seg(p, [.79, .92])) * (N - 1)); },
      cam: function (p) { return mix(familyStart(p), zone(prof === 'wide' ? FAMILY_BOX : FAMILY_BOX_TALL), ease(seg(p, [.79, .92]))); },
      opacity: function (p) { return ease(seg(p, [.776, .796])); } })
  ];

  /* ── render ──────────────────────────────────────────────────────────── */
  var last = -1;
  function render(p) {
    if (Math.abs(p - last) < .0002) return; last = p;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    shots.forEach(function (s) { if (s.Q) s.draw(p); });
    if (opener) { var o = 1 - ease(seg(p, [0, .05])); opener.style.opacity = o.toFixed(3); opener.style.transform = 'translate3d(0,' + (-(1 - o) * 28).toFixed(1) + 'px,0)'; }
    caps.forEach(function (cp) { var v = band(cp.t, p); cp.el.style.opacity = v.toFixed(3); cp.el.style.transform = 'translate3d(0,' + ((1 - v) * 22).toFixed(1) + 'px,0)'; cp.el.classList.toggle('is-on', v > .5); });
  }

  /* ── loop ────────────────────────────────────────────────────────────── */
  var target = 0, cur = 0, raf = 0, locked = false;
  function progress() { var r = root.getBoundingClientRect(), run = root.offsetHeight - stage.clientHeight; return run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1; }
  function tick() { raf = 0; cur += (target - cur) * .22; if (Math.abs(target - cur) < .0004) cur = target; render(cur); if (cur !== target) request(); }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }
  function onScroll() { if (locked) return; target = REDUCED ? 1 : progress(); request(); }
  root.__setP = function (p) { locked = true; target = cur = p; last = -1; render(p); };   // QA hook (freezes scroll)
  var rT; function onResize() { clearTimeout(rT); rT = setTimeout(function () { var was = small; measure(); if (was !== small) shots.forEach(function (s) { s.frames = []; s.uploaded = 0; s.preload(); }); last = -1; render(cur); }, 120); }
  function boot() {
    Promise.all(shots.map(function (s) { return s.load(); })).then(function () {
      measure();
      shots[0].preload(); setTimeout(function () { shots.slice(1).forEach(function (s) { s.preload(); }); }, 1500);
      target = cur = REDUCED ? 1 : progress(); render(cur);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); render(cur); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
