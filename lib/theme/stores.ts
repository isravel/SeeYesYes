import { createStore, type StoreApi } from 'zustand/vanilla';
import { WorkspaceSettingsSchema, type DesignSystem, type PersistenceEnvelope, type Theme, type WorkspaceSettings } from '@/lib/contract/schema';
import { defaultTheme } from '@/lib/data/registry';
import { createPersistenceEnvelope, parseStoredSettings, SETTINGS_STORAGE_KEY } from './persistence';
import { validateTheme } from '@/lib/contract/validate';
import { assignThemeIdentity, themeValues } from './identity';

export type AppliedThemeState = {
  settings: WorkspaceSettings;
  themeRevision: number;
  initialized: boolean;
  persistence: 'persistent' | 'session-only';
  notice: string | null;
  setSettings: (settings: WorkspaceSettings, themeRevision?: number) => void;
  setNotice: (notice: string | null) => void;
  finishInitialization: (persistence: AppliedThemeState['persistence'], notice?: string | null) => void;
};
export type DraftThemeState = {
  theme: Theme;
  baseThemeRevision: number;
  dirty: boolean;
  setTheme: (theme: Theme) => void;
  reset: (theme: Theme, revision: number) => void;
};
export type DefaultThemeState = { settings: WorkspaceSettings };
export type ThemeStores = { defaults: StoreApi<DefaultThemeState>; applied: StoreApi<AppliedThemeState>; draft: StoreApi<DraftThemeState> };
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const defaultWorkspaceSettings: WorkspaceSettings = {
  settingsVersion: 1, theme: defaultTheme, appearance: 'system',
};

export function createThemeStores(defaultSettings = defaultWorkspaceSettings): ThemeStores {
  const defaults = createStore<DefaultThemeState>()(() => ({ settings: WorkspaceSettingsSchema.parse(defaultSettings) }));
  const applied = createStore<AppliedThemeState>()(set => ({
    settings: defaultSettings, themeRevision: 0, initialized: false,
    persistence: 'persistent', notice: null,
    setSettings: (settings, themeRevision) => set(state => ({ settings, themeRevision: themeRevision ?? state.themeRevision })),
    setNotice: notice => set({ notice }),
    finishInitialization: (persistence, notice = null) => set({ initialized: true, persistence, notice }),
  }));
  const draft = createStore<DraftThemeState>()(set => ({
    theme: defaultSettings.theme, baseThemeRevision: 0, dirty: false,
    setTheme: theme => set(state => ({ theme, dirty: themeValues(theme) !== themeValues(applied.getState().settings.theme), baseThemeRevision: state.baseThemeRevision })),
    reset: (theme, revision) => set({ theme, baseThemeRevision: revision, dirty: false }),
  }));
  return { defaults, applied, draft };
}

export function initializeThemeStores(stores: ThemeStores, system: DesignSystem, storage: StorageLike | null): void {
  const defaultThemeValue = system.themePresets.find(theme => theme.id === system.defaultThemeId) ?? defaultTheme;
  const defaultSettings = WorkspaceSettingsSchema.parse({ ...defaultWorkspaceSettings, theme: defaultThemeValue });
  if (!storage) {
    stores.applied.getState().setSettings(defaultSettings, 0);
    stores.draft.getState().reset(defaultSettings.theme, 0);
    stores.applied.getState().finishInitialization('session-only', 'Changes stay in this tab and reset on refresh because browser storage is unavailable.');
    return;
  }
  let raw: string | null;
  try { raw = storage.getItem(SETTINGS_STORAGE_KEY); }
  catch {
    stores.applied.getState().setSettings(defaultSettings, 0);
    stores.draft.getState().reset(defaultSettings.theme, 0);
    stores.applied.getState().finishInitialization('session-only', 'Changes stay in this tab and reset on refresh because browser storage is blocked.');
    return;
  }
  if (!raw) {
    stores.applied.getState().setSettings(defaultSettings, 0);
    stores.draft.getState().reset(defaultSettings.theme, 0);
    stores.applied.getState().finishInitialization('persistent');
    return;
  }
  try {
    const { envelope, notice } = parseStoredSettings(raw, system);
    stores.applied.getState().setSettings(envelope.settings, envelope.themeRevision);
    stores.draft.getState().reset(envelope.settings.theme, envelope.themeRevision);
    stores.applied.getState().finishInitialization('persistent', notice ?? null);
  } catch {
    stores.applied.getState().setSettings(defaultSettings, 0);
    stores.draft.getState().reset(defaultSettings.theme, 0);
    stores.applied.getState().finishInitialization('persistent', 'Saved settings could not be read. Defaults are active; you can continue editing.');
  }
}

export function persistWorkspaceSettings(settingsInput: WorkspaceSettings, themeRevision: number, system: DesignSystem, storage: StorageLike): PersistenceEnvelope {
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
export function applyDraft(stores: ThemeStores, system: DesignSystem, storage: StorageLike | null): ApplyResult {
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
