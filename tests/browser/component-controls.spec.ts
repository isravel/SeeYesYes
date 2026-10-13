import { test, expect } from '@playwright/test';
import { registry } from '@/lib/data/registry';

const code = (page: import('@playwright/test').Page) => page.locator('section[aria-labelledby="preview-heading"] pre code');

test('variant and state controls change the real component and its matching code', async ({ page }) => {
  await page.goto('/components/button');
  const preview = page.getByTestId('component-preview');
  await expect(preview.getByRole('button', { name: 'Save changes' })).toHaveAttribute('data-variant', 'primary');
  await page.getByRole('combobox', { name: 'Button variant' }).selectOption('destructive');
  await expect(preview.getByRole('button', { name: 'Save changes' })).toHaveAttribute('data-variant', 'destructive');
  await expect(code(page)).toContainText('<Button variant="destructive"');
  await page.getByRole('combobox', { name: 'Button size' }).selectOption('large');
  await expect(preview.getByRole('button', { name: 'Save changes' })).toHaveAttribute('data-size', 'large');
  await expect(code(page)).toContainText('size="large"');
  await expect(code(page)).toContainText('import { Button } from "@/components/ui/button";');

  await page.getByRole('combobox', { name: 'Button state' }).selectOption('disabled');
  await expect(preview.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await expect(code(page)).toContainText('disabled');
  await page.getByRole('combobox', { name: 'Button state' }).selectOption('loading');
  await expect(preview.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByText(/Interaction states to try in the preview.*hover, focus-visible, pressed/)).toBeVisible();

  // The styled ghost + small compound is announced.
  await page.getByRole('combobox', { name: 'Button state' }).selectOption('default');
  await page.getByRole('combobox', { name: 'Button variant' }).selectOption('ghost');
  await page.getByRole('combobox', { name: 'Button size' }).selectOption('small');
  await expect(page.getByText(/This combination has a dedicated style/)).toBeVisible();
});

test('copy returns the generated code for the current selection', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/badge');
  await page.getByRole('combobox', { name: 'Badge tone' }).selectOption('warning');
  await page.getByRole('button', { name: 'Copy Badge code' }).click();
  await expect(page.getByText('Copied to clipboard.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('import { Badge } from "@/components/ui/badge";\n\n<Badge tone="warning">\n  Ready\n</Badge>');
});

test('initial selection follows the applied theme default', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Button variant default' }).selectOption('ghost');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await page.goto('/components/button');
  await expect(page.getByRole('combobox', { name: 'Button variant' })).toHaveValue('ghost');
});

test('every component preview responds to every variant option and forced state', async ({ page }) => {
  test.setTimeout(90_000);
  for (const component of registry.components) {
    await page.goto(`/components/${component.id}`);
    const preview = page.getByTestId('component-preview');
    // Each page fetches its contract after load; allow for a busy machine.
    await expect(preview).toBeVisible({ timeout: 15_000 });
    for (const [name, options] of Object.entries(component.variants)) {
      for (const option of options) {
        await page.getByRole('combobox', { name: `${component.name} ${name}`, exact: true }).selectOption(option);
        await expect(code(page), `${component.id} ${name}=${option}`).toContainText(`${name}="${option}"`);
        await expect(preview).toBeVisible();
      }
    }
    const stateControl = page.getByRole('combobox', { name: `${component.name} state`, exact: true });
    if (await stateControl.count()) {
      for (const state of await stateControl.locator('option').allTextContents()) {
        await stateControl.selectOption(state);
        await expect(preview, `${component.id} state ${state}`).toBeVisible();
        await expect(preview).not.toContainText('Application error');
      }
    }
  }
});
