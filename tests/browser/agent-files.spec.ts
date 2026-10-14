import { test, expect } from '@playwright/test';
import { registry } from '@/lib/data/registry';
import { buildLlmsFullTxt, buildLlmsTxt } from '@/lib/contract/agent-files';
import { loadArticles, loadGuides } from '@/lib/docs/articles';
import { createContext } from '@/lib/contract/context';
import { contextMarkdown } from '@/lib/contract/serialize';
import { defaultTheme } from '@/lib/data/registry';

test('/llms.txt and /llms-full.txt are served as text, generated from the registry and default theme', async ({ request }) => {
  const short = await request.get('/llms.txt');
  expect(short.status()).toBe(200);
  expect(short.headers()['content-type']).toContain('text/plain');
  expect(await short.text()).toBe(buildLlmsTxt(registry, loadArticles(registry)));
  const full = await request.get('/llms-full.txt');
  expect(full.status()).toBe(200);
  expect(full.headers()['content-type']).toContain('text/plain');
  const text = await full.text();
  expect(text).toBe(buildLlmsFullTxt(registry, loadGuides()));
  expect(text).toContain('scope default-theme');
  // Every link in llms.txt resolves to a real page.
  const links = new Set([...(await short.text()).matchAll(/\]\((\/[^)]*)\)/g), ...text.matchAll(/\]\((\/[^)]*)\)/g)].map(m => m[1].split('#')[0]));
  expect(links.has('/getting-started') && links.has('/docs/concepts')).toBe(true);
  for (const path of links) expect((await request.get(path)).status(), path).toBe(200);
});

test('the AI Context screen links the agent files and says they use the default theme', async ({ page }) => {
  await page.goto('/ai/context');
  const note = page.getByText(/Agent files for the default theme/);
  await expect(note).toBeVisible();
  await expect(page.getByRole('link', { name: '/llms.txt', exact: true })).toHaveAttribute('href', '/llms.txt');
  await expect(page.getByRole('link', { name: '/llms-full.txt', exact: true })).toHaveAttribute('href', '/llms-full.txt');
});

test('Copy for LLM copies the component task export under the applied theme and reports the result', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/button');
  await page.getByRole('button', { name: 'Copy for LLM' }).click();
  await expect(page.getByText('Copied the task export for LLM use.')).toBeVisible();
  const defaultCopy = await page.evaluate(() => navigator.clipboard.readText());
  // The copied text is exactly the task export the screen would produce for this component under the applied theme.
  expect(defaultCopy).toBe(contextMarkdown(createContext(registry, { mode: 'task', componentIds: ['button'], settings: { settingsVersion: 1, theme: defaultTheme, appearance: 'system' } })));
  expect(defaultCopy).toContain('task context · schema 1.0 · scope applied-theme · theme default');
  expect(defaultCopy).toContain('Requested: button');
  expect(defaultCopy).toContain('### Button (`button`)');

  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.goto('/components/button');
  await page.getByRole('button', { name: 'Copy for LLM' }).click();
  const appliedCopy = await page.evaluate(() => navigator.clipboard.readText());
  expect(appliedCopy).toContain('theme custom (based on default)');
  expect(appliedCopy).toMatch(/\| radius\.control \| `--sys-radius-control` \| radius \| 1rem \|/);
  expect(appliedCopy).not.toBe(defaultCopy);
});

test('Copy for LLM reports a clipboard failure', async ({ page }) => {
  await page.goto('/components/spinner');
  await page.getByRole('button', { name: 'Copy for LLM' }).click();
  await expect(page.getByText('Could not copy. Check clipboard access and try again.')).toBeVisible();
});
