import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Card } from './card';
import { Link } from './link';
import styles from './ListCard.module.css';
export type ListCardLevel = 2 | 3 | 4;
export type ListCardProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  title: string; level?: ListCardLevel; description?: ReactNode; meta?: ReactNode; media?: ReactNode; href?: string; linkLabel?: string; ref?: Ref<HTMLDivElement>;
};
/**
 * One result as a Card: optional media beside the text when the card is wide, above it when narrow, then a heading, a meta line, a description and one details link.
 * The link is the card's only action and its whole surface is the click target; put no other links or buttons inside. Its accessible name is its label followed by the title, so several cards stay distinct.
 * Everything shown is what you pass. Media brings its own text alternative (use MediaFrame, which also handles a failed image).
 */
export function ListCard({ title, level = 3, description, meta, media, href, linkLabel = 'View details', className = '', ref, ...props }: ListCardProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  return <Card {...props} ref={ref} className={`${styles.root} ${className}`}>
    <div className={styles.layout} data-media={media ? true : undefined}>
      {media && <div className={styles.media}>{media}</div>}
      <div className={styles.body}>
        <Heading className={styles.title}>{title}</Heading>
        {meta && <p className={styles.meta}>{meta}</p>}
        {description && <div className={styles.description}>{description}</div>}
        {href && <Link href={href} className={styles.link}>{linkLabel}<span className={styles.visuallyHidden}> {title}</span></Link>}
      </div>
    </div>
  </Card>;
}
