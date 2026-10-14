/* eslint-disable @typescript-eslint/no-explicit-any -- these tests navigate downloaded JSON documents */
import { test, expect } from '@playwright/test';

test('tokens follow the applied theme, filter, mark the mode in effect, and copy values', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/system/tokens');
  await expect(page.getByRole('heading', { name: 'Tokens', exact: true })).toBeVisible();
  await expect(page.locator('li#color\\.primary')).toBeVisible();
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

test('design token downloads follow the applied theme, validate, and list exclusions honestly', async ({ page }) => {
  await page.goto('/system/tokens');
  await expect(page.getByRole('heading', { name: 'Download design tokens' })).toBeVisible();
  await expect(page.getByText('Design Tokens Format Module 2025.10')).toBeVisible();
  await expect(page.getByText('Style Dictionary')).toBeVisible();
  await expect(page.getByText('No tokens are excluded.')).toBeVisible();

  const read = async (name: string) => {
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name }).click()]);
    const path = await download.path();
    const { readFileSync } = await import('node:fs');
    return { filename: download.suggestedFilename(), json: JSON.parse(readFileSync(path, 'utf8')) as Record<string, any> };
  };
  const light = await read('Download light tokens');
  expect(light.filename).toBe('seeyesyes.light.tokens.json');
  const dark = await read('Download dark tokens');
  expect(dark.filename).toBe('seeyesyes.dark.tokens.json');
  expect(light.json.color.primary.$type).toBe('color');
  expect(light.json.color.primary.$value.colorSpace).toBe('oklch');
  expect(light.json.color.primary.$value).not.toEqual(dark.json.color.primary.$value);
  expect(light.json.radius.control.$value).toEqual(dark.json.radius.control.$value);
  const notes = await read('Download export notes');
  expect(notes.filename).toBe('seeyesyes.export-notes.json');
  expect(notes.json).toMatchObject({ format: 'Design Tokens Format Module 2025.10', exclusions: [] });

  // A draft changes nothing; applying it changes the files.
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.goto('/system/tokens');
  expect((await read('Download light tokens')).json.radius.control.$value).toEqual({ value: 0.5, unit: 'rem' });
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.goto('/system/tokens');
  const applied = await read('Download light tokens');
  expect(applied.json.radius.control.$value).toEqual({ value: 1, unit: 'rem' });
  expect((await read('Download export notes')).json).toMatchObject({ themeId: 'custom', basedOnThemeId: 'default' });
});
