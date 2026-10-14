import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

type Finding = { state: string; scheme: string; id: string; impact: string; help: string; nodes: number; target: string };
const findings: Finding[] = [];
const audited: string[] = [];

async function audit(page: Page, state: string, scheme: 'light' | 'dark', exclude: string[] = []) {
  let builder = new AxeBuilder({ page });
  for (const selector of exclude) builder = builder.exclude(selector);
  const { violations } = await builder.analyze();
  audited.push(`${state} (${scheme})`);
  for (const v of violations) findings.push({ state, scheme, id: v.id, impact: v.impact ?? 'unknown', help: v.help, nodes: v.nodes.length, target: String(v.nodes[0]?.target.join(' ') ?? '') });
}

const ready = (page: Page) => expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
// A deliberately failing draft is shown as the user edited it, and the editor warns about it instead of hiding it; the preview is excluded from axe there.
const states: { name: string; exclude?: string[]; run: (page: Page) => Promise<void> }[] = [
  ...['/', '/getting-started', '/system/theme', '/system/tokens', '/system/rules', '/components', '/components/button', '/components/dialog', '/components/table', '/layouts', '/ai/context', '/accessibility', '/validation', '/playground', '/docs', '/docs/concepts', '/docs/reference-rules'].map(path => ({
    name: `view ${path}`, run: async (page: Page) => { await page.goto(path); await ready(page); await page.waitForLoadState('networkidle').catch(() => undefined); },
  })),
  ...['/system/tokens', '/components', '/system/rules', '/validation', '/accessibility', '/layouts', '/ai/context', '/components/button'].flatMap(path => ['empty', 'error'].map(scenario => ({
    name: `${scenario} scenario ${path}`, run: async (page: Page) => { await page.goto(`${path}?scenario=${scenario}`); await ready(page); await page.waitForTimeout(400); },
  }))),
  { name: 'not found', run: async page => { await page.goto('/no-such-page'); await expect(page.getByText('We could not find that page')).toBeVisible(); } },
  { name: 'theme editor with a failing draft and contrast warnings', exclude: ['#theme-editor-preview'], run: async page => { await page.goto('/system/theme'); await ready(page); await page.getByRole('combobox', { name: 'Color role' }).selectOption('foreground'); await page.getByRole('spinbutton', { name: 'Lightness' }).fill('0.97'); await expect(page.getByRole('group', { name: 'Draft contrast warnings' })).toBeVisible(); } },
  { name: 'theme editor with the preview dialog open', run: async page => { await page.goto('/system/theme'); await ready(page); await page.locator('#theme-editor-preview').getByRole('button', { name: /Open|Review|Edit|Delete/ }).first().click(); await expect(page.getByRole('dialog')).toBeVisible(); } },
  { name: 'tokens with no match', run: async page => { await page.goto('/system/tokens'); await ready(page); await page.getByRole('searchbox', { name: 'Search tokens' }).fill('zzzz'); await expect(page.getByRole('heading', { name: 'No tokens match' })).toBeVisible(); } },
  { name: 'components with no match', run: async page => { await page.goto('/components'); await ready(page); await page.getByRole('searchbox', { name: 'Search components' }).fill('zzzz'); await expect(page.getByRole('heading', { name: 'No components match' })).toBeVisible(); } },
  { name: 'rules filtered to no match', run: async page => { await page.goto('/system/rules'); await ready(page); await page.getByRole('combobox', { name: 'Category' }).selectOption('accessibility'); await page.getByRole('combobox', { name: 'Severity' }).selectOption('info'); await expect(page.getByRole('heading', { name: 'No rules match' })).toBeVisible(); } },
  { name: 'validation failing report with a result open', run: async page => { await page.goto('/validation'); await ready(page); await page.getByRole('radio', { name: 'Failing', exact: true }).check(); await page.getByRole('button', { name: /avoid-custom-button/ }).click(); await expect(page.getByLabel('Finding details')).toContainText('Demo result'); } },
  { name: 'AI context task export with the Markdown tab', run: async page => { await page.goto('/ai/context'); await ready(page); await page.getByRole('radio', { name: 'Task', exact: true }).check(); await page.getByRole('checkbox', { name: /^Dialog/ }).check(); await page.getByRole('tab', { name: 'Markdown', exact: true }).click(); await expect(page.getByLabel('Context Markdown')).toBeVisible(); } },
  { name: 'docs search results', run: async page => { await page.goto('/docs'); await ready(page); await page.getByRole('searchbox', { name: 'Search documentation' }).fill('apply'); await expect(page.getByRole('status').first()).toContainText('result'); } },
  { name: 'docs search with no result', run: async page => { await page.goto('/docs'); await ready(page); await page.getByRole('searchbox', { name: 'Search documentation' }).fill('zzzz'); await expect(page.getByRole('heading', { name: 'No documentation matches' })).toBeVisible(); } },
  { name: 'component detail button disabled and loading states', run: async page => { await page.goto('/components/button'); await ready(page); await page.getByRole('combobox', { name: 'Button state' }).selectOption('loading'); await expect(page.getByTestId('component-preview').getByRole('button')).toHaveAttribute('aria-busy', 'true'); } },
  { name: 'component detail input invalid state', run: async page => { await page.goto('/components/input'); await ready(page); await page.getByRole('combobox', { name: 'Input state' }).selectOption('invalid'); } },
  { name: 'component detail dialog open', run: async page => { await page.goto('/components/dialog'); await ready(page); await page.getByRole('button', { name: 'Open settings' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); } },
  { name: 'component detail menu open', run: async page => { await page.goto('/components/dropdown-menu'); await ready(page); await page.getByRole('button', { name: 'Actions' }).click(); await expect(page.getByRole('menu')).toBeVisible(); } },
  { name: 'component detail tooltip open', run: async page => { await page.goto('/components/tooltip'); await ready(page); await page.getByRole('button', { name: 'Save preview' }).focus(); await expect(page.getByRole('tooltip')).toBeVisible(); } },
  { name: 'component detail tabs', run: async page => { await page.goto('/components/tabs'); await ready(page); await page.getByRole('tab').nth(1).click(); } },
  { name: 'playground dark compact curvy', run: async page => { await page.goto('/playground'); await ready(page); await page.getByRole('combobox', { name: 'Preview appearance' }).selectOption('dark'); await page.getByRole('combobox', { name: 'Density' }).selectOption('compact'); await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy'); } },
  { name: 'playground dialog open', run: async page => { await page.goto('/playground'); await ready(page); await page.getByRole('combobox', { name: 'Component' }).selectOption('dialog'); await page.getByRole('button', { name: 'Open settings' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); } },
  { name: 'layouts dark compact', run: async page => { await page.goto('/layouts'); await ready(page); for (const name of ['Dashboard', 'Settings', 'Dense data']) { await page.getByRole('combobox', { name: `${name} appearance` }).selectOption('dark'); await page.getByRole('combobox', { name: `${name} density` }).selectOption('compact'); } } },
  { name: 'mobile navigation drawer open', run: async page => { await page.setViewportSize({ width: 375, height: 800 }); await page.goto('/'); await ready(page); await page.getByRole('button', { name: 'Open navigation', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Workspace' })).toBeVisible(); } },
];

test('every route and relevant state has no serious or critical automated accessibility findings, in both appearances', async ({ page }) => {
  test.setTimeout(600_000);
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const state of states) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await state.run(page);
      await audit(page, state.name, scheme, state.exclude);
    }
  }
  const blocking = findings.filter(f => f.impact === 'serious' || f.impact === 'critical');
  const lesser = findings.filter(f => !blocking.includes(f));
  const group = (list: Finding[]) => Object.entries(list.reduce<Record<string, Finding[]>>((acc, f) => { (acc[`${f.id} (${f.impact})`] ??= []).push(f); return acc; }, {}));
  mkdirSync('docs/evidence/M7', { recursive: true });
  writeFileSync('docs/evidence/M7/a11y-audit-results.md', [
    '# Automated accessibility audit results', '',
    'Generated by `tests/browser/a11y-audit.spec.ts` against the production build with axe-core. Automated checks find some problems; they do not prove conformance and do not replace testing by a person.', '',
    `Audited ${audited.length} route and state combinations (${states.length} states, light and dark, 1280px wide).`, '',
    `Serious or critical findings: ${blocking.length}.`, `Lesser findings: ${lesser.length} across ${group(lesser).length} rule groups.`, '',
    '## Audited states', '', ...states.map(s => `- ${s.name}${s.exclude ? ` (excluding ${s.exclude.join(', ')}: the preview shows the intentionally failing draft, which the editor warns about; its contrast is measured by the contrast check)` : ''}`), '',
    '## Lesser findings for review', '', ...(lesser.length ? group(lesser).flatMap(([rule, list]) => [`### ${rule}`, '', `${list[0].help}. ${list.length} occurrences in ${new Set(list.map(f => f.state)).size} states; first at \`${list[0].target}\` (${list[0].state}).`, '']) : ['None.', '']),
  ].join('\n'));
  expect(blocking.map(f => `${f.state} (${f.scheme}): ${f.id} at ${f.target}`)).toEqual([]);
});
