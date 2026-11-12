'use client';
import { useId, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { Link } from './link';
import styles from './Footer.module.css';
export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterColumn = { id: string; heading: string; links: FooterLink[] };
export type FooterProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & { identity?: ReactNode; columns?: FooterColumn[]; label?: string; legal?: ReactNode; ref?: Ref<HTMLElement> };
const MAX_COLUMNS = 4;
/**
 * The page footer: your identity content, up to four columns of links, and an optional legal line. It renders only what you supply.
 * Place it once at the top level of the page so it is the contentinfo landmark. The links sit in one named navigation; each column's heading names its list but is not a document heading, so it never disturbs heading order.
 * Columns beyond the fourth are not shown. A link marked `external` opens in a new tab and says so to assistive technology.
 */
export function Footer({ identity, columns = [], label = 'Footer', legal, className = '', ref, ...props }: FooterProps) {
  const base = useId();
  const shown = columns.slice(0, MAX_COLUMNS).filter(column => column.links.length > 0);
  return <footer {...props} ref={ref} className={`${styles.root} ${className}`}>
    {(identity || shown.length > 0) && <div className={styles.top}>
      {identity && <div className={styles.identity}>{identity}</div>}
      {shown.length > 0 && <nav aria-label={label} className={styles.columns}>
        {shown.map(column => {
          const headingId = `${base}-${column.id}`;
          return <div key={column.id} className={styles.column}>
            <p id={headingId} className={styles.heading}>{column.heading}</p>
            <ul aria-labelledby={headingId} className={styles.list}>
              {column.links.map(link => <li key={`${link.href}-${link.label}`} className={styles.item}>
                {link.external
                  ? <Link href={link.href} variant="subtle" target="_blank" rel="noopener noreferrer">{link.label}<span className={styles.visuallyHidden}> (opens in a new tab)</span></Link>
                  : <Link href={link.href} variant="subtle">{link.label}</Link>}
              </li>)}
            </ul>
          </div>;
        })}
      </nav>}
    </div>}
    {legal && <div className={styles.legal}>{legal}</div>}
  </footer>;
}
