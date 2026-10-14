'use client';
import NextLink from 'next/link';
import { isPageRoute } from '@/lib/routes';
import { lazy, Suspense, useEffect, useRef, useState, type AnchorHTMLAttributes, type Ref } from 'react';
import { Button } from './button';
import styles from './Navigation.module.css';
const loadDrawer = () => import('./navigation-drawer').then(module => ({ default: module.NavigationDrawer }));
const Drawer = lazy(loadDrawer);
export type NavigationItem = { label: string; href: string };
export type NavigationGroup = { label?: string; items: NavigationItem[] };
export type NavigationProps = {
  label: string; groups: NavigationGroup[]; currentHref: string; mainId: string;
  showSkipLink?: boolean; breadcrumbs?: NavigationItem[]; triggerLabel?: string; className?: string; ref?: Ref<HTMLElement>;
};
export function Navigation({ label, groups, currentHref, mainId, showSkipLink = true, breadcrumbs = [], triggerLabel = 'Open navigation', className = '', ref }: NavigationProps) {
  const [isOpen, setOpen] = useState(false);
  const destination = useRef<string | null>(null);
  useEffect(() => {
    if (isOpen || !destination.current) return;
    const id = destination.current;
    destination.current = null;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);
  function links(close?: () => void) {
    return <nav aria-label={label} className={styles.links}>{groups.map((group, index) => <div key={group.label ?? index} className={styles.group}>
      {group.label && <h2 className={styles.groupHeading}>{group.label}</h2>}
      <ul>{group.items.map(item => <li key={item.href}><NavAnchor href={item.href} aria-current={item.href === currentHref ? 'page' : undefined} onClick={() => {
        if (close) { destination.current = item.href.startsWith('#') ? item.href.slice(1) : item.href === currentHref ? mainId : null; close(); }
      }}>{item.label}</NavAnchor></li>)}</ul>
    </div>)}</nav>;
  }
  return <section ref={ref} aria-label={`${label} shell`} className={`${styles.root} ${className}`}>
    {showSkipLink && <a href={`#${mainId}`} className={styles.skip}>Skip to content</a>}
    <div className={styles.desktop}>{links()}</div>
    <div className={styles.mobile}>
      <Button variant="secondary" aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => setOpen(true)} onPointerEnter={() => void loadDrawer()} onFocus={() => void loadDrawer()}>{triggerLabel}</Button>
      {isOpen && <Suspense fallback={null}><Drawer label={label} onOpenChange={setOpen}>{close => links(close)}</Drawer></Suspense>}
    </div>
    {breadcrumbs.length > 0 && <nav aria-label="Breadcrumbs" className={styles.breadcrumbs}><ol>{breadcrumbs.map((item, index) => <li key={item.href}>
      {index === breadcrumbs.length - 1 ? <span aria-current="page">{item.label}</span> : <NavAnchor href={item.href}>{item.label}</NavAnchor>}
    </li>)}</ol></nav>}
  </section>;
}

type NavAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };
/** Page routes navigate client-side so session state such as a theme draft survives; hashes and API routes stay plain anchors. */
function NavAnchor({ href, ...props }: NavAnchorProps) {
  return isPageRoute(href) ? <NextLink href={href} {...props} /> : <a href={href} {...props} />;
}
