import { test, expect, type Page } from '@playwright/test';
import { registry, defaultTheme } from '@/lib/data/registry';
import { createPersistenceEnvelope, SETTINGS_STORAGE_KEY } from '@/lib/theme/persistence';

const curvy = { ...defaultTheme, id: 'custom', basedOn: defaultTheme.id, radius: 'curvy' as const };
const seed = (page: Page, value: string) => page.addInitScript(({ key, value }) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('seeded', '1'); } }, { key: SETTINGS_STORAGE_KEY, value });
const rootVar = (page: Page, name: string) => page.locator('html').evaluate((el, n) => el.style.getPropertyValue(n), name);

test('first paint follows the OS mode at load, then hydration keeps the same values', async ({ page }) => {
  const envelope = createPersistenceEnvelope({ settingsVersion: 1, theme: curvy, appearance: 'system' }, 3, registry);
  await seed(page, JSON.stringify(envelope));
  // Block app scripts so only the inline bootstrap can have set anything.
  await page.route('**/_next/static/**/*.js', route => route.abort());

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  expect(await rootVar(page, '--sys-radius-control')).toBe('1rem');
  const darkBackground = await rootVar(page, '--sys-color-background');

  // The OS mode changed between visits: same stored envelope, different first paint.
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  expect(await rootVar(page, '--sys-color-background')).not.toBe(darkBackground);
  expect(await rootVar(page, '--sys-radius-control')).toBe('1rem');

  // Handoff: once scripts run, hydration adopts the same saved settings without falling back to defaults.
  await page.unroute('**/_next/static/**/*.js');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sys-radius-control').trim())).toBe('1rem');
  await expect(page.getByRole('combobox', { name: 'Workspace appearance' })).toHaveValue('system');
});

test('a stale or corrupt cache renders defaults first, then validated settings or a notice', async ({ page }) => {
  const good = createPersistenceEnvelope({ settingsVersion: 1, theme: curvy, appearance: 'light' }, 3, registry);
  await seed(page, JSON.stringify({ ...good, bootstrap: { ...good.bootstrap, themeRevision: 2 } }));
  await page.route('**/_next/static/**/*.js', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await rootVar(page, '--sys-radius-control')).toBe('');
  await page.unroute('**/_next/static/**/*.js');
  await page.reload();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sys-radius-control').trim())).toBe('1rem');
});

test('corrupt saved settings fall back to defaults with a notice and can be replaced by Apply', async ({ page }) => {
  await seed(page, '{corrupt');
  await page.goto('/system/theme');
  await expect(page.getByText('Saved settings could not be read.')).toBeVisible();
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SETTINGS_STORAGE_KEY);
  expect(saved).toMatchObject({ themeRevision: 1, settings: { theme: { radius: 'curvy' } } });
});

test('changing workspace appearance leaves an open draft alone, persists, and Apply keeps it', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();

  await page.getByRole('combobox', { name: 'Workspace appearance' }).selectOption('dark');
  await expect(page.getByText('Appearance saved.')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await expect(page.getByRole('combobox', { name: 'Density' })).toHaveValue('compact');
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();
  // The preview keeps its own appearance.
  await expect(page.locator('#theme-editor-preview')).toHaveAttribute('data-appearance', 'light');

  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await expect(page.getByRole('combobox', { name: 'Workspace appearance' })).toHaveValue('dark');
  await expect(page.getByRole('combobox', { name: 'Density' })).toHaveValue('compact');
});

test('appearance and theme saved from two tabs preserve each other', async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto('/system/theme');
  await second.goto('/system/theme');
  await Promise.all([
    first.getByRole('combobox', { name: 'Workspace appearance' }).selectOption('dark'),
    (async () => {
      await second.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
      await second.getByRole('button', { name: 'Apply to workspace' }).click();
    })(),
  ]);
  await expect(second.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await expect.poll(async () => first.evaluate(key => JSON.parse(localStorage.getItem(key)!).settings, SETTINGS_STORAGE_KEY)).toMatchObject({ appearance: 'dark', theme: { radius: 'curvy' } });
  // Each tab adopts the latest envelope.
  await expect(second.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await expect.poll(() => first.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sys-radius-control').trim())).toBe('1rem');
});
