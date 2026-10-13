import { test, expect } from '@playwright/test';

test('tokens follow the applied theme, filter, mark the mode in effect, and copy values', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/system/tokens');
  await expect(page.getByRole('heading', { name: 'Tokens', exact: true })).toBeVisible();
  const total = await page.getByRole('listitem').filter({ has: page.getByRole('heading') }).count();
  expect(total).toBeGreaterThan(20);
  await expect(page.getByRole('status').first()).toHaveText(`${total} tokens`);

  // Mode-dependent tokens show both values and mark the one in effect.
  const primary = page.locator('li#color\\.primary');
  await expect(primary).toContainText('Light (in effect)');
  await expect(primary).toContainText('Dark');
  await expect(primary).not.toContainText('Dark (in effect)');

  // Search, category, and kind filters.
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('radius');
  await expect(page.locator('li#radius\\.control')).toBeVisible();
  await expect(page.locator('li#color\\.primary')).toHaveCount(0);
  await expect(page.getByRole('status').first()).toContainText(`of ${total} tokens`);
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('zzzz-none');
  await expect(page.getByRole('heading', { name: 'No tokens match' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(page.getByRole('status').first()).toHaveText(`${total} tokens`);
  await page.getByRole('combobox', { name: 'Category' }).selectOption('color');
  await expect(page.locator('li#radius\\.control')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Kind' }).selectOption('primitive');
  await page.getByRole('button', { name: 'Clear filters' }).click();

  // Copy value and variable.
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('radius.control');
  const card = page.locator('li#radius\\.control');
  await card.getByRole('button', { name: 'Copy radius.control CSS variable' }).click();
  await expect(card.getByText('Copied to clipboard.').first()).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('--sys-radius-control');
  const value = (await card.locator('dd code').first().textContent())!;
  await card.getByRole('button', { name: 'Copy radius.control value' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(value);

  // An OS change under `system` appearance moves the in-effect marker.
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('color.primary');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('li#color\\.primary')).toContainText('Dark (in effect)');
  await expect(page.locator('li#color\\.primary')).not.toContainText('Light (in effect)');
});

test('applied changes show up on Tokens, drafts do not, and the draft survives navigating there', async ({ page }) => {
  await page.goto('/system/tokens');
  await page.evaluate(() => { (window as unknown as { marker: string }).marker = 'same-document'; });
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('radius.control');
  const value = page.locator('li#radius\\.control dd code').first();
  const before = (await value.textContent())!;

  // An unsaved draft is not an applied change; client-side navigation keeps the draft.
  await page.getByRole('link', { name: 'Edit the theme' }).click();
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.goBack();
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('radius.control');
  await expect(value).toHaveText(before);
  expect(await page.evaluate(() => (window as unknown as { marker?: string }).marker)).toBe('same-document');
  await page.goForward();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).toHaveValue('curvy');

  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.goBack();
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('radius.control');
  await expect(value).toHaveText('1rem');
  await expect(page.getByText('custom, based on')).toBeVisible();
});
