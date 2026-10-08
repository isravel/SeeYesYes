'use client';
import { Button as AriaButton } from 'react-aria-components';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Button.module.css';

// React Aria's trigger context supplies event handlers, ARIA relationships, and refs.
// This private adapter shares Button's styles and defaults without exposing Aria props.
export function InternalTriggerButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress?: () => void }) {
  const defaults = useComponentDefaults('button');
  return <AriaButton type="button" className={styles.root} data-variant={defaults.variant} data-size={defaults.size} isDisabled={disabled} onPress={onPress}>{label}</AriaButton>;
}
