import { test, expect } from '@playwright/test';
import { registry } from '@/lib/data/registry';

const headings = ['Overview', 'Live preview', 'Variants', 'States', 'Anatomy', 'Props', 'Recommended use', 'Prohibited use', 'Accessibility', 'Tokens', 'Composition', 'AI guidance', 'Rules', 'Metadata readiness', 'Contract'];

test('every component has a detail route with every required section', async ({ page }) => {
  for (const component of registry.components) {
    await page.goto(`/components/${component.id}`);
    await expect(page.getByRole('heading', { level: 1, name: component.name, exact: true })).toBeVisible();
    for (const heading of headings) await expect(page.getByRole('heading', { level: 2, name: heading, exact: true })).toBeVisible();
    // Live preview renders the recommended example, props are tabulated, and review status is honest.
    await expect(page.getByTestId('component-preview')).toBeVisible();
    await expect(page.getByRole('region', { name: `${component.name} props table` })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 }).locator('xpath=ancestor::header').getByText('Not reviewed')).toBeVisible();
    await expect(page.getByText('Metadata-complete', { exact: true }).first()).toBeVisible();
    if (component.interactive) await expect(page.getByRole('region', { name: `${component.name} keyboard behavior table` })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  }
});

test('detail content comes from the contract, with import, defaults, tokens, and violations', async ({ page }) => {
  const button = registry.components.find(c => c.id === 'button')!;
  await page.goto('/components/button');
  await expect(page.getByText(`import { ${button.publicImport.exportName} } from "${button.publicImport.module}";`, { exact: true })).toBeVisible();
  for (const prop of button.props) await expect(page.getByRole('rowheader', { name: new RegExp(`^${prop.name}`) }).first()).toBeVisible();
  for (const token of button.tokenIds) await expect(page.getByRole('link', { name: token, exact: true })).toHaveAttribute('href', `/system/tokens#${token}`);
  const violation = registry.examples.find(e => e.intent === 'violation' && button.exampleIds.includes(e.id));
  if (violation && violation.intent === 'violation') await expect(page.getByText(violation.explanation)).toBeVisible();
  await expect(page.getByText('No human accessibility review has been recorded for this component.')).toBeVisible();
});

test('catalog cards link to detail and breadcrumbs lead back', async ({ page }) => {
  await page.goto('/components');
  await page.getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Button', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Components' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Components', exact: true })).toBeVisible();
});

test('unknown components are a 404 in every scenario, and recoverable errors offer Retry', async ({ page }) => {
  for (const scenario of ['normal', 'empty', 'error']) {
    const response = await page.goto(`/components/no-such-component?scenario=${scenario}`);
    expect(response?.status()).toBe(404);
    await expect(page.getByText('We could not find that page')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse components' })).toBeVisible();
  }
  for (const scenario of ['error', 'empty']) {
    await page.goto(`/components/button?scenario=${scenario}`);
    const retry = page.getByRole('button', { name: /retry/i });
    await expect(retry).toBeVisible();
    await retry.click();
    await expect(retry).toBeVisible();
  }
});

test('detail fits 320px and desktop in both appearances', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const id of ['button', 'table', 'dialog']) {
        await page.goto(`/components/${id}`);
        await expect(page.getByRole('heading', { level: 2, name: 'Props', exact: true })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
  }
});

test('effective defaults under the applied theme are shown only when they differ from the contract', async ({ page }) => {
  await page.goto('/components/button');
  await expect(page.getByText(/Under the applied theme, defaults differ/)).toHaveCount(0);
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Button variant default' }).selectOption('ghost');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.goto('/components/button');
  await expect(page.getByText(/Under the applied theme, defaults differ from the contract: variant is ghost \(contract: primary\)/)).toBeVisible();
});

test('token links show applied values and the mode in effect, and rules and constraints come from the contract', async ({ page }) => {
  const button = registry.components.find(c => c.id === 'button')!;
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/components/button');
  const tokens = page.locator('section[aria-labelledby="tokens-heading"]');
  await expect(tokens).toContainText('the light value, the mode in effect');
  const primary = tokens.locator('li', { hasText: 'color.primary' });
  await expect(primary.locator('code').nth(1)).toHaveText(/^oklch\(/);
  const lightValue = await primary.locator('code').nth(1).textContent();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(primary.locator('code').nth(1)).not.toHaveText(lightValue!);
  await expect(tokens).toContainText('the dark value, the mode in effect');

  const rules = page.locator('section[aria-labelledby="rules-heading"]');
  for (const id of [...new Set([...button.ruleIds, ...button.accessibility.ruleIds])]) {
    const rule = registry.rules.find(r => r.id === id)!;
    await expect(rules.locator(`li#rule-${id}`)).toContainText(rule.description);
    await expect(rules.locator(`li#rule-${id}`)).toContainText(rule.severity);
  }
  const composition = page.locator('section[aria-labelledby="composition-heading"]');
  for (const constraint of button.composition.constraints) await expect(composition).toContainText(constraint);
  for (const usage of button.prohibitedUsage) await expect(page.locator('section[aria-labelledby="prohibited-heading"]')).toContainText(usage);
});

test('the structured contract is the registry record and copies with feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const input = registry.components.find(c => c.id === 'input')!;
  await page.goto('/components/input');
  const shown = await page.getByRole('group', { name: 'Input contract JSON' }).or(page.getByLabel('Input contract JSON')).locator('code').textContent();
  expect(JSON.parse(shown!)).toEqual(JSON.parse(JSON.stringify(input)));
  await page.getByRole('button', { name: 'Copy Input contract' }).click();
  await expect(page.getByText('Contract copied to clipboard.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(shown);
  // The scrollable code blocks are reachable by keyboard.
  await page.getByLabel('Input contract JSON').focus();
  await expect(page.getByLabel('Input contract JSON')).toBeFocused();
});
