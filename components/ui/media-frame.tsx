'use client';
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import styles from './MediaFrame.module.css';
export type MediaFrameRatio = '16:9' | '4:3' | '1:1' | '3:2' | '21:9';
export type MediaFrameFit = 'cover' | 'contain';
export type MediaFrameHover = 'none' | 'zoom' | 'color';
export type MediaFrameProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & {
  src: string; alt: string; kind?: 'image' | 'video'; ratio?: MediaFrameRatio; fit?: MediaFrameFit; hover?: MediaFrameHover; vignette?: boolean;
  caption?: ReactNode; fallback?: ReactNode; poster?: string; children?: ReactNode; ref?: Ref<HTMLElement>;
};
/**
 * An image or video in a frame of fixed proportions, so the page does not jump while it loads. The frame fills the width its parent gives it.
 * `alt` is required (use an empty string only for a purely decorative image) and `caption` becomes a real figcaption. If the media fails, the frame shows `fallback` (by default the alt text) instead of a broken icon.
 * `hover` (zoom, or color returning) and `vignette` are decoration for images: nothing depends on them, and reduced motion removes the movement. For video, pass `<track>` elements as children.
 */
export function MediaFrame({ src, alt, kind = 'image', ratio = '16:9', fit = 'cover', hover = 'none', vignette = false, caption, fallback, poster, children, className = '', ref, ...props }: MediaFrameProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  // A server-rendered image can finish or fail before hydration, when React is not yet listening for its events.
  useEffect(() => {
    const node = image.current;
    if (!node?.complete) return;
    if (node.naturalWidth === 0) setFailedSrc(src); else setLoadedSrc(src);
  }, [src]);
  const state = failedSrc === src ? 'error' : loadedSrc === src ? 'loaded' : 'loading';
  return <figure {...props} ref={ref} className={`${styles.root} ${className}`} data-hover={hover} data-vignette={vignette ? true : undefined}>
    <div className={styles.frame} data-ratio={ratio} data-state={state}>
      {state === 'error' ? <span className={styles.fallback}>{fallback ?? (alt || 'Media unavailable')}</span>
        : kind === 'video' ? <video className={styles.media} data-fit={fit} src={src} poster={poster} controls preload="metadata" aria-label={alt || undefined} onLoadedData={() => setLoadedSrc(src)} onError={() => setFailedSrc(src)}>{children}</video>
        : <img ref={image} className={styles.media} data-fit={fit} src={src} alt={alt} onLoad={() => setLoadedSrc(src)} onError={() => setFailedSrc(src)} />}
    </div>
    {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
  </figure>;
}
