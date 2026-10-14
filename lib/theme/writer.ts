import type { PersistenceEnvelope, Theme } from '@/lib/contract/schema';
import { validateTheme, type ThemeSystem } from '@/lib/contract/theme-validation';
import { assignThemeIdentity, themeValues } from './identity';
import { parseStoredSettings, SETTINGS_STORAGE_KEY } from './persistence';
import { applyDraft, persistWorkspaceSettings, type StorageLike, type ThemeStores } from './stores';

export const SETTINGS_LOCK_NAME = 'seeyesyes:settings:v1:write';
export const CONFLICT_MESSAGE = 'The theme changed in another tab. Your draft is still here.';
export const SAVE_FAILED_MESSAGE = 'The save did not complete and nothing was written. Retry when you are ready.';

export type LockManagerLike = {
  request<T>(name: string, options: { mode: 'exclusive' }, callback: () => Promise<T> | T): Promise<T>;
};
export type WriterEnv = { storage: StorageLike | null; locks: LockManagerLike | null };

export function getBrowserEnv(): WriterEnv {
  let storage: Storage | null = null;
  try { storage = window.localStorage; } catch { /* Blocked storage leaves changes session-only. */ }
  const locks = typeof navigator !== 'undefined' && 'locks' in navigator ? navigator.locks as unknown as LockManagerLike : null;
  return { storage, locks };
}

type Latest = { status: 'ok'; envelope: PersistenceEnvelope } | { status: 'empty' | 'unreadable' };
function readLatest(storage: StorageLike, system: ThemeSystem): Latest {
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { status: 'empty' };
    return { status: 'ok', envelope: parseStoredSettings(raw, system).envelope };
  } catch { return { status: 'unreadable' }; }
}

export type CommitResult = {
  status: 'applied' | 'unchanged' | 'conflict' | 'failed' | 'busy';
  persisted: boolean;
  message: string;
};

function sharedWritesAllowed(stores: ThemeStores, env: WriterEnv): env is { storage: StorageLike; locks: LockManagerLike } {
  return stores.applied.getState().persistence === 'persistent' && Boolean(env.storage) && Boolean(env.locks);
}

/** Apply the draft. Persistent saves run inside the exclusive settings lock; there is never an unlocked shared write. */
export async function commitDraft(stores: ThemeStores, system: ThemeSystem, env: WriterEnv): Promise<CommitResult> {
  const draft = stores.draft.getState();
  if (draft.saving) return { status: 'busy', persisted: false, message: 'A save is already in progress.' };
  let theme: Theme;
  try { theme = assignThemeIdentity(validateTheme(draft.theme, system), system.themePresets); }
  catch (error) {
    const message = `The draft could not be applied: ${error instanceof Error ? error.message : 'it is not a valid theme.'} Your draft is unchanged.`;
    return { status: 'failed', persisted: false, message };
  }
  draft.setSaving(true);
  draft.setSaveError(null);
  try {
    if (!sharedWritesAllowed(stores, env)) {
      const result = applyDraft(stores, system, null);
      return { status: result.status, persisted: false, message: 'Draft applied for this session. It will reset on refresh.' };
    }
    const { storage } = env;
    return await env.locks.request(SETTINGS_LOCK_NAME, { mode: 'exclusive' }, (): CommitResult => {
      const latest = readLatest(storage, system);
      const stored = latest.status === 'ok' ? latest.envelope : null;
      const { applied, draft: current } = { applied: stores.applied.getState(), draft: stores.draft.getState() };
      if (stored && stored.themeRevision !== current.baseThemeRevision) {
        applied.setSettings(stored.settings, stored.themeRevision);
        current.setConflict(true);
        current.refreshDirty();
        return { status: 'conflict', persisted: false, message: CONFLICT_MESSAGE };
      }
      const baseSettings = stored ? stored.settings : applied.settings;
      const baseRevision = stored ? stored.themeRevision : applied.themeRevision;
      const changed = themeValues(theme) !== themeValues(baseSettings.theme);
      const revision = changed ? baseRevision + 1 : baseRevision;
      const settings = { ...baseSettings, theme };
      let persisted = true;
      try { persistWorkspaceSettings(settings, revision, system, storage); }
      catch { persisted = false; }
      applied.setSettings(settings, revision);
      applied.setNotice(persisted ? null : 'Changes were applied for this session but could not be saved. Refresh will reset them.');
      current.reset(theme, revision);
      return persisted
        ? { status: changed ? 'applied' : 'unchanged', persisted, message: changed ? 'Draft applied to the workspace and saved.' : 'The draft already matches the workspace theme.' }
        : { status: 'applied', persisted, message: 'Draft applied for this session, but it could not be saved.' };
    });
  } catch (error) {
    // A cancelled or failed lock request: nothing was written, and the pending action stays unsaved.
    void error;
    stores.draft.getState().setSaveError(SAVE_FAILED_MESSAGE);
    return { status: 'failed', persisted: false, message: SAVE_FAILED_MESSAGE };
  } finally {
    stores.draft.getState().setSaving(false);
  }
}

/** Change only the appearance preference, merging into the latest stored theme, revision, and cache. */
export async function commitAppearance(stores: ThemeStores, system: ThemeSystem, env: WriterEnv, appearance: 'light' | 'dark' | 'system'): Promise<CommitResult> {
  const applied = stores.applied.getState();
  if (applied.appearancePending) return { status: 'busy', persisted: false, message: 'A save is already in progress.' };
  if (!sharedWritesAllowed(stores, env)) {
    applied.setSettings({ ...applied.settings, appearance });
    return { status: 'applied', persisted: false, message: 'Appearance changed for this session.' };
  }
  const { storage } = env;
  applied.setAppearancePending(true);
  try {
    return await env.locks.request(SETTINGS_LOCK_NAME, { mode: 'exclusive' }, (): CommitResult => {
      const latest = readLatest(storage, system);
      const stored = latest.status === 'ok' ? latest.envelope : null;
      const state = stores.applied.getState();
      const base = stored ? stored.settings : state.settings;
      const revision = stored ? stored.themeRevision : state.themeRevision;
      const settings = { ...base, appearance };
      persistWorkspaceSettings(settings, revision, system, storage);
      state.setSettings(settings, revision);
      stores.draft.getState().refreshDirty();
      return { status: 'applied', persisted: true, message: 'Appearance saved.' };
    });
  } catch {
    stores.applied.getState().setNotice('The appearance change was not saved. Retry when you are ready.');
    return { status: 'failed', persisted: false, message: SAVE_FAILED_MESSAGE };
  } finally {
    stores.applied.getState().setAppearancePending(false);
  }
}

/** Treat a `storage` event as an invalidation signal: reread the stored envelope rather than trusting the event payload. */
export function syncFromStorage(stores: ThemeStores, system: ThemeSystem, storage: StorageLike | null): boolean {
  if (!storage || stores.applied.getState().persistence === 'session-only') return false;
  const latest = readLatest(storage, system);
  if (latest.status !== 'ok') return false;
  const { settings, themeRevision } = latest.envelope;
  stores.applied.getState().setSettings(settings, themeRevision);
  stores.draft.getState().refreshDirty();
  return true;
}
