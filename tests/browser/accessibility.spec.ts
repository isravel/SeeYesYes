import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registry } from '@/lib/data/registry';

test('three separate sections, with honest labels and no conformance claim', async ({ page }) => {
  await page.goto('/accessibility');
  for (const name of ['Component review evidence', 'Live contrast for the applied theme', 'Sample validation results']) await expect(page.getByRole('heading', { level: 2, name: new RegExp(name) })).toBeVisible();
  await expect(page.getByText(`0 of ${registry.components.length} reviewed`)).toBeVisible();
  await expect(page.getByText('No component has had a human accessibility review yet.')).toBeVisible();
  await expect(page.getByText('limited local calculation, not a complete audit')).toBeVisible();
  await expect(page.getByText('Demo results').first()).toBeVisible();
  await expect(page.getByText(/fixture data, not measurements/)).toBeVisible();
  await expect(page.getByText(/conformant|conforms|WCAG compliant|certified/i)).toHaveCount(1); // only the negated "does not make the theme conformant"
  const evidence = page.getByRole('region', { name: 'Component review evidence table' });
  await expect(evidence.getByRole('row')).toHaveCount(registry.components.length + 1);
  await expect(evidence.getByRole('row', { name: /^Button / })).toContainText('Not reviewed');
  await expect(evidence.getByRole('row', { name: /^Button / })).toContainText('Enter; Space');
  await expect(evidence.getByRole('row', { name: /^Spinner / })).toContainText('Respects reduced motion');
  await expect(page.getByRole('region', { name: 'Form semantics table' }).getByRole('row', { name: /^Select / })).toContainText('select');
});

test('contrast is measured from the applied theme and a failing theme is shown as failing', async ({ page }) => {
  await page.goto('/accessibility');
  await expect(page.getByText('32 of 32 pairs meet their minimum')).toBeVisible();
  const table = page.getByRole('region', { name: 'Measured contrast for the applied theme table' });
  await expect(table.getByRole('row', { name: /Light Text on background/ })).toContainText(/\d+\.\d\d:1/);
  await expect(table.getByRole('row', { name: /Light Text on background/ })).toContainText('Meets minimum');

  // An unapplied draft does not change it; applying one does.
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Color role' }).selectOption('foreground');
  await page.getByRole('spinbutton', { name: 'Lightness' }).fill('0.97');
  await page.getByRole('link', { name: 'Back to overview' }).click();
  await page.goto('/accessibility');
  await expect(page.getByText('32 of 32 pairs meet their minimum')).toBeVisible();
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Color role' }).selectOption('foreground');
  await page.getByRole('spinbutton', { name: 'Lightness' }).fill('0.97');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.goto('/accessibility');
  await expect(page.getByText(/\d+ of 32 pairs meet their minimum/)).not.toHaveText('32 of 32 pairs meet their minimum');
  await expect(page.getByText('A failing theme is not marked as verified.')).toBeVisible();
  await expect(table.getByRole('row', { name: /Light Text on background/ })).toContainText('Below minimum');
});

test('each section shows its own error with Retry, and the others keep working', async ({ page }) => {
  let failed = false;
  await page.route('**/api/components?*', route => { if (!failed) { failed = true; return route.fulfill({ status: 503, json: { error: { code: 'DEMO_ERROR', message: 'Components are temporarily unavailable.' } } }); } return route.continue(); });
  await page.goto('/accessibility');
  await expect(page.getByText('Components are temporarily unavailable.')).toBeVisible();
  // Contrast and sample results are unaffected.
  await expect(page.getByText(/pairs meet their minimum/)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Accessibility results in the demo reports table' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('region', { name: 'Component review evidence table' })).toBeVisible();
});

test('each section shows its own empty state in the empty scenario, and contrast still shows', async ({ page }) => {
  await page.goto('/accessibility?scenario=empty');
  await expect(page.getByRole('heading', { name: 'No components to review' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No demo reports' })).toBeVisible();
  await expect(page.getByText(/pairs meet their minimum/)).toBeVisible();
  await page.goto('/accessibility?scenario=error');
  await expect(page.getByRole('button', { name: 'Retry' })).toHaveCount(2);
});

test('fits 320px and 1280px with no serious axe findings', async ({ page }) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/accessibility');
    await expect(page.getByRole('region', { name: 'Component review evidence table' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(serious).toEqual([]);
  }
});
