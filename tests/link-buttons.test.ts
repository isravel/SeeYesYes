import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from '@/components/ui/link';

describe('button-style navigation links', () => {
  it('keeps navigation as a real anchor with the shared button variant', () => {
    const html = renderToStaticMarkup(createElement(Link, { href: '/docs', variant: 'button-primary', children: 'Read in the app' }));
    expect(html).toContain('<a ');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('data-variant="primary"');
    expect(html).not.toContain('<button');
    expect(html).not.toContain('role="button"');
  });
  it('preserves external destination and new-tab safety attributes', () => {
    const html = renderToStaticMarkup(createElement(Link, { href: 'https://example.com', variant: 'button-secondary', target: '_blank', rel: 'noopener noreferrer', children: 'Publisher' }));
    expect(html).toContain('data-variant="secondary"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
