import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './StatStrip.module.css';
export type StatItem = { id: string; label: string; value?: ReactNode };
export type StatStripProps = Omit<HTMLAttributes<HTMLDListElement>, 'children'> & { items: StatItem[]; missingLabel?: string; ref?: Ref<HTMLDListElement> };
const isMissing = (value: ReactNode) => value === undefined || value === null || value === false || value === '';
/**
 * Short value and label pairs in a responsive row that stacks on narrow screens. It is a description list: each label is read before its value.
 * The values and what they mean come from you; nothing is counted, animated or invented. A pair with no value shows `missingLabel` instead of an empty gap.
 */
export function StatStrip({ items, missingLabel = 'Not provided', className = '', ref, ...props }: StatStripProps) {
  if (items.length === 0) return null;
  return <dl {...props} ref={ref} className={`${styles.root} ${className}`}>
    {items.map(item => {
      const missing = isMissing(item.value);
      return <div key={item.id} className={styles.stat} data-missing={missing ? true : undefined}>
        <dt className={styles.label}>{item.label}</dt>
        <dd className={styles.value}>{missing ? missingLabel : item.value}</dd>
      </div>;
    })}
  </dl>;
}
