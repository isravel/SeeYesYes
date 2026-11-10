import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navigation } from '@/components/ui/navigation';

describe('compact navigation', () => {
 it('keeps real destinations and accessible names in the icon rail', () => {
  const html = renderToStaticMarkup(createElement(Navigation, { label: 'Study', mainId: 'main', currentHref: '/learn', collapsed: true, groups: [{ label: 'Study', items: [{ label: 'Learn', href: '/learn', icon: createElement('svg') }] }] }));
  expect(html).toContain('data-collapsed="true"');
  expect(html).toContain('aria-label="Learn"');
  expect(html).toContain('title="Learn"');
  expect(html).toContain('aria-current="page"');
  expect(html).toContain('href="/learn"');
 });
});
