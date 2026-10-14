import { test, expect } from '@playwright/test';
import { registry } from '@/lib/data/registry';

test('rules list every rule with examples, applicability, and an honest auto-fix note', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/system/rules');
  await expect(page.getByRole('heading', { name: 'Rules', exact: true })).toBeVisible();
  await expect(page.locator('li.card, ul > li[id]').first()).toBeVisible();
  for (const rule of registry.rules) {
    const card = page.locator(`li[id="${rule.id}"]`);
    await expect(card).toBeVisible();
    await expect(card).toContainText(rule.description);
    await expect(card).toContainText(rule.severity);
    await expect(card).toContainText('Auto-fix unavailable in Phase 1.');
    const bad = registry.examples.find(e => e.id === rule.violationExampleId)!;
    const good = registry.examples.find(e => e.id === rule.correctExampleId)!;
    await expect(card.getByLabel(`${rule.id} violation code`)).toContainText(bad.code.split('\n')[0]);
    await expect(card.getByLabel(`${rule.id} corrected code`)).toContainText(good.code.split('\n')[0]);
  }
  await expect(page.locator('li[id="avoid-custom-button"]').getByRole('link', { name: 'Button' })).toHaveAttribute('href', '/components/button');
  await expect(page.locator('li[id="wcag-contrast"]')).toContainText('Applies to: the whole system');

  const rule = registry.rules[0];
  await page.locator(`li[id="${rule.id}"]`).getByRole('button', { name: `Copy ${rule.id} suggested fix` }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(rule.suggestedFix);
});

test('category and severity filters combine, and an empty result recovers', async ({ page }) => {
  await page.goto('/system/rules');
  await expect(page.locator('li[id="wcag-contrast"]')).toBeVisible();
  await page.getByRole('combobox', { name: 'Category' }).selectOption('accessibility');
  await expect(page.locator('li[id="wcag-contrast"]')).toBeVisible();
  await expect(page.locator('li[id="avoid-custom-button"]')).toHaveCount(0);
  const accessibility = registry.rules.filter(r => r.category === 'accessibility');
  await expect(page.getByRole('status').first()).toHaveText(`${accessibility.length} of ${registry.rules.length} rules`);
  await page.getByRole('combobox', { name: 'Severity' }).selectOption('info');
  await expect(page.getByRole('heading', { name: 'No rules match' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(page.getByRole('status').first()).toHaveText(`${registry.rules.length} rules`);
  await page.getByRole('combobox', { name: 'Severity' }).selectOption('error');
  for (const rule of registry.rules) await expect(page.locator(`li[id="${rule.id}"]`)).toHaveCount(rule.severity === 'error' ? 1 : 0);
});

test('component detail links its rules to the Rules screen', async ({ page }) => {
  await page.goto('/components/button');
  await page.locator('section[aria-labelledby="rules-heading"]').getByRole('link', { name: 'avoid-custom-button' }).click();
  await expect(page).toHaveURL(/\/system\/rules#avoid-custom-button$/);
  await expect(page.locator('li[id="avoid-custom-button"]')).toBeVisible();
});

test('the registry request waits for rules, and its failure keeps the list with a retry', async ({ page }) => {
  let failed = false;
  await page.route('**/api/registry?*', route => { if (!failed) { failed = true; return route.fulfill({ status: 503, json: { error: { code: 'DEMO_ERROR', message: 'Examples are temporarily unavailable.' } } }); } return route.continue(); });
  await page.goto('/system/rules');
  await expect(page.getByText('Examples did not load')).toBeVisible();
  await expect(page.locator('li[id="wcag-contrast"]')).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByLabel('wcag-contrast violation code')).toBeVisible();
});
