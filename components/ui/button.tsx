'use client';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { Spinner } from './spinner';
import styles from './Button.module.css';
export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; size?: 'small' | 'medium' | 'large'; loading?: boolean; ref?: Ref<HTMLButtonElement>;
};
export function Button({ variant, size, type = 'button', loading = false, disabled, children, className = '', ref, ...props }: ButtonProps) {
  const defaults = useComponentDefaults('button');
  return <button {...props} ref={ref} type={type} className={`${styles.root} ${className}`} data-variant={variant ?? defaults.variant} data-size={size ?? defaults.size} disabled={disabled || loading} aria-busy={loading || undefined}>
    {loading && <Spinner size="small" />}{children}
  </button>;
}
