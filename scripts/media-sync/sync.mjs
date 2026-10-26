// Media sync: keeps media-library.html and the "latest stories" rows on other
// pages in step with the live Media Center (emiratesnbd.com/en/media-center).
//
//   node scripts/media-sync/sync.mjs plan    fetch both feeds, find stories the library
//                                            does not have yet, download their photos,
//                                            write the plan (and list stories with no photo)
//   node scripts/media-sync/sync.mjs apply   write the plan into the pages, refresh the
//                                            date filters, add the Arabic strings
//
// Stories whose tile is the Media Center's generic placeholder need a generated
// image saved at staging/media-library/gen-<slug>.jpg before `apply` (the daily
// task creates them). After `apply`, rebuild the Arabic pages:
//   python3 i18n/tools/build_ar.py && git checkout i18n/tools/report.json
//
// What the pages show (Ram, 2026-10-22):
//   media-library.html                 featured = newest story, grid = every other story since 2022
//   cib-home-final.html                the three newest stories
//   trade-supply-chain-finance-v1a.html the three newest stories
//   lending-v1a.html                   the three newest lending and financing stories
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = join(tmpdir(), 'enbd-media-sync');
const PLAN = join(CACHE, 'plan.json');
const SITE = 'https://www.emiratesnbd.com';
const MODE = process.argv[2];
const TODAY = new Date(); TODAY.setHours(12, 0, 0, 0);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const TOPIC_LABEL = { news: 'News', results: 'Results', awards: 'Awards', partnerships: 'Partnerships' };
const read = f => readFileSync(join(ROOT, f), 'utf8');
const write = (f, s) => writeFileSync(join(ROOT, f), s);
const esc = s => String(s).replace(/&(?!(#\d+|#x[0-9a-f]+|[a-z]+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const slugOf = u => u.split('/').filter(Boolean).pop();
const parseDate = s => { const m = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(s); if (!m) return null; const mi = MONTHS.findIndex(x => x.toLowerCase().startsWith(m[2].toLowerCase().slice(0, 3))); return mi < 0 ? null : new Date(+m[3], mi, +m[1], 12); };
const longDate = d => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const shortDate = d => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
const arDate = d => `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const arMinutes = n => n === 1 ? 'دقيقة واحدة' : n === 2 ? 'دقيقتين' : n <= 10 ? `${n} دقائق` : `${n} دقيقة`;
const buckets = d => { const days = (TODAY - d) / 864e5; return [days <= 31 && 'month', days <= 92 && 'quarter', days <= 366 && 'year'].filter(Boolean).join(' '); };
function topicOf(title) {
  const t = title.toLowerCase();
  if (/\bresults?\b|profit|\bq[1-4]\b|\bh1\b|\bfy\b|financial performance|net income|earnings/.test(t)) return 'results';
  if (/award|recogni[sz]ed|\bnamed\b|\bwins?\b|\bbest\b|ranked|honou?red|accolade/.test(t)) return 'awards';
  if (/partner|collaborat|alliance|\bmou\b|memorandum|agreement|teams up|joins forces|signs/.test(t)) return 'partnerships';
  return 'news';
}
// lending row: corporate lending and financing deals, not awards or retail home finance
const isLending = t => /\bfinances\b|\bfinanced\b|facility|\bloans?\b|lending|syndicat|sukuk|\bbonds?\b|working capital|transition finance|project finance|sustainable finance|green finance/i.test(t)
  && !/award|honou?rs?|recogni|home financ|mortgage|personal loan|\bcards?\b/i.test(t);

// ── plan ────────────────────────────────────────────────────────────────────
async function plan() {
  mkdirSync(CACHE, { recursive: true });
  for (const lang of ['en', 'ar']) execFileSync('node', [join(ROOT, 'scripts/media-sync/grab.mjs'), CACHE, lang], { stdio: 'inherit' });
  const en = JSON.parse(readFileSync(join(CACHE, 'media-en.json'), 'utf8')).Medias;
  const ar = new Map(JSON.parse(readFileSync(join(CACHE, 'media-ar.json'), 'utf8')).Medias.map(x => [slugOf(x.MediaUrl), x]));
  const lib = read('media-library.html');
  const have = new Set([...lib.matchAll(/emiratesnbd\.com\/en\/media-center\/([a-z0-9-]+)/g)].map(m => m[1]));
  const fresh = en.filter(x => x.PublishYear >= 2022 && !have.has(slugOf(x.MediaUrl)));
  const UA = { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' };
  const meta = async (url, name) => { try { const h = await (await fetch(url, { headers: UA })).text();
    const m = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i').exec(h) || new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i').exec(h);
    return m ? m[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim() : ''; } catch (e) { return ''; } };
  // lead = first paragraph of the article (the meta description only repeats the headline)
  const ent = t => t.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&rsquo;|&#8217;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&([a-z])(uml|acute|grave|circ|tilde|cedil);/gi, (m, l, k) => (l + { uml: '\u0308', acute: '\u0301', grave: '\u0300', circ: '\u0302', tilde: '\u0303', cedil: '\u0327' }[k]).normalize('NFC'))
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();
  const firstPara = async url => { try { const h = await (await fetch(url, { headers: UA })).text(); const i = h.indexOf('news-detail__content'); if (i < 0) return '';
    for (const m of h.slice(i, i + 40000).matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) { let t = ent(m[1]); if (t.length < 60) continue;
      const c = t.indexOf(': '); if (c > 0 && c < 70) t = t.slice(c + 2); return t.charAt(0).toUpperCase() + t.slice(1); } } catch (e) {} return ''; };
  const trim = s => { if (!s || s.length <= 220) return s; const cut = s.slice(0, 220); const i = cut.lastIndexOf('. '); return i > 80 ? cut.slice(0, i + 1) : cut.replace(/\s+\S*$/, '') + '…'; };
  const items = [];
  for (const x of fresh) {
    const slug = slugOf(x.MediaUrl), d = new Date(+/\d+/.exec(x.PublishDate)[0]); d.setHours(12);
    const a = ar.get(slug);
    const lead = trim(x.Description || await firstPara(SITE + x.MediaUrl));
    const leadAr = a ? trim(a.Description || await firstPara(SITE + a.MediaUrl)) : '';
    // the Media Center's logo placeholders are not photos: those stories get a generated image.
    // Real photos, even shared ones (the HQ tower, the Emirates Islamic building), are used as they are.
    const generic = !x.TileImage || /media_center_img|MediaNews_675\./i.test(x.TileImage);
    const tileUrl = /^https?:/.test(x.TileImage || '') ? x.TileImage : SITE + x.TileImage;
    let image = null;
    if (!generic) {
      const rel = `staging/media-library/live/${slug}.jpg`;
      if (!existsSync(join(ROOT, rel))) { const r = await fetch(tileUrl, { headers: UA }); if (r.ok) { mkdirSync(join(ROOT, 'staging/media-library/live'), { recursive: true }); writeFileSync(join(ROOT, rel), Buffer.from(await r.arrayBuffer())); } }
      if (existsSync(join(ROOT, rel))) image = rel;
    }
    items.push({ slug, url: x.MediaUrl, date: d.toISOString(), title: x.Title.trim(), titleAr: a ? a.Title.trim() : '', lead, leadAr, read: +x.ReadDuration || 2, topic: topicOf(x.Title),
      image, needsImage: !image, genImage: `staging/media-library/gen-${slug}.jpg` });
  }
  items.sort((p, q) => new Date(q.date) - new Date(p.date));
  writeFileSync(PLAN, JSON.stringify({ made: new Date().toISOString(), items }, null, 1));
  console.log(`new stories: ${items.length}`);
  items.forEach(i => console.log(`  ${longDate(new Date(i.date))} | ${i.topic} | ${i.needsImage ? 'NEEDS IMAGE -> ' + i.genImage : 'photo ' + i.image} | ${i.title}`));
  console.log('plan: ' + PLAN);
}

// ── apply ───────────────────────────────────────────────────────────────────
const CARD_RE = /\n[ \t]*<a href="https:\/\/www\.emiratesnbd\.com\/en\/media-center\/[^"]+"[^>]*data-filter-item[\s\S]*?\n[ \t]*<\/a>/g;
function libCard(it, idx) {
  const d = new Date(it.date);
  return `\n      <a href="${SITE}${it.url}" target="_blank" rel="noopener" class="cd-card card-panel" style="--card-pad:0" role="listitem" data-reveal="up" data-reveal-delay="${['.04', '.10', '.16'][idx % 3]}" data-filter-item data-filter-topic="${it.topic}" data-filter-date="${buckets(d)}" data-filter-year="${d.getFullYear()}">
        <span class="relative block aspect-[3/2]">
          <span class="media-cover" data-bg="${it.image}" aria-hidden="true"></span>
          <span class="chip rounded-full absolute bottom-3 start-4 z-10">${TOPIC_LABEL[it.topic]}</span>
        </span>
        <div class="p-6 flex flex-col items-start gap-2.5">
          <h3 class="type-h5 ink-primary">${esc(it.title)}</h3>
          <p class="type-body-sm ink-mute">${longDate(d)} &middot; ${it.read} min read</p>
          <span class="btn btn-text mt-1 is-arrow">Read more
           </span>
        </div>
      </a>`;
}
function cardData(block) {   // read a library card back into a story record
  const g = re => (re.exec(block) || [])[1] || '';
  return { url: g(/href="https:\/\/www\.emiratesnbd\.com(\/en\/media-center\/[^"]+)"/), topic: g(/data-filter-topic="([^"]*)"/) || 'news', image: g(/data-bg="([^"]+)"/),
    title: g(/<h3[^>]*>([\s\S]*?)<\/h3>/).trim(), date: parseDate(g(/ink-mute">([^<]*)/)), read: +g(/(\d+)\s*min read/) || 2, block };
}
function apply() {
  const P = existsSync(PLAN) ? JSON.parse(readFileSync(PLAN, 'utf8')) : { items: [] };
  const items = P.items.map(i => ({ ...i, date: new Date(i.date) }));
  for (const i of items) if (i.needsImage) { if (existsSync(join(ROOT, i.genImage))) i.image = i.genImage; else throw new Error('missing generated image: ' + i.genImage); }
  let lib = read('media-library.html');
  // featured block -> story record
  const fs0 = lib.indexOf('<div class="fsp-row">'), fs1 = lib.indexOf('<!-- ═══ /2. FEATURED');
  const fBlock = lib.slice(fs0, fs1);
  const fg = re => (re.exec(fBlock) || [])[1] || '';
  const featured = { url: fg(/href="https:\/\/www\.emiratesnbd\.com(\/en\/media-center\/[^"]+)"/), image: fg(/data-bg="([^"]+)"/), topic: (fg(/<span class="chip[^>]*>([^<]*)<\/span>/) || 'News').toLowerCase(),
    title: fg(/fsp-title">([\s\S]*?)<\/h3>/).trim().replace(/\.$/, ''), date: parseDate(fg(/<p class="meta-dot[^>]*><span>([^<]*)/)), read: +fg(/<span>(\d+) min read/) || 2, lead: fg(/fsp-lead">([\s\S]*?)<\/p>/).trim() };
  // grid cards
  const cards = [...lib.matchAll(CARD_RE)].map(m => cardData(m[0]));
  const start = lib.search(CARD_RE); const all = [...lib.matchAll(CARD_RE)]; const last = all[all.length - 1]; const end = last.index + last[0].length;
  const pool = [...items.map(i => ({ ...i, fresh: true })), { ...featured, fromFeatured: true }, ...cards].filter((s, i, arr) => arr.findIndex(t => t.url === s.url) === i);
  pool.sort((p, q) => q.date - p.date);
  const top = pool[0], rest = pool.slice(1);
  // featured
  if (top.url !== featured.url) {
    const leadEsc = esc(top.lead || '');
    let fb = fBlock
      .replace(/data-bg="[^"]+"/, `data-bg="${top.image}"`).replace(/aria-label="[^"]*"/, `aria-label="${attr(top.title)}"`)
      .replace(/(<span class="chip[^>]*>)[^<]*(<\/span>)/, `$1${TOPIC_LABEL[top.topic] || 'News'}$2`)
      .replace(/(fsp-title">)[\s\S]*?(<\/h3>)/, `$1${esc(top.title)}$2`)
      .replace(/(fsp-lead">)[\s\S]*?(<\/p>)/, `$1${leadEsc}$2`)
      .replace(/(<p class="meta-dot[^>]*>)[\s\S]*?(<\/p>)/, `$1<span>${longDate(top.date)}</span><span>${top.read} min read</span>$2`)
      .replace(/href="https:\/\/www\.emiratesnbd\.com\/en\/media-center\/[^"]+"/, `href="${SITE}${top.url}"`);
    lib = lib.slice(0, fs0) + fb + lib.slice(fs1);
  }
  // grid: every other story, newest first; existing cards keep their markup, only the date filters, year and stagger are refreshed
  const s2 = lib.search(CARD_RE), all2 = [...lib.matchAll(CARD_RE)], last2 = all2[all2.length - 1], e2 = last2.index + last2[0].length;
  const grid = rest.map((s, i) => {
    if (s.block) return s.block.replace(/data-filter-date="[^"]*"/, `data-filter-date="${buckets(s.date)}"`).replace(/data-filter-year="[^"]*"/, `data-filter-year="${s.date.getFullYear()}"`).replace(/data-reveal-delay="[^"]*"/, `data-reveal-delay="${['.04', '.10', '.16'][i % 3]}"`);
    return libCard({ ...s, date: s.date.toISOString() }, i);
  }).join('\n');
  lib = lib.slice(0, s2) + grid + lib.slice(e2);
  lib = lib.replace(/(<span data-filter-total>)\d+(<\/span>)/, `$1${rest.length}$2`);
  const stamp = shortDate(TODAY);
  lib = lib.replace(/Content refreshed [^(]*\(newest story\)/, `Content refreshed ${stamp} from emiratesnbd.com/en/media-center (newest story)`)
           .replace(/Content refreshed \d+ \w+ from emiratesnbd\.com\/en\/media-center \(all \d+ further stories/, `Content refreshed ${stamp} from emiratesnbd.com/en/media-center (all ${rest.length} further stories`);
  write('media-library.html', lib);

  // home: three newest
  const three = pool.slice(0, 3);
  let home = read('cib-home-final.html');
  const homeCard = s => `      <article class="art-c">
        <a class="art-c-link surface-white" href="${SITE}${s.url}" target="_blank" rel="noopener">
          <span class="art-c-media" data-bg="${s.image}" aria-hidden="true"><span class="art-c-tag">${TOPIC_LABEL[s.topic] || 'News'}</span></span>
          <span class="art-c-body">
            <h3 class="art-c-title">${s.block || s.fromFeatured ? s.title : esc(s.title)}</h3>
            <span class="art-c-foot"><span class="art-c-who"><span class="art-c-by">Emirates NBD Media Center</span><span class="art-c-date">${shortDate(s.date)}</span></span></span>
            <span class="art-c-read">Read more <span aria-hidden="true">&rarr;</span></span>
          </span>
        </a>
      </article>`;
  home = home.replace(/(<div class="ac-grid">\n)[\s\S]*?(\n    <\/div>\n  <\/div>\n<\/section>)/, (m, a, b) => a + three.map(homeCard).join('\n') + b)
             .replace(/newest first \(refreshed [^;]*;/, `newest first (refreshed ${stamp};`);
  write('cib-home-final.html', home);

  // trade + lending rows (cd-card with an aria-label)
  const rowCard = (s, i) => `      <a href="${SITE}${s.url}" target="_blank" rel="noopener" class="cd-card card-panel surface-white" style="--card-pad:0" role="listitem" data-reveal="up" data-reveal-delay="${['.06', '.12', '.18'][i]}" aria-label="${attr((s.block || s.fromFeatured ? s.title.replace(/&amp;/g, '&') : s.title))}">
        <span class="relative block aspect-[3/2]">
          <span class="media-cover" data-bg="${s.image}" aria-hidden="true"></span>
          <span class="chip rounded-full absolute bottom-3 start-4 z-10">${TOPIC_LABEL[s.topic] || 'News'}</span>
        </span>
        <div class="p-6 flex flex-col items-start gap-2.5">
          <h3 class="type-h5 ink-primary">${s.block || s.fromFeatured ? s.title : esc(s.title)}</h3>
          <p class="type-body-sm ink-mute">${longDate(s.date)} &middot; ${s.read} min read</p>
          <span class="btn btn-text mt-1 is-arrow">Read more
           </span>
        </div>
      </a>`;
  const row = (file, marker, list) => {
    let h = read(file); const i = h.indexOf(marker); if (i < 0) throw new Error('marker not found in ' + file);
    const g0 = h.indexOf('<div class="cd-grid" role="list">', i), g1 = h.indexOf('\n    </div>', g0);
    h = h.slice(0, g0) + '<div class="cd-grid" role="list">\n\n' + list.map(rowCard).join('\n\n') + '\n' + h.slice(g1);
    h = h.replace(/(newest first \(refreshed )[^;]*;/, `$1${stamp};`);
    write(file, h);
  };
  row('trade-supply-chain-finance-v1a.html', 'The three newest Media Center stories', three);
  row('lending-v1a.html', 'The three most recent lending and financing stories', pool.filter(s => isLending(s.title)).slice(0, 3));

  // Arabic strings for the new stories (build_ar.py translates the -ar pages from this table)
  const arPath = join(ROOT, 'i18n/tools/ar.json'); const T = JSON.parse(readFileSync(arPath, 'utf8')); let added = 0;
  // only ever ADD strings: an existing translation is never changed (a short key such as "Emirates NBD" is shared site-wide)
  const ADDED = new Set(); const put = (k, v) => { if (k && v && k.length > 3 && !(k in T)) { T[k] = v; ADDED.add(k); added++; } };
  for (const s of pool.slice(0, 1).concat(items)) {
    const it = items.find(x => x.url === s.url) || {};
    const d = s.date;
    if (it.titleAr) put(s.title, it.titleAr);
    if (it.leadAr && it.lead && it.lead.length >= 40 && it.lead !== it.title) put(it.lead, it.leadAr);
    put(`${longDate(d)} · ${s.read} min read`, `${arDate(d)} · قراءة في ${arMinutes(s.read)}`);
    put(longDate(d), arDate(d)); put(shortDate(d), arDate(d)); put(`${s.read} min read`, `قراءة في ${arMinutes(s.read)}`);
    put(`<1>${longDate(d)}</1><3>${s.read} min read</3>`, `<1>${arDate(d)}</1><3>قراءة في ${arMinutes(s.read)}</3>`);   // the featured story's meta line (two spans)
  }
  // merged through Python so ar.json keeps its exact one-line json.dumps(ensure_ascii=False) form
  const addPath = join(CACHE, 'ar-add.json'); writeFileSync(addPath, JSON.stringify(Object.fromEntries(Object.entries(T).filter(([k]) => ADDED.has(k)))));
  execFileSync('python3', ['-c', 'import json,sys; p,a=sys.argv[1],sys.argv[2]; d=json.load(open(p,encoding="utf-8")); d.update(json.load(open(a,encoding="utf-8"))); open(p,"w",encoding="utf-8").write(json.dumps(d,ensure_ascii=False))', arPath, addPath]);
  const noAr = items.filter(i => !i.titleAr).map(i => i.title);
  console.log(`applied: ${items.length} new; featured: ${top.title}; library ${rest.length} + featured; Arabic strings added ${added}` + (noAr.length ? `; no Arabic title for: ${noAr.join(' | ')}` : ''));
  console.log('home + trade: ' + three.map(s => shortDate(s.date)).join(', ') + '; lending: ' + pool.filter(s => isLending(s.title)).slice(0, 3).map(s => shortDate(s.date)).join(', '));
}

if (MODE === 'plan') await plan();
else if (MODE === 'apply') apply();
else console.log('usage: node scripts/media-sync/sync.mjs plan|apply');
