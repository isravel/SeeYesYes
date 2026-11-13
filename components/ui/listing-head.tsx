import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './ListingHead.module.css';
export type ListingHeadLevel = 2 | 3 | 4;
export type ListingHeadProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  heading: string; level?: ListingHeadLevel; description?: ReactNode; count?: number; countLabel?: (count: number) => string; loading?: boolean; loadingLabel?: string; ref?: Ref<HTMLDivElement>;
};
const defaultCountLabel = (count: number) => count === 1 ? '1 result' : `${count} results`;
/**
 * The top of a listing: a real heading at the level the page chooses, an optional description, and the number of results.
 * The count is only what you pass. With no `count` nothing is shown, so a total is never invented; while `loading` it says the count is pending. The text sits in a status region so a change is announced politely.
 */
export function ListingHead({ heading, level = 2, description, count, countLabel = defaultCountLabel, loading = false, loadingLabel = 'Loading results…', className = '', ref, ...props }: ListingHeadProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  const known = count !== undefined && Number.isInteger(count) && count >= 0;
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-level={level}>
    <div className={styles.top}>
      <Heading className={styles.heading}>{heading}</Heading>
      <p role="status" className={styles.count}>{loading ? loadingLabel : known ? countLabel(count) : ''}</p>
    </div>
    {description && <div className={styles.description}>{description}</div>}
  </div>;
}
