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

const readDownload = async (page: Page, name: string) => {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name }).click()]);
  const { readFileSync } = await import('node:fs');
  return { filename: download.suggestedFilename(), content: readFileSync((await download.path())!, 'utf8') };
};

test('copy and download deliver exactly the displayed export, with byte counts', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/ai/context');
  await pickMode(page, 'Task');
  await page.getByRole('checkbox', { name: /^Button/ }).check();
  const json = (await jsonText(page))!;
  const markdown = (await markdownText(page))!;
  const bytes = (text: string) => Buffer.byteLength(text, 'utf8').toLocaleString('en-US');

  const exportsPanel = page.getByRole('region', { name: 'Copy or download' });
  await expect(exportsPanel).toContainText('not token counts');
  await expect(exportsPanel.locator('div', { hasText: /^JSON/ }).first()).toContainText(`${bytes(json)} bytes`);
  await expect(exportsPanel.locator('div', { hasText: /^Markdown/ }).first()).toContainText(`${bytes(markdown)} bytes`);

  await page.getByRole('button', { name: 'Copy JSON context' }).click();
  await expect(page.getByText('JSON copied to clipboard.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(json);
  await page.getByRole('button', { name: 'Copy Markdown context' }).click();
  await expect(page.getByText('Markdown copied to clipboard.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(markdown);

  const jsonFile = await readDownload(page, 'Download JSON');
  expect(jsonFile.filename).toBe('seeyesyes.task-button.context.json');
  expect(jsonFile.content).toBe(json);
  expect(Buffer.byteLength(jsonFile.content, 'utf8').toLocaleString('en-US')).toBe(bytes(json));
  const mdFile = await readDownload(page, 'Download Markdown');
  expect(mdFile.filename).toBe('seeyesyes.task-button.context.md');
  expect(mdFile.content).toBe(markdown);
  await expect(page.getByText('Saved seeyesyes.task-button.context.md.')).toBeVisible();
});

test('the settings download is the applied WorkspaceSettings without a cache', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.getByRole('combobox', { name: 'Workspace appearance' }).selectOption('light');
  await expect(page.getByText('Appearance saved.')).toBeVisible();
  await page.goto('/ai/context');
  const file = await readDownload(page, 'Download settings JSON');
  expect(file.filename).toBe('seeyesyes.settings.json');
  const settings = JSON.parse(file.content);
  expect(Object.keys(settings).sort()).toEqual(['appearance', 'settingsVersion', 'theme']);
  expect(settings).toMatchObject({ settingsVersion: 1, appearance: 'light', theme: { id: 'custom', basedOn: 'default', radius: 'curvy' } });
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('seeyesyes:settings:v1')!));
  expect(settings).toEqual(stored.settings);
});

test('copy and download failures and empty selections give clear feedback', async ({ page }) => {
  // No clipboard permission: the shared copy pattern reports the failure.
  await page.goto('/ai/context');
  await page.getByRole('button', { name: 'Copy JSON context' }).click();
  await expect(page.getByText('Could not copy. Check clipboard access and try again.')).toBeVisible();

  await page.evaluate(() => { URL.createObjectURL = () => { throw new Error('blocked'); }; });
  await page.getByRole('button', { name: 'Download JSON' }).click();
  await expect(page.getByText('The file could not be saved.')).toBeVisible();

  // Task mode with nothing selected offers no export at all.
  await pickMode(page, 'Task');
  await expect(page.getByRole('heading', { name: 'Select a component to export' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download JSON' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Copy JSON context' })).toHaveCount(0);
});
