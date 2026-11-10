#!/usr/bin/env node
// Score candidates from <run>/judging/*.json, pick the shortlist, write shortlist.json and board.html.
// usage: node board.mjs <run-dir> [--n 8]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const run = resolve(process.argv[2] || '.');
const nAt = process.argv.indexOf('--n');
const size = nAt > 0 ? Number(process.argv[nAt + 1]) : 8;
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const concepts = json(join(run, 'concepts.json')).concepts;

const judged = { fact: {}, reader: {}, designer: {}, decider: {} };
let quiz = {};
for (const f of readdirSync(join(run, 'judging')).filter((f) => f.endsWith('.json')).sort()) {
  const j = json(join(run, 'judging', f));
  if (f.startsWith('quiz')) { quiz = j; continue; }
  for (const r of j.results ?? []) if (judged[j.judge]) judged[j.judge][r.id] = r;
}

const unit = (x, lo, hi) => (x - lo) / (hi - lo);
// The render subagent may reword the concept's headline; show the one on the page.
const pageTitle = (id) => {
  const f = join(run, 'candidates', id, 'index.html');
  const h1 = existsSync(f) && /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(readFileSync(f, 'utf8'));
  return h1 ? h1[1].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : null;
};
const rows = concepts.map((c) => {
  const q = quiz[c.id], rd = judged.reader[c.id], d = judged.designer[c.id], dc = judged.decider[c.id];
  const parts = [
    [rd ? 0.7 * (q ? q.correct / q.of : 0.5) + 0.3 * unit(rd.clarity, 1, 5) : null, 0.4],
    [d ? unit((d.hierarchy + d.layout + d.legibility + d.style) / 4, 1, 5) : null, 0.3],
    [dc ? unit(dc.score, 1, 5) : null, 0.3],
  ];
  const known = parts.filter(([v]) => v != null);
  const weight = known.reduce((s, [, w]) => s + w, 0);
  const png = join('candidates', c.id, 'page.png');
  return {
    id: c.id, format: c.format, headline: pageTitle(c.id) ?? c.headline,
    reader: parts[0][0], designer: parts[1][0], decider: parts[2][0],
    total: weight ? known.reduce((s, [v, w]) => s + v * w, 0) / weight : 0,
    errors: judged.fact[c.id]?.errors?.length ?? 0,
    png: existsSync(join(run, png)) ? png : null,
    quiz: q, clarity: rd?.clarity, notes: { best: d?.best, issue: d?.top_issue, missing: dc?.missing, confusing: rd?.confusing },
  };
});

const shortlist = [], perFormat = {};
for (const r of rows.filter((r) => r.png && !r.errors).sort((a, b) => b.total - a.total)) {
  if (shortlist.length >= size) break;
  if ((perFormat[r.format] ?? 0) >= 2) { r.left = 'cap'; continue; }
  perFormat[r.format] = (perFormat[r.format] ?? 0) + 1;
  shortlist.push(r);
}
for (const r of rows) if (!shortlist.includes(r)) r.left ??= !r.png ? 'missing' : r.errors ? 'fact' : 'low';
writeFileSync(join(run, 'shortlist.json'), JSON.stringify(shortlist.map((r, i) => ({ rank: i + 1, ...r })), null, 2));

const factSheet = existsSync(join(run, 'fact-sheet.md')) ? readFileSync(join(run, 'fact-sheet.md'), 'utf8') : '';
const topic = /^#\s+(.+)$/m.exec(factSheet)?.[1] ?? 'Poster';
const ko = /Language:\s*ko/i.test(factSheet);
const L = ko
  ? { title: '시안을 하나 골라 주세요', sub: `${rows.length}개 중 ${shortlist.length}개 · 심사 점수 순 · 같은 형식은 2개까지`, reader: '독자', designer: '디자인', decider: '목적', total: '종합',
      ask: '번호와 고칠 점을 답해 주세요. 예: 「3번, 표는 5번처럼」', left: '보드에 없는 시안', why: { fact: '사실 오류', cap: '같은 형식 2개 초과', low: '점수 낮음', missing: '렌더 실패' },
      best: '좋은 점', issue: '고칠 점', missing: '결정권자가 물을 것', confusing: '헷갈린 곳' }
  : { title: 'Pick one candidate', sub: `${shortlist.length} of ${rows.length} · ranked by the panel · at most 2 per format`, reader: 'reader', designer: 'design', decider: 'purpose', total: 'total',
      ask: 'Reply with a number and what to change, e.g. "3, with the table from 5".', left: 'Not on the board', why: { fact: 'fact errors', cap: 'format already twice', low: 'lower score', missing: 'render failed' },
      best: 'best', issue: 'fix', missing: 'decider would ask', confusing: 'confusing' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const pct = (v) => (v == null ? '–' : Math.round(v * 100));
const card = (r, i) => `
  <article>
    <header><span class="num">${i + 1}</span><b>${esc(r.id)} · ${esc(r.format)}</b><span class="score">${L.total} ${pct(r.total)}</span></header>
    <a href="${esc(r.png)}"><img src="${esc(r.png)}" alt=""></a>
    <h2>${esc(r.headline)}</h2>
    <p class="chips"><span>${L.reader} ${pct(r.reader)}${r.quiz ? ` (${r.quiz.correct}/${r.quiz.of})` : ''}</span><span>${L.designer} ${pct(r.designer)}</span><span>${L.decider} ${pct(r.decider)}</span></p>
    <dl>${['best', 'issue', 'missing', 'confusing'].filter((k) => r.notes[k]).map((k) => `<dt>${L[k]}</dt><dd>${esc(r.notes[k])}</dd>`).join('')}</dl>
  </article>`;
const leftOut = rows.filter((r) => !shortlist.includes(r))
  .map((r) => `<li><b>${esc(r.id)}</b> ${esc(r.format)} · ${esc(r.headline)} <span>(${L.why[r.left]}${r.png ? `, ${L.total} ${pct(r.total)}` : ''})</span></li>`).join('');

writeFileSync(join(run, 'board.html'), `<!doctype html><html lang="${ko ? 'ko' : 'en'}"><head><meta charset="utf-8"><title>${esc(topic)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
body { margin: 0; font-family: Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif; color: #1a1a1a; word-break: keep-all; background: #fff; }
main { max-width: 1760px; margin: 0 auto; padding: 40px 40px 60px; }
.eyebrow { color: #6b6b6b; font-size: 14px; } h1 { font-size: 32px; margin: 6px 0 6px; } .sub { color: #3a3a3a; margin: 0 0 6px; }
.ask { font-weight: 700; margin: 10px 0 22px; padding-bottom: 18px; border-bottom: 2px solid #1a1a1a; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 34px 30px; }
article header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.num { display: inline-flex; width: 30px; height: 30px; border-radius: 50%; background: #1a1a1a; color: #fff; font-weight: 800; align-items: center; justify-content: center; }
.score { margin-left: auto; font-weight: 800; }
img { width: 100%; display: block; border: 1px solid #cfcfcf; border-radius: 8px; }
h2 { font-size: 17px; margin: 10px 0 6px; }
.chips span { display: inline-block; font-size: 12.5px; border: 1px solid #1a1a1a; border-radius: 999px; padding: 2px 10px; margin-right: 6px; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; font-size: 13px; color: #3a3a3a; margin: 8px 0 0; }
dt { color: #6b6b6b; } dd { margin: 0; }
.left { margin-top: 40px; border-top: 1px solid #cfcfcf; padding-top: 14px; font-size: 13.5px; color: #3a3a3a; }
.left li { margin: 4px 0; } .left span { color: #6b6b6b; }
</style></head><body><main>
<div class="eyebrow">${esc(topic)}</div><h1>${L.title}</h1><p class="sub">${L.sub}</p><p class="ask">${L.ask}</p>
<div class="grid">${shortlist.map(card).join('')}</div>
${leftOut ? `<section class="left"><b>${L.left}</b><ul>${leftOut}</ul></section>` : ''}
</main></body></html>`);

for (const [i, r] of shortlist.entries()) console.log(`${i + 1}. ${r.id} ${r.format} ${pct(r.total)} ${r.headline}`);
console.log(`board ${join(run, 'board.html')}`);
