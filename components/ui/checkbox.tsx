'use client';
import { useEffect, useRef, type InputHTMLAttributes, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { assignRef } from '@/lib/utils/merge-refs';
import type { FormControlSize } from './input';
import styles from './Checkbox.module.css';
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & { size?: FormControlSize; tone?: 'primary' | 'neutral'; indeterminate?: boolean; ref?: Ref<HTMLInputElement> };
export function Checkbox({ size, tone, indeterminate = false, className = '', ref, ...props }: CheckboxProps) {
  const defaults = useComponentDefaults('checkbox');
  const node = useRef<HTMLInputElement | null>(null);
  // Indeterminate is a DOM property with no HTML attribute; browsers expose it as "mixed" without aria-checked. The checked value still drives the form.
  useEffect(() => { if (node.current) node.current.indeterminate = indeterminate; });
  return <input {...props} ref={element => { node.current = element; assignRef(ref, element); }} type="checkbox" className={`${styles.root} ${className}`} data-size={size ?? defaults.size} data-tone={tone ?? defaults.tone} />;
}
