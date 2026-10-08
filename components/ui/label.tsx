'use client';
import type { LabelHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Label.module.css';
export type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, 'children'> & { children: ReactNode; required?: boolean; ref?: Ref<HTMLLabelElement> };
export function Label({ children, required = false, className = '', ref, ...props }: LabelProps) {
  return <label {...props} ref={ref} className={`${styles.root} ${className}`}>{children}{required && <span className={styles.required} aria-hidden="true">*</span>}</label>;
}
