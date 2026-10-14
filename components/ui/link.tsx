'use client';
import NextLink from 'next/link';
import { isPageRoute } from '@/lib/routes';
import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Link.module.css';
export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { children: ReactNode; href: string; variant?: 'default' | 'subtle'; ref?: Ref<HTMLAnchorElement> };
export function Link({ variant, className = '', children, ref, ...props }: LinkProps) {
  const defaults = useComponentDefaults('link');
  const common = { 'data-variant': variant ?? defaults.variant, className: `${styles.root} ${className}` };
  // Page routes navigate client-side so session state such as an open theme draft survives; API routes stay plain anchors.
  if (isPageRoute(props.href)) return <NextLink {...props} ref={ref} {...common}>{children}</NextLink>;
  return <a {...props} ref={ref} {...common}>{children}</a>;
}
