'use client';
import { useEffect, useState, useSyncExternalStore, type HTMLAttributes, type PointerEvent, type Ref } from 'react';
import styles from './RotatingWord.module.css';
export type RotatingWordProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label'> & {
  words: string[]; label?: string; animated?: boolean; interval?: number; paused?: boolean; ref?: Ref<HTMLSpanElement>;
};
const query = '(prefers-reduced-motion: reduce)';
const subscribe = (onChange: () => void) => { const media = window.matchMedia(query); media.addEventListener('change', onChange); return () => media.removeEventListener('change', onChange); };
const prefersReducedMotion = () => window.matchMedia(query).matches;
/**
 * A word in a headline that can cycle through a list. Every word is laid out in the same grid cell, so the headline keeps the width of the longest word and never jumps.
 * The cycling words are hidden from assistive technology; one visually hidden phrase (`label`, by default all the words in order) is read instead, so nothing is announced as it changes.
 * Cycling is off by default and starts only after hydration. It stops under reduced motion (the first word stays), while `paused` is set, and while the pointer is over the word.
 * A page that cycles for more than five seconds should also give people a way to pause it.
 */
export function RotatingWord({ words, label, animated = false, interval = 3000, paused = false, className = '', onPointerEnter, onPointerLeave, ref, ...props }: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => true);
  const rotating = animated && words.length > 1 && !paused && !hovering && !reduced;
  useEffect(() => {
    if (!rotating) return;
    const timer = setInterval(() => setIndex(value => value + 1), Math.max(1000, interval));
    return () => clearInterval(timer);
  }, [rotating, interval]);
  if (words.length === 0) return null;
  const current = reduced ? 0 : index % words.length;
  return <span {...props} ref={ref} className={`${styles.root} ${className}`} data-rotating={rotating ? true : undefined}
    onPointerEnter={(event: PointerEvent<HTMLSpanElement>) => { onPointerEnter?.(event); if (event.pointerType === 'mouse') setHovering(true); }}
    onPointerLeave={(event: PointerEvent<HTMLSpanElement>) => { onPointerLeave?.(event); setHovering(false); }}>
    <span className={styles.phrase}>{label ?? words.join(', ')}</span>
    <span className={styles.stack} aria-hidden="true">
      {words.map((word, position) => <span key={`${position}-${word}`} className={styles.word} data-active={position === current ? true : undefined}>{word}</span>)}
    </span>
  </span>;
}
