'use client';
import { useState } from 'react';
import type { HTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Avatar.module.css';
export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { initials: string; alt: string; src?: string; size?: 'small' | 'medium' | 'large'; ref?: Ref<HTMLSpanElement> };
export function Avatar({ initials, alt, src, size, className = '', ref, ...props }: AvatarProps) {
  const defaults = useComponentDefaults('avatar');
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageFailed = Boolean(src && failedSrc === src);
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-size={size ?? defaults.size} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
    {src && !imageFailed ? <img className={styles.image} src={src} alt="" aria-hidden="true" onError={() => setFailedSrc(src)} /> : <span aria-hidden="true">{initials}</span>}
  </span>;
}
