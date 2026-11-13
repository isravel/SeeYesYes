'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { Alert } from './alert';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';
import styles from './CardGrid.module.css';
export type CardGridView = 'grid' | 'list';
export type CardGridColumns = 'auto' | 'two';
export type CardGridStatus = 'ready' | 'loading' | 'error';
export type CardGridItem = { id: string; content: ReactNode };
export type CardGridProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  items: CardGridItem[]; view?: CardGridView; columns?: CardGridColumns; status?: CardGridStatus; label?: string; loadingLabel?: string; error?: string; onRetry?: () => void; retryLabel?: string;
  filtered?: boolean; empty?: ReactNode; noMatches?: ReactNode; ref?: Ref<HTMLDivElement>;
};
/**
 * The results area of a listing. It shows exactly one of: a loading status, an error with Retry, a no-matches or empty message, or your cards in a list.
 * `view` only changes the arrangement (responsive columns, or one per row) and never re-creates the cards, so anything inside them keeps its state when the view changes. Cards stay in DOM order, with no masonry or reordering.
 * You own the data and pick the state: `filtered` says a search or filter is active, which chooses `noMatches` over `empty`. Both default to a plain message you can replace, for example with an EmptyState holding a ClearFilters action.
 */
export function CardGrid({ items, view = 'grid', columns = 'auto', status = 'ready', label = 'Results', loadingLabel = 'Loading results…', error, onRetry, retryLabel = 'Retry', filtered = false, empty, noMatches, className = '', ref, ...props }: CardGridProps) {
  const message = error ?? 'The results could not be loaded.';
  let body: ReactNode;
  if (status === 'loading') body = <div className={styles.state}><LoadingState label={loadingLabel} variant="skeleton" /></div>;
  else if (status === 'error') body = <div className={styles.state}>{onRetry ? <ErrorState message={message} onRetry={onRetry} retryLabel={retryLabel} /> : <Alert tone="destructive" title="Could not load results">{message}</Alert>}</div>;
  else if (items.length === 0) body = <div className={styles.state}>{filtered
    ? noMatches ?? <EmptyState title="No matches" description="No results match the current search and filters." />
    : empty ?? <EmptyState title="No results" description="There is nothing to show here yet." />}</div>;
  else body = <ul aria-label={label} className={styles.list}>{items.map(item => <li key={item.id} className={styles.item}>{item.content}</li>)}</ul>;
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} data-view={view} data-columns={columns} data-status={status}>{body}</div>;
}
