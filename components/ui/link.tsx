'use client';
import type { AnchorHTMLAttributes } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Link.module.css';
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: 'default' | 'subtle' };
export function Link({ variant, className = '', children, ...props }: LinkProps) {
  const defaults = useComponentDefaults('link');
  return <a {...props} data-variant={variant ?? defaults.variant} className={`${styles.root} ${className}`}>{children}</a>;
}
