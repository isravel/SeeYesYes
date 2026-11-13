'use client';
import { useMemo, type ComponentProps } from 'react';
import { CardGrid, type CardGridStatus } from '@/components/ui/card-grid';
import { ClearFilters } from '@/components/ui/clear-filters';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/ui/event-card';
import { ListingHead } from '@/components/ui/listing-head';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Toolbar, useListing } from '@/components/ui/toolbar';
import { clampPage, type ListingState } from '@/lib/utils/listing';
import styles from './ListingPage.module.css';

type EventProps = Omit<ComponentProps<typeof EventCard>, 'level' | 'ref'>;
/** One event, in the shape EventCard takes, plus extra words to search. Events appear in the order you pass them, so sort them (for example by date) first. */
export type ListingEvent = EventProps & { id: string; keywords?: string[] };
export type EventsPageLabels = {
  search: string; filterRegion: string; pagination: string; results: string; loading: string; error: string; noMatchesTitle: string; noMatchesText: string; emptyTitle: string; emptyText: string;
};
const defaults: EventsPageLabels = {
  search: 'Search events', filterRegion: 'Search events', pagination: 'Event pages', results: 'Event results', loading: 'Loading events…', error: 'The events could not be loaded.',
  noMatchesTitle: 'No matching events', noMatchesText: 'Nothing matches this search.', emptyTitle: 'No events yet', emptyText: 'There are no events to show right now.',
};
export type EventsPageProps = {
  heading: string; description?: string; events: ListingEvent[]; status?: CardGridStatus; onRetry?: () => void;
  pageSize?: number; initial?: Partial<ListingState>; /** 1 when this is the page's own title (the default). */ level?: 1 | 2; labels?: Partial<EventsPageLabels>;
};
const cardProps = (event: ListingEvent): EventProps => {
  const copy: Record<string, unknown> = { ...event };
  for (const key of ['id', 'keywords']) delete copy[key];
  return copy as EventProps;
};
const searchable = (event: ListingEvent) => [event.title, event.date, event.time, event.location, ...(event.keywords ?? [])].filter(Boolean).join(' ').toLowerCase();

/**
 * A complete events listing: a heading with the result count, a search, poster-led EventCards in a two-column grid and pagination.
 * Every date, time and place is the text you pass; nothing is computed, so separating past from upcoming events is yours. Events keep the order you give them. The search matches the title, date, time, place and any keywords.
 * Searching and paging happen in the browser over the list you pass. Posters keep the proportions you give them so the page does not jump, and each card keeps its facts as real text.
 */
export function EventsPage({ heading, description, events, status = 'ready', onRetry, pageSize = 6, initial, level = 1, labels }: EventsPageProps) {
  const text = { ...defaults, ...labels };
  const listing = useListing(initial);
  const term = listing.state.query.trim().toLowerCase();
  const matches = useMemo(() => term ? events.filter(event => searchable(event).includes(term)) : events, [events, term]);
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const pageCount = Math.max(1, Math.ceil(matches.length / size));
  const page = clampPage(listing.state.page, pageCount);
  const visible = matches.slice((page - 1) * size, page * size);
  const ready = status === 'ready';
  const clear = <ClearFilters active={listing.active} onClear={listing.clear} />;
  return <div className={styles.root}>
    <ListingHead heading={heading} level={level} description={description} count={ready ? matches.length : undefined} loading={status === 'loading'} loadingLabel={text.loading} />
    <Toolbar label={text.filterRegion} search={<SearchInput label={text.search} value={listing.state.query} onChange={listing.setQuery} />} clear={clear} />
    <CardGrid label={text.results} columns="two" status={status} filtered={listing.active} loadingLabel={text.loading} error={text.error} onRetry={onRetry}
      noMatches={<EmptyState title={text.noMatchesTitle} description={text.noMatchesText} action={clear} />}
      empty={<EmptyState title={text.emptyTitle} description={text.emptyText} />}
      items={ready ? visible.map(event => ({ id: event.id, content: <EventCard {...cardProps(event)} level={(level + 1) as 2 | 3} /> })) : []} />
    {ready && pageCount > 1 && <Pagination label={text.pagination} pageCount={pageCount} page={page} onPageChange={next => listing.setPage(next, pageCount)} />}
  </div>;
}
