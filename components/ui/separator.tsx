'use client';
import type { HTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Separator.module.css';
type SeparatorNativeProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick' | 'role' | 'tabIndex'>;
export type SeparatorProps = SeparatorNativeProps & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean; ref?: Ref<HTMLElement> };
export function Separator({ orientation, decorative, className = '', ref, ...props }: SeparatorProps) {
  const defaults = useComponentDefaults('separator');
  const direction = orientation ?? defaults.orientation;
  const isDecorative = decorative ?? defaults.decorative;
  const classes = `${styles.root} ${className}`;
  const semantics = { role: isDecorative ? undefined : 'separator' as const, 'aria-orientation': isDecorative ? undefined : direction, 'aria-hidden': isDecorative ? true : undefined };
  return direction === 'horizontal'
    ? <hr {...props} {...semantics} ref={ref as Ref<HTMLHRElement>} className={classes} data-orientation={direction} />
    : <span {...props} {...semantics} ref={ref as Ref<HTMLSpanElement>} className={classes} data-orientation={direction} />;
}
