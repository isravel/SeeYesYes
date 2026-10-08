import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('seed preview hydrates, handles native activation, and has no serious axe findings', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', {level: 1})).toHaveText('Good interfaces startwith a common language.');
  await page.getByRole('button', {name: 'Save settings'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({hasText: 'Settings saved'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Read the registry', exact: true})).toHaveAttribute('href', '/api/registry');
  const accessibility = await new AxeBuilder({page}).analyze();
  expect(accessibility.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('foundation fits 320px and desktop in both appearances', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({colorScheme});
    for (const width of [320, 1280]) {
      await page.setViewportSize({width, height: 900});
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({path: `${process.env.SEEYESYES_EVIDENCE_DIR ?? 'test-results'}/${colorScheme}-${width}.png`, fullPage: true});
    }
  }
});

test('production mock endpoints recover by scenario and remain read-only', async ({request}) => {
  expect((await request.get('/api/registry?scenario=error')).status()).toBe(503);
  expect(await (await request.get('/api/components?scenario=empty')).json()).toEqual({data: []});
  const normal = await request.get('/api/registry?scenario=normal');
  expect(normal.status()).toBe(200);
  expect((await normal.json()).data.components).toHaveLength(3);
  expect((await request.get('/api/components/unknown?scenario=error')).status()).toBe(404);
  expect((await request.post('/api/registry', {data: {}})).status()).toBe(405);
});
