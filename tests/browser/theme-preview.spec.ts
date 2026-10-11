import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test('draft preview isolates components, appearance, and dialog portals from the workspace', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/system/theme');
  const preview = page.locator('#theme-editor-preview');
  const workspaceVariables = await page.locator('html').getAttribute('style');
  const editorButton = page.getByRole('button', { name: 'Light colors', exact: true });
  const editorBefore = await editorButton.evaluate(element => ({ radius: getComputedStyle(element).borderRadius, padding: getComputedStyle(element).paddingInline, background: getComputedStyle(element).backgroundColor }));
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('sharp');
  await page.getByRole('combobox', { name: 'Density', exact: true }).selectOption('compact');
  await page.getByRole('combobox', { name: 'Button variant default' }).selectOption('ghost');
  await page.getByRole('combobox', { name: 'Input size default' }).selectOption('small');
  await page.getByRole('spinbutton', { name: 'Lightness' }).fill('0.55');
  await expect(preview.getByRole('button', { name: 'Example action' })).toHaveAttribute('data-variant', 'ghost');
  await expect(preview.getByRole('textbox', { name: 'Display name' })).toHaveAttribute('data-size', 'small');
  expect(await preview.getByRole('button', { name: 'Example action' }).evaluate(element => getComputedStyle(element).borderRadius)).toBe('0px');
  const primary = () => preview.evaluate(element => getComputedStyle(element).getPropertyValue('--sys-color-primary').trim());
  await expect.poll(primary).toBe('oklch(0.55 0.16 264 / 1)');
  const swatch = preview.getByText('Primary', { exact: true });
  const lightSwatch = await swatch.evaluate(element => getComputedStyle(element).backgroundColor);
  await page.getByRole('combobox', { name: 'Preview appearance' }).selectOption('dark');
  await expect(preview).toHaveAttribute('data-appearance', 'dark');
  expect(await swatch.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(lightSwatch);
  expect(await page.locator('html').getAttribute('style')).toBe(workspaceVariables);
  expect(await editorButton.evaluate(element => ({ radius: getComputedStyle(element).borderRadius, padding: getComputedStyle(element).paddingInline, background: getComputedStyle(element).backgroundColor }))).toEqual(editorBefore);

  await preview.getByRole('textbox', { name: 'Display name' }).fill('Jamie Lee');
  await preview.getByRole('button', { name: 'Save sample profile' }).click();
  await expect(preview.getByText('Sample profile saved for Jamie Lee.')).toBeVisible();
  await expect(preview.getByRole('rowheader', { name: 'Jamie Lee' })).toBeVisible();
  await preview.getByRole('button', { name: 'Example action' }).click();
  await preview.getByRole('tab', { name: 'Overview' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(preview.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
  await expect(preview.getByRole('tabpanel')).toContainText('1 example action run');

  const trigger = preview.getByRole('button', { name: 'Open preview dialog' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Preview dialog', exact: true });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.closest('[data-theme-scope]')?.id)).toBe('theme-editor-preview');
  expect(await dialog.evaluate(element => getComputedStyle(element).getPropertyValue('--sys-color-primary').trim())).toBe(await primary());
  await expect(dialog.getByRole('button', { name: 'Done with preview' })).toHaveAttribute('data-variant', 'ghost');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.locator('html').getAttribute('style')).toBe(workspaceVariables);
  await page.screenshot({ path: 'docs/evidence/M3/M3.4/theme-preview.png', fullPage: true });
});

test('theme preview and dialog fit mobile and desktop in both appearances', async ({ page }) => {
  await page.goto('/system/theme');
  for (const appearance of ['light', 'dark']) {
    await page.getByRole('combobox', { name: 'Preview appearance' }).selectOption(appearance);
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.getByRole('button', { name: 'Open preview dialog' }).click();
      const dialog = page.getByRole('dialog', { name: 'Preview dialog', exact: true });
      await expect(dialog).toBeVisible();
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
      await page.keyboard.press('Escape');
    }
  }
  await page.getByRole('combobox', { name: 'Preview appearance' }).selectOption('light');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});
