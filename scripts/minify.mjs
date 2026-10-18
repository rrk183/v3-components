#!/usr/bin/env node
// CMS handoff build — minified copies of the runtime the site's pages load.
// Sources are never touched; output goes to dist/ (gitignored) and is rebuilt
// from scratch on every run, so a handoff can never be stale.
//
//   npm run minify        → dist/assets/css/*.min.css + dist/assets/js/*.min.js
//
// Folder layout mirrors assets/ on purpose: fonts.css reaches ../fonts/, and
// ds.js lazy-loads lenis.min.js / lottie_light.min.js from ITS OWN folder, so
// those two vendor files ship alongside it. CSS is whitespace/comment-only
// (no rule merging — the cascade stays byte-for-byte equivalent). Output is
// pure ASCII (non-Latin text becomes \uXXXX escapes), so it renders correctly
// whatever charset the CMS serves it with.
import { transform } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");

const MINIFY = [
  "assets/css/fonts.css",
  "assets/css/ds.css",
  "assets/css/rtl.css",              // Arabic pages only
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

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + " KB";
rmSync(OUT, { recursive: true, force: true });

for (const rel of MINIFY) {
  const src = readFileSync(path.join(ROOT, rel), "utf8");
  const css = rel.endsWith(".css");
  const { code } = await transform(src, css
    ? { loader: "css", minifyWhitespace: true, legalComments: "inline" }
    : { loader: "js", minify: true, target: "es2017", legalComments: "inline" });
  const out = rel.replace(/\.(css|js)$/, ".min.$1");
  const banner = `/* ${path.basename(out)} - generated from ${rel} by \`npm run minify\`; edit the source, not this file. */\n`;
  mkdirSync(path.dirname(path.join(OUT, out)), { recursive: true });
  writeFileSync(path.join(OUT, out), banner + code);
  console.log(`${out.padEnd(36)} ${kb(Buffer.byteLength(src))} → ${kb(Buffer.byteLength(banner + code))}`);
}
for (const rel of COPY) {
  mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
  copyFileSync(path.join(ROOT, rel), path.join(OUT, rel));
  console.log(`${rel.padEnd(36)} ${kb(statSync(path.join(ROOT, rel)).size)}   (copied, already minified)`);
}
console.log(`\n→ ${path.relative(ROOT, OUT)}/`);
