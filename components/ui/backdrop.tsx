'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { cn } from '@/lib/utils/cn';
import styles from './Backdrop.module.css';

export type BackdropVariant = 'tint' | 'faded';
export type BackdropProps = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'tabIndex'> & { variant?: BackdropVariant; children?: ReactNode; ref?: Ref<HTMLDivElement> };

/**
 * A container with a decorative layered background that gives translucent surfaces something to sample.
 * The container creates its own stacking context, so the layers always sit behind the children; the children stay normal,
 * fully accessible content. The layers are hidden from assistive technology, ignore pointer input, and are static.
 */
export function Backdrop({ variant, className, children, ref, ...props }: BackdropProps) {
  const defaults = useComponentDefaults('backdrop');
  return <div {...props} ref={ref} className={cn(styles.root, className)}>
    <div className={styles.layers} aria-hidden="true" data-variant={variant ?? defaults.variant} />
    {children}
  </div>;
}
