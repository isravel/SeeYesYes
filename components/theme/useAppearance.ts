'use client';
import { useState } from 'react';
import { useStore } from 'zustand';
import type { Appearance } from '@/lib/contract/schema';
import { commitAppearance, getBrowserEnv } from '@/lib/theme/writer';
import { useThemeStores, useThemeSystem } from './ThemeLifecycleProvider';

/** The workspace appearance preference and the one way to change it. Every appearance control shares this, so they cannot disagree. */
export function useAppearance() {
  const stores = useThemeStores();
  const system = useThemeSystem();
  const appearance = useStore(stores.applied, state => state.settings.appearance);
  const pending = useStore(stores.applied, state => state.appearancePending);
  const initialized = useStore(stores.applied, state => state.initialized);
  const persistence = useStore(stores.applied, state => state.persistence);
  const [message, setMessage] = useState('');
  async function change(next: Appearance) {
    const result = await commitAppearance(stores, system, getBrowserEnv(), next);
    if (result.status === 'failed') setMessage(result.message);
    else if (result.status === 'applied') setMessage(persistence === 'session-only' ? 'Appearance changed for this session.' : 'Appearance saved.');
  }
  return { appearance, pending, initialized, message, change };
}
