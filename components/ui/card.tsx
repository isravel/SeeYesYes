'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Card.module.css';
export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { variant?: 'default' | 'outlined'; children: ReactNode; ref?: Ref<HTMLDivElement> };
export function Card({ variant, className = '', children, ref, ...props }: CardProps) {
  const defaults = useComponentDefaults('card');
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-variant={variant ?? defaults.variant}>{children}</div>;
}
