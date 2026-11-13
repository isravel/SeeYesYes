import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Badge } from './badge';
import { Card } from './card';
import { Link } from './link';
import styles from './FeatureBento.module.css';
export type FeatureBentoLevel = 2 | 3 | 4;
export type FeatureBentoLayout = 'grid' | 'three-over-four';
export type FeatureBentoItem = { id: string; title: string; description?: ReactNode; badge?: string; media?: ReactNode; href?: string; linkLabel?: string };
export type FeatureBentoProps = Omit<HTMLAttributes<HTMLUListElement>, 'children'> & {
  items: FeatureBentoItem[]; layout?: FeatureBentoLayout; level?: FeatureBentoLevel; label?: string; ref?: Ref<HTMLUListElement>;
};
// In the three-over-four pattern, every run of seven features is three wide cells over four narrower ones.
const topRow = 3;
const runLength = 7;
/**
 * A responsive grid of feature cells. Each cell is a Card with a heading, and optionally a badge beside the title, supplied media, a description and a link.
 * The DOM order is the reading order: cells are never reordered or spanned by script. `layout="three-over-four"` puts each run of seven features as three over four on wide screens; on narrower screens every layout stacks in the same order.
 * You supply the content and `level`, the heading level for every title. A link is named by its label followed by the title, so several links stay distinct. Nothing tilts, moves or changes on hover.
 */
export function FeatureBento({ items, layout = 'grid', level = 3, label, className = '', ref, ...props }: FeatureBentoProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  if (items.length === 0) return null;
  return <ul {...props} ref={ref} aria-label={label} className={`${styles.root} ${className}`} data-layout={layout}>
    {items.map((item, index) => <li key={item.id} className={styles.item} data-row={layout === 'three-over-four' ? (index % runLength < topRow ? 'top' : 'bottom') : undefined}>
      <Card>
        {item.media && <div className={styles.media}>{item.media}</div>}
        <div className={styles.head}>
          <Heading className={styles.title}>{item.title}</Heading>
          {item.badge && <Badge tone="primary">{item.badge}</Badge>}
        </div>
        {item.description && <div className={styles.description}>{item.description}</div>}
        {item.href && <Link href={item.href} className={styles.link}>{item.linkLabel ?? 'Learn more'}<span className={styles.visuallyHidden}> about {item.title}</span></Link>}
      </Card>
    </li>)}
  </ul>;
}
