/** How a listing arranges its results. Grid and list show the same results; only the arrangement changes. */
export type ListingView = 'grid' | 'list';
/** Selected filter values by filter key. A key with no values is not a filter. */
export type ListingFilters = Record<string, string[]>;
/** Everything the listing controls remember. The consumer owns the data; this is only the controls' state. */
export type ListingState = { query: string; filters: ListingFilters; sort: string; view: ListingView; page: number };
export type ListingAction =
  | { type: 'query'; query: string }
  | { type: 'filter'; key: string; values: string[] }
  | { type: 'sort'; sort: string }
  | { type: 'view'; view: ListingView }
  | { type: 'page'; page: number; pageCount?: number }
  | { type: 'clear' };

export const initialListingState = (overrides: Partial<ListingState> = {}): ListingState => ({ query: '', filters: {}, sort: '', view: 'grid', page: 1, ...overrides });

/** A page number kept at 1 or above, and at or below `pageCount` when that is known. With no pages the only valid page is 1. */
export function clampPage(page: number, pageCount?: number): number {
  const wanted = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  if (pageCount === undefined || !Number.isFinite(pageCount)) return wanted;
  return Math.min(wanted, Math.max(1, Math.floor(pageCount)));
}

/** Whether a search or any filter is narrowing the results. Sort and view never narrow them. */
export const listingFiltersActive = (state: Pick<ListingState, 'query' | 'filters'>): boolean =>
  state.query.trim() !== '' || Object.values(state.filters).some(values => values.length > 0);

/**
 * The rules that keep a listing coherent.
 * Changing the search, a filter or the sort changes which results exist, so the page returns to 1. Changing the view keeps everything else.
 * Clearing removes the search and every filter and returns to page 1, but keeps the sort and the view, because those are preferences rather than narrowing.
 * A page change is clamped to 1 or above, and to `pageCount` when the caller knows it.
 */
export function reduceListing(state: ListingState, action: ListingAction): ListingState {
  switch (action.type) {
    case 'query': return action.query === state.query ? state : { ...state, query: action.query, page: 1 };
    case 'filter': {
      const filters = { ...state.filters };
      if (action.values.length > 0) filters[action.key] = [...action.values]; else delete filters[action.key];
      return { ...state, filters, page: 1 };
    }
    case 'sort': return action.sort === state.sort ? state : { ...state, sort: action.sort, page: 1 };
    case 'view': return action.view === state.view ? state : { ...state, view: action.view };
    case 'page': return { ...state, page: clampPage(action.page, action.pageCount) };
    case 'clear': return { ...state, query: '', filters: {}, page: 1 };
  }
}

/** What a listing page needs to know about each item to search, filter and sort it. Everything is text or a number you supply. */
export type Queryable = { id: string; title: string; topic?: string; keywords?: string[]; sortValue?: number };
export type SortKey = 'title' | 'value-asc' | 'value-desc';
export type ListingQuery<T> = { matches: T[]; visible: T[]; page: number; pageCount: number };

/**
 * Search, filter, sort and paginate a list you already hold in memory. This is the browser-side example of what a server would do for a large listing.
 * The search is a case-insensitive "contains" over the title, topic and keywords. The `topic` filter keeps items whose topic is one of the chosen values. Sorting never changes the input array.
 * The returned page is clamped to the pages that exist, so a stale page number can never show an empty page when there are results.
 */
export function queryListing<T extends Queryable>(items: T[], state: Pick<ListingState, 'query' | 'filters' | 'sort' | 'page'>, pageSize: number): ListingQuery<T> {
  const term = state.query.trim().toLowerCase();
  const topics = state.filters.topic ?? [];
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1;
  const matches = items.filter(item => (topics.length === 0 || (item.topic !== undefined && topics.includes(item.topic)))
    && (!term || [item.title, item.topic ?? '', ...(item.keywords ?? [])].some(text => text.toLowerCase().includes(term))));
  const value = (item: T) => item.sortValue ?? Number.POSITIVE_INFINITY;
  const sorted = [...matches].sort((a, b) => state.sort === 'value-asc' ? value(a) - value(b) || a.title.localeCompare(b.title)
    : state.sort === 'value-desc' ? (b.sortValue ?? Number.NEGATIVE_INFINITY) - (a.sortValue ?? Number.NEGATIVE_INFINITY) || a.title.localeCompare(b.title)
    : a.title.localeCompare(b.title));
  const pageCount = Math.max(1, Math.ceil(sorted.length / size));
  const page = clampPage(state.page, pageCount);
  return { matches: sorted, visible: sorted.slice((page - 1) * size, page * size), page, pageCount };
}
