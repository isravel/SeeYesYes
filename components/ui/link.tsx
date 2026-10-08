'use client';
import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Link.module.css';
export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { children: ReactNode; href: string; variant?: 'default' | 'subtle'; ref?: Ref<HTMLAnchorElement> };
export function Link({ variant, className = '', children, ref, ...props }: LinkProps) {
  const defaults = useComponentDefaults('link');
  return <a {...props} ref={ref} data-variant={variant ?? defaults.variant} className={`${styles.root} ${className}`}>{children}</a>;
}
