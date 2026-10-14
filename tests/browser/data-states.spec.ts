import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const unavailable = { error: { code: 'DEMO_ERROR', message: 'The service is temporarily unavailable.' } };

/** Fail the first matching request, then let later ones (the Retry) through. */
async function failOnce(page: Page, pattern: string, mode: 'status' | 'network' = 'status') {
  let calls = 0;
  await page.route(pattern, route => {
    calls += 1;
    if (calls > 1) return route.continue();
    return mode === 'network' ? route.abort('failed') : route.fulfill({ status: 503, json: unavailable });
  });
  return () => calls;
}

/** Hold the first matching request so the loading state can be observed. */
async function slowOnce(page: Page, pattern: string) {
  let release: () => void = () => undefined;
  const held = new Promise<void>(resolve => { release = resolve; });
  let first = true;
  await page.route(pattern, async route => {
    if (first) { first = false; await held; }
    await route.continue();
  });
  return release;
}

const serious = async (page: Page) => (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');

const screens = [
  { name: 'Tokens', path: '/system/tokens', api: '**/api/tokens?*', loading: 'Loading tokens', ready: (page: Page) => page.locator('li#color\\.primary'), empty: 'No tokens yet', emptyLink: 'Show the normal tokens', noMatch: { box: 'Search tokens', title: 'No tokens match' } },
  { name: 'Components', path: '/components', api: '**/api/components?*', loading: 'Loading components', ready: (page: Page) => page.locator('li#button'), empty: 'No components yet', emptyLink: 'Show the normal catalog', noMatch: { box: 'Search components', title: 'No components match' } },
  { name: 'Component Detail', path: '/components/button', api: '**/api/components/button?*', loading: 'Loading component', ready: (page: Page) => page.getByRole('heading', { level: 1, name: 'Button', exact: true }), empty: null, emptyLink: null, noMatch: null },
];

for (const screen of screens) {
  test.describe(screen.name, () => {
    test('shows a named loading state, then the content', async ({ page }) => {
      const release = await slowOnce(page, screen.api);
      await page.goto(screen.path);
      const loading = page.getByRole('status', { name: screen.loading });
      await expect(loading).toBeVisible();
      expect(await serious(page)).toEqual([]);
      release();
      await expect(screen.ready(page)).toBeVisible();
      await expect(loading).toHaveCount(0);
    });

    test('shows an error with Retry for a failed request and recovers on retry', async ({ page }) => {
      const calls = await failOnce(page, screen.api);
      await page.goto(screen.path);
      await expect(page.getByText('The service is temporarily unavailable.')).toBeVisible();
      expect(await serious(page)).toEqual([]);
      await page.getByRole('button', { name: 'Retry' }).click();
      await expect(screen.ready(page)).toBeVisible();
      await expect(page.getByText('The service is temporarily unavailable.')).toHaveCount(0);
      expect(calls()).toBe(2);
    });

    test('shows an error with Retry when the network fails, and recovers', async ({ page }) => {
      await failOnce(page, screen.api, 'network');
      await page.goto(screen.path);
      await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
      await page.getByRole('button', { name: 'Retry' }).click();
      await expect(screen.ready(page)).toBeVisible();
    });

    test('the demo error scenario stays an error and keeps offering Retry', async ({ page }) => {
      await page.goto(`${screen.path}?scenario=error`);
      await expect(page.getByText(/deterministic error scenario/)).toBeVisible();
      await page.getByRole('button', { name: 'Retry' }).click();
      await expect(page.getByText(/deterministic error scenario/)).toBeVisible();
    });
  });
}

test('empty scenarios give a next action', async ({ page }) => {
  for (const screen of screens.filter(item => item.empty)) {
    await page.goto(`${screen.path}?scenario=empty`);
    await expect(page.getByRole('heading', { name: screen.empty! })).toBeVisible();
    expect(await serious(page)).toEqual([]);
    await page.getByRole('link', { name: screen.emptyLink! }).click();
    await expect(screen.ready(page)).toBeVisible();
  }
});

test('the detail empty (missing-data) scenario is an error with Retry, never an empty list', async ({ page }) => {
  await page.goto('/components/button?scenario=empty');
  await expect(page.getByText(/No data|no data|MISSING|missing/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /No components/ })).toHaveCount(0);
});

test('search with no matches offers Clear filters and recovers', async ({ page }) => {
  for (const screen of screens.filter(item => item.noMatch)) {
    await page.goto(screen.path);
    await expect(screen.ready(page)).toBeVisible();
    await page.getByRole('searchbox', { name: screen.noMatch!.box }).fill('zzz-no-such-thing');
    await expect(page.getByRole('heading', { name: screen.noMatch!.title })).toBeVisible();
    expect(await serious(page)).toEqual([]);
    await page.getByRole('button', { name: 'Clear filters' }).first().click();
    await expect(screen.ready(page)).toBeVisible();
  }
});

test('Component Detail recovers when the linked registry request fails', async ({ page }) => {
  const calls = await failOnce(page, '**/api/registry?*');
  await page.goto('/components/button');
  await expect(page.getByText('Linked data did not load')).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Props', exact: true })).toBeVisible();
  expect(calls()).toBe(2);
});

test('the registry request waits for the component and is skipped when the component fails', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', request => { const path = new URL(request.url()).pathname; if (path.startsWith('/api/')) requested.push(path); });
  await page.goto('/components/button?scenario=error');
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  expect(requested).toContain('/api/components/button');
  expect(requested).not.toContain('/api/registry');
});

test('unknown component IDs are a 404 with recovery in every scenario', async ({ page }) => {
  for (const scenario of ['normal', 'empty', 'error']) {
    const response = await page.goto(`/components/does-not-exist?scenario=${scenario}`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: 'Browse components' })).toBeVisible();
    expect(await serious(page)).toEqual([]);
  }
  const api = await page.request.get('/api/components/does-not-exist?scenario=error');
  expect(api.status()).toBe(404);
});
