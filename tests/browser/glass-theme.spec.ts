import { test, expect, type Page } from '@playwright/test';

const settingsKey = 'seeyesyes:settings:v1';
const glassVars = (page: Page) => page.locator('html').evaluate(el => {
  const style = getComputedStyle(el);
  return { blur: style.getPropertyValue('--sys-effect-glass-blur').trim(), tint: style.getPropertyValue('--sys-color-glass-tint').trim() };
});

test('the default workspace stays clean: no blur, opaque tint', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', /light|dark/);
  const vars = await glassVars(page);
  expect(vars.blur).toBe('0px');
  expect(vars.tint).toMatch(/\/ 1\)$/);
});

test('a saved glass theme applies before paint and survives reload', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Surface effect' }).selectOption('glass');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect.poll(() => glassVars(page).then(v => v.blur)).toBe('20px');
  await page.reload();
  // The bootstrap script writes the cached values before React hydrates, so they are present once the document is parsed.
  expect((await glassVars(page)).blur).toBe('20px');
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), settingsKey);
  expect(saved.settings.theme.effects.surface).toBe('glass');
  expect(saved.bootstrap.resolverVersion).toBe('1.3');
});

test('a cache from the previous resolver is rebuilt, keeping the saved glass theme', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Surface effect' }).selectOption('glass');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect.poll(() => glassVars(page).then(v => v.blur)).toBe('20px');
  await page.evaluate(key => { const e = JSON.parse(localStorage.getItem(key)!); e.bootstrap.resolverVersion = '1.1'; localStorage.setItem(key, JSON.stringify(e)); }, settingsKey);
  await page.reload();
  await expect.poll(() => glassVars(page).then(v => v.blur)).toBe('20px');
});

test('Card and Dialog use backdrop blur under glass and an opaque surface without blur, in a nested scope', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Surface effect' }).selectOption('glass');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await page.goto('/components/backdrop');
  const preview = page.getByTestId('component-preview');
  await expect(preview).toBeVisible({ timeout: 15_000 });
  const card = preview.locator('[data-surface="glass"]').first();
  await expect(card).toBeVisible();
  expect(await card.evaluate(el => getComputedStyle(el).backdropFilter)).toContain('blur(20px)');

  await page.goto('/components/dialog');
  await page.getByRole('button', { name: 'Open settings' }).click();
  const modal = page.locator('[data-surface="glass"][data-size]').first();
  await expect(modal).toBeVisible();
  expect(await modal.evaluate(el => getComputedStyle(el).backdropFilter)).toContain('blur(20px)');
  await page.keyboard.press('Escape');

  // Forced colors take the opaque fallback: the filter is removed and the fill is the solid surface color.
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/components/backdrop');
  await expect(preview).toBeVisible({ timeout: 15_000 });
  const forced = await preview.locator('[data-surface="glass"]').first().evaluate(el => getComputedStyle(el).backdropFilter);
  expect(forced).toBe('none');
});

test('ThemeSwitcher keeps one stable name, exposes the current choice, and changes the workspace', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/components/theme-switcher');
  const preview = page.getByTestId('component-preview');
  await expect(preview).toBeVisible({ timeout: 15_000 });
  const group = preview.getByRole('group', { name: 'Theme', exact: true });
  await expect(group).toBeVisible();
  await expect(group.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');
  await group.getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  await expect(group.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
  await expect(preview.getByRole('group', { name: 'Theme', exact: true })).toBeVisible();
  // The header selector is the same store, so it agrees.
  await expect(page.getByRole('combobox', { name: 'Workspace appearance' })).toHaveValue('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
});

test('Backdrop decoration is hidden from assistive technology and never takes pointer input', async ({ page }) => {
  await page.goto('/components/backdrop');
  const preview = page.getByTestId('component-preview');
  await expect(preview).toBeVisible({ timeout: 15_000 });
  const layers = preview.locator('[aria-hidden="true"]').first();
  expect(await layers.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
  await expect(preview.getByRole('heading', { name: 'Glass panel' })).toBeVisible();
});
