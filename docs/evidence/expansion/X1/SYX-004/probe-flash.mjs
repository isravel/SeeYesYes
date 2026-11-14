import { chromium } from '/Users/raj-7718/Documents/Product/SeeYesYes/node_modules/@playwright/test/index.mjs';
// Records every change of the root appearance attribute from the first moment a script can run
// (addInitScript runs before any page script), plus the appearance at each paint.
const base = process.env.BASE;
const b = await chromium.launch();
const out = {};

const record = `
  window.__log = [];
  const read = (root) => [root.getAttribute('data-appearance'), getComputedStyle(root).colorScheme, getComputedStyle(root).getPropertyValue('--sys-color-background').trim()];
  const snap = (tag) => { const r = document.documentElement; window.__log.push([tag, ...(r ? read(r) : ['no-root', '', ''])]); };
  snap('init-script');
  // The root element may not exist yet when this runs; watch the document until it does.
  const attach = () => {
    const root = document.documentElement;
    if (!root || window.__attached) return;
    window.__attached = true;
    snap('root-created');
    new MutationObserver(() => snap('attr-change')).observe(root, { attributes: true, attributeFilter: ['data-appearance', 'class', 'style'] });
  };
  attach();
  new MutationObserver(attach).observe(document, { childList: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => snap(e.name))).observe({ type: 'paint', buffered: true });
  document.addEventListener('readystatechange', () => snap('readyState:' + document.readyState));
  document.addEventListener('DOMContentLoaded', () => snap('DOMContentLoaded'));
`;

async function visit(name, ctxOpts, seed) {
  const ctx = await b.newContext(ctxOpts);
  const p = await ctx.newPage();
  if (seed) await p.addInitScript(seed);
  await p.addInitScript(record);
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.waitForTimeout(500);
  out[name] = await p.evaluate(() => {
    const log = window.__log;
    const seen = [...new Set(log.filter((e) => e[1] !== 'no-root').map((e) => e[1]))];
    return { distinctAppearances: seen, final: document.documentElement.getAttribute('data-appearance'), log };
  });
  await ctx.close();
}

// A. First visit, nothing saved, system dark.
await visit('firstVisitSystemDark', { colorScheme: 'dark' });
// B. First visit, nothing saved, system light.
await visit('firstVisitSystemLight', { colorScheme: 'light' });
// C. Saved choice (made through the UI) must win from the first moment, against the opposite system scheme.
{
  const seedCtx = await b.newContext({ colorScheme: 'light' });
  const sp = await seedCtx.newPage();
  await sp.goto(base + '/', { waitUntil: 'load' });
  await sp.getByRole('button', { name: /dark/i }).first().click();
  await sp.waitForFunction(() => document.documentElement.getAttribute('data-appearance') === 'dark');
  await sp.waitForTimeout(500);
  const state = await seedCtx.storageState();
  await seedCtx.close();
  await visit('savedDarkSystemLight', { colorScheme: 'light', storageState: state });
}

console.log(JSON.stringify(out, null, 1));
await b.close();
