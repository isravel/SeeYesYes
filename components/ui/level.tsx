import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Level.module.css';
export type LevelTone = 'neutral' | 'success' | 'warning' | 'destructive' | 'info';
export type LevelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { tone?: LevelTone; children: ReactNode; ref?: Ref<HTMLSpanElement> };
/** A label with a leading dot, such as a difficulty. The caller supplies the words; the dot is decoration and never carries the meaning. */
export function Level({ tone = 'neutral', className = '', children, ref, ...props }: LevelProps) {
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-tone={tone}>
    <span className={styles.dot} aria-hidden="true" />{children}
  </span>;
}
