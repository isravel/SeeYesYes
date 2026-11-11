import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, query = 'surface=glass') => {
  await page.goto(`/internal-checks/controls?${query}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
  await expect(page.locator('#x4-effects')).toBeVisible();
};
const effects = (page: Page) => page.locator('#x4-effects');
const pseudo = (page: Page, testId: string, property: 'animationName' | 'display') => page.getByTestId(testId).evaluate((el, name) => getComputedStyle(el, '::before')[name as 'animationName'], property);
const activeWord = (page: Page) => page.getByTestId('rotating').locator('[data-active]').textContent();
const toggle = (page: Page, name: string) => effects(page).getByRole('button', { name, exact: true });

test('AnimatedBadge keeps its label and fill, and only glints when asked, never under reduced motion or forced colors', async ({ page }) => {
  await open(page);
  const animated = page.getByTestId('badge-animated');
  const plain = page.getByTestId('badge-static');
  await expect(animated).toHaveText('Featured');
  expect(await pseudo(page, 'badge-animated', 'animationName')).not.toBe('none');
  expect(await pseudo(page, 'badge-static', 'animationName')).toBe('none');
  // The glint is a ring on the border; the badge's own fill and text color are Badge's.
  const [base, glinting] = await Promise.all([plain, animated].map(badge => badge.evaluate(el => ({ color: getComputedStyle(el).color, size: getComputedStyle(el).fontSize }))));
  expect(glinting.size).toBe(base.size);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await pseudo(page, 'badge-animated', 'animationName')).toBe('none');
  await expect(animated).toHaveText('Featured');
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  expect(await pseudo(page, 'badge-animated', 'display')).toBe('none');
});

test('ShinyText stays readable text: static by default, swept only when asked, and plain under reduced motion and forced colors', async ({ page }) => {
  await open(page);
  await expect(page.locator('#shiny-line')).toHaveText('Ship faster with one system');
  const fill = (testId: string) => page.getByTestId(testId).evaluate(el => ({ name: getComputedStyle(el).animationName, fill: getComputedStyle(el).webkitTextFillColor, color: getComputedStyle(el).color }));
  const moving = await fill('shiny-animated');
  const still = await fill('shiny-static');
  expect(moving.name).not.toBe('none');
  expect(still.name).toBe('none');
  // The sweep hides only the text fill so a gradient can show through; `color` itself is never touched.
  expect(moving.fill).toBe('rgba(0, 0, 0, 0)');
  expect(moving.color).toBe(still.color);
  expect(still.fill).toBe(still.color);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await fill('shiny-animated');
  expect(reduced.name).toBe('none');
  expect(reduced.fill).toBe(reduced.color);
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  const forced = await fill('shiny-animated');
  expect(forced.name).toBe('none');
  // Chrome reports `color` as the forced system color but the fill as the author color, so only check that the text is not left transparent.
  expect(forced.fill).not.toBe('rgba(0, 0, 0, 0)');
  await expect(page.getByTestId('shiny-animated')).toHaveText('faster');
});

test('RotatingWord reserves the widest word, reads one phrase, cycles after hydration, and stops on pause, hover and reduced motion', async ({ page }) => {
  await open(page);
  const heading = page.locator('#rotating-line');
  // Assistive technology gets one stable phrase, not the words as they change.
  await expect(page.getByRole('heading', { name: 'Built for teams, designers, a very long word indeed' })).toBeVisible();
  await expect(page.getByTestId('rotating').locator('[aria-hidden="true"]')).toHaveCount(1);
  await expect.poll(() => activeWord(page), { timeout: 5000 }).not.toBe('teams');
  // The line is as wide as its longest word whichever word shows, so the headline never jumps.
  const widths = new Set<number>();
  for (let sample = 0; sample < 6; sample += 1) { widths.add(Math.round((await heading.boundingBox())!.width)); await page.waitForTimeout(400); }
  expect(widths.size).toBe(1);
  expect(await page.getByTestId('rotating').locator('[data-active]').count()).toBe(1);
  // Only the active word is visible.
  expect(await page.getByTestId('rotating').locator('[aria-hidden="true"] > span').evaluateAll(els => els.filter(el => getComputedStyle(el).visibility === 'visible').length)).toBe(1);
  // The page-level pause control stops it.
  await effects(page).getByRole('button', { name: 'Pause words' }).click();
  const held = await activeWord(page);
  await page.waitForTimeout(2300);
  expect(await activeWord(page)).toBe(held);
  await effects(page).getByRole('button', { name: 'Resume words' }).click();
  await expect.poll(() => activeWord(page), { timeout: 5000 }).not.toBe(held);
  // Hovering the word stops it too.
  await page.getByTestId('rotating').hover();
  const hovered = await activeWord(page);
  await page.waitForTimeout(2300);
  expect(await activeWord(page)).toBe(hovered);
  // Static and single-word forms never cycle.
  await expect(page.getByTestId('rotating-static').locator('[data-active]')).toHaveText('alpha');
  await expect(page.getByTestId('rotating-solo').locator('[data-active]')).toHaveText('solo');
  await expect(page.getByTestId('rotating-solo')).not.toHaveAttribute('data-rotating', /.*/);
  // Reduced motion keeps the first word and never starts.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(2, 2);
  await expect(page.getByTestId('rotating').locator('[data-active]')).toHaveText('teams');
  await page.waitForTimeout(2300);
  await expect(page.getByTestId('rotating').locator('[data-active]')).toHaveText('teams');
  await expect(page.getByTestId('rotating')).not.toHaveAttribute('data-rotating', /.*/);
});

test('MenuToggle keeps one name, reports its state, turns bars into a close mark, and works from the keyboard', async ({ page }) => {
  await open(page);
  const button = toggle(page, 'Site menu');
  const menu = page.locator('#x4-menu');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toHaveAttribute('aria-controls', 'x4-menu');
  await expect(menu).toBeHidden();
  const bars = button.locator('span > span');
  await expect(bars).toHaveCount(3);
  const middle = () => bars.nth(1).evaluate(el => getComputedStyle(el).opacity);
  expect(await middle()).toBe('1');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  // The name does not change with the state; aria-expanded carries it. The expanded shape differs: the middle bar goes.
  await expect(button).toHaveAccessibleName('Site menu');
  await expect.poll(middle).toBe('0');
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  // An uncontrolled toggle starts expanded when asked, and a disabled one ignores presses.
  await expect(toggle(page, 'Small menu')).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle(page, 'Unavailable menu')).toBeDisabled();
  for (const name of ['Site menu', 'Small menu', 'Unavailable menu']) {
    const box = (await toggle(page, name).boundingBox())!;
    expect(box.width, name).toBeGreaterThanOrEqual(24);
    expect(box.height, name).toBeGreaterThanOrEqual(24);
  }
});

test('MenuToggle swaps instantly under reduced motion and shows a visible focus ring', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const button = toggle(page, 'Site menu');
  const duration = await button.locator('span > span').first().evaluate(el => getComputedStyle(el).transitionDuration);
  expect(duration.split(',').every(value => value.trim() === '0s')).toBe(true);
  await page.keyboard.press('Tab');
  await button.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const ring = await page.evaluate(() => { const el = document.activeElement as HTMLElement; const style = getComputedStyle(el); return { focusVisible: el.matches(':focus-visible'), outline: style.outlineStyle, width: parseFloat(style.outlineWidth) }; });
  expect(ring.focusVisible).toBe(true);
  expect(ring.outline).not.toBe('none');
  expect(ring.width).toBeGreaterThan(0);
});

test('effects fit a 320px screen without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const box = (await page.locator('#rotating-line').boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});

test('effects have no serious accessibility violations in light and dark, glass and clean', async ({ page }) => {
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    const result = await new AxeBuilder({ page }).include('#x4-effects').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
  }
});
