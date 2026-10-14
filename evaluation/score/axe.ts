import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { summarizeAxe } from './checks';

/** Run axe-core on running pages. Pass one URL per relevant state (for example the page with its dialog open is scored separately by the operator). */
export async function runAxe(urls: string[]) {
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext()).newPage();
    const results = [];
    for (const url of urls) {
      await page.goto(url, { waitUntil: 'load' });
      const { violations } = await new AxeBuilder({ page }).analyze();
      results.push({ url, ...summarizeAxe(violations) });
    }
    return results;
  } finally { await browser.close(); }
}
