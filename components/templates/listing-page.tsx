'use client';
import { useMemo, type ComponentProps } from 'react';
import { CardGrid, type CardGridStatus } from '@/components/ui/card-grid';
import { ClearFilters } from '@/components/ui/clear-filters';
import { CourseCard } from '@/components/ui/course-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ListingHead } from '@/components/ui/listing-head';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Select } from '@/components/ui/select';
import { Toolbar, useListing } from '@/components/ui/toolbar';
import { queryListing, type ListingState } from '@/lib/utils/listing';
import styles from './ListingPage.module.css';

type CourseProps = Omit<ComponentProps<typeof CourseCard>, 'level' | 'layout' | 'ref'>;
/** One course, in the shape CourseCard takes, plus how to search, filter and sort it. `topic` feeds the filter, `keywords` extend the search and `sortValue` (for example a numeric price) feeds the value sort. */
export type ListingCourse = CourseProps & { id: string; topic?: string; keywords?: string[]; sortValue?: number };
/** The CourseCard props of a listing course: everything except the fields only the listing uses. */
function cardProps(course: ListingCourse): CourseProps {
  const copy: Record<string, unknown> = { ...course };
  for (const key of ['id', 'topic', 'keywords', 'sortValue']) delete copy[key];
  return copy as CourseProps;
}
export type ListingPageLabels = {
  search: string; filterRegion: string; topic: string; allTopics: string; sort: string; sortTitle: string; sortAscending: string; sortDescending: string;
  view: string; grid: string; list: string; pagination: string; results: string; loading: string; error: string; noMatchesTitle: string; noMatchesText: string; emptyTitle: string; emptyText: string;
};
const defaults: ListingPageLabels = {
  search: 'Search courses', filterRegion: 'Filter and sort courses', topic: 'Topic', allTopics: 'All topics', sort: 'Sort by', sortTitle: 'Title (A to Z)', sortAscending: 'Value, low to high', sortDescending: 'Value, high to low',
  view: 'View', grid: 'Grid', list: 'List', pagination: 'Course pages', results: 'Course results', loading: 'Loading courses…', error: 'The courses could not be loaded.',
  noMatchesTitle: 'No matching courses', noMatchesText: 'Nothing matches this search and these filters.', emptyTitle: 'No courses yet', emptyText: 'There is nothing to show here yet.',
};
export type ListingPageProps = {
  heading: string; description?: string; courses: ListingCourse[]; status?: CardGridStatus; onRetry?: () => void;
  pageSize?: number; initial?: Partial<ListingState>; /** 1 when this is the page's own title (the default). */ level?: 1 | 2;
  labels?: Partial<ListingPageLabels>;
};

/**
 * A complete, browsable course listing: a heading with the result count, a toolbar with search, a topic filter, sort, grid and list view and Clear filters, the results, and pagination.
 * The rules come from `useListing`: any change to the search, filter or sort returns to page 1, the view change keeps everything, and clearing keeps the sort and view. The count is the number of matches in the courses you pass, never a guess.
 * It searches, filters and pages the list you give it in the browser, which suits a few hundred items. For a large catalog, run your own query from `useListing` state and render ListingHead, Toolbar, CardGrid and Pagination yourself.
 * The topic filter and the value sort appear only when your courses supply `topic` and `sortValue`. `status` and `onRetry` are for your own loading and failure handling.
 */
export function ListingPage({ heading, description, courses, status = 'ready', onRetry, pageSize = 6, initial, level = 1, labels }: ListingPageProps) {
  const text = { ...defaults, ...labels };
  const listing = useListing({ sort: 'title', ...initial });
  const { query, filters, sort, view } = listing.state;
  const topics = useMemo(() => [...new Set(courses.flatMap(course => course.topic ? [course.topic] : []))].sort((a, b) => a.localeCompare(b)), [courses]);
  const hasValue = courses.some(course => course.sortValue !== undefined);
  const result = useMemo(() => queryListing(courses, listing.state, pageSize), [courses, listing.state, pageSize]);
  const topic = filters.topic?.[0] ?? '';
  const clear = <ClearFilters active={listing.active} onClear={listing.clear} />;
  const ready = status === 'ready';
  const card = (level + 1) as 2 | 3;
  const filtered = listing.active;
  return <div className={styles.root}>
    <ListingHead heading={heading} level={level} description={description} count={ready ? result.matches.length : undefined} loading={status === 'loading'} loadingLabel={text.loading} />
    <Toolbar label={text.filterRegion}
      search={<SearchInput label={text.search} value={query} onChange={listing.setQuery} />}
      filters={topics.length > 0 ? <Select aria-label={text.topic} value={topic} onChange={event => listing.setFilter('topic', event.currentTarget.value ? [event.currentTarget.value] : [])}>
        <option value="">{text.allTopics}</option>{topics.map(name => <option key={name} value={name}>{name}</option>)}</Select> : undefined}
      sort={<Select aria-label={text.sort} value={sort} onChange={event => listing.setSort(event.currentTarget.value)}>
        <option value="title">{text.sortTitle}</option>{hasValue && <><option value="value-asc">{text.sortAscending}</option><option value="value-desc">{text.sortDescending}</option></>}</Select>}
      view={<Segmented label={text.view} value={view} onChange={value => listing.setView(value === 'list' ? 'list' : 'grid')} options={[{ value: 'grid', label: text.grid }, { value: 'list', label: text.list }]} />}
      clear={clear} />
    <CardGrid label={text.results} view={view} status={status} filtered={filtered} loadingLabel={text.loading} error={text.error} onRetry={onRetry}
      noMatches={<EmptyState title={text.noMatchesTitle} description={text.noMatchesText} action={clear} />}
      empty={<EmptyState title={text.emptyTitle} description={text.emptyText} />}
      items={ready ? result.visible.map(course => ({ id: course.id, content: <CourseCard {...cardProps(course)} level={card} layout={view} /> })) : []} />
    {ready && result.pageCount > 1 && <Pagination label={text.pagination} pageCount={result.pageCount} page={result.page} onPageChange={next => listing.setPage(next, result.pageCount)} />}
  </div>;
}
