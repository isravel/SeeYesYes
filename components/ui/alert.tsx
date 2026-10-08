'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { CheckCircle, Info, Warning, WarningCircle } from '@phosphor-icons/react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Alert.module.css';
export type AlertTone = 'info' | 'success' | 'warning' | 'destructive';
export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role' | 'onClick' | 'tabIndex' | 'children'> & { tone?: AlertTone; title?: string; children: ReactNode; ref?: Ref<HTMLDivElement> };
const icons = { info: Info, success: CheckCircle, warning: Warning, destructive: WarningCircle };
export function Alert({ tone, title, className = '', children, ref, ...props }: AlertProps) {
  const defaults = useComponentDefaults('alert');
  const kind = tone ?? defaults.tone;
  const Icon = icons[kind];
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-tone={kind} role={kind === 'warning' || kind === 'destructive' ? 'alert' : 'status'}>
    <Icon className={styles.icon} aria-hidden="true" weight="regular" />
    <div className={styles.content}>{title && <p className={styles.title}>{title}</p>}<div>{children}</div></div>
  </div>;
}
