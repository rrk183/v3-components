#!/usr/bin/env node
// The verify gate — machine-runnable enforcement of TESTING.md's critical
// flows. Node core only (no deps), deterministic, exits non-zero on any FAIL.
// Warnings print but do not fail the gate; each check names the charter flow
// it enforces. Run: node scripts/verify.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPage } from "./build-all-components.mjs";

// THE COLOUR VOCABULARY + PAIRING RULEBOOK — one file, two readers: this gate
// and the gallery's Surface control (assets/js/library.js + frame.html). It is
// never restated; a rule that needs a palette fact imports it.
const PAL = createRequire(import.meta.url)("../assets/js/ds-palette.js");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(ROOT, p), "utf8");
const fails = [];
const warns = [];
const fail = (flow, msg) => fails.push(`[flow ${flow}] ${msg}`);
const warn = (flow, msg) => warns.push(`[flow ${flow}] ${msg}`);

// ── inventory ───────────────────────────────────────────────────────────────
const blockFiles = readdirSync(path.join(ROOT, "blocks"))
  .filter((f) => f.endsWith(".html")).sort();
const blockNames = blockFiles.map((f) => f.slice(0, -5));
const allPages = readdirSync(ROOT).filter((f) => f.endsWith(".html"));
// SATELLITE SITES live in a subfolder and run the same gate, keyed "dir/page.html"
// (ibv2/ = Emirates NBD Capital, Hakan 2026-09-07). Their pages reference the
// runtime root-absolute (/assets/…), which the asset check below resolves from ROOT.
const SATELLITES = ["ibv2"];
for (const d of SATELLITES)
  if (existsSync(path.join(ROOT, d)))
    allPages.push(...readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith(".html")).map((f) => `${d}/${f}`));
const PARKED = /-(ram|codex)\.html$/;
// Internal TOOLING pages, exempt from the first-party product rules. Per the
// 2026-09-03 ruling, tooling is completely separate from the product bundle:
// it must NOT load ds.css/ds.js/Tailwind, it may hardcode brand constants, and
// it may use markup the product bans (site-index-v2.html uses native <details>
// disclosure and carries its own assets/css/site-index.css + site-index.js).
// Tooling never ships to the CMS, so the product contract does not apply.
const DEV_RIGS = new Set(["frame.html", "harness.html", "review.html", "index.html", "category.html", "all-components.html", "audit.html", "site-index-v2.html"]);
const firstParty = allPages.filter((f) => !PARKED.test(f) && !DEV_RIGS.has(f) && !f.includes(" "));
const junk = allPages.filter((f) => f.includes(" "));
for (const j of junk) fail(4, `junk filename in repo root: "${j}"`);

const css = read("assets/css/ds.css");
// ── tooling/product SEPARATION (ruling 2026-09-03): the product bundle may
// contain NO tooling selectors, and no product page may load tooling assets.
{
  const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const bad of ["#sfx-", ".lib-", ".sx-"]) {
    if (cssNoComments.includes(bad)) fail(5, `tooling selector "${bad}" inside ds.css — tooling styles live in library.css/site-index.css`);
  }
  for (const f of firstParty) {
    const h = read(f);
    for (const asset of ["library.css", "library.js", "site-index.css", "site-index.js", "ds-palette.js"]) {
      if (h.includes(asset)) fail(4, `${f}: product page loads tooling asset ${asset}`);
    }
  }
}
const dsjs = read("assets/js/ds.js");

// ── shared readers: CSS rules + a markup walk with ground context ───────────
// Both are deliberately small and tolerant. The CSS reader yields LEAF rules
// (selector + declarations, no nested braces); the markup walk yields every
// element with its class list and a parent chain, which is all the pairing
// rulebook needs to resolve a ground statically.
function cssRules(src) {
  const out = [];
  const stack = [];
  let i = 0, selStart = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "{") { stack.push({ sel: src.slice(selStart, i).trim(), bodyStart: i + 1, selStart }); i++; selStart = i; continue; }
    if (c === "}") {
      const top = stack.pop();
      if (top) out.push({ sel: top.sel, body: src.slice(top.bodyStart, i), start: top.selStart });
      i++; selStart = i; continue;
    }
    if (c === ";" && !stack.length) { i++; selStart = i; continue; }
    i++;
  }
  return out.filter((r) => !r.sel.startsWith("@") && !r.body.includes("{"));
}

const MARKUP_VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "path", "use", "circle", "rect", "area", "col", "embed", "track", "wbr", "polyline", "line", "polygon", "ellipse", "stop", "defs"]);
function walkMarkup(src, visit) {
  const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>|<!--[\s\S]*?-->/g;
  const stack = [];
  let m;
  while ((m = TAG.exec(src))) {
    if (m[0].startsWith("<!--")) continue;
    const [, close, tag, attrs, selfClose] = m;
    const t = tag.toLowerCase();
    if (close) {
      for (let i = stack.length - 1; i >= 0; i--)
        if (stack[i].tag === t) { stack.splice(i).reverse().forEach(visit); break; }
      continue;
    }
    const cls = (/class\s*=\s*"([^"]*)"/.exec(attrs) || /class\s*=\s*'([^']*)'/.exec(attrs) || [])[1] || "";
    const node = { tag: t, classes: cls.split(/\s+/).filter(Boolean), attrs, parent: stack[stack.length - 1] || null, start: m.index, end: TAG.lastIndex };
    if (MARKUP_VOID.has(t) || selfClose) { visit(node); continue; }
    stack.push(node);
  }
  stack.reverse().forEach(visit);
}

// The GROUND an element stands on, from the markup alone: nearest surface-*
// ancestor-or-self. surface-clear is the null surface — it resolves THROUGH to
// whatever real ground is behind it, exactly as it paints.
function resolveGround(node, fallback = "surface-white") {
  for (let n = node; n; n = n.parent)
    for (const c of n.classes) {
      const s = PAL.isSurface(c) ? c : (PAL.DEPRECATED[c] || "").startsWith("surface-") ? PAL.DEPRECATED[c] : null;
      if (s && s !== "surface-clear") return s;
    }
  return fallback;
}
// On surface-image the ink follows the OVERLAY'S COLOUR — the author's declared
// intent — regardless of its strength. Read the first .ov inside the media
// surface that owns this element.
function overlayColourFor(node, src) {
  let host = null;
  for (let n = node; n; n = n.parent)
    if (n.classes.includes("surface-image")) { host = n; break; }
  if (!host) return null;
  const scope = src.slice(host.end, host.end + 4000);
  const ov = /class\s*=\s*"([^"]*\bov\b[^"]*)"/.exec(scope);
  if (!ov) return null;
  return ov[1].split(/\s+/).find((c) => PAL.OV_GROUND_KIND[c] || PAL.DEPRECATED[c] in PAL.OV_GROUND_KIND)
    || ov[1].split(/\s+/).map((c) => PAL.DEPRECATED[c]).find((c) => PAL.OV_GROUND_KIND[c]) || null;
}
// The DS's own text atoms — the elements the library exists to demonstrate.
const TYPE_SCALE = /^type-(display-(xxl|xl|lg)|h[1-6]|body(-lg|-sm)?|eyebrow|caption|micro)$/;
// Chrome that owns its own ink by construction (a button's paint IS its type,
// a screen-reader label has no colour at all).
// Chrome that owns its ink by MEANING, not by hierarchy: a button's paint is
// its type, a status banner's ink is its tone, a screen-reader label has no
// colour at all. The pairing rulebook does not apply to any of them.
const CHROME = /^(btn|chip|badge|tag|sr-only|filter-chip|notif|toast)/;
function exemptChrome(node) {
  for (let n = node; n; n = n.parent) if (n.classes.some((c) => CHROME.test(c))) return true;
  return false;
}

// blocks whose root class differs from the filename (today's sanctioned reality;
// new blocks must match exactly or be added here deliberately)
const ALIAS = {
  "desktop-scroll": "device-scroll", "phone-scroll": "device-scroll", "desktop-scroll-rev": "device-scroll", "phone-scroll-rev": "device-scroll",
  "illustration-split-rev": "illustration-split",
  // world-map-scale is the map + an under-map data strip: same recipe + root
  // class (.cmp-world-map), only the folded-in .wm-scale strip is added.
  "world-map-stats": "world-map",
  // cards-thumb carousel is the same component + .is-carousel layout modifier
  "cards-thumb-carousel": "cards-thumb",
  // cmp-cards COMPOSITIONS (2026-09-01): one component, many gallery cards
  "cards-carousel": "cards", "cards-boxed": "cards", "cards-plain": "cards", "cards-promo": "cards", "cards-promo-carousel": "cards", "cards-promo-scroll": "cards", "cards-tiles": "cards", "cards-tiles-carousel": "cards", "cards-tiles-scroll": "cards", "cards-scroll": "cards", "cards-plain-carousel": "cards", "cards-testimonials": "cards",
  "cards-icon": "cards", "cards-number": "cards", "cards-kicker": "cards", "cards-list": "cards", "cards-aside": "cards", "cards-tiles-aside": "cards", "cards-tiles-aside-carousel": "cards",
  // filter-grid demos data-filter ON the cards kicker composition (2026-09-01)
  "filter-grid": "cards",
  "stats-row": "cards",
  "cards-icon-linked": "cards", "cards-steps": "cards",
  "cards-case-study": "cards", "cards-people": "cards",
  "cards-partners": "cards", "cards-tombstones": "cards",
  "cards-boxed-carousel": "cards", "cards-icon-carousel": "cards",
  // every composition gets the SAME Grid/Carousel/Scroll option set (2026-08-31)
  "cards-icon-linked-carousel": "cards", "cards-number-carousel": "cards",
  "cards-kicker-carousel": "cards", "cards-steps-carousel": "cards",
  "cards-case-study-carousel": "cards", "cards-people-carousel": "cards",
  "cards-partners-carousel": "cards", "cards-tombstones-carousel": "cards",
  "cards-testimonials-carousel": "cards",
  "cards-boxed-scroll": "cards", "cards-plain-scroll": "cards",
  "cards-icon-scroll": "cards", "cards-icon-linked-scroll": "cards",
  // harvested bento tile designs (2026-09-01)
  "cards-illustrated": "cards", "cards-illustrated-carousel": "cards", "cards-illustrated-scroll": "cards", "cards-dashboard": "cards", "cards-dashboard-carousel": "cards", "cards-dashboard-scroll": "cards", "cards-quote": "cards", "cards-quote-carousel": "cards", "cards-quote-scroll": "cards",
  "cards-number-scroll": "cards", "cards-kicker-scroll": "cards",
  "cards-steps-scroll": "cards", "cards-case-study-scroll": "cards",
  "cards-people-scroll": "cards", "cards-partners-scroll": "cards",
  "cards-tombstones-scroll": "cards", "cards-testimonials-scroll": "cards",
  // quote-band-rev is the is-rev VARIANT of quote-band (2026-09-01)
  "quote-band-rev": "quote-band", "quote-band-carousel": "quote-band",
  // cards-thumb-box carousel shares the .cmp-cards-thumb-box root class
  "cards-thumb-box-carousel": "cards-thumb-box",
  
  // feature-scroll-story mockup-left variant: same .cmp-feature-scroll-story
  // root + engine, only `rev` on the .ess element flips the mockup column side
  "feature-scroll-story-rev": "feature-scroll-story",
  // header v2 comparison variants deliberately share the site-header root class
  // (same theme + recipe; only the segment-bar overflow behavior differs)
  "site-header-v2": "site-header", "site-header-v2-scroll": "site-header", "site-header-v4": "site-header",
  // tab variants share the v4 cmp-tabs root (tabs-pill-dark deleted 2026-09-01
  // — dark pills are the chip atoms under a dark surface flip)
  "scroll-showcase-rev": "scroll-showcase",
  "tabs-underline": "tabs", "tabs-pill": "tabs", "tabs-toggle": "tabs", "tabs-directory": "tabs", "tabs-experience": "tabs",
  // cmp-acc v4 compositions (2026-09-01)
  "acc-faq": "acc", "acc-boxed": "acc",
  "hex-reach-map-stats": "hex-reach-map",
  // cmp-bento compositions (2026-09-01)
  "bento-photo": "bento", "bento-photo-small": "bento", "bento-spotlight": "bento", "bento-image-cards": "bento", "bento-magazine": "bento", "bento-research": "bento", "bento-grid": "bento", "feature-highlight": "bento",   // cmp-hero v4 compositions (2026-09-01)
  "hero-image": "hero", "hero-editorial": "hero", "hero-slides": "hero", "hero-image-slides": "hero", "hero-editorial-slides": "hero",
  "tabs-card": "tabs", "tabs-vertical": "tabs",
  // pattern-kit blocks: root is `cmp <pattern-class>` with no cmp- component class
  "api-request": null, "browser-checkout": null, "chat-pay-invite": null,
  "checkout-card": null, "cta-band": null, "ecosystem-devices": "ecosystem",
  "hero-image-sequence": null, "market-band": null, "payment-link": null, "phone-checkout": null,
  "pos-terminal": null,
};
// surface-clear = the NULL surface (no paint, inherits ink); surface-glass +
// its -25/-50/-75 strength ladder = the frosted dark-context family (the
// successors of the retired `card-clear is-fill-NN`). All are general
// container paints, not a card accessory — see "The card model" in
// CONVENTIONS.md.
// Surfaces are ROLE-named, never colour-named (RULING 2026-09-03): a colour
// name lies under a second brand, where "navy" paints purple. surface-navy →
// surface-primary and surface-blue → surface-accent; the old spellings stay
// KNOWN (so they are not "unknown surface" failures) but are WARNed on below.
// surface-accent2 is RESERVED — deliberately absent until something defines it.
// The grounds come from the palette itself — no second list to drift.
// Deprecated spellings are accepted here and warned about; flow 8 owns the
// closed-vocabulary judgement.
const SURFACES = new Set([...PAL.SURFACES, ...Object.keys(PAL.DEPRECATED).filter((k) => k.startsWith("surface-"))]);
const DEPRECATED_SURFACES = Object.fromEntries(
  Object.entries(PAL.DEPRECATED).filter(([k]) => k.startsWith("surface-")));

// data-behavior whitelist = ds.js recipes + behavior strings ds.js knows
const behaviors = new Set([...dsjs.matchAll(/recipe\('([a-z-]+)'/g)].map((m) => m[1]));
for (const m of dsjs.matchAll(/data-behavior="?\[?"?([a-z-]+)/g)) behaviors.add(m[1]);
for (const m of dsjs.matchAll(/'([a-z-]+)'/g)) if (/^(scroll|app|sticky|zoom|ib)-/.test(m[1])) behaviors.add(m[1]);

// The section header owns its own row. Wrapping a .section-head in a bespoke
// layout row (to hang a "view all" link beside it) makes the header a flex ITEM
// it cannot escape, so the .is-center / .is-split variants — and the gallery's
// Header control — silently do nothing. Put the row class ON the header and
// make the link a .sh-action child instead. Returns the offending wrapper, or
// null. Parses with a tag stack; only element nesting matters here.
function headerWrappedInRow(src) {
  const OK_PARENT = /\b(container-ds|container-narrow|section-x|ds-stack|cmp)\b/;
  const VOID = /^(br|hr|img|input|meta|link|source|path|circle|rect|line|polygon|polyline|ellipse|use|stop)$/i;
  const stack = [];
  for (const m of src.matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi)) {
    const [, closing, tag, attrs] = m;
    if (closing) { stack.pop(); continue; }
    if (/\/\s*$/.test(attrs) || VOID.test(tag)) continue;
    const cls = (attrs.match(/class="([^"]*)"/) || [, ""])[1];
    if (/\bsection-head(-sm)?\b/.test(cls)) {
      const parent = stack[stack.length - 1];
      if (parent && parent.cls.trim() && !OK_PARENT.test(parent.cls)) {
        // Only an ACTION beside the header forces the row that breaks the
        // variants. A wrapper holding a column layout or decorative artwork
        // (cta-marquee's flex-col, zoom-parallax's glow frame) is fine.
        const head = { start: m.index, end: elementEnd(src, m.index) };
        const outside = src.slice(parent.start, head.start) + src.slice(head.end, elementEnd(src, parent.start));
        if (/<(a|button)\b/i.test(outside)) return parent.cls.trim();
      }
    }
    stack.push({ tag, cls, start: m.index });
  }
  return null;
}
// index just past the matching close tag of the element opening at `from`
function elementEnd(src, from) {
  const tag = (src.slice(from).match(/^<([a-z][a-z0-9]*)/i) || [, ""])[1];
  if (!tag) return src.length;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = from;
  let depth = 0, m;
  while ((m = re.exec(src))) {
    if (m[1]) { if (--depth === 0) return m.index + m[0].length; }
    else if (!/\/\s*>$/.test(m[0])) depth++;
  }
  return src.length;
}

// ── flow 1: block contract ──────────────────────────────────────────────────
for (const f of blockFiles) {
  const name = f.slice(0, -5);
  const src = read(`blocks/${f}`);
  {
    const wrapper = headerWrappedInRow(src);
    if (wrapper)
      fail(1, `${f}: .section-head is wrapped in "${wrapper.slice(0, 40)}" — a wrapper row traps the header as a flex item, so .is-center/.is-split (and the gallery Header control) do nothing. Put that class ON the .section-head and make any trailing link a .sh-action child.`);
  }
  if (!/class="cmp /.test(src)) fail(1, `${f}: no 'class="cmp ' root`);
  const cmpClass = src.match(/class="cmp (?:cmp-([a-z0-9-]+))?/);
  const expected = name in ALIAS ? ALIAS[name] : name;
  if (expected !== null && cmpClass?.[1] !== expected)
    fail(1, `${f}: root cmp-class is "${cmpClass?.[1] ?? "(none)"}", expected "cmp-${expected}" (or add an ALIAS)`);
  for (const m of src.matchAll(/\sid="([^"]+)"/g))
    if ((src.split(`"${m[1]}"`).length - 1) < 2)
      fail(1, `${f}: id="${m[1]}" is unreferenced (blocks must be ID-free unless wired via aria-* or data-*)`);
  if (/<script/i.test(src)) fail(1, `${f}: contains <script>`);
  if (/<style/i.test(src)) fail(1, `${f}: contains <style>`);
  if (/<details/i.test(src)) fail(1, `${f}: uses <details> (banned for accordions)`);
  for (const m of src.matchAll(/style="([^"]*)"/g))
    if (!/^\s*--[a-z-]+\s*:/.test(m[1]))
      fail(1, `${f}: inline style="${m[1].slice(0, 40)}" (only custom-property passing allowed)`);
  if (/lorem ipsum|dolor sit amet/i.test(src)) fail(1, `${f}: lorem ipsum copy`);
  for (const m of src.matchAll(/data-behavior="([a-z-]+)"/g))
    if (!behaviors.has(m[1])) fail(1, `${f}: unknown data-behavior "${m[1]}"`);
  for (const m of src.matchAll(/(?:data-bg|src)="\/?(assets\/[^"]+)"/g))
    if (!existsSync(path.join(ROOT, m[1].split("?")[0]))) fail(1, `${f}: missing asset ${m[1]}`);
  // markup colour literals break brand theming (themes.css): arbitrary hex
  // utilities (text-[#2765FF]) and raw rgba() triplets bypass the token
  // system entirely. White/black stay literal; SVG artwork uses
  // currentColor + a text-<token> class on the <svg>.
  for (const m of src.matchAll(/-\[#([0-9a-fA-F]{3,8})\]/g))
    if (!["fff", "ffffff", "000", "000000", "030303"].includes(m[1].toLowerCase()))
      fail(1, `${f}: arbitrary hex utility -[#${m[1]}] — use a token utility (text-blue, bg-navy-deep, …)`);
  for (const m of src.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g))
    if (!["255,255,255", "0,0,0", "3,3,3"].includes(`${m[1]},${m[2]},${m[3]}`))
      fail(1, `${f}: raw rgb triplet ${m[1]},${m[2]},${m[3]} in markup — use rgba(var(--x-rgb), a) or currentColor`);
  // SVG presentation attrs can't take var(): brand-hex fill/stroke must be
  // currentColor + a text-<token> class on the svg. Brand MARKS are exempt —
  // logos and partner-mark placeholders keep their drawn colour by design.
  if (!["solutions-awards", "logo-wall", "logo-wall-marquee"].includes(name))
    for (const m of src.matchAll(/(?<![-a-zA-Z])(?:fill|stroke|color|stop-color)="#(072447|2765ff|3a4b5c|f4f7fb|e5e7eb)"/gi))
      fail(1, `${f}: brand hex #${m[1]} in an SVG attribute — use currentColor + a text-<token> class`);
  for (const m of src.matchAll(/class="(?:[^"]* )?(surface-[a-z0-9-]+)(?![a-z-])/g)) {
    if (!SURFACES.has(m[1])) fail(1, `${f}: unknown surface "${m[1]}"`);
    if (m[1] === "surface-dark" && name !== "hero-cinematic-cards")
      fail(1, `${f}: surface-dark default (only hero-cinematic-cards is sanctioned)`);
  }
  // Blocks are the library — a deprecated colour surface here would be copied
  // onto every page built from it, so warn on blocks too (see flow 4).
  for (const [old, now] of Object.entries(DEPRECATED_SURFACES)) {
    const n = (src.match(new RegExp(`class="[^"]*\\b${old}\\b`, "g")) || []).length;
    if (n) warn(1, `${f}: ${n}× DEPRECATED surface name — use ${now} instead of ${old}`);
  }
}

// ── flow 2: runtime pair ────────────────────────────────────────────────────
for (const js of ["assets/js/ds.js", "assets/js/library.js", "assets/js/ds-palette.js", "server.js", "assets/js/gate.js", "assets/js/gate-config.js"]) {
  try { execFileSync("node", ["--check", path.join(ROOT, js)], { stdio: "pipe" }); }
  catch (e) { fail(2, `${js} fails node --check: ${String(e.stderr).slice(0, 200)}`); }
}
{
  const open = (css.match(/\{/g) || []).length, close = (css.match(/\}/g) || []).length;
  if (open !== close) fail(2, `ds.css unbalanced braces: ${open} { vs ${close} }`);
  // Every palette GROUND is defined, and defines a background — a ground that
  // paints nothing is a word the author can write and not see. Modes are
  // exempt: surface-clear paints nothing BY DEFINITION, and surface-image's
  // ground is the data-bg photo.
  for (const s of PAL.PALETTE.map((w) => `surface-${w}`))
    if (!new RegExp(`(^|[,\\s])\\.${s}[\\s,{][^{]*\\{[^}]*background`, "m").test(css))
      fail(2, `.${s} is in the palette but paints no background in ds.css`);
  for (const i of PAL.INKS)
    if (!new RegExp(`(^|[,\\s])\\.${i}[\\s,{][^{]*\\{[^}]*color\\s*:`, "m").test(css))
      fail(2, `.${i} is in the palette but sets no colour in ds.css`);
  if (!/^\.surface-dark[\s,{][^{]*\{[^}]*background:\s*#030303/m.test(css))
    fail(2, ".surface-dark definition altered or selector-polluted");
  // Comments legitimately DISCUSS the old names (the deprecation notes do), so
  // these two checks read the sheet with comments masked out.
  const cssCode = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  // The colour spellings must survive ONLY as definition-block aliases (2 each:
  // the ink ramp + the base paint). If one shows up in a COMPOUND selector,
  // someone re-introduced the old name into the flip/island machinery — which
  // is exactly where the rename has to hold.
  for (const old of ["surface-navy", "surface-blue"]) {
    const hits = (cssCode.match(new RegExp(`\\.${old}(?![a-z0-9-])`, "g")) || []).length;
    if (hits > 2) fail(2, `.${old} appears ${hits}× in ds.css — the deprecated alias belongs on the 2 definition blocks only`);
  }
  // surface-accent2 is RESERVED: named in the docs, defined nowhere. If it ever
  // gains a definition, that is a deliberate act that must update the docs too.
  if (/\.surface-accent2(?![a-z0-9-])/.test(cssCode))
    fail(2, ".surface-accent2 is RESERVED — it must stay undefined until it is deliberately introduced");
  const vs = new Set();
  for (const p of [...firstParty, ...[...DEV_RIGS].filter((d) => existsSync(path.join(ROOT, d)))])
    for (const m of read(p).matchAll(/ds\.(?:css|js)\?v=(\w+)/g)) vs.add(m[1]);
  if (vs.size > 1) fail(2, `inconsistent cache-bust versions across pages: ${[...vs].join(", ")}`);
}

// ── flow 3: library coherence ───────────────────────────────────────────────
{
  const cat = read("assets/js/library.js");
  const slugs = new Set([...cat.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]));
  for (const s of slugs) if (!blockNames.includes(s)) fail(3, `catalog slug "${s}" has no blocks/${s}.html`);
  for (const b of blockNames) if (!slugs.has(b)) fail(3, `blocks/${b}.html not in the gallery catalog`);
  const dossiers = readdirSync(path.join(ROOT, "docs/catalog"))
    .filter((f) => f.endsWith(".md") && f !== "README.md").map((f) => f.slice(0, -3));
  for (const b of blockNames) if (!dossiers.includes(b)) fail(3, `blocks/${b}.html has no dossier docs/catalog/${b}.md`);
  for (const d of dossiers) if (!blockNames.includes(d)) fail(3, `dossier ${d}.md has no block`);
  if (read("all-components.html") !== buildPage())
    fail(3, "all-components.html is stale — run: node scripts/build-all-components.mjs --write");
}

// Button/control icons live ONCE in ds.css as data-URI masks named by a
// modifier class (the BUTTON GLYPH ENGINE, 2026-09-03 ruling) — an inline <svg>
// inside a button is markup carrying a design decision it should not own.
// A "button" is the atom, not a tag: the class token `btn` itself, or one of
// the named `*-btn` controls (crl-btn, pgn-btn, aci-btn). Layout wrappers that
// merely mention buttons (.btn-row, .aci-cta-btns) are not buttons.
// ALLOWLIST: glyphs that deliberately are NOT part of the vocabulary because
// they are BRAND MARKS, not icons — a third-party logo cannot be a one-colour
// currentColor mask, and it must not be recoloured by the button's ink.
//   .op-modal-li  LinkedIn mark on the people-profile modal (our-people)
//   .aci-btn      App Store / Google Play store badges (businessonline-x,
//                 blocks/scroll-scenes) — multi-colour, vendor-locked artwork
const GLYPH_BTN = /(^|\s)(btn|[a-z][a-z0-9]*(?:-[a-z0-9]+)*-btn)(\s|$)/;
const GLYPH_EXEMPT = /\b(op-modal-li|aci-btn)\b/;
const GLYPH_VOID = new Set(["img","br","hr","input","meta","link","source","path","use","circle","rect","area","col","embed","track","wbr","polyline","line","polygon","ellipse"]);
function inlineButtonSvgs(src) {
  const hits = [];
  for (const m of src.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
    // nearest enclosing element (regex alone mis-nests; walk a tag stack)
    const stack = [];
    for (const t of src.slice(0, m.index).matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*?)(\/?)>/g)) {
      const [, slash, name, attrs, selfClose] = t, ln = name.toLowerCase();
      if (GLYPH_VOID.has(ln) || selfClose) continue;
      if (slash) { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === ln) { stack.length = i; break; } }
      else stack.push({ name: ln, attrs });
    }
    const p = stack[stack.length - 1];
    if (!p) continue;
    const cls = (p.attrs.match(/class="([^"]*)"/) || [, ""])[1];
    if (GLYPH_BTN.test(cls) && !GLYPH_EXEMPT.test(cls)) hits.push(cls.trim().split(/\s+/).join("."));
  }
  return hits;
}

// ── flow 4: first-party page integrity ──────────────────────────────────────
const cssCmps = new Set([...css.matchAll(/\.((?:cmp-|ptf-|hp-|eco-|sw-|sky-)[a-z0-9-]+)/g)].map((m) => m[1]));
const blockCmps = new Set();
for (const f of blockFiles)
  for (const m of read(`blocks/${f}`).matchAll(/class="cmp ((?:cmp-)?[a-z0-9-]+)/g)) blockCmps.add(m[1]);
// accordion-offerings/twocol/singlerow were retired under the one-accordion rule
// and reinstated 2026-08-17 from the CIB review codebase (they are real blocks
// again, so pages may reference them). content-block-numbers un-retired 2026-08-27
// (Hakan): the block is real, in the gallery, and in active use on ~30 pages.
// Components whose CSS was DELETED 2026-09-01 (Hakan) — pages still carry
// their markup until the sweep migrates them per docs/MIGRATION.md. Their
// presence is a WARN (known debt), not a FAIL.
const RETIRED_SWEEP = new Set(['cmp-hero-video-left', 'cmp-hero-image-left', 'cmp-hero-video-center', 'cmp-hero-fullbleed', 'cmp-hero-carousel', 'cmp-editorial-story', 'cmp-hero-cinematic-cards', 'cmp-tabs-pills-grid', 'cmp-tabs-product-grid', 'cmp-feature-scroll-track', 'cmp-story-cards', 'cmp-highlights-tiles', 'cmp-kicker-cards', 'cmp-services-grid', 'cmp-pillar-grid', 'cmp-process-cards', 'cmp-experience-tabs', 'cmp-content-block-numbers', 'cmp-insight-split', 'cmp-about-stats', 'cmp-video-content', 'cmp-scroll-tab', 'cmp-bento-photo', 'cmp-bento-spotlight', 'cmp-bento-image-cards', 'cmp-bento-magazine', 'cmp-bento-grid', 'cmp-feature-highlight', 'cmp-digital-tools-showcase', 'cmp-carousel-center', 'cmp-carousel-left', 'cmp-people-carousel', 'cmp-deal-ticker', 'cmp-tombstone-grid', 'cmp-impact-stats', 'cmp-trusted-partners-grid', 'cmp-trusted-partners-marquee', 'cmp-metrics-type1', 'cmp-metrics-type2', 'cmp-key-transactions', 'cmp-testimonials', 'cmp-testimonials-expand', 'cmp-video-tabs', 'cmp-app-cinema']);
const RETIRED = /cmp-download-app-cinematic|class="[^"]*\bfaq-list\b/;
for (const p of firstParty) {
  const src = read(p);
  if (RETIRED.test(src)) fail(4, `${p}: references a retired component`);
  if (!/<title>[^<]{3,}/.test(src)) fail(4, `${p}: missing <title>`);
  if (!/name="description"/.test(src)) warn(4, `${p}: missing meta description`);
  if (/<style(?!>body\{margin:0\})/i.test(src.replace(/<style>body\{margin:0\}<\/style>/, "")) && /<style[\s>]/i.test(src.replace(/<style>(html,)?body\{margin:0\}<\/style>/g, "")))
    warn(4, `${p}: page-level <style> block (legacy debt — extract to ds.css/utilities)`);
  if (/lorem ipsum|dolor sit amet|\[PLACEHOLDER\]|TK-TK/i.test(src)) fail(4, `${p}: placeholder copy`);
  if (/#030303|#04101f/i.test(src.replace(/color:\s*#04101f/gi, ""))) fail(4, `${p}: raw near-black background value`);
  for (const m of src.matchAll(/class="cmp (cmp-[a-z0-9-]+)/g))
    if (!cssCmps.has(m[1]) && !blockCmps.has(m[1])) {
      if (RETIRED_SWEEP.has(m[1])) warn(4, `${p}: ${m[1]} is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)`);
      else fail(4, `${p}: unknown component class ${m[1]}`);
    }
  if (/class="[^"]*\bpos-ways\b/.test(src)) warn(4, `${p}: pos-ways (Ways to Accept) is RETIRED (CSS deleted 2026-09-01) — page renders unstyled until the sweep migrates it (docs/MIGRATION.md)`);
  if (/\bis-portrait-bleed\b/.test(src)) warn(4, `${p}: is-portrait-bleed (Quote Band variant) is RETIRED (CSS deleted 2026-09-01) — renders as the plain band until the sweep`);
  if (/class="cmp eco-fb"/.test(src)) warn(4, `${p}: old eco-fb markup (pre-atoms Ecosystem) — card paint moved to ds-card 2026-09-01; page renders degraded until the sweep migrates it (docs/MIGRATION.md)`);
  if (/class="ul-row"/.test(src)) warn(4, `${p}: old useful-links markup (inline strip) — rebuilt as the resource-row grid 2026-09-02; page renders degraded until the sweep migrates it (docs/MIGRATION.md)`);
  for (const m of src.matchAll(/class="[^"]*\bsurface-dark\b[^"]*"/g))
    if (!/hero-cinematic-cards/.test(m[0])) fail(4, `${p}: surface-dark outside the sanctioned component`);
  // Surfaces are ROLE-named (RULING 2026-09-03). The colour spellings still
  // paint (deprecated aliases in ds.css) but get NONE of the compound rules —
  // island guards, flip groups and :is() lists were migrated to the role names
  // only — so a page left on the old name renders subtly wrong, not obviously
  // broken. That is exactly what a warning is for.
  for (const [old, now] of Object.entries(DEPRECATED_SURFACES)) {
    const n = (src.match(new RegExp(`class="[^"]*\\b${old}\\b`, "g")) || []).length;
    if (n) warn(4, `${p}: ${n}× DEPRECATED surface name — use ${now} instead of ${old}`);
  }
  // brand-colour literals in page markup/styles won't follow a brand theme.
  // WARN (not fail): the remaining hits live in tracked legacy <style> debt.
  {
    let lit = 0;
    // Brand MARKS keep their drawn colour by design (mirrors the block-level
    // exemption): strip solutions-awards sections before counting.
    const src2 = src.replace(/<section class="cmp cmp-solutions-awards[\s\S]*?<\/section>/g, "");
    for (const m of src2.matchAll(/-\[#([0-9a-fA-F]{3,8})\]/g))
      if (!["fff", "ffffff", "000", "000000", "030303"].includes(m[1].toLowerCase())) lit++;
    for (const m of src2.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g))
      if (!["255,255,255", "0,0,0", "3,3,3"].includes(`${m[1]},${m[2]},${m[3]}`)) lit++;
    for (const m of src2.matchAll(/(?<![-a-zA-Z])(?:fill|stroke|color|stop-color)="#(?:2765ff|3a4b5c|f4f7fb|e5e7eb)"/gi)) lit++;
    if (lit) warn(4, `${p}: ${lit} colour literal(s) in markup/styles — will not follow brand themes (legacy debt)`);
  }
  for (const m of src.matchAll(/style="([^"]*)"/g))
    if (!/^\s*--[a-z-]+\s*:/.test(m[1])) fail(4, `${p}: inline style "${m[1].slice(0, 45)}"`);
  for (const m of src.matchAll(/(?:data-bg|src)="\/?(assets\/[^"]+)"/g))
    if (!existsSync(path.join(ROOT, m[1].split("?")[0]))) fail(4, `${p}: missing asset ${m[1]}`);

  // ── glossary rules the gate used to trust prose for (added 2026-08-29 after
  //    Hakan found codified rules silently violated across imported pages) ──
  // (a) a head class that does not exist: .sh-split was Ram's; ours is .is-split.
  //     It renders as a PLAIN stacked head with zero errors — 12 pages shipped
  //     that way. Any head layout class must be one ds.css actually defines.
  if (/class="[^"]*\bsh-split\b/.test(src)) fail(4, `${p}: legacy .sh-split head (undefined in ds.css — use .is-split with two groups)`);
  // (b) the forbidden light button atom (outline-light is THE dark outline)
  if (/class="[^"]*\bbtn btn-light\b/.test(src)) fail(4, `${p}: forbidden btn-light — use btn-primary / btn-outline-light`);
  // (c) mailto funnels: pages route to contact-us / the support forms instead
  for (const m of src.matchAll(/href="mailto:[^"]*"/g)) fail(4, `${p}: mailto link — route to contact-us or a support form`);
  // (d) hand-rolled media cards (Content lint #6): a utility-built card with
  //     media + heading belongs in the cards-thumb family
  for (const m of src.matchAll(/class="[^"]*rounded-2xl overflow-hidden[^"]*"/g))
    warn(4, `${p}: possible hand-rolled media card (lint #6) — map to the cards-thumb family`);
  // (e) an .ov overlay with no PAINT class. The atom now defaults to a tint so
  //     it can't be invisible, but the type belongs in the markup.
  for (const m of src.matchAll(/class="ov ([^"]*)"/g))
    if (!/ov-(tint|scrim|gradient-[btlr]|vignette|radial)/.test(m[1]))
      warn(4, `${p}: .ov without a paint class ("${m[1]}") — add ov-tint/ov-scrim/ov-gradient-*`);
  // (f) inline button svgs (2026-09-03 ruling) — see inlineButtonSvgs() below
  for (const c of inlineButtonSvgs(src))
    warn(4, `${p}: inline button svg in .${c} — use the glyph modifiers (CONVENTIONS.md § the glyph axis)`);
}
for (const f of blockFiles)
  for (const c of inlineButtonSvgs(read(`blocks/${f}`)))
    warn(4, `blocks/${f}: inline button svg in .${c} — use the glyph modifiers (CONVENTIONS.md § the glyph axis)`);
// parked pages: asset-404 check only (charter out-of-scope otherwise)
for (const p of allPages.filter((f) => PARKED.test(f)))
  for (const m of read(p).matchAll(/(?:data-bg|src)="\/?(assets\/[^"]+)"/g))
    if (!existsSync(path.join(ROOT, m[1].split("?")[0]))) warn(4, `${p} (parked): missing asset ${m[1]}`);

// ── flow 5: CSS discipline ──────────────────────────────────────────────────
{
  // NO ALPHA IN TEXT INK (ruling 2026-09-03, Hakan: "NO TEXT should have ALPHA
  // as option. Let them be colors."). Every ink is an OPAQUE colour: hierarchy
  // comes from the colour ramp, weight and size. Alpha stays legal for NON-text
  // paint — scrims/ov, glass fills, borders, shadows, backgrounds — and element
  // `opacity:` state/animation is deliberately OUT of scope (amended the same
  // day: "These can be alphas. It actually makes sense.").
  //
  // Scope is exactly the declarations that SET an ink: `color`,
  // `-webkit-text-fill-color`, and the ink custom properties every surface
  // flips (--on-surface*, --ink-*). Background/border/shadow/fill declarations
  // are never inspected, so a scrim keeps its alpha. Opaque composites are
  // written as color-mix(in srgb, …) so a brand theme still retints them.
  {
    const masked = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    const lineOf = (idx) => masked.slice(0, idx).split("\n").length;
    // an alpha-bearing colour: rgba()/hsla(), a slash-alpha form, an 8-digit
    // hex — or `transparent` inside a color-mix(), which is the same alpha in
    // disguise (color-mix(… var(--ok-ink) 80%, transparent) computes to
    // `color(srgb … / .8)`; four notif inks shipped that way). Mixing toward a
    // real GROUND token instead keeps the value opaque and themable.
    // rgb()/hsl(), 6-digit hexes and ground-mixed color-mix() are opaque, and pass.
    const ALPHA = /#[0-9a-fA-F]{8}\b|\b(?:rgba|hsla)\s*\(|\/\s*(?:0?\.\d+|0|\d{1,2}(?:\.\d+)?%)\s*\)|color-mix\([^;}]*\btransparent\b/;
    const INK_PROP = /(?:^|[;{])\s*(color|-webkit-text-fill-color|--on-surface(?:-mid|-faint)?|--ink-[\w-]+)\s*:\s*([^;}]+)/g;
    for (const m of masked.matchAll(INK_PROP)) {
      const prop = m[1], value = m[2];
      if (!ALPHA.test(value)) continue;
      // rgba(…, 1) / rgba(…, 100%) is opaque in effect but still spells alpha —
      // forbidden outright so the rule stays a bright line.
      fail(5, `ds.css:${lineOf(m.index)} text ink with alpha — "${prop}: ${value.trim().slice(0, 46)}" — inks are OPAQUE colours (use a --ink-* token or color-mix(in srgb, …)); alpha is for non-text paint only`);
    }
  }
  // NO raw hex colours outside :root — every colour goes through a token so a
  // brand theme can repaint the whole system by overriding variables only.
  // Exempt: pure white/black (+#030303, the sanctioned near-black) which mean
  // "ink on a surface", not brand; and the CSS-drawn product-mockup
  // illustrations (FILE MAP section 6) — those are artwork, not themable UI.
  const HEX_OK = new Set(["fff", "ffffff", "000", "000000", "030303"]);
  const ILLUS = new RegExp(
    "\\.(?:eph|epc|epos|epl|ebr|eapi|chat|tdash|trep|tintg|tform|tnotif|tdisc|tonb|tup|mkw|aconsole|alist|akeys|sfx|aci|eic|lpulse)[a-z0-9-]*" +
    "|\\.(?:api-dark|boapp|pbento|sw-card|ess-vis|bento-ship|laptop-screen|laptop-base|phone|phone-pill|ls-lid|ls-base|ls-glow" +
    "|sb-shell|sb-btn|sb-screen|ps-screen|hp-dash-card|map-stat-card|ssv-mini-card|mcard|callout|t-badge|eco-fb|as-track)\\b");
  // Blocks are ID-free by contract, so a ds.css rule scoped to an #id styles
  // nothing the moment that id is absent — the component renders completely
  // unstyled with no error (scroll-tab shipped this way: its id was dropped as
  // unreferenced while 20 rules still targeted it). Warn rather than fail:
  // #sfx-bar is pre-existing dev-toolbar chrome whose JS never came across.
  {
    const declared = new Set();
    for (const f of blockFiles)
      for (const m of read(`blocks/${f}`).matchAll(/\sid="([^"]+)"/g)) declared.add(m[1]);
    const seen = new Set();
    for (const m of css.matchAll(/(?:^|[\s,>+~({])#([a-zA-Z][\w-]*)/g)) {
      const id = m[1];
      if (/^[0-9a-fA-F]{3,8}$/.test(id) || declared.has(id) || seen.has(id)) continue;
      seen.add(id);
      warn(5, `ds.css targets #${id}, which no block declares — those rules style nothing`);
    }
  }

  // An animation whose @keyframes never made it across leaves any element with
  // opacity:0 in its start state permanently invisible — no error, nothing in
  // the console. (accordion-singlerow's cards 2 and 3 shipped this way: the
  // import copied the rules but not the keyframes.)
  {
    const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
    const used = new Set();
    for (const m of css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g))
      for (const tok of m[1].split(","))
        for (const w of tok.trim().split(/\s+/))
          if (/^[a-zA-Z_-][\w-]*$/.test(w) && !/^(none|initial|inherit|unset|infinite|alternate|reverse|forwards|backwards|both|normal|linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|running|paused)$/.test(w))
            used.add(w);
    for (const name of used)
      if (!defined.has(name)) fail(5, `ds.css: animation "${name}" has no @keyframes — anything it fades in stays invisible`);
  }

  // The MIRROR of the stray-'*/' bug below: a comment that LOSES its closer
  // runs on until the next '*/' anywhere in the file, eating every rule in
  // between. Braces cannot legitimately appear inside a ds.css comment, so a
  // comment containing one has swallowed live CSS. Both known cases came from
  // the same script splitting selector lists on commas — and both comments end
  // mid-sentence at a comma. Browsers drop the eaten rules in silence; the
  // features-autoprogress media/panel and the events dark-surface flips were
  // dead this way, which no other check caught.
  for (const m of css.matchAll(/\/\*([\s\S]*?)\*\//g)) {
    if (/[{}]/.test(m[1])) {
      const line = css.slice(0, m.index).split("\n").length;
      fail(5, `ds.css:${line} comment swallows live CSS (missing '*/') — rules after it are silently dropped: "${m[1].trim().slice(0, 60)}…"`);
    }
  }
  {
    // comment-mask (offsets preserved), then walk {} blocks with a selector stack
    const masked = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    const lineOf = (idx) => masked.slice(0, idx).split("\n").length;
    const stack = [];
    let prev = 0;
    for (const ev of masked.matchAll(/[{}]/g)) {
      const chunk = masked.slice(prev, ev.index);
      if (ev[0] === "{") {
        const sel = chunk.trim().replace(/\s+/g, " ");
        // a stray comment-closer fused into a selector list makes the WHOLE
        // rule invalid — browsers drop it silently (this shipped once: a
        // script split selectors on commas inside a comma-bearing comment)
        if (sel.includes("*/"))
          fail(5, `ds.css:${lineOf(prev)} stray '*/' inside a selector — the rule is silently dropped: ${sel.slice(0, 60)}`);
        stack.push(sel);
      }
      else {
        const ctx = stack.join(" ");
        const inRoot = stack.some((s) => /(^|,\s*):root\b/.test(s));
        // surface-image contract: the image comes from data-bg in markup,
        // NEVER from CSS — so a url() in any surface-image rule is a leak
        // (this is how a brand ends up seeing another brand's artwork).
        if (/\.surface-image\b/.test(ctx) && /url\(/.test(chunk))
          fail(5, `ds.css:${lineOf(prev)} url() inside a .surface-image rule — background images come from data-bg in markup, not CSS`);
        if (!inRoot && !ILLUS.test(ctx)) {
          const sel = (stack[stack.length - 1] || "?").slice(0, 60);
          for (const h of chunk.matchAll(/#([0-9a-fA-F]{3,8})\b/g))
            if (!HEX_OK.has(h[1].toLowerCase()))
              fail(5, `ds.css:${lineOf(prev + h.index)} raw hex #${h[1]} in "${sel}" — use a token`);
          // raw rgb()/rgba() triplets are the same leak in disguise (the hex
          // rule can't see them — that's how the overlay tint stayed ENBD
          // navy under every theme). Sanctioned forms: rgba(var(--x-rgb), a)
          // and color-mix(... var(--token) ...). White/black stay literal.
          const TRIPLET_OK = new Set(["255,255,255", "0,0,0", "3,3,3"]);
          for (const t of chunk.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g))
            if (!TRIPLET_OK.has(`${t[1]},${t[2]},${t[3]}`))
              fail(5, `ds.css:${lineOf(prev + t.index)} raw rgb triplet ${t[1]},${t[2]},${t[3]} in "${sel}" — use rgba(var(--x-rgb), a) or color-mix on a token`);
          for (const d of chunk.matchAll(/--[\w-]+\s*:\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*[;\n]/g))
            if (!TRIPLET_OK.has(`${d[1]},${d[2]},${d[3]}`))
              fail(5, `ds.css:${lineOf(prev + d.index)} raw triplet declaration in "${sel}" — point it at a var(--x-rgb) token`);
        }
        stack.pop();
      }
      prev = ev.index + 1;
    }
  }
  // ── the light-island contract — RETIRED 2026-09-03 ───────────────────────
  // The LIGHT ISLANDS rule and its ~11 duplicated token-flips were DELETED by
  // the colour law: a light card inside a dark section is no longer a CSS
  // rescue, it is a panel that DECLARES its own surface in the markup
  // (`card-panel surface-white`). The checks that policed the island group's
  // drift and its flip collisions policed machinery that no longer exists;
  // flow 8 (§ 8a anti-context, § 8d block pairing) replaces both, and does it
  // at the source — it is now impossible to WRITE the rule they guarded.
  // every var(--x) without a fallback must resolve to a definition somewhere:
  // ds.css/themes.css declarations, ds.js setProperty, or style="--x:…" passing
  // in blocks/pages (the one sanctioned inline-style form)
  {
    const themes = existsSync(path.join(ROOT, "assets/css/themes.css")) ? read("assets/css/themes.css") : "";
    const decomment = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ");
    const defined = new Set();
    for (const src of [decomment(css), decomment(themes)])
      for (const m of src.matchAll(/--([a-zA-Z0-9-]+)\s*:/g)) defined.add(m[1]);
    for (const m of dsjs.matchAll(/setProperty\(\s*['"]--([a-zA-Z0-9-]+)/g)) defined.add(m[1]);
    for (const f of [...blockFiles.map((b) => `blocks/${b}`), ...allPages])
      for (const m of read(f).matchAll(/style="[^"]*--([a-zA-Z0-9-]+)\s*:/g)) defined.add(m[1]);
    const missing = new Map();
    for (const m of decomment(css).matchAll(/var\(\s*--([a-zA-Z0-9-]+)\s*\)/g))
      if (!defined.has(m[1])) missing.set(m[1], (missing.get(m[1]) || 0) + 1);
    for (const [name, n] of missing)
      fail(5, `ds.css: var(--${name}) never defined anywhere (${n} use(s), no fallback)`);
  }
  // themes.css (when present): variables only, and every theme block must
  // define the identical token set — a brand silently inheriting another
  // brand's colour is the failure mode this exists to catch
  if (existsSync(path.join(ROOT, "assets/css/themes.css"))) {
    const themes = read("assets/css/themes.css");
    const masked = themes.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    if (/url\(/.test(masked))
      fail(5, "themes.css contains url() — brand images are authored in markup via data-bg, never in theme CSS");
    const sets = new Map(); // theme selector → Set of prop names
    for (const b of masked.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = b[1].trim().replace(/\s+/g, " ");
      const props = new Set();
      for (const d of b[2].matchAll(/([a-zA-Z-]+[a-zA-Z0-9-]*)\s*:/g)) {
        if (!d[1].startsWith("--")) fail(5, `themes.css "${sel}": non-variable declaration "${d[1]}" (themes override tokens only)`);
        else props.add(d[1]);
      }
      if (/\[data-theme=/.test(sel)) sets.set(sel, props);
    }
    const entries = [...sets.entries()];
    for (let i = 1; i < entries.length; i++) {
      const [sel0, p0] = entries[0], [sel, p] = entries[i];
      for (const k of p0) if (!p.has(k)) fail(5, `themes.css "${sel}" missing ${k} (defined by "${sel0}" — themes must be complete)`);
      for (const k of p) if (!p0.has(k)) fail(5, `themes.css "${sel0}" missing ${k} (defined by "${sel}" — themes must be complete)`);
    }
  }
  const ALLOWED_MQ = new Set([
    "(max-width: 479px)", "(max-width: 639px)", "(max-width: 767px)", "(max-width: 1023px)",
    "(max-width: 1279px)", "(max-width: 1280px)", "(min-width: 640px)", "(min-width: 768px)",
    "(min-width: 1024px)", "(min-width: 1280px)", "(prefers-reduced-motion: reduce)",
    "(prefers-reduced-motion: no-preference)", "(max-height: 700px)",
    // capability query, not a breakpoint: makes hover-only affordances (card
    // "Read" links) permanently visible on touch devices
    "(hover: none)",
    // capability query, not a breakpoint: the BUTTON GLYPH ENGINE's masks are
    // painted backgrounds, and forced-colors strips backgrounds — this repaints
    // every glyph with ButtonText so the icons survive high-contrast mode.
    "(forced-colors: active)",
  ]);
  for (const m of css.matchAll(/@media([^{]+)\{/g)) {
    // a media LIST is legitimate CSS — "(hover: none), (max-width: 767px)" means
    // either condition, so check every comma-separated query, not the raw string
    const parts = m[1].split(",").flatMap((q) => q.split(/\s+and\s+/)).map((s) => s.trim()).filter(Boolean);
    for (const p of parts)
      if (!ALLOWED_MQ.has(p)) fail(5, `non-canonical media query: @media ${m[1].trim().slice(0, 60)}`);
  }
  // a comment that SWALLOWS rules (lost closer upstream) silently disables
  // whole selector groups — this shipped once via a script-mangled closer
  for (const m of css.matchAll(/\/\*[\s\S]*?\*\//g))
    if (/\n\s*\.[a-z][^\n]*\{/.test(m[0]) && m[0].length < 2000)
      fail(5, `ds.css:${css.slice(0, m.index).split("\n").length} comment contains live-looking CSS rules — lost '*/' upstream?`);
  const hasCount = (css.match(/:has\(/g) || []).length;
  if (hasCount > 1) fail(5, `:has() budget exceeded: ${hasCount} uses (max 1)`);
}

// ── flow 6: page-builder prompts ───────────────────────────────────────────
for (const wf of ["page-research-blueprint.js", "page-build-review.js", "page-compose-strict.js"]) {
  const p = `.claude/workflows/${wf}`;
  if (!existsSync(path.join(ROOT, p))) { warn(6, `${p} missing`); continue; }
  try { execFileSync("node", ["--check", path.join(ROOT, p)], { stdio: "pipe" }); }
  catch { fail(6, `${p} fails node --check`); }
}
{
  const bp = read(".claude/workflows/page-research-blueprint.js");
  if (!/SURFACE RULE/.test(bp)) fail(6, "blueprint prompt lost the SURFACE RULE (no un-requested dark)");
  if (!/MUST exist in blocks/.test(bp)) fail(6, "blueprint prompt lost the blocks-must-exist rule");
}

// ── flow 8: THE COLOUR LAW ─────────────────────────────────────────────────
// "Surfaces, inks and overlays are declared in MARKUP. CSS never adapts
//  content by context. A different look on a different ground is a DIFFERENT
//  MARKUP COMPOSITION."  (Hakan, 2026-09-03)
//
// This flow exists because prose alone demonstrably drifts: the same
// composition-vs-context lesson had to be taught twice (git b7f87aa2, "revert
// my invented CSS axes — library markup + Ram content is the rule"). A
// context rule is a GATE FAILURE, not a technique. The vocabulary and the
// pairing rulebook are NOT restated here — they are imported from
// assets/js/ds-palette.js, the one file the gallery reads too.
{
  const cssCode = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const lineOf = (idx) => cssCode.slice(0, idx).split("\n").length;

  // ── 8a · ANTI-CONTEXT LINT ───────────────────────────────────────────────
  // A ground may paint ITSELF and set its own default ink. It may NEVER reach
  // down a combinator to repaint content. Geometry under a surface (layout,
  // spacing, borders-as-shape) is not colour and is left alone.
  // The custom-property arm matters as much as the real properties: a context
  // rule that sets `--dt-bg` repaints its component exactly as `background:`
  // would, one indirection later. That hole let ds.css's `.surface-primary
  // .cmp-ticker { --dt-bg: … }` through the lint for the whole migration
  // (estate audit 2026-09-03, C-4), so the arm now names every custom property
  // whose stem reads as PAINT — ink/surface/colour/fill/accent/bg/background/
  // border/wash/scrim/tint/shadow/ov — not a hand-kept list of five.
  const COLOUR_PROP = /(?:^|[;{])\s*(?:-webkit-text-fill-color|color|background|background-color|background-image|fill|stroke|border(?:-top|-bottom|-left|-right|-inline|-block)?-color|outline-color|caret-color|accent-color|--[\w-]*(?:ink|surface|colou?r|fill|accent|bg|background|border|wash|scrim|tint|shadow|ov)[\w-]*)\s*:/;
  const SURFACE_TOKEN = /\.surface-[a-z0-9-]+|\.on-light\b/;
  for (const r of cssRules(cssCode)) {
    if (!SURFACE_TOKEN.test(r.sel)) continue;
    if (!COLOUR_PROP.test(r.body)) continue;
    const contextual = r.sel.split(",").some((one) => {
      const m = /\.surface-[a-z0-9-]+|\.on-light\b/.exec(one);
      if (!m) return false;
      // anything after the ground token that crosses a combinator = context
      return /[\s>+~]\S/.test(one.slice(m.index + m[0].length));
    });
    if (contextual)
      fail(8, `ds.css:${lineOf(r.start)} CONTEXT RULE — "${r.sel.trim().slice(0, 88)}" repaints content from its ground. CSS never adapts content by context: put the ink in the markup as a different composition (CONVENTIONS.md § The law).`);
  }

  // ── 8b · NO NEW INDIRECTION ──────────────────────────────────────────────
  // Ink classes consume BRAND tokens only — one level of indirection, so a
  // second brand re-paints the system by overriding brand tokens alone. A
  // relative-ink layer (--on-surface*, the --ink-wNN ramp, --ink-media*) is
  // exactly the machinery the law abolished: it can only exist to let CSS
  // resolve colour by context.
  const SANCTIONED_PROPS = new Set(["--ink", "--ink-soft"]); // brand neutrals, not a resolution layer
  for (const m of cssCode.matchAll(/(^|[;{\s])(--(?:on|ink)-[a-z0-9-]+)\s*:/g)) {
    const name = m[2];
    if (SANCTIONED_PROPS.has(name)) continue;
    fail(8, `ds.css:${lineOf(m.index)} defines ${name} — a relative-ink indirection layer. Inks are declared in markup and consume BRAND tokens directly (--navy/--blue/greys); there is no second token layer.`);
  }

  // ── 8c · CLOSED VOCABULARY ───────────────────────────────────────────────
  // surface-* / ink-* / ov-* are RESERVED prefixes. A name outside the
  // enumerated palette / mode / strength / paint sets is a failure wherever it
  // appears — ds.css, blocks, or the gallery — so nobody invents an axis.
  const vocabHit = (where, cls, ctx) => {
    if (!PAL.isReservedName(cls) || PAL.inVocabulary(cls)) return;
    if (PAL.DEPRECATED[cls]) return; // handled as a deprecation, not an invention
    fail(8, `${where}: "${cls}" is not in the colour vocabulary${ctx ? ` (${ctx})` : ""} — surface-*/ink-*/ov-* is a CLOSED set (assets/js/ds-palette.js). Adding a word is a system decision, not a local one.`);
  };
  for (const r of cssRules(cssCode))
    for (const m of r.sel.matchAll(/\.((?:surface|ink|ov)-[a-z0-9-]+)/g)) vocabHit(`ds.css:${lineOf(r.start)}`, m[1]);
  for (const f of blockFiles)
    for (const m of read(`blocks/${f}`).matchAll(/class\s*=\s*"([^"]*)"/g))
      for (const c of m[1].split(/\s+/)) vocabHit(`blocks/${f}`, c);
  // …and over FIRST-PARTY PAGES. CONVENTIONS says the closed vocabulary binds
  // "any surface-*/ink-*/ov-* class, ANYWHERE"; until 2026-09-03 this check ran
  // over ds.css, blocks and the gallery but not pages, so `ov-65` — a strength
  // ds.css never defines, silently falling back to the base --ov-a — lived on
  // 9 pages through the whole migration (estate audit, C-3). A page invents an
  // axis exactly as easily as a block does.
  for (const p of firstParty)
    for (const m of read(p).matchAll(/class\s*=\s*"([^"]*)"/g))
      for (const c of m[1].split(/\s+/)) vocabHit(p, c);
  // The gallery names classes inside quoted strings; its prose (whenToUse
  // copy) is quoted too, so only strings that are ENTIRELY class-like count.
  for (const g of ["assets/js/library.js", "frame.html"])
    for (const m of read(g).matchAll(/['"]([^'"\n]{1,80})['"]/g)) {
      const toks = m[1].trim().split(/\s+/);
      if (!toks.length || !toks.every((t) => /^[a-z][a-z0-9-]*$/.test(t))) continue;
      for (const c of toks) vocabHit(g, c, "gallery class list");
    }

  // ── the media-role exception, shared by 8d (blocks) and 8f (pages) ───────
  // THE RULING (Hakan, 2026-09-04, verbatim): "any eyebrow on media, any
  // text-only link on media is white." This check ENFORCES it rather than
  // merely permitting it: ink-white on media was already legal under
  // ALLOWED_INKS (it is the primary ink of the dark family), so acceptance
  // needed nothing — what was missing was the FAIL on the accent family,
  // which is precisely what an author reaches for out of habit because it is
  // the correct eyebrow ink on every OTHER ground. An un-inked eyebrow or
  // text-link on media fails the same way, because .ds-eyebrow and .btn-text
  // both default to var(--blue) and would paint accent by omission.
  // The rule itself is NOT restated here — PAL.inkForAtom is the one table.
  const mediaRoleCheck = (node, src, inks, once) => {
    const atom = PAL.atomRoleOf(node.classes);
    if (!atom) return;
    const ground = resolveGround(node);
    if (!PAL.isMediaGround(ground)) return;
    const want = PAL.inkForAtom(ground, overlayColourFor(node, src), atom);
    if (inks.includes(want)) return;
    once(`<${node.tag} class="${node.classes.join(" ")}"> is a ${atom} on a MEDIA ground carrying ${inks.length ? inks.join(" + ") : "NO ink"} — "any eyebrow on media, any text-only link on media is white" (Hakan, 2026-09-04): declare ${want}`);
  };

  // ── 8d · BLOCK PAIRING CONFORMANCE ───────────────────────────────────────
  // Blocks are the library's OWN compositions — preselected markup that guides
  // the author. They must be provably legal before any page is audited against
  // them. For every text element: resolve its ground from the markup alone
  // (nearest surface-* ancestor; surface-image resolves through its overlay's
  // COLOUR), then check its ink against the categorical pairing table.
  for (const f of blockFiles) {
    const src = read(`blocks/${f}`);
    const seen = new Set();
    const once = (msg) => { if (seen.has(msg)) return; seen.add(msg); fail(8, `blocks/${f}: ${msg}`); };
    walkMarkup(src, (node) => {
      const legacy = node.classes.filter((c) => PAL.DEPRECATED[c]);
      for (const c of legacy)
        once(`<${node.tag}> carries "${c}" — the library speaks the palette: use ${PAL.DEPRECATED[c]}`);
      const inks = node.classes.filter((c) => PAL.isInk(c));
      // `ds-eyebrow` is a DS text atom exactly as much as `type-eyebrow` is,
      // but it is not on the type SCALE, so until 2026-09-04 an un-inked
      // eyebrow slipped past this check — 123 of them across blocks/, every
      // one of them relying on .ds-eyebrow's own `color: var(--blue)` default
      // instead of declaring. The law says every text element declares its ink.
      const isAtom = node.classes.some((c) => TYPE_SCALE.test(c)) || node.classes.includes("ds-eyebrow");
      if (!inks.length && !legacy.length && isAtom && !exemptChrome(node))
        once(`<${node.tag} class="${node.classes.join(" ")}"> is a type atom with NO ink class — every text element declares its ink`);
      mediaRoleCheck(node, src, inks, once);
      if (!inks.length) return;
      const kind = PAL.kindOf(resolveGround(node), overlayColourFor(node, src));
      const allowed = PAL.ALLOWED_INKS[kind] || PAL.ALLOWED_INKS.light;
      for (const ink of inks)
        if (!allowed.includes(ink))
          once(`<${node.tag}> pairs "${ink}" with a ${kind} ground — illegal. On a ${kind} ground the rulebook allows: ${allowed.join(", ")}`);
    });
  }

  // ── 8e · DEPRECATED SPELLINGS IN FIRST-PARTY MARKUP (warn) ───────────────
  // Pages migrate in the estate audit (docs/audits/page-fix-map.md), not here.
  for (const p of firstParty) {
    const src = read(p);
    const counts = new Map();
    for (const m of src.matchAll(/class\s*=\s*"([^"]*)"/g))
      for (const c of m[1].split(/\s+/)) if (PAL.DEPRECATED[c]) counts.set(c, (counts.get(c) || 0) + 1);
    if (counts.size) {
      const list = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([c, n]) => `${n}× ${c}→${PAL.DEPRECATED[c]}`).join(", ");
      warn(8, `${p}: deprecated colour spelling(s) — ${list}${counts.size > 6 ? ` (+${counts.size - 6} more)` : ""}`);
    }
  }

  // ── 8f · THE MEDIA-ROLE EXCEPTION ON PAGES ───────────────────────────────
  // Blocks are the library's own compositions and get the FULL pairing check
  // (8d); pages are authored content and historically only got the deprecation
  // WARN. This one rule crosses over, and FAILS rather than warns, because it
  // is a legibility rule with a single legal answer — accent ink over a photo
  // is the low-contrast defect the ruling exists to end, and it is exactly as
  // wrong on a page as it is in a block. It is cheap: the walk resolves the
  // ground from markup alone, and the A7 media declarations landed 2026-09-03
  // so a page's grounds are honest.
  for (const p of firstParty) {
    const src = read(p);
    const seen = new Set();
    const once = (msg) => { if (seen.has(msg)) return; seen.add(msg); fail(8, `${p}: ${msg}`); };
    walkMarkup(src, (node) => {
      mediaRoleCheck(node, src, node.classes.filter((c) => PAL.isInk(c)), once);
    });
  }
}

// ── flow 7: serve smoke ────────────────────────────────────────────────────
async function smoke() {
  const port = 8199;
  const srv = spawn("node", ["server.js"], { cwd: ROOT, env: { ...process.env, PORT: String(port), SITE_PASSWORD: "" }, stdio: "pipe" });
  try {
    await new Promise((r) => setTimeout(r, 900));
    for (const [page, marker] of [["index.html", "library"], ["all-components.html", "cmp-site-header"], ["payments.html", "cmp-hero"], ["ibv2/", "cmp-site-header"]]) {
      const res = await fetch(`http://127.0.0.1:${port}/${page}`);
      if (res.status !== 200) { fail(7, `serve smoke: ${page} → HTTP ${res.status}`); continue; }
      const body = await res.text();
      if (!body.toLowerCase().includes(marker)) fail(7, `serve smoke: ${page} body missing "${marker}"`);
    }
  } catch (e) { fail(7, `serve smoke: ${String(e).slice(0, 120)}`); }
  finally { srv.kill(); }
}
await smoke();

// ── verdict ────────────────────────────────────────────────────────────────
for (const w of warns) console.log(`  WARN ${w}`);
if (fails.length) {
  console.error(`\n✗ VERIFY FAILED — ${fails.length} failure(s), ${warns.length} warning(s)`);
  for (const f of fails) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log(`\n✓ verify passed — ${blockFiles.length} blocks, ${firstParty.length} first-party pages, ${warns.length} warning(s)`);
