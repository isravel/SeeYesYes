'use client';
import { useEffect, useRef, useState, type HTMLAttributes, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './AppBadges.module.css';
export type AppStore = 'app-store' | 'google-play';
export type AppBadgesSize = 'small' | 'medium' | 'large';
export type AppBadge = { id: string; store: AppStore; href: string; src: string; label?: string };
export type AppBadgesProps = Omit<HTMLAttributes<HTMLUListElement>, 'children'> & { badges: AppBadge[]; label?: string; size?: AppBadgesSize; ref?: Ref<HTMLUListElement> };
const storeLabels: Record<AppStore, string> = { 'app-store': 'Download on the App Store', 'google-play': 'Get it on Google Play' };
function Badge({ badge }: { badge: AppBadge }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const failed = failedSrc === badge.src;
  const name = badge.label ?? storeLabels[badge.store];
  // A server-rendered image can fail before hydration, when React is not yet listening for its error event.
  useEffect(() => { const node = image.current; if (node?.complete && node.naturalWidth === 0) setFailedSrc(badge.src); }, [badge.src]);
  return <a href={badge.href} className={styles.link} aria-label={name} data-store={badge.store} data-unavailable={failed ? true : undefined}>
    {failed ? <span className={styles.fallback}>{name}</span> : <img ref={image} className={styles.image} src={badge.src} alt="" onError={() => setFailedSrc(badge.src)} />}
  </a>;
}
/**
 * Links to the app stores, drawn with badge images you supply. The component ships no store artwork: pass each store's official badge file as `src`, and use it at its own proportions.
 * Only the stores you list are shown, each to the address you give; nothing says an app is available anywhere you did not link. Each link is named by the store (`label` overrides the default words, such as "Download on the App Store").
 * Badges share one height (`size`), keep their own width, and wrap onto more lines on narrow screens. If an image fails, the link shows its name as text.
 */
export function AppBadges({ badges, label = 'Get the app', size, className = '', ref, ...props }: AppBadgesProps) {
  const defaults = useComponentDefaults('app-badges');
  if (badges.length === 0) return null;
  return <ul {...props} ref={ref} aria-label={label} className={`${styles.root} ${className}`} data-size={size ?? defaults.size}>
    {badges.map(badge => <li key={badge.id} className={styles.item}><Badge badge={badge} /></li>)}
  </ul>;
}
