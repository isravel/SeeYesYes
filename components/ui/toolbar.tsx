'use client';
import { useMemo, useReducer, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { initialListingState, listingFiltersActive, reduceListing, type ListingAction, type ListingState, type ListingView } from '@/lib/utils/listing';
import { Card } from './card';
import styles from './Toolbar.module.css';
export { clampPage, initialListingState, listingFiltersActive, reduceListing } from '@/lib/utils/listing';
export type { ListingAction, ListingFilters, ListingState, ListingView } from '@/lib/utils/listing';
export type ToolbarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label' | 'aria-labelledby'> & {
  label?: string; search?: ReactNode; filters?: ReactNode; sort?: ReactNode; view?: ReactNode; clear?: ReactNode; pending?: boolean; pendingLabel?: string; ref?: Ref<HTMLDivElement>;
};
/**
 * The controls above a listing, on a Card so they share its surface. It is a named search region that lays out the controls you pass in slots (search, filters, sort, view, clear) and wraps on narrow screens.
 * It holds no state and filters nothing: you own the values and the results. `pending` only says that results are being updated, in text, and marks the region busy.
 */
export function Toolbar({ label = 'Filter and sort', search, filters, sort, view, clear, pending = false, pendingLabel = 'Updating results…', className = '', ref, ...props }: ToolbarProps) {
  if (!search && !filters && !sort && !view && !clear) return null;
  return <Card {...props} ref={ref} className={`${styles.root} ${className}`}>
    <div role="search" aria-label={label} aria-busy={pending || undefined} className={styles.bar}>
      {search && <div className={styles.search}>{search}</div>}
      {filters && <div className={styles.group}>{filters}</div>}
      {sort && <div className={styles.group}>{sort}</div>}
      {view && <div className={styles.group}>{view}</div>}
      {clear && <div className={styles.group}>{clear}</div>}
      <p role="status" className={styles.status}>{pending ? pendingLabel : ''}</p>
    </div>
  </Card>;
}
/**
 * The state of a listing's controls and the rules that connect them. You own it, so the same state can drive a Toolbar, the data request and the URL.
 * Changing the search, a filter or the sort returns to page 1; changing the view keeps everything else; `clear` removes the search and every filter, returns to page 1, and keeps the sort and the view.
 * `setPage` clamps to 1 and, when you pass `pageCount`, to the last page.
 */
export function useListing(initial: Partial<ListingState> = {}) {
  const [state, dispatch] = useReducer(reduceListing, initial, initialListingState);
  const actions = useMemo(() => ({
    setQuery: (query: string) => dispatch({ type: 'query', query }),
    setFilter: (key: string, values: string[]) => dispatch({ type: 'filter', key, values }),
    setSort: (sort: string) => dispatch({ type: 'sort', sort }),
    setView: (view: ListingView) => dispatch({ type: 'view', view }),
    setPage: (page: number, pageCount?: number) => dispatch({ type: 'page', page, pageCount }),
    clear: () => dispatch({ type: 'clear' }),
    dispatch: (action: ListingAction) => dispatch(action),
  }), []);
  return { state, active: listingFiltersActive(state), ...actions };
}
