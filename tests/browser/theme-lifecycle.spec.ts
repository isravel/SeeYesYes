import { test, expect } from '@playwright/test';

test('apply, discard, reset, navigation, and refresh follow the theme lifecycle', async ({ page }) => {
  await page.goto('/system/theme');
  const apply = page.getByRole('button', { name: 'Apply to workspace' });
  const discard = page.getByRole('button', { name: 'Discard changes' });
  await expect(page.getByText('No unsaved changes.')).toBeVisible();
  await expect(apply).toBeDisabled();

  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();
  const workspaceRadius = () => page.evaluate(() => document.documentElement.style.getPropertyValue('--sys-radius-control') || getComputedStyle(document.documentElement).getPropertyValue('--sys-radius-control'));
  const before = await workspaceRadius();

  // Draft survives client-side navigation.
  await page.getByRole('link', { name: 'Back to overview' }).click();
  await page.getByRole('link', { name: /Edit the theme/ }).click();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).toHaveValue('curvy');
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();
  expect(await workspaceRadius()).toBe(before);

  // Discard restores the applied theme.
  await discard.click();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).not.toHaveValue('curvy');
  await expect(page.getByText('No unsaved changes.')).toBeVisible();

  // Apply updates the workspace and survives refresh; the new draft starts clean.
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await apply.click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  await expect(page.getByText('No unsaved changes.')).toBeVisible();
  expect(await workspaceRadius()).not.toBe(before);
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).toHaveValue('curvy');
  await expect(page.getByText('No unsaved changes.')).toBeVisible();

  // An unsaved draft is dropped on refresh.
  await page.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Density' })).not.toHaveValue('compact');

  // Reset draft loads the default preset but leaves the workspace alone until Apply.
  await page.getByRole('button', { name: 'Reset draft' }).click();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).not.toHaveValue('curvy');
  await expect(page.getByText(/Unsaved changes/)).toBeVisible();
  expect(await workspaceRadius()).not.toBe(before);
});

test('blocked storage keeps applied changes session-only', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await page.goto('/system/theme');
  await expect(page.getByText(/reset on refresh/).first()).toBeVisible();
  await page.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('No unsaved changes.')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Density' })).toHaveValue('compact');
});
