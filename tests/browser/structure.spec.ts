import { revealPreviews } from './helpers';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop navigation, page title, headings, breadcrumbs, and skip target agree', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page).toHaveTitle('Overview — SeeYesYes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Overview');
  await expect(page.getByRole('navigation', { name: 'Workspace', exact: true }).getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('navigation', { name: 'Breadcrumbs' }).locator('[aria-current=page]')).toHaveText('Overview');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeHidden();
});

test('mobile drawer contains focus, restores it on Escape, and closes into a selected destination', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/internal-checks/structure');
  const trigger = page.getByRole('button', { name: 'Open navigation', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Fixture workspace' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.closest('#structure-scope') !== null)).toBe(true);
  const close = dialog.getByRole('button', { name: 'Close navigation' });
  await close.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link', { name: 'Settings' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('link', { name: 'Settings' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('#settings')).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await expect(page.getByRole('navigation', { name: 'Breadcrumbs' }).locator('[aria-current=page]')).toHaveText('Settings');
  await trigger.click();
  await expect(dialog.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
  await close.click();
  await expect(trigger).toBeFocused();
});

test('table preserves native headers, empty text, and contained keyboard scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/internal-checks/structure');
  const table = page.getByRole('table', { name: 'Invoice report' });
  await expect(table.getByRole('columnheader')).toHaveCount(4);
  await expect(table.getByRole('rowheader')).toHaveText('INV-104');
  await expect(table.getByRole('rowheader')).toHaveAttribute('scope', 'row');
  await expect(table.getByRole('columnheader').first()).toHaveAttribute('scope', 'col');
  await expect(page.getByRole('table', { name: 'Archived invoices' })).toContainText('No rows to show.');
  const region = page.getByRole('region', { name: 'Invoice report table' });
  expect(await region.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    if (await region.evaluate(element => element === document.activeElement)) break;
  }
  await expect(region).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('navigation and tables fit mobile and desktop in both appearances', async ({ page }) => {
  const evidence = process.env.SEEYESYES_EVIDENCE_DIR ?? 'test-results';
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await revealPreviews(page);
      await page.getByRole('table', { name: 'Recent invoices' }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${evidence}/table-${colorScheme}-${width}.png` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => scrollTo(0, 0));
      if (width === 320) {
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        await expect(page.getByRole('dialog', { name: 'Workspace', exact: true })).toBeVisible();
      }
      await page.screenshot({ path: `${evidence}/navigation-${colorScheme}-${width}.png` });
    }
  }
});
