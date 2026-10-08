'use client';
import type { InputHTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Input.module.css';
export type FormControlSize = 'small' | 'medium' | 'large';
export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & { size?: FormControlSize; ref?: Ref<HTMLInputElement> };
export function Input({ size, type, className = '', ref, ...props }: InputProps) {
  const defaults = useComponentDefaults('input');
  return <input {...props} type={type ?? defaults.type} ref={ref} className={`${styles.root} ${className}`} data-size={size ?? defaults.size} />;
}
