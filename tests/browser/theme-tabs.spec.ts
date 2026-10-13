import { test, expect } from '@playwright/test';

test('two tabs: a stale draft is rejected, tabs adopt the latest theme, and Discard recovers', async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto('/system/theme');
  await second.goto('/system/theme');
  const radius = (page: typeof first) => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sys-radius-control').trim());
  const before = await radius(second);

  // The second tab has an open draft; the first tab applies a different change.
  await second.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await first.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await first.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(first.getByText('Draft applied to the workspace and saved.')).toBeVisible();

  // The storage event makes the second tab adopt the new workspace theme; its draft and unsaved state stay.
  await expect.poll(() => radius(second)).not.toBe(before);
  await expect(second.getByRole('combobox', { name: 'Density' })).toHaveValue('compact');
  await expect(second.getByText(/Unsaved changes/)).toBeVisible();

  // Applying the stale draft is rejected without losing it.
  await second.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(second.getByText('The theme changed in another tab. Your draft is still here.').first()).toBeVisible();
  await expect(second.getByRole('combobox', { name: 'Density' })).toHaveValue('compact');
  await first.reload();
  await expect(first.getByRole('combobox', { name: 'Density' })).not.toHaveValue('compact');

  // Discard loads the latest applied theme, and a fresh edit then applies.
  await second.getByRole('button', { name: 'Discard changes' }).click();
  await expect(second.getByRole('combobox', { name: 'Corner shape' })).toHaveValue('curvy');
  await expect(second.getByText('The theme changed in another tab.')).toHaveCount(0);
  await second.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await second.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(second.getByText('Draft applied to the workspace and saved.')).toBeVisible();
});

test('without Web Locks the tab reads saved settings but stays session-only', async ({ page }) => {
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Corner shape' }).selectOption('curvy');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied to the workspace and saved.')).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem('seeyesyes:settings:v1'));

  await page.addInitScript(() => { Object.defineProperty(navigator, 'locks', { value: undefined }); });
  await page.reload();
  await expect(page.getByText(/reset on refresh/).first()).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Corner shape' })).toHaveValue('curvy');
  await page.getByRole('combobox', { name: 'Density' }).selectOption('compact');
  await page.getByRole('button', { name: 'Apply to workspace' }).click();
  await expect(page.getByText('Draft applied for this session')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('seeyesyes:settings:v1'))).toBe(saved);
});

test('reduced motion removes motion inside the theme preview scope too', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/system/theme');
  await page.getByRole('combobox', { name: 'Motion' }).selectOption('subtle');
  const durations = await page.evaluate(() => [...document.querySelectorAll('#theme-editor-preview *')].map(el => getComputedStyle(el).transitionDuration + getComputedStyle(el).animationDuration));
  expect(durations.length).toBeGreaterThan(5);
  expect(durations.every(value => /^(0s)(,\s*0s)*(0s)(,\s*0s)*$/.test(value))).toBe(true);
});
