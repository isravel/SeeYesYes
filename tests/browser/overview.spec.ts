import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registry } from '@/lib/data/registry';

test('coverage is calculated from the registry and kept apart from demo results', async ({ page }) => {
  await page.goto('/');
  const coverage = page.locator('section[aria-labelledby="foundation-title"]');
  await expect(coverage).toContainText(`Components${registry.components.length}`);
  await expect(coverage).toContainText(`Metadata-complete${registry.components.length} of ${registry.components.length}`);
  await expect(coverage).toContainText(`Accessibility reviewed0 of ${registry.components.length}`);
  await expect(coverage).toContainText(`Resolved tokens${registry.tokens.length}`);
  await expect(coverage).toContainText(`Usage rules${registry.rules.length}`);
  await expect(coverage).toContainText(`Examples${registry.examples.length}`);
  await expect(coverage).toContainText('does not mean the component was reviewed');

  const health = page.locator('section[aria-labelledby="health-title"]');
  await expect(health).toContainText('Demo results');
  await expect(health).toContainText('not a measurement of this system');
  const table = health.getByRole('region', { name: 'Demo results by sample report table' });
  await expect(table.getByRole('row', { name: /^clean / })).toContainText('8');
  await expect(table.getByRole('row')).toHaveCount(4);
  // No single combined score anywhere.
  await expect(page.getByText(/overall score|health score|combined score/i)).toHaveCount(0);
});

test('the demo health panel fails and recovers on its own without taking the page down', async ({ page }) => {
  let failed = false;
  await page.route('**/api/validation?*', route => { if (!failed) { failed = true; return route.fulfill({ status: 503, json: { error: { code: 'DEMO_ERROR', message: 'Demo results are temporarily unavailable.' } } }); } return route.continue(); });
  await page.goto('/');
  await expect(page.getByText('Demo results are temporarily unavailable.')).toBeVisible();
  await expect(page.locator('section[aria-labelledby="foundation-title"]')).toContainText('Metadata-complete');
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  await page.locator('section[aria-labelledby="health-title"]').getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('region', { name: 'Demo results by sample report table' })).toBeVisible();
  await page.goto('/?scenario=empty');
  await expect(page.getByRole('heading', { name: 'No demo results' })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="foundation-title"]')).toContainText('Metadata-complete');
});

test('links lead to the real screens and the page has no serious axe findings', async ({ page }) => {
  await page.goto('/');
  for (const [name, path] of [['Browse the components ↗', '/components'], ['Export the AI context ↗', '/ai/context'], ['Tokens ↗', '/system/tokens'], ['Rules ↗', '/system/rules'], ['Accessibility ↗', '/accessibility'], ['Validation ↗', '/validation']] as const) {
    await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', path);
  }
  await expect(page.getByRole('region', { name: 'Demo results by sample report table' })).toBeVisible();
  const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(serious).toEqual([]);
});
