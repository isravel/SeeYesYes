import { describe, expect, it } from 'vitest';
import { PersistenceEnvelopeSchema } from '@/lib/contract/schema';
import { registry, defaultTheme } from '@/lib/data/registry';
import {
  buildThemeBootstrapScript, createPersistenceEnvelope, isAllowedBootstrapValue,
  parseStoredSettings, SETTINGS_STORAGE_KEY,
} from '@/lib/theme/persistence';
import { createThemeStores, initializeThemeStores, persistWorkspaceSettings } from '@/lib/theme/stores';

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
