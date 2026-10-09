import { useId, type Ref } from 'react';
import { Link } from './link';
import styles from './NotFound.module.css';
export type NotFoundProps = { title?: string; description?: string; homeHref?: string; homeLabel?: string; headingLevel?: 1 | 2 | 3; ref?: Ref<HTMLElement> };
export function NotFound({ title = 'We could not find that page', description = 'It may have moved or the address may be incorrect.', homeHref = '/', homeLabel = 'Return to overview', headingLevel = 1, ref }: NotFoundProps) {
  const Heading = `h${headingLevel}` as const;
  const headingId = useId();
  return <section ref={ref} className={styles.root} aria-labelledby={headingId}>
    <p className={styles.code}>404</p><Heading id={headingId} className={styles.title}>{title}</Heading><p className={styles.description}>{description}</p>
    <Link href={homeHref}>{homeLabel}</Link>
  </section>;
}
