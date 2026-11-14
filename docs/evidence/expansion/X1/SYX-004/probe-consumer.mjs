import { chromium } from '/Users/raj-7718/Documents/Product/SeeYesYes/node_modules/@playwright/test/index.mjs';
const base = process.env.BASE;
const b = await chromium.launch();
const out = {};
const problems = [];

// 1. Server-rendered HTML, before any script runs.
const html = await (await fetch(base + '/')).text();
out.ssr = {
  stylesheetLink: /<link[^>]+rel="stylesheet"/.test(html),
  bootstrapScriptInHead: /<head>[\s\S]*seeyesyes:settings:v1[\s\S]*<\/head>/.test(html),
  htmlHasSuppressedHydrationRoot: /<html[^>]*lang="en"/.test(html),
};

// 2. First visit, styles, appearance change.
const ctx = await b.newContext({ colorScheme: 'light' });
const p = await ctx.newPage();
const watch = (page, tag) => {
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) problems.push(`${tag} ${m.type()}: ${m.text().slice(0, 300)}`); });
  page.on('pageerror', e => problems.push(`${tag} pageerror: ${e.message.slice(0, 300)}`));
  page.on('response', r => { if (r.status() >= 400) problems.push(`${tag} ${r.status()} ${r.url()}`); });
};
watch(p, 'first');
await p.goto(base + '/', { waitUntil: 'load' });
out.styles = await p.evaluate(() => {
  const cs = getComputedStyle(document.querySelector('button'));
  const rootVars = [...getComputedStyle(document.documentElement)].filter(n => n.startsWith('--sys-')).length;
  return { sheets: document.styleSheets.length, buttonRadius: cs.borderRadius, buttonBg: cs.backgroundColor, sysVarCount: rootVars };
});
out.appearanceBefore = await p.evaluate(() => document.documentElement.getAttribute('data-appearance'));
await p.getByRole('button', { name: /dark/i }).first().click();
await p.waitForTimeout(500);
out.appearanceAfter = await p.evaluate(() => ({ attr: document.documentElement.getAttribute('data-appearance'), saved: JSON.parse(localStorage.getItem('seeyesyes:settings:v1') || 'null')?.settings?.appearance }));

// 3. Reload with a recorder that runs before page scripts: what is the root appearance at each early moment?
await ctx.addInitScript(() => {
  window.__early = [];
  const rec = w => window.__early.push([w, document.documentElement.getAttribute('data-appearance'), document.documentElement.style.colorScheme]);
  document.addEventListener('readystatechange', () => rec('readyState:' + document.readyState));
  new PerformanceObserver(list => { for (const e of list.getEntries()) rec(e.name); }).observe({ type: 'paint', buffered: true });
});
const p2 = await ctx.newPage();
watch(p2, 'reload');
await p2.goto(base + '/', { waitUntil: 'load' });
await p2.waitForTimeout(500);
out.early = await p2.evaluate(() => window.__early);
out.reloadFinal = await p2.evaluate(() => document.documentElement.getAttribute('data-appearance'));

// 4. Dialog in the nested glass scope.
await p2.getByRole('button', { name: 'Open glass dialog' }).click();
await p2.waitForTimeout(600);
out.nested = await p2.evaluate(() => {
  const d = document.querySelector('[role=dialog]');
  let blur = null;
  for (let e = d; e; e = e.parentElement) { const v = getComputedStyle(e).backdropFilter; if (v && v !== 'none') { blur = v; break; } }
  const scope = d?.closest('[scope]');
  return { insideNestedId: !!d?.closest('#nested'), scopeAttrs: scope ? [...scope.attributes].map(a => `${a.name}=${a.value}`).join(' ') : null, blur };
});
await p2.keyboard.press('Escape');

// 5. Other pages and link targets.
for (const path of ['/listing', '/sign-in', '/forgot', '/sign-up']) { const r = await p2.goto(base + path, { waitUntil: 'load' }); out[path] = r.status(); }
await p2.waitForTimeout(1500);
out.problems = [...new Set(problems)];
console.log(JSON.stringify(out, null, 1));
await b.close();
