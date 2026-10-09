import type { Ref } from 'react';
import { Alert } from './alert';
import { Button } from './button';
import styles from './ErrorState.module.css';
export type ErrorStateProps = { message: string; onRetry: () => void; title?: string; retryLabel?: string; ref?: Ref<HTMLDivElement> };
export function ErrorState({ message, onRetry, title = 'Could not load this content', retryLabel = 'Retry', ref }: ErrorStateProps) {
  return <div ref={ref} className={styles.root}>
    <Alert tone="destructive" title={title}>{message}</Alert>
    <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>
  </div>;
}
