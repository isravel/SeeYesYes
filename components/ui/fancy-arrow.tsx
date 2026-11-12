'use client';
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import styles from './FancyArrow.module.css';
export type FancyArrowPlacement = 'inline' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
export type FancyArrowDirection = 'right' | 'down' | 'left' | 'up';
export type FancyArrowProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label' | 'aria-hidden'> & {
  src?: string; children?: ReactNode; alt?: string; placement?: FancyArrowPlacement; direction?: FancyArrowDirection; ref?: Ref<HTMLSpanElement>;
};
/**
 * Renders an arrow you supply, either an image (`src`) or an inline mark (`children`). It is decoration: hidden from assistive technology, never focusable and ignored by the pointer.
 * Give `alt` only when the arrow carries meaning the nearby text does not; it is then one named image. The supplied art is assumed to point right; `direction` mirrors or turns it.
 * `placement` is inline by default, or a corner of the nearest positioned parent. If the image fails, a decorative arrow disappears and a named one falls back to its `alt` text.
 */
export function FancyArrow({ src, children, alt, placement = 'inline', direction = 'right', className = '', ref, ...props }: FancyArrowProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const failed = Boolean(src && failedSrc === src);
  useEffect(() => { const node = image.current; if (src && node?.complete && node.naturalWidth === 0) setFailedSrc(src); }, [src]);
  if (failed && !alt) return null;
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-placement={placement} data-direction={direction} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
    {failed ? <span className={styles.text}>{alt}</span> : <span className={styles.art}>{src ? <img ref={image} className={styles.image} src={src} alt="" onError={() => setFailedSrc(src)} /> : children}</span>}
  </span>;
}
