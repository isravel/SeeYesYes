'use client';
import { useContext, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { useComponentDefaults, useSurface } from '@/components/theme/ThemeScope';
import { GlassLayerContext } from '@/components/theme/glass-layer';
import styles from './Card.module.css';
export type CardProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { variant?: 'default' | 'outlined' | 'elevated'; children: ReactNode; ref?: Ref<HTMLDivElement> };
export function Card({ variant, className = '', children, ref, ...props }: CardProps) {
  const defaults = useComponentDefaults('card');
  const surface = useSurface();
  const insideGlass = useContext(GlassLayerContext);
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-variant={variant ?? defaults.variant} data-surface={surface} data-nested={(surface === 'glass' && insideGlass) || undefined}>
    <GlassLayerContext.Provider value={surface === 'glass' || insideGlass}>{children}</GlassLayerContext.Provider>
  </div>;
}
