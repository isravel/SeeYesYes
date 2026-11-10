'use client';
import { useCallback, useLayoutEffect, useRef, type Ref, type TextareaHTMLAttributes } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { fitHeight, maxHeightForRows } from '@/lib/utils/auto-grow';
import { assignRef } from '@/lib/utils/merge-refs';
import type { FormControlSize } from './input';
import styles from './Textarea.module.css';
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { size?: FormControlSize; autoGrow?: boolean; maxRows?: number; ref?: Ref<HTMLTextAreaElement> };
export function Textarea({ size, rows, autoGrow = false, maxRows, className = '', ref, onInput, ...props }: TextareaProps) {
  const defaults = useComponentDefaults('textarea');
  const node = useRef<HTMLTextAreaElement | null>(null);
  // The height this component last set. A different height means the reader dragged the resize handle.
  const applied = useRef<number | null>(null);
  const limit = maxRows ?? defaults.maxRows;
  const fit = useCallback(() => {
    const element = node.current;
    if (!element || !autoGrow) return;
    const style = getComputedStyle(element);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const manual = applied.current !== null && Math.abs(element.offsetHeight - applied.current) > 1;
    const floor = manual ? element.offsetHeight : 0;
    element.style.height = 'auto';
    const natural = element.offsetHeight;
    const max = maxHeightForRows(limit, { lineHeight: parseFloat(style.lineHeight), fontSize: parseFloat(style.fontSize), paddingY: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom), border });
    const { height, scrolls } = fitHeight({ needed: element.scrollHeight + border, natural, floor, max });
    element.style.height = `${height}px`;
    element.style.overflowY = scrolls ? 'auto' : 'hidden';
    applied.current = height;
  }, [autoGrow, limit]);
  // Controlled values change without an input event, so measure after every value or limit change as well.
  useLayoutEffect(() => {
    const element = node.current;
    if (!autoGrow) { if (element) { element.style.height = ''; element.style.overflowY = ''; } applied.current = null; return; }
    fit();
  }, [autoGrow, fit, props.value, rows]);
  return <textarea {...props} rows={rows ?? defaults.rows} ref={element => { node.current = element; assignRef(ref, element); }} className={`${styles.root} ${className}`} data-size={size ?? defaults.size} data-auto-grow={autoGrow || undefined}
    onInput={event => { onInput?.(event); fit(); }} />;
}
