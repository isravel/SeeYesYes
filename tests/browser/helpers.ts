import type { Page } from '@playwright/test';

/** The Overview loads its live previews when their grid nears the viewport; scroll there before looking for one. */
export async function revealPreviews(page: Page) {
  await page.locator('#components-title').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Save settings' }).waitFor({ timeout: 15_000 });
}
