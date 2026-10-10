import { test, expect } from '@playwright/test';

test('theme editor changes one mode at a time and applies palette suggestions explicitly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/system/theme');
  await expect(page.getByRole('heading', { name: 'Theme editor' })).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/M3/M3.2/theme-editor.png', fullPage: true });
  await page.getByRole('combobox', { name: 'Color role' }).selectOption('foreground');

  const lightness = page.getByRole('spinbutton', { name: 'Lightness' });
  await lightness.fill('0.31');
  await expect(lightness).toHaveValue('0.31');
  await expect(page.getByRole('status')).toContainText('Foreground light value updated');

  await page.getByRole('button', { name: 'Dark colors' }).click();
  await expect(lightness).toHaveValue('0.95');
  await lightness.fill('0.84');
  await page.getByRole('button', { name: 'Light colors' }).click();
  await expect(lightness).toHaveValue('0.31');

  await page.getByRole('button', { name: 'Dark colors' }).click();
  await page.getByRole('combobox', { name: 'Palette suggestion' }).selectOption('neutral-900');
  await page.getByRole('button', { name: 'Use suggestion for dark' }).click();
  await expect(page.getByRole('status')).toContainText('copied into Foreground for dark only');
  await expect(lightness).toHaveValue('0.22');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('combobox', { name: 'Preview appearance' }).selectOption('system');
  await expect(page.locator('[data-theme-scope]').first()).toHaveAttribute('data-appearance', 'dark');
});
