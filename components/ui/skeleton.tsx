'use client';
import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Skeleton.module.css';
export type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick'> & { shape?: 'text' | 'rect' | 'circle'; width?: string; height?: string; ref?: Ref<HTMLSpanElement> };
export function Skeleton({ shape, width, height, className = '', style, ref, ...props }: SkeletonProps) {
  const defaults = useComponentDefaults('skeleton');
  const dimensions: CSSProperties = { ...(width ? { width } : {}), ...(height ? { height } : {}), ...style };
  return <span {...props} ref={ref} aria-hidden="true" className={`${styles.root} ${className}`} data-shape={shape ?? defaults.shape} style={dimensions} />;
}
