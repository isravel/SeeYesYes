'use client';
import NextLink from 'next/link';
import { useEffect, useRef, useState, type AnchorHTMLAttributes, type Ref } from 'react';
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { Button } from './button';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './Navigation.module.css';
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
    <div className={styles.mobile}><DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
      <InternalTriggerButton label={triggerLabel} />
      <ModalOverlay className={styles.overlay} isDismissable><Modal className={styles.drawer}><Dialog className={styles.dialog}>
        {({ close }) => <><div className={styles.drawerHeader}><Heading slot="title">{label}</Heading><Button variant="ghost" onClick={close}>Close navigation</Button></div>{links(close)}</>}
      </Dialog></Modal></ModalOverlay>
    </DialogTrigger></div>
    {breadcrumbs.length > 0 && <nav aria-label="Breadcrumbs" className={styles.breadcrumbs}><ol>{breadcrumbs.map((item, index) => <li key={item.href}>
      {index === breadcrumbs.length - 1 ? <span aria-current="page">{item.label}</span> : <NavAnchor href={item.href}>{item.label}</NavAnchor>}
    </li>)}</ol></nav>}
  </section>;
}

type NavAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };
/** Page routes navigate client-side so session state such as a theme draft survives; hashes and API routes stay plain anchors. */
function NavAnchor({ href, ...props }: NavAnchorProps) {
  return href.startsWith('/') && !href.startsWith('/api/') ? <NextLink href={href} {...props} /> : <a href={href} {...props} />;
}
