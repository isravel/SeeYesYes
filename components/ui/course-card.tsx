'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Star } from '@phosphor-icons/react';
import { Badge } from './badge';
import { Card } from './card';
import { Chip } from './chip';
import { Link } from './link';
import { MediaFrame } from './media-frame';
import styles from './CourseCard.module.css';
export type CourseCardLevel = 2 | 3 | 4;
export type CourseCardLayout = 'grid' | 'list';
/** Prices are text you have already formatted. Nothing is calculated, rounded or converted here. */
export type CoursePrice = { current: string; original?: string; saving?: string };
export type CourseRating = { value: string; label: string };
export type CourseCardProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  title: string; href: string; level?: CourseCardLevel; linkLabel?: string; image?: { src: string; alt: string }; badges?: string[]; rating?: CourseRating; description?: ReactNode;
  chips?: string[]; price?: CoursePrice; layout?: CourseCardLayout; priceLabel?: string; originalPriceLabel?: string; ref?: Ref<HTMLDivElement>;
};
/**
 * A course as a Card: image, badges, title, rating, description, topic chips, price and one details link, in that order. Any part you leave out is not shown.
 * Currency, rounding and the saving are yours: `price` and `rating` are text you pass, and the component never calculates, formats or estimates them. Price parts are named for assistive technology, and the original price is struck through visually only.
 * The whole card is the click target of its one details link, named by its label followed by the title. Put no other links or buttons inside. `layout="list"` puts the image beside the text when the card is wide.
 */
export function CourseCard({ title, href, level = 3, linkLabel = 'View course', image, badges = [], rating, description, chips = [], price, layout = 'grid', priceLabel = 'Price', originalPriceLabel = 'Original price', className = '', ref, ...props }: CourseCardProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  return <Card {...props} ref={ref} className={`${styles.root} ${className}`}>
    <div className={styles.layout} data-layout={layout} data-media={image ? true : undefined}>
      {image && <MediaFrame className={styles.media} src={image.src} alt={image.alt} ratio="16:9" />}
      <div className={styles.body}>
        {badges.length > 0 && <ul className={styles.badges}>{badges.map(badge => <li key={badge}><Badge tone="primary">{badge}</Badge></li>)}</ul>}
        <Heading className={styles.title}>{title}</Heading>
        {rating && <p className={styles.rating}><Star aria-hidden="true" weight="fill" /><span aria-hidden="true">{rating.value}</span><span className={styles.visuallyHidden}>{rating.label}</span></p>}
        {description && <div className={styles.description}>{description}</div>}
        {chips.length > 0 && <ul className={styles.chips}>{chips.map(chip => <li key={chip}><Chip>{chip}</Chip></li>)}</ul>}
        {price && <p className={styles.price}>
          <span className={styles.current}><span className={styles.visuallyHidden}>{priceLabel} </span>{price.current}</span>
          {price.original && <span className={styles.original}><span className={styles.visuallyHidden}>{originalPriceLabel} </span>{price.original}</span>}
          {price.saving && <span className={styles.saving}>{price.saving}</span>}
        </p>}
        <Link href={href} className={styles.link}>{linkLabel}<span className={styles.visuallyHidden}> {title}</span></Link>
      </div>
    </div>
  </Card>;
}
