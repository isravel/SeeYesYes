import { test, expect, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function inInnerScope(overlay: Locator) {
  expect(await overlay.evaluate(element => element.closest('[data-theme-scope]')?.id)).toBe('overlay-inner');
  expect(await overlay.evaluate(element => getComputedStyle(element).getPropertyValue('--sys-spacing-stack').trim())).toBe('1.5rem');
}
test('modal traps focus, inherits its scope, blocks outside dismissal, and restores trigger focus', async ({ page }) => {
  await page.goto('/internal-checks/overlays');
  const trigger = page.getByRole('button', { name: 'Scope dialog', exact: true });
  await expect(trigger).toHaveAttribute('data-variant', 'ghost');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Scoped task', exact: true });
  await expect(dialog).toBeVisible();
  await inInnerScope(dialog);
  await expect(dialog.locator('..')).toHaveAttribute('data-size', 'large');
  const close = dialog.getByRole('button', { name: 'Close scope dialog' });
  await close.focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('textbox', { name: 'Preview name' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Required task', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Required decision' })).toBeVisible();
  await page.getByRole('button', { name: 'Finish task' }).click();
  await expect(page.getByRole('button', { name: 'Required task', exact: true })).toBeFocused();
});
test('menu skips disabled items, runs an action, and restores focus on selection or Escape', async ({ page }) => {
  await page.goto('/internal-checks/overlays');
  const trigger = page.getByRole('button', { name: 'Scope actions' });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const menu = page.getByRole('menu', { name: 'Scope actions' });
  await expect(menu).toBeVisible();
  await inInnerScope(menu);
  await expect(menu.getByRole('menuitem', { name: 'Save', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Reset' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('reset');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
test('tabs connect panels and support automatic and manual keyboard activation', async ({ page }) => {
  await page.goto('/internal-checks/overlays');
  const automatic = page.getByRole('tablist', { name: 'Automatic details' });
  const first = automatic.getByRole('tab', { name: 'Overview' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  const details = automatic.getByRole('tab', { name: 'Details' });
  await expect(details).toBeFocused();
  await expect(details).toHaveAttribute('aria-selected', 'true');
  const panelId = await details.getAttribute('aria-controls');
  await expect(page.locator(`[id="${panelId}"]`)).toHaveText('Details content');
  const manual = page.getByRole('tablist', { name: 'Manual details' });
  await manual.getByRole('tab', { name: 'Overview' }).focus();
  await page.keyboard.press('ArrowRight');
  const manualDetails = manual.getByRole('tab', { name: 'Details' });
  await expect(manualDetails).toBeFocused();
  await expect(manualDetails).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('Enter');
  await expect(manualDetails).toHaveAttribute('aria-selected', 'true');
});
test('tooltip opens on hover and focus, inherits its scope, and dismisses with Escape', async ({ page }) => {
  await page.goto('/internal-checks/overlays');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', /light|dark/);
  const trigger = page.getByRole('button', { name: 'Scope tooltip' });
  await page.mouse.move(1, 1);
  await trigger.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Supplemental scope description');
  await inInnerScope(tooltip);
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
  await page.keyboard.press('Tab');
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('tooltip action');
});

test('workspace overlays stay within mobile and desktop viewports in both appearances', async ({ page }) => {
  const evidence = process.env.SEEYESYES_EVIDENCE_DIR ?? 'test-results';
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.getByRole('button', { name: 'Open preview settings' }).click();
      const dialog = page.getByRole('dialog', { name: 'Preview settings' });
      await expect(dialog).toBeVisible();
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.screenshot({ path: `${evidence}/dialog-${colorScheme}-${width}.png` });
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Preview actions' }).click();
      const menu = page.getByRole('menu', { name: 'Preview actions' });
      await expect(menu).toBeVisible();
      const menuBounds = await menu.boundingBox();
      expect(menuBounds!.x).toBeGreaterThanOrEqual(0);
      expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(width);
      if (width === 1280) await page.screenshot({ path: `${evidence}/menu-${colorScheme}.png` });
      await page.keyboard.press('Escape');
      const tooltipTrigger = page.getByRole('button', { name: 'Save preview', exact: true });
      await tooltipTrigger.scrollIntoViewIfNeeded();
      await page.mouse.move(1, 1);
      await tooltipTrigger.hover();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();
      if (width === 1280) await page.screenshot({ path: `${evidence}/tooltip-${colorScheme}.png` });
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
});

test('workspace tooltip opens through normal keyboard tab navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', /light|dark/);
  const trigger = page.getByRole('button', { name: 'Save preview', exact: true });
  for (let step = 0; step < 80; step++) {
    await page.keyboard.press('Tab');
    if (await trigger.evaluate(element => element === document.activeElement)) break;
  }
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('tooltip')).toBeVisible();
});
