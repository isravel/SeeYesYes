'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './LiveDot.module.css';
export type LiveDotStatus = 'live' | 'inactive';
export type LiveDotSize = 'small' | 'medium';
export type LiveDotProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { status?: LiveDotStatus; size?: LiveDotSize; animated?: boolean; children: ReactNode; ref?: Ref<HTMLSpanElement> };
/**
 * A status dot with its text. The text states the status; a filled dot means live and a hollow ring means inactive, so neither color nor motion carries the meaning.
 * The ping only runs for a live status and is removed by reduced motion.
 */
export function LiveDot({ status = 'live', size, animated = false, className = '', children, ref, ...props }: LiveDotProps) {
  const defaults = useComponentDefaults('live-dot');
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-status={status} data-size={size ?? defaults.size} data-animated={animated && status === 'live' ? true : undefined}>
    <span className={styles.dot} aria-hidden="true" />{children}
  </span>;
}
