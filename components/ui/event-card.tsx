'use client';
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { CalendarBlank, Clock, MapPin } from '@phosphor-icons/react';
import { Card } from './card';
import { Link } from './link';
import styles from './EventCard.module.css';
export type EventCardLevel = 2 | 3 | 4;
export type EventPoster = { src: string; alt: string; width?: number; height?: number };
export type EventLabels = { date?: string; time?: string; location?: string };
export type EventCardProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> & {
  title: string; href: string; poster: EventPoster; date: string; level?: EventCardLevel; dateTime?: string; time?: string; location?: string; description?: ReactNode;
  linkLabel?: string; labels?: EventLabels; ref?: Ref<HTMLDivElement>;
};
const positive = (value: number | undefined) => value !== undefined && Number.isFinite(value) && value > 0;
function Poster({ poster }: { poster: EventPoster }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  // A server-rendered image can fail before hydration, when React is not yet listening for its error event.
  useEffect(() => { const node = image.current; if (node?.complete && node.naturalWidth === 0) setFailedSrc(poster.src); }, [poster.src]);
  const failed = failedSrc === poster.src;
  const ratio = positive(poster.width) && positive(poster.height) ? `${poster.width} / ${poster.height}` : '3 / 4';
  return <div className={styles.poster} style={{ aspectRatio: ratio } as CSSProperties} data-state={failed ? 'error' : undefined}>
    {failed ? <span className={styles.fallback}>{poster.alt}</span>
      : <img ref={image} className={styles.image} src={poster.src} alt={poster.alt} onError={() => setFailedSrc(poster.src)} />}
  </div>;
}
/**
 * An event as a Card led by its poster. The date, time, place and description are always real text, so they stay available when the poster shows the same details as an image: repeat them in `date` and `location`.
 * Pass the poster's natural `width` and `height` and its frame keeps those proportions before it loads (3:4 without them). A failed poster shows its text alternative.
 * The whole card is the click target of its one link, named by its label followed by the title. Put no other links or buttons inside. Nothing moves or autoplays.
 */
export function EventCard({ title, href, poster, date, level = 3, dateTime, time, location, description, linkLabel = 'View event', labels, className = '', ref, ...props }: EventCardProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  const names = { date: 'Date', time: 'Time', location: 'Location', ...labels };
  return <Card {...props} ref={ref} className={`${styles.root} ${className}`}>
    <Poster poster={poster} />
    <div className={styles.body}>
      <Heading className={styles.title}>{title}</Heading>
      <dl className={styles.facts}>
        <div className={styles.fact}><dt className={styles.visuallyHidden}>{names.date}</dt><CalendarBlank aria-hidden="true" /><dd>{dateTime ? <time dateTime={dateTime}>{date}</time> : date}</dd></div>
        {time && <div className={styles.fact}><dt className={styles.visuallyHidden}>{names.time}</dt><Clock aria-hidden="true" /><dd>{time}</dd></div>}
        {location && <div className={styles.fact}><dt className={styles.visuallyHidden}>{names.location}</dt><MapPin aria-hidden="true" /><dd>{location}</dd></div>}
      </dl>
      {description && <div className={styles.description}>{description}</div>}
      <Link href={href} className={styles.link}>{linkLabel}<span className={styles.visuallyHidden}> {title}</span></Link>
    </div>
  </Card>;
}
