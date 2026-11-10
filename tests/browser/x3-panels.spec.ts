import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, query = 'surface=glass') => {
  await page.goto(`/internal-checks/controls?${query}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
};
const section = (page: Page) => page.locator('#x3-panels');
// The entrance slide moves the panel, so measure it once its animations have finished.
const settled = async (panel: Locator) => { await panel.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished))); };

test('Popover opens from the keyboard, is named and scoped, and returns focus on Escape', async ({ page }) => {
  await open(page);
  const trigger = section(page).getByRole('button', { name: 'Filter options' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('dialog', { name: 'Filter options' });
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(await panel.evaluate(el => el.closest('[data-theme-scope]')?.id)).toBe('controls-scope');
  expect(await panel.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Popover closes on a press outside and from its own close action', async ({ page }) => {
  await open(page);
  const trigger = section(page).getByRole('button', { name: 'Filter options' });
  const panel = page.getByRole('dialog', { name: 'Filter options' });
  await trigger.click();
  await expect(panel).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(panel).toHaveCount(0);
  await trigger.click();
  await panel.getByRole('button', { name: 'Apply filters' }).click();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Drawer is a named modal that contains focus, closes with Escape or an outside press, and returns focus', async ({ page }) => {
  await open(page);
  const trigger = section(page).getByRole('button', { name: 'Open right drawer' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const drawer = page.getByRole('dialog', { name: 'Right filters' });
  await expect(drawer).toBeVisible();
  expect(await drawer.evaluate(el => el.closest('[data-theme-scope]')?.id)).toBe('controls-scope');
  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press('Tab');
    expect(await drawer.evaluate(el => el.contains(document.activeElement)), `Tab ${step}`).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(drawer).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(drawer).toHaveCount(0);
  await trigger.click();
  await drawer.getByRole('button', { name: 'Done' }).click();
  await expect(drawer).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Drawer docks to its edge, stays inside the viewport, and a required drawer ignores Escape and outside presses', async ({ page }) => {
  await open(page);
  const size = page.viewportSize()!;
  const dock = async (name: string, title: string) => {
    await section(page).getByRole('button', { name }).click();
    const drawer = page.getByRole('dialog', { name: title });
    await expect(drawer).toBeVisible();
    await settled(drawer.locator('..'));
    const box = (await drawer.locator('..').boundingBox())!;
    return { drawer, box };
  };
  let result = await dock('Open right drawer', 'Right filters');
  expect(Math.round(result.box.x + result.box.width)).toBe(size.width);
  expect(result.box.height).toBeCloseTo(size.height, 0);
  await page.keyboard.press('Escape');
  result = await dock('Open left drawer', 'Left filters');
  expect(Math.round(result.box.x)).toBe(0);
  await page.keyboard.press('Escape');
  result = await dock('Open bottom drawer', 'Bottom filters');
  expect(Math.round(result.box.y + result.box.height)).toBe(size.height);
  expect(result.box.width).toBeCloseTo(size.width, 0);
  await page.keyboard.press('Escape');

  result = await dock('Open required drawer', 'Required drawer');
  await page.keyboard.press('Escape');
  await page.mouse.click(5, 5);
  await expect(result.drawer).toBeVisible();
  await result.drawer.getByRole('button', { name: 'Finish drawer' }).click();
  await expect(result.drawer).toHaveCount(0);
  await expect(section(page).getByRole('button', { name: 'Open required drawer' })).toBeFocused();
});

test('Drawer fits a 320px screen without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await open(page);
  await section(page).getByRole('button', { name: 'Open right drawer' }).click();
  const drawer = page.getByRole('dialog', { name: 'Right filters' });
  await expect(drawer).toBeVisible();
  await settled(drawer.locator('..'));
  const box = (await drawer.locator('..').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Drawer entrance animation stops under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await section(page).getByRole('button', { name: 'Open right drawer' }).click();
  const panel = page.getByRole('dialog', { name: 'Right filters' }).locator('..');
  await expect(panel).toBeVisible();
  expect(await panel.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});

// Playwright cannot emulate reduced transparency, so only forced colors is checked here; the reduced-transparency rule is the same declaration.
test('forced colors give the drawer and popover a solid surface', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page);
  await section(page).getByRole('button', { name: 'Open right drawer' }).click();
  const drawer = page.getByRole('dialog', { name: 'Right filters' }).locator('..');
  expect(await drawer.evaluate(el => getComputedStyle(el).backdropFilter)).toBe('none');
  await page.keyboard.press('Escape');
  await section(page).getByRole('button', { name: 'Filter options' }).click();
  const popover = page.getByRole('dialog', { name: 'Filter options' }).locator('..');
  expect(await popover.evaluate(el => getComputedStyle(el).backdropFilter)).toBe('none');
});

test('open Popover and Drawer have no serious accessibility violations in light and dark, glass and clean', async ({ page }) => {
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    await section(page).getByRole('button', { name: 'Filter options' }).click();
    const popover = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(popover.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `popover ${surface} ${appearance}`).toEqual([]);
    await page.keyboard.press('Escape');
    await section(page).getByRole('button', { name: 'Open right drawer' }).click();
    const drawer = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(drawer.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `drawer ${surface} ${appearance}`).toEqual([]);
  }
});
