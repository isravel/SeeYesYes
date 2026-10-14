import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { registry } from '@/lib/data/registry';
import { withRootLinks } from '@/lib/docs/markdown';

const guide = (slug: string) => readFileSync(`content/docs/${slug}.md`, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '').trim();
const slugs = ['concepts', 'configuration', 'context', 'accessibility', 'setup', 'reference-components', 'reference-tokens', 'reference-rules'];

test('the index lists hand-written guides apart from generated reference', async ({ page }) => {
  await page.goto('/docs');
  await expect(page.getByRole('heading', { level: 1, name: 'Documentation' })).toBeVisible();
  const guides = page.getByRole('region', { name: 'Guides' });
  for (const title of ['The shared contract', 'Theme configuration', 'Context for AI agents', 'Accessibility evidence', 'Local setup']) await expect(guides.getByRole('link', { name: title })).toBeVisible();
  const reference = page.getByRole('region', { name: /Reference/ });
  await expect(reference).toContainText('Generated from the registry');
  for (const title of ['Components reference', 'Tokens reference', 'Rules reference']) await expect(reference.getByRole('link', { name: title })).toBeVisible();
});

test('search finds text and headings, deep links to the heading, and recovers from no match', async ({ page }) => {
  await page.goto('/docs');
  await page.getByRole('searchbox', { name: 'Search documentation' }).fill('discard');
  const status = page.getByRole('status').first();
  await expect(status).toContainText('result');
  const hit = page.getByRole('link', { name: 'Theme configuration: Apply, Discard, and Reset' });
  await expect(hit).toHaveAttribute('href', '/docs/configuration#apply-discard-and-reset');
  await hit.click();
  await expect(page).toHaveURL(/\/docs\/configuration#apply-discard-and-reset$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Apply, Discard, and Reset' })).toBeInViewport();

  await page.goto('/docs');
  await page.getByRole('searchbox', { name: 'Search documentation' }).fill('zzz-no-such-word');
  await expect(page.getByRole('status').first()).toContainText('No results for “zzz-no-such-word”');
  await expect(page.getByRole('heading', { name: 'No documentation matches' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).first().click();
  await expect(page.getByRole('region', { name: 'Guides' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search documentation' })).toHaveValue('');

  // Generated reference is searchable and links to real screens.
  await page.getByRole('searchbox', { name: 'Search documentation' }).fill('wcag-contrast');
  await page.getByRole('link', { name: 'Rules reference' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Rules reference' })).toBeVisible();
});

test('every article renders with anchored headings, a contents list, and valid links', async ({ page, request }) => {
  for (const slug of slugs) {
    await page.goto(`/docs/${slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs');
    const ids = await page.locator('article h2').evaluateAll(els => els.map(el => el.id));
    for (const id of ids) await expect(page.getByRole('navigation', { name: 'On this page' }).locator(`a[href="#${id}"]`)).toBeVisible();
    const hrefs = await page.locator('article a[href^="/"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')!.split('#')[0]))]);
    for (const href of hrefs) expect((await request.get(href)).status(), `${slug}: ${href}`).toBe(200);
  }
});

test('reference articles are registry summaries linking to the canonical screens', async ({ page }) => {
  await page.goto('/docs/reference-components');
  const links = await page.locator('article li a').evaluateAll(els => els.map(el => el.getAttribute('href')));
  expect(links).toEqual(registry.components.map(c => `/components/${c.id}`).sort());
  await page.goto('/docs/reference-rules');
  await page.getByRole('link', { name: 'wcag-contrast' }).click();
  await expect(page).toHaveURL(/\/system\/rules#wcag-contrast$/);
  await expect(page.locator('li[id="wcag-contrast"]')).toBeVisible();
});

test('Copy for LLM copies the article Markdown with site-root links and reports the result', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/docs/context');
  await page.getByRole('button', { name: 'Copy for LLM' }).click();
  await expect(page.getByText('Copied this article as Markdown.')).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(withRootLinks(guide('context')));
  expect(copied).toContain('](/ai/context)');
  expect(copied).not.toMatch(/\]\((?!\/|https?:|#)/);
});

test('Copy for LLM reports a clipboard failure', async ({ page }) => {
  await page.goto('/docs/concepts');
  await page.getByRole('button', { name: 'Copy for LLM' }).click();
  await expect(page.getByText('Could not copy. Check clipboard access and try again.')).toBeVisible();
});

test('unknown articles are a 404 with recovery', async ({ page }) => {
  const response = await page.goto('/docs/no-such-article');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Browse components' })).toBeVisible();
});

test('documentation fits narrow and wide viewports in both appearances with no serious axe findings', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/docs', '/docs/setup', '/docs/reference-components']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth), `${colorScheme} ${width} ${path}`).toBeLessThanOrEqual(width);
      }
    }
  }
  for (const path of ['/docs', '/docs/setup']) {
    await page.goto(path);
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map(v => v.id), path).toEqual([]);
  }
});
