import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Disclosure } from '@/components/ui/disclosure';
import { Accordion } from '@/components/ui/accordion';
import { Pagination, paginationEntries } from '@/components/ui/pagination';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const attr = (markup: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(markup)?.[1];
const buttons = (markup: string) => markup.match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? [];
const items = [{ id: 'a', label: 'Shipping', content: 'Ships fast.' }, { id: 'b', label: 'Returns', content: 'Return in thirty days.' }, { id: 'c', label: 'Support', content: 'Write to us.', disabled: true }];

describe('SYX-032 Disclosure', () => {
  it('is a native button wired to its panel, collapsed by default, with the panel hidden', () => {
    const markup = html(h(Disclosure, { label: 'Details' }, h('p', null, 'More')));
    expect(markup).toContain('<button');
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-expanded="false"');
    expect(attr(markup, 'aria-controls')).toBe(/id="([^"]*-panel)"/.exec(markup)?.[1]);
    expect(markup).toMatch(/<div[^>]*hidden=""[^>]*>/);
  });
  it('shows the panel when open, for default and controlled use', () => {
    const open = html(h(Disclosure, { label: 'Details', defaultOpen: true }, 'More'));
    expect(open).toContain('aria-expanded="true"');
    expect(open).not.toContain('hidden=""');
    expect(html(h(Disclosure, { label: 'Details', open: true, defaultOpen: false, onOpenChange: () => undefined }, 'More'))).toContain('aria-expanded="true"');
    expect(html(h(Disclosure, { label: 'Details', open: false, defaultOpen: true, onOpenChange: () => undefined }, 'More'))).toContain('aria-expanded="false"');
  });
  it('puts the trigger in a heading and names the panel as a region only when a level is given', () => {
    const plain = html(h(Disclosure, { label: 'Details' }, 'More'));
    expect(plain).not.toMatch(/<h\d/);
    expect(plain).not.toContain('role="region"');
    const headed = html(h(Disclosure, { label: 'Details', headingLevel: 4, defaultOpen: true }, 'More'));
    expect(headed).toMatch(/<h4[^>]*><button/);
    expect(headed).toContain('role="region"');
    expect(attr(headed, 'aria-labelledby')).toBe(/id="([^"]*-trigger)"/.exec(headed)?.[1]);
  });
  it('disables the trigger', () => expect(html(h(Disclosure, { label: 'Details', disabled: true }, 'More'))).toContain('disabled=""'));
  it('keeps hover off by default and never renders pointer handlers as attributes', () => {
    expect(html(h(Disclosure, { label: 'Details' }, 'More'))).not.toMatch(/\son\w+=/i);
  });
});

describe('SYX-060 Accordion', () => {
  it('collapses every section by default, each trigger in a level-3 heading with its own region', () => {
    const markup = html(h(Accordion, { items }));
    expect(markup.match(/<h3/g)).toHaveLength(3);
    expect(markup.match(/aria-expanded="false"/g)).toHaveLength(3);
    expect(markup.match(/hidden=""/g)).toHaveLength(3);
  });
  it('opens the default section and uses the requested heading level', () => {
    const markup = html(h(Accordion, { items, defaultValue: ['b'], headingLevel: 2 }));
    expect(markup.match(/<h2/g)).toHaveLength(3);
    expect(markup.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(markup).toContain('Return in thirty days.');
  });
  it('allows only one open section in single mode, even if more are supplied', () => {
    expect(html(h(Accordion, { items, defaultValue: ['a', 'b'] })).match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html(h(Accordion, { items, mode: 'multiple', defaultValue: ['a', 'b'] })).match(/aria-expanded="true"/g)).toHaveLength(2);
  });
  it('follows a controlled value over the default and ignores unknown ids', () => {
    const markup = html(h(Accordion, { items, value: ['a'], defaultValue: ['b'], onChange: () => undefined }));
    expect(markup.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html(h(Accordion, { items, value: ['missing'], onChange: () => undefined }))).not.toContain('aria-expanded="true"');
  });
  it('disables an item and renders no sections for an empty list', () => {
    expect(html(h(Accordion, { items })).match(/disabled=""/g)).toHaveLength(1);
    expect(html(h(Accordion, { items: [] }))).not.toContain('<button');
  });
});

describe('SYX-062 Pagination', () => {
  it('lists every page when there are few, and the first and last with ellipses when there are many', () => {
    expect(paginationEntries(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationEntries(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationEntries(1, 12)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 12]);
    expect(paginationEntries(6, 12)).toEqual([1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 12]);
    expect(paginationEntries(12, 12)).toEqual([1, 'start-ellipsis', 8, 9, 10, 11, 12]);
    expect(paginationEntries(3, 12)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 12]);
    expect(paginationEntries(10, 12)).toEqual([1, 'start-ellipsis', 8, 9, 10, 11, 12]);
  });
  it('keeps the same number of entries at every position, so the controls do not jump', () => {
    const lengths = new Set(Array.from({ length: 20 }, (_, index) => paginationEntries(index + 1, 20).length));
    expect(lengths.size).toBe(1);
    expect(paginationEntries(5, 20, 2)).toEqual([1, 'start-ellipsis', 3, 4, 5, 6, 7, 'end-ellipsis', 20]);
    expect(new Set(Array.from({ length: 20 }, (_, index) => paginationEntries(index + 1, 20, 2).length)).size).toBe(1);
  });
  it('never repeats a page and handles a single page, zero siblings and a negative count', () => {
    expect(paginationEntries(1, 1)).toEqual([1]);
    expect(paginationEntries(1, 0)).toEqual([]);
    expect(paginationEntries(1, -4)).toEqual([]);
    for (let page = 1; page <= 30; page += 1) {
      const pages = paginationEntries(page, 30, 0).filter(entry => typeof entry === 'number');
      expect(new Set(pages).size).toBe(pages.length);
      expect(pages).toContain(1);
      expect(pages).toContain(30);
    }
  });
  it('is a named navigation of buttons, marks the current page and disables Previous on the first page', () => {
    const markup = html(h(Pagination, { pageCount: 12, label: 'Results', defaultPage: 1 }));
    expect(markup).toContain('<nav');
    expect(markup).toContain('aria-label="Results"');
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
    expect(buttons(markup).find(button => button.includes('aria-current="page"'))).toContain('aria-label="Page 1"');
    expect(buttons(markup).filter(button => button.includes('disabled=""'))).toHaveLength(1);
    expect(buttons(markup).find(button => button.includes('disabled=""'))).toContain('Previous');
    expect(markup).toContain('aria-label="Page 2"');
  });
  it('disables Next on the last page and hides ellipses from assistive technology', () => {
    const markup = html(h(Pagination, { pageCount: 12, defaultPage: 12 }));
    expect(buttons(markup).filter(button => button.includes('disabled=""'))).toHaveLength(1);
    expect(buttons(markup).find(button => button.includes('disabled=""'))).toContain('Next');
    expect(markup).toMatch(/<li[^>]*aria-hidden="true"[^>]*>…<\/li>/);
    expect(buttons(markup).some(button => button.includes('…'))).toBe(false);
  });
  it('leaves both ends enabled in the middle', () => {
    expect(buttons(html(h(Pagination, { pageCount: 12, defaultPage: 6 }))).some(button => button.includes('disabled=""'))).toBe(false);
  });
  it('renders real links when getHref is given, with a disabled end as plain text', () => {
    const markup = html(h(Pagination, { pageCount: 3, defaultPage: 1, getHref: (page: number) => `/list?page=${page}` }));
    expect(markup).toContain('href="/list?page=2"');
    expect(markup).toContain('href="/list?page=3"');
    expect(markup).not.toContain('<button');
    expect(markup).toContain('data-disabled="true"');
  });
  it('clamps the page into range, honors a controlled page and renders nothing without pages', () => {
    expect(html(h(Pagination, { pageCount: 5, page: 99, onPageChange: () => undefined })).match(/aria-current="page"/g)).toHaveLength(1);
    expect(html(h(Pagination, { pageCount: 5, page: 99, onPageChange: () => undefined }))).toMatch(/aria-label="Page 5"[^>]*aria-current="page"|aria-current="page"[^>]*aria-label="Page 5"/);
    expect(html(h(Pagination, { pageCount: 5, page: 0, onPageChange: () => undefined }))).toMatch(/aria-label="Page 1"[^>]*aria-current="page"|aria-current="page"[^>]*aria-label="Page 1"/);
    expect(html(h(Pagination, { pageCount: 0 }))).toBe('');
    expect(html(h(Pagination, { pageCount: Number.NaN }))).toBe('');
  });
  it('supports every size and names pages from the caller', () => {
    for (const size of ['small', 'medium', 'large']) expect(attr(html(h(Pagination, { pageCount: 3, size })), 'data-size')).toBe(size);
    expect(attr(html(h(Pagination, { pageCount: 3 })), 'data-size')).toBe('medium');
    expect(html(h(Pagination, { pageCount: 3, pageLabel: (page: number) => `Go to page ${page}` }))).toContain('aria-label="Go to page 2"');
  });
});

describe('SYX-063 Breadcrumbs', () => {
  const trail = [{ label: 'Components', href: '/components' }, { label: 'Navigation', href: '/components?category=navigation' }, { label: 'Breadcrumbs', href: '/components/breadcrumbs' }];
  it('is a named navigation with an ordered list, links for ancestors and a plain current page', () => {
    const markup = html(h(Breadcrumbs, { items: trail }));
    expect(markup).toContain('<nav');
    expect(markup).toContain('aria-label="Breadcrumbs"');
    expect(markup).toContain('<ol');
    expect(markup.match(/<a /g)).toHaveLength(2);
    expect(markup).toMatch(/<span[^>]*aria-current="page"[^>]*>Breadcrumbs<\/span>/);
    expect(markup).not.toContain('href="/components/breadcrumbs"');
  });
  it('hides separators from assistive technology and supports both glyphs', () => {
    expect(html(h(Breadcrumbs, { items: trail })).match(/aria-hidden="true">\/</g)).toHaveLength(2);
    expect(html(h(Breadcrumbs, { items: trail, separator: 'chevron' })).match(/aria-hidden="true">›</g)).toHaveLength(2);
  });
  it('uses a caller label, shows a single item as the current page, and renders nothing when empty', () => {
    expect(html(h(Breadcrumbs, { items: trail, label: 'You are here' }))).toContain('aria-label="You are here"');
    const single = html(h(Breadcrumbs, { items: [trail[0]] }));
    expect(single).not.toContain('<a ');
    expect(single).toContain('aria-current="page"');
    expect(single).not.toContain('aria-hidden="true">/');
    expect(html(h(Breadcrumbs, { items: [] }))).toBe('');
  });
  it('keeps hash and API destinations as plain anchors', () => {
    const markup = html(h(Breadcrumbs, { items: [{ label: 'Spec', href: '#spec' }, { label: 'Registry', href: '/api/registry' }, { label: 'Here', href: '#here' }] }));
    expect(markup).toContain('href="#spec"');
    expect(markup).toContain('href="/api/registry"');
  });
});

describe('X3 composition contracts', () => {
  const ids = ['disclosure', 'accordion', 'pagination', 'breadcrumbs'];
  it('registers each as interactive with keyboard behavior, the focus rule and a recommended example', () => {
    const focus = registry.rules.find(rule => rule.id === 'wcag-focus-visible')!;
    for (const id of ids) {
      const component = registry.components.find(item => item.id === id)!;
      expect(component, id).toBeDefined();
      expect(component.interactive, id).toBe(true);
      expect(component.accessibility.keyboard.length, id).toBeGreaterThan(0);
      expect(component.accessibility.status, id).toBe('not-reviewed');
      expect(focus.appliesTo, id).toContain(id);
      expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes(id)), id).toBe(true);
    }
  });
  it('documents the planned defaults', () => {
    const get = (id: string) => registry.components.find(item => item.id === id)!;
    const def = (id: string, name: string) => get(id).props.find(prop => prop.name === name)!.defaultValue;
    expect(def('accordion', 'mode')).toBe('single');
    expect(def('accordion', 'collapsible')).toBe(true);
    expect(def('accordion', 'headingLevel')).toBe(3);
    expect(def('pagination', 'size')).toBe('medium');
    expect(def('pagination', 'defaultPage')).toBe(1);
    expect(def('disclosure', 'openOnHover')).toBe(false);
    expect(def('breadcrumbs', 'separator')).toBe('slash');
  });
});
