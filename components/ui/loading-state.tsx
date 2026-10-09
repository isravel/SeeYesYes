import type { Ref } from 'react';
import { Spinner } from './spinner';
import { Skeleton } from './skeleton';
import styles from './LoadingState.module.css';
export type LoadingStateProps = { label: string; description?: string; variant?: 'spinner' | 'skeleton'; ref?: Ref<HTMLDivElement> };
export function LoadingState({ label, description, variant = 'spinner', ref }: LoadingStateProps) {
  return <div ref={ref} className={styles.root} role="status" aria-busy="true" aria-label={label}>
    {variant === 'spinner' ? <Spinner /> : <div className={styles.skeleton} aria-hidden="true"><Skeleton shape="text" /><Skeleton shape="text" /><Skeleton shape="rect" /></div>}
    <div><p className={styles.title}>{label}</p>{description && <p className={styles.description}>{description}</p>}</div>
  </div>;
}
