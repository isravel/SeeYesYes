import { useId, type ReactNode, type Ref } from 'react';
import styles from './EmptyState.module.css';
export type EmptyStateProps = { title: string; description: string; action?: ReactNode; ref?: Ref<HTMLElement> };
export function EmptyState({ title, description, action, ref }: EmptyStateProps) {
  const headingId = useId();
  return <section ref={ref} className={styles.root} aria-labelledby={headingId}>
    <div><h2 id={headingId} className={styles.title}>{title}</h2><p className={styles.description}>{description}</p></div>
    {action && <div className={styles.action}>{action}</div>}
  </section>;
}
