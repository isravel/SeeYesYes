import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, surface: 'glass' | 'clean' = 'glass') => {
  await page.goto(`/internal-checks/controls?surface=${surface}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
};

/**
 * Contrast of two computed CSS colors. Computed values can be `rgb()`, `oklch()` or `color(srgb …)`, so the browser itself
 * converts each one to sRGB through a canvas before the WCAG relative luminance is taken.
 */
const contrast = (page: Page, a: string, b: string) => page.evaluate(([first, second]) => {
  const toRgb = (value: string) => {
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
  };
  const luminance = (rgb: number[]) => {
    const [r, g, bl] = rgb.map(channel => { const c = channel / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(toRgb(first)), luminance(toRgb(second))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}, [a, b] as [string, string]);

test('Highlight is a native mark whose text keeps contrast over its tint, and the words still read without it', async ({ page }) => {
  await open(page);
  const mark = page.getByTestId('highlight');
  expect(await mark.evaluate(el => el.tagName)).toBe('MARK');
  const { color, background } = await mark.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  expect(await contrast(page, color, background), 'light text over highlight tint').toBeGreaterThanOrEqual(4.5);
  await expect(page.locator('#highlight-line')).toHaveText('Your export includes every saved theme in this workspace.');
  // The same check in dark appearance. The fixture scope follows the page color scheme through `appearance`, so reload under dark.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/internal-checks/controls?surface=glass&appearance=dark');
  const dark = await page.getByTestId('highlight').evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
  expect(dark.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(await contrast(page, dark.color, dark.background), 'dark text over highlight tint').toBeGreaterThanOrEqual(4.5);
});

test('Highlight uses system mark colors when forced colors are active', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page);
  const mark = page.getByTestId('highlight');
  const forced = await mark.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
  expect(forced.color).not.toBe(forced.background);
});

test('Level shows its text and a decorative dot for every tone, and the dot never carries the meaning', async ({ page }) => {
  await open(page);
  const display = page.locator('#display');
  for (const [text, tone] of [['Easy', 'success'], ['Medium', 'warning'], ['Hard', 'destructive'], ['Custom label', 'info']]) {
    const level = display.getByText(text, { exact: true });
    await expect(level).toBeVisible();
    await expect(level).toHaveAttribute('data-tone', tone);
    await expect(level.locator('[aria-hidden="true"]')).toHaveCount(1);
  }
  // Tone changes the dot color; the dots are all visible against the surface.
  const dotColor = (text: string) => display.getByText(text, { exact: true }).locator('span').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(await dotColor('Easy')).not.toBe(await dotColor('Hard'));
  expect(await dotColor('Medium')).not.toBe(await dotColor('Easy'));
  // The accessible text is the label alone, with no tone words added.
  await expect(display.getByText('Easy', { exact: true })).toHaveText('Easy');
});

test('LiveDot differs by shape as well as color, and animates only when asked', async ({ page }) => {
  await open(page);
  const live = page.getByTestId('live-static');
  const inactive = page.locator('#display').getByText('Offline', { exact: true });
  const dot = (locator: ReturnType<Page['locator']>) => locator.locator('span').first().evaluate(el => { const s = getComputedStyle(el); return { background: s.backgroundColor, border: s.borderTopWidth, width: s.width }; });
  const liveDot = await dot(live);
  const inactiveDot = await dot(inactive);
  expect(inactiveDot.background).toBe('rgba(0, 0, 0, 0)');
  expect(inactiveDot.border).toBe('2px');
  expect(liveDot.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(liveDot.border).toBe('0px');
  expect(parseFloat(inactiveDot.width)).toBeGreaterThan(parseFloat(liveDot.width));
  const ping = (testId: string) => page.getByTestId(testId).locator('span').first().evaluate(el => getComputedStyle(el, '::after').animationName);
  expect(await ping('live-animated')).not.toBe('none');
  expect(await ping('live-static')).toBe('none');
});

test('LiveDot stops its ping under reduced motion and in forced colors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const animation = () => page.getByTestId('live-animated').locator('span').first().evaluate(el => getComputedStyle(el, '::after').animationName);
  expect(await animation()).toBe('none');
  await expect(page.getByTestId('live-animated')).toHaveText('Live now');
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  const forced = await page.getByTestId('live-animated').locator('span').first().evaluate(el => getComputedStyle(el, '::after').display);
  expect(forced).toBe('none');
});

test('Kbd renders native keys with a hidden separator, and long sequences wrap instead of overflowing at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  const line = page.locator('#kbd-line');
  await expect(line.locator('kbd')).toHaveCount(3);
  await expect(line.locator('kbd').first()).toHaveText('Ctrl');
  expect(await line.locator('kbd').first().evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  // Keys are not focusable and bind nothing: pressing the shortcut does not change the page.
  expect(await line.locator('kbd').first().evaluate(el => (el as HTMLElement).tabIndex)).toBe(-1);
  const before = page.url();
  await page.keyboard.press('Control+K');
  expect(page.url()).toBe(before);
});

test('AvatarGroup overlaps its avatars, names the group, and gives the +N count its own name', async ({ page }) => {
  await open(page);
  const group = page.getByRole('group', { name: 'Project members' });
  await expect(group).toBeVisible();
  await expect(group.getByRole('img')).toHaveCount(5);
  await expect(group.getByRole('img', { name: 'Maya Chen' })).toBeVisible();
  await expect(group.getByRole('img', { name: '2 more' })).toHaveText('+2');
  const boxes = await group.locator('> span').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; }));
  expect(boxes).toHaveLength(5);
  for (let index = 1; index < boxes.length; index += 1) expect(boxes[index].left, `item ${index} overlaps the previous one`).toBeLessThan(boxes[index - 1].right);
  // A small group that fits shows everyone and no count.
  const small = page.getByRole('group', { name: 'Two reviewers' });
  await expect(small.getByRole('img')).toHaveCount(2);
  await expect(small.getByRole('img', { name: /more/ })).toHaveCount(0);
  // The group is not a tab stop.
  expect(await group.evaluate(el => el.querySelectorAll('a, button, [tabindex]').length)).toBe(0);
});

test('the display components have no serious accessibility violations in light and dark', async ({ page }) => {
  for (const scheme of ['light', 'dark'] as const) {
    await page.goto(`/internal-checks/controls?surface=glass&appearance=${scheme}`);
    await expect(page.locator('#controls-scope')).toBeVisible();
    const result = await new AxeBuilder({ page }).include('#display').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), scheme).toEqual([]);
  }
});

test('the display components stay on the page at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
