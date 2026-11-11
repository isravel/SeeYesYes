'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Badge, type BadgeTone } from './badge';
import styles from './AnimatedBadge.module.css';
export type AnimatedBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { tone?: BadgeTone; icon?: ReactNode; animated?: boolean; children: ReactNode; ref?: Ref<HTMLSpanElement> };
/**
 * A Badge with an optional glint that travels around its border. It is Badge underneath, so the fill, text and tone are unchanged and the text keeps its contrast.
 * The glint is decoration only: it is off by default, is removed by reduced motion and forced colors, and leaves a plain Badge behind.
 */
export function AnimatedBadge({ animated = false, className = '', children, ...props }: AnimatedBadgeProps) {
  return <Badge {...props} className={`${styles.root} ${className}`} data-animated={animated ? true : undefined}>{children}</Badge>;
}
