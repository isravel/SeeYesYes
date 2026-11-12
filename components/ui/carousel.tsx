'use client';
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type FocusEvent, type HTMLAttributes, type PointerEvent, type ReactNode, type Ref, type TouchEvent } from 'react';
import { Button } from './button';
import styles from './Carousel.module.css';
export type CarouselItem = { id: string; content: ReactNode };
export type CarouselProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label' | 'aria-labelledby' | 'aria-roledescription'> & {
  label: string; items: CarouselItem[]; autoplay?: boolean; interval?: number; edgeFade?: boolean; peek?: boolean; onIndexChange?: (index: number) => void; ref?: Ref<HTMLDivElement>;
};
const query = '(prefers-reduced-motion: reduce)';
const subscribe = (onChange: () => void) => { const media = window.matchMedia(query); media.addEventListener('change', onChange); return () => media.removeEventListener('change', onChange); };
const prefersReducedMotion = () => window.matchMedia(query).matches;
/**
 * A row of slides that scrolls sideways and snaps to each one. The browser does the scrolling, so touch swipe, trackpad, scrollbar and the arrow keys on the focused row all work without script.
 * Previous and Next buttons and a status line ("Slide 2 of 5") sit underneath. There is no loop: Previous is disabled on the first slide and Next on the last.
 * It never moves by itself unless `autoplay` is set. Then it pauses on mouse hover, on focus and while a finger is down, shows a Pause autoplay button, never runs faster than every 3 seconds, stops on the last slide, and does not run at all under reduced motion.
 * `peek` shows the start of the next slide, and `edgeFade` softens an edge only where more slides lie beyond it. Slides are laid left to right.
 */
export function Carousel({ label, items, autoplay = false, interval = 3000, edgeFade = false, peek = false, onIndexChange, className = '', onPointerEnter, onPointerLeave, onFocus, onBlur, onTouchStart, onTouchEnd, onTouchCancel, ref, ...props }: CarouselProps) {
  const count = items.length;
  const track = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const lastButton = useRef<'previous' | 'next' | null>(null);
  const shown = useRef(0);
  const notify = useRef(onIndexChange);
  const [current, setCurrent] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: count < 2 });
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => true);
  const cycling = autoplay && count > 1 && !edges.end && !userPaused && !hovering && !focused && !touching && !reduced;
  useEffect(() => { notify.current = onIndexChange; });
  // The scroll position is the source of truth: the status, the edges and the buttons all follow where the row actually is.
  const measure = useEffectEvent(() => {
    const element = track.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    const start = element.scrollLeft <= 1;
    const end = max <= 1 || element.scrollLeft >= max - 1;
    let index = 0;
    let best = Infinity;
    Array.from(element.children).forEach((slide, position) => {
      const distance = Math.abs((slide as HTMLElement).offsetLeft - element.scrollLeft);
      if (distance < best) { best = distance; index = position; }
    });
    // A slide near the end may never reach the left edge, so being scrolled to the end means the last slide.
    if (end && !start) index = element.children.length - 1;
    setEdges(before => before.start === start && before.end === end ? before : { start, end });
    if (index !== shown.current) { shown.current = index; setCurrent(index); notify.current?.(index); }
  });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(element);
    for (const slide of element.children) observer.observe(slide);
    const onScroll = () => measure();
    element.addEventListener('scroll', onScroll, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener('scroll', onScroll); };
  }, [count]);
  const go = (index: number) => {
    const element = track.current;
    const slide = element?.children[index] as HTMLElement | undefined;
    if (element && slide) element.scrollTo({ left: slide.offsetLeft });
  };
  const advance = useEffectEvent(() => go(current + 1));
  useEffect(() => {
    if (!cycling) return;
    const timer = setTimeout(() => advance(), Math.max(3000, interval));
    return () => clearTimeout(timer);
  }, [cycling, interval, current]);
  // A button that reaches its end is disabled while it holds focus. Pass focus to the other button so keyboard users are not left on the page body.
  useEffect(() => {
    const clicked = lastButton.current;
    if (!clicked) return;
    const active = document.activeElement;
    const mine = active === next.current || active === previous.current;
    const lost = !active || active === document.body || (mine && (active as HTMLButtonElement).disabled);
    if (!lost && !mine) { lastButton.current = null; return; }
    if (clicked === 'next' && edges.end && !edges.start) { previous.current?.focus(); lastButton.current = null; }
    else if (clicked === 'previous' && edges.start && !edges.end) { next.current?.focus(); lastButton.current = null; }
  }, [edges]);
  if (count === 0) return null;
  const position = Math.min(current, count - 1);
  return <div {...props} ref={ref} role="region" aria-roledescription="carousel" aria-label={label} className={`${styles.root} ${className}`}
    data-peek={peek ? true : undefined} data-fade={edgeFade ? true : undefined} data-at-start={edges.start ? true : undefined} data-at-end={edges.end ? true : undefined} data-cycling={cycling ? true : undefined}
    onPointerEnter={(event: PointerEvent<HTMLDivElement>) => { onPointerEnter?.(event); if (event.pointerType === 'mouse') setHovering(true); }}
    onPointerLeave={(event: PointerEvent<HTMLDivElement>) => { onPointerLeave?.(event); setHovering(false); }}
    onFocus={(event: FocusEvent<HTMLDivElement>) => { onFocus?.(event); setFocused(true); }}
    onBlur={(event: FocusEvent<HTMLDivElement>) => { onBlur?.(event); if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onTouchStart={(event: TouchEvent<HTMLDivElement>) => { onTouchStart?.(event); setTouching(true); }}
    onTouchEnd={(event: TouchEvent<HTMLDivElement>) => { onTouchEnd?.(event); setTouching(false); }}
    onTouchCancel={(event: TouchEvent<HTMLDivElement>) => { onTouchCancel?.(event); setTouching(false); }}>
    <div ref={track} className={styles.track} role="group" aria-label={`${label} slides`} tabIndex={0}>
      {items.map((item, index) => <div key={item.id} className={styles.slide} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${count}`}>{item.content}</div>)}
    </div>
    {count > 1 && <div className={styles.controls}>
      <Button ref={previous} variant="outline" size="small" disabled={edges.start} onClick={() => { lastButton.current = 'previous'; go(position - 1); }}>Previous slide</Button>
      <span className={styles.status} role="status" aria-live={cycling ? 'off' : 'polite'}>Slide {position + 1} of {count}</span>
      <Button ref={next} variant="outline" size="small" disabled={edges.end} onClick={() => { lastButton.current = 'next'; go(position + 1); }}>Next slide</Button>
      {autoplay && <Button variant="ghost" size="small" onClick={() => setUserPaused(value => !value)}>{userPaused ? 'Resume autoplay' : 'Pause autoplay'}</Button>}
    </div>}
  </div>;
}
