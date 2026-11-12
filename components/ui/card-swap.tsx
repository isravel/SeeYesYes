'use client';
import { useEffect, useEffectEvent, useState, useSyncExternalStore, type FocusEvent, type HTMLAttributes, type PointerEvent, type ReactNode, type Ref } from 'react';
import { Button } from './button';
import { Card } from './card';
import styles from './CardSwap.module.css';
export type CardSwapItem = { id: string; content: ReactNode };
export type CardSwapProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label' | 'aria-labelledby'> & {
  label: string; items: CardSwapItem[]; defaultIndex?: number; onIndexChange?: (index: number) => void; autoplay?: boolean; interval?: number; ref?: Ref<HTMLDivElement>;
};
const query = '(prefers-reduced-motion: reduce)';
const subscribe = (onChange: () => void) => { const media = window.matchMedia(query); media.addEventListener('change', onChange); return () => media.removeEventListener('change', onChange); };
const prefersReducedMotion = () => window.matchMedia(query).matches;
/**
 * A stack of cards where one is in front. Previous and Next buttons bring another forward, and a status line says which card it is ("Card 2 of 3").
 * Every card stays in the document in the order you give; only the front one is exposed to assistive technology and to the keyboard, so the reading order never changes.
 * It never cycles by itself unless `autoplay` is set. Then it pauses on hover and focus, shows a Pause cycling button, never runs faster than every 3 seconds, and does not cycle at all under reduced motion.
 */
export function CardSwap({ label, items, defaultIndex = 0, onIndexChange, autoplay = false, interval = 5000, className = '', onPointerEnter, onPointerLeave, onFocus, onBlur, ref, ...props }: CardSwapProps) {
  const count = items.length;
  const [front, setFront] = useState(defaultIndex);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => true);
  const current = count ? ((front % count) + count) % count : 0;
  const cycling = autoplay && count > 1 && !userPaused && !hovering && !focused && !reduced;
  const show = (next: number) => { setFront(next); onIndexChange?.(next); };
  const advance = useEffectEvent(() => show((current + 1) % count));
  useEffect(() => {
    if (!cycling) return;
    const timer = setTimeout(() => advance(), Math.max(3000, interval));
    return () => clearTimeout(timer);
  }, [cycling, interval, current]);
  if (count === 0) return null;
  return <div {...props} ref={ref} role="group" aria-label={label} className={`${styles.root} ${className}`} data-cycling={cycling ? true : undefined}
    onPointerEnter={(event: PointerEvent<HTMLDivElement>) => { onPointerEnter?.(event); if (event.pointerType === 'mouse') setHovering(true); }}
    onPointerLeave={(event: PointerEvent<HTMLDivElement>) => { onPointerLeave?.(event); setHovering(false); }}
    onFocus={(event: FocusEvent<HTMLDivElement>) => { onFocus?.(event); setFocused(true); }}
    onBlur={(event: FocusEvent<HTMLDivElement>) => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className={styles.stack}>
      {items.map((item, index) => {
        const position = (index - current + count) % count;
        return <Card key={item.id} className={styles.card} data-position={position} inert={position !== 0}>{item.content}</Card>;
      })}
    </div>
    {count > 1 && <div className={styles.controls}>
      <Button variant="outline" size="small" onClick={() => show((current - 1 + count) % count)}>Previous card</Button>
      <span className={styles.status} role="status" aria-live={cycling ? 'off' : 'polite'}>Card {current + 1} of {count}</span>
      <Button variant="outline" size="small" onClick={() => show((current + 1) % count)}>Next card</Button>
      {autoplay && <Button variant="ghost" size="small" onClick={() => setUserPaused(value => !value)}>{userPaused ? 'Resume cycling' : 'Pause cycling'}</Button>}
    </div>}
  </div>;
}
