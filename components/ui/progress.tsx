'use client';
import type { HTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Progress.module.css';
export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> & { label: string; value?: number | null; max?: number; ref?: Ref<HTMLDivElement> };
export function Progress({ label, value = null, max, className = '', ref, ...props }: ProgressProps) {
  const defaults = useComponentDefaults('progress');
  const determinate = value !== null && value !== undefined;
  const maximum = max ?? defaults.max;
  const clampedMax = Number.isFinite(maximum) && maximum > 0 ? maximum : 100;
  const clampedValue = determinate && Number.isFinite(value) ? Math.min(clampedMax, Math.max(0, value)) : undefined;
  return <div {...props} ref={ref} className={`${styles.root} ${className}`}>
    <div className={styles.label}><span>{label}</span>{clampedValue !== undefined && <span>{Math.round(clampedValue / clampedMax * 100)}%</span>}</div>
    <progress className={styles.track} aria-label={label} max={clampedMax} value={clampedValue} />
  </div>;
}
