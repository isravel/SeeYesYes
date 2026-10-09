import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('feedback examples expose useful names, status, and recovery actions', async ({ page, context }) => {
  await page.goto('/');

  const loading = page.getByRole('status', { name: 'Loading team members' });
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(loading).toContainText('Checking the shared workspace.');

  const empty = page.getByRole('region', { name: 'No projects yet' });
  await expect(empty).toContainText('Create a project to keep related work together.');
  await empty.getByRole('button', { name: 'Create project' }).focus();
  await expect(empty.getByRole('button', { name: 'Create project' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Sample project created.' })).toBeVisible();

  const error = page.getByRole('region', { name: 'Small pieces. Clear intent.' }).getByRole('alert');
  await expect(error).toContainText('The preview could not reach the component registry.');
  await page.getByRole('button', { name: 'Retry', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Retry requested (1).' })).toBeVisible();

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy sample context' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Copied to clipboard.' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Component: Button');

  await page.getByRole('heading', { name: 'Component not found' }).scrollIntoViewIfNeeded();
  await page.getByRole('link', { name: 'Return to overview' }).focus();
  await expect(page.getByRole('link', { name: 'Return to overview' })).toBeFocused();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});

test('workspace and representative content fit the required widths in both appearances', async ({ page }) => {
  const evidence = process.env.SEEYESYES_EVIDENCE_DIR ?? 'test-results';
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 768, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const copy = page.getByRole('button', { name: 'Copy sample context' });
      await copy.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${evidence}/workspace-${colorScheme}-${width}.png` });
    }
  }
});

test('200% zoom layout proxy reflows to a 640px viewport without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Workspace', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
});

test('reduced motion removes nonessential animation and transition time', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Save settings' });
  const timing = await button.evaluate(element => ({
    animationDuration: getComputedStyle(element).animationDuration,
    transitionDuration: getComputedStyle(element).transitionDuration,
  }));
  expect(timing.animationDuration.split(',').every(value => value.trim() === '0s')).toBe(true);
  expect(timing.transitionDuration.split(',').every(value => value.trim() === '0s')).toBe(true);
});
