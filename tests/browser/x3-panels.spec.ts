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

const confirmSection = (page: Page) => page.locator('#x3-confirm');

test('ConfirmDialog is a named alert dialog, starts on Cancel, ignores outside presses, and confirms', async ({ page }) => {
  await open(page);
  const trigger = confirmSection(page).getByRole('button', { name: 'Archive project' });
  await trigger.click();
  const dialog = page.getByRole('alertdialog', { name: 'Archive this project?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleDescription('The project moves to the archive.');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  expect(await dialog.evaluate(el => el.closest('[data-theme-scope]')?.id)).toBe('controls-scope');
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  // Focus containment puts focus back asynchronously after the press, so wait for it rather than reading it once.
  await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement)), { message: 'focus stays inside after an outside press' }).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('x3-confirmed')).toHaveText('|0');
  await trigger.click();
  await dialog.getByRole('button', { name: 'Archive project' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('x3-confirmed')).toHaveText('archived|0');
});

test('ConfirmDialog with typing starts on the field, enables Confirm only on an exact match, and shows pending', async ({ page }) => {
  await open(page);
  await confirmSection(page).getByRole('button', { name: 'Delete project' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Delete Orchard?' });
  const field = dialog.getByRole('textbox', { name: /Type .Orchard. to confirm/ });
  const confirm = dialog.getByRole('button', { name: 'Delete project' });
  await expect(field).toBeFocused();
  await expect(confirm).toBeDisabled();
  await field.fill('orchard');
  await expect(confirm).toBeDisabled();
  await field.fill('Orchard');
  await expect(confirm).toBeEnabled();
  await field.press('Enter');
  await expect(dialog.getByRole('status')).toHaveText('Working…');
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId('x3-confirmed')).toHaveText('deleted|0');
});

test('ConfirmDialog keeps the dialog open and the typed text after a failed action, and succeeds on retry', async ({ page }) => {
  await open(page);
  await confirmSection(page).getByRole('button', { name: 'Remove member' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Remove Ada Bell?' });
  const field = dialog.getByRole('textbox');
  await field.fill('Ada');
  await dialog.getByRole('button', { name: 'Remove member' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('Could not remove the member. Try again.');
  await expect(dialog).toBeVisible();
  await expect(field).toHaveValue('Ada');
  await expect(dialog.getByRole('button', { name: 'Remove member' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Remove member' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId('x3-confirmed')).toHaveText('removed|2');
});

test('ConfirmDialog fits a 320px screen and has no serious accessibility violations', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    await confirmSection(page).getByRole('button', { name: 'Delete project' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Delete Orchard?' });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const result = await new AxeBuilder({ page }).include('[role="alertdialog"]').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  }
});

const toastSection = (page: Page) => page.locator('#x3-toasts');
const toasts = (page: Page) => page.getByRole('alertdialog');

test('Toast announces by urgency, names its tone, and a toast without an action expires', async ({ page }) => {
  await open(page);
  await expect(toasts(page)).toHaveCount(0);
  await toastSection(page).getByRole('button', { name: 'Show info toast' }).click();
  const info = toasts(page).filter({ hasText: 'Saved to drafts.' });
  await expect(info).toBeVisible();
  // The tone is named in text for assistive technology even without a title, and a polite message is a status.
  await expect(info).toContainText('Information');
  await expect(info.locator('[aria-live="polite"][role="status"]')).toHaveCount(1);
  expect(await info.evaluate(el => el.closest('[data-theme-scope]')?.id)).toBe('controls-scope');
  await expect(page.getByRole('region', { name: 'Notifications' })).toHaveCount(1);
  await toastSection(page).getByRole('button', { name: 'Show error toast' }).click();
  const error = toasts(page).filter({ hasText: 'Could not sync.' });
  await expect(error).toContainText('Error');
  await expect(error.locator('[aria-live="assertive"][role="alert"]')).toHaveCount(1);
  await toastSection(page).getByRole('button', { name: 'Show success toast' }).click();
  await expect(toasts(page).filter({ hasText: 'Done' })).toBeVisible();
  // A toast with a short timeout goes away by itself.
  await toastSection(page).getByRole('button', { name: 'Show quick toast' }).click();
  const quick = toasts(page).filter({ hasText: 'Quick note.' });
  await expect(quick).toBeVisible();
  await expect(quick).toHaveCount(0, { timeout: 5000 });
});

test('Toast pauses its timer while hovered or focused, and closes from its close button and Escape', async ({ page }) => {
  await open(page);
  await toastSection(page).getByRole('button', { name: 'Show warning toast' }).click();
  const warning = toasts(page).filter({ hasText: 'Storage is almost full.' });
  await expect(warning).toBeVisible();
  // The 1.2s timer would have ended by now if hovering did not pause it.
  await warning.hover();
  await page.waitForTimeout(2200);
  await expect(warning).toBeVisible();
  await page.mouse.move(2, 2);
  await expect(warning).toHaveCount(0, { timeout: 5000 });
  await toastSection(page).getByRole('button', { name: 'Show info toast' }).click();
  const info = toasts(page).filter({ hasText: 'Saved to drafts.' });
  await info.getByRole('button', { name: 'Close' }).click();
  await expect(info).toHaveCount(0);
  await toastSection(page).getByRole('button', { name: 'Show info toast' }).click();
  await expect(info).toBeVisible();
  await info.focus();
  await page.keyboard.press('Escape');
  await expect(info).toHaveCount(0);
});

test('Toast with an action stays until dismissed, runs the action once, and reports a failed action as text', async ({ page }) => {
  await open(page);
  await toastSection(page).getByRole('button', { name: 'Show undo toast' }).click();
  const undo = toasts(page).filter({ hasText: 'Member removed.' });
  await expect(undo).toBeVisible();
  // Longer than any non-action timeout used in the fixture.
  await page.waitForTimeout(2500);
  await expect(undo).toBeVisible();
  await undo.getByRole('button', { name: 'Undo' }).click();
  await expect(undo).toHaveCount(0);
  await expect(page.getByTestId('x3-toast')).toHaveText('1|0');
  await toastSection(page).getByRole('button', { name: 'Show retry toast' }).click();
  const retry = toasts(page).filter({ hasText: 'Upload failed.' });
  await retry.getByRole('button', { name: 'Retry' }).click();
  await expect(retry.getByText('Still offline. Try again.')).toBeVisible();
  await expect(retry).toBeVisible();
  await expect(page.getByTestId('x3-toast')).toHaveText('1|1');
  await retry.getByRole('button', { name: 'Retry' }).click();
  await expect(retry).toHaveCount(0);
  await expect(page.getByTestId('x3-toast')).toHaveText('1|2');
});

test('Toast sits at the bottom centre by default, can move to the top end, and stays inside a 320px screen', async ({ page }) => {
  await open(page);
  const size = page.viewportSize()!;
  await toastSection(page).getByRole('button', { name: 'Show info toast' }).click();
  const info = toasts(page).filter({ hasText: 'Saved to drafts.' });
  await expect(info).toBeVisible();
  await info.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  const bottom = (await info.boundingBox())!;
  expect(bottom.y).toBeGreaterThan(size.height / 2);
  expect(Math.abs(bottom.x + bottom.width / 2 - size.width / 2)).toBeLessThan(2);
  await info.getByRole('button', { name: 'Close' }).click();
  await toastSection(page).getByRole('button', { name: 'Show top toast' }).click();
  const top = toasts(page).filter({ hasText: 'Top note.' });
  await expect(top).toBeVisible();
  const topBox = (await top.boundingBox())!;
  expect(topBox.y).toBeLessThan(size.height / 2);
  expect(topBox.x + topBox.width).toBeGreaterThan(size.width / 2);
  await top.getByRole('button', { name: 'Close' }).click();
  await page.setViewportSize({ width: 320, height: 640 });
  await toastSection(page).getByRole('button', { name: 'Show retry toast' }).click();
  const narrow = toasts(page).filter({ hasText: 'Upload failed.' });
  await expect(narrow).toBeVisible();
  const box = (await narrow.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const name of ['Retry', 'Close']) {
    const target = (await narrow.getByRole('button', { name }).boundingBox())!;
    expect(target.width, name).toBeGreaterThanOrEqual(24);
    expect(target.height, name).toBeGreaterThanOrEqual(24);
  }
});

test('open toasts have no serious accessibility violations in light and dark, glass and clean', async ({ page }) => {
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    for (const name of ['Show info toast', 'Show success toast', 'Show undo toast', 'Show retry toast']) await toastSection(page).getByRole('button', { name }).click();
    await expect(toasts(page)).toHaveCount(3);
    // Contrast is measured on settled colours, so wait for the entrance animation to end.
    await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime)).map(animation => animation.finished)));
    const result = await new AxeBuilder({ page }).include('[role="region"][aria-label="Notifications"]').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
  }
});
