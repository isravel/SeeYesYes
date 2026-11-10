'use client';
import { Select } from '@/components/ui/select';
import { useAppearance } from './useAppearance';
import styles from './AppearanceSelector.module.css';

/** Changes only the workspace appearance preference; it never touches the Theme draft. */
export function AppearanceSelector() {
  const { appearance, pending, initialized, message, change } = useAppearance();
  return <label className={styles.root}>
    <span>Appearance</span>
    <Select aria-label="Workspace appearance" value={appearance} disabled={!initialized || pending} onChange={event => { void change(event.currentTarget.value as 'light' | 'dark' | 'system'); }}>
      <option value="system">Follow system</option><option value="light">Light</option><option value="dark">Dark</option>
    </Select>
    <span className={styles.status} aria-live="polite">{pending ? 'Saving…' : message}</span>
  </label>;
}
