// Repeatable production performance procedure (A17).
//   npm run build && node scripts/perf.mjs            (writes docs/evidence/M7/performance.md and performance.json)
// Lighthouse mobile on four routes, three runs each, median results; route JavaScript transfer; and a long-task trace while
// editing the Theme and filtering the catalog. Lab conditions only; these are project targets, not real-user claims.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const port = 3160;
const origin = `http://127.0.0.1:${port}`;
const routes = [['Overview', '/'], ['Theme', '/system/theme'], ['Components', '/components'], ['AI Context', '/ai/context']];
const runs = 3;
const targets = { performance: 90, lcpMs: 2500, cls: 0.1, longTaskMs: 50 };
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const server = spawn('npx', ['next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { stdio: 'ignore', env: { ...process.env } });
const stop = () => server.kill('SIGTERM');
process.on('exit', stop);
for (let i = 0; i < 60; i += 1) { try { if ((await fetch(origin)).ok) break; } catch { /* still starting */ } await new Promise(resolve => setTimeout(resolve, 1000)); }

const chromePath = chromium.executablePath();
const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });
const results = [];
let lighthouseVersion = '';
let chromeVersion = '';
try {
  for (const [name, path] of routes) {
    const samples = [];
    for (let run = 0; run < runs; run += 1) {
      const { lhr } = await lighthouse(`${origin}${path}`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'] });
      lighthouseVersion = lhr.lighthouseVersion; chromeVersion = lhr.environment.hostUserAgent;
      const scripts = lhr.audits['network-requests'].details.items.filter(item => item.resourceType === 'Script');
      samples.push({ score: Math.round(lhr.categories.performance.score * 100), lcp: lhr.audits['largest-contentful-paint'].numericValue, cls: lhr.audits['cumulative-layout-shift'].numericValue, tbt: lhr.audits['total-blocking-time'].numericValue,
        scriptTransferKb: scripts.reduce((sum, item) => sum + item.transferSize, 0) / 1024, throttling: lhr.configSettings.throttlingMethod, formFactor: lhr.configSettings.formFactor });
    }
    results.push({ name, path, samples, median: { score: median(samples.map(s => s.score)), lcpMs: Math.round(median(samples.map(s => s.lcp))), cls: Number(median(samples.map(s => s.cls)).toFixed(3)), tbtMs: Math.round(median(samples.map(s => s.tbt))), scriptTransferKb: Math.round(median(samples.map(s => s.scriptTransferKb))) } });
  }
} finally { await chrome.kill(); }

// Production interaction trace: long tasks while editing the Theme and filtering the catalog.
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const longTasks = async (label, action) => {
  await page.evaluate(() => { window.__long = []; new PerformanceObserver(list => list.getEntries().forEach(e => window.__long.push(e.duration))).observe({ type: 'longtask', buffered: false }); });
  await action();
  await page.waitForTimeout(500);
  const durations = await page.evaluate(() => window.__long);
  return { label, count: durations.length, maxMs: Math.round(Math.max(0, ...durations)) };
};
await page.goto(`${origin}/system/theme`); await page.getByRole('heading', { level: 1 }).waitFor();
// Self-check: a deliberate 120 ms busy loop must be reported, or the zeros below would mean nothing.
const selfCheck = await longTasks('Observer self-check (120 ms busy loop)', () => page.evaluate(() => new Promise(resolve => setTimeout(() => { const start = performance.now(); while (performance.now() - start < 120); resolve(); }, 0))));
if (selfCheck.maxMs < 100) throw new Error('The long-task observer did not detect a 120 ms busy loop; the trace is not trustworthy.');
const theme = await longTasks('Editing the Theme', async () => {
  for (const [name, value] of [['Corner shape', 'curvy'], ['Density', 'compact'], ['Shadow scale', 'defined'], ['Type scale', 'large'], ['Corner shape', 'sharp'], ['Density', 'spacious']]) await page.getByRole('combobox', { name }).selectOption(value);
  for (const lightness of ['0.2', '0.4', '0.6', '0.8']) await page.getByRole('spinbutton', { name: 'Lightness' }).fill(lightness);
});
await page.goto(`${origin}/components`); await page.locator('li#button').waitFor();
const catalog = await longTasks('Filtering the catalog', async () => {
  const search = page.getByRole('searchbox', { name: 'Search components' });
  for (const text of ['b', 'bu', 'but', 'butt', 'butto', 'button', '']) await search.fill(text);
  await page.getByRole('combobox', { name: 'Category' }).selectOption('form');
  await page.getByRole('combobox', { name: 'Category' }).selectOption('all');
});
await browser.close();
stop();

const pass = {
  routes: results.every(r => r.median.score >= targets.performance && r.median.lcpMs <= targets.lcpMs && r.median.cls <= targets.cls),
  longTasks: [theme, catalog].every(t => t.maxMs <= targets.longTaskMs),
};
const report = { date: new Date().toISOString().slice(0, 10), machine: { platform: `${os.type()} ${os.release()} ${os.arch()}`, cpus: os.cpus().length, node: process.version }, lighthouse: lighthouseVersion, chrome: chromeVersion, conditions: { mockLatency: '0 ms (mock endpoints answer immediately)', formFactor: results[0].samples[0].formFactor, throttling: results[0].samples[0].throttling, runsPerRoute: runs }, targets, results, interaction: [theme, catalog], selfCheck, pass };
mkdirSync('docs/evidence/M7', { recursive: true });
writeFileSync('docs/evidence/M7/performance.json', `${JSON.stringify(report, null, 2)}\n`);
const fmt = ms => `${(ms / 1000).toFixed(2)}s`;
writeFileSync('docs/evidence/M7/performance.md', [
  '# Performance report (A17)', '', `Date: ${report.date}. Generated by \`node scripts/perf.mjs\` against the production build.`, '',
  '## Conditions', '', `- Machine: ${report.machine.platform}, ${report.machine.cpus} CPUs, Node ${report.machine.node}`, `- Lighthouse ${report.lighthouse}; ${report.chrome}`, `- Lighthouse mobile (form factor ${report.conditions.formFactor}, throttling method ${report.conditions.throttling}), ${runs} runs per route, median reported`, `- Mock latency: ${report.conditions.mockLatency}`, '- These are lab conditions on one machine. They are project acceptance targets, not a claim about real-user traffic.', '',
  `## Lighthouse mobile (targets: performance at least ${targets.performance}, LCP at most ${fmt(targets.lcpMs)}, CLS at most ${targets.cls})`, '',
  '| Route | Performance | LCP | CLS | Total blocking time | Script transfer | Result |', '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
  ...results.map(r => `| ${r.name} (\`${r.path}\`) | ${r.median.score} | ${fmt(r.median.lcpMs)} | ${r.median.cls} | ${r.median.tbtMs} ms | ${r.median.scriptTransferKb} KB | ${r.median.score >= targets.performance && r.median.lcpMs <= targets.lcpMs && r.median.cls <= targets.cls ? 'meets targets' : 'MISSES TARGET'} |`), '',
  '## Interaction trace (target: no long task above 50 ms during steady interaction)', '',
  '| Interaction | Long tasks | Longest |', '| --- | ---: | ---: |', ...[theme, catalog].map(t => `| ${t.label} | ${t.count} | ${t.maxMs} ms |`), '',
  `Observer self-check: a deliberate 120 ms busy loop was reported as ${selfCheck.maxMs} ms, so the zero counts above are real.`, '',
  `Overall: routes ${pass.routes ? 'meet' : 'MISS'} their targets; interaction ${pass.longTasks ? 'meets' : 'MISSES'} the long-task target.`, '',
].join('\n'));
console.log(JSON.stringify({ pass, results: results.map(r => ({ name: r.name, ...r.median })), interaction: [theme, catalog] }, null, 2));
process.exit(0);
