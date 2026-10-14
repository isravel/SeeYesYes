'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppearanceSelector } from '@/components/theme/AppearanceSelector';
import { Navigation, type NavigationItem } from '@/components/ui/navigation';
import styles from './WorkspaceShell.module.css';

const groups = [
  { items: [{ label: 'Overview', href: '/' }, { label: 'Getting started', href: '/getting-started' }] },
  { label: 'System', items: [{ label: 'Theme', href: '/system/theme' }, { label: 'Tokens', href: '/system/tokens' }, { label: 'Rules', href: '/system/rules' }] },
  { label: 'Build', items: [{ label: 'Components', href: '/components' }, { label: 'Layouts', href: '/layouts' }, { label: 'Playground', href: '/playground' }] },
  { label: 'AI', items: [{ label: 'AI context', href: '/ai/context' }] },
  { label: 'Quality', items: [{ label: 'Accessibility', href: '/accessibility' }, { label: 'Validation', href: '/validation' }] },
  { label: 'Learn', items: [{ label: 'Documentation', href: '/docs' }] },
];
const destinations = groups.flatMap(group => group.items);

/** The destination a path belongs to: the longest matching route, so /components/button belongs to Components. */
export function currentDestination(pathname: string): NavigationItem | undefined {
  return [...destinations].sort((a, b) => b.href.length - a.href.length).find(item => item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`));
}

/** One shell for every screen: skip link, brand, appearance, and navigation with the current page marked. */
export function WorkspaceShell({ children, version }: { children: ReactNode; version: string }) {
  const pathname = usePathname();
  // Internal check fixtures render bare so they test components in isolation.
  if (pathname.startsWith('/internal-checks')) return <>{children}</>;
  const current = currentDestination(pathname);
  const crumbs = current && pathname === current.href ? (current.href === '/' ? [current] : [{ label: 'Overview', href: '/' }, current]) : [];
  return <>
    <a className={styles.skip} href="#main">Skip to content</a>
    <header className={styles.header}>
      <a href="/" className={styles.brand}>SeeYesYes<span className={styles.brandMark} aria-hidden="true">↗</span></a>
      <span className={styles.stage}>Foundation preview · v{version}</span>
      <AppearanceSelector />
    </header>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}><Navigation showSkipLink={false} label="Workspace" currentHref={current?.href ?? ''} mainId="main" groups={groups} breadcrumbs={crumbs} /></aside>
      <div className={styles.content}>{children}</div>
    </div>
    <footer className={styles.footer}><span>See + Yes + Yes. A little nod to CSS.</span><span>Define once. Build together.</span></footer>
  </>;
}
