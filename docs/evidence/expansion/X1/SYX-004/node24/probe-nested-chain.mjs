import { chromium } from '/Users/raj-7718/Documents/Product/SeeYesYes/node_modules/@playwright/test/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8192/');
await page.getByRole('button', { name: 'Open glass dialog' }).click();
const d = page.getByRole('dialog', { name: 'Glass dialog' });
await d.waitFor();
console.log(JSON.stringify(await d.evaluate(el => {
  const chain = []; for (let n = el; n; n = n.parentElement) chain.push(`${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}${n.hasAttribute('data-theme-scope') ? '[scope]' : ''}${n.dataset?.appearance ? '[' + n.dataset.appearance + ']' : ''}`);
  const cs = getComputedStyle(el); return { blur: cs.backdropFilter || cs.webkitBackdropFilter, chain, scopeEls: [...document.querySelectorAll('[data-theme-scope]')].map(s => s.id) };
})));
await browser.close();
