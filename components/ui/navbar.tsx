'use client';
import { useId, useRef, useState, useSyncExternalStore, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react';
import { useSurface } from '@/components/theme/ThemeScope';
import { Link } from './link';
import { MenuToggle } from './menu-toggle';
import styles from './Navbar.module.css';
export type NavbarLink = { label: string; href: string; external?: boolean };
export type NavbarGroup = { id: string; label?: string; links: NavbarLink[] };
export type NavbarProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  label?: string; brand?: ReactNode; groups?: NavbarGroup[]; currentHref?: string; actions?: ReactNode; sticky?: boolean;
  menuLabel?: string; defaultMenuOpen?: boolean; onMenuOpenChange?: (open: boolean) => void; ref?: Ref<HTMLElement>;
};
const subscribe = (notify: () => void) => { window.addEventListener('scroll', notify, { passive: true }); return () => window.removeEventListener('scroll', notify); };
const scrolledNow = () => window.scrollY > 8;
const notScrolled = () => false;
/**
 * The page header: your brand, grouped links to the main destinations, optional actions, and a menu button on narrow screens.
 * It is one `header` landmark holding one named `nav`. The link for `currentHref` is marked `aria-current="page"`. On narrow screens the links and actions sit behind a MenuToggle that starts closed; Escape closes the menu and returns focus to the button, and following a link closes it.
 * `sticky` (on by default) pins it to the top. It draws no surface until the page scrolls, then separates itself from the content with an edge, and with the glass surface a blurred tint. The menu and its text sit on an opaque surface while open.
 */
export function Navbar({ label = 'Main', brand, groups = [], currentHref, actions, sticky = true, menuLabel = 'Menu', defaultMenuOpen = false, onMenuOpenChange, className = '', ref, ...props }: NavbarProps) {
  const surface = useSurface();
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement | null>(null);
  const [open, setOpenState] = useState(defaultMenuOpen);
  const scrolled = useSyncExternalStore(subscribe, scrolledNow, notScrolled);
  const setOpen = (next: boolean) => { setOpenState(next); onMenuOpenChange?.(next); };
  const shown = groups.filter(group => group.links.length > 0);
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    props.onKeyDown?.(event);
    if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  };
  const click = (event: MouseEvent<HTMLElement>) => {
    if (open && (event.target as Element).closest('a')) setOpen(false);
  };
  return <header {...props} ref={ref} className={`${styles.root} ${className}`} data-surface={surface} data-sticky={sticky ? true : undefined} data-scrolled={scrolled ? true : undefined} data-open={open ? true : undefined} onKeyDown={keyDown}>
    <div className={styles.bar}>
      {brand && <div className={styles.brand}>{brand}</div>}
      <MenuToggle ref={toggle} className={styles.toggle} label={menuLabel} expanded={open} onExpandedChange={setOpen} controls={panelId} />
      <div id={panelId} className={styles.panel} data-open={open ? true : undefined} onClick={click}>
        {shown.length > 0 && <nav aria-label={label} className={styles.nav}>
          {shown.map(group => <ul key={group.id} aria-label={group.label} className={styles.group}>
            {group.links.map(link => <li key={`${link.href}-${link.label}`}>
              {link.external
                ? <Link href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<span className={styles.visuallyHidden}> (opens in a new tab)</span></Link>
                : <Link href={link.href} aria-current={link.href === currentHref ? 'page' : undefined}>{link.label}</Link>}
            </li>)}
          </ul>)}
        </nav>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  </header>;
}
