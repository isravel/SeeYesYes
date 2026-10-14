import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const scopeVar = (page: Page, selector: string, name: string) => page.locator(selector).evaluate((el, n) => getComputedStyle(el).getPropertyValue(n).trim(), name);
const workspaceVar = (page: Page, name: string) => page.evaluate(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test('Playground starts from the applied theme, changes only its own preview, and resets', async ({ page }) => {
  await page.goto('/playground');
  await expect(page.getByText('Playground only').first()).toBeVisible();
  await expect(page.getByText('Matches the applied theme.')).toBeVisible();
  const appliedRadius = await workspaceVar(page, '--sys-radius-control');
  expect(await scopeVar(page, '#playground-preview', '--sys-radius-control')).toBe(appliedRadius);
  const storageBefore = await page.evaluate(() => JSON.stringify({ ...localStorage }));

  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await page.getByRole('combobox', { name: 'Appearance' }).selectOption('dark');
  await expect(page.getByText('Playground settings differ from the applied theme.')).toBeVisible();
  expect(await scopeVar(page, '#playground-preview', '--sys-radius-control')).toBe('1rem');
  await expect(page.locator('#playground-preview')).toHaveAttribute('data-appearance', 'dark');
  // Nothing outside the preview changed, and nothing was saved.
  expect(await workspaceVar(page, '--sys-radius-control')).toBe(appliedRadius);
  await expect(page.locator('html')).not.toHaveAttribute('data-appearance', 'dark');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(storageBefore);

  await page.getByRole('button', { name: 'Reset to applied theme' }).click();
  await expect(page.getByText('Playground reset to your applied theme.')).toBeVisible();
  expect(await scopeVar(page, '#playground-preview', '--sys-radius-control')).toBe(appliedRadius);
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).toHaveValue('soft');
});

test('settings survive client navigation but not a refresh, and never reach the Theme draft or applied theme', async ({ page }) => {
  await page.goto('/playground');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('link', { name: 'Edit the real theme' }).click();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).not.toHaveValue('curvy');
  await expect(page.getByText('No unsaved changes.')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).toHaveValue('curvy');
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).not.toHaveValue('curvy');
});

test('the Playground follows the applied theme until you override a setting', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Density' }).selectOption('spacious');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.goto('/playground');
  await expect(page.getByRole('combobox', { name: 'Density' })).toHaveValue('spacious');
  await expect(page.getByText('Starts from your applied theme (custom)')).toBeVisible();
});

test('component, variant, and state controls change the real preview and its code', async ({ page }) => {
  await page.goto('/playground');
  const stage = page.getByTestId('playground-stage');
  await expect(stage.getByRole('button', { name: 'Save changes' })).toHaveAttribute('data-variant', 'primary');
  await page.getByRole('combobox', { name: 'Button variant' }).selectOption('destructive');
  await expect(stage.getByRole('button', { name: 'Save changes' })).toHaveAttribute('data-variant', 'destructive');
  await page.getByRole('combobox', { name: 'Button state' }).selectOption('disabled');
  await expect(stage.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await expect(page.getByLabel('Playground code', { exact: true })).toContainText('<Button variant="destructive"');
  await page.getByRole('combobox', { name: 'Component' }).selectOption('badge');
  await page.getByRole('combobox', { name: 'Badge tone' }).selectOption('warning');
  await expect(page.getByLabel('Playground code', { exact: true })).toContainText('<Badge tone="warning">');
  await expect(stage.getByText('Ready')).toBeVisible();
  // Component settings in the preview follow the Playground's own theme.
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('sharp');
  expect(await scopeVar(page, '#playground-preview', '--sys-radius-control')).toBe('0rem');
});

test('overlays portal into the Playground scope and inherit its settings, not the workspace', async ({ page }) => {
  await page.goto('/playground');
  const workspaceRadius = await workspaceVar(page, '--sys-radius-control');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('combobox', { name: 'Component' }).selectOption('dialog');
  await page.getByRole('button', { name: 'Open settings' }).click();
  const dialog = page.getByRole('dialog', { name: 'Preview settings' });
  await expect(dialog).toBeVisible();
  const scope = await dialog.evaluate(el => el.closest('[data-theme-scope]')?.id);
  expect(scope).toBe('playground-preview');
  expect(await dialog.evaluate(el => getComputedStyle(el).getPropertyValue('--sys-radius-control').trim())).toBe('1rem');
  expect(await workspaceVar(page, '--sys-radius-control')).toBe(workspaceRadius);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Component' }).selectOption('dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  expect(await menu.evaluate(el => el.closest('[data-theme-scope]')?.id)).toBe('playground-preview');
  await page.keyboard.press('Escape');

  await page.getByRole('combobox', { name: 'Component' }).selectOption('tooltip');
  await page.getByRole('button', { name: 'Save preview' }).focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  expect(await tooltip.evaluate(el => el.closest('[data-theme-scope]')?.id)).toBe('playground-preview');
});

test('fits narrow and wide viewports in both appearances with no serious axe findings', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/playground');
      await expect(page.getByTestId('playground-stage')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${colorScheme} ${width}`).toBeLessThanOrEqual(width);
    }
  }
  const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map(v => v.id)).toEqual([]);
});
