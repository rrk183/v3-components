#!/usr/bin/env node
// Minified builds of the runtime.
//
//   npm run minify            → style.min.css + ds.min.js (both committed) + JS handoff in dist/
//   node scripts/minify.mjs --css            style.min.css only
//   node scripts/minify.mjs --js             ds.min.js only
//   node scripts/minify.mjs --css --staged   …built from the STAGED source (pre-commit hook; same for --js)
//   node scripts/minify.mjs --check          exit 1 if style.min.css or ds.min.js is stale (verify gate)
//
// CSS: style.css → style.min.css, side by side in assets/webxv2/css/ and COMMITTED —
// the CMS keeps the same pair (style.css for dev, style.min.css for prod). The
// .githooks/pre-commit hook regenerates it whenever style.css is committed.
// Whitespace/comment-only (no rule merging — the cascade stays equivalent).
//
// ds.js → ds.min.js, side by side in assets/webxv2/js/ and COMMITTED, the same
// way (the CMS serves the .min when .NET bundling is on). The pre-commit hook
// regenerates it whenever ds.js is committed. Pages keep loading ds.js.
//
// JS: minified copies for the CMS handoff in dist/ (gitignored, rebuilt from
// scratch). Folder layout mirrors assets/webxv2/js/ on purpose: ds.js lazy-loads
// lenis.min.js / lottie_light.min.js from ITS OWN folder, so those vendor
// files ship alongside it.
//
// All output is pure ASCII (non-Latin text becomes \uXXXX escapes), so it
// renders correctly whatever charset the CMS serves it with.
import { transform } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, statSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const kb = (n) => (n / 1024).toFixed(1).padStart(7) + " KB";

const CSS_SRC = "assets/webxv2/css/style.css";
const CSS_OUT = "assets/webxv2/css/style.min.css";
const CSS_BANNER = "/* style.min.css - generated from style.css by `npm run minify` (pre-commit hook); edit style.css, not this file. */\n";

const DS_SRC = "assets/webxv2/js/ds.js";
const DS_OUT = "assets/webxv2/js/ds.min.js";

async function minCss(src) {
  const { code } = await transform(src, { loader: "css", minifyWhitespace: true, legalComments: "inline" });
  return CSS_BANNER + code;
}
async function minJs(src, rel) {
  const { code } = await transform(src, { loader: "js", minify: true, target: "es2017", legalComments: "inline" });
  return `/* ${path.basename(rel).replace(/\.js$/, ".min.js")} - generated from ${rel} by \`npm run minify\`; edit the source, not this file. */\n` + code;
}
const PAIRS = [[CSS_SRC, CSS_OUT, minCss], [DS_SRC, DS_OUT, (s) => minJs(s, DS_SRC)]];
const read = (rel) => args.has("--staged")
  ? execFileSync("git", ["show", `:${rel}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 })
  : readFileSync(path.join(ROOT, rel), "utf8");

// ── committed pairs: style.css → style.min.css, ds.js → ds.min.js ──────────
if (args.has("--check")) {
  let stale = 0;
  for (const [srcRel, outRel, fn] of PAIRS) {
    const want = await fn(readFileSync(path.join(ROOT, srcRel), "utf8"));
    const have = existsSync(path.join(ROOT, outRel)) ? readFileSync(path.join(ROOT, outRel), "utf8") : "";
    if (want !== have) { console.error(`${outRel} is stale — run: npm run minify`); stale++; }
    else console.log(`${outRel} is fresh`);
  }
  process.exit(stale ? 1 : 0);
}
const only = args.has("--css") ? CSS_OUT : args.has("--js") ? DS_OUT : null;
for (const [srcRel, outRel, fn] of PAIRS) {
  if (only && outRel !== only) continue;
  const src = read(srcRel), out = await fn(src);
  writeFileSync(path.join(ROOT, outRel), out);
  console.log(`${outRel.padEnd(36)} ${kb(Buffer.byteLength(src))} → ${kb(Buffer.byteLength(out))}`);
}
if (only) process.exit(0);

// ── JS handoff (dist/) ─────────────────────────────────────────────────────
const OUT = path.join(ROOT, "dist");
const MINIFY = [
  "assets/webxv2/js/ds.js",
  "assets/webxv2/js/ds-tailwind-config.js",
  "assets/webxv2/js/lang-switch.js",
  "assets/webxv2/js/cib-home-flow.js",      // Wholesale Banking home only
];
const COPY = [                       // already minified vendor files — shipped as-is
  "assets/webxv2/js/tailwind.cdn.js",
  "assets/webxv2/js/lenis.min.js",
  "assets/webxv2/js/lottie_light.min.js",
];
rmSync(OUT, { recursive: true, force: true });
for (const rel of MINIFY) {
  const js = readFileSync(path.join(ROOT, rel), "utf8");
  const out = rel.replace(/\.js$/, ".min.js"), min = await minJs(js, rel);
  mkdirSync(path.dirname(path.join(OUT, out)), { recursive: true });
  writeFileSync(path.join(OUT, out), min);
  console.log(`${out.padEnd(36)} ${kb(Buffer.byteLength(js))} → ${kb(Buffer.byteLength(min))}`);
}
for (const rel of COPY) {
  mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
  copyFileSync(path.join(ROOT, rel), path.join(OUT, rel));
  console.log(`${rel.padEnd(36)} ${kb(statSync(path.join(ROOT, rel)).size)}   (copied, already minified)`);
}
console.log(`\n→ ${CSS_OUT} + ${DS_OUT} + ${path.relative(ROOT, OUT)}/`);
