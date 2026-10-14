'use client';
import { useState } from 'react';
import { useStore } from 'zustand';
import { Select } from '@/components/ui/select';
import { commitAppearance, getBrowserEnv } from '@/lib/theme/writer';
import { registry } from '@/lib/data/registry';
import { useThemeStores } from './ThemeLifecycleProvider';
import styles from './AppearanceSelector.module.css';

/** Changes only the workspace appearance preference; it never touches the Theme draft. */
export function AppearanceSelector() {
  const stores = useThemeStores();
  const appearance = useStore(stores.applied, state => state.settings.appearance);
  const pending = useStore(stores.applied, state => state.appearancePending);
  const initialized = useStore(stores.applied, state => state.initialized);
  const persistence = useStore(stores.applied, state => state.persistence);
  const [message, setMessage] = useState('');
  async function change(next: 'light' | 'dark' | 'system') {
    const result = await commitAppearance(stores, registry, getBrowserEnv(), next);
    if (result.status === 'failed') setMessage(result.message);
    else if (result.status === 'applied') setMessage(persistence === 'session-only' ? 'Appearance changed for this session.' : 'Appearance saved.');
  }
  return <label className={styles.root}>
    <span>Appearance</span>
    <Select aria-label="Workspace appearance" value={appearance} disabled={!initialized || pending} onChange={event => { void change(event.currentTarget.value as 'light' | 'dark' | 'system'); }}>
      <option value="system">Follow system</option><option value="light">Light</option><option value="dark">Dark</option>
    </Select>
    <span className={styles.status} aria-live="polite">{pending ? 'Saving…' : message}</span>
  </label>;
}
