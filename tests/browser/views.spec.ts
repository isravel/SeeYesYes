import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** The thirteen views. Component Detail is a dynamic route, represented by Button. */
const views = [
  { name: 'Overview', path: '/', title: 'Overview', h1: 'Overview', nav: 'Overview' },
  { name: 'Getting Started', path: '/getting-started', title: 'Getting Started', h1: 'Getting started', nav: 'Getting started' },
  { name: 'Theme', path: '/system/theme', title: 'Theme', h1: 'Theme editor', nav: 'Theme' },
  { name: 'Tokens', path: '/system/tokens', title: 'Tokens', h1: 'Tokens', nav: 'Tokens' },
  { name: 'Components', path: '/components', title: 'Components', h1: 'Components', nav: 'Components' },
  { name: 'Component Detail', path: '/components/button', title: 'Button', h1: 'Button', nav: 'Components' },
  { name: 'Layouts', path: '/layouts', title: 'Layouts', h1: 'Layouts', nav: 'Layouts' },
  { name: 'AI Context', path: '/ai/context', title: 'AI Context', h1: 'AI context', nav: 'AI context' },
  { name: 'Rules', path: '/system/rules', title: 'Rules', h1: 'Rules', nav: 'Rules' },
  { name: 'Accessibility', path: '/accessibility', title: 'Accessibility', h1: 'Accessibility', nav: 'Accessibility' },
  { name: 'Validation', path: '/validation', title: 'Validation', h1: 'Validation', nav: 'Validation' },
  { name: 'Playground', path: '/playground', title: 'Playground', h1: 'Playground', nav: 'Playground' },
  { name: 'Documentation', path: '/docs', title: 'Documentation', h1: 'Documentation', nav: 'Documentation' },
];
const serious = async (page: Page) => (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => v.id);

test('every view has one title, one h1, one main landmark, a marked current destination, and a working skip link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const titles = new Set<string>();
  for (const view of views) {
    await page.goto(view.path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(view.h1);
    await expect(page.getByRole('main')).toHaveCount(1);
    const title = await page.title();
    expect(title, view.name).toContain(view.title);
    expect(title.endsWith('SeeYesYes')).toBe(true);
    titles.add(title);
    const nav = page.getByRole('navigation', { name: 'Workspace', exact: true });
    await expect(nav.getByRole('link', { name: view.nav, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' }), view.name).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main'), view.name).toBeFocused();
  }
  expect(titles.size).toBe(views.length);
});

test('every view fits narrow and wide viewports in both appearances with no serious accessibility findings', async ({ page }) => {
  test.setTimeout(180_000);
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of views) {
        await page.goto(view.path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth), `${colorScheme} ${width} ${view.name}`).toBeLessThanOrEqual(width);
      }
    }
  }
  await page.emulateMedia({ colorScheme: 'light' });
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const view of views) {
    await page.goto(view.path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
    expect(await serious(page), view.name).toEqual([]);
  }
});

test('the navigation reaches every view, and the mobile drawer contains focus and restores it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  for (const view of views.filter(v => v.name !== 'Component Detail' && v.name !== 'Overview')) {
    await page.getByRole('navigation', { name: 'Workspace', exact: true }).getByRole('link', { name: view.nav, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${view.path.replaceAll('/', '\\/')}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(view.h1);
  }
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/system/rules');
  const open = page.getByRole('button', { name: 'Open navigation', exact: true });
  await open.click();
  const dialog = page.getByRole('dialog', { name: 'Workspace', exact: true });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 6; i += 1) { await page.keyboard.press('Tab'); expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(open).toBeFocused();
  await open.click();
  await page.getByRole('dialog', { name: 'Workspace', exact: true }).getByRole('link', { name: 'Tokens', exact: true }).click();
  await expect(page).toHaveURL(/\/system\/tokens$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tokens');
});

test('unknown routes are a 404 with recovery inside the shell', async ({ page }) => {
  for (const path of ['/nope', '/system/nope', '/components/not-a-component', '/docs/not-an-article', '/ai/nope']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page.getByText('We could not find that page')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse components' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Workspace', exact: true })).toBeVisible();
    expect(await serious(page), path).toEqual([]);
  }
  await page.goto('/nope');
  await page.getByRole('link', { name: 'Browse components' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Components');
});

test('very long content wraps instead of overflowing', async ({ page }) => {
  const long = 'x'.repeat(400);
  for (const [path, box, state] of [['/system/tokens', 'Search tokens', 'No tokens match'], ['/components', 'Search components', 'No components match'], ['/docs', 'Search documentation', 'No documentation matches']] as const) {
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await page.getByRole('searchbox', { name: box }).fill(long);
      await expect(page.getByRole('heading', { name: state })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} ${width}`).toBeLessThanOrEqual(width);
    }
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/layouts');
  await page.locator('#layout-settings').getByRole('textbox', { name: 'Display name' }).fill(long);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('every copy action puts something useful on the clipboard and reports it', async ({ page, context }) => {
  test.setTimeout(120_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const routes = ['/getting-started', '/components/button', '/system/tokens', '/system/rules', '/ai/context', '/docs/setup', '/playground'];
  let clicked = 0;
  for (const path of routes) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
    const labels = await page.getByRole('button', { name: /^Copy/ }).evaluateAll(buttons => buttons.slice(0, 5).map(button => button.getAttribute('aria-label') ?? button.textContent ?? ''));
    expect(labels.length, path).toBeGreaterThan(0);
    for (const label of labels) {
      await page.evaluate(() => navigator.clipboard.writeText(''));
      await page.getByRole('button', { name: label, exact: true }).first().click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText()), { message: `${path} ${label}` }).not.toBe('');
      await expect(page.locator('[role="status"]').filter({ hasText: /cop(ied|y)/i }).first(), `${path} ${label}`).toBeVisible();
      clicked += 1;
    }
  }
  expect(clicked).toBeGreaterThan(20);
});
