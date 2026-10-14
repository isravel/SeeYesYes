'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { SETTINGS_STORAGE_KEY } from '@/lib/theme/persistence';
import { createThemeStores, initializeThemeStores, type ThemeStores } from '@/lib/theme/stores';
import { getBrowserEnv, syncFromStorage } from '@/lib/theme/writer';
import type { ThemeSystem } from '@/lib/contract/theme-validation';
import { ThemeScope } from './ThemeScope';

const ThemeStoresContext = createContext<ThemeStores | null>(null);
const ThemeSystemContext = createContext<ThemeSystem | null>(null);
export function useThemeSystem() {
  const system = useContext(ThemeSystemContext);
  if (!system) throw new Error('The theme system is unavailable outside ThemeLifecycleProvider.');
  return system;
}
export function useThemeStores() {
  const stores = useContext(ThemeStoresContext);
  if (!stores) throw new Error('Theme stores are unavailable outside ThemeLifecycleProvider.');
  return stores;
}

export function ThemeLifecycleProvider({ system, children }: { system: ThemeSystem; children: ReactNode }) {
  const [stores] = useState(() => {
    const theme = system.themePresets.find(preset => preset.id === system.defaultThemeId);
    if (!theme) throw new Error(`Default theme ${system.defaultThemeId} is missing.`);
    return createThemeStores({ settingsVersion: 1, theme, appearance: 'system' });
  });
  const settings = useStore(stores.applied, state => state.settings);
  const initialized = useStore(stores.applied, state => state.initialized);
  useEffect(() => {
    const { storage, locks } = getBrowserEnv();
    initializeThemeStores(stores, system, storage, Boolean(locks));
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === SETTINGS_STORAGE_KEY) syncFromStorage(stores, system, getBrowserEnv().storage);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [stores, system]);
  return <ThemeStoresContext.Provider value={stores}><ThemeSystemContext.Provider value={system}><ThemeScope system={system} theme={settings.theme} appearance={settings.appearance} workspace ready={initialized}>{children}</ThemeScope></ThemeSystemContext.Provider></ThemeStoresContext.Provider>;
}
