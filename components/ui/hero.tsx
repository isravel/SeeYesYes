import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Hero.module.css';
export type HeroLevel = 1 | 2;
export type HeroLayout = 'auto' | 'centered' | 'split';
export type HeroProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  heading: ReactNode; level?: HeroLevel; badge?: ReactNode; lead?: ReactNode; actions?: ReactNode; media?: ReactNode; layout?: HeroLayout; ref?: Ref<HTMLDivElement>;
};
/**
 * The opening of a page: an optional badge, a heading, a lead, supplied actions and supplied media. It composes what you pass and adds no copy, imagery or motion of its own.
 * Text comes first. `layout="auto"` puts the media beside the text (split) only when `media` is supplied; `centered` and `split` force one. With no media there is nothing to split, so it stays centered.
 * `heading` can hold a Highlight around one phrase. The page uses level 1 for its main heading; use 2 when another h1 owns the page. Media does not autoplay; supply a MediaFrame so it keeps its proportions and shows a fallback if it fails.
 */
export function Hero({ heading, level = 1, badge, lead, actions, media, layout = 'auto', className = '', ref, ...props }: HeroProps) {
  const Heading = `h${level}` as 'h1' | 'h2';
  const resolved = media && layout !== 'centered' ? 'split' : 'centered';
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-layout={resolved}>
    <div className={styles.text}>
      {badge && <div className={styles.badge}>{badge}</div>}
      <Heading className={styles.heading}>{heading}</Heading>
      {lead && <p className={styles.lead}>{lead}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
    {media && <div className={styles.media}>{media}</div>}
  </div>;
}
