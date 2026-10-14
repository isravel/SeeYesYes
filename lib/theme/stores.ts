import { createStore, type StoreApi } from 'zustand/vanilla';
import { WorkspaceSettingsSchema, type PersistenceEnvelope, type Theme, type WorkspaceSettings } from '@/lib/contract/schema';
import { createPersistenceEnvelope, parseStoredSettings, SETTINGS_STORAGE_KEY } from './persistence';
import { validateTheme, type ThemeSystem } from '@/lib/contract/theme-validation';
import { assignThemeIdentity, themeValues } from './identity';
import type { PlaygroundAppearance, PlaygroundOverrides } from './playground';

export type AppliedThemeState = {
  settings: WorkspaceSettings;
  themeRevision: number;
  initialized: boolean;
  persistence: 'persistent' | 'session-only';
  notice: string | null;
  appearancePending: boolean;
  setAppearancePending: (pending: boolean) => void;
  setSettings: (settings: WorkspaceSettings, themeRevision?: number) => void;
  setNotice: (notice: string | null) => void;
  finishInitialization: (persistence: AppliedThemeState['persistence'], notice?: string | null) => void;
};
export type DraftThemeState = {
  theme: Theme;
  baseThemeRevision: number;
  dirty: boolean;
  saving: boolean;
  conflict: boolean;
  saveError: string | null;
  setTheme: (theme: Theme) => void;
  reset: (theme: Theme, revision: number) => void;
  refreshDirty: () => void;
  setSaving: (saving: boolean) => void;
  setConflict: (conflict: boolean) => void;
  setSaveError: (saveError: string | null) => void;
};
export type PlaygroundState = {
  overrides: PlaygroundOverrides;
  appearance: PlaygroundAppearance;
  setOverride: <K extends keyof PlaygroundOverrides>(key: K, value: PlaygroundOverrides[K] | undefined) => void;
  setAppearance: (appearance: PlaygroundAppearance) => void;
  reset: () => void;
};
export type DefaultThemeState = { settings: WorkspaceSettings };
export type ThemeStores = { defaults: StoreApi<DefaultThemeState>; applied: StoreApi<AppliedThemeState>; draft: StoreApi<DraftThemeState>; playground: StoreApi<PlaygroundState> };
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function createThemeStores(defaultSettings: WorkspaceSettings): ThemeStores {
  const defaults = createStore<DefaultThemeState>()(() => ({ settings: WorkspaceSettingsSchema.parse(defaultSettings) }));
  const applied = createStore<AppliedThemeState>()(set => ({
    settings: defaultSettings, themeRevision: 0, initialized: false,
    persistence: 'persistent', notice: null, appearancePending: false,
    setAppearancePending: appearancePending => set({ appearancePending }),
    setSettings: (settings, themeRevision) => set(state => ({ settings, themeRevision: themeRevision ?? state.themeRevision })),
    setNotice: notice => set({ notice }),
    finishInitialization: (persistence, notice = null) => set({ initialized: true, persistence, notice }),
  }));
  const draft = createStore<DraftThemeState>()(set => ({
    theme: defaultSettings.theme, baseThemeRevision: 0, dirty: false, saving: false, conflict: false, saveError: null,
    setTheme: theme => set(state => ({ theme, dirty: themeValues(theme) !== themeValues(applied.getState().settings.theme), baseThemeRevision: state.baseThemeRevision })),
    reset: (theme, revision) => set({ theme, baseThemeRevision: revision, dirty: false, conflict: false, saveError: null }),
    refreshDirty: () => set(state => ({ dirty: themeValues(state.theme) !== themeValues(applied.getState().settings.theme) })),
    setSaving: saving => set({ saving }),
    setConflict: conflict => set({ conflict }),
    setSaveError: saveError => set({ saveError }),
  }));
  const playground = createStore<PlaygroundState>()(set => ({
    overrides: {}, appearance: null,
    setOverride: (key, value) => set(state => {
      const overrides = { ...state.overrides };
      if (value === undefined) delete overrides[key]; else overrides[key] = value;
      return { overrides };
    }),
    setAppearance: appearance => set({ appearance }),
    reset: () => set({ overrides: {}, appearance: null }),
  }));
  return { defaults, applied, draft, playground };
}

const NO_LOCKS_NOTICE = 'Changes stay in this tab and reset on refresh because this browser cannot coordinate saves between tabs.';

export function initializeThemeStores(stores: ThemeStores, system: ThemeSystem, storage: StorageLike | null, locksAvailable = true): void {
  const defaultThemeValue = system.themePresets.find(theme => theme.id === system.defaultThemeId);
  if (!defaultThemeValue) throw new Error(`Default theme ${system.defaultThemeId} is missing.`);
  const defaultSettings = WorkspaceSettingsSchema.parse({ settingsVersion: 1, theme: defaultThemeValue, appearance: 'system' });
  const loadDefaults = () => {
    stores.applied.getState().setSettings(defaultSettings, 0);
    stores.draft.getState().reset(defaultSettings.theme, 0);
  };
  if (!storage) {
    loadDefaults();
    stores.applied.getState().finishInitialization('session-only', 'Changes stay in this tab and reset on refresh because browser storage is unavailable.');
    return;
  }
  // Without Web Locks, saved settings are still read, but nothing is ever written to shared storage.
  const finish = (notice: string | null) => locksAvailable
    ? stores.applied.getState().finishInitialization('persistent', notice)
    : stores.applied.getState().finishInitialization('session-only', notice ?? NO_LOCKS_NOTICE);
  let raw: string | null;
  try { raw = storage.getItem(SETTINGS_STORAGE_KEY); }
  catch {
    loadDefaults();
    stores.applied.getState().finishInitialization('session-only', 'Changes stay in this tab and reset on refresh because browser storage is blocked.');
    return;
  }
  if (!raw) { loadDefaults(); finish(null); return; }
  try {
    const { envelope, notice } = parseStoredSettings(raw, system);
    stores.applied.getState().setSettings(envelope.settings, envelope.themeRevision);
    stores.draft.getState().reset(envelope.settings.theme, envelope.themeRevision);
    finish(notice ?? null);
  } catch (error) {
    loadDefaults();
    finish(describeUnreadableSettings(raw, error));
  }
}

function describeUnreadableSettings(raw: string, error: unknown): string {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'envelopeVersion' in parsed && (parsed as { envelopeVersion: unknown }).envelopeVersion !== 1) {
      return 'Saved settings use a format this version does not support. Defaults are active; applying a draft will replace them.';
    }
  } catch { /* Not JSON: treated as corrupt below. */ }
  void error;
  return 'Saved settings could not be read. Defaults are active; you can continue editing.';
}

export function persistWorkspaceSettings(settingsInput: WorkspaceSettings, themeRevision: number, system: ThemeSystem, storage: StorageLike): PersistenceEnvelope {
  const settings = WorkspaceSettingsSchema.parse({ ...settingsInput, theme: validateTheme(settingsInput.theme, system) });
  const envelope = createPersistenceEnvelope(settings, themeRevision, system);
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(envelope));
  return envelope;
}

export function markStorageBlocked(stores: ThemeStores): void {
  stores.applied.getState().finishInitialization('session-only', 'Changes stay in this tab and reset on refresh because browser storage is blocked.');
}

export type ApplyResult = { status: 'applied' | 'unchanged'; persisted: boolean; notice: string | null };

/** Replaces the applied theme with the validated draft. Appearance is always preserved. */
export function applyDraft(stores: ThemeStores, system: ThemeSystem, storage: StorageLike | null): ApplyResult {
  const { settings, themeRevision, persistence } = stores.applied.getState();
  const theme = assignThemeIdentity(validateTheme(stores.draft.getState().theme, system), system.themePresets);
  const changed = themeValues(theme) !== themeValues(settings.theme);
  const nextRevision = changed ? themeRevision + 1 : themeRevision;
  const nextSettings: WorkspaceSettings = { ...settings, theme };
  let persisted = false;
  let notice: string | null = persistence === 'session-only' ? 'Changes stay in this tab and reset on refresh.' : null;
  if (persistence === 'persistent' && storage) {
    try { persistWorkspaceSettings(nextSettings, nextRevision, system, storage); persisted = true; }
    catch { notice = 'Changes were applied for this session but could not be saved. Refresh will reset them.'; }
  }
  stores.applied.getState().setSettings(nextSettings, nextRevision);
  stores.applied.getState().setNotice(notice);
  stores.draft.getState().reset(theme, nextRevision);
  return { status: changed ? 'applied' : 'unchanged', persisted, notice };
}

/** Restores the draft from the applied theme. */
export function discardDraft(stores: ThemeStores): void {
  const { settings, themeRevision } = stores.applied.getState();
  stores.draft.getState().reset(settings.theme, themeRevision);
}

/** Loads the default preset into the draft only; the workspace changes on Apply. */
export function resetDraft(stores: ThemeStores): void {
  const { theme } = stores.defaults.getState().settings;
  stores.draft.getState().setTheme(theme);
}
