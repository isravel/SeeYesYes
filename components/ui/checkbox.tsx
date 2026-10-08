'use client';
import type { InputHTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import type { FormControlSize } from './input';
import styles from './Checkbox.module.css';
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & { size?: FormControlSize; ref?: Ref<HTMLInputElement> };
export function Checkbox({ size, className = '', ref, ...props }: CheckboxProps) {
  const defaults = useComponentDefaults('checkbox');
  return <input {...props} ref={ref} type="checkbox" className={`${styles.root} ${className}`} data-size={size ?? defaults.size} />;
}
