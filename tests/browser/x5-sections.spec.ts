import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, query = 'surface=glass') => {
  await page.goto(`/internal-checks/controls?${query}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
  await expect(page.locator('#x5-sections')).toBeVisible();
};
const sections = (page: Page) => page.locator('#x5-sections');
const share = (page: Page, testId: string) => page.getByTestId(testId);

test('ShareButtons links every network with the attributed address, encoded, in a new tab', async ({ page }) => {
  await open(page);
  const group = share(page, 'share');
  await expect(group).toHaveAttribute('role', 'group');
  await expect(group).toHaveAccessibleName('Share');
  const links = group.getByRole('link');
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAccessibleName('LinkedIn (share, opens in a new tab)');
  const shared = 'https://example.com/guide?lang=en&ref=a%26b&via=share#install';
  const hrefs = await links.evaluateAll(els => els.map(el => ({ href: el.getAttribute('href')!, target: el.getAttribute('target'), rel: el.getAttribute('rel') })));
  for (const link of hrefs) { expect(link.target).toBe('_blank'); expect(link.rel).toBe('noopener noreferrer'); }
  const [linkedin, x, whatsapp] = hrefs.map(link => new URL(link.href));
  expect(linkedin.hostname).toBe('www.linkedin.com');
  expect(linkedin.searchParams.get('url')).toBe(shared);
  expect(x.hostname).toBe('x.com');
  expect(x.searchParams.get('url')).toBe(shared);
  // The text keeps its ampersand: it is one parameter, not two.
  expect(x.searchParams.get('text')).toBe('Guide: A & B');
  expect(whatsapp.hostname).toBe('wa.me');
  expect(whatsapp.searchParams.get('text')).toBe(`Guide: A & B ${shared}`);
  for (const link of [linkedin, x, whatsapp]) expect(link.hash).toBe('');
});

test('ShareButtons resolves a relative address in the browser and leaves it unattributed on request', async ({ page }) => {
  await open(page);
  const group = share(page, 'share-relative');
  await expect(group).toHaveAccessibleName('Share this page');
  const href = await group.getByRole('link').first().getAttribute('href');
  expect(new URL(href!).searchParams.get('url')).toBe(new URL('/docs?tab=one#top', page.url()).toString());
  expect(await group.getByRole('link').count()).toBe(3);
  await expect(group.getByRole('button', { name: 'Copy link' })).toBeEnabled();
});

test('Copy link copies the attributed address and reports success in text', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page);
  const group = share(page, 'share');
  await group.getByRole('button', { name: 'Copy link' }).click();
  await expect(group.getByRole('status')).toHaveText('Link copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://example.com/guide?lang=en&ref=a%26b&via=share#install');
});

test('Copy link reports failure in text when the clipboard is unavailable or refuses', async ({ page }) => {
  await open(page);
  const group = share(page, 'share');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } }));
  await group.getByRole('button', { name: 'Copy link' }).click();
  await expect(group.getByRole('status')).toContainText('Could not copy the link');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }));
  await group.getByRole('button', { name: 'Copy link' }).click();
  await expect(group.getByRole('status')).toContainText('Could not copy the link');
});

test('ShareButtons never opens anything on load and disables every control for an address that is not a web link', async ({ page }) => {
  const popups: string[] = [];
  page.on('popup', popup => popups.push(popup.url()));
  await open(page);
  const group = share(page, 'share-unavailable');
  await expect(group.getByRole('link')).toHaveCount(0);
  for (const name of ['LinkedIn', 'X', 'WhatsApp', 'Copy link']) await expect(group.getByRole('button', { name })).toBeDisabled();
  await expect(group).toContainText('Sharing is unavailable');
  expect(popups).toEqual([]);
});

test('ShareButtons controls follow the size prop and keep a usable target', async ({ page }) => {
  await open(page);
  const heights = async (testId: string) => share(page, testId).locator('a, button').evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().height)));
  for (const testId of ['share', 'share-relative', 'share-unavailable']) for (const height of await heights(testId)) expect(height, testId).toBeGreaterThanOrEqual(44);
  expect(await share(page, 'share').getByRole('link').first().getAttribute('data-size')).toBe('medium');
  expect(await share(page, 'share-relative').getByRole('link').first().getAttribute('data-size')).toBe('small');
});

test('ShareButtons tab order runs through the networks then Copy link, each with a focus ring', async ({ page }) => {
  await open(page);
  const group = share(page, 'share');
  await group.getByRole('link').first().focus();
  const stops: string[] = [];
  for (let press = 0; press < 4; press += 1) {
    stops.push(await page.evaluate(() => { const el = document.activeElement as HTMLElement; return `${el.tagName.toLowerCase()}:${el.matches(':focus-visible')}:${getComputedStyle(el).outlineStyle}`; }));
    await page.keyboard.press('Tab');
  }
  expect(stops).toEqual(['a:true:solid', 'a:true:solid', 'a:true:solid', 'button:true:solid']);
});

test('SectionHead uses the chosen heading level and names each View all link by its heading', async ({ page }) => {
  await open(page);
  expect(await share(page, 'head-link').locator('h2').textContent()).toBe('Featured guides');
  expect(await share(page, 'head-plain').locator('h3').textContent()).toBe('Plain heading');
  await expect(share(page, 'head-plain').getByRole('link')).toHaveCount(0);
  await expect(share(page, 'head-link').getByRole('link')).toHaveAccessibleName('View all Featured guides');
  await expect(share(page, 'head-long').getByRole('link')).toHaveAccessibleName(/^See every guide A much longer section heading/);
  await expect(share(page, 'head-link').getByRole('link')).toHaveAttribute('href', '/docs');
  // The heading size follows the level.
  const size = (testId: string, tag: string) => share(page, testId).locator(tag).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(await size('head-link', 'h2')).toBeGreaterThan(await size('head-plain', 'h3'));
});

test('SectionHead wraps the link below a long heading without overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  const head = share(page, 'head-long');
  const box = (await head.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  const heading = (await head.locator('h3').boundingBox())!;
  const link = (await head.getByRole('link').boundingBox())!;
  expect(link.y).toBeGreaterThanOrEqual(heading.y + heading.height - 1);
});

test('StatStrip reads each label before its value, labels a missing value and shows only supplied figures', async ({ page }) => {
  await open(page);
  const stats = share(page, 'stats');
  expect(await stats.locator('dt').allTextContents()).toEqual(['Team members', 'Active projects', 'Regions', 'A label that is long enough to wrap in a narrow column']);
  expect(await stats.locator('dd').allTextContents()).toEqual(['24', '9', 'Not provided', '1,234,567']);
  // On screen the value sits above its label while the document keeps the label first.
  const first = stats.locator('> div').first();
  const [label, value] = await Promise.all([first.locator('dt').boundingBox(), first.locator('dd').boundingBox()]);
  expect(value!.y).toBeLessThan(label!.y);
  expect(await stats.locator('[data-missing]').count()).toBe(1);
});

test('StatStrip stacks to one column at 320px and spreads across a wide screen', async ({ page }) => {
  await open(page);
  const columns = () => share(page, 'stats').evaluate(el => new Set(Array.from(el.children).map(child => Math.round(child.getBoundingClientRect().left))).size);
  await page.setViewportSize({ width: 1280, height: 900 });
  expect(await columns()).toBeGreaterThan(1);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await columns()).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('CtaPanel offers one action, keeps its text readable over the tint, and adds texture only when asked', async ({ page }) => {
  await open(page);
  const panel = share(page, 'cta');
  await expect(panel.getByRole('button')).toHaveCount(1);
  await expect(panel.getByRole('heading', { level: 2, name: 'Ready to start?' })).toBeVisible();
  const pseudo = (testId: string, which: '::before' | '::after') => share(page, testId).locator('[data-texture], [class*="panel"]').first().evaluate((el, selector) => getComputedStyle(el, selector).content, which);
  expect(await pseudo('cta', '::after')).toBe('none');
  expect(await pseudo('cta-texture', '::after')).not.toBe('none');
  expect(await pseudo('cta', '::before')).not.toBe('none');
  await expect(share(page, 'cta-texture').getByRole('heading', { level: 3 })).toHaveText('Textured panel');
  // The decoration never takes the pointer or the focus away from the action.
  expect(await share(page, 'cta-texture').locator('[data-texture]').evaluate(el => getComputedStyle(el, '::after').pointerEvents)).toBe('none');
  await share(page, 'cta').getByRole('button').focus();
  expect(await share(page, 'cta').getByRole('button').evaluate(el => el.matches(':focus-visible'))).toBe(true);
});

test('CtaPanel drops its decoration in forced colors', async ({ page }) => {
  await open(page);
  await page.emulateMedia({ forcedColors: 'active' });
  const display = (which: '::before' | '::after') => share(page, 'cta-texture').locator('[data-texture]').evaluate((el, selector) => getComputedStyle(el, selector).display, which);
  expect(await display('::before')).toBe('none');
  expect(await display('::after')).toBe('none');
  await expect(share(page, 'cta-texture').getByRole('button')).toBeVisible();
});

test('Footer is the contentinfo landmark with one named navigation, at most four columns and no stray headings', async ({ page }) => {
  await open(page);
  const footer = share(page, 'footer');
  expect(await footer.evaluate(el => el.tagName.toLowerCase())).toBe('footer');
  await expect(footer.getByRole('navigation', { name: 'Footer' })).toHaveCount(1);
  expect(await footer.locator('ul').count()).toBe(4);
  await expect(footer).not.toContainText('Never shown');
  await expect(footer.locator('h1, h2, h3, h4, h5, h6')).toHaveCount(0);
  expect(await footer.locator('ul').evaluateAll(els => els.map(el => document.getElementById(el.getAttribute('aria-labelledby')!)?.textContent))).toEqual(['Product', 'Company', 'Legal', 'More']);
  await expect(footer).toContainText('© Acme');
  const external = footer.getByRole('link', { name: /Publisher site/ });
  await expect(external).toHaveAccessibleName('Publisher site (opens in a new tab)');
  await expect(external).toHaveAttribute('target', '_blank');
  await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
});

test('Footer links are tabbable in column order with a visible focus ring, and the top edge is a line', async ({ page }) => {
  await open(page);
  const footer = share(page, 'footer');
  await footer.getByRole('link', { name: 'Components' }).focus();
  const names: string[] = [];
  for (let press = 0; press < 5; press += 1) {
    names.push(await page.evaluate(() => { const el = document.activeElement as HTMLElement; return `${el.textContent}|${el.matches(':focus-visible')}|${getComputedStyle(el).outlineStyle}`; }));
    await page.keyboard.press('Tab');
  }
  expect(names.map(entry => entry.split('|')[0])).toEqual(['Components', 'Docs', 'Publisher site (opens in a new tab)', 'Terms of service and a very long policy name that must wrap', 'Status']);
  for (const entry of names) expect(entry.split('|').slice(1)).toEqual(['true', 'solid']);
  expect(await footer.evaluate(el => ({ width: getComputedStyle(el).borderBlockStartWidth, style: getComputedStyle(el).borderBlockStartStyle }))).toEqual({ width: '1px', style: 'solid' });
});

test('sections fit a 320px screen without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const testId of ['head-long', 'share', 'stats', 'cta', 'footer']) {
    const box = (await share(page, testId).boundingBox())!;
    expect(box.x + box.width, testId).toBeLessThanOrEqual(320);
  }
  const link = (await share(page, 'footer').getByRole('link', { name: /Terms of service/ }).boundingBox())!;
  expect(link.x + link.width).toBeLessThanOrEqual(320);
});

test('Navbar renders one named navigation, marks the current page and skips empty groups', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await open(page);
  const bar = share(page, 'navbar');
  await expect(bar.getByRole('navigation', { name: 'Fixture main' })).toHaveCount(1);
  await expect(bar.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
  await expect(bar.getByRole('link', { name: 'Components' })).not.toHaveAttribute('aria-current', 'page');
  await expect(bar.getByRole('list')).toHaveCount(2);
  await expect(bar.getByRole('link', { name: /Publisher site/ })).toHaveAttribute('target', '_blank');
  await expect(bar.getByRole('link', { name: /Publisher site/ })).toHaveAccessibleName('Publisher site (opens in a new tab)');
  // On wide screens the links are always visible and the menu button is not.
  await expect(bar.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(bar.getByRole('link', { name: 'Components' })).toBeVisible();
});

test('Navbar menu starts closed on a narrow screen, opens, and Escape closes it and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await open(page);
  const bar = share(page, 'navbar');
  const button = bar.getByRole('button', { name: 'Menu' });
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(bar.getByRole('link', { name: 'Components' })).toBeHidden();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(bar.getByRole('link', { name: 'Components' })).toBeVisible();
  await bar.getByRole('link', { name: 'Components' }).focus();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
  await expect(bar.getByRole('link', { name: 'Components' })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Hero puts text first, splits only when media is supplied and never overflows', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await open(page);
  await expect(share(page, 'hero-centered').getByRole('heading', { level: 2 })).toContainText('consistent');
  expect(await share(page, 'hero-centered').getAttribute('data-layout')).toBe('centered');
  expect(await share(page, 'hero-split').getAttribute('data-layout')).toBe('split');
  expect(await share(page, 'hero-forced').getAttribute('data-layout')).toBe('centered');
  const text = (await share(page, 'hero-split').getByRole('heading').boundingBox())!;
  const media = (await share(page, 'hero-split').locator('img').boundingBox())!;
  expect(media.x).toBeGreaterThan(text.x + text.width - 1);
  await page.setViewportSize({ width: 320, height: 800 });
  const narrowText = (await share(page, 'hero-split').getByRole('heading').boundingBox())!;
  const narrowMedia = (await share(page, 'hero-split').locator('img').boundingBox())!;
  expect(narrowMedia.y).toBeGreaterThan(narrowText.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('FeatureBento keeps reading order, names links by feature and lays three over four', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page);
  const bento = share(page, 'bento');
  await expect(bento).toHaveAccessibleName('Fixture highlights');
  const titles = await bento.getByRole('heading', { level: 3 }).allTextContents();
  expect(titles.slice(0, 3)).toEqual(['Shared tokens', 'Accessible by default', 'Readable contracts']);
  await expect(bento.getByRole('link', { name: 'Read more about Readable contracts' })).toHaveAttribute('href', '/docs');
  const boxes = await bento.getByRole('listitem').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { y: Math.round(r.y), w: Math.round(r.width) }; }));
  expect(boxes[0].y).toBe(boxes[2].y);
  expect(boxes[3].y).toBeGreaterThan(boxes[0].y);
  expect(boxes[3].y).toBe(boxes[6].y);
  expect(boxes[0].w).toBeGreaterThan(boxes[3].w);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('Testimonials never autoplay, show captions, pause others and say when a video fails', async ({ page }) => {
  await open(page);
  const voices = share(page, 'voices');
  await expect(voices.getByText('Setup took an afternoon.')).toBeVisible();
  await expect(voices.getByText('Priya Nair')).toBeVisible();
  const video = voices.locator('video').first();
  expect(await video.evaluate((el: HTMLVideoElement) => ({ paused: el.paused, controls: el.controls, autoplay: el.autoplay, track: el.querySelector('track')?.getAttribute('kind') }))).toEqual({ paused: true, controls: true, autoplay: false, track: 'captions' });
  await expect(voices.getByText('This video could not be loaded.')).toBeVisible();
});

test('AppBadges link each store by name, keep their own proportions and say when an image fails', async ({ page }) => {
  await open(page);
  const badges = share(page, 'badges');
  await expect(badges).toHaveAccessibleName('Get the app');
  await expect(badges.getByRole('link', { name: 'Download on the App Store' })).toHaveAttribute('href', 'https://example.com/ios');
  await expect(badges.getByRole('link', { name: 'Get Acme on Google Play' })).toBeVisible();
  const image = badges.getByRole('link', { name: 'Download on the App Store' }).locator('img');
  const box = (await image.boundingBox())!;
  expect(Math.round(box.width / box.height * 100)).toBe(Math.round(160 / 48 * 100));
  await expect(badges.getByRole('link', { name: 'Broken badge' })).toContainText('Broken badge');
  await expect(badges.getByRole('link', { name: 'Broken badge' }).locator('img')).toHaveCount(0);
});

test('Instructor shows a heading, stacks on narrow screens and replaces a failed portrait with the name', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await open(page);
  const profile = share(page, 'instructor');
  await expect(profile.getByRole('heading', { level: 3, name: 'Maya Chen' })).toBeVisible();
  await expect(profile.getByRole('link', { name: 'Website (opens in a new tab)' })).toHaveAttribute('target', '_blank');
  await expect(profile.getByRole('img', { name: 'Portrait of Maya Chen' })).toBeVisible();
  const side = { image: (await profile.getByRole('img').boundingBox())!, name: (await profile.getByRole('heading').boundingBox())! };
  expect(side.name.x).toBeGreaterThan(side.image.x + side.image.width - 1);
  await expect(share(page, 'instructor-text').getByRole('heading', { name: 'Text Only' })).toBeVisible();
  await expect(share(page, 'instructor-text').getByRole('link')).toHaveCount(0);
  await expect(share(page, 'instructor-broken').getByRole('img')).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 800 });
  const stacked = { image: (await profile.getByRole('img').boundingBox())!, name: (await profile.getByRole('heading').boundingBox())! };
  expect(stacked.name.y).toBeGreaterThan(stacked.image.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('sections have no serious accessibility violations in light and dark, glass and clean', async ({ page }) => {
  for (const appearance of ['light', 'dark'] as const) for (const surface of ['glass', 'clean'] as const) {
    await open(page, `surface=${surface}&appearance=${appearance}`);
    const result = await new AxeBuilder({ page }).include('#x5-sections').analyze();
    expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), `${surface} ${appearance}`).toEqual([]);
  }
});

test('the component pages for the sections show a live preview and their states', async ({ page }) => {
  for (const [id, name] of [['share-buttons', 'ShareButtons'], ['footer', 'Footer'], ['section-head', 'SectionHead'], ['stat-strip', 'StatStrip'], ['cta-panel', 'CtaPanel'], ['navbar', 'Navbar'], ['hero', 'Hero'], ['feature-bento', 'FeatureBento'], ['testimonials', 'Testimonials'], ['app-badges', 'AppBadges'], ['instructor', 'Instructor']]) {
    await page.goto(`/components/${id}`);
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(page.getByTestId('component-preview')).toBeVisible({ timeout: 15_000 });
  }
});

test('sections keep the page free of console errors', async ({ page }) => {
  const errors: string[] = [];
  // The fixture deliberately includes missing images for other components' failure states; those 404s are expected.
  page.on('console', message => { if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await open(page);
  await sections(page).scrollIntoViewIfNeeded();
  expect(errors).toEqual([]);
});
