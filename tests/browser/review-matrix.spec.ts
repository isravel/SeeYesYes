import { test, expect, type Page } from '@playwright/test';

const views = ['/', '/getting-started', '/system/theme', '/system/tokens', '/system/rules', '/components', '/components/button', '/layouts', '/ai/context', '/accessibility', '/validation', '/playground', '/docs', '/docs/setup'];
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth);

test('no page-level overflow at 320, 768, 1280, and 1920px in both appearances (A14)', async ({ page }) => {
  test.setTimeout(300_000);
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const width of [320, 768, 1280, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of views) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
        expect(await overflow(page), `${scheme} ${width} ${path}`).toBeLessThanOrEqual(width);
      }
    }
  }
});

test('200% zoom stays usable: a 640px layout viewport reflows without overflow and keeps its controls reachable (A14)', async ({ page }) => {
  test.setTimeout(200_000);
  await page.setViewportSize({ width: 640, height: 450 });
  for (const path of views) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
    expect(await overflow(page), path).toBeLessThanOrEqual(640);
  }
  // Primary controls remain operable at this size.
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Workspace' })).toBeVisible();
});

const radii = ['sharp', 'soft', 'curvy'] as const;
const densities = ['compact', 'comfortable', 'spacious'] as const;

test('every radius and density combination renders the preview without overflow, at narrow and wide widths, in both appearances', async ({ page }) => {
  test.setTimeout(300_000);
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/system/theme');
      await expect(page.locator('#theme-editor-preview')).toBeVisible({ timeout: 15_000 });
      for (const radius of radii) for (const density of densities) {
        await page.getByRole('combobox', { name: 'Corner shape' }).selectOption(radius);
        await page.getByRole('combobox', { name: 'Density' }).selectOption(density);
        const vars = await page.locator('#theme-editor-preview').evaluate(el => ({ radius: getComputedStyle(el).getPropertyValue('--sys-radius-control').trim(), row: getComputedStyle(el).getPropertyValue('--sys-spacing-row-height').trim() }));
        expect(vars.radius, `${radius}`).toBe(radius === 'sharp' ? '0rem' : radius === 'soft' ? '0.5rem' : '1rem');
        expect(vars.row, `${density}`).toBe(density === 'compact' ? '2.75rem' : density === 'comfortable' ? '3rem' : '3.5rem');
        expect(await overflow(page), `${scheme} ${width} ${radius} ${density}`).toBeLessThanOrEqual(width);
      }
    }
  }
});

test('representative combinations are captured as screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  for (const [scheme, radius, density] of [['light', 'sharp', 'compact'], ['dark', 'soft', 'comfortable'], ['light', 'curvy', 'spacious'], ['dark', 'curvy', 'compact']] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/system/theme');
    await page.getByRole('combobox', { name: 'Corner shape' }).selectOption(radius);
    await page.getByRole('combobox', { name: 'Density' }).selectOption(density);
    await page.getByRole('combobox', { name: 'Preview appearance' }).selectOption(scheme);
    await page.locator('#theme-editor-preview').screenshot({ path: `docs/evidence/M7/screenshots/preview-${scheme}-${radius}-${density}.png` });
  }
});

test('Button, Input, and Card keep the same internal styles standalone, nested, and in an overlay under the same theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  const style = (locator: ReturnType<Page['locator']>) => locator.evaluate(el => {
    const s = getComputedStyle(el);
    return { fontSize: s.fontSize, fontWeight: s.fontWeight, padding: s.padding, borderRadius: s.borderRadius, backgroundColor: s.backgroundColor, color: s.color, minHeight: s.minHeight, borderTopWidth: s.borderTopWidth, borderTopColor: s.borderTopColor, boxShadow: s.boxShadow };
  });
  // Button: standalone (component detail), nested in a card (layouts), and in an overlay (dialog).
  await page.goto('/components/button');
  const standalone = await style(page.getByTestId('component-preview').getByRole('button'));
  await page.goto('/components/dialog');
  await page.getByRole('button', { name: 'Open settings' }).click();
  const dialogButtons = page.getByRole('dialog').getByRole('button');
  const overlayClose = await style(dialogButtons.first());
  await page.goto('/playground');
  await page.getByRole('combobox', { name: 'Component' }).selectOption('card');
  await expect(page.getByTestId('playground-stage')).toBeVisible();
  // Nested: a primary Button inside a Card on the layouts screen (dashboard has none, settings has one).
  await page.goto('/layouts');
  const nested = await style(page.locator('#layout-settings').getByRole('button', { name: 'Save changes' }));
  // Parent-owned placement may differ; the component's own computed look must not.
  expect(nested).toEqual(standalone);
  expect(overlayClose.fontSize).toBe(standalone.fontSize);
  expect(overlayClose.borderRadius).toBe(standalone.borderRadius);
  expect(overlayClose.minHeight).toBe(standalone.minHeight);

  // Input: standalone versus nested in a form field on layouts.
  await page.goto('/components/input');
  const inputStandalone = await style(page.getByTestId('component-preview').getByRole('textbox'));
  await page.goto('/layouts');
  const inputNested = await style(page.locator('#layout-settings').getByRole('textbox', { name: 'Display name' }));
  for (const key of ['fontSize', 'padding', 'borderRadius', 'minHeight', 'borderTopWidth', 'borderTopColor', 'backgroundColor', 'color'] as const) expect(inputNested[key], `Input ${key}`).toBe(inputStandalone[key]);

  // Card: standalone versus nested on layouts.
  await page.goto('/components/card');
  const cardStandalone = await style(page.getByTestId('component-preview').locator('[data-variant]').first());
  await page.goto('/layouts');
  const cardNested = await style(page.locator('#layout-dashboard [data-variant="default"]').first());
  for (const key of ['padding', 'borderRadius', 'backgroundColor', 'color', 'borderTopWidth'] as const) expect(cardNested[key], `Card ${key}`).toBe(cardStandalone[key]);
});
