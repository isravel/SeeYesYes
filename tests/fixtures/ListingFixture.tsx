'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardGrid, type CardGridStatus } from '@/components/ui/card-grid';
import { ClearFilters } from '@/components/ui/clear-filters';
import { CohortCard } from '@/components/ui/cohort-card';
import { CourseCard } from '@/components/ui/course-card';
import { EmptyState } from '@/components/ui/empty-state';
import { EventCard } from '@/components/ui/event-card';
import { ListCard } from '@/components/ui/list-card';
import { ListingHead } from '@/components/ui/listing-head';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Select } from '@/components/ui/select';
import { Toolbar, useListing } from '@/components/ui/toolbar';
import { clampPage } from '@/lib/utils/listing';

const courses = [
  { id: 'c1', title: 'Accessible forms', level: 'beginner', price: 20 }, { id: 'c2', title: 'Brand color', level: 'beginner', price: 35 },
  { id: 'c3', title: 'Component APIs', level: 'advanced', price: 90 }, { id: 'c4', title: 'Design tokens', level: 'advanced', price: 80 },
  { id: 'c5', title: 'Grid layout', level: 'beginner', price: 25 }, { id: 'c6', title: 'Motion basics', level: 'beginner', price: 30 },
  { id: 'c7', title: 'Performance budgets', level: 'advanced', price: 95 }, { id: 'c8', title: 'Responsive images', level: 'beginner', price: 40 },
  { id: 'c9', title: 'Testing interfaces', level: 'advanced', price: 85 }, { id: 'c10', title: 'Type scales', level: 'beginner', price: 15 },
];
const pageSize = 4;

/** A complete listing journey built only from the public listing kit: search, filter, sort, view, pagination, counts, loading, error and retry, and no matches. */
export function ListingFixture() {
  const listing = useListing({ sort: 'title' });
  const [status, setStatus] = useState<CardGridStatus>('ready');
  const [retries, setRetries] = useState(0);
  const { query, filters, sort, view } = listing.state;
  const level = filters.level?.[0] ?? '';
  const term = query.trim().toLowerCase();
  const matches = courses
    .filter(course => (!level || course.level === level) && (!term || course.title.toLowerCase().includes(term)))
    .sort((a, b) => sort === 'price' ? a.price - b.price : a.title.localeCompare(b.title));
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = clampPage(listing.state.page, pageCount);
  const visible = matches.slice((page - 1) * pageSize, page * pageSize);
  const clear = <ClearFilters active={listing.active} onClear={listing.clear} />;
  return <>
    <ListingHead heading="Courses" level={2} description="Fixture listing." count={status === 'ready' ? matches.length : undefined} loading={status === 'loading'} data-testid="listing-head" />
    <Toolbar data-testid="listing-toolbar" label="Filter courses"
      search={<SearchInput label="Search courses" value={query} onChange={listing.setQuery} />}
      filters={<Select aria-label="Level" value={level} onChange={event => listing.setFilter('level', event.currentTarget.value ? [event.currentTarget.value] : [])}><option value="">All levels</option><option value="beginner">Beginner</option><option value="advanced">Advanced</option></Select>}
      sort={<Select aria-label="Sort by" value={sort} onChange={event => listing.setSort(event.currentTarget.value)}><option value="title">Title</option><option value="price">Price</option></Select>}
      view={<Segmented label="View" value={view} onChange={value => listing.setView(value === 'list' ? 'list' : 'grid')} options={[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]} />}
      clear={clear} />
    <div data-testid="listing-controls">
      <Button variant="outline" onClick={() => setStatus('loading')}>Show loading</Button>
      <Button variant="outline" onClick={() => setStatus('error')}>Show error</Button>
      <Button variant="outline" onClick={() => setStatus('ready')}>Show results</Button>
    </div>
    <CardGrid data-testid="listing-grid" label="Course results" view={view} status={status} filtered={listing.active} error="The courses could not be loaded." onRetry={() => { setRetries(count => count + 1); setStatus('ready'); }}
      noMatches={<EmptyState title="No matching courses" description="Nothing matches this search and these filters." action={clear} />}
      items={visible.map(course => ({ id: course.id, content: <ListCard title={course.title} meta={`${course.level}, $${course.price}`} href={`/courses/${course.id}`} /> }))} />
    <Pagination label="Course pages" pageCount={pageCount} page={page} onPageChange={next => listing.setPage(next, pageCount)} />
    <p role="status" data-testid="listing-state">{`page ${page} of ${pageCount}; view ${view}; sort ${sort}; level ${level || 'any'}; retries ${retries}`}</p>
    <CardGrid data-testid="card-kinds" label="Card kinds" view="grid" items={[
      { id: 'course', content: <CourseCard title="Design basics" href="/courses/design-basics" image={{ src: '/sample-media.svg', alt: 'A green hillside under a pale sky' }} badges={['Bestseller']} rating={{ value: '4.6', label: 'Rated 4.6 out of 5 from 1,280 reviews' }} chips={['Layout', 'Color']} price={{ current: '$49', original: '$99', saving: 'Save 50%' }} description="Learn the building blocks." /> },
      { id: 'course-bare', content: <CourseCard title="Bare course" href="/courses/bare" /> },
      { id: 'course-broken', content: <CourseCard title="Broken image course" href="/courses/broken" image={{ src: '/missing-media.png', alt: 'Missing course picture' }} /> },
      { id: 'event', content: <EventCard title="Design systems meetup" href="/events/meetup" poster={{ src: '/sample-media.svg', alt: 'Poster: Design systems meetup, 14 March', width: 3, height: 4 }} date="14 March 2026" dateTime="2026-03-14" time="6:30 pm" location="Community hall, Chennai" description="An evening of short talks." /> },
      { id: 'event-broken', content: <EventCard title="Broken poster event" href="/events/broken" poster={{ src: '/missing-poster.png', alt: 'Poster: Broken poster event' }} date="1 April 2026" /> },
      { id: 'cohort', content: <CohortCard title="Spring design cohort" href="/cohorts/spring" status="Enrolling" statusTone="success" description="Eight weeks of guided practice." tools={[{ id: 'mark', label: 'Design tool', src: '/sample-mark.svg' }, { id: 'broken', label: 'Missing tool', src: '/missing-tool.svg' }]} /> },
      { id: 'cohort-effects', content: <CohortCard title="Effects cohort" href="/cohorts/effects" status="Open" tilt texture description="Tilt and texture on." /> },
    ]} />
  </>;
}
