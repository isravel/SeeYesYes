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
  // The leaving word stays visible for one fade duration, so allow the swap to finish before counting.
  await expect.poll(() => page.getByTestId('rotating').locator('[aria-hidden="true"] > span').evaluateAll(els => els.filter(el => getComputedStyle(el).visibility === 'visible').length), { timeout: 3000 }).toBe(1);
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

const media = (page: Page) => page.locator('#x4-media');
const swapFront = (page: Page, testId: string) => page.getByTestId(testId).locator('[data-position="0"]');

test('Logo is one named image: supplied image and wordmark are decoration, a failed image falls back to text, motion is opt-in', async ({ page }) => {
  await open(page);
  const image = page.getByTestId('logo-image');
  await expect(image).toHaveAccessibleName('Acme');
  await expect(image).toHaveRole('img');
  await expect(image.locator('img')).toHaveAttribute('alt', '');
  await expect.poll(() => image.locator('img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  // Inline mark with no wordmark and no label text.
  const inline = page.getByTestId('logo-inline');
  await expect(inline).toHaveAccessibleName('Acme');
  await expect(inline.locator('svg')).toHaveCount(1);
  await expect(inline).toHaveText('');
  // A missing image is replaced by readable text; the name does not change.
  const broken = page.getByTestId('logo-broken');
  await expect(broken).toHaveText('Broken brand');
  await expect(broken.locator('img')).toHaveCount(0);
  await expect(broken).toHaveAccessibleName('Broken brand');
  await expect(page.getByTestId('logo-text')).toHaveText('Label only');
  // Motion is on the mark only, only when asked, and not under reduced motion.
  const animation = (testId: string) => page.getByTestId(testId).locator('> span').first().evaluate(el => getComputedStyle(el).animationName);
  expect(await animation('logo-inline')).not.toBe('none');
  expect(await animation('logo-image')).toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await animation('logo-inline')).toBe('none');
});

test('FancyArrow is decoration unless named: hidden, never focusable, ignores the pointer, and drops out when its image fails', async ({ page }) => {
  await open(page);
  const decorative = page.getByTestId('arrow-inline');
  await expect(decorative).toHaveAttribute('aria-hidden', 'true');
  expect(await decorative.evaluate(el => ({ pointer: getComputedStyle(el).pointerEvents, tab: el.getAttribute('tabindex'), focusable: el.querySelectorAll('a, button, [tabindex]').length }))).toEqual({ pointer: 'none', tab: null, focusable: 0 });
  await expect(page.locator('#arrow-area').getByRole('img', { name: 'Next step' })).toHaveCount(1);
  await expect(page.getByTestId('arrow-named')).toHaveAccessibleName('Next step');
  // The corner arrow is positioned inside its parent, the inline ones are in the flow.
  const [area, corner, inline] = await Promise.all(['#arrow-area', '[data-testid="arrow-corner"]', '[data-testid="arrow-inline"]'].map(selector => page.locator(selector).boundingBox()));
  expect(corner!.x + corner!.width).toBeLessThanOrEqual(area!.x + area!.width + 1);
  expect(corner!.y + corner!.height).toBeCloseTo(area!.y + area!.height, 0);
  expect(inline!.y).toBeLessThan(corner!.y);
  // A decorative arrow whose image is missing renders nothing.
  await expect(page.getByTestId('arrow-broken')).toHaveCount(0);
});

test('TiltCard leans only with a mouse, never on touch or focus, stays a plain Card otherwise, and keeps its action working', async ({ page }) => {
  await open(page);
  const on = page.getByTestId('tilt-on');
  const off = page.getByTestId('tilt-off');
  const transform = (locator: ReturnType<Page['getByTestId']>) => locator.evaluate(el => getComputedStyle(el).transform);
  expect(await transform(on)).toBe('none');
  await on.scrollIntoViewIfNeeded();
  const box = (await on.boundingBox())!;
  await page.mouse.move(box.x + box.width - 4, box.y + 4);
  await expect.poll(() => transform(on)).not.toBe('none');
  const layer = on.locator('[data-tilt-layer]');
  await expect.poll(() => layer.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  // Leaving the card lays it flat again.
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await transform(on)) === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\)/.test(await transform(on))).toBe(true);
  // A card without tilt never moves, whatever the pointer does.
  await off.scrollIntoViewIfNeeded();
  const offBox = (await off.boundingBox())!;
  await page.mouse.move(offBox.x + offBox.width - 4, offBox.y + 4);
  expect(await transform(off)).toBe('none');
  // The action inside is a normal button, reachable by keyboard, and focus does not tilt the card.
  const action = on.getByRole('button', { name: 'Inside action' });
  await page.mouse.move(2, 2);
  await action.focus();
  await expect(action).toBeFocused();
  await expect.poll(async () => /matrix\(1, 0, 0, 1, 0, 0\)|^none$|matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1\)/.test(await transform(on))).toBe(true);
  expect(await on.evaluate(el => ({ role: el.getAttribute('role'), tab: el.getAttribute('tabindex') }))).toEqual({ role: null, tab: null });
  // Reduced motion removes the lean even under the pointer.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await on.scrollIntoViewIfNeeded();
  const again = (await on.boundingBox())!;
  await page.mouse.move(again.x + again.width - 4, again.y + 4);
  await expect(on).toHaveAttribute('data-leaning', 'true');
  expect(await transform(on)).toBe('none');
});

test('TiltCard ignores touch pointers', async ({ page }) => {
  await open(page);
  const on = page.getByTestId('tilt-on');
  await on.evaluate(el => {
    const box = el.getBoundingClientRect();
    el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch', clientX: box.right - 4, clientY: box.top + 4 }));
  });
  expect(await on.evaluate(el => ({ x: el.style.getPropertyValue('--tilt-x'), transform: getComputedStyle(el).transform }))).toEqual({ x: '', transform: 'none' });
});

test('CardSwap keeps reading order, exposes only the front card, swaps by button and keyboard, and holds its height', async ({ page }) => {
  await open(page);
  const swap = page.getByTestId('swap');
  const group = media(page).getByRole('group', { name: 'Highlights', exact: true });
  await expect(group).toHaveCount(1);
  await expect(media(page).getByText('Card 1 of 3')).toBeVisible();
  // Every card is in the document in the order given; only the front one is exposed.
  expect(await swap.locator('h3').allTextContents()).toEqual(['Fast', 'Accessible', 'Themed with a much longer heading that wraps onto several lines in a narrow card']);
  expect(await swap.locator('[data-position]').evaluateAll(els => els.map(el => (el as HTMLElement).inert))).toEqual([false, true, true]);
  await expect(swap.getByRole('heading')).toHaveCount(1);
  await expect(swap.getByRole('heading', { name: 'Fast' })).toBeVisible();
  // Tab goes into the front card's action, then Previous and Next; the cards behind add no stops.
  const stops: string[] = [];
  await swap.getByRole('button', { name: 'Fast action' }).focus();
  for (let press = 0; press < 3; press += 1) { stops.push((await page.evaluate(() => document.activeElement?.textContent ?? ''))); await page.keyboard.press('Tab'); }
  expect(stops).toEqual(['Fast action', 'Previous card', 'Next card']);
  // Heights stay equal across all three positions, so the page does not jump.
  const heights = new Set<number>();
  const next = swap.getByRole('button', { name: 'Next card', exact: true });
  for (let step = 0; step < 3; step += 1) { heights.add(Math.round((await swap.boundingBox())!.height)); await next.click(); }
  expect(heights.size).toBe(1);
  await expect(media(page).getByText('Card 1 of 3')).toBeVisible();
  // Keyboard swap: Enter on Next, Space on Previous.
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(media(page).getByText('Card 2 of 3')).toBeVisible();
  await expect(swap.getByRole('heading', { name: 'Accessible' })).toBeVisible();
  await expect(swap.getByRole('heading')).toHaveCount(1);
  await swap.getByRole('button', { name: 'Previous card' }).focus();
  await page.keyboard.press('Space');
  await expect(swapFront(page, 'swap').getByRole('heading', { name: 'Fast' })).toBeVisible();
  await expect(swap.getByRole('button', { name: 'Pause cycling' })).toHaveCount(0);
});

test('CardSwap autoplay is opt-in, pauses on hover, focus and its button, and never runs under reduced motion', async ({ page }) => {
  await open(page);
  const auto = page.getByTestId('swap-auto');
  const status = auto.getByRole('status');
  await expect(status).toHaveText('Card 1 of 2');
  await auto.scrollIntoViewIfNeeded();
  await page.mouse.move(2, 2);
  await expect(status).toHaveText('Card 2 of 2', { timeout: 6000 });
  // The visible pause button holds it.
  await auto.getByRole('button', { name: 'Pause cycling' }).click();
  await page.mouse.move(2, 2);
  const held = await status.textContent();
  await page.waitForTimeout(3800);
  await expect(status).toHaveText(held!);
  await auto.getByRole('button', { name: 'Resume cycling' }).click();
  // The click left focus inside the card, which also holds it; move focus out and the pointer away.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.getByRole('heading', { name: 'Control checks' }).hover();
  await expect.poll(() => status.textContent(), { timeout: 6000 }).not.toBe(held);
  // Hovering holds it.
  await auto.hover();
  const hovered = await status.textContent();
  await page.waitForTimeout(3800);
  await expect(status).toHaveText(hovered!);
  // The manual swap beside it never moved on its own.
  await expect(media(page).getByText('Card 1 of 3')).toBeVisible();
  // Reduced motion: no cycling at all.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(2, 2);
  const still = await status.textContent();
  await page.waitForTimeout(3800);
  await expect(status).toHaveText(still!);
});

test('MediaFrame reserves its ratio before and after load, captions the figure, and shows text when the media fails', async ({ page }) => {
  await open(page);
  const ok = page.getByTestId('media-ok');
  await expect(ok.getByRole('img', { name: 'A green hillside under a pale sky' })).toBeVisible();
  await expect(ok.locator('figcaption')).toHaveText('Hillside at midday');
  const ratio = async (testId: string) => { const box = (await page.getByTestId(testId).locator('> div').boundingBox())!; return box.width / box.height; };
  expect(await ratio('media-ok')).toBeCloseTo(16 / 9, 1);
  expect(await ratio('media-square')).toBeCloseTo(1, 1);
  const image = ok.locator('img');
  expect(await image.evaluate(el => getComputedStyle(el).objectFit)).toBe('cover');
  expect(await page.getByTestId('media-square').locator('img').evaluate(el => getComputedStyle(el).objectFit)).toBe('contain');
  // A failed image becomes readable text in a frame of the same shape, with no broken-image icon.
  const broken = page.getByTestId('media-broken');
  await expect(broken.locator('[data-state="error"]')).toHaveText('Missing picture');
  await expect(broken.locator('img')).toHaveCount(0);
  await expect(broken.locator('figcaption')).toHaveText('Nothing loaded');
  expect(await ratio('media-broken')).toBeCloseTo(16 / 9, 1);
  // Hover decoration moves the image but nothing else, and reduced motion keeps it still.
  const square = page.getByTestId('media-square');
  await square.hover();
  await expect.poll(() => square.locator('img').evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await square.locator('img').evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await expect(square.getByRole('img', { name: 'Square hillside' })).toBeVisible();
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
    const result = await new AxeBuilder({ page }).include('#x4-effects').include('#x4-media').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
  }
});
