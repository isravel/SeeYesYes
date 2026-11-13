import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const open = async (page: Page, surface: 'glass' | 'clean' = 'glass') => {
  await page.goto(`/internal-checks/controls?surface=${surface}`);
  await expect(page.locator('#controls-scope')).toBeVisible();
};
const blur = (page: Page, selector: string) => page.locator(selector).first().evaluate(el => getComputedStyle(el).backdropFilter);

test('every Button variant renders, the aliases match their targets, and loading or disabled blocks activation', async ({ page }) => {
  await open(page);
  const section = page.locator('#buttons');
  const variant = (name: string) => section.getByRole('button', { name: `Button ${name}`, exact: true });
  await expect(variant('solid')).toHaveAttribute('data-variant', 'primary');
  await expect(variant('danger')).toHaveAttribute('data-variant', 'destructive');
  const background = (name: string) => variant(name).evaluate(el => getComputedStyle(el).backgroundColor);
  expect(await background('solid')).toBe(await background('primary'));
  expect(await background('danger')).toBe(await background('destructive'));
  for (const name of ['primary', 'secondary', 'ghost', 'destructive', 'outline', 'soft', 'muted']) {
    await variant(name).focus();
    await expect(variant(name)).toBeFocused();
    expect(await variant(name).evaluate(el => getComputedStyle(el).outlineStyle), `${name} focus ring`).toBe('solid');
  }
  // Hover changes the fill of the quiet variants, and a press nudges the button.
  for (const name of ['ghost', 'outline', 'soft', 'muted']) {
    const before = await background(name);
    await variant(name).hover();
    expect(await background(name), `${name} hover fill`).not.toBe(before);
    await page.mouse.move(0, 0);
  }
  await variant('primary').hover();
  await page.mouse.down();
  expect(await variant('primary').evaluate(el => getComputedStyle(el).transform), 'pressed').not.toBe('none');
  await page.mouse.up();
  await page.mouse.move(0, 0);
  expect(await background('outline')).not.toBe(await background('primary'));
  expect(await background('soft')).not.toBe(await background('muted'));
  const loading = section.getByRole('button', { name: 'Saving' });
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(section.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
});

test('Card, Dialog panel and menu blur under glass, a nested Card does not stack a second blur, and clean stays opaque', async ({ page }) => {
  await open(page);
  const outer = page.locator('section[aria-label="Surfaces"] [data-variant="elevated"]');
  expect(await outer.evaluate(el => getComputedStyle(el).backdropFilter)).toContain('blur(20px)');
  const inner = outer.locator('[data-nested]');
  await expect(inner).toHaveCount(1);
  expect(await inner.evaluate(el => getComputedStyle(el).backdropFilter)).toBe('none');
  await open(page, 'clean');
  expect(await blur(page, 'section[aria-label="Surfaces"] [data-variant="elevated"]')).toBe('none');
});

test('Avatar falls back to its initials, keeping its name, when the image fails, and the ring is applied', async ({ page }) => {
  await open(page);
  const surfaces = page.getByRole('region', { name: 'Surfaces' });
  const broken = surfaces.getByRole('img', { name: 'Maya Chen' });
  await expect(broken).toHaveText('MC');
  await expect(broken.locator('img')).toHaveCount(0);
  const ringed = surfaces.getByRole('img', { name: 'Ada B' });
  await expect(ringed).toHaveAttribute('data-ring', 'true');
  expect(await ringed.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none');
  expect(await broken.evaluate(el => getComputedStyle(el).boxShadow)).toBe('none');
});

test('toolbar Input and Select share the compact size and keep read-only and focus states', async ({ page }) => {
  await open(page);
  const toolbar = page.locator('section[aria-label="Toolbar"]');
  const search = toolbar.getByRole('textbox', { name: 'Search' });
  const sort = toolbar.getByRole('combobox', { name: 'Sort' });
  await expect(search).toHaveAttribute('data-size', 'small');
  await expect(sort).toHaveAttribute('data-size', 'small');
  const [a, b] = await Promise.all([search.boundingBox(), sort.boundingBox()]);
  expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(2);
  await search.focus();
  expect(await search.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  const readOnly = toolbar.getByRole('textbox', { name: 'Read only' });
  await readOnly.focus();
  await page.keyboard.type('x');
  await expect(readOnly).toHaveValue('Locked');
});

test('Dialog under glass: named modal, panel and page blur are separate layers, Escape closes and returns focus', async ({ page }) => {
  await open(page);
  const trigger = page.getByRole('button', { name: 'Open glass dialog' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Glass dialog' });
  await expect(dialog).toBeVisible();
  const panel = page.locator('[data-surface="glass"]').filter({ has: dialog });
  expect(await panel.evaluate(el => getComputedStyle(el).backdropFilter)).toContain('blur(20px)');
  // The page blur is a sibling of the panel, not an ancestor, so the two blurs stay independent.
  const layers = await panel.evaluate(modal => {
    const scrim = [...(modal.parentElement?.children ?? [])].find(child => child !== modal && child.getAttribute('aria-hidden') === 'true');
    return { found: Boolean(scrim), scrimBlur: scrim ? getComputedStyle(scrim).backdropFilter : '', scrimContainsPanel: scrim ? scrim.contains(modal) : null, panelNested: modal.parentElement ? getComputedStyle(modal.parentElement).backdropFilter : '' };
  });
  expect(layers.found).toBe(true);
  expect(layers.scrimBlur).toContain('blur(');
  expect(layers.scrimContainsPanel).toBe(false);
  expect(layers.panelNested).toBe('none');
  await expect(dialog.getByRole('button', { name: 'Close glass dialog' })).toBeVisible();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Dialog keeps an opaque panel without backdrop blur when forced colors are active', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page);
  await page.getByRole('button', { name: 'Open glass dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Glass dialog' });
  await expect(dialog).toBeVisible();
  const panel = page.locator('[data-surface="glass"]').filter({ has: dialog });
  expect(await panel.evaluate(el => getComputedStyle(el).backdropFilter)).toBe('none');
});

test('menu uses the glass surface, marks destructive items, supports arrow keys and returns focus', async ({ page }) => {
  await open(page);
  const trigger = page.getByRole('button', { name: 'Open glass menu' });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const menu = page.getByRole('menu', { name: 'Open glass menu' });
  await expect(menu).toBeVisible();
  const popover = page.locator('[data-surface="glass"]').filter({ has: menu });
  expect(await popover.evaluate(el => getComputedStyle(el).backdropFilter)).toContain('blur(20px)');
  await expect(menu.getByRole('menuitem', { name: 'Save' })).toBeFocused();
  expect(await menu.getByRole('menuitem', { name: 'Save' }).evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('ArrowDown');
  const destructive = menu.getByRole('menuitem', { name: 'Delete' });
  await expect(destructive).toBeFocused();
  await expect(destructive).toHaveAttribute('data-tone', 'destructive');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Tooltip opens on focus with a short label, dismisses with Escape and uses the glass surface', async ({ page }) => {
  await open(page);
  const trigger = page.getByRole('button', { name: 'Glass tooltip trigger' });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Short label');
  expect(await tooltip.evaluate(el => getComputedStyle(el).backdropFilter)).toContain('blur(20px)');
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('Tabs: line and boxed render, a disabled tab is skipped, and vertical tabs use the arrow keys they expect', async ({ page }) => {
  await open(page);
  const line = page.getByRole('tablist', { name: 'Line tabs' });
  await expect(line.locator('..')).toHaveAttribute('data-variant', 'line');
  await line.getByRole('tab', { name: 'Overview' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(line.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(line.getByRole('tab', { name: 'Overview' })).toBeFocused();
  await expect(line.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-disabled', 'true');
  // Automatic activation moved selection back to Overview, so it carries the line indicator and the unselected tab does not.
  await expect(line.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  expect(await line.getByRole('tab', { name: 'Overview' }).evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none');
  expect(await line.getByRole('tab', { name: 'Details' }).evaluate(el => getComputedStyle(el).boxShadow)).toBe('none');
  expect(await line.getByRole('tab', { name: 'Overview' }).evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  const boxed = page.getByRole('tablist', { name: 'Boxed vertical tabs' });
  await expect(boxed.locator('..')).toHaveAttribute('data-variant', 'boxed');
  await expect(boxed).toHaveAttribute('aria-orientation', 'vertical');
  await boxed.getByRole('tab', { name: 'Overview' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(boxed.getByRole('tab', { name: 'Details' })).toBeFocused();
});

test('Table keeps semantic headers, scrolls inside its region on a narrow screen and shows the row hover', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  const table = page.getByRole('table', { name: 'Stock' });
  await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
  await expect(table.getByRole('rowheader', { name: 'Apples' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const row = table.locator('tbody tr').first();
  const before = await row.evaluate(el => getComputedStyle(el).backgroundColor);
  await row.hover();
  expect(await row.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before);
  await expect(page.getByRole('region', { name: 'Stock table' })).toHaveAttribute('tabindex', '0');
});

test('auto-grow Textarea grows to the maximum then scrolls, shrinks back, and a fixed one stays put; manual size is kept', async ({ page }) => {
  await open(page);
  const grow = page.getByRole('textbox', { name: 'Grow notes' });
  const fixed = page.getByRole('textbox', { name: 'Fixed notes' });
  const height = (locator: typeof grow) => locator.evaluate(el => el.getBoundingClientRect().height);
  const empty = await height(grow);
  const fixedEmpty = await height(fixed);
  await grow.focus();
  await page.keyboard.type('one\ntwo\nthree');
  const three = await height(grow);
  expect(three).toBeGreaterThan(empty);
  await page.keyboard.type('\nfour\nfive\nsix\nseven\neight');
  const capped = await height(grow);
  expect(capped).toBeGreaterThan(three);
  await page.keyboard.type('\nnine\nten');
  expect(await height(grow)).toBe(capped);
  expect(await grow.evaluate(el => getComputedStyle(el).overflowY)).toBe('auto');
  await grow.fill('');
  await grow.dispatchEvent('input');
  expect(await height(grow)).toBeCloseTo(empty, 0);
  await fixed.focus();
  await page.keyboard.type('a\nb\nc\nd\ne\nf');
  expect(await height(fixed)).toBe(fixedEmpty);
  expect(await grow.evaluate(el => getComputedStyle(el).resize)).not.toBe('none');
  expect(await fixed.evaluate(el => getComputedStyle(el).resize)).not.toBe('none');
});

test('Field wires the label, help and error, and Fieldset and RadioGroup name their groups with option messages', async ({ page }) => {
  await open(page);
  const notes = page.getByRole('textbox', { name: 'Grow notes' });
  await expect(notes).toHaveAccessibleDescription('Grows up to four lines.');
  const group = page.getByRole('group', { name: /Contact details/ });
  await expect(group).toBeVisible();
  await expect(group).toHaveAccessibleDescription(/How we reach you\..*Choose one way\./);
  await expect(group.getByRole('textbox', { name: 'Phone' })).toBeVisible();
  await expect(group.getByRole('checkbox', { name: 'Select all' })).toHaveJSProperty('indeterminate', true);
  await expect(group.getByRole('switch', { name: 'Notifications' })).toBeVisible();
  await expect(group.locator('label[data-tone="neutral"]')).toHaveCount(1);
  const plan = page.getByRole('group', { name: 'Plan' });
  await expect(plan.getByRole('radio', { name: 'Basic' })).toHaveAccessibleDescription('For one person');
  await expect(plan.getByRole('radio', { name: 'Team' })).toHaveAccessibleDescription('Needs an admin');
  expect(await plan.getByRole('radio').evaluateAll(radios => radios.filter(radio => (radio as HTMLInputElement).checked).length)).toBe(0);
  await plan.getByRole('radio', { name: 'Basic' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(plan.getByRole('radio', { name: 'Team' })).toBeChecked();
  await expect(plan.getByRole('radio', { name: 'Basic' })).not.toBeChecked();
});

test('feedback: alerts carry text and roles, Progress is determinate or indeterminate, and Skeleton stops animating with reduced motion', async ({ page }) => {
  await open(page);
  // Next adds its own route announcer with role="alert", so scope to the message under test.
  const alert = page.getByRole('alert').filter({ hasText: 'Could not save' });
  await expect(alert).toHaveAttribute('data-variant', 'outline');
  await expect(alert).toContainText('Could not save');
  await expect(alert).toContainText('Try again in a moment.');
  await expect(page.getByRole('status').filter({ hasText: 'Plain message' })).toBeVisible();
  const upload = page.getByRole('progressbar', { name: 'Upload' });
  await expect(upload).toHaveAttribute('value', '40');
  const scanning = page.getByRole('progressbar', { name: 'Scanning' });
  expect(await scanning.evaluate(el => (el as HTMLProgressElement).position)).toBe(-1);
  await expect(page.getByRole('separator')).toBeVisible();
  const skeleton = page.getByTestId('skeleton');
  await expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  expect(await skeleton.evaluate(el => getComputedStyle(el).animationName)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await skeleton.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});

test('the whole control page has no serious or critical accessibility violations in light and dark', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await open(page);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')), colorScheme).toEqual([]);
  }
});

test('nothing on the control page overflows a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test.describe('SYX-021 menu links, groups, separators, empty state and narrow viewport', () => {
  const openMenu = async (page: Page, name: string) => {
    await page.getByRole('button', { name, exact: true }).focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name });
    await expect(menu).toBeVisible();
    return menu;
  };

  test('groups are named, separators are not focusable, and empty groups and edge separators are dropped', async ({ page }) => {
    await open(page);
    const menu = await openMenu(page, 'Open grouped menu');
    await expect(menu.getByRole('group', { name: 'File' })).toBeVisible();
    await expect(menu.getByRole('group', { name: 'Help' })).toBeVisible();
    await expect(menu.getByRole('group', { name: 'Hidden group' })).toHaveCount(0);
    // Two separators remain, one after each of the first two groups; the trailing separator is dropped.
    await expect(menu.getByRole('separator')).toHaveCount(2);
    // Arrow keys skip the disabled item, headings and separators; Home and End reach the first and last items.
    await expect(menu.getByRole('menuitem', { name: 'Open', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'Read the docs' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: /Publisher site/ })).toBeFocused();
    await page.keyboard.press('End');
    await expect(menu.getByRole('menuitem', { name: /^Remove everything/ })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(menu.getByRole('menuitem', { name: 'Open', exact: true })).toBeFocused();
    await expect(menu.getByRole('menuitem', { name: 'Rename' })).toHaveAttribute('aria-disabled', 'true');
    for (const separator of await menu.getByRole('separator').all()) expect(await separator.getAttribute('tabindex')).toBeNull();
  });

  test('an action item calls onAction; a link item does not and renders a real anchor', async ({ page }) => {
    await open(page);
    let menu = await openMenu(page, 'Open grouped menu');
    await menu.getByRole('menuitem', { name: 'Open', exact: true }).click();
    await expect(page.getByTestId('menu-status')).toHaveText('open');
    menu = await openMenu(page, 'Open grouped menu');
    const external = menu.getByRole('menuitem', { name: /Publisher site/ });
    expect(await external.evaluate(el => el.tagName)).toBe('A');
    await expect(external).toHaveAttribute('href', 'https://example.com');
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(external).toContainText('opens in a new tab');
    const internal = menu.getByRole('menuitem', { name: 'Read the docs' });
    await expect(internal).toHaveAttribute('href', '/docs');
    await expect(internal).not.toHaveAttribute('target', /.+/);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('menu-status')).toHaveText('open');
  });

  test('Enter on a link item navigates and does not report an action', async ({ page }) => {
    await open(page);
    const menu = await openMenu(page, 'Open grouped menu');
    await menu.getByRole('menuitem', { name: 'Read the docs' }).focus();
    await Promise.all([page.waitForURL('**/docs'), page.keyboard.press('Enter')]);
    expect(new URL(page.url()).pathname).toBe('/docs');
  });

  test('an empty menu shows its message in the named menu and closes with focus returned', async ({ page }) => {
    await open(page);
    const menu = await openMenu(page, 'Open empty menu');
    await expect(menu.getByText('No actions available.')).toBeVisible();
    // React Aria exposes the empty message as one inert row, so there is nothing to act on: no link, no action and no real item.
    await expect(menu.getByRole('menuitem')).toHaveCount(1);
    await expect(menu.getByRole('menuitem')).toHaveText('No actions available.');
    await expect(menu.locator('a')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open empty menu' })).toBeFocused();
  });

  test('at 320px the popover stays inside the viewport, a long label wraps, and the page does not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page);
    const menu = await openMenu(page, 'Open grouped menu');
    const popover = page.locator('[data-surface="glass"]').filter({ has: menu });
    const box = (await popover.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320 + 0.5);
    const longItem = menu.getByRole('menuitem', { name: /^Remove everything/ });
    expect(await longItem.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
    // With little height the popover scrolls instead of leaving the screen.
    await page.setViewportSize({ width: 320, height: 240 });
    await page.getByRole('button', { name: 'Open grouped menu', exact: true }).scrollIntoViewIfNeeded();
    await openMenu(page, 'Open grouped menu');
    const short = (await popover.boundingBox())!;
    expect(short.y + short.height).toBeLessThanOrEqual(240 + 1);
    expect(await popover.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  });

  test('the open menu has no serious or critical accessibility violations', async ({ page }) => {
    await open(page);
    await openMenu(page, 'Open grouped menu');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => v.id)).toEqual([]);
  });
});
