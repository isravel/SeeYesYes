import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PageShell, type SiteConfig } from '@/components/templates/page-shell';
import { LandingPage } from '@/components/templates/landing-page';
import { ListingPage, type ListingCourse } from '@/components/templates/listing-page';
import { EventsPage, type ListingEvent } from '@/components/templates/events-page';
import { AuthShell } from '@/components/templates/auth-shell';
import { SignInPage } from '@/components/templates/sign-in-page';
import { SignUpPage } from '@/components/templates/sign-up-page';
import { ForgotPasswordPage } from '@/components/templates/forgot-password-page';
import { MIN_PASSWORD_LENGTH, effectiveMinimum, emailProblem, nameProblem, passwordProblem } from '@/lib/utils/auth';
import { layoutExamples } from '@/lib/data/layout-contracts';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;
const noop = () => undefined;

const site: SiteConfig = {
  brand: 'Brand', groups: [{ id: 'main', links: [{ label: 'Courses', href: '/courses' }] }],
  footer: { identity: 'Identity', columns: [{ id: 'learn', heading: 'Learn', links: [{ label: 'Courses', href: '/courses' }] }], legal: 'Legal' },
};
const courses: ListingCourse[] = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'].map((title, index) => ({ id: `c${index}`, title, href: `/c/${index}`, topic: index % 2 ? 'Odd' : 'Even', sortValue: index }));
const events: ListingEvent[] = ['One', 'Two', 'Three'].map((title, index) => ({ id: `e${index}`, title, href: `/e/${index}`, poster: { src: '/p.svg', alt: `Poster ${title}`, width: 3, height: 4 }, date: `${index + 1} May`, dateTime: `2026-05-0${index + 1}`, location: 'Hall' }));

describe('auth rules', () => {
  it('requires an email of a plausible shape and ignores surrounding spaces', () => {
    expect(emailProblem('')).toBe('required');
    expect(emailProblem('   ')).toBe('required');
    expect(emailProblem('not-an-email')).toBe('invalid');
    expect(emailProblem('a@b')).toBe('invalid');
    expect(emailProblem('  a@b.co ')).toBeUndefined();
  });
  it('requires a name that is not only spaces', () => {
    expect(nameProblem('  ')).toBe('required');
    expect(nameProblem(' Ada ')).toBeUndefined();
  });
  it('never trims a password and only requires length when a minimum is given', () => {
    expect(passwordProblem('')).toBe('required');
    expect(passwordProblem('a')).toBeUndefined();
    expect(passwordProblem('        ', 8)).toBeUndefined();
    expect(passwordProblem('1234567', 8)).toBe('short');
    expect(passwordProblem('12345678', 8)).toBeUndefined();
  });
  it('counts characters, not UTF-16 units, against the minimum', () => {
    expect(passwordProblem('😀'.repeat(7), 8)).toBe('short');
    expect(passwordProblem('😀'.repeat(8), 8)).toBeUndefined();
  });
  it('lets a consumer require more than the baseline, never less', () => {
    expect(effectiveMinimum()).toBe(MIN_PASSWORD_LENGTH);
    expect(effectiveMinimum(3)).toBe(MIN_PASSWORD_LENGTH);
    expect(effectiveMinimum(12.9)).toBe(12);
    expect(effectiveMinimum(Number.NaN)).toBe(MIN_PASSWORD_LENGTH);
    expect(passwordProblem('1234567890', 12)).toBe('short');
  });
});

describe('SYX-051 PageShell', () => {
  it('as a page has one main landmark, a skip link, one navigation and one footer', () => {
    const out = html(h(PageShell, { site }, h('p', null, 'Body')));
    expect(count(out, /<main\b/g)).toBe(1);
    expect(out).toContain('href="#main"');
    expect(out).toContain('Skip to content');
    expect(count(out, /<nav\b/g)).toBeGreaterThanOrEqual(1);
    expect(count(out, /<footer\b/g)).toBe(1);
    expect(out).toContain('Body');
  });
  it('contained is one named region with no main and no skip link', () => {
    const out = html(h(PageShell, { site, variant: 'contained', label: 'Example' }, h('p', null, 'Body')));
    expect(out).toContain('aria-label="Example"');
    expect(out).not.toContain('<main');
    expect(out).not.toContain('Skip to content');
  });
  it('writes no links of its own and leaves the footer out when none is supplied', () => {
    const out = html(h(PageShell, { site: { brand: 'Brand' }, variant: 'contained' }, 'Body'));
    expect(out).not.toContain('<footer');
    expect(out).not.toContain('href=');
  });
});

describe('SYX-052 LandingPage', () => {
  const hero = { heading: 'Welcome' };
  it('renders only the hero when nothing else is supplied', () => {
    const out = html(h(LandingPage, { hero }));
    expect(out).toContain('Welcome');
    expect(count(out, /<section\b/g)).toBe(0);
    expect(count(out, /<h1\b/g)).toBe(1);
  });
  it('renders a section only when it has items, with headings one level under the hero', () => {
    const out = html(h(LandingPage, { hero, courses: { heading: 'Courses', items: [] }, features: { heading: 'Why', items: [{ id: 'a', title: 'Fast' }] }, cta: { heading: 'Start', action: h('a', { href: '/go' }, 'Go') } }));
    expect(out).not.toContain('>Courses<');
    expect(out).toContain('>Why<');
    expect(out).toMatch(/<h2[^>]*>Why</);
    expect(out).toMatch(/<h2[^>]*>Start</);
  });
  it('keeps the outline correct when the host page already has an h1', () => {
    const out = html(h(LandingPage, { hero, level: 2, features: { heading: 'Why', items: [{ id: 'a', title: 'Fast' }] } }));
    expect(count(out, /<h1\b/g)).toBe(0);
    expect(out).toMatch(/<h2[^>]*>Welcome</);
    expect(out).toMatch(/<h3[^>]*>Why</);
  });
  it('shows a stat with no value as text rather than inventing one', () => {
    const out = html(h(LandingPage, { hero, stats: { heading: 'Facts', items: [{ id: 'a', label: 'Learners' }] } }));
    expect(out).toContain('Learners');
  });
});

describe('SYX-053 ListingPage', () => {
  it('shows the true count, the first page in source order and pagination', () => {
    const out = html(h(ListingPage, { heading: 'Courses', courses, pageSize: 2 }));
    expect(out).toMatch(/<h1[^>]*>Courses</);
    expect(out).toContain('5 results');
    expect(out.indexOf('Alpha')).toBeGreaterThan(-1);
    expect(out.indexOf('Alpha')).toBeLessThan(out.indexOf('Beta'));
    expect(out).not.toContain('Gamma');
    expect(out).toContain('Course pages');
  });
  it('offers the topic filter and value sort only when the courses supply them', () => {
    const rich = html(h(ListingPage, { heading: 'Courses', courses }));
    expect(rich).toContain('All topics');
    expect(rich).toContain('Value, low to high');
    const plain = html(h(ListingPage, { heading: 'Courses', courses: courses.map(({ id, title, href }) => ({ id, title, href })) }));
    expect(plain).not.toContain('All topics');
    expect(plain).not.toContain('Value, low to high');
  });
  it('shows loading, error and empty as text and never a count while not ready', () => {
    const loading = html(h(ListingPage, { heading: 'Courses', courses, status: 'loading' }));
    expect(loading).toContain('Loading courses');
    expect(loading).not.toContain('5 results');
    const failed = html(h(ListingPage, { heading: 'Courses', courses, status: 'error', onRetry: noop }));
    expect(failed).toContain('The courses could not be loaded.');
    expect(failed).toContain('Retry');
    const empty = html(h(ListingPage, { heading: 'Courses', courses: [] }));
    expect(empty).toContain('No courses yet');
  });
  it('honours a level of 2 for the heading', () => {
    const out = html(h(ListingPage, { heading: 'Courses', courses, level: 2 }));
    expect(out).toMatch(/<h2[^>]*>Courses</);
    expect(count(out, /<h1\b/g)).toBe(0);
  });
});

describe('SYX-054 EventsPage', () => {
  it('keeps events in the order supplied with their facts as text', () => {
    const out = html(h(EventsPage, { heading: 'Events', events }));
    expect(out.indexOf('One')).toBeLessThan(out.indexOf('Two'));
    expect(out).toContain('1 May');
    expect(out).toContain('Hall');
    expect(out).toContain('3 results');
  });
  it('paginates only when there is more than one page', () => {
    expect(html(h(EventsPage, { heading: 'Events', events, pageSize: 2 }))).toContain('Event pages');
    expect(html(h(EventsPage, { heading: 'Events', events, pageSize: 10 }))).not.toContain('Event pages');
  });
  it('shows an empty state when there are no events', () => {
    expect(html(h(EventsPage, { heading: 'Events', events: [] }))).toContain('No events yet');
  });
});

describe('SYX-055 AuthShell', () => {
  it('as a page is the one main landmark with an h1 and no notice, providers or footer by default', () => {
    const out = html(h(AuthShell, { heading: 'Welcome' }, h('p', null, 'Form')));
    expect(count(out, /<main\b/g)).toBe(1);
    expect(out).toMatch(/<h1[^>]*>Welcome</);
    expect(out).not.toContain('role="alert"');
    expect(out).not.toContain('Continue with');
  });
  it('contained has no main and follows the level it is given', () => {
    const out = html(h(AuthShell, { heading: 'Welcome', variant: 'contained', level: 3 }));
    expect(out).not.toContain('<main');
    expect(out).toMatch(/<h3[^>]*>Welcome</);
  });
  it('shows a supplied notice and groups providers with a divider only when a form follows', () => {
    const withForm = html(h(AuthShell, { heading: 'Welcome', notice: { tone: 'error', message: 'Went wrong' }, providers: h('button', null, 'Provider') }, h('p', null, 'Form')));
    expect(withForm).toContain('Went wrong');
    expect(withForm).toContain('aria-label="Continue with"');
    expect(withForm).toContain('>or<');
    const alone = html(h(AuthShell, { heading: 'Welcome', providers: h('button', null, 'Provider') }));
    expect(alone).not.toContain('>or<');
  });
});

describe('SYX-056 SignInPage', () => {
  const base = { onSubmit: noop, variant: 'contained' as const, level: 2 as const };
  it('renders labelled email and password fields with the password hidden and a single submit', () => {
    const out = html(h(SignInPage, base));
    expect(out).toContain('Email address');
    expect(out).toContain('type="password"');
    expect(out).toContain('autoComplete="current-password"');
    expect(out).toContain('autoComplete="email"');
    expect(count(out, /type="submit"/g)).toBe(1);
    expect(out).toContain('noValidate');
  });
  it('shows only the providers supplied, once each, and only the links supplied', () => {
    const none = html(h(SignInPage, base));
    expect(none).not.toContain('Google');
    expect(none).not.toContain('Forgot your password?');
    expect(none).not.toContain('Create an account');
    const some = html(h(SignInPage, { ...base, providers: [{ id: 'google', onSelect: noop }, { id: 'google', onSelect: noop }, { id: 'github', onSelect: noop }], forgotPasswordHref: '/forgot', signUpHref: '/sign-up' }));
    expect(count(some, /Continue with Google/g)).toBe(1);
    expect(count(some, /Continue with GitHub/g)).toBe(1);
    expect(some).toContain('href="/forgot"');
    expect(some).toContain('href="/sign-up"');
  });
  it('states a failed sign-in with fixed text that gives no reason', () => {
    const out = html(h(SignInPage, { ...base, initialStatus: 'failed' }));
    expect(out).toContain('We could not sign you in. Check your details and try again.');
  });
  it('lets every visible word be replaced', () => {
    const out = html(h(SignInPage, { ...base, labels: { heading: 'Log in', submit: 'Go' } }));
    expect(out).toMatch(/<h2[^>]*>Log in</);
    expect(out).toContain('>Go<');
  });
});

describe('SYX-057 SignUpPage', () => {
  const base = { onSubmit: noop, variant: 'contained' as const, level: 2 as const };
  it('asks for name, email and a new password and states the minimum length', () => {
    const out = html(h(SignUpPage, base));
    expect(out).toContain('autoComplete="name"');
    expect(out).toContain('autoComplete="email"');
    expect(out).toContain('autoComplete="new-password"');
    expect(out).toContain(String(MIN_PASSWORD_LENGTH));
  });
  it('states a stronger minimum when the consumer asks for one, never a weaker one', () => {
    expect(html(h(SignUpPage, { ...base, minPasswordLength: 12 }))).toContain('12');
    expect(html(h(SignUpPage, { ...base, minPasswordLength: 3 }))).not.toContain('at least 3');
  });
  it('shows terms and privacy links only when supplied', () => {
    expect(html(h(SignUpPage, base))).not.toContain('Terms');
    const out = html(h(SignUpPage, { ...base, termsHref: '/terms', privacyHref: '/privacy' }));
    expect(out).toContain('href="/terms"');
    expect(out).toContain('href="/privacy"');
  });
});

describe('SYX-058 ForgotPasswordPage', () => {
  const base = { onSubmit: noop, variant: 'contained' as const, level: 2 as const };
  it('asks for one email address and offers a way back only when supplied', () => {
    const out = html(h(ForgotPasswordPage, base));
    expect(out).toContain('Email address');
    expect(out).not.toContain('Back to sign in');
    expect(html(h(ForgotPasswordPage, { ...base, signInHref: '/sign-in' }))).toContain('href="/sign-in"');
  });
  it('the inbox screen never says whether an account exists', () => {
    const out = html(h(ForgotPasswordPage, { ...base, initialStatus: 'success' }));
    expect(out).toContain('Check your inbox');
    expect(out).toContain('If there is an account for');
    expect(out).not.toMatch(/no account|not found|does not exist|already registered/i);
  });
});

describe('X7 layout registration', () => {
  it('registers each template as a layout that names only real components', () => {
    const ids = layoutExamples.map(layout => layout.id);
    for (const id of ['site-shell', 'landing-page', 'listing-page', 'events-page', 'auth-shell', 'sign-in', 'sign-up', 'forgot-password']) expect(ids).toContain(id);
  });
});
