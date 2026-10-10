import { test, expect } from '@playwright/test';

test('theme controls update shared settings and contract-approved component defaults', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/system/theme');
  await page.screenshot({ path: 'docs/evidence/M3/M3.3/theme-controls.png', fullPage: true });

  await page.getByRole('combobox', { name: 'Type scale' }).selectOption('large');
  await expect(page.getByRole('status').last()).toContainText('Typography scale updated');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await page.getByRole('combobox', { name: 'Shadow scale' }).selectOption('defined');
  await page.getByRole('combobox', { name: 'Surface effect' }).selectOption('subtle-depth');
  await page.getByRole('combobox', { name: 'Motion' }).selectOption('none');

  const variant = page.getByRole('combobox', { name: 'Button variant default' });
  await expect(variant.locator('option')).toHaveCount(3);
  await variant.selectOption('ghost');
  await expect(page.getByRole('button', { name: 'Example action' })).toHaveAttribute('data-variant', 'ghost');
  await expect(page.getByRole('status').last()).toContainText('button variant default updated');

  await page.setViewportSize({ width: 320, height: 800 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
