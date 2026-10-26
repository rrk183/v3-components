// Media sync, step 1: load the live Media Center (emiratesnbd.com/<lang>/media-center)
// in headless Chrome and save the story list the page itself requests
// (/enbdapi/v1/mediacenter/getmedia). A direct request is redirected to an
// error page, so the list is captured from a real page load.
// usage: node scripts/media-sync/grab.mjs <cache dir> <en|ar>
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2], LANG = process.argv[3] || 'en';
mkdirSync(OUT, { recursive: true });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=' + (LANG === 'ar' ? 9342 : 9341), '--user-data-dir=' + OUT + '/prof-' + LANG, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 60 && !t; i++) { try { t = (await (await fetch('http://127.0.0.1:' + (LANG === 'ar' ? 9342 : 9341) + '/json')).json()).find(x => x.type === 'page'); } catch (e) {} await sleep(200); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(); let reqId = null, done = null;
const got = new Promise(r => done = r);
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
  if (m.method === 'Network.responseReceived' && /mediacenter\/getmedia/i.test(m.params.response.url)) reqId = m.params.requestId;
  if (m.method === 'Network.loadingFinished' && m.params.requestId === reqId) done(reqId); };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Network.enable'); await send('Page.enable');
await send('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' });
await send('Page.navigate', { url: 'https://www.emiratesnbd.com/' + LANG + '/media-center' });
const rid = await Promise.race([got, sleep(45000).then(() => null)]);
if (!rid) { console.log('no getmedia response'); chrome.kill(); process.exit(1); }
const body = await send('Network.getResponseBody', { requestId: rid });
writeFileSync(OUT + '/media-' + LANG + '.json', body.base64Encoded ? Buffer.from(body.body, 'base64') : body.body);
console.log('saved', LANG); ws.close(); chrome.kill(); process.exit(0);
