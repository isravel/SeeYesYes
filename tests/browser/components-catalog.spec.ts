import { test, expect } from '@playwright/test';

test('catalog shows contract-derived counts, filters, and honest review status', async ({ page }) => {
  await page.goto('/components');
  await expect(page.getByRole('heading', { name: 'Components', exact: true })).toBeVisible();
  const cards = page.getByRole('listitem').filter({ has: page.getByRole('heading', { level: 2 }) });
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThan(20);

  const summary = page.getByRole('region', { name: 'Catalog summary' });
  await expect(summary).toContainText(`Components${total}`);
  await expect(summary).toContainText(`Metadata-complete${total} of ${total}`);
  await expect(summary).toContainText(`Accessibility reviewed0 of ${total}`);
  await expect(page.getByText(`${total} components are not yet reviewed.`)).toBeVisible();

  const button = page.locator('li#button');
  await expect(button).toContainText('Button');
  await expect(button).toContainText('Not reviewed');
  await expect(button).toContainText('Experimental');
  await expect(button).toContainText('Metadata-complete');
  await expect(button).toContainText(/\d+ variant options/);

  await page.getByRole('searchbox', { name: 'Search components' }).fill('button');
  await expect(page.locator('li#button')).toBeVisible();
  await expect(page.getByRole('status').first()).toContainText(`of ${total} components`);
  await page.getByRole('searchbox', { name: 'Search components' }).fill('zzz-none');
  await expect(page.getByRole('heading', { name: 'No components match' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(page.getByRole('status').first()).toHaveText(`${total} components`);

  await page.getByRole('combobox', { name: 'Category' }).selectOption('form');
  await expect(page.locator('li#button')).toHaveCount(0);
  await expect(page.locator('li#input')).toBeVisible();
});

test('empty and error scenarios offer a next action and a retry', async ({ page }) => {
  await page.goto('/components?scenario=empty');
  await expect(page.getByRole('heading', { name: 'No components yet' })).toBeVisible();
  await page.getByRole('link', { name: 'Show the normal catalog' }).click();
  await expect(page.locator('li#button')).toBeVisible();

  await page.goto('/components?scenario=error');
  await expect(page.getByRole('heading', { name: /something went wrong|couldn.t|error/i }).or(page.getByText(/deterministic error scenario/))).toBeVisible();
  const retry = page.getByRole('button', { name: /retry/i });
  await expect(retry).toBeVisible();
  await retry.click();
  await expect(page.getByText(/deterministic error scenario/)).toBeVisible();
});

test('catalog fits 320px and desktop in both appearances', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/components');
      await expect(page.locator('li#button')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});
