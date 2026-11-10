'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Badge.module.css';
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'destructive';
export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { tone?: BadgeTone; icon?: ReactNode; children: ReactNode; ref?: Ref<HTMLSpanElement> };
export function Badge({ tone, icon, className = '', children, ref, ...props }: BadgeProps) {
  const defaults = useComponentDefaults('badge');
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-tone={tone ?? defaults.tone}>
    {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}{children}
  </span>;
}
