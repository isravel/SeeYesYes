'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { MediaFrame } from '@/components/ui/media-frame';
import { AuthShell } from '@/components/templates/auth-shell';
import { EventsPage, type ListingEvent } from '@/components/templates/events-page';
import { ForgotPasswordPage } from '@/components/templates/forgot-password-page';
import { LandingPage } from '@/components/templates/landing-page';
import { ListingPage, type ListingCourse } from '@/components/templates/listing-page';
import { PageShell, type SiteConfig } from '@/components/templates/page-shell';
import { SignInPage } from '@/components/templates/sign-in-page';
import { SignUpPage } from '@/components/templates/sign-up-page';

// Demo content for the template previews. Every word, link and number below is sample text supplied by the example; the templates invent none of it.
const mark = <Logo label="Northwind" src="/sample-mark.svg" wordmark="Northwind" />;
const site: SiteConfig = {
  brand: mark,
  groups: [{ id: 'main', links: [{ label: 'Courses', href: '#courses' }, { label: 'Events', href: '#events' }, { label: 'About', href: '#about' }] }],
  actions: <Button variant="secondary">Sign in</Button>,
  footer: {
    identity: <p>Northwind is a demo brand. This is sample content.</p>,
    columns: [{ id: 'learn', heading: 'Learn', links: [{ label: 'Courses', href: '#courses' }, { label: 'Events', href: '#events' }] }, { id: 'company', heading: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Contact', href: '#contact' }] }],
    legal: <p>Demo footer. Nothing here is a real policy.</p>,
  },
};
const media = <MediaFrame src="/sample-media.svg" alt="A green hillside under a pale sky" ratio="4:3" />;
const poster = (title: string) => ({ src: '/sample-media.svg', alt: `Poster: ${title}`, width: 3, height: 4 });
const courses: ListingCourse[] = [
  ['accessible-forms', 'Accessible forms', 'Forms', 29], ['brand-color', 'Brand color', 'Color', 39], ['component-apis', 'Component APIs', 'Engineering', 59], ['design-tokens', 'Design tokens', 'Foundations', 49],
  ['layout-systems', 'Layout systems', 'Foundations', 45], ['motion-basics', 'Motion basics', 'Motion', 35], ['type-scale', 'Type scale', 'Foundations', 25], ['testing-ui', 'Testing interfaces', 'Engineering', 55],
].map(([id, title, topic, value]) => ({ id: String(id), title: String(title), topic: String(topic), sortValue: Number(value), href: '#courses', description: 'Sample course description.', price: { current: `$${value}` } }));
const events: ListingEvent[] = ['Design systems meetup', 'Accessibility clinic', 'Color workshop', 'Open studio night'].map((title, index) => ({
  id: `event-${index}`, title, href: '#events', poster: poster(title), date: `${14 + index} March 2026`, dateTime: `2026-03-${14 + index}`, time: '6:30 pm', location: index % 2 ? 'Online' : 'Community hall', description: 'Sample event description.',
}));

export function SiteShellTemplate() {
  return <PageShell variant="contained" site={site} currentHref="#courses" label="Site shell example"><p>Page content goes here. The header, footer and links all come from one site configuration.</p></PageShell>;
}
export function LandingTemplate() {
  return <PageShell variant="contained" site={site} label="Landing page example">
    <LandingPage level={2}
      hero={{ heading: 'Learn design systems, clearly.', lead: 'Sample lead text for a demo brand.', actions: <Button>Browse courses</Button>, media }}
      stats={{ heading: 'At a glance', items: [{ id: 'courses', label: 'Courses', value: '8' }, { id: 'events', label: 'Events this season', value: '4' }, { id: 'pending', label: 'Learners' }] }}
      courses={{ heading: 'Popular courses', viewAllHref: '#courses', items: courses.slice(0, 2).map(({ id, title, href, description, price }) => ({ id, title, href, description, price })) }}
      features={{ heading: 'Why learn here', items: [{ id: 'a', title: 'Practice first', description: 'Short exercises with feedback.' }, { id: 'b', title: 'Small groups', description: 'Learn with a cohort.' }, { id: 'c', title: 'Real files', description: 'Work from files you keep.' }] }}
      testimonials={{ heading: 'Kind words', items: [{ kind: 'review', id: 'r1', quote: 'A clear, calm way to learn.', author: { name: 'Sample Learner', role: 'Demo review' } }] }}
      cta={{ heading: 'Ready to start?', description: 'Sample call to action.', action: <Button>Create an account</Button> }} />
  </PageShell>;
}
export function ListingTemplate() {
  return <PageShell variant="contained" site={site} currentHref="#courses" label="Listing page example"><ListingPage level={2} heading="All courses" description="Sample courses for a demo brand." courses={courses} pageSize={4} /></PageShell>;
}
export function EventsTemplate() {
  return <PageShell variant="contained" site={site} currentHref="#events" label="Events page example"><EventsPage level={2} heading="Events" description="Sample events for a demo brand." events={events} pageSize={4} /></PageShell>;
}

const demoNote = <p>Demo only: nothing is sent or stored. Use an address that starts with “fail” to see the failure state.</p>;
const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const demoSubmit = async ({ email }: { email: string }) => { await pause(400); if (email.toLowerCase().startsWith('fail')) throw new Error('rejected'); };
const providers = [{ id: 'google' as const, onSelect: () => pause(300) }, { id: 'github' as const, onSelect: () => pause(300) }];

export function AuthShellTemplate() {
  const [open, setOpen] = useState(false);
  return <AuthShell variant="contained" level={3} identity={mark} heading="Welcome" description="A centered panel for any account step."
    notice={open ? { tone: 'info', message: 'This is a status message. Errors use the same place.' } : undefined}
    providers={<Button variant="outline">Continue with a provider</Button>} footer={<Button variant="ghost" onClick={() => setOpen(value => !value)}>{open ? 'Hide' : 'Show'} status message</Button>}>
    <p>Your form goes here.</p>
  </AuthShell>;
}
export function SignInTemplate() {
  return <SignInPage variant="contained" level={3} identity={mark} providers={providers} forgotPasswordHref="#forgot" signUpHref="#sign-up" onSubmit={demoSubmit} footerExtra={demoNote} />;
}
export function SignUpTemplate() {
  return <SignUpPage variant="contained" level={3} identity={mark} providers={providers} signInHref="#sign-in" termsHref="#terms" privacyHref="#privacy" onSubmit={demoSubmit} />;
}
export function ForgotPasswordTemplate() {
  return <ForgotPasswordPage variant="contained" level={3} identity={mark} signInHref="#sign-in" onSubmit={demoSubmit} />;
}
