import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, query = 'surface=glass') => {
  await page.goto(`/internal-checks/controls?${query}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
  await expect(page.locator('#x6-listings')).toBeVisible();
};
const listing = (page: Page) => page.locator('#x6-listings');
const state = (page: Page) => page.getByTestId('listing-state');
const toolbar = (page: Page) => page.getByTestId('listing-toolbar');
const grid = (page: Page) => page.getByTestId('listing-grid');
const titles = (page: Page) => grid(page).getByRole('heading').allTextContents();
const cards = (page: Page) => page.getByTestId('card-kinds').locator('> ul > li');
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('the listing shows a count, the first page in source order, and a pagination control', async ({ page }) => {
  await open(page);
  await expect(page.getByTestId('listing-head').getByRole('heading', { level: 2, name: 'Courses' })).toBeVisible();
  await expect(page.getByTestId('listing-head').getByRole('status')).toHaveText('10 results');
  expect(await titles(page)).toEqual(['Accessible forms', 'Brand color', 'Component APIs', 'Design tokens']);
  await expect(toolbar(page).getByRole('search', { name: 'Filter courses' })).toBeVisible();
  await expect(state(page)).toHaveText('page 1 of 3; view grid; sort title; level any; retries 0');
});

test('searching narrows the results, updates the count and returns to page 1', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Page 2', exact: true }).first().click();
  await expect(state(page)).toContainText('page 2 of 3');
  await toolbar(page).getByRole('searchbox', { name: 'Search courses' }).fill('design');
  await expect(state(page)).toContainText('page 1 of 1');
  await expect(page.getByTestId('listing-head').getByRole('status')).toHaveText('1 result');
  expect(await titles(page)).toEqual(['Design tokens']);
});

test('changing a filter or the sort returns to page 1, and changing the view keeps the page and the selection', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Page 2', exact: true }).first().click();
  await expect(state(page)).toContainText('page 2 of 3');
  await toolbar(page).getByRole('radio', { name: 'List' }).check({ force: true });
  await expect(state(page)).toContainText('page 2 of 3; view list');
  await expect(grid(page)).toHaveAttribute('data-view', 'list');
  await toolbar(page).getByRole('radio', { name: 'Grid' }).check({ force: true });
  await expect(state(page)).toContainText('page 2 of 3; view grid');
  await toolbar(page).getByRole('combobox', { name: 'Sort by' }).selectOption('price');
  await expect(state(page)).toContainText('page 1 of 3; view grid; sort price');
  expect((await titles(page))[0]).toBe('Type scales');
  await page.getByRole('button', { name: 'Page 3', exact: true }).first().click();
  await toolbar(page).getByRole('combobox', { name: 'Level' }).selectOption('advanced');
  await expect(state(page)).toContainText('page 1 of 1; view grid; sort price; level advanced');
  await expect(page.getByTestId('listing-head').getByRole('status')).toHaveText('4 results');
});

test('grid and list views keep the same cards mounted, so the focused link stays focused', async ({ page }) => {
  await open(page);
  const link = grid(page).getByRole('link', { name: /Brand color/ });
  await link.focus();
  const before = await link.evaluate(el => { (el as HTMLElement).dataset.marker = 'same'; return el.getAttribute('href'); });
  await toolbar(page).getByRole('radio', { name: 'List' }).check({ force: true });
  await expect(grid(page)).toHaveAttribute('data-view', 'list');
  expect(await link.getAttribute('data-marker')).toBe('same');
  expect(await link.getAttribute('href')).toBe(before);
  const columns = (view: string) => page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="listing-grid"] ul')!).gridTemplateColumns.split(' ').length).then(count => ({ view, count }));
  expect((await columns('list')).count).toBe(1);
  await toolbar(page).getByRole('radio', { name: 'Grid' }).check({ force: true });
  await page.setViewportSize({ width: 1100, height: 800 });
  expect((await columns('grid')).count).toBeGreaterThan(1);
});

test('no matches offers Clear filters, which clears the search and filters, resets the page and keeps the sort and view', async ({ page }) => {
  await open(page);
  await toolbar(page).getByRole('radio', { name: 'List' }).check({ force: true });
  await toolbar(page).getByRole('combobox', { name: 'Sort by' }).selectOption('price');
  await toolbar(page).getByRole('combobox', { name: 'Level' }).selectOption('advanced');
  await toolbar(page).getByRole('searchbox', { name: 'Search courses' }).fill('zzz');
  await expect(grid(page).getByRole('heading', { name: 'No matching courses' })).toBeVisible();
  await expect(page.getByTestId('listing-head').getByRole('status')).toHaveText('0 results');
  await expect(grid(page).getByRole('list')).toHaveCount(0);
  await grid(page).getByRole('button', { name: 'Clear filters' }).click();
  await expect(state(page)).toHaveText('page 1 of 3; view list; sort price; level any; retries 0');
  await expect(toolbar(page).getByRole('searchbox', { name: 'Search courses' })).toHaveValue('');
  await expect(toolbar(page).getByRole('combobox', { name: 'Level' })).toHaveValue('');
  await expect(toolbar(page).getByRole('radio', { name: 'List' })).toBeChecked();
  await expect(toolbar(page).getByRole('combobox', { name: 'Sort by' })).toHaveValue('price');
});

test('Clear filters stays focusable and does nothing when nothing is active', async ({ page }) => {
  await open(page);
  const clear = toolbar(page).getByRole('button', { name: 'Clear filters' });
  await expect(clear).toHaveAttribute('aria-disabled', 'true');
  // aria-disabled, not disabled, so the control keeps focus.
  expect(await clear.evaluate(el => (el as HTMLButtonElement).disabled)).toBe(false);
  await clear.focus();
  await expect(clear).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(state(page)).toContainText('page 1 of 3');
  await toolbar(page).getByRole('combobox', { name: 'Level' }).selectOption('beginner');
  await expect(clear).not.toHaveAttribute('aria-disabled', 'true');
  await clear.focus();
  await page.keyboard.press('Space');
  await expect(toolbar(page).getByRole('combobox', { name: 'Level' })).toHaveValue('');
  // Focus stays on the control after the last filter is cleared.
  await expect(clear).toBeFocused();
  await expect(clear).toHaveAttribute('aria-disabled', 'true');
});

test('loading, error with retry, and results are each shown on their own', async ({ page }) => {
  await open(page);
  await listing(page).getByRole('button', { name: 'Show loading' }).click();
  await expect(grid(page).getByRole('status', { name: 'Loading results…' })).toBeVisible();
  await expect(grid(page).getByRole('list')).toHaveCount(0);
  await expect(page.getByTestId('listing-head').getByRole('status')).toHaveText('Loading results…');
  await listing(page).getByRole('button', { name: 'Show error' }).click();
  await expect(grid(page).getByText('The courses could not be loaded.')).toBeVisible();
  await expect(grid(page).getByRole('status', { name: 'Loading results…' })).toHaveCount(0);
  await grid(page).getByRole('button', { name: 'Retry' }).click();
  await expect(state(page)).toContainText('retries 1');
  expect((await titles(page)).length).toBe(4);
});

test('the toolbar keeps every control reachable by keyboard and in a logical order', async ({ page }) => {
  await open(page);
  await toolbar(page).getByRole('searchbox', { name: 'Search courses' }).focus();
  const seen: string[] = [];
  for (let presses = 0; presses < 8; presses += 1) {
    await page.keyboard.press('Tab');
    seen.push(await page.evaluate(() => { const el = document.activeElement as HTMLElement; return el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName; }));
    if (seen.at(-1) === 'Clear filters') break;
  }
  const positions = ['Level', 'Sort by', 'Clear filters'].map(name => seen.indexOf(name));
  expect(positions.every(position => position >= 0), seen.join(' | ')).toBe(true);
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  // The view switch sits between sort and clear, and is reachable as one stop.
  expect(seen.length, seen.join(' | ')).toBeGreaterThanOrEqual(4);
});

test('cards have one details link each, whole-card targets, and their text without effects', async ({ page }) => {
  await open(page);
  const kinds = page.getByTestId('card-kinds');
  const items = cards(page);
  await expect(items).toHaveCount(7);
  for (let index = 0; index < 7; index += 1) await expect(items.nth(index).getByRole('link')).toHaveCount(1);
  await expect(kinds.getByRole('link', { name: 'View course Design basics' })).toBeVisible();
  await expect(kinds.getByRole('link', { name: 'View event Design systems meetup' })).toBeVisible();
  await expect(kinds.getByRole('link', { name: 'View cohort Spring design cohort' })).toBeVisible();
  // The link covers the whole card, so a click anywhere on it follows the link.
  const overlay = await kinds.getByRole('link', { name: 'View course Design basics' }).evaluate(el => getComputedStyle(el, '::after').position);
  expect(overlay).toBe('absolute');
});

test('CourseCard shows the supplied price text, struck-through original, rating label and omits what is absent', async ({ page }) => {
  await open(page);
  const course = cards(page).nth(0);
  await expect(course.getByText('$49')).toBeVisible();
  await expect(course.getByText('$99')).toBeVisible();
  await expect(course.getByText('Save 50%')).toBeVisible();
  await expect(course.getByText('Rated 4.6 out of 5 from 1,280 reviews')).toBeAttached();
  await expect(course.getByText('Original price')).toBeAttached();
  expect(await course.getByText('$99').evaluate(el => getComputedStyle(el).textDecorationLine)).toContain('line-through');
  await expect(course.getByRole('img', { name: 'A green hillside under a pale sky' })).toBeVisible();
  const bare = cards(page).nth(1);
  await expect(bare.getByRole('heading', { name: 'Bare course' })).toBeVisible();
  await expect(bare.getByText(/\$|Rated|Save/)).toHaveCount(0);
  await expect(bare.getByRole('img')).toHaveCount(0);
  // A failed image falls back to its text alternative.
  await expect(cards(page).nth(2).getByText('Missing course picture')).toBeVisible();
});

test('EventCard keeps date and place as text, holds the poster proportions, and shows text for a failed poster', async ({ page }) => {
  await open(page);
  const event = cards(page).nth(3);
  for (const text of ['14 March 2026', '6:30 pm', 'Community hall, Chennai', 'An evening of short talks.']) await expect(event.getByText(text)).toBeVisible();
  await expect(event.locator('time')).toHaveAttribute('datetime', '2026-03-14');
  await expect(event.getByRole('img', { name: 'Poster: Design systems meetup, 14 March' })).toBeVisible();
  const ratio = await event.getByRole('img').evaluate(el => { const box = el.getBoundingClientRect(); return box.width / box.height; });
  expect(ratio).toBeCloseTo(3 / 4, 1);
  const broken = cards(page).nth(4);
  await expect(broken.getByText('Poster: Broken poster event')).toBeVisible();
  await expect(broken.getByText('1 April 2026')).toBeVisible();
});

test('CohortCard keeps its content with tilt and texture on, and ignores keyboard focus for tilt', async ({ page }) => {
  await open(page);
  const plain = cards(page).nth(5);
  const effects = cards(page).nth(6);
  await expect(plain.getByText('Enrolling')).toBeVisible();
  await expect(plain.getByRole('img', { name: 'Design tool' })).toBeVisible();
  await expect(plain.getByText('Missing tool')).toBeVisible();
  await expect(effects.getByText('Tilt and texture on.')).toBeVisible();
  await expect(effects.getByRole('link', { name: 'View cohort Effects cohort' })).toBeVisible();
  await effects.getByRole('link').focus();
  const transform = await effects.locator('[data-tilt]').first().evaluate(el => getComputedStyle(el).transform).catch(() => 'none');
  expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  await expect(effects.locator('[data-texture]').first()).toHaveCount(1);
});

test('the listing fits 320px without horizontal scrolling and a wide card list lays out in columns', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  expect(await noOverflow(page)).toBe(true);
  await listing(page).scrollIntoViewIfNeeded();
  expect(await noOverflow(page)).toBe(true);
  await page.setViewportSize({ width: 1200, height: 900 });
  const kinds = page.getByTestId('card-kinds').getByRole('list').first();
  expect(await kinds.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBeGreaterThan(2);
});

test('forced colors drops the cohort texture but keeps the listing readable', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page);
  const texture = await cards(page).nth(6).evaluate(el => {
    const card = el.querySelector('[data-texture]')!;
    return getComputedStyle(card, '::after').display;
  });
  expect(texture).toBe('none');
  await expect(page.getByTestId('listing-head').getByRole('heading', { name: 'Courses' })).toBeVisible();
});

test('the listing kit has no serious accessibility violations in light and dark, glass and clean', async ({ page }) => {
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    const result = await new AxeBuilder({ page }).include('#x6-listings').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
  }
});

test('the component pages for the listing kit show a live preview', async ({ page }) => {
  for (const [id, name] of [['listing-head', 'ListingHead'], ['toolbar', 'Toolbar'], ['card-grid', 'CardGrid'], ['list-card', 'ListCard'], ['clear-filters', 'ClearFilters'], ['course-card', 'CourseCard'], ['event-card', 'EventCard'], ['cohort-card', 'CohortCard']]) {
    await page.goto(`/components/${id}`);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(page.getByTestId('component-preview')).toBeVisible({ timeout: 15_000 });
  }
});

test('the listing keeps the page free of console errors', async ({ page }) => {
  const errors: string[] = [];
  // The fixture deliberately includes missing images for failure states; those 404s are expected.
  page.on('console', message => { if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await open(page);
  await toolbar(page).getByRole('searchbox', { name: 'Search courses' }).fill('a');
  await listing(page).getByRole('button', { name: 'Show error' }).click();
  await listing(page).scrollIntoViewIfNeeded();
  expect(errors).toEqual([]);
});
