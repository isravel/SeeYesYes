'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { DesignSystem } from '@/lib/contract/schema';
import { createThemeStores, initializeThemeStores } from '@/lib/theme/stores';
import { ThemeScope } from './ThemeScope';

export function ThemeLifecycleProvider({ system, children }: { system: DesignSystem; children: ReactNode }) {
  const [stores] = useState(() => {
    const theme = system.themePresets.find(preset => preset.id === system.defaultThemeId);
    if (!theme) throw new Error(`Default theme ${system.defaultThemeId} is missing.`);
    return createThemeStores({ settingsVersion: 1, theme, appearance: 'system' });
  });
  const settings = useStore(stores.applied, state => state.settings);
  const initialized = useStore(stores.applied, state => state.initialized);
  useEffect(() => {
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* Storage access can be blocked by browser policy. */ }
    initializeThemeStores(stores, system, storage);
  }, [stores, system]);
  return <ThemeScope system={system} theme={settings.theme} appearance={settings.appearance} workspace ready={initialized}>{children}</ThemeScope>;
}
