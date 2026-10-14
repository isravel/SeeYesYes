import { defaultWorkspaceSettings } from '@/lib/theme/default-settings';
import { describe, expect, it } from 'vitest';
import { PersistenceEnvelopeSchema } from '@/lib/contract/schema';
import { defaultTheme, registry } from '@/lib/data/registry';
import { createPersistenceEnvelope, SETTINGS_STORAGE_KEY } from '@/lib/theme/persistence';
import { createThemeStores, discardDraft, initializeThemeStores, resetDraft, type StorageLike } from '@/lib/theme/stores';
import { commitAppearance, commitDraft, CONFLICT_MESSAGE, SETTINGS_LOCK_NAME, syncFromStorage, type LockManagerLike, type WriterEnv } from '@/lib/theme/writer';

/** Shared browser state: one storage and one exclusive lock queue, observed by several simulated tabs. */
function createBrowser() {
  const memory = new Map<string, string>();
  const writes: string[] = [];
  let tail: Promise<unknown> = Promise.resolve();
  const lockNames: string[] = [];
  const storage: StorageLike = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => { writes.push(value); memory.set(key, value); } };
  const locks: LockManagerLike = {
    request(name, _options, callback) {
      lockNames.push(name);
      const run = tail.then(() => callback());
      tail = run.catch(() => undefined);
      return run;
    },
  };
  const tab = (options: { locks?: boolean } = {}) => {
    const stores = createThemeStores(defaultWorkspaceSettings);
    const hasLocks = options.locks !== false;
    initializeThemeStores(stores, registry, storage, hasLocks);
    const env: WriterEnv = { storage, locks: hasLocks ? locks : null };
    return { stores, env };
  };
  return { memory, writes, lockNames, storage, locks, tab };
}

const stored = (memory: Map<string, string>) => PersistenceEnvelopeSchema.parse(JSON.parse(memory.get(SETTINGS_STORAGE_KEY)!));
const withRadius = (radius: 'sharp' | 'soft' | 'curvy') => ({ ...defaultTheme, radius });
const otherRadius = defaultTheme.radius === 'curvy' ? 'sharp' as const : 'curvy' as const;

describe('serialized settings writer', () => {
  it('keeps both fields when a theme apply and an appearance change race across tabs', async () => {
    const browser = createBrowser();
    browser.memory.set(SETTINGS_STORAGE_KEY, JSON.stringify(createPersistenceEnvelope({ settingsVersion: 1, theme: defaultTheme, appearance: 'light' }, 1, registry)));
    const a = browser.tab();
    const b = browser.tab();
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    const [apply, appearance] = await Promise.all([
      commitDraft(a.stores, registry, a.env),
      commitAppearance(b.stores, registry, b.env, 'dark'),
    ]);
    expect(apply.status).toBe('applied');
    expect(appearance.status).toBe('applied');
    const envelope = stored(browser.memory);
    expect(envelope.settings.appearance).toBe('dark');
    expect(envelope.settings.theme.radius).toBe(otherRadius);
    expect(envelope.themeRevision).toBe(2);
    expect(envelope.bootstrap?.themeRevision).toBe(2);
    expect(new Set(browser.lockNames)).toEqual(new Set([SETTINGS_LOCK_NAME]));
  });

  it('applies the appearance last when it queues after the theme, without changing the revision', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    const first = commitDraft(a.stores, registry, a.env);
    const second = commitAppearance(a.stores, registry, a.env, 'light');
    await Promise.all([first, second]);
    const envelope = stored(browser.memory);
    expect(envelope).toMatchObject({ themeRevision: 1, settings: { appearance: 'light' } });
    expect(envelope.settings.theme.radius).toBe(otherRadius);
  });

  it('rejects a stale draft without writing, keeps it, adopts the latest theme, and recovers through Discard', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    const b = browser.tab();
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    b.stores.draft.getState().setTheme({ ...defaultTheme, density: 'compact' });
    await commitDraft(a.stores, registry, a.env);
    const before = browser.memory.get(SETTINGS_STORAGE_KEY);
    const writesBefore = browser.writes.length;

    const result = await commitDraft(b.stores, registry, b.env);
    expect(result).toMatchObject({ status: 'conflict', persisted: false, message: CONFLICT_MESSAGE });
    expect(browser.writes.length).toBe(writesBefore);
    expect(browser.memory.get(SETTINGS_STORAGE_KEY)).toBe(before);
    expect(b.stores.draft.getState()).toMatchObject({ conflict: true, dirty: true });
    expect(b.stores.draft.getState().theme.density).toBe('compact');
    expect(b.stores.applied.getState().settings.theme.radius).toBe(otherRadius);
    expect(b.stores.applied.getState().themeRevision).toBe(1);

    // Reset draft changes values but does not erase the stale baseline.
    resetDraft(b.stores);
    expect((await commitDraft(b.stores, registry, b.env)).status).toBe('conflict');

    discardDraft(b.stores);
    expect(b.stores.draft.getState()).toMatchObject({ conflict: false, dirty: false, baseThemeRevision: 1 });
    b.stores.draft.getState().setTheme({ ...b.stores.draft.getState().theme, density: 'compact' });
    expect((await commitDraft(b.stores, registry, b.env)).status).toBe('applied');
    expect(stored(browser.memory).themeRevision).toBe(2);
  });

  it('prevents duplicate submits while a save is pending', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    const first = commitDraft(a.stores, registry, a.env);
    expect(a.stores.draft.getState().saving).toBe(true);
    expect((await commitDraft(a.stores, registry, a.env)).status).toBe('busy');
    await first;
    expect(a.stores.draft.getState().saving).toBe(false);
    expect(browser.writes).toHaveLength(1);
  });

  it('leaves a cancelled lock request unsaved, offers retry, and never writes without the lock', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    let fail = true;
    const flaky: WriterEnv = { storage: browser.storage, locks: { request: (name, options, callback) => fail ? Promise.reject(new Error('aborted')) : browser.locks.request(name, options, callback) } };
    const failed = await commitDraft(a.stores, registry, flaky);
    expect(failed.status).toBe('failed');
    expect(browser.writes).toHaveLength(0);
    expect(a.stores.draft.getState()).toMatchObject({ saving: false, dirty: true });
    expect(a.stores.draft.getState().saveError).toMatch(/Retry/);
    expect(a.stores.applied.getState().settings.theme.radius).toBe(defaultTheme.radius);
    fail = false;
    expect((await commitDraft(a.stores, registry, flaky)).status).toBe('applied');
    expect(a.stores.draft.getState().saveError).toBeNull();
  });

  it('rejects an invalid draft before taking the lock', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    a.stores.draft.getState().setTheme({ ...defaultTheme, typography: { ...defaultTheme.typography, sansFontId: 'unknown' } });
    const result = await commitDraft(a.stores, registry, a.env);
    expect(result.status).toBe('failed');
    expect(result.message).toMatch(/Your draft is unchanged/);
    expect(browser.lockNames).toHaveLength(0);
    expect(browser.writes).toHaveLength(0);
  });

  it('survives a failing write by applying for the session only', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    const failing: WriterEnv = { storage: { getItem: browser.storage.getItem, setItem: () => { throw new Error('quota'); } }, locks: browser.locks };
    const result = await commitDraft(a.stores, registry, failing);
    expect(result).toMatchObject({ status: 'applied', persisted: false });
    expect(a.stores.applied.getState().notice).toMatch(/could not be saved/);
  });
});

describe('storage event sync', () => {
  it('adopts the latest envelope, keeps the draft and its baseline, and recalculates the unsaved state', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    const b = browser.tab();
    b.stores.draft.getState().setTheme(withRadius(otherRadius));
    expect(b.stores.draft.getState().dirty).toBe(true);
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    await commitDraft(a.stores, registry, a.env);
    await commitAppearance(a.stores, registry, a.env, 'dark');

    // Two queued events resolve to the latest stored envelope, not to either payload.
    expect(syncFromStorage(b.stores, registry, b.env.storage)).toBe(true);
    expect(syncFromStorage(b.stores, registry, b.env.storage)).toBe(true);
    expect(b.stores.applied.getState()).toMatchObject({ themeRevision: 1, settings: { appearance: 'dark' } });
    expect(b.stores.applied.getState().settings.theme.radius).toBe(otherRadius);
    expect(b.stores.draft.getState()).toMatchObject({ baseThemeRevision: 0, dirty: false });
    expect(b.stores.draft.getState().theme.radius).toBe(otherRadius);
  });

  it('ignores unreadable storage and session-only tabs', async () => {
    const browser = createBrowser();
    const a = browser.tab();
    const session = browser.tab({ locks: false });
    a.stores.draft.getState().setTheme(withRadius(otherRadius));
    await commitDraft(a.stores, registry, a.env);
    expect(syncFromStorage(session.stores, registry, browser.storage)).toBe(false);
    expect(session.stores.applied.getState().themeRevision).toBe(0);
    browser.memory.set(SETTINGS_STORAGE_KEY, '{broken');
    expect(syncFromStorage(a.stores, registry, browser.storage)).toBe(false);
    expect(a.stores.applied.getState().themeRevision).toBe(1);
  });
});

describe('fallbacks without Web Locks or storage', () => {
  it('reads saved settings but never writes shared storage', async () => {
    const browser = createBrowser();
    const saver = browser.tab();
    saver.stores.draft.getState().setTheme(withRadius(otherRadius));
    await commitDraft(saver.stores, registry, saver.env);
    await commitAppearance(saver.stores, registry, saver.env, 'dark');
    const snapshot = browser.memory.get(SETTINGS_STORAGE_KEY);
    const writes = browser.writes.length;

    const session = browser.tab({ locks: false });
    expect(session.stores.applied.getState()).toMatchObject({ persistence: 'session-only', initialized: true });
    expect(session.stores.applied.getState().notice).toMatch(/reset on refresh/);
    expect(session.stores.applied.getState().settings.theme.radius).toBe(otherRadius);
    session.stores.draft.getState().setTheme({ ...session.stores.draft.getState().theme, density: 'compact' });
    expect((await commitDraft(session.stores, registry, session.env)).persisted).toBe(false);
    expect((await commitAppearance(session.stores, registry, session.env, 'light')).persisted).toBe(false);
    expect(session.stores.applied.getState().settings).toMatchObject({ appearance: 'light', theme: { density: 'compact' } });
    expect(browser.writes.length).toBe(writes);
    expect(browser.memory.get(SETTINGS_STORAGE_KEY)).toBe(snapshot);
  });

  it('keeps blocked storage session-only', async () => {
    const stores = createThemeStores(defaultWorkspaceSettings);
    initializeThemeStores(stores, registry, { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    expect(stores.applied.getState().persistence).toBe('session-only');
    stores.draft.getState().setTheme(withRadius(otherRadius));
    const result = await commitDraft(stores, registry, { storage: null, locks: null });
    expect(result.persisted).toBe(false);
    expect(stores.applied.getState().settings.theme.radius).toBe(otherRadius);
  });
});

describe('unreadable saved settings', () => {
  it('falls back to defaults with a specific notice for corrupt and unsupported data', () => {
    const corrupt = createThemeStores(defaultWorkspaceSettings);
    initializeThemeStores(corrupt, registry, { getItem: () => '{nope', setItem: () => {} });
    expect(corrupt.applied.getState().notice).toMatch(/could not be read/);
    const future = createThemeStores(defaultWorkspaceSettings);
    initializeThemeStores(future, registry, { getItem: () => JSON.stringify({ envelopeVersion: 9, settings: {} }), setItem: () => {} });
    expect(future.applied.getState().notice).toMatch(/format this version does not support/);
    expect(future.applied.getState().settings.theme).toEqual(defaultTheme);
    expect(future.applied.getState().persistence).toBe('persistent');
  });
});
