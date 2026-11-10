'use client';
import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Avatar.module.css';
export type AvatarProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { initials: string; alt: string; src?: string; size?: 'small' | 'medium' | 'large'; ring?: boolean; ref?: Ref<HTMLSpanElement> };
export function Avatar({ initials, alt, src, size, ring = false, className = '', ref, ...props }: AvatarProps) {
  const defaults = useComponentDefaults('avatar');
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageFailed = Boolean(src && failedSrc === src);
  const image = useRef<HTMLImageElement | null>(null);
  // A server-rendered image can fail before hydration, when React is not yet listening for its error event. A finished load with no pixels is that failure.
  useEffect(() => { const node = image.current; if (src && node?.complete && node.naturalWidth === 0) setFailedSrc(src); }, [src]);
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-size={size ?? defaults.size} data-ring={ring || undefined} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
    {src && !imageFailed ? <img ref={image} className={styles.image} src={src} alt="" aria-hidden="true" onError={() => setFailedSrc(src)} /> : <span aria-hidden="true">{initials}</span>}
  </span>;
}
