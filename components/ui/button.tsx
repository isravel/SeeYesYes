'use client';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { Spinner } from './spinner';
import styles from './Button.module.css';
/** `solid` and `danger` are familiar names for `primary` and `destructive`; they render the same styles. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'soft' | 'muted' | 'solid' | 'danger';
export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode; variant?: ButtonVariant; size?: 'small' | 'medium' | 'large'; loading?: boolean; ref?: Ref<HTMLButtonElement>;
};
const canonical = (variant: ButtonVariant) => variant === 'solid' ? 'primary' : variant === 'danger' ? 'destructive' : variant;
export function Button({ variant, size, type = 'button', loading = false, disabled, children, className = '', ref, ...props }: ButtonProps) {
  const defaults = useComponentDefaults('button');
  return <button {...props} ref={ref} type={type} className={`${styles.root} ${className}`} data-variant={canonical(variant ?? defaults.variant)} data-size={size ?? defaults.size} disabled={disabled || loading} aria-busy={loading || undefined}>
    {loading && <Spinner size="small" />}{children}
  </button>;
}
