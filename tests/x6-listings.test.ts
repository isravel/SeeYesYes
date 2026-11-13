import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ListingHead } from '@/components/ui/listing-head';
import { Toolbar } from '@/components/ui/toolbar';
import { CardGrid } from '@/components/ui/card-grid';
import { ListCard } from '@/components/ui/list-card';
import { ClearFilters } from '@/components/ui/clear-filters';
import { CourseCard } from '@/components/ui/course-card';
import { EventCard } from '@/components/ui/event-card';
import { CohortCard } from '@/components/ui/cohort-card';
import { clampPage, initialListingState, listingFiltersActive, reduceListing, type ListingState } from '@/lib/utils/listing';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const get = (id: string) => registry.components.find(component => component.id === id)!;
const prop = (id: string, name: string) => get(id).props.find(item => item.name === name)!;
const ids = ['listing-head', 'toolbar', 'card-grid', 'list-card', 'clear-filters', 'course-card', 'event-card', 'cohort-card'];

describe('SYX-040 listing state rules', () => {
  const busy: ListingState = { query: 'design', filters: { level: ['beginner'], topic: ['color', 'type'] }, sort: 'price', view: 'list', page: 4 };
  it('returns to page 1 when the search, a filter or the sort changes', () => {
    expect(reduceListing(busy, { type: 'query', query: 'layout' }).page).toBe(1);
    expect(reduceListing(busy, { type: 'filter', key: 'level', values: ['advanced'] }).page).toBe(1);
    expect(reduceListing(busy, { type: 'sort', sort: 'title' }).page).toBe(1);
  });
  it('keeps the page when nothing actually changed', () => {
    expect(reduceListing(busy, { type: 'query', query: 'design' })).toBe(busy);
    expect(reduceListing(busy, { type: 'sort', sort: 'price' })).toBe(busy);
  });
  it('keeps everything, page included, when only the view changes', () => {
    expect(reduceListing(busy, { type: 'view', view: 'grid' })).toEqual({ ...busy, view: 'grid' });
    expect(reduceListing(busy, { type: 'view', view: 'list' })).toBe(busy);
  });
  it('clears the search and every filter and resets the page, but keeps the sort and the view', () => {
    expect(reduceListing(busy, { type: 'clear' })).toEqual({ query: '', filters: {}, sort: 'price', view: 'list', page: 1 });
  });
  it('removes a filter when its last value is removed, so it no longer counts as a filter', () => {
    const next = reduceListing(busy, { type: 'filter', key: 'topic', values: [] });
    expect(next.filters).toEqual({ level: ['beginner'] });
    expect(listingFiltersActive(next)).toBe(true);
    const noFilters = reduceListing(next, { type: 'filter', key: 'level', values: [] });
    expect(noFilters.filters).toEqual({});
    // The search text still narrows the results, so the listing stays active until it is cleared too.
    expect(listingFiltersActive(noFilters)).toBe(true);
    expect(listingFiltersActive(reduceListing(noFilters, { type: 'query', query: '' }))).toBe(false);
  });
  it('does not treat a blank search, the sort or the view as narrowing', () => {
    expect(listingFiltersActive(initialListingState({ query: '   ', sort: 'price', view: 'list' }))).toBe(false);
    expect(listingFiltersActive(initialListingState({ query: 'x' }))).toBe(true);
  });
  it('does not mutate the state it was given', () => {
    const before = structuredClone(busy);
    reduceListing(busy, { type: 'filter', key: 'level', values: [] });
    reduceListing(busy, { type: 'clear' });
    expect(busy).toEqual(before);
  });
  it('clamps pages to 1 and, when the count is known, to the last page', () => {
    expect(clampPage(0)).toBe(1);
    expect(clampPage(-3)).toBe(1);
    expect(clampPage(Number.NaN)).toBe(1);
    expect(clampPage(2.9)).toBe(2);
    expect(clampPage(9, 5)).toBe(5);
    expect(clampPage(9, 0)).toBe(1);
    expect(clampPage(4, 5)).toBe(4);
    expect(reduceListing(busy, { type: 'page', page: 99, pageCount: 6 }).page).toBe(6);
    expect(reduceListing(busy, { type: 'page', page: 0 }).page).toBe(1);
  });
});

describe('SYX-040 ListingHead', () => {
  it('shows a real heading at the chosen level and a count only when one is given', () => {
    const known = html(h(ListingHead, { heading: 'Courses', count: 12 }));
    expect(known).toMatch(/<h2[^>]*>Courses<\/h2>/);
    expect(known).toContain('12 results');
    expect(html(h(ListingHead, { heading: 'Courses', count: 1 }))).toContain('1 result<');
    expect(html(h(ListingHead, { heading: 'Courses', level: 3 }))).toMatch(/<h3[^>]*>Courses<\/h3>/);
  });
  it('invents no total: an unknown count renders no count text, and loading says it is pending', () => {
    const unknown = html(h(ListingHead, { heading: 'Courses' }));
    expect(unknown).toMatch(/role="status"[^>]*><\/p>/);
    expect(unknown).not.toMatch(/\d+ results?/);
    expect(html(h(ListingHead, { heading: 'Courses', loading: true, count: 12 }))).toContain('Loading results…');
    expect(html(h(ListingHead, { heading: 'Courses', loading: true, count: 12 }))).not.toContain('12 results');
  });
  it('ignores a count that is not a whole number of zero or more', () => {
    for (const count of [-1, 1.5, Number.NaN]) expect(html(h(ListingHead, { heading: 'Courses', count })), String(count)).not.toMatch(/results?</);
  });
  it('lets the count wording change', () => {
    expect(html(h(ListingHead, { heading: 'Courses', count: 3, countLabel: (n: number) => `${n} courses` }))).toContain('3 courses');
  });
});

describe('SYX-040 Toolbar', () => {
  it('is a named search region around the supplied controls, in a fixed order', () => {
    const out = html(h(Toolbar, { label: 'Filter courses', search: h('input', { 'aria-label': 'Search' }), sort: h('select', { 'aria-label': 'Sort' }), view: h('button', null, 'View'), clear: h('button', null, 'Clear') }));
    expect(out).toContain('role="search"');
    expect(out).toContain('aria-label="Filter courses"');
    expect(out.indexOf('Search')).toBeLessThan(out.indexOf('Sort'));
    expect(out.indexOf('Sort')).toBeLessThan(out.indexOf('View'));
    expect(out.indexOf('View')).toBeLessThan(out.indexOf('Clear'));
    expect(out).toContain('data-surface');
  });
  it('renders nothing with no controls, and says in text when results are updating', () => {
    expect(html(h(Toolbar, {}))).toBe('');
    const pending = html(h(Toolbar, { search: h('input', { 'aria-label': 'Search' }), pending: true }));
    expect(pending).toContain('Updating results…');
    expect(pending).toContain('aria-busy="true"');
    expect(html(h(Toolbar, { search: h('input', { 'aria-label': 'Search' }) }))).not.toContain('aria-busy');
  });
});

describe('SYX-040 CardGrid', () => {
  const items = [{ id: 'a', content: h('p', null, 'Alpha') }, { id: 'b', content: h('p', null, 'Beta') }];
  it('shows the cards in a named list, in the order given', () => {
    const out = html(h(CardGrid, { items, label: 'Courses' }));
    expect(out).toContain('aria-label="Courses"');
    expect(out.match(/<li/g)).toHaveLength(2);
    expect(out.indexOf('Alpha')).toBeLessThan(out.indexOf('Beta'));
    expect(out).toContain('data-view="grid"');
    expect(html(h(CardGrid, { items, view: 'list' }))).toContain('data-view="list"');
  });
  it('shows loading, error with retry, and the two empty cases, one at a time', () => {
    const loading = html(h(CardGrid, { items, status: 'loading' }));
    expect(loading).toContain('Loading results…');
    expect(loading).not.toContain('Alpha');
    const failed = html(h(CardGrid, { items, status: 'error', error: 'Offline.', onRetry: () => undefined }));
    expect(failed).toContain('Offline.');
    expect(failed).toContain('Retry');
    expect(failed).not.toContain('Alpha');
    expect(html(h(CardGrid, { items, status: 'error' }))).toContain('The results could not be loaded.');
    expect(html(h(CardGrid, { items, status: 'error' }))).not.toContain('Retry');
    expect(html(h(CardGrid, { items: [] }))).toContain('There is nothing to show here yet.');
    expect(html(h(CardGrid, { items: [], filtered: true }))).toContain('No results match the current search and filters.');
  });
  it('lets a consumer replace the empty and no-match messages', () => {
    expect(html(h(CardGrid, { items: [], empty: h('p', null, 'Nothing yet') }))).toContain('Nothing yet');
    expect(html(h(CardGrid, { items: [], filtered: true, noMatches: h('p', null, 'Try fewer filters') }))).toContain('Try fewer filters');
  });
  it('does not show the empty message when there are results, even if filters are active', () => {
    expect(html(h(CardGrid, { items, filtered: true }))).not.toContain('No results');
  });
});

describe('SYX-040 ClearFilters', () => {
  it('is a native button that is available only while a search or filter is active', () => {
    const active = html(h(ClearFilters, { active: true, onClear: () => undefined }));
    expect(active).toMatch(/^<button[^>]*type="button"/);
    expect(active).toContain('Clear filters');
    expect(active).not.toContain('aria-disabled');
    const idle = html(h(ClearFilters, { active: false, onClear: () => undefined }));
    expect(idle).toContain('aria-disabled="true"');
    expect(idle).not.toMatch(/\sdisabled/);
  });
  it('uses a Button for the button appearance and keeps the label changeable', () => {
    const out = html(h(ClearFilters, { active: true, onClear: () => undefined, appearance: 'button', label: 'Reset search' }));
    expect(out).toContain('Reset search');
    expect(out).toContain('data-appearance="button"');
    expect(out).toContain('data-variant="secondary"');
  });
});

describe('SYX-040 ListCard', () => {
  it('has one details link named by its label and title, and only the parts supplied', () => {
    const out = html(h(ListCard, { title: 'Design basics', href: '/c/design', meta: '6 lessons', description: 'Start here.' }));
    expect(out).toMatch(/<h3[^>]*>Design basics<\/h3>/);
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain('View details');
    expect(out).toContain('> Design basics</span>');
    const bare = html(h(ListCard, { title: 'Only' }));
    expect(bare).not.toContain('<a ');
    expect(bare).not.toContain('data-media');
  });
  it('puts supplied media first and follows the heading level', () => {
    const out = html(h(ListCard, { title: 'T', level: 2, media: h('div', null, 'picture'), href: '/x' }));
    expect(out.indexOf('picture')).toBeLessThan(out.indexOf('<h2'));
    expect(out).toContain('data-media="true"');
  });
});

describe('SYX-041 CourseCard', () => {
  const full = { title: 'Design basics', href: '/c/design', image: { src: '/a.svg', alt: 'A hillside' }, badges: ['Bestseller'], rating: { value: '4.6', label: 'Rated 4.6 out of 5 from 1,280 reviews' }, chips: ['Layout', 'Color'], price: { current: '$49', original: '$99', saving: 'Save 50%' }, description: 'Learn.' };
  it('shows every supplied part, with one details link named by its label and title', () => {
    const out = html(h(CourseCard, full));
    for (const text of ['Bestseller', 'Layout', 'Color', '$49', '$99', 'Save 50%', 'Learn.', 'A hillside']) expect(out, text).toContain(text);
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain('View course');
  });
  it('reads the rating from its supplied label, not from the visible value or star', () => {
    const out = html(h(CourseCard, full));
    expect(out).toContain('Rated 4.6 out of 5 from 1,280 reviews');
    expect(out).toMatch(/aria-hidden="true"[^>]*>4\.6</);
  });
  it('names the price parts for assistive technology and passes the text through untouched', () => {
    const out = html(h(CourseCard, { ...full, price: { current: '₹3,999.50', original: '₹7,999', saving: '₹4,000 off' } }));
    expect(out).toMatch(/Price <\/span>₹3,999\.50/);
    expect(out).toMatch(/Original price <\/span>₹7,999/);
    expect(out).toContain('₹4,000 off');
    expect(html(h(CourseCard, { ...full, priceLabel: 'Prix', originalPriceLabel: 'Prix initial' }))).toContain('Prix initial');
  });
  it('leaves out anything not supplied and never invents a price, rating or saving', () => {
    const out = html(h(CourseCard, { title: 'Bare', href: '/c/bare' }));
    for (const absent of ['$', 'Rated', 'Save', 'Price', 'Original price', 'data-media', '<ul']) expect(out, absent).not.toContain(absent);
    const onlyCurrent = html(h(CourseCard, { title: 'T', href: '/c', price: { current: '$10' } }));
    expect(onlyCurrent).toContain('$10');
    expect(onlyCurrent).not.toContain('Original price');
  });
  it('supports the list layout and the heading level', () => {
    expect(html(h(CourseCard, { ...full, layout: 'list' }))).toContain('data-layout="list"');
    expect(html(h(CourseCard, { ...full, level: 2 }))).toMatch(/<h2[^>]*>Design basics<\/h2>/);
  });
});

describe('SYX-042 EventCard', () => {
  const event = { title: 'Meetup', href: '/e/meetup', poster: { src: '/p.svg', alt: 'Poster: Meetup, 14 March', width: 3, height: 4 }, date: '14 March 2026' };
  it('always writes the date, time, place and description as text', () => {
    const out = html(h(EventCard, { ...event, dateTime: '2026-03-14', time: '6:30 pm', location: 'Community hall', description: 'Short talks.' }));
    for (const text of ['14 March 2026', '6:30 pm', 'Community hall', 'Short talks.']) expect(out, text).toContain(text);
    expect(out).toContain('<time dateTime="2026-03-14">14 March 2026</time>');
    expect(out).toContain('<dl');
    for (const name of ['Date', 'Time', 'Location']) expect(out, name).toMatch(new RegExp(`<dt[^>]*>${name}</dt>`));
  });
  it('has the poster with its text alternative and one link, even when the poster holds the same details', () => {
    const out = html(h(EventCard, event));
    expect(out).toContain('alt="Poster: Meetup, 14 March"');
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain('View event');
    expect(out).not.toContain('Location');
  });
  it('keeps the supplied poster proportions, with a default when they are missing or unusable', () => {
    expect(html(h(EventCard, event))).toContain('aspect-ratio:3 / 4');
    expect(html(h(EventCard, { ...event, poster: { ...event.poster, width: 16, height: 9 } }))).toContain('aspect-ratio:16 / 9');
    expect(html(h(EventCard, { ...event, poster: { src: '/p.svg', alt: 'x' } }))).toContain('aspect-ratio:3 / 4');
    expect(html(h(EventCard, { ...event, poster: { src: '/p.svg', alt: 'x', width: 0, height: -2 } }))).toContain('aspect-ratio:3 / 4');
  });
  it('lets the fact names change', () => {
    expect(html(h(EventCard, { ...event, labels: { date: 'Fecha' } }))).toMatch(/<dt[^>]*>Fecha<\/dt>/);
  });
});

describe('SYX-043 CohortCard', () => {
  const cohort = { title: 'Spring cohort', href: '/cohorts/spring' };
  it('shows the supplied status as text, the tools as named images, and one link', () => {
    const out = html(h(CohortCard, { ...cohort, status: 'Enrolling', statusTone: 'success', description: 'Eight weeks.', tools: [{ id: 'a', label: 'Design tool', src: '/a.svg' }] }));
    expect(out).toContain('Enrolling');
    expect(out).toContain('data-tone="success"');
    expect(out).toContain('alt="Design tool"');
    expect(out).toContain('aria-label="Tools"');
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain('View cohort');
  });
  it('keeps tilt and texture off by default, and leaves out parts that were not supplied', () => {
    const out = html(h(CohortCard, cohort));
    expect(out).not.toContain('data-texture');
    expect(out).not.toContain('data-tilt');
    for (const absent of ['<ul', 'data-tone', 'Enrolling']) expect(out, absent).not.toContain(absent);
  });
  it('turns tilt and texture on only when asked', () => {
    const out = html(h(CohortCard, { ...cohort, tilt: true, texture: true }));
    expect(out).toContain('data-tilt');
    expect(out).toContain('data-texture="true"');
  });
  it('shows the same text and link with the effects on or off', () => {
    const text = (markup: string) => markup.replace(/<[^>]+>/g, '|').split('|').filter(Boolean).join(' ');
    const plain = html(h(CohortCard, { ...cohort, status: 'Open', description: 'Details.' }));
    const effects = html(h(CohortCard, { ...cohort, status: 'Open', description: 'Details.', tilt: true, texture: true }));
    expect(text(effects)).toBe(text(plain));
  });
});

describe('X6 listing contracts', () => {
  it('registers each with a recommended example that imports it', () => {
    for (const id of ids) {
      expect(get(id), id).toBeDefined();
      const recommended = registry.examples.filter(example => example.intent === 'recommended' && example.componentIds.includes(id));
      expect(recommended.length, id).toBeGreaterThan(0);
      expect(recommended[0].code).toContain(id === 'toolbar' ? '@/components/ui/toolbar' : `@/components/ui/${id}`);
    }
  });
  it('marks as interactive only parts that render a control or link of their own', () => {
    const plain = ['listing-head', 'toolbar'];
    for (const id of ids) {
      expect(get(id).interactive, id).toBe(!plain.includes(id));
      expect(get(id).accessibility.keyboard.length > 0, id).toBe(!plain.includes(id));
    }
    const rule = registry.rules.find(item => item.id === 'wcag-focus-visible')!.appliesTo;
    for (const id of ids.filter(item => !plain.includes(item))) expect(rule, id).toContain(id);
    for (const id of plain) expect(rule, id).not.toContain(id);
  });
  it('keeps the planned defaults', () => {
    expect(prop('card-grid', 'view').defaultValue).toBe('grid');
    expect(prop('card-grid', 'status').defaultValue).toBe('ready');
    expect(prop('card-grid', 'filtered').defaultValue).toBe(false);
    expect(prop('clear-filters', 'appearance').defaultValue).toBe('text');
    expect(prop('course-card', 'layout').defaultValue).toBe('grid');
    expect(prop('cohort-card', 'tilt').defaultValue).toBe(false);
    expect(prop('cohort-card', 'texture').defaultValue).toBe(false);
    expect(prop('listing-head', 'count').defaultValue).toBeUndefined();
    expect(prop('course-card', 'price').defaultValue).toBeUndefined();
  });
  it('does not let a theme default change a listing part', () => {
    for (const id of ids) expect(get(id).themeDefaults, id).toEqual({});
  });
  it('documents the pagination and clearing rules where people will read them', () => {
    const toolbar = get('toolbar').accessibility.requirements.join(' ');
    expect(toolbar).toContain('returns to page 1');
    expect(toolbar).toContain('keeps the sort and view');
    expect(get('clear-filters').accessibility.requirements.join(' ')).toContain('page 1');
  });
});
