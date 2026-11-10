'use client';
import NextLink from 'next/link';
import type { AnchorHTMLAttributes, HTMLAttributes, Ref } from 'react';
import { isPageRoute } from '@/lib/routes';
import styles from './Breadcrumbs.module.css';
export type BreadcrumbItem = { label: string; href: string };
export type BreadcrumbsProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'aria-label' | 'aria-labelledby'> & {
  items: BreadcrumbItem[]; label?: string; separator?: 'slash' | 'chevron'; ref?: Ref<HTMLElement>;
};
type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };
/** Page routes navigate client-side so session state survives; hashes, API routes and files stay plain anchors. */
function Anchor({ href, ...props }: AnchorProps) {
  return isPageRoute(href) ? <NextLink href={href} {...props} /> : <a href={href} {...props} />;
}
/**
 * The trail from a root page to the current one, as a named landmark with an ordered list. Ancestors are links; the last item is the
 * current page and is not a link. The caller supplies the hierarchy: nothing is read from the URL.
 */
export function Breadcrumbs({ items, label = 'Breadcrumbs', separator = 'slash', className = '', ref, ...props }: BreadcrumbsProps) {
  if (items.length === 0) return null;
  const glyph = separator === 'chevron' ? '›' : '/';
  return <nav {...props} ref={ref} aria-label={label} className={`${styles.root} ${className}`}>
    <ol className={styles.list}>{items.map((item, index) => {
      const current = index === items.length - 1;
      return <li className={styles.item} key={`${index}-${item.href}`}>
        {current ? <span className={styles.current} aria-current="page">{item.label}</span> : <Anchor className={styles.link} href={item.href}>{item.label}</Anchor>}
        {!current && <span className={styles.separator} aria-hidden="true">{glyph}</span>}
      </li>;
    })}</ol>
  </nav>;
}
