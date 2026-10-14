import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registry } from '@/lib/data/registry';

const counts = async (page: Page) => Object.fromEntries(await page.getByLabel('Demo result counts').locator('div').evaluateAll(els => els.map(el => [el.querySelector('dt')!.textContent, Number(el.querySelector('dd')!.textContent)])));
const sample = (page: Page, name: string) => page.getByRole('radio', { name, exact: true }).check();

test('every scenario is labeled as demo data and its counts follow the selected report', async ({ page }) => {
  await page.goto('/validation');
  await expect(page.getByRole('radio', { name: 'Mixed', exact: true })).toBeChecked();
  await expect(page.getByText('Demo results').first()).toBeVisible();
  await expect(page.getByText(/not a scan of any project/)).toBeVisible();
  expect(await counts(page)).toEqual({ passed: 4, info: 0, warning: 2, error: 2 });
  await sample(page, 'Clean');
  expect(await counts(page)).toEqual({ passed: 8, info: 0, warning: 0, error: 0 });
  await sample(page, 'Failing');
  expect(await counts(page)).toEqual({ passed: 0, info: 1, warning: 4, error: 3 });
  await expect(page.getByRole('status').first()).toHaveText(`${registry.rules.length} results`);
  // Nothing implies a real scanner.
  for (const label of [/run scan/i, /apply fix/i, /upload/i, /repository/i, /choose folder/i]) await expect(page.getByRole('button', { name: label })).toHaveCount(0);
});

test('status and category filters combine, with no-match recovery', async ({ page }) => {
  await page.goto('/validation');
  await sample(page, 'Failing');
  await page.getByRole('combobox', { name: 'Status' }).selectOption('error');
  await page.getByRole('combobox', { name: 'Category' }).selectOption('accessibility');
  await expect(page.getByRole('status').first()).toHaveText(`2 of ${registry.rules.length} results`);
  await expect(page.getByRole('button', { name: /wcag-contrast/ })).toBeVisible();
  await page.getByRole('combobox', { name: 'Category' }).selectOption('styling');
  await expect(page.getByRole('heading', { name: 'No results match' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(page.getByRole('status').first()).toHaveText(`${registry.rules.length} results`);
  // Counts stay with the report while filtering.
  await page.getByRole('combobox', { name: 'Status' }).selectOption('info');
  expect(await counts(page)).toEqual({ passed: 0, info: 1, warning: 4, error: 3 });
  await sample(page, 'Clean');
  await expect(page.getByRole('heading', { name: 'No results match' })).toBeVisible();
});

test('a result opens its rule, example, and a copyable suggested fix', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/validation');
  await sample(page, 'Failing');
  const rule = registry.rules.find(r => r.id === 'avoid-custom-button')!;
  const bad = registry.examples.find(e => e.id === rule.violationExampleId)!;
  await expect(page.getByLabel('Finding details')).toContainText('Select a result');
  await page.getByRole('button', { name: /avoid-custom-button/ }).click();
  const details = page.getByLabel('Finding details');
  await expect(details).toContainText('Demo result');
  await expect(details.getByRole('link', { name: 'avoid-custom-button' })).toHaveAttribute('href', '/system/rules#avoid-custom-button');
  await expect(details).toContainText(bad.title);
  await expect(details.getByLabel('Example code')).toContainText(bad.code.split('\n')[0]);
  await expect(details).toContainText('Auto-fix unavailable in Phase 1.');
  await details.getByRole('button', { name: 'Copy suggested fix' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(rule.suggestedFix);

  // A passing result shows the corrected example instead, and switching reports clears the selection.
  await sample(page, 'Clean');
  await page.getByRole('button', { name: /avoid-custom-button/ }).click();
  const good = registry.examples.find(e => e.id === rule.correctExampleId)!;
  await expect(page.getByLabel('Finding details')).toContainText(`Passing example: ${good.title}`);
  await sample(page, 'Failing');
  await expect(page.getByLabel('Finding details')).toContainText('Select a result');
});

test('the finding list is keyboard operable and the screen has no serious axe findings at 320px and 1280px', async ({ page }) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/validation');
    await sample(page, 'Failing');
    const first = page.getByRole('button', { name: /component-prefer-existing/ });
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Finding details')).toContainText('component-prefer-existing');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(serious).toEqual([]);
  }
});
