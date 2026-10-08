'use client';
import type { ButtonHTMLAttributes } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { Spinner } from './spinner';
import styles from './Button.module.css';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; size?: 'small' | 'medium' | 'large'; loading?: boolean;
};
export function Button({ variant, size, type = 'button', loading = false, disabled, children, className = '', ...props }: ButtonProps) {
  const defaults = useComponentDefaults('button');
  return <button {...props} type={type} className={`${styles.root} ${className}`} data-variant={variant ?? defaults.variant} data-size={size ?? defaults.size} disabled={disabled || loading} aria-busy={loading || undefined}>
    {loading && <Spinner size="small" />}{children}
  </button>;
}
