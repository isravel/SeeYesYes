import { test, expect, type Page } from '@playwright/test';
import { registry } from '@/lib/data/registry';

/** A15: core journeys run with no console errors, page errors, or hydration errors (production build). */
function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', message => { if (message.type() === 'error' || (message.type() === 'warning' && /hydrat|did not match|Warning:/i.test(message.text()))) problems.push(`${message.type()}: ${message.text()}`); });
  page.on('pageerror', error => problems.push(`pageerror: ${error.message}`));
  return problems;
}

test('visiting every view, in both appearances, logs no errors', async ({ page }) => {
  test.setTimeout(300_000);
  const problems = watch(page);
  const paths = ['/', '/getting-started', '/system/theme', '/system/tokens', '/system/rules', '/components', '/layouts', '/ai/context', '/accessibility', '/validation', '/playground', '/docs', '/docs/concepts', ...registry.components.map(c => `/components/${c.id}`)];
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const path of paths) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
      await page.waitForTimeout(150);
    }
  }
  expect(problems).toEqual([]);
});

test('the core journeys log no errors: configure and apply, export, search, and recover', async ({ page, context }) => {
  test.setTimeout(120_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const problems = watch(page);

  // Configure, apply, and persist the theme, then reload with the saved settings.
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('combobox', { name: 'Workspace appearance' }).selectOption('dark');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Export context and agent instructions.
  await page.goto('/ai/context');
  await page.getByRole('radio', { name: 'Task', exact: true }).check();
  await page.getByRole('checkbox', { name: /^Button/ }).check();
  await page.getByRole('button', { name: 'Copy Markdown context' }).click();
  await page.getByRole('button', { name: 'Copy AGENTS.md snippet' }).click();

  // Explore: tokens, components, docs search, a dialog, and the playground.
  await page.goto('/system/tokens');
  await page.getByRole('searchbox', { name: 'Search tokens' }).fill('radius');
  await page.goto('/components/dialog');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await page.keyboard.press('Escape');
  await page.goto('/docs');
  await page.getByRole('searchbox', { name: 'Search documentation' }).fill('apply');
  await page.goto('/playground');
  await page.getByRole('combobox', { name: 'Density' }).selectOption('compact');

  // Mock recovery: a failed request, then Retry.
  let failed = false;
  await page.route('**/api/rules?*', route => { if (!failed) { failed = true; return route.fulfill({ status: 503, json: { error: { code: 'DEMO_ERROR', message: 'Rules are temporarily unavailable.' } } }); } return route.continue(); });
  await page.goto('/system/rules');
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('li[id="wcag-contrast"]')).toBeVisible();

  // A failing resource the app itself requested is a real problem; the deliberately failed API call is the only expected one.
  expect(problems.filter(problem => !/503/.test(problem))).toEqual([]);
});
