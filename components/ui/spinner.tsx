'use client';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Spinner.module.css';
export function Spinner({ size }: { size?: 'small' | 'medium' | 'large' }) {
  const defaults = useComponentDefaults('spinner');
  return <span className={styles.root} data-size={size ?? defaults.size} aria-hidden="true" />;
}
