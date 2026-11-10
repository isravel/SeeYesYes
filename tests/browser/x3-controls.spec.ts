import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, query = 'surface=glass') => {
  await page.goto(`/internal-checks/controls?${query}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
};
const section = (page: Page) => page.locator('#x3-controls');

test('IconButton is named by its label, toggles aria-pressed, and shows a tooltip on keyboard focus', async ({ page }) => {
  await open(page);
  const add = section(page).getByRole('button', { name: 'Add member', exact: true });
  await expect(add).toBeVisible();
  const box = await add.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(43);
  expect(Math.abs(box!.width - box!.height)).toBeLessThan(1.5);
  await add.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('tooltip')).toHaveText('Add member');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  const pin = section(page).getByRole('button', { name: 'Pin item' });
  await expect(pin).toHaveAttribute('aria-pressed', 'false');
  await pin.click();
  await expect(pin).toHaveAttribute('aria-pressed', 'true');
  // The pressed state is a shape (an inset ring), not only a color change.
  expect(await pin.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none');
  await expect(section(page).getByRole('button', { name: 'Saving item' })).toHaveAttribute('aria-busy', 'true');
  await expect(section(page).getByRole('button', { name: 'Unavailable item' })).toBeDisabled();
  // A key press first, so the focus counts as keyboard focus (a programmatic focus right after a click does not).
  await page.keyboard.press('Shift');
  await add.focus();
  expect(await add.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('SearchInput shows the clear button only with text, clears by click and by Escape, and returns focus', async ({ page }) => {
  await open(page);
  const field = section(page).getByRole('searchbox', { name: 'Search members', exact: true });
  await expect(section(page).getByRole('button', { name: 'Clear search' })).toHaveCount(1); // the pre-filled "Searching members" field
  await field.fill('Maya');
  const clear = field.locator('xpath=ancestor::div[1]').getByRole('button', { name: 'Clear search' });
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  await expect(field.locator('xpath=ancestor::div[1]').getByRole('button', { name: 'Clear search' })).toHaveCount(0);
  await field.fill('Ada');
  await page.keyboard.press('Escape');
  await expect(field).toHaveValue('');
  await expect(field).toBeFocused();
  // The clear button is a tab stop with a visible focus ring.
  await field.fill('Ada');
  await page.keyboard.press('Tab');
  const button = field.locator('xpath=ancestor::div[1]').getByRole('button', { name: 'Clear search' });
  await expect(button).toBeFocused();
  expect(await button.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('SearchInput reports searching as text and keeps the field editable', async ({ page }) => {
  await open(page);
  const searching = section(page).getByRole('searchbox', { name: 'Searching members' });
  await expect(searching).toHaveAttribute('aria-busy', 'true');
  await expect(searching).toHaveValue('Maya');
  await expect(section(page).getByRole('status').filter({ hasText: 'Searching…' })).toHaveCount(1);
});

test('Segmented is one tab stop, moves and selects with arrow keys, and skips a disabled choice', async ({ page }) => {
  await open(page);
  const group = section(page).getByRole('radiogroup', { name: 'View' });
  const list = group.getByRole('radio', { name: 'List' });
  const grid = group.getByRole('radio', { name: 'Grid' });
  await expect(list).toBeChecked();
  await list.focus();
  await page.keyboard.press('ArrowRight');
  await expect(grid).toBeChecked();
  await expect(grid).toBeFocused();
  await expect(section(page).getByTestId('x3-picked')).toHaveText('|grid');
  await page.keyboard.press('ArrowRight');
  // The disabled Map choice is skipped, so selection wraps to List.
  await expect(list).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Map' })).toBeDisabled();
  expect(await list.evaluate(el => getComputedStyle(el.nextElementSibling!).outlineStyle)).toBe('solid');
  // Selected and unselected segments differ by fill, not only text.
  const fills = await group.locator('span[class*="face"]').evaluateAll(els => els.map(el => getComputedStyle(el).backgroundColor));
  expect(new Set(fills).size).toBeGreaterThan(1);
});

test('Chip keeps static, selectable and removable behavior separate, and keeps a chip whose removal failed', async ({ page }) => {
  await open(page);
  const scope = section(page);
  await expect(scope.getByText('Design', { exact: true })).toBeVisible();
  expect(await scope.getByText('Design', { exact: true }).evaluate(el => ({ tag: el.tagName, tab: (el as HTMLElement).tabIndex }))).toEqual({ tag: 'SPAN', tab: -1 });
  const stock = scope.getByRole('button', { name: 'In stock' });
  await expect(stock).toHaveAttribute('aria-pressed', 'false');
  await stock.press('Space');
  await expect(stock).toHaveAttribute('aria-pressed', 'true');
  await stock.press('Enter');
  await expect(stock).toHaveAttribute('aria-pressed', 'false');
  await scope.getByRole('button', { name: 'Remove Archived' }).click();
  await expect(scope.getByRole('button', { name: 'Remove Archived' })).toHaveCount(0);
  await expect(scope.getByRole('button', { name: 'Remove Draft' })).toHaveCount(1);
  const failing = scope.getByRole('button', { name: 'Remove Pinned tag' });
  await failing.click();
  await expect(scope.getByText('Could not remove. Try again.')).toBeVisible();
  await expect(scope.getByText('Pinned tag', { exact: true })).toBeVisible();
  await expect(failing).toHaveAccessibleDescription('Could not remove. Try again.');
  await page.keyboard.press('Shift');
  await failing.focus();
  expect(await failing.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('CheckboxGroup collects an array in option order, exposes hints and skips a disabled option', async ({ page }) => {
  await open(page);
  const group = section(page).getByRole('group', { name: /Notify me by/ });
  const sms = group.getByRole('checkbox', { name: 'Text message' });
  const email = group.getByRole('checkbox', { name: 'Email' });
  await expect(sms).toHaveAccessibleDescription('Carrier rates may apply.');
  await sms.check();
  await email.check();
  await expect(section(page).getByTestId('x3-picked')).toHaveText('email,sms|list');
  await email.uncheck();
  await expect(section(page).getByTestId('x3-picked')).toHaveText('sms|list');
  await expect(group.getByRole('checkbox', { name: 'Push' })).toBeDisabled();
  await email.focus();
  await page.keyboard.press('Tab');
  await expect(sms).toBeFocused();
  await page.keyboard.press('Tab');
  // Push is disabled, so focus leaves the group.
  await expect(group.getByRole('checkbox', { name: 'Push' })).not.toBeFocused();
});

test('InputOtp is one labelled field that keeps digits only, handles paste and correction, and reports completion without submitting', async ({ page }) => {
  await open(page);
  const field = section(page).getByRole('textbox', { name: 'Verification code', exact: true });
  await expect(field).toHaveAccessibleDescription('Enter the 6-digit code.');
  await expect(field).toHaveAttribute('autocomplete', 'one-time-code');
  await expect(field).toHaveAttribute('inputmode', 'numeric');
  // Only one tab stop for the whole code.
  await expect(section(page).getByRole('textbox', { name: 'Verification code', exact: true })).toHaveCount(1);
  await field.click();
  await page.keyboard.type('12a-3');
  await expect(field).toHaveValue('123');
  await expect(section(page).getByTestId('x3-otp')).toHaveText('123|');
  await page.keyboard.press('Backspace');
  await expect(field).toHaveValue('12');
  // Extra digits are cut off and completion is reported once.
  await page.keyboard.type('3456789');
  await expect(field).toHaveValue('123456');
  await expect(section(page).getByTestId('x3-otp')).toHaveText('123456|123456');
  await expect(field).not.toHaveAttribute('aria-invalid', 'true');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('9');
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(section(page).getByText('That code is not right.')).toBeVisible();
  await expect(field).toHaveAccessibleDescription(/That code is not right\./);
  // A pasted code replaces the whole value; non-digits are dropped.
  await field.evaluate(el => {
    el.focus();
    const data = new DataTransfer(); data.setData('text', ' 98-76 54 ');
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  });
  await expect(field).toHaveValue('987654');
  // The decorative boxes are not exposed and the active box is a shape, not only a color.
  const group = field.locator('xpath=..');
  expect(await group.locator('[aria-hidden="true"] > span').count()).toBe(6);
  await page.keyboard.press('Shift');
  await field.focus();
  expect(await group.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('InputOtp masks, honours read-only and disabled, and keeps its boxes at the minimum target size', async ({ page }) => {
  await open(page);
  const masked = section(page).getByLabel('Masked code', { exact: true });
  await expect(masked).toHaveAttribute('type', 'password');
  await expect(masked).toHaveValue('12');
  await expect(masked.locator('xpath=..').locator('[aria-hidden="true"] > span').first()).toHaveText('•');
  const locked = section(page).getByLabel('Locked code', { exact: true });
  await locked.focus();
  await page.keyboard.type('9');
  await expect(locked).toHaveValue('123456');
  await expect(section(page).getByLabel('Unavailable code', { exact: true })).toBeDisabled();
  const slot = section(page).getByRole('textbox', { name: 'Verification code', exact: true }).locator('xpath=..').locator('[aria-hidden="true"] > span').first();
  const box = await slot.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(24);
  expect(box!.height).toBeGreaterThanOrEqual(24);
});

test('the new X3 controls have no serious accessibility violations in light and dark, glass and clean', async ({ page }) => {
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    const result = await new AxeBuilder({ page }).include('#x3-controls').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
  }
});

test('the new X3 controls stay on the page at 320px and wrap instead of overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const box = await section(page).boundingBox();
  expect(box!.width).toBeLessThanOrEqual(320);
});

test('forced colors keep the selected segment and the pressed icon button distinguishable', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page);
  const group = section(page).getByRole('radiogroup', { name: 'View' });
  const selected = await group.getByRole('radio', { name: 'List' }).evaluate(el => getComputedStyle(el.nextElementSibling!).backgroundColor);
  const other = await group.getByRole('radio', { name: 'Grid' }).evaluate(el => getComputedStyle(el.nextElementSibling!).backgroundColor);
  expect(selected).not.toBe(other);
  const pin = section(page).getByRole('button', { name: 'Pin item' });
  await pin.click();
  expect(await pin.evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('2px');
});
