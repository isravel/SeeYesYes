import { describe, expect, it } from 'vitest';
import { PersistenceEnvelopeSchema } from '@/lib/contract/schema';
import { registry, defaultTheme } from '@/lib/data/registry';
import {
  buildThemeBootstrapScript, createPersistenceEnvelope, isAllowedBootstrapValue,
  parseStoredSettings, SETTINGS_STORAGE_KEY,
} from '@/lib/theme/persistence';
import { applyDraft, createThemeStores, discardDraft, initializeThemeStores, persistWorkspaceSettings, resetDraft } from '@/lib/theme/stores';

describe('versioned theme settings', () => {
  const settings = { settingsVersion: 1 as const, theme: defaultTheme, appearance: 'system' as const };

  it('creates a valid envelope with both mode maps and resolver-versioned variables', () => {
    const envelope = createPersistenceEnvelope(settings, 3, registry);
    expect(PersistenceEnvelopeSchema.parse(envelope)).toEqual(envelope);
    expect(envelope.bootstrap?.themeRevision).toBe(3);
    expect(Object.keys(envelope.bootstrap!.modes.light)).toEqual(Object.keys(envelope.bootstrap!.modes.dark));
    const values = [
      ...Object.values(envelope.bootstrap!.modeIndependent),
      ...Object.values(envelope.bootstrap!.modes.light),
      ...Object.values(envelope.bootstrap!.modes.dark),
    ];
    expect(values.length).toBeGreaterThan(20);
    expect(values.every(isAllowedBootstrapValue)).toBe(true);
  });

  it('restores validated settings and drops stale or unsafe bootstrap data', () => {
    const envelope = createPersistenceEnvelope(settings, 3, registry);
    const stale = parseStoredSettings(JSON.stringify({ ...envelope, bootstrap: { ...envelope.bootstrap, themeRevision: 2 } }), registry);
    expect(stale.envelope.settings).toEqual(settings);
    expect(stale.envelope.bootstrap).toBeUndefined();
    expect(stale.notice).toMatch(/out of date/);
    const unsafe = parseStoredSettings(JSON.stringify({ ...envelope, bootstrap: { ...envelope.bootstrap, modeIndependent: { ...envelope.bootstrap!.modeIndependent, '--sys-color-background': 'red;display:none' } } }), registry);
    expect(unsafe.envelope.bootstrap).toBeUndefined();
    expect(() => parseStoredSettings(JSON.stringify({ ...envelope, settings: { ...settings, theme: { ...defaultTheme, typography: { ...defaultTheme.typography, sansFontId: 'unknown' } } } }), registry)).toThrow(/Unknown sans font/);
  });

  it('initializes independent applied and draft state from storage and supports a session-only fallback', () => {
    const stores = createThemeStores();
    expect(stores.defaults.getState().settings.theme).toEqual(defaultTheme);
    const saved = createPersistenceEnvelope({ ...settings, appearance: 'dark' }, 4, registry);
    const memory = new Map([[SETTINGS_STORAGE_KEY, JSON.stringify(saved)]]);
    initializeThemeStores(stores, registry, {
      getItem: key => memory.get(key) ?? null,
      setItem: (key, value) => { memory.set(key, value); },
    });
    expect(stores.applied.getState().settings.appearance).toBe('dark');
    expect(stores.draft.getState().baseThemeRevision).toBe(4);
    expect(stores.draft.getState().theme).toEqual(defaultTheme);

    const blocked = createThemeStores();
    initializeThemeStores(blocked, registry, null);
    expect(blocked.applied.getState().persistence).toBe('session-only');
    expect(blocked.applied.getState().notice).toMatch(/reset on refresh/);
    expect(blocked.applied.getState().initialized).toBe(true);
    const denied = createThemeStores();
    initializeThemeStores(denied, registry, { getItem: () => { throw new Error('denied'); }, setItem: () => {} });
    expect(denied.applied.getState().persistence).toBe('session-only');
  });

  it('writes a complete versioned envelope only after validating the theme', () => {
    let written = '';
    persistWorkspaceSettings(settings, 1, registry, { getItem: () => null, setItem: (_key, value) => { written = value; } });
    expect(PersistenceEnvelopeSchema.parse(JSON.parse(written)).settings).toEqual(settings);
    expect(() => persistWorkspaceSettings({ ...settings, theme: { ...defaultTheme, id: 'bad', basedOn: 'missing' } }, 1, registry, { getItem: () => null, setItem: () => { throw new Error('should not write'); } })).toThrow();
  });

  it('keeps the early bootstrap inline script syntactically valid', () => {
    expect(() => new Function(buildThemeBootstrapScript())).not.toThrow();
  });
});

describe('draft lifecycle actions', () => {
  const storageFor = (memory: Map<string, string>) => ({ getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => { memory.set(k, v); } });
  const edited = { ...defaultTheme, radius: defaultTheme.radius === 'curvy' ? 'sharp' as const : 'curvy' as const };

  function setup(appearance: 'light' | 'dark' | 'system' = 'dark') {
    const memory = new Map([[SETTINGS_STORAGE_KEY, JSON.stringify(createPersistenceEnvelope({ settingsVersion: 1, theme: defaultTheme, appearance }, 2, registry))]]);
    const stores = createThemeStores();
    initializeThemeStores(stores, registry, storageFor(memory));
    return { memory, stores };
  }

  it('tracks unsaved state by settings only, ignoring theme identity', () => {
    const { stores } = setup();
    stores.draft.getState().setTheme({ ...defaultTheme, id: 'custom', basedOn: defaultTheme.id });
    expect(stores.draft.getState().dirty).toBe(false);
    stores.draft.getState().setTheme(edited);
    expect(stores.draft.getState().dirty).toBe(true);
  });

  it('applies the draft with custom identity, bumps the revision once, preserves appearance, and saves', () => {
    const { memory, stores } = setup('dark');
    stores.draft.getState().setTheme(edited);
    expect(applyDraft(stores, registry, storageFor(memory))).toMatchObject({ status: 'applied', persisted: true });
    const applied = stores.applied.getState();
    expect(applied.settings.appearance).toBe('dark');
    expect(applied.settings.theme).toMatchObject({ id: 'custom', basedOn: defaultTheme.id, radius: edited.radius });
    expect(applied.themeRevision).toBe(3);
    expect(stores.draft.getState()).toMatchObject({ dirty: false, baseThemeRevision: 3 });
    const stored = PersistenceEnvelopeSchema.parse(JSON.parse(memory.get(SETTINGS_STORAGE_KEY)!));
    expect(stored.themeRevision).toBe(3);
    expect(stored.settings.appearance).toBe('dark');
    expect(applyDraft(stores, registry, storageFor(memory)).status).toBe('unchanged');
    expect(stores.applied.getState().themeRevision).toBe(3);
  });

  it('restores the stock preset identity when the draft matches it again', () => {
    const { memory, stores } = setup();
    stores.draft.getState().setTheme(edited);
    applyDraft(stores, registry, storageFor(memory));
    resetDraft(stores);
    applyDraft(stores, registry, storageFor(memory));
    expect(stores.applied.getState().settings.theme).toEqual(defaultTheme);
    expect(stores.applied.getState().themeRevision).toBe(4);
  });

  it('discards to the applied theme and resets to the default preset without touching the workspace', () => {
    const { memory, stores } = setup();
    stores.draft.getState().setTheme(edited);
    applyDraft(stores, registry, storageFor(memory));
    stores.draft.getState().setTheme({ ...edited, density: 'compact' });
    discardDraft(stores);
    expect(stores.draft.getState()).toMatchObject({ theme: stores.applied.getState().settings.theme, dirty: false });
    const before = memory.get(SETTINGS_STORAGE_KEY);
    resetDraft(stores);
    expect(stores.draft.getState().theme).toEqual(defaultTheme);
    expect(stores.draft.getState().dirty).toBe(true);
    expect(stores.applied.getState().settings.theme.radius).toBe(edited.radius);
    expect(memory.get(SETTINGS_STORAGE_KEY)).toBe(before);
  });

  it('keeps session-only applies out of storage and survives write failures', () => {
    const session = createThemeStores();
    initializeThemeStores(session, registry, null);
    session.draft.getState().setTheme(edited);
    expect(applyDraft(session, registry, null)).toMatchObject({ status: 'applied', persisted: false });
    expect(session.applied.getState().settings.theme.radius).toBe(edited.radius);
    const { stores } = setup();
    stores.draft.getState().setTheme(edited);
    const result = applyDraft(stores, registry, { getItem: () => null, setItem: () => { throw new Error('quota'); } });
    expect(result.persisted).toBe(false);
    expect(result.notice).toMatch(/could not be saved/);
    expect(stores.applied.getState().settings.theme.radius).toBe(edited.radius);
  });
});
