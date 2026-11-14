import { chromium } from '/Users/raj-7718/Documents/Product/SeeYesYes/node_modules/@playwright/test/index.mjs';
const base = process.env.BASE;
const b = await chromium.launch();
const out = {};
const problems = [];
const watch = page => {
  page.on('console', m => { if (m.type() === 'error') problems.push(`error: ${m.text().slice(0, 300)}`); });
  page.on('pageerror', e => problems.push(`pageerror: ${e.message.slice(0, 300)}`));
};

// A. Storage that throws on every access (private mode / blocked).
const blocked = await b.newContext({ colorScheme: 'dark' });
await blocked.addInitScript(() => {
  const boom = () => { throw new DOMException('blocked', 'SecurityError'); };
  Object.defineProperty(window, 'localStorage', { get: boom });
});
const p = await blocked.newPage();
watch(p);
await p.goto(base + '/', { waitUntil: 'load' });
await p.waitForTimeout(800);
out.blocked = await p.evaluate(() => ({ appearance: document.documentElement.getAttribute('data-appearance'), buttonVisible: !!document.querySelector('button') }));
await p.getByRole('button', { name: 'Light', exact: true }).click();
await p.waitForTimeout(400);
out.blockedAfterSwitch = await p.evaluate(() => document.documentElement.getAttribute('data-appearance'));

// B. Corrupt saved settings.
const corrupt = await b.newContext({ colorScheme: 'light' });
await corrupt.addInitScript(() => { try { localStorage.setItem('seeyesyes:settings:v1', '{not json'); } catch {} });
const q = await corrupt.newPage();
watch(q);
await q.goto(base + '/', { waitUntil: 'load' });
await q.waitForTimeout(800);
out.corrupt = await q.evaluate(() => ({ appearance: document.documentElement.getAttribute('data-appearance'), buttonVisible: !!document.querySelector('button') }));

out.problems = problems;
console.log(JSON.stringify(out));
await b.close();
