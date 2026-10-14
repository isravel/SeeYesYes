import { defaultWorkspaceSettings } from '@/lib/theme/default-settings';
import { describe, expect, it } from 'vitest';
import { defaultTheme } from '@/lib/data/registry';
import { createThemeStores } from '@/lib/theme/stores';
import { hasOverrides, playgroundTheme } from '@/lib/theme/playground';

describe('playground theme', () => {
  it('is exactly the applied theme without overrides', () => {
    expect(playgroundTheme(defaultTheme, {})).toEqual(defaultTheme);
    expect(hasOverrides({}, null)).toBe(false);
  });

  it('layers overrides over the applied theme without mutating it', () => {
    const frozen = structuredClone(defaultTheme);
    const result = playgroundTheme(defaultTheme, { radius: 'curvy', density: 'compact', surface: 'subtle-depth', scale: 'large', motion: 'none', shadows: 'defined' });
    expect(result).toMatchObject({ radius: 'curvy', density: 'compact', motion: 'none', shadows: 'defined', effects: { surface: 'subtle-depth' }, typography: { scale: 'large' } });
    expect(result.colors).toBe(defaultTheme.colors);
    expect(result.typography.sansFontId).toBe(defaultTheme.typography.sansFontId);
    expect(defaultTheme).toEqual(frozen);
  });

  it('follows the applied theme for anything not overridden', () => {
    const applied = { ...defaultTheme, radius: 'sharp' as const, density: 'spacious' as const };
    const result = playgroundTheme(applied, { density: 'compact' });
    expect(result).toMatchObject({ radius: 'sharp', density: 'compact' });
  });
});

describe('playground store', () => {
  it('keeps overrides and appearance apart from the applied and draft stores, and resets cleanly', () => {
    const stores = createThemeStores(defaultWorkspaceSettings);
    const appliedBefore = stores.applied.getState().settings;
    const draftBefore = stores.draft.getState();
    stores.playground.getState().setOverride('radius', 'curvy');
    stores.playground.getState().setAppearance('dark');
    expect(stores.playground.getState()).toMatchObject({ overrides: { radius: 'curvy' }, appearance: 'dark' });
    expect(stores.applied.getState().settings).toBe(appliedBefore);
    expect(stores.draft.getState().theme).toBe(draftBefore.theme);
    expect(stores.draft.getState().dirty).toBe(false);
    stores.playground.getState().setOverride('radius', undefined);
    expect(stores.playground.getState().overrides).toEqual({});
    stores.playground.getState().setOverride('density', 'compact');
    stores.playground.getState().reset();
    expect(stores.playground.getState()).toMatchObject({ overrides: {}, appearance: null });
  });
});
