'use client';
import type { Ref, TextareaHTMLAttributes } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import type { FormControlSize } from './input';
import styles from './Textarea.module.css';
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { size?: FormControlSize; ref?: Ref<HTMLTextAreaElement> };
export function Textarea({ size, className = '', ref, ...props }: TextareaProps) {
  const defaults = useComponentDefaults('textarea');
  return <textarea {...props} ref={ref} className={`${styles.root} ${className}`} data-size={size ?? defaults.size} />;
}
