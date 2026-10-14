import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registry } from '@/lib/data/registry';

const spacing = (page: Page, selector: string) => page.locator(selector).evaluate(el => getComputedStyle(el).getPropertyValue('--sys-spacing-stack').trim());
const workspaceSpacing = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sys-spacing-stack').trim());

test('all seven layouts render real primitives, each in its own theme scope with component links', async ({ page }) => {
  await page.goto('/layouts');
  await expect(page.getByRole('heading', { name: 'Layouts', exact: true })).toBeVisible();
  await expect(page.locator('li.card, ul > li[id]').first()).toBeVisible();
  for (const layout of registry.layouts) {
    const card = page.locator(`li[id="${layout.id}"]`);
    await expect(card.getByRole('heading', { level: 2, name: layout.title })).toBeVisible();
    await expect(card.locator(`#layout-${layout.id}[data-theme-scope]`)).toBeVisible();
    for (const id of layout.componentIds) {
      const name = registry.components.find(c => c.id === id)!.name;
      await expect(card.getByRole('link', { name, exact: true }).last()).toHaveAttribute('href', `/components/${id}`);
    }
  }
  await expect(page.locator('#layout-dashboard').getByRole('progressbar').first()).toBeVisible();
  await expect(page.locator('#layout-dense-data').getByRole('table')).toBeVisible();
  await expect(page.locator('#layout-settings').getByRole('switch')).toBeVisible();
});

test('density switches inside one preview without touching other previews or the workspace', async ({ page }) => {
  await page.goto('/layouts');
  const workspaceBefore = await workspaceSpacing(page);
  const otherBefore = await spacing(page, '#layout-settings');
  const before = await spacing(page, '#layout-dashboard');
  await page.getByRole('combobox', { name: 'Dashboard density' }).selectOption('compact');
  await expect.poll(() => spacing(page, '#layout-dashboard')).not.toBe(before);
  const compact = await spacing(page, '#layout-dashboard');
  await page.getByRole('combobox', { name: 'Dashboard density' }).selectOption('spacious');
  const spacious = await spacing(page, '#layout-dashboard');
  expect(parseFloat(spacious)).toBeGreaterThan(parseFloat(compact));
  expect(await spacing(page, '#layout-settings')).toBe(otherBefore);
  expect(await workspaceSpacing(page)).toBe(workspaceBefore);
  await page.getByRole('combobox', { name: 'Dashboard appearance' }).selectOption('dark');
  await expect(page.locator('#layout-dashboard')).toHaveAttribute('data-appearance', 'dark');
  await expect(page.locator('html')).not.toHaveAttribute('data-appearance', 'dark');
});

test('the interactive layouts respond locally and say nothing is stored', async ({ page }) => {
  await page.goto('/layouts');
  const split = page.locator('#layout-split-view');
  await split.getByRole('button', { name: 'Omar Haddad' }).click();
  await expect(split.getByRole('button', { name: 'Omar Haddad' })).toHaveAttribute('aria-pressed', 'true');
  await expect(split).toContainText('Builds the shared primitives.');

  const settings = page.locator('#layout-settings');
  await settings.getByRole('button', { name: 'Save changes' }).click();
  await expect(settings.getByRole('status')).toContainText('Saved in this preview only. Nothing is stored.');
  await settings.getByRole('textbox', { name: 'Display name' }).fill('Someone else');
  await expect(settings.getByRole('status')).toHaveText('');
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => !key.startsWith('seeyesyes:settings')))).toEqual([]);

  const dense = page.locator('#layout-dense-data');
  await expect(dense.getByRole('status')).toHaveText('6 of 6 invoices');
  await dense.getByRole('searchbox', { name: 'Search invoices' }).fill('globex');
  await expect(dense.getByRole('status')).toHaveText('1 of 6 invoices');
  await dense.getByRole('searchbox', { name: 'Search invoices' }).fill('zzz');
  await expect(dense.getByText('No invoices match.')).toBeVisible();
  await dense.getByRole('searchbox', { name: 'Search invoices' }).fill('');
  await dense.getByRole('combobox', { name: 'Status' }).selectOption('Overdue');
  await expect(dense.getByRole('status')).toHaveText('1 of 6 invoices');

  await page.locator('#layout-detail-view').getByRole('tab', { name: 'Tasks' }).click();
  await expect(page.locator('#layout-detail-view').getByRole('tabpanel')).toContainText('14 open tasks');
});

test('previews adapt to their own width and the page fits narrow and wide viewports in both appearances', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/layouts');
      await expect(page.locator('#layout-page-shell')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${colorScheme} ${width}`).toBeLessThanOrEqual(width);
    }
  }
  // At a narrow width the sidebar and split panes stack.
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto('/layouts');
  const [list, detail] = await Promise.all([page.locator('#layout-split-view ul').boundingBox(), page.locator('#layout-split-view').getByRole('heading', { level: 3 }).boundingBox()]);
  expect(detail!.y).toBeGreaterThan(list!.y + list!.height - 1);
});

test('layouts have no serious axe findings in both densities', async ({ page }) => {
  await page.goto('/layouts');
  for (const density of ['compact', 'spacious']) {
    for (const layout of registry.layouts) await page.getByRole('combobox', { name: `${layout.title} density` }).selectOption(density);
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map(v => `${v.id}: ${v.nodes[0]?.html.slice(0, 80)}`)).toEqual([]);
  }
});
