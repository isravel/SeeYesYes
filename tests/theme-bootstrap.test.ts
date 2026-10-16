import { defaultWorkspaceSettings } from '@/lib/theme/default-settings';
import { describe, expect, it } from 'vitest';
import { defaultTheme, registry } from '@/lib/data/registry';
import { buildThemeBootstrapScript, createPersistenceEnvelope, SETTINGS_STORAGE_KEY } from '@/lib/theme/persistence';
import { resolveTokens } from '@/lib/theme/resolve';
import { createThemeStores, initializeThemeStores, resetDraft } from '@/lib/theme/stores';
import { commitAppearance, commitDraft, type LockManagerLike, type WriterEnv } from '@/lib/theme/writer';

type Appearance = 'light' | 'dark' | 'system';
const settings = (appearance: Appearance, theme = defaultTheme) => ({ settingsVersion: 1 as const, theme, appearance });

/** Runs the real inline script against a fake document and returns what it applied. */
function runBootstrap(stored: unknown, osDark: boolean) {
  const applied: Record<string, string> = {};
  const attributes: Record<string, string> = {};
  const document = { documentElement: {
    style: { setProperty: (name: string, value: string) => { applied[name] = value; }, colorScheme: '' },
    setAttribute: (name: string, value: string) => { attributes[name] = value; },
  } };
  const localStorage = { getItem: (key: string) => key === SETTINGS_STORAGE_KEY ? (typeof stored === 'string' ? stored : JSON.stringify(stored)) : null };
  const matchMedia = () => ({ matches: osDark });
  new Function('localStorage', 'matchMedia', 'document', buildThemeBootstrapScript())(localStorage, matchMedia, document);
  return { applied, appearance: attributes['data-appearance'] };
}

describe('early bootstrap script', () => {
  const envelope = createPersistenceEnvelope(settings('system'), 5, registry);
  const clone = () => JSON.parse(JSON.stringify(envelope)) as typeof envelope;

  it('applies the cached values for the OS mode at load, not the mode at Apply time', () => {
    const light = runBootstrap(envelope, false);
    const dark = runBootstrap(envelope, true);
    expect(light.appearance).toBe('light');
    expect(dark.appearance).toBe('dark');
    expect(light.applied['--sys-color-background']).toBe(envelope.bootstrap!.modes.light['--sys-color-background']);
    expect(dark.applied['--sys-color-background']).toBe(envelope.bootstrap!.modes.dark['--sys-color-background']);
    expect(light.applied['--sys-color-background']).not.toBe(dark.applied['--sys-color-background']);
    expect(light.applied['--sys-radius-control']).toBe(dark.applied['--sys-radius-control']);
  });

  it('follows an explicit appearance regardless of the OS', () => {
    expect(runBootstrap(createPersistenceEnvelope(settings('dark'), 1, registry), false).appearance).toBe('dark');
    expect(runBootstrap(createPersistenceEnvelope(settings('light'), 1, registry), true).appearance).toBe('light');
  });

  const cases: Array<[string, (e: ReturnType<typeof clone>) => unknown]> = [
    ['a missing cache', e => ({ ...e, bootstrap: undefined })],
    ['a stale revision', e => ({ ...e, bootstrap: { ...e.bootstrap!, themeRevision: 4 } })],
    ['a negative revision', e => ({ ...e, themeRevision: -1, bootstrap: { ...e.bootstrap!, themeRevision: -1 } })],
    ['an unsafe revision', e => ({ ...e, themeRevision: Number.MAX_SAFE_INTEGER + 1, bootstrap: { ...e.bootstrap!, themeRevision: Number.MAX_SAFE_INTEGER + 1 } })],
    ['an old cache version', e => ({ ...e, bootstrap: { ...e.bootstrap!, cacheVersion: 0 } })],
    ['an old resolver version', e => ({ ...e, bootstrap: { ...e.bootstrap!, resolverVersion: '0.9' } })],
    ['an unsafe value', e => ({ ...e, bootstrap: { ...e.bootstrap!, modeIndependent: { ...e.bootstrap!.modeIndependent, '--sys-radius-control': 'red;display:none' } } })],
    ['a bad variable name', e => ({ ...e, bootstrap: { ...e.bootstrap!, modeIndependent: { ...e.bootstrap!.modeIndependent, 'color': '1rem' } } })],
    ['mismatched light/dark keys', e => ({ ...e, bootstrap: { ...e.bootstrap!, modes: { ...e.bootstrap!.modes, dark: { '--sys-color-extra': e.bootstrap!.modes.dark['--sys-color-background'] } } } })],
    ['an unsupported envelope version', e => ({ ...e, envelopeVersion: 2 })],
    ['an invalid appearance', e => ({ ...e, settings: { ...e.settings, appearance: 'sepia' } })],
    ['corrupt JSON', () => '{not json'],
  ];
  for (const [name, mutate] of cases) {
    it(`discards the whole cache for ${name} and applies nothing`, () => {
      const result = runBootstrap(mutate(clone()), true);
      expect(result.applied).toEqual({});
      expect(result.appearance).toBeUndefined();
    });
  }
});

describe('bootstrap allowlist and resolver', () => {
  it('accepts every value the resolver can emit, across all scale and effect combinations', () => {
    let checked = 0;
    for (const density of ['compact', 'comfortable', 'spacious'] as const)
      for (const radius of ['sharp', 'soft', 'curvy'] as const)
        for (const shadows of ['none', 'soft', 'defined'] as const)
          for (const surface of ['clean', 'subtle-depth'] as const)
            for (const motion of ['none', 'subtle'] as const)
              for (const scale of ['small', 'default', 'large'] as const) {
                const theme = { ...defaultTheme, density, radius, shadows, motion, effects: { ...defaultTheme.effects, surface }, typography: { ...defaultTheme.typography, scale } };
                const result = runBootstrap(createPersistenceEnvelope(settings('light', theme), 1, registry), false);
                const expected = Object.keys(createPersistenceEnvelope(settings('light', theme), 1, registry).bootstrap!.modeIndependent).length;
                // The script only applies a cache when every value passes its own allowlist, so a full map proves each value matched.
                expect(Object.keys(result.applied).length).toBeGreaterThan(expected);
                checked += 1;
              }
    expect(checked).toBe(3 * 3 * 3 * 2 * 2 * 3);
  });

  it('emits mode-dependent values only for colors and shadows, with identical key sets per mode', () => {
    const cache = createPersistenceEnvelope(settings('light'), 1, registry).bootstrap!;
    expect(Object.keys(cache.modes.light)).toEqual(Object.keys(cache.modes.dark));
    expect(Object.keys(cache.modes.light).every(name => /^--sys-(color|shadow)/.test(name))).toBe(true);
  });
});

describe('mode independence and token propagation', () => {
  const edited = { ...defaultTheme, colors: { ...defaultTheme.colors, light: { ...defaultTheme.colors.light, primary: { l: 0.4, c: 0.2, h: 30, alpha: 1 } } } };
  const primary = (theme: typeof defaultTheme, mode: 'light' | 'dark') => {
    const token = resolveTokens(registry.tokens, theme, registry.fonts).find(t => t.id === 'color.primary')!;
    return (token.value as { light: string; dark: string })[mode];
  };

  it('editing one mode leaves the other unchanged', () => {
    expect(primary(edited, 'dark')).toBe(primary(defaultTheme, 'dark'));
    expect(primary(edited, 'light')).not.toBe(primary(defaultTheme, 'light'));
  });

  it('applying a theme changes the resolved bootstrap cache and its revision together', async () => {
    const memory = new Map<string, string>();
    const storage = { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => { memory.set(k, v); } };
    const locks: LockManagerLike = { request: async (_n, _o, cb) => cb() };
    const env: WriterEnv = { storage, locks };
    const stores = createThemeStores(defaultWorkspaceSettings);
    initializeThemeStores(stores, registry, storage);
    stores.draft.getState().setTheme(edited);
    await commitDraft(stores, registry, env);
    const saved = JSON.parse(memory.get(SETTINGS_STORAGE_KEY)!);
    expect(saved.themeRevision).toBe(1);
    expect(saved.bootstrap.themeRevision).toBe(1);
    expect(saved.bootstrap.modes.light['--sys-color-primary']).toBe(primary(edited, 'light'));
    expect(saved.bootstrap.modes.dark['--sys-color-primary']).toBe(primary(defaultTheme, 'dark'));
  });
});

describe('global appearance during an open draft', () => {
  it('leaves the draft and unsaved state alone, and Apply does not revert the appearance', async () => {
    const memory = new Map<string, string>();
    const storage = { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => { memory.set(k, v); } };
    const env: WriterEnv = { storage, locks: { request: async (_n, _o, cb) => cb() } };
    const stores = createThemeStores(defaultWorkspaceSettings);
    initializeThemeStores(stores, registry, storage);
    const draftTheme = { ...defaultTheme, density: 'compact' as const };
    stores.draft.getState().setTheme(draftTheme);
    const before = stores.draft.getState();
    await commitAppearance(stores, registry, env, 'dark');
    const after = stores.draft.getState();
    expect(after.theme).toEqual(before.theme);
    expect(after).toMatchObject({ dirty: true, baseThemeRevision: before.baseThemeRevision, conflict: false });
    expect(stores.applied.getState().settings.appearance).toBe('dark');
    expect(JSON.parse(memory.get(SETTINGS_STORAGE_KEY)!).themeRevision).toBe(0);

    await commitDraft(stores, registry, env);
    expect(stores.applied.getState().settings.appearance).toBe('dark');
    expect(JSON.parse(memory.get(SETTINGS_STORAGE_KEY)!)).toMatchObject({ themeRevision: 1, settings: { appearance: 'dark' } });
    resetDraft(stores);
    await commitAppearance(stores, registry, env, 'system');
    expect(stores.draft.getState().dirty).toBe(true);
  });
});
