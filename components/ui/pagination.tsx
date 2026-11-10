'use client';
import NextLink from 'next/link';
import { useState, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { isPageRoute } from '@/lib/routes';
import type { FormControlSize } from './input';
import styles from './Pagination.module.css';
export type PaginationEntry = number | 'start-ellipsis' | 'end-ellipsis';
export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onChange' | 'aria-label' | 'aria-labelledby'> & {
  pageCount: number; page?: number; defaultPage?: number; onPageChange?: (page: number) => void; getHref?: (page: number) => string;
  label?: string; size?: FormControlSize; siblings?: number; previousLabel?: string; nextLabel?: string; pageLabel?: (page: number) => string; ref?: Ref<HTMLElement>;
};
const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);
/** The page numbers and ellipses to show. The first and last page are always present, and the list keeps a constant length while the current page moves. */
export function paginationEntries(current: number, count: number, siblings = 1): PaginationEntry[] {
  const around = Math.max(0, Math.floor(siblings));
  if (count <= around * 2 + 5) return range(1, count);
  const left = Math.max(current - around, 2);
  const right = Math.min(current + around, count - 1);
  const dotsBefore = left > 2;
  const dotsAfter = right < count - 1;
  const edge = 3 + around * 2;
  if (!dotsBefore) return [...range(1, edge), 'end-ellipsis', count];
  if (!dotsAfter) return [1, 'start-ellipsis', ...range(count - edge + 1, count)];
  return [1, 'start-ellipsis', ...range(left, right), 'end-ellipsis', count];
}
type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };
function Anchor({ href, ...props }: AnchorProps) {
  return isPageRoute(href) ? <NextLink href={href} {...props} /> : <a href={href} {...props} />;
}
/**
 * Page navigation for a list that has several pages. With `getHref` every page is a real link; otherwise each is a button that calls `onPageChange`.
 * The current page is marked with `aria-current`, and the ellipses are not actionable. The caller loads the data: nothing is fetched here.
 */
export function Pagination({ pageCount, page, defaultPage = 1, onPageChange, getHref, label = 'Pagination', size, siblings = 1, previousLabel = 'Previous', nextLabel = 'Next', pageLabel = number => `Page ${number}`, className = '', ref, ...props }: PaginationProps) {
  const defaults = useComponentDefaults('pagination');
  const [inner, setInner] = useState(defaultPage);
  const count = Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
  if (count === 0) return null;
  const current = Math.min(Math.max(Math.floor(page ?? inner) || 1, 1), count);
  const go = (target: number) => { if (page === undefined) setInner(target); onPageChange?.(target); };
  const control = (target: number, content: ReactNode, name: string | undefined, options: { disabled?: boolean; current?: boolean } = {}) => {
    if (options.disabled) return getHref ? <span className={styles.item} data-disabled="true">{content}</span> : <button type="button" className={styles.item} disabled>{content}</button>;
    const shared = { className: styles.item, 'aria-label': name, 'aria-current': options.current ? ('page' as const) : undefined, onClick: () => go(target) };
    return getHref ? <Anchor {...shared} href={getHref(target)}>{content}</Anchor> : <button type="button" {...shared}>{content}</button>;
  };
  return <nav {...props} ref={ref} aria-label={label} className={`${styles.root} ${className}`} data-size={size ?? defaults.size}>
    <ul className={styles.list}>
      <li>{control(current - 1, <><CaretLeft aria-hidden="true" />{previousLabel}</>, undefined, { disabled: current === 1 })}</li>
      {paginationEntries(current, count, siblings).map(entry => typeof entry === 'number'
        ? <li key={entry}>{control(entry, entry, pageLabel(entry), { current: entry === current })}</li>
        : <li key={entry} className={styles.ellipsis} aria-hidden="true">…</li>)}
      <li>{control(current + 1, <>{nextLabel}<CaretRight aria-hidden="true" /></>, undefined, { disabled: current === count })}</li>
    </ul>
  </nav>;
}
