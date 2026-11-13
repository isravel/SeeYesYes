import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShareButtons } from '@/components/ui/share-buttons';
import { Footer } from '@/components/ui/footer';
import { SectionHead } from '@/components/ui/section-head';
import { StatStrip } from '@/components/ui/stat-strip';
import { CtaPanel } from '@/components/ui/cta-panel';
import { Navbar } from '@/components/ui/navbar';
import { Hero } from '@/components/ui/hero';
import { FeatureBento } from '@/components/ui/feature-bento';
import { Testimonials } from '@/components/ui/testimonials';
import { AppBadges } from '@/components/ui/app-badges';
import { Instructor } from '@/components/ui/instructor';
import { resolveShareUrl, shareHref } from '@/lib/utils/share';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const get = (id: string) => registry.components.find(component => component.id === id)!;
const prop = (id: string, name: string) => get(id).props.find(item => item.name === name)!;
const decode = (value: string | null) => decodeURIComponent(value ?? '');

describe('SYX-035 share addresses', () => {
  it('keeps existing parameters and hash and adds via=share', () => {
    const url = new URL(resolveShareUrl('https://example.com/guide?lang=en&ref=a%26b#install')!);
    expect(url.searchParams.get('lang')).toBe('en');
    expect(url.searchParams.get('ref')).toBe('a&b');
    expect(url.searchParams.get('via')).toBe('share');
    expect(url.hash).toBe('#install');
    expect(url.pathname).toBe('/guide');
  });
  it('replaces an existing via, because via names where a visit came from', () => {
    const url = new URL(resolveShareUrl('https://example.com/?via=email&x=1')!);
    expect(url.searchParams.getAll('via')).toEqual(['share']);
    expect(url.searchParams.get('x')).toBe('1');
  });
  it('shares the address unchanged when attribution is off', () => {
    expect(resolveShareUrl('https://example.com/a?b=1#c', { attribution: false })).toBe('https://example.com/a?b=1#c');
  });
  it('resolves a relative address against a base and refuses one it cannot resolve', () => {
    expect(resolveShareUrl('/docs?x=1', { base: 'https://example.com/page' })).toBe('https://example.com/docs?x=1&via=share');
    expect(resolveShareUrl('/docs')).toBeNull();
    expect(resolveShareUrl('not a url')).toBeNull();
  });
  it('shares only web addresses', () => {
    for (const unsafe of ['javascript:alert(1)', 'mailto:a@b.co', 'data:text/html,hi', 'file:///etc/passwd', 'ftp://example.com/x']) expect(resolveShareUrl(unsafe), unsafe).toBeNull();
  });
  it('percent-encodes the address and text so reserved characters cannot escape their parameter', () => {
    const shared = resolveShareUrl('https://example.com/a?q=1&r=2#frag')!;
    const text = 'Tom & Jerry #1 100% = fun? नमस्ते';
    for (const network of ['linkedin', 'x', 'whatsapp'] as const) {
      const href = shareHref(network, shared, text);
      const link = new URL(href);
      expect(link.hash, network).toBe('');
      const params = [...link.searchParams.keys()];
      expect(params.length, network).toBeLessThanOrEqual(2);
    }
    const linkedin = new URL(shareHref('linkedin', shared));
    expect(linkedin.origin).toBe('https://www.linkedin.com');
    expect(linkedin.searchParams.get('url')).toBe(shared);
    const x = new URL(shareHref('x', shared, text));
    expect(x.searchParams.get('url')).toBe(shared);
    expect(x.searchParams.get('text')).toBe(text);
    const whatsapp = new URL(shareHref('whatsapp', shared, text));
    expect(whatsapp.searchParams.get('text')).toBe(`${text} ${shared}`);
    expect(decode(shareHref('x', shared))).toContain(shared);
  });
  it('leaves out empty text', () => {
    const shared = 'https://example.com/';
    expect(shareHref('x', shared, '   ')).not.toContain('text=');
    expect(new URL(shareHref('whatsapp', shared, '')).searchParams.get('text')).toBe(shared);
  });
});

describe('SYX-035 ShareButtons', () => {
  const base = { url: 'https://example.com/guide?lang=en#install', title: 'Guide' };
  it('is a named group of three links that open in a new tab and say so, and a Copy link button', () => {
    const markup = html(h(ShareButtons, base));
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Share"');
    expect(markup.match(/<a /g)).toHaveLength(3);
    expect(markup.match(/target="_blank"/g)).toHaveLength(3);
    expect(markup.match(/rel="noopener noreferrer"/g)).toHaveLength(3);
    expect(markup.match(/opens in a new tab/g)).toHaveLength(3);
    for (const name of ['LinkedIn', 'X', 'WhatsApp']) expect(markup).toContain(name);
    expect(markup).toMatch(/<button[^>]*type="button"[^>]*>[\s\S]*Copy link<\/button>/);
    expect(markup).toContain('role="status"');
  });
  it('puts the attributed, encoded address in every link', () => {
    const markup = html(h(ShareButtons, base));
    const hrefs = [...markup.matchAll(/href="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
    expect(hrefs).toHaveLength(3);
    const shared = 'https://example.com/guide?lang=en&via=share#install';
    expect(new URL(hrefs[0]).searchParams.get('url')).toBe(shared);
    expect(new URL(hrefs[1]).searchParams.get('url')).toBe(shared);
    expect(new URL(hrefs[2]).searchParams.get('text')).toBe(`Guide ${shared}`);
  });
  it('shows only the chosen networks, in order, without duplicates, and can drop Copy link', () => {
    const markup = html(h(ShareButtons, { ...base, networks: ['whatsapp', 'x', 'whatsapp'], copyLink: false }));
    expect(markup.match(/<a /g)).toHaveLength(2);
    expect(markup.indexOf('WhatsApp')).toBeLessThan(markup.indexOf('>X<'));
    expect(markup).not.toContain('Copy link');
  });
  it('shares the address unchanged without attribution', () => {
    const markup = html(h(ShareButtons, { ...base, attribution: false, networks: ['linkedin'] }));
    expect(decodeURIComponent(markup)).toContain('url=https://example.com/guide?lang=en#install');
    expect(markup).not.toContain('via');
  });
  it('disables every control and says why when the address is not a web link', () => {
    const markup = html(h(ShareButtons, { url: 'javascript:alert(1)' }));
    expect(markup).not.toContain('<a ');
    expect(markup).not.toContain('javascript');
    expect(markup.match(/disabled=""/g)).toHaveLength(4);
    expect(markup).toContain('Sharing is unavailable');
  });
  it('sizes controls from the size prop and never shares before a press', () => {
    const markup = html(h(ShareButtons, { ...base, size: 'large' }));
    expect(markup.match(/data-size="large"/g)).toHaveLength(4);
    expect(markup).not.toContain('Link copied');
  });
});

describe('SYX-037 Footer', () => {
  const columns = [
    { id: 'product', heading: 'Product', links: [{ label: 'Components', href: '/components' }, { label: 'Docs', href: '/docs' }] },
    { id: 'company', heading: 'Company', links: [{ label: 'Publisher', href: 'https://example.com', external: true }] },
  ];
  it('is a footer landmark with identity, one named navigation, and a legal line', () => {
    const markup = html(h(Footer, { identity: h('p', null, 'About Acme'), columns, legal: '© Acme' }));
    expect(markup.startsWith('<footer')).toBe(true);
    expect(markup).toContain('About Acme');
    expect(markup).toContain('<nav aria-label="Footer"');
    expect(markup.match(/<nav /g)).toHaveLength(1);
    expect(markup).toContain('© Acme');
    expect(markup).not.toMatch(/<h[1-6]/);
  });
  it('names each list by its column heading, in order', () => {
    const markup = html(h(Footer, { columns }));
    expect(markup.match(/<ul[^>]*aria-labelledby/g)).toHaveLength(2);
    expect(markup.indexOf('Product')).toBeLessThan(markup.indexOf('Company'));
    expect(markup.indexOf('Components')).toBeLessThan(markup.indexOf('Docs'));
  });
  it('shows at most four columns and skips empty ones', () => {
    const many = Array.from({ length: 6 }, (_, index) => ({ id: `c${index}`, heading: `Heading ${index}`, links: [{ label: `Link ${index}`, href: `/l${index}` }] }));
    const markup = html(h(Footer, { columns: many }));
    expect(markup.match(/<ul/g)).toHaveLength(4);
    expect(markup).not.toContain('Heading 4');
    const gaps = html(h(Footer, { columns: [{ id: 'empty', heading: 'Nothing', links: [] }, ...many.slice(0, 1)] }));
    expect(gaps).not.toContain('Nothing');
    expect(gaps.match(/<ul/g)).toHaveLength(1);
  });
  it('marks an external link as opening in a new tab', () => {
    const markup = html(h(Footer, { columns }));
    expect(markup.match(/target="_blank"/g)).toHaveLength(1);
    expect(markup).toContain('(opens in a new tab)');
  });
  it('renders no navigation when there are no links, and only what it is given', () => {
    const markup = html(h(Footer, { identity: 'Acme' }));
    expect(markup).not.toContain('<nav');
    expect(markup).not.toContain('<ul');
    expect(html(h(Footer, null))).not.toContain('<nav');
  });
});

describe('SYX-039 SectionHead', () => {
  it('is a heading at the level the page chooses, defaulting to 2', () => {
    expect(html(h(SectionHead, { heading: 'Guides' }))).toMatch(/<h2[^>]*>Guides<\/h2>/);
    for (const level of [3, 4]) expect(html(h(SectionHead, { heading: 'Guides', level }))).toMatch(new RegExp(`<h${level}[^>]*>Guides</h${level}>`));
  });
  it('shows no link and no subtitle unless supplied', () => {
    const markup = html(h(SectionHead, { heading: 'Guides' }));
    expect(markup).not.toContain('<a');
    expect(markup).not.toContain('<p');
  });
  it('shows a subtitle and a View all link whose name ends with the heading', () => {
    const markup = html(h(SectionHead, { heading: 'Guides', subtitle: 'Start here.', viewAllHref: '/docs' }));
    expect(markup).toContain('Start here.');
    expect(markup).toContain('href="/docs"');
    expect(markup).toMatch(/View all<span[^>]*> Guides<\/span>/);
  });
  it('lets the label change while keeping the heading in the name', () => {
    expect(html(h(SectionHead, { heading: 'Guides', viewAllHref: '/docs', viewAllLabel: 'See every guide' }))).toMatch(/See every guide<span[^>]*> Guides<\/span>/);
  });
});

describe('SYX-047 StatStrip', () => {
  const items = [{ id: 'a', label: 'Members', value: '24' }, { id: 'b', label: 'Projects', value: '9' }];
  it('is a description list that reads each label before its value', () => {
    const markup = html(h(StatStrip, { items }));
    expect(markup.startsWith('<dl')).toBe(true);
    expect(markup.indexOf('Members')).toBeLessThan(markup.indexOf('>24<'));
    expect(markup.match(/<dt/g)).toHaveLength(2);
    expect(markup.match(/<dd/g)).toHaveLength(2);
  });
  it('renders the values as given and invents nothing', () => {
    const markup = html(h(StatStrip, { items: [{ id: 'a', label: 'Uptime', value: '99.9%' }, { id: 'b', label: 'Rating', value: 0 }] }));
    expect(markup).toContain('99.9%');
    expect(markup).toContain('>0<');
    expect(markup).not.toContain('data-missing');
  });
  it('labels a missing value in text instead of leaving a gap', () => {
    const markup = html(h(StatStrip, { items: [{ id: 'a', label: 'Regions' }, { id: 'b', label: 'Teams', value: '' }] }));
    expect(markup.match(/Not provided/g)).toHaveLength(2);
    expect(markup.match(/data-missing="true"/g)).toHaveLength(2);
    expect(html(h(StatStrip, { items: [{ id: 'a', label: 'Regions' }], missingLabel: 'Pending' }))).toContain('Pending');
  });
  it('renders nothing for no items', () => { expect(html(h(StatStrip, { items: [] }))).toBe(''); });
});

describe('SYX-048 CtaPanel', () => {
  const action = h('button', { type: 'button' }, 'Start');
  it('is a Card with a heading, description and exactly the supplied action', () => {
    const markup = html(h(CtaPanel, { heading: 'Ready?', description: 'Go on.', action }));
    expect(markup).toMatch(/<h2[^>]*>Ready\?<\/h2>/);
    expect(markup).toContain('Go on.');
    expect(markup.match(/<button/g)).toHaveLength(1);
    expect(markup).toContain('data-surface');
  });
  it('keeps the texture off unless asked, and follows the chosen heading level', () => {
    expect(html(h(CtaPanel, { heading: 'Ready?', action }))).not.toContain('data-texture');
    expect(html(h(CtaPanel, { heading: 'Ready?', action, texture: true }))).toContain('data-texture="true"');
    expect(html(h(CtaPanel, { heading: 'Ready?', action, level: 3 }))).toMatch(/<h3[^>]*>Ready\?<\/h3>/);
  });
});

describe('X5 section contracts', () => {
  const ids = ['share-buttons', 'footer', 'section-head', 'stat-strip', 'cta-panel'];
  it('registers each with a recommended example that imports it', () => {
    for (const id of ids) {
      expect(get(id), id).toBeDefined();
      const recommended = registry.examples.filter(example => example.intent === 'recommended' && example.componentIds.includes(id));
      expect(recommended.length, id).toBeGreaterThan(0);
      expect(recommended[0].code).toContain(`@/components/ui/${id}`);
    }
  });
  it('marks as interactive only sections that render a link or button of their own', () => {
    for (const id of ids) {
      expect(get(id).interactive, id).toBe(id !== 'stat-strip');
      expect(get(id).accessibility.keyboard.length > 0, id).toBe(id !== 'stat-strip');
    }
    const rule = registry.rules.find(item => item.id === 'wcag-focus-visible')!.appliesTo;
    for (const id of ids.filter(item => item !== 'stat-strip')) expect(rule, id).toContain(id);
    expect(rule).not.toContain('stat-strip');
  });
  it('keeps the planned defaults', () => {
    expect(prop('share-buttons', 'size').defaultValue).toBe('medium');
    expect(prop('share-buttons', 'attribution').defaultValue).toBe(true);
    expect(prop('share-buttons', 'copyLink').defaultValue).toBe(true);
    expect(prop('section-head', 'level').defaultValue).toBe(2);
    expect(prop('section-head', 'viewAllHref').defaultValue).toBeUndefined();
    expect(prop('cta-panel', 'texture').defaultValue).toBe(false);
    expect(prop('stat-strip', 'missingLabel').defaultValue).toBe('Not provided');
  });
  it('does not let a theme default change a section beyond control size', () => {
    expect(get('share-buttons').themeDefaults).toEqual({ size: ['medium', 'small', 'large'] });
    for (const id of ['footer', 'section-head', 'stat-strip', 'cta-panel']) expect(get(id).themeDefaults, id).toEqual({});
  });
});

describe('SYX-036 Navbar', () => {
  const groups = [{ id: 'main', links: [{ label: 'Components', href: '/components' }, { label: 'Docs', href: '/docs' }] }, { id: 'empty', links: [] }, { id: 'more', label: 'More', links: [{ label: 'Publisher', href: 'https://example.com', external: true }] }];
  it('renders one named navigation in a header, marks the current page and skips empty groups', () => {
    const out = html(h(Navbar, { label: 'Primary', groups, currentHref: '/docs' }));
    expect(out).toMatch(/^<header/);
    expect(out.match(/<nav /g)).toHaveLength(1);
    expect(out).toContain('aria-label="Primary"');
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(out.match(/<ul /g)).toHaveLength(2);
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('(opens in a new tab)');
  });
  it('starts with the menu closed, collapsed and controlled, unless asked to open', () => {
    const closed = html(h(Navbar, { groups }));
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).not.toContain('data-open');
    expect(html(h(Navbar, { groups, defaultMenuOpen: true }))).toContain('aria-expanded="true"');
  });
  it('is sticky by default, never marked scrolled on the server, and can be inline', () => {
    expect(html(h(Navbar, { groups }))).toContain('data-sticky="true"');
    expect(html(h(Navbar, { groups }))).not.toContain('data-scrolled');
    expect(html(h(Navbar, { groups, sticky: false }))).not.toContain('data-sticky');
  });
});

describe('SYX-038 Hero', () => {
  it('puts text first, then actions, then media, and writes no copy of its own', () => {
    const out = html(h(Hero, { heading: 'Build', lead: 'Lead text', actions: h('a', { href: '/x' }, 'Go'), media: h('div', null, 'media') }));
    expect(out).toMatch(/<h1[^>]*>Build<\/h1>/);
    expect(out.indexOf('Build')).toBeLessThan(out.indexOf('Lead text'));
    expect(out.indexOf('Lead text')).toBeLessThan(out.indexOf('Go'));
    expect(out.indexOf('Go')).toBeLessThan(out.indexOf('media'));
    expect(html(h(Hero, { heading: 'Only' })).replace(/<[^>]+>/g, '')).toBe('Only');
  });
  it('splits only when media is supplied and not forced centered, and honors the level', () => {
    const media = h('div', null, 'm');
    expect(html(h(Hero, { heading: 'A', media }))).toContain('data-layout="split"');
    expect(html(h(Hero, { heading: 'A' }))).toContain('data-layout="centered"');
    expect(html(h(Hero, { heading: 'A', layout: 'split' }))).toContain('data-layout="centered"');
    expect(html(h(Hero, { heading: 'A', media, layout: 'centered' }))).toContain('data-layout="centered"');
    expect(html(h(Hero, { heading: 'A', level: 2 }))).toMatch(/<h2/);
  });
});

describe('SYX-045 FeatureBento', () => {
  const items = Array.from({ length: 8 }, (_, index) => ({ id: `f${index}`, title: `Feature ${index}` }));
  it('keeps the supplied order, one heading per cell at the chosen level', () => {
    const out = html(h(FeatureBento, { items, level: 4 }));
    expect(out.match(/<h4/g)).toHaveLength(8);
    expect(out.indexOf('Feature 0')).toBeLessThan(out.indexOf('Feature 7'));
  });
  it('marks three-over-four rows by position in each run of seven', () => {
    const rows = [...html(h(FeatureBento, { items, layout: 'three-over-four' })).matchAll(/data-row="(\w+)"/g)].map(match => match[1]);
    expect(rows).toEqual(['top', 'top', 'top', 'bottom', 'bottom', 'bottom', 'bottom', 'top']);
    expect(html(h(FeatureBento, { items }))).not.toContain('data-row');
  });
  it('shows a badge and a link only when supplied, and names the link by its feature', () => {
    const out = html(h(FeatureBento, { items: [{ id: 'a', title: 'Alpha', badge: 'New', href: '/a' }, { id: 'b', title: 'Beta' }] }));
    expect(out).toContain('New');
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain('Learn more');
    expect(out).toContain(' about Alpha');
    expect(html(h(FeatureBento, { items: [] }))).toBe('');
  });
});

describe('SYX-046 Testimonials', () => {
  const captions = { src: '/c.vtt', srclang: 'en' };
  const items = [
    { kind: 'review', id: 'r', quote: 'Setup was quick.', author: { name: 'Priya Nair', role: 'Lead' }, source: 'Survey' },
    { kind: 'story', id: 's', src: '/s.webm', title: 'Adoption', author: { name: 'Sam Okoye' }, captions },
  ];
  it('renders only supplied words, with the author beside each quote', () => {
    const out = html(h(Testimonials, { items }));
    expect(out).toContain('Setup was quick.');
    expect(out).toContain('Priya Nair');
    expect(out).toContain('Survey');
    expect(out).toContain('>PN<');
    expect(out).not.toMatch(/stars?|rating|verified/i);
  });
  it('renders a paused video with controls and default captions, and never autoplays', () => {
    const out = html(h(Testimonials, { items }));
    expect(out).toMatch(/<video[^>]*controls/);
    expect(out).not.toMatch(/autoplay|loop|muted/i);
    expect(out).toMatch(/<track[^>]*kind="captions"[^>]*default/);
  });
  it('renders nothing for an empty list', () => { expect(html(h(Testimonials, { items: [] }))).toBe(''); });
});

describe('SYX-049 AppBadges', () => {
  const badges = [{ id: 'ios', store: 'app-store', href: 'https://example.com/ios', src: '/b.svg' }, { id: 'play', store: 'google-play', href: 'https://example.com/play', src: '/b.svg' }];
  it('links only the supplied stores, named by store, with decorative images', () => {
    const out = html(h(AppBadges, { badges: badges.slice(0, 1) }));
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toContain('aria-label="Download on the App Store"');
    expect(out).toContain('href="https://example.com/ios"');
    expect(out).toContain('alt=""');
    expect(out).not.toContain('Google Play');
    expect(html(h(AppBadges, { badges }))).toContain('aria-label="Get it on Google Play"');
  });
  it('lets a label override the name, defaults to medium, and renders nothing when empty', () => {
    expect(html(h(AppBadges, { badges: [{ ...badges[0], label: 'Get the iPhone app' }] }))).toContain('aria-label="Get the iPhone app"');
    expect(html(h(AppBadges, { badges }))).toContain('data-size="medium"');
    expect(html(h(AppBadges, { badges: [] }))).toBe('');
  });
});

describe('SYX-050 Instructor', () => {
  it('shows the name as a heading and leaves out every part that is not supplied', () => {
    const out = html(h(Instructor, { name: 'Maya Chen' }));
    expect(out).toMatch(/<h3[^>]*>Maya Chen<\/h3>/);
    expect(out).not.toMatch(/<img|<ul|<p/);
    expect(out).not.toContain('data-portrait');
  });
  it('renders portrait, role, bio and new-tab links when supplied, at the chosen level', () => {
    const out = html(h(Instructor, { name: 'Maya Chen', level: 2, role: 'Lead', bio: h('p', null, 'Teaches design.'), portrait: { src: '/p.svg', alt: 'Portrait of Maya' }, socials: [{ id: 'w', label: 'Website', href: 'https://example.com' }] }));
    expect(out).toMatch(/<h2/);
    expect(out).toContain('Lead');
    expect(out).toContain('Teaches design.');
    expect(out).toContain('Portrait of Maya');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('(opens in a new tab)');
  });
});

describe('X5 second batch contracts', () => {
  const second = ['navbar', 'hero', 'feature-bento', 'testimonials', 'app-badges', 'instructor'];
  it('registers each with a recommended example that imports it', () => {
    for (const id of second) {
      expect(get(id), id).toBeDefined();
      const recommended = registry.examples.filter(example => example.intent === 'recommended' && example.componentIds.includes(id));
      expect(recommended[0].code, id).toContain(`@/components/ui/${id}`);
    }
  });
  it('marks as interactive exactly the sections that render a control or link of their own', () => {
    for (const id of second) expect(get(id).interactive, id).toBe(id !== 'hero');
    const rule = registry.rules.find(item => item.id === 'wcag-focus-visible')!.appliesTo;
    for (const id of second.filter(item => item !== 'hero')) expect(rule, id).toContain(id);
  });
  it('keeps the planned defaults', () => {
    expect(prop('navbar', 'sticky').defaultValue).toBe(true);
    expect(prop('navbar', 'defaultMenuOpen').defaultValue).toBe(false);
    expect(prop('hero', 'level').defaultValue).toBe(1);
    expect(prop('hero', 'layout').defaultValue).toBe('auto');
    expect(prop('feature-bento', 'level').defaultValue).toBe(3);
    expect(prop('feature-bento', 'layout').defaultValue).toBe('grid');
    expect(prop('app-badges', 'size').defaultValue).toBe('medium');
    expect(prop('instructor', 'level').defaultValue).toBe(3);
  });
});
