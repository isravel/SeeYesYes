import { test, expect } from '@playwright/test';
import { registry, defaultTheme } from '@/lib/data/registry';
import { createPersistenceEnvelope, SETTINGS_STORAGE_KEY } from '@/lib/theme/persistence';

test('validated saved theme is applied before hydration using the current appearance', async ({ page }) => {
  const settings = { settingsVersion: 1 as const, theme: defaultTheme, appearance: 'dark' as const };
  const envelope = createPersistenceEnvelope(settings, 7, registry);
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: SETTINGS_STORAGE_KEY, value: JSON.stringify(envelope),
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-appearance', 'dark');
  await expect.poll(() => root.evaluate(element => element.style.getPropertyValue('--sys-color-primary'))).toBe('oklch(0.8 0.1 264 / 1)');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  await expect(root).toHaveAttribute('data-appearance', 'dark');
});
