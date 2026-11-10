import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, query = 'surface=glass') => {
  await page.goto(`/internal-checks/controls?${query}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
};
const section = (page: Page) => page.locator('#x3-compositions');

test('Disclosure toggles by click, Enter and Space, and collapsed content cannot take focus', async ({ page }) => {
  await open(page);
  const trigger = section(page).getByRole('button', { name: 'Shipping details' });
  const inside = section(page).getByRole('button', { name: 'Inside the panel' });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(inside).toBeHidden();
  // Tab from the trigger skips the hidden panel content entirely.
  await trigger.focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.textContent ?? '')).not.toContain('Inside the panel');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(inside).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(inside).toBeFocused();
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Shift');
  await trigger.focus();
  expect(await trigger.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('Disclosure hover previews with a mouse, a click keeps it open, and keyboard never depends on hover', async ({ page }) => {
  await open(page);
  const trigger = section(page).getByRole('button', { name: 'Hover preview' });
  const content = section(page).getByText('Preview content');
  await expect(content).toBeHidden();
  await trigger.hover();
  await expect(content).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.mouse.move(0, 0);
  await expect(content).toBeHidden();
  // A click while previewing pins it open, and it stays open after the pointer leaves.
  await trigger.hover();
  await trigger.click();
  await page.mouse.move(0, 0);
  await expect(content).toBeVisible();
  await trigger.click();
  await expect(content).toBeHidden();
  // Keyboard focus alone does not open it; Enter does.
  await trigger.focus();
  await expect(content).toBeHidden();
  await page.keyboard.press('Enter');
  await expect(content).toBeVisible();
});

test('Accordion keeps one section open in single mode, lets several open in multiple mode, and keeps the last one open when not collapsible', async ({ page }) => {
  await open(page);
  const scope = section(page);
  const shipping = scope.getByRole('button', { name: 'Shipping', exact: true });
  const returns = scope.getByRole('button', { name: 'Returns', exact: true });
  await expect(scope.getByRole('heading', { level: 3, name: 'Shipping', exact: true })).toBeVisible();
  await shipping.click();
  await expect(scope.getByRole('region', { name: 'Shipping', exact: true })).toBeVisible();
  await returns.click();
  await expect(shipping).toHaveAttribute('aria-expanded', 'false');
  await expect(returns).toHaveAttribute('aria-expanded', 'true');
  await returns.click();
  await expect(returns).toHaveAttribute('aria-expanded', 'false');
  await expect(scope.getByRole('button', { name: 'Support' })).toBeDisabled();

  await scope.getByRole('button', { name: 'Second multiple' }).click();
  await scope.getByRole('button', { name: 'First multiple' }).click();
  await expect(scope.getByTestId('x3-page')).toHaveText('6|m1,m2');
  await expect(scope.getByText('One.')).toBeVisible();
  await expect(scope.getByText('Two.')).toBeVisible();

  const kept = scope.getByRole('button', { name: 'Always one' });
  await kept.click();
  await expect(kept).toHaveAttribute('aria-expanded', 'true');
  await scope.getByRole('button', { name: 'Other', exact: true }).click();
  await expect(kept).toHaveAttribute('aria-expanded', 'false');
  await scope.getByRole('button', { name: 'Other', exact: true }).click();
  await expect(scope.getByRole('button', { name: 'Other', exact: true })).toHaveAttribute('aria-expanded', 'true');
});

test('Pagination marks the current page, moves by click and keyboard, and disables the ends', async ({ page }) => {
  await open(page);
  const nav = section(page).getByRole('navigation', { name: 'Results pages' });
  await expect(nav.locator('[aria-current="page"]')).toHaveText('6');
  await nav.getByRole('button', { name: 'Page 7', exact: true }).click();
  await expect(nav.locator('[aria-current="page"]')).toHaveText('7');
  await expect(section(page).getByTestId('x3-page')).toHaveText('7|');
  await nav.getByRole('button', { name: /Next/ }).focus();
  await page.keyboard.press('Enter');
  await expect(nav.locator('[aria-current="page"]')).toHaveText('8');
  // The list keeps its length while the current page moves, so the controls do not jump.
  const count = await nav.locator('li').count();
  await nav.getByRole('button', { name: 'Page 12', exact: true }).click();
  await expect(nav.getByRole('button', { name: /Next/ })).toBeDisabled();
  expect(await nav.locator('li').count()).toBe(count);
  await nav.getByRole('button', { name: 'Page 1', exact: true }).click();
  await expect(nav.getByRole('button', { name: /Previous/ })).toBeDisabled();
  expect(await nav.locator('li').count()).toBe(count);
  // Ellipses are not focusable, and the current page differs by fill, not only color.
  await expect(nav.locator('li[aria-hidden="true"]').first()).toHaveText('…');
  expect(await nav.locator('li[aria-hidden="true"] :is(a, button)').count()).toBe(0);
  const current = nav.locator('[aria-current="page"]');
  const other = nav.getByRole('button', { name: 'Page 2', exact: true });
  expect(await current.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(await other.evaluate(el => getComputedStyle(el).backgroundColor));
  await page.keyboard.press('Shift');
  await other.focus();
  expect(await other.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('Pagination with getHref uses real links and marks the current one', async ({ page }) => {
  await open(page);
  const nav = section(page).getByRole('navigation', { name: 'Linked pages' });
  await expect(nav.getByRole('link', { name: 'Page 3', exact: true })).toHaveAttribute('href', '#page-3');
  await expect(nav.locator('[aria-current="page"]')).toHaveText('2');
  await nav.getByRole('link', { name: 'Page 3', exact: true }).click();
  await expect(page).toHaveURL(/#page-3$/);
  await expect(nav.locator('[aria-current="page"]')).toHaveText('3');
});

test('Breadcrumbs link the ancestors, leave the current page as text, and wrap on a narrow screen', async ({ page }) => {
  await open(page);
  const trail = section(page).getByRole('navigation', { name: 'Trail', exact: true });
  await expect(trail.getByRole('link')).toHaveCount(2);
  await expect(trail.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '/components');
  await expect(trail.locator('[aria-current="page"]')).toHaveText('Breadcrumbs');
  expect(await trail.locator('[aria-current="page"]').evaluate(el => el.tagName)).toBe('SPAN');
  await page.setViewportSize({ width: 320, height: 800 });
  const long = section(page).getByRole('navigation', { name: 'Long trail', exact: true });
  const box = await long.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(320);
  expect(box!.height).toBeGreaterThan(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('the new X3 compositions have no serious accessibility violations in light and dark, glass and clean', async ({ page }) => {
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    const result = await new AxeBuilder({ page }).include('#x3-compositions').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
  }
});

test('forced colors keep the current page distinguishable', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page);
  const nav = section(page).getByRole('navigation', { name: 'Results pages' });
  const current = await nav.locator('[aria-current="page"]').evaluate(el => getComputedStyle(el).backgroundColor);
  const other = await nav.getByRole('button', { name: 'Page 5', exact: true }).evaluate(el => getComputedStyle(el).backgroundColor);
  expect(current).not.toBe(other);
});
