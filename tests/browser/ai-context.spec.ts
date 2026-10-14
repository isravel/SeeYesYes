import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { registry } from '@/lib/data/registry';

const pickMode = (page: Page, label: string) => page.getByRole('radio', { name: label, exact: true }).check();
const view = (page: Page, name: 'Human' | 'JSON' | 'Markdown') => page.getByRole('tab', { name, exact: true }).click();
const jsonText = async (page: Page) => { await view(page, 'JSON'); return page.getByLabel('Context JSON').locator('code').textContent(); };
const markdownText = async (page: Page) => { await view(page, 'Markdown'); return page.getByLabel('Context Markdown').locator('code').textContent(); };
const humanIds = async (page: Page) => { await view(page, 'Human'); return page.locator('[role="tabpanel"] [data-id]').evaluateAll(els => els.map(el => el.getAttribute('data-id'))); };

test('overview is selected first and shows identity, labels, and the whole catalog in all three views', async ({ page }) => {
  await page.goto('/ai/context');
  await expect(page.getByRole('radio', { name: 'Overview', exact: true })).toBeChecked();
  const summary = page.getByRole('region', { name: 'Export summary' });
  await expect(summary).toContainText('Schema1.0');
  await expect(summary).toContainText('Modeoverview');
  await expect(summary).toContainText('Scopeapplied-theme');
  await expect(summary).toContainText('Themedefault');
  await expect(summary).toContainText('Appearancesystem');
  await expect(page.getByLabel('Export counts')).toContainText(`${registry.components.length} components`);

  const ids = await humanIds(page);
  expect(ids).toEqual(registry.components.map(c => c.id).sort());
  const json = JSON.parse((await jsonText(page))!);
  expect(json.mode).toBe('overview');
  expect(json.catalog.map((c: { id: string }) => c.id)).toEqual(ids);
  const markdown = (await markdownText(page))!;
  expect(markdown).toContain('overview context · schema 1.0 · scope applied-theme · theme default');
  for (const id of ids) expect(markdown).toContain(`(\`${id}\`)`);
  for (const principle of registry.principles) expect(markdown).toContain(principle);
});

test('task mode needs a selection, explains dependencies, and the three views agree', async ({ page }) => {
  await page.goto('/ai/context');
  await pickMode(page, 'Task');
  await expect(page.getByRole('heading', { name: 'Select a component to export' })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Find components' }).fill('dialog');
  await page.getByRole('checkbox', { name: /Dialog/ }).check();
  await page.getByRole('searchbox', { name: 'Find components' }).fill('zzz');
  await expect(page.getByText(/No components match/)).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();

  const dialog = registry.components.find(c => c.id === 'dialog')!;
  await expect(page.getByText('Requested (1): dialog')).toBeVisible();
  const json = JSON.parse((await jsonText(page))!);
  expect(json.mode).toBe('task');
  expect(json.selection.requestedComponentIds).toEqual(['dialog']);
  const included: string[] = json.selection.includedComponentIds;
  expect(included).toContain('dialog');
  for (const id of dialog.composition.allowedComponentIds) expect(included).toContain(id);
  await expect(page.getByText(new RegExp(`Included automatically as dependencies \\(${included.length - 1}\\)`))).toBeVisible();
  await expect(page.getByLabel('Export counts')).toContainText(`${json.components.length} components`);
  await expect(page.getByLabel('Export counts')).toContainText(`${json.tokens.length} tokens`);
  await expect(page.getByLabel('Export counts')).toContainText(`${json.rules.length} rules`);
  await expect(page.getByLabel('Export counts')).toContainText(`${json.examples.length} examples`);
  for (const ref of json.referencedComponents) await expect(page.locator('p', { hasText: 'Referenced only' })).toContainText(ref.id);

  // Human, JSON, and Markdown carry the same components, tokens, rules, and examples.
  const ids = await humanIds(page);
  const expected = [...json.components.map((c: { id: string }) => c.id), ...json.tokens.map((t: { id: string }) => t.id), ...json.rules.map((r: { id: string }) => r.id), ...json.examples.map((e: { id: string }) => e.id)];
  expect(ids).toEqual(expected);
  const markdown = (await markdownText(page))!;
  for (const id of expected) expect(markdown).toContain(id);
  expect(markdown).toContain(`Requested: dialog`);

  // Unchecking everything returns to the empty state.
  await page.getByRole('checkbox', { name: /Dialog/ }).uncheck();
  await expect(page.getByRole('heading', { name: 'Select a component to export' })).toBeVisible();
});

test('full mode includes everything', async ({ page }) => {
  await page.goto('/ai/context');
  await pickMode(page, 'Full');
  const json = JSON.parse((await jsonText(page))!);
  expect(json.mode).toBe('full');
  expect(json.components).toHaveLength(registry.components.length);
  expect(json.tokens).toHaveLength(registry.tokens.length);
  expect(json.system.rules).toHaveLength(registry.rules.length);
  expect(json.system.examples).toHaveLength(registry.examples.length);
  await expect(page.getByLabel('Export counts')).toContainText(`${registry.tokens.length} tokens`);
  expect(await markdownText(page)).toContain('## Layouts');
});

test('exports follow the applied theme and appearance, and ignore an unapplied draft', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('combobox', { name: 'Button variant default' }).selectOption('ghost');
  await page.getByRole('combobox', { name: 'Workspace appearance' }).selectOption('dark');
  await expect(page.getByText('Appearance saved.')).toBeVisible();

  const open = async () => {
    await page.goto('/ai/context');
    await pickMode(page, 'Task');
    await page.getByRole('checkbox', { name: /^Button/ }).check();
  };
  await open();
  const draftOnly = JSON.parse((await jsonText(page))!);
  expect(draftOnly.themeId).toBe('default');
  expect(draftOnly.appearance).toBe('dark');
  expect(draftOnly.theme.radius).not.toBe('curvy');

  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('combobox', { name: 'Button variant default' }).selectOption('ghost');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await open();
  const applied = JSON.parse((await jsonText(page))!);
  expect(applied).toMatchObject({ themeId: 'custom', basedOnThemeId: 'default', appearance: 'dark', scope: 'applied-theme' });
  expect(applied.theme.radius).toBe('curvy');
  expect(applied.components.find((c: { id: string }) => c.id === 'button').effectiveDefaults.variant).toBe('ghost');
  await expect(page.getByRole('region', { name: 'Export summary' })).toContainText('custom (based on default)');
  expect(await markdownText(page)).toContain('theme custom (based on default)');
});

test('loading, error, and missing-data states offer Retry, and the page fits and passes axe', async ({ page }) => {
  await page.goto('/ai/context?scenario=error');
  await expect(page.getByText(/deterministic error scenario/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await page.goto('/ai/context?scenario=empty');
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(0);

  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/ai/context');
    await pickMode(page, 'Task');
    await page.getByRole('checkbox', { name: /^Button/ }).check();
    await expect(page.getByRole('region', { name: 'Export summary' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(serious).toEqual([]);
  }
});
