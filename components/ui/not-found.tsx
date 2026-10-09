import type { Ref } from 'react';
import { Link } from './link';
import styles from './NotFound.module.css';
export type NotFoundProps = { title?: string; description?: string; homeHref?: string; homeLabel?: string; ref?: Ref<HTMLElement> };
export function NotFound({ title = 'We could not find that page', description = 'It may have moved or the address may be incorrect.', homeHref = '/', homeLabel = 'Return to overview', ref }: NotFoundProps) {
  return <section ref={ref} className={styles.root} aria-labelledby="not-found-title">
    <p className={styles.code}>404</p><h1 id="not-found-title" className={styles.title}>{title}</h1><p className={styles.description}>{description}</p>
    <Link href={homeHref}>{homeLabel}</Link>
  </section>;
}
