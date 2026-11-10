import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { revealPreviews } from './helpers';

/** Both the Overview preview and the Playground render the same menu: groups, separators, links and a destructive action. */
async function expectFullExample(page: Page, name: string) {
  const menu = page.getByRole('menu', { name });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('group', { name: 'File' })).toBeVisible();
  await expect(menu.getByRole('group', { name: 'Help' })).toBeVisible();
  await expect(menu.getByRole('separator')).toHaveCount(2);
  const archive = menu.getByRole('menuitem', { name: 'Archive preview' });
  await expect(archive).toHaveAttribute('aria-disabled', 'true');
  const guide = menu.getByRole('menuitem', { name: 'Accessibility guide' });
  await expect(guide).toHaveAttribute('href', '/docs/accessibility');
  const external = menu.getByRole('menuitem', { name: /React Aria menu guide/ });
  await expect(external).toHaveAttribute('target', '_blank');
  await expect(external).toHaveAttribute('rel', /noopener/);
  await expect(external).toContainText('opens in a new tab');
  const destructive = menu.getByRole('menuitem', { name: 'Delete preview' });
  await expect(destructive).toHaveAttribute('data-tone', 'destructive');
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  return menu;
}

test('Overview preview shows groups, separators, links and a destructive action, and reports actions', async ({ page }) => {
  await page.goto('/');
  await revealPreviews(page);
  await page.getByRole('button', { name: 'Preview actions' }).click();
  const menu = await expectFullExample(page, 'Preview actions');
  await menu.getByRole('menuitem', { name: 'Delete preview' }).click();
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Nothing is deleted in this example' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preview actions' })).toBeFocused();
});

test('Overview preview link item navigates instead of reporting an action', async ({ page }) => {
  await page.goto('/');
  await revealPreviews(page);
  await page.getByRole('button', { name: 'Preview actions' }).click();
  await page.getByRole('menuitem', { name: 'Accessibility guide' }).click();
  await expect(page).toHaveURL(/\/docs\/accessibility$/);
});

test('Playground renders the same menu inside the preview scope', async ({ page }) => {
  await page.goto('/playground');
  await page.getByRole('combobox', { name: 'Component' }).selectOption('dropdown-menu');
  await page.getByRole('button', { name: 'Actions' }).click();
  const menu = await expectFullExample(page, 'Actions');
  expect(await menu.evaluate(el => el.closest('[data-theme-scope]')?.id)).toBe('playground-preview');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
});

test('Playground code shows the groups, links and destructive item', async ({ page }) => {
  await page.goto('/playground');
  await page.getByRole('combobox', { name: 'Component' }).selectOption('dropdown-menu');
  const code = page.locator('pre').filter({ hasText: '<DropdownMenu' });
  await expect(code).toContainText('type: "group"');
  await expect(code).toContainText('type: "separator"');
  await expect(code).toContainText('href: "/docs/accessibility"');
  await expect(code).toContainText('external: true');
  await expect(code).toContainText('destructive: true');
});
