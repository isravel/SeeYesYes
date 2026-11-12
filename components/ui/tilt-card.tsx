'use client';
import type { CSSProperties, PointerEvent } from 'react';
import { Card, type CardProps } from './card';
import styles from './TiltCard.module.css';
export type TiltCardProps = CardProps & { tilt?: boolean; maxTilt?: number; depth?: boolean };
const clamp = (value: number) => Math.min(1, Math.max(-1, value));
/**
 * A Card that can lean toward a mouse or pen pointer. It is Card underneath, so its surface, glass look, reading order and contents are unchanged.
 * Tilt is off by default, never follows touch, never changes with keyboard focus, and is removed by reduced motion. Anything inside stays clickable and focusable as usual.
 * `depth` also shifts descendants marked `data-tilt-layer` a little against the lean. The card is not a button: put any action inside it.
 */
export function TiltCard({ tilt = false, maxTilt = 8, depth = false, className = '', style, onPointerMove, onPointerLeave, ...props }: TiltCardProps) {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (!tilt || event.pointerType === 'touch') return;
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width || !box.height) return;
    event.currentTarget.dataset.leaning = 'true';
    event.currentTarget.style.setProperty('--tilt-x', clamp(((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3));
    event.currentTarget.style.setProperty('--tilt-y', clamp(((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3));
  };
  const leave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    delete event.currentTarget.dataset.leaning;
    event.currentTarget.style.setProperty('--tilt-x', '0');
    event.currentTarget.style.setProperty('--tilt-y', '0');
  };
  const limit = Math.min(15, Math.max(0, maxTilt));
  return <Card {...props} className={`${styles.root} ${className}`} style={tilt ? { ...style, '--tilt-max': `${limit}deg` } as CSSProperties : style}
    data-tilt={tilt ? true : undefined} data-depth={tilt && depth ? true : undefined} onPointerMove={move} onPointerLeave={leave} />;
}
