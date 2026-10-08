'use client';
import type { AnchorHTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Link.module.css';
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: 'default' | 'subtle'; ref?: Ref<HTMLAnchorElement> };
export function Link({ variant, className = '', children, ref, ...props }: LinkProps) {
  const defaults = useComponentDefaults('link');
  return <a {...props} ref={ref} data-variant={variant ?? defaults.variant} className={`${styles.root} ${className}`}>{children}</a>;
}
