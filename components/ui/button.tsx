import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './spinner';
import styles from './Button.module.css';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'; size?: 'small' | 'medium' | 'large'; loading?: boolean;
};
export function Button({ variant = 'primary', size = 'medium', type = 'button', loading = false, disabled, children, className = '', ...props }: ButtonProps) {
  return <button {...props} type={type} className={`${styles.root} ${className}`} data-variant={variant} data-size={size} disabled={disabled || loading} aria-busy={loading || undefined}>
    {loading && <Spinner size="small" />}{children}
  </button>;
}
