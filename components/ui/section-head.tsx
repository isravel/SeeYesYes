import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Link } from './link';
import styles from './SectionHead.module.css';
export type SectionHeadLevel = 2 | 3 | 4;
export type SectionHeadProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  heading: string; level?: SectionHeadLevel; subtitle?: ReactNode; viewAllHref?: string; viewAllLabel?: string; ref?: Ref<HTMLDivElement>;
};
/**
 * The introduction to a page section: a real heading, an optional subtitle, and a View all link only when you give it an address.
 * The page chooses `level` so heading order stays correct; the size follows the level on the shared type scale. The link's accessible name is its label followed by the heading, so several View all links on one page stay distinct.
 */
export function SectionHead({ heading, level = 2, subtitle, viewAllHref, viewAllLabel = 'View all', className = '', ref, ...props }: SectionHeadProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-level={level}>
    <div className={styles.text}>
      <Heading className={styles.heading}>{heading}</Heading>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
    {viewAllHref && <Link href={viewAllHref} className={styles.viewAll}>{viewAllLabel}<span className={styles.visuallyHidden}> {heading}</span></Link>}
  </div>;
}
