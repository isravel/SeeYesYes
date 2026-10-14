import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupCommands } from '@/lib/docs/getting-started';

test('every step is present, the commands copy, and the example really runs', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/getting-started');
  for (const heading of ['1. Run it locally', '2. Set a theme', '3. Use a component', '4. How it is wired into the app', '5. Export context for an AI agent']) await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
  await expect(page.getByText('This is a local prototype')).toBeVisible();
  await expect(page.getByText('No package is published')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Future package workflow/ })).toContainText('Not available yet');

  for (const { command } of setupCommands) {
    await page.getByRole('button', { name: `Copy command ${command}` }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
  }

  // The live example is the real Button with its real behavior.
  const example = page.locator('section[aria-labelledby="use-heading"]');
  await example.getByRole('button', { name: 'Save settings' }).click();
  await expect(example.locator('span[role="status"]', { hasText: 'Settings saved for this example.' })).toBeVisible();
  await expect(example.getByLabel('Button example code', { exact: true })).toContainText('import { Button } from "@/components/ui/button";');
  await example.getByRole('button', { name: 'Copy Button example code' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('<Button');
});

test('every link on the page leads somewhere real, including the context export step', async ({ page, request }) => {
  await page.goto('/getting-started');
  const hrefs = await page.locator('main a[href^="/"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')!))]);
  expect(hrefs).toEqual(expect.arrayContaining(['/system/theme', '/system/tokens', '/playground', '/components', '/ai/context', '/llms.txt', '/llms-full.txt']));
  for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
  await page.locator('section[aria-labelledby="context-heading"]').getByRole('link', { name: 'AI Context' }).click();
  await expect(page).toHaveURL(/\/ai\/context$/);
  await expect(page.getByRole('region', { name: 'Agent instructions' })).toBeVisible();
});

test('makes no claim about a package, installer, or hosted site that exists', async ({ page }) => {
  await page.goto('/getting-started');
  const text = (await page.locator('main').innerText()).toLowerCase();
  for (const claim of ['npm install seeyesyes', 'npm i seeyesyes', 'npx seeyesyes', 'pnpm add', 'yarn add', 'cdn.', 'deployed at']) expect(text).not.toContain(claim);
  await expect(page.getByText(/no package is published/i)).toBeVisible();
});

test('fits narrow and wide viewports in both appearances with no serious axe findings', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/getting-started');
      await expect(page.getByRole('heading', { level: 1, name: 'Getting started' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${colorScheme} ${width}`).toBeLessThanOrEqual(width);
    }
  }
  const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map(v => v.id)).toEqual([]);
});
