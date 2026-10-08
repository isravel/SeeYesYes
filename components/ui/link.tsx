import type { AnchorHTMLAttributes } from 'react';
import styles from './Link.module.css';
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: 'default' | 'subtle' };
export function Link({ variant = 'default', className = '', children, ...props }: LinkProps) {
  return <a {...props} data-variant={variant} className={`${styles.root} ${className}`}>{children}</a>;
}
