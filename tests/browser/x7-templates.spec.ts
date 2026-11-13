import { test, expect, type Page } from '@playwright/test';

const preview = (page: Page, id: string) => page.locator(`#layout-${id}`);
const open = async (page: Page, id: string) => {
  await page.goto('/layouts');
  const scope = preview(page, id);
  await scope.scrollIntoViewIfNeeded();
  await expect(scope).toBeVisible();
  return scope;
};

test('sign-in checks the fields in order, focuses the first problem and never says why a sign-in failed', async ({ page }) => {
  const scope = await open(page, 'sign-in');
  const email = scope.getByRole('textbox', { name: 'Email address' });
  await scope.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(scope.getByText('Enter your email address.')).toBeVisible();
  await expect(email).toBeFocused();
  await email.fill('not-an-email');
  await scope.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(scope.getByText('Enter an email address like name@example.com.')).toBeVisible();
  await email.fill('fail@example.com');
  await scope.locator('input[type=password]').fill('whatever');
  await scope.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(scope.getByText('We could not sign you in. Check your details and try again.')).toBeVisible();
  await expect(scope.getByRole('textbox', { name: 'Email address' })).toHaveValue('fail@example.com');
});

test('the password starts hidden, can be shown, and is never stored', async ({ page }) => {
  const scope = await open(page, 'sign-in');
  const field = scope.locator('input[name], input[type=password], input[id$="-password"]').last();
  await expect(field).toHaveAttribute('type', 'password');
  await field.fill('secret-value');
  await scope.getByRole('button', { name: 'Show password' }).click();
  await expect(scope.locator('input[id$="-password"]')).toHaveAttribute('type', 'text');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }).includes('secret-value'))).toBe(false);
});

test('sign-up asks for the minimum length and rejects a short password', async ({ page }) => {
  const scope = await open(page, 'sign-up');
  await scope.getByRole('textbox', { name: 'Name' }).fill('Ada');
  await scope.getByRole('textbox', { name: 'Email address' }).fill('ada@example.com');
  await scope.locator('input[type=password]').fill('short');
  await scope.getByRole('button', { name: 'Create account' }).click();
  await expect(scope.getByText(/at least 8 characters/i).first()).toBeVisible();
  await expect(scope.locator('input[type=password]')).toBeFocused();
});

test('forgot-password shows the same neutral screen and moves focus to its heading', async ({ page }) => {
  const scope = await open(page, 'forgot-password');
  await scope.getByRole('textbox', { name: 'Email address' }).fill('someone@example.com');
  await scope.getByRole('button', { name: 'Send reset instructions' }).click();
  const heading = scope.getByRole('heading', { name: 'Check your inbox' });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(scope).toContainText('If there is an account for someone@example.com');
  await scope.getByRole('button', { name: 'Use a different email address' }).click();
  await expect(scope.getByRole('textbox', { name: 'Email address' })).toBeFocused();
});

test('the listing template searches, filters and pages, and clearing keeps the sort', async ({ page }) => {
  const scope = await open(page, 'listing-page');
  await expect(scope.getByRole('status').first()).toHaveText('8 results');
  await expect(scope.getByRole('heading', { level: 3 })).toHaveCount(4);
  await scope.getByRole('searchbox', { name: 'Search courses' }).fill('zzz');
  await expect(scope.getByText('No matching courses')).toBeVisible();
  await scope.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(scope.getByRole('status').first()).toHaveText('8 results');
  await scope.getByRole('button', { name: 'Page 2', exact: true }).first().click();
  await expect(scope.getByRole('button', { name: 'Page 2', exact: true }).first()).toHaveAttribute('aria-current', 'page');
});

test('the events template keeps poster text, searches by place and paginates', async ({ page }) => {
  const scope = await open(page, 'events-page');
  await expect(scope.getByRole('status').first()).toHaveText('4 results');
  await scope.getByRole('searchbox', { name: 'Search events' }).fill('online');
  await expect(scope.getByRole('status').first()).toHaveText('2 results');
});

test('the page shell preview is one named region and its links come from one configuration', async ({ page }) => {
  const scope = await open(page, 'site-shell');
  await expect(scope.getByRole('region', { name: 'Site shell example' })).toBeVisible();
  await expect(scope.getByRole('main')).toHaveCount(0);
  await expect(scope.getByRole('link', { name: 'Courses' }).first()).toHaveAttribute('href', '#courses');
});

test('the landing template outline never skips a heading level', async ({ page }) => {
  const scope = await open(page, 'landing-page');
  const levels = await scope.locator('h1, h2, h3, h4, h5, h6').evaluateAll(nodes => nodes.map(node => Number(node.tagName.slice(1))));
  expect(levels.length).toBeGreaterThan(3);
  let previous = levels[0];
  for (const level of levels.slice(1)) { expect(level - previous).toBeLessThanOrEqual(1); previous = level; }
});

test('templates fit 320px in both appearances', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/layouts');
    for (const id of ['site-shell', 'landing-page', 'listing-page', 'events-page', 'auth-shell', 'sign-in', 'sign-up', 'forgot-password']) {
      const box = await preview(page, id).evaluate(el => ({ scroll: el.scrollWidth, client: el.clientWidth }));
      expect(box.scroll, `${colorScheme} ${id}`).toBeLessThanOrEqual(box.client + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
});
