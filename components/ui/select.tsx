'use client';
import type { Ref, SelectHTMLAttributes } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import type { FormControlSize } from './input';
import styles from './Select.module.css';
export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & { size?: FormControlSize; ref?: Ref<HTMLSelectElement> };
export function Select({ size, className = '', ref, ...props }: SelectProps) {
  const defaults = useComponentDefaults('select');
  return <select {...props} ref={ref} className={`${styles.root} ${className}`} data-size={size ?? defaults.size} />;
}
