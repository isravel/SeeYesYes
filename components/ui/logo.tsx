'use client';
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Logo.module.css';
export type LogoSize = 'small' | 'medium' | 'large';
export type LogoProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label'> & {
  label: string; src?: string; mark?: ReactNode; wordmark?: string; size?: LogoSize; animated?: boolean; ref?: Ref<HTMLSpanElement>;
};
/**
 * A slot for identity you supply: an image (`src`) or inline mark (`mark`), an optional `wordmark`, or both. It ships no brand of its own.
 * The root is one image with a fixed name (`label`), so the parts never add to what assistive technology reads. If the image fails, the wordmark (or the label) shows as text.
 * `animated` adds a slow breathing motion to the mark; it is off by default and removed by reduced motion. Wrap the logo in a Link to make it a home link.
 */
export function Logo({ label, src, mark, wordmark, size, animated = false, className = '', ref, ...props }: LogoProps) {
  const defaults = useComponentDefaults('logo');
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const failed = Boolean(src && failedSrc === src);
  // A server-rendered image can fail before hydration, when React is not yet listening for its error event.
  useEffect(() => { const node = image.current; if (src && node?.complete && node.naturalWidth === 0) setFailedSrc(src); }, [src]);
  // With no image, mark or wordmark to show, the label is shown as text so the slot is never empty.
  const text = wordmark ?? (failed || (!src && !mark) ? label : undefined);
  return <span {...props} ref={ref} role="img" aria-label={label} className={`${styles.root} ${className}`} data-size={size ?? defaults.size} data-animated={animated ? true : undefined} data-unavailable={failed ? true : undefined}>
    {src ? (!failed && <span className={styles.mark}><img ref={image} className={styles.image} src={src} alt="" onError={() => setFailedSrc(src)} /></span>) : mark && <span className={styles.mark}>{mark}</span>}
    {text && <span className={styles.wordmark}>{text}</span>}
  </span>;
}
