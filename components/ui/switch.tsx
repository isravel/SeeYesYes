'use client';
import { useId, type InputHTMLAttributes, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import type { FormControlSize } from './input';
import styles from './Switch.module.css';
export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & { label: string; size?: FormControlSize; tone?: 'primary' | 'neutral'; ref?: Ref<HTMLInputElement> };
export function Switch({ label, size, tone, id, className = '', ref, ...props }: SwitchProps) {
  const defaults = useComponentDefaults('switch');
  const generatedId = useId();
  return <label className={`${styles.root} ${className}`} data-size={size ?? defaults.size} data-tone={tone ?? defaults.tone}>
    <input {...props} id={id ?? generatedId} ref={ref} type="checkbox" role="switch" className={styles.control} />
    <span>{label}</span>
  </label>;
}
