#!/usr/bin/env node
// Minified builds of the runtime.
//
//   npm run minify            → assets/css/style.min.css (committed) + JS handoff in dist/
//   node scripts/minify.mjs --css            style.min.css only
//   node scripts/minify.mjs --css --staged   …built from the STAGED style.css (pre-commit hook)
//   node scripts/minify.mjs --check          exit 1 if style.min.css is stale (verify gate)
//
// CSS: style.css → style.min.css, side by side in assets/css/ and COMMITTED —
// the CMS keeps the same pair (style.css for dev, style.min.css for prod). The
// .githooks/pre-commit hook regenerates it whenever style.css is committed.
// Whitespace/comment-only (no rule merging — the cascade stays equivalent).
//
// JS: minified copies for the CMS handoff in dist/ (gitignored, rebuilt from
// scratch). Folder layout mirrors assets/js/ on purpose: ds.js lazy-loads
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

const CSS_SRC = "assets/css/style.css";
const CSS_OUT = "assets/css/style.min.css";
const CSS_BANNER = "/* style.min.css - generated from style.css by `npm run minify` (pre-commit hook); edit style.css, not this file. */\n";

async function minCss(src) {
  const { code } = await transform(src, { loader: "css", minifyWhitespace: true, legalComments: "inline" });
  return CSS_BANNER + code;
}

// ── CSS ────────────────────────────────────────────────────────────────────
if (args.has("--check")) {
  const want = await minCss(readFileSync(path.join(ROOT, CSS_SRC), "utf8"));
  const have = existsSync(path.join(ROOT, CSS_OUT)) ? readFileSync(path.join(ROOT, CSS_OUT), "utf8") : "";
  if (want !== have) { console.error(`${CSS_OUT} is stale — run: npm run minify`); process.exit(1); }
  console.log(`${CSS_OUT} is fresh`);
  process.exit(0);
}
const src = args.has("--staged")
  ? execFileSync("git", ["show", `:${CSS_SRC}`], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 })
  : readFileSync(path.join(ROOT, CSS_SRC), "utf8");
const css = await minCss(src);
writeFileSync(path.join(ROOT, CSS_OUT), css);
console.log(`${CSS_OUT.padEnd(36)} ${kb(Buffer.byteLength(src))} → ${kb(Buffer.byteLength(css))}`);
if (args.has("--css")) process.exit(0);

// ── JS handoff (dist/) ─────────────────────────────────────────────────────
const OUT = path.join(ROOT, "dist");
const MINIFY = [
  "assets/js/ds.js",
  "assets/js/ds-tailwind-config.js",
  "assets/js/lang-switch.js",
  "assets/js/cib-home-flow.js",      // Wholesale Banking home only
];
const COPY = [                       // already minified vendor files — shipped as-is
  "assets/js/tailwind.cdn.js",
  "assets/js/lenis.min.js",
  "assets/js/lottie_light.min.js",
];
rmSync(OUT, { recursive: true, force: true });
for (const rel of MINIFY) {
  const js = readFileSync(path.join(ROOT, rel), "utf8");
  const { code } = await transform(js, { loader: "js", minify: true, target: "es2017", legalComments: "inline" });
  const out = rel.replace(/\.js$/, ".min.js");
  const banner = `/* ${path.basename(out)} - generated from ${rel} by \`npm run minify\`; edit the source, not this file. */\n`;
  mkdirSync(path.dirname(path.join(OUT, out)), { recursive: true });
  writeFileSync(path.join(OUT, out), banner + code);
  console.log(`${out.padEnd(36)} ${kb(Buffer.byteLength(js))} → ${kb(Buffer.byteLength(banner + code))}`);
}
for (const rel of COPY) {
  mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
  copyFileSync(path.join(ROOT, rel), path.join(OUT, rel));
  console.log(`${rel.padEnd(36)} ${kb(statSync(path.join(ROOT, rel)).size)}   (copied, already minified)`);
}
console.log(`\n→ ${CSS_OUT} + ${path.relative(ROOT, OUT)}/`);
