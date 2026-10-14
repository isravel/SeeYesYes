import { test, expect } from '@playwright/test';
import { registry } from '@/lib/data/registry';

// Words that, standing alone, would promise something this prototype does not deliver.
const risky = /certif|complian|conform|guarantee|production-ready|battle-tested|enterprise|fully accessible|accessible by default|verified|ai-powered|powered by|intelligen|\bscan|npm i(nstall)?\b|published|on npm|deployed|(?<!self-)hosted|proven|\bproof\b|\bsecure\b|best practice|industry|state-of-the-art|seamless|robust/i;
// A risky word is acceptable only inside a sentence that limits or denies it.
const limited = /\b(no|not|never|nothing|none|neither|nor|cannot|can't|without|until|isn't|aren't|doesn't|does not|do not|don't|unavailable|yet)\b/i;
// Sentences that use a risky word truthfully without a negation, each reviewed by a person.
const reviewed = [
  /^Show what is verified and what is still a demo\.?$/,
  /^The repository runs automated checks: .* scanned for serious accessibility problems/,
  /verified public imports?/i,
];

const paths = ['/', '/getting-started', '/system/theme', '/system/tokens', '/system/rules', '/components', '/layouts', '/ai/context', '/accessibility', '/validation', '/playground', '/docs',
  ...registry.components.map(c => `/components/${c.id}`), ...['concepts', 'configuration', 'context', 'accessibility', 'setup', 'reference-components', 'reference-tokens', 'reference-rules'].map(s => `/docs/${s}`)];

const unlimited = (text: string) => text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim().replace(/^[-*]\s+/, '')).filter(s => s && risky.test(s) && !limited.test(s) && !reviewed.some(pattern => pattern.test(s)));

test('rendered pages make no unqualified claims about certification, compliance, packages, hosting, scanning, or AI results', async ({ page }) => {
  test.setTimeout(300_000);
  const offenders: string[] = [];
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(300);
    for (const sentence of unlimited(await page.locator('main').innerText())) offenders.push(`${path}: ${sentence}`);
  }
  expect(offenders).toEqual([]);
});

test('agent files, exports, and the README make no unqualified claims either', async ({ request }) => {
  const offenders: string[] = [];
  for (const path of ['/llms.txt', '/llms-full.txt']) for (const sentence of unlimited(await (await request.get(path)).text())) offenders.push(`${path}: ${sentence}`);
  const { readFileSync } = await import('node:fs');
  for (const sentence of unlimited(readFileSync('README.md', 'utf8'))) offenders.push(`README.md: ${sentence}`);
  expect(offenders).toEqual([]);
});

test('every component is labeled with its real maturity and review status, never as reviewed or stable without evidence', async ({ page }) => {
  for (const component of registry.components) {
    await page.goto(`/components/${component.id}`);
    const header = page.getByRole('heading', { level: 1 }).locator('xpath=ancestor::header');
    await expect(header).toContainText(component.maturity === 'stable' ? 'Stable' : 'Experimental');
    await expect(header).toContainText(component.accessibility.status === 'reviewed' ? 'Accessibility reviewed' : 'Not reviewed');
  }
  await page.goto('/accessibility');
  await expect(page.getByText(`0 of ${registry.components.length} reviewed`)).toBeVisible();
});

test('the product states that the agent evaluation has not produced results', async ({ page }) => {
  await page.goto('/ai/context');
  await expect(page.getByText('has not been measured yet')).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('the agent evaluation has not been run')).toBeVisible();
});
