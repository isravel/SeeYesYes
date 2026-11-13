'use client';
import type { ReactNode } from 'react';
import { Backdrop, type BackdropVariant } from '@/components/ui/backdrop';
import { Footer, type FooterColumn } from '@/components/ui/footer';
import { Navbar, type NavbarGroup } from '@/components/ui/navbar';
import { cn } from '@/lib/utils/cn';
import styles from './PageShell.module.css';

/**
 * Everything a site's chrome needs, in one object the consumer owns: the brand, the grouped navigation links, header actions and the footer.
 * Keep your routes here and build the footer columns from the same list, so a link is changed in one place.
 */
export type SiteConfig = {
  brand?: ReactNode; navLabel?: string; groups?: NavbarGroup[]; actions?: ReactNode;
  footer?: { label?: string; identity?: ReactNode; columns?: FooterColumn[]; legal?: ReactNode };
};
export type PageShellVariant = 'page' | 'contained';
export type PageShellProps = {
  site: SiteConfig; children: ReactNode; currentHref?: string; variant?: PageShellVariant; backdrop?: boolean | BackdropVariant;
  sticky?: boolean; mainId?: string; skipLabel?: string; label?: string; className?: string;
};

/**
 * A page frame: a Navbar, a content column of the system's width, and a Footer, with an optional layered Backdrop behind the content.
 * `variant="page"` (the default) is a whole page: the content is the page's one `main` landmark, a skip link jumps to it, and the Navbar is pinned unless `sticky` is false.
 * `variant="contained"` places the same composition inside an existing page or panel: the whole frame becomes one named region (`label`), so its header and footer are not page landmarks, there is no skip link and nothing is pinned.
 * Routes, brand and footer all come from `site`; this component has no links of its own. `backdrop` is on by default; pass `false` for a plain background or a Backdrop variant.
 */
export function PageShell({ site, children, currentHref, variant = 'page', backdrop = true, sticky, mainId = 'main', skipLabel = 'Skip to content', label = 'Page', className }: PageShellProps) {
  const page = variant === 'page';
  const content = page
    ? <main id={mainId} tabIndex={-1} className={styles.content}>{children}</main>
    : <div className={styles.content}>{children}</div>;
  const parts = <>
    {page && <a href={`#${mainId}`} className={styles.skip}>{skipLabel}</a>}
    <Navbar className={styles.chrome} label={site.navLabel} brand={site.brand} groups={site.groups} currentHref={currentHref} actions={site.actions} sticky={sticky ?? page} />
    <div className={styles.stage}>
      {backdrop ? <Backdrop variant={backdrop === true ? undefined : backdrop}>{content}</Backdrop> : content}
    </div>
    {site.footer && <Footer className={styles.chrome} {...site.footer} />}
  </>;
  return page
    ? <div className={cn(styles.root, className)} data-variant="page">{parts}</div>
    : <section aria-label={label} className={cn(styles.root, className)} data-variant="contained">{parts}</section>;
}
