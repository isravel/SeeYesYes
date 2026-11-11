'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './ShinyText.module.css';
export type ShinyTextProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { animated?: boolean; children: ReactNode; ref?: Ref<HTMLSpanElement> };
/**
 * Text with an optional highlight that sweeps across it. The words are ordinary text in the inherited color; the sweep only tints them with the primary color as it passes.
 * It is off by default, is removed by reduced motion and forced colors, and is meant for one passage on a page, not for body copy.
 */
export function ShinyText({ animated = false, className = '', children, ref, ...props }: ShinyTextProps) {
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-animated={animated ? true : undefined}>{children}</span>;
}
