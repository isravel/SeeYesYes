'use client';
import NextLink from 'next/link';
import { isPageRoute } from '@/lib/routes';
import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Link.module.css';
import buttonStyles from './Button.module.css';
export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { children: ReactNode; href: string; variant?: 'default' | 'subtle' | 'button-primary' | 'button-secondary'; ref?: Ref<HTMLAnchorElement> };
export function Link({ variant, className = '', children, ref, ...props }: LinkProps) {
  const defaults = useComponentDefaults('link');
  const resolvedVariant = variant ?? defaults.variant;
  const buttonVariant = resolvedVariant === 'button-primary' ? 'primary' : resolvedVariant === 'button-secondary' ? 'secondary' : null;
  const common = { 'data-variant': buttonVariant ?? resolvedVariant, 'data-size': buttonVariant ? 'medium' : undefined, className: `${buttonVariant ? buttonStyles.root : styles.root} ${className}` };
  // Page routes navigate client-side so session state such as an open theme draft survives; API routes stay plain anchors.
  if (isPageRoute(props.href)) return <NextLink {...props} ref={ref} {...common}>{children}</NextLink>;
  return <a {...props} ref={ref} {...common}>{children}</a>;
}
