import { test, expect } from '@playwright/test';

test('SSR keeps workspace variables off html; hydration follows OS changes', async ({page, request}) => {
  const source = await (await request.get('/')).text();
  const html = source.match(/<html[^>]*>/)![0];
  expect(html).not.toContain('style=');
  expect(html).not.toContain('data-appearance=');
  await page.emulateMedia({colorScheme: 'light'});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'light');
  const light = await page.locator('html').evaluate(e => e.style.getPropertyValue('--sys-color-background'));
  await page.emulateMedia({colorScheme: 'dark'});
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
  expect(await page.locator('html').evaluate(e => e.style.getPropertyValue('--sys-color-background'))).not.toBe(light);
});

test('nearest scope controls defaults and geometry without changing the workspace', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({colorScheme: 'light'});
  await page.goto('/internal-checks/theme-scopes');
  const outer = page.locator('#outer-scope');
  const inner = page.locator('#inner-scope');
  const workspace = page.getByRole('button', {name: 'Workspace action', exact: true});
  const button = page.getByRole('button', {name: 'Outer default', exact: true});
  await expect(outer).toHaveAttribute('data-appearance', 'dark');
  await expect(inner).toHaveAttribute('data-appearance', 'light');
  await expect(button).toHaveAttribute('data-variant', 'secondary');
  await expect(button).toHaveAttribute('data-size', 'small');
  await expect(page.getByRole('link', {name: 'Outer link'})).toHaveAttribute('data-variant', 'subtle');
  await expect(outer.locator('[aria-hidden="true"]').first()).toHaveAttribute('data-size', 'small');
  await expect(page.getByRole('button', {name: 'Inner default', exact: true})).toHaveAttribute('data-variant', 'ghost');
  await expect(page.getByRole('button', {name: 'Explicit action', exact: true})).toHaveAttribute('data-variant', 'primary');
  await expect(page.getByRole('button', {name: 'Explicit action', exact: true})).toHaveAttribute('data-size', 'medium');
  const geometry = () => button.evaluate(e => ({padding: getComputedStyle(e).paddingInline, radius: getComputedStyle(e).borderRadius}));
  const initial = await geometry();
  const workspaceBefore = await workspace.evaluate(e => ({padding: getComputedStyle(e).paddingInline, background: getComputedStyle(e).backgroundColor}));
  const innerBefore = await inner.evaluate(e => e.style.getPropertyValue('--sys-spacing-control-inline'));
  await page.getByRole('button', {name: 'Toggle outer density'}).click();
  expect((await geometry()).padding).not.toBe(initial.padding);
  expect((await geometry()).radius).toBe('0px');
  expect(await inner.evaluate(e => e.style.getPropertyValue('--sys-spacing-control-inline'))).toBe(innerBefore);
  expect(await workspace.evaluate(e => ({padding: getComputedStyle(e).paddingInline, background: getComputedStyle(e).backgroundColor}))).toEqual(workspaceBefore);
  await page.getByRole('button', {name: 'Toggle nested scopes'}).click();
  await expect(outer).toHaveCount(0);
  await expect(workspace).toHaveAttribute('data-variant', 'primary');
  expect(errors).toEqual([]);
});

test('React Aria portals inherit the nearest nested scope', async ({page}) => {
  await page.goto('/internal-checks/theme-scopes');
  await page.getByRole('button', {name: 'Open scope probe'}).click();
  const dialog = page.getByRole('dialog', {name: 'Scope portal probe'});
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(e => e.closest('[data-theme-scope]')?.id)).toBe('inner-scope');
  expect(await dialog.evaluate(e => getComputedStyle(e).getPropertyValue('--sys-color-primary').trim())).toBe('oklch(0.44 0.16 264 / 1)');
  await expect(dialog.getByRole('button', {name: 'Close probe'})).toHaveAttribute('data-variant', 'ghost');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
