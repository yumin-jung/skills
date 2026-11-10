#!/usr/bin/env node
// Render a poster HTML file to PNG (and optionally PDF) with headless Chrome, and lint the layout.
// usage: node render.mjs <page.html> [--pdf] [--facts <fact-sheet.md>] [--scale 2]
// Writes <page>.png (and <page>.pdf) next to the HTML, plus lint.json. Needs Node 22+ and Chrome/Chromium/Edge.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, basename } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const html = args.find((a, i) => !a.startsWith('--') && !['--facts', '--scale'].includes(args[i - 1]));
if (!html) { console.error('usage: node render.mjs <page.html> [--pdf] [--facts <fact-sheet.md>] [--scale 2]'); process.exit(2); }
const scale = Number(opt('--scale', '2'));
const stem = resolve(html).replace(/\.html?$/, '');
const outPng = basename(stem) === 'index' ? join(dirname(stem), 'page.png') : `${stem}.png`;

function findChrome() {
  const paths = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of paths) if (p && existsSync(p)) return p;
  for (const n of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    try { return execFileSync('which', [n], { encoding: 'utf8' }).trim(); } catch {}
  }
  console.error('No Chrome/Chromium/Edge found. Set CHROME_PATH.'); process.exit(2);
}

// A free port from the OS: a guessed one can belong to another headless Chrome.
const port = await new Promise((r) => { const s = createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const profile = mkdtempSync(join(tmpdir(), 'to-poster-'));
const chrome = spawn(findChrome(), [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--no-default-browser-check', '--hide-scrollbars', '--force-color-profile=srgb', '--allow-file-access-from-files',
  '--window-size=2400,1800', 'about:blank',
], { stdio: 'ignore' });
const quit = (code) => { try { chrome.kill('SIGKILL'); } catch {} try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); };
setTimeout(() => { console.error('TIMEOUT after 120 s'); quit(3); }, 120000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets;
for (let i = 0; i < 80 && !targets; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); } catch { await sleep(250); }
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 2400, height: 1800, deviceScaleFactor: scale, mobile: false });
await send('Page.navigate', { url: 'file://' + resolve(html) });
for (let i = 0; i < 160; i++) {
  if (await evaluate(`document.readyState === 'complete' && [...document.images].every(i => i.complete)`)) break;
  await sleep(250);
}
await evaluate('document.fonts.ready.then(() => true)');
await sleep(200);

const lint = await evaluate(`(() => {
  const page = document.querySelector('.page');
  if (!page) return { error: 'no .page element: wrap the poster in <div class="page">' };
  const P = page.getBoundingClientRect();
  const issues = [];
  const name = (el) => {
    let s = el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].join('.') : '');
    const t = (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 48);
    return t ? s + ' "' + t + '"' : s;
  };
  if (page.scrollHeight > page.clientHeight + 1) issues.push({ type: 'page-overflow', px: page.scrollHeight - page.clientHeight });
  if (page.scrollWidth > page.clientWidth + 1) issues.push({ type: 'page-overflow-x', px: page.scrollWidth - page.clientWidth });
  const blocks = ['block', 'flex', 'grid', 'inline-block', 'table-cell', 'list-item', 'inline-flex'];
  for (const el of page.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (r.right > P.right + 1 || r.bottom > P.bottom + 1 || r.left < P.left - 1 || r.top < P.top - 1) {
      if (hasText || el.children.length === 0) issues.push({ type: 'off-canvas', el: name(el) });
      continue;
    }
    if ((el.innerText || '').trim() && blocks.includes(cs.display) && el.clientHeight > 0) {
      const x = el.scrollWidth - el.clientWidth, y = el.scrollHeight - el.clientHeight;
      if (x > 2 || y > 2) issues.push({ type: 'spill', el: name(el), x: x > 2 ? x : 0, y: y > 2 ? y : 0 });
    }
    if (hasText && parseFloat(cs.fontSize) < 13) issues.push({ type: 'tiny-text', el: name(el), size: cs.fontSize });
    const parent = el.parentElement;
    if (hasText && parent && parent !== page && cs.position !== 'absolute' && cs.position !== 'fixed') {
      const q = parent.getBoundingClientRect();
      if (r.left < q.left - 3 || r.right > q.right + 3) issues.push({ type: 'escapes-parent', el: name(el), parent: name(parent) });
    }
  }
  const footer = page.querySelector('.footer');
  let bottom = 0;
  for (const el of (page.querySelector('.content') || page).querySelectorAll('*')) {
    if (footer && footer.contains(el)) continue;
    const r = el.getBoundingClientRect(); if (r.height) bottom = Math.max(bottom, r.bottom);
  }
  const limit = footer ? footer.getBoundingClientRect().top : P.bottom - parseFloat(getComputedStyle(page).paddingBottom);
  if (bottom > limit + 1) issues.push({ type: 'overlaps-footer', px: Math.round(bottom - limit) });
  else if (limit - bottom > P.height * 0.1) issues.push({ type: 'empty-band', px: Math.round(limit - bottom), hint: 'let the main visual grow, enlarge type and gaps, or pick a shorter canvas' });
  const c = document.createElement('canvas').getContext('2d');
  const probe = 'Pretendard 한글 Ag 0123';
  c.font = '16px monospace'; const base = c.measureText(probe).width;
  c.font = '16px Pretendard, monospace'; const withFont = c.measureText(probe).width;
  const numbers = [...new Set([...page.innerText.matchAll(/\\d[\\d,]*(?:\\.\\d+)?/g)].map((m) => m[0].replace(/,/g, '')))];
  return { page: { w: Math.round(P.width), h: Math.round(P.height), x: P.x, y: P.y }, fontOk: Math.abs(withFont - base) > 0.5, issues, numbers };
})()`);
if (!lint || lint.error) { console.error(lint?.error || 'lint failed'); quit(4); }
if (!lint.fontOk) lint.issues.push({ type: 'font', hint: 'Pretendard is not installed and the web font did not load; text uses a fallback font' });

const factsPath = opt('--facts');
if (factsPath) {
  const facts = readFileSync(factsPath, 'utf8').replace(/,(?=\d{3})/g, '');
  // ponytail: integers up to 12 are skipped as likely step and section numbers; derived figures still show up for review.
  lint.unknownNumbers = lint.numbers.filter((n) => !(Number.isInteger(+n) && +n <= 12) && !facts.includes(n));
}
delete lint.numbers;

const { w, h, x, y } = lint.page;
const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x, y, width: w, height: h, scale: 1 }, captureBeyondViewport: true });
writeFileSync(outPng, Buffer.from(shot.result.data, 'base64'));
if (flag('--pdf')) {
  await send('Emulation.setEmulatedMedia', { media: 'screen' });
  const pdf = await send('Page.printToPDF', {
    paperWidth: w / 96, paperHeight: h / 96, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    printBackground: true, preferCSSPageSize: false, pageRanges: '1',
  });
  writeFileSync(outPng.replace(/\.png$/, '.pdf'), Buffer.from(pdf.result.data, 'base64'));
}
writeFileSync(join(dirname(outPng), 'lint.json'), JSON.stringify(lint, null, 2));

console.log(`png ${outPng} (${w * scale}x${h * scale})${flag('--pdf') ? ' + pdf' : ''}`);
console.log(lint.issues.length ? `LINT ${lint.issues.length} issue(s):` : 'LINT clean');
for (const i of lint.issues.slice(0, 20)) console.log(' ', JSON.stringify(i));
if (lint.unknownNumbers?.length) console.log(`numbers not in the fact sheet: ${lint.unknownNumbers.join(', ')}`);
ws.close();
quit(0);
