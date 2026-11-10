import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs } from '@/components/ui/tabs';
import { Table } from '@/components/ui/table';
import { FormField } from '@/components/ui/form-field';
import { Fieldset } from '@/components/ui/fieldset';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { fitHeight, maxHeightForRows } from '@/lib/utils/auto-grow';
import { registry } from '@/lib/data/registry';
import { normalizeMenuItems } from '@/components/ui/dropdown-menu';

// Components declare `children` as a prop, which `createElement`'s variadic children argument does not satisfy in types.
const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const attr = (markup: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(markup)?.[1];

describe('SYX-006 Button', () => {
  it('maps the familiar aliases to the existing variants and keeps the others', () => {
    expect(attr(html(h(Button, { variant: 'solid' }, 'Go')), 'data-variant')).toBe('primary');
    expect(attr(html(h(Button, { variant: 'danger' }, 'Delete')), 'data-variant')).toBe('destructive');
    for (const variant of ['primary', 'secondary', 'ghost', 'destructive', 'outline', 'soft', 'muted'] as const)
      expect(attr(html(h(Button, { variant }, 'Go')), 'data-variant')).toBe(variant);
  });
  it('defaults to a medium, non-submitting primary button and exposes loading and disabled', () => {
    const plain = html(h(Button, null, 'Save'));
    expect(plain).toContain('type="button"');
    expect(attr(plain, 'data-variant')).toBe('primary');
    expect(attr(plain, 'data-size')).toBe('medium');
    expect(plain).not.toContain('aria-busy');
    const loading = html(h(Button, { loading: true }, 'Save'));
    expect(loading).toContain('disabled=""');
    expect(loading).toContain('aria-busy="true"');
    expect(html(h(Button, { disabled: true, variant: 'danger' }, 'Delete'))).toContain('disabled=""');
  });
  it('lets a caller choose submit', () => expect(html(h(Button, { type: 'submit' }, 'Send'))).toContain('type="submit"'));
});

describe('SYX-008 Card', () => {
  it('renders each surface variant with no click semantics', () => {
    for (const variant of ['default', 'outlined', 'elevated'] as const) {
      const markup = html(h(Card, { variant }, 'Body'));
      expect(attr(markup, 'data-variant')).toBe(variant);
      expect(markup).not.toContain('role=');
      expect(markup).not.toContain('tabindex');
    }
    expect(attr(html(h(Card, null, 'Body')), 'data-variant')).toBe('default');
  });
  it('reports the theme surface and marks only a card nested in glass', () => {
    const outer = html(h(Card, null, 'Outer'));
    expect(attr(outer, 'data-surface')).toBe('clean');
    expect(outer).not.toContain('data-nested');
    expect(html(h(Card, null, h(Card, null, 'Inner')))).not.toContain('data-nested');
  });
});

describe('SYX-010 Badge', () => {
  it('supports every tone with a text label and defaults to neutral', () => {
    expect(attr(html(h(Badge, null, 'New')), 'data-tone')).toBe('neutral');
    for (const tone of ['neutral', 'primary', 'success', 'warning', 'destructive'] as const)
      expect(attr(html(h(Badge, { tone }, 'Popular')), 'data-tone')).toBe(tone);
  });
  it('hides a decorative icon and keeps the meaning in text', () => {
    const markup = html(h(Badge, { icon: h('svg'), tone: 'warning' }, '4.8 rating'));
    expect(markup).toMatch(/<span class="[^"]*" aria-hidden="true"><svg>/);
    expect(markup).toContain('4.8 rating');
    expect(markup).not.toContain('role=');
  });
  it('keeps a long label as plain text', () => expect(html(h(Badge, null, 'A very long label '.repeat(5)))).toContain('A very long label'));
});

describe('SYX-013 Input and SYX-015 Select', () => {
  it('uses the shared size scale, defaulting to medium text', () => {
    expect(attr(html(h(Input, { 'aria-label': 'Query' })), 'data-size')).toBe('medium');
    expect(attr(html(h(Input, { 'aria-label': 'Query' })), 'type')).toBe('text');
    for (const size of ['small', 'medium', 'large'] as const) {
      expect(attr(html(h(Input, { size, 'aria-label': 'Query' })), 'data-size')).toBe(size);
      expect(attr(html(h(Select, { size, 'aria-label': 'Sort' }, h('option', { value: 'a' }, 'A'))), 'data-size')).toBe(size);
    }
  });
  it('passes read-only, required, disabled and invalid state through natively', () => {
    const markup = html(h(Input, { 'aria-label': 'Query', readOnly: true, required: true, disabled: true, 'aria-invalid': true, defaultValue: 'x' }));
    for (const token of ['readOnly=""', 'required=""', 'disabled=""', 'aria-invalid="true"']) expect(markup).toContain(token);
    const select = html(h(Select, { 'aria-label': 'Sort', required: true, 'aria-invalid': true, defaultValue: '' }, h('option', { value: '', disabled: true }, 'Choose'), h('option', { value: 'a' }, 'A')));
    expect(select).toContain('<select');
    expect(select).toContain('required=""');
    expect(select).toContain('aria-invalid="true"');
  });
  it('keeps native selection: no invented value and a real option list', () => {
    const select = html(h(Select, { 'aria-label': 'Sort' }, h('option', { value: 'a' }, 'A'), h('option', { value: 'b' }, 'B')));
    expect((select.match(/<option/g) ?? []).length).toBe(2);
    expect(select).not.toContain('role=');
  });
});

describe('SYX-022 Avatar', () => {
  it('shows initials as a named image when no source is given', () => {
    const markup = html(h(Avatar, { initials: 'AB', alt: 'Ada B' }));
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Ada B"');
    expect(markup).toContain('<span aria-hidden="true">AB</span>');
    expect(attr(markup, 'data-size')).toBe('medium');
    expect(markup).not.toContain('data-ring');
  });
  it('uses the image with an empty alt so the label is not read twice, and supports the ring', () => {
    const markup = html(h(Avatar, { initials: 'AB', alt: 'Ada B', src: '/a.png', ring: true, size: 'large' }));
    expect(markup).toContain('<img');
    expect(markup).toContain('alt=""');
    expect(markup).toContain('data-ring="true"');
    expect(attr(markup, 'data-size')).toBe('large');
  });
  it('is decorative when no alternative text is given', () => expect(html(h(Avatar, { initials: 'AB', alt: '' }))).not.toContain('role='));
});

describe('SYX-023 Switch and SYX-024 Checkbox', () => {
  it('keeps the switch role, label and neutral tone', () => {
    const markup = html(h(Switch, { label: 'Notifications', tone: 'neutral' }));
    expect(markup).toContain('role="switch"');
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('Notifications');
    expect(markup).toContain('data-tone="neutral"');
    expect(attr(html(h(Switch, { label: 'X' })), 'data-tone')).toBe('primary');
  });
  it('wraps the switch input in its label', () => expect(html(h(Switch, { label: 'Notifications' }))).toMatch(/^<label[^>]*><input[^>]*role="switch"/));
  it('passes required, invalid, checked and disabled through on both', () => {
    const sw = html(h(Switch, { label: 'X', required: true, 'aria-invalid': true, defaultChecked: true, disabled: true }));
    const box = html(h(Checkbox, { 'aria-label': 'X', required: true, 'aria-invalid': true, defaultChecked: true, disabled: true }));
    for (const markup of [sw, box]) for (const token of ['required=""', 'aria-invalid="true"', 'checked=""', 'disabled=""']) expect(markup).toContain(token);
  });
  it('is a native checkbox with sizes and a neutral tone', () => {
    for (const size of ['small', 'medium', 'large'] as const) expect(attr(html(h(Checkbox, { size, 'aria-label': 'X' })), 'data-size')).toBe(size);
    const markup = html(h(Checkbox, { tone: 'neutral', 'aria-label': 'X' }));
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('data-tone="neutral"');
  });
});

describe('SYX-059 Tabs', () => {
  const items = [{ id: 'a', label: 'Overview', content: 'Overview body' }, { id: 'b', label: 'Details', content: 'Details body', disabled: true }, { id: 'c', label: 'More', content: 'More body' }];
  it('keeps boxed as the default (the only style before X2), horizontal, first enabled tab selected', () => {
    const markup = html(h(Tabs, { label: 'Sections', items }));
    expect(attr(markup, 'data-variant')).toBe('boxed');
    expect(attr(html(h(Tabs, { label: 'Sections', items, variant: 'line' })), 'data-variant')).toBe('line');
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Sections"');
    expect(markup).toContain('aria-orientation="horizontal"');
    expect(markup).toContain('Overview body');
    expect(markup).not.toContain('Details body');
  });
  it('supports boxed and vertical, and an explicit selection', () => {
    const markup = html(h(Tabs, { label: 'Sections', items, variant: 'boxed', orientation: 'vertical', defaultSelectedId: 'c' }));
    expect(attr(markup, 'data-variant')).toBe('boxed');
    expect(markup).toContain('aria-orientation="vertical"');
    expect(markup).toContain('More body');
    expect(markup).not.toContain('Overview body');
  });
  it('connects tabs to panels and marks the disabled tab', () => {
    const markup = html(h(Tabs, { label: 'Sections', items }));
    expect(markup).toContain('role="tab"');
    expect(markup).toContain('role="tabpanel"');
    expect(markup).toContain('aria-controls=');
    expect(markup).toContain('aria-disabled="true"');
  });
});

describe('SYX-061 Table', () => {
  const columns = [{ id: 'name', label: 'Name', rowHeader: true }, { id: 'qty', label: 'Quantity' }];
  const rows = [{ id: '1', cells: { name: 'Apples', qty: '3' } }];
  it('keeps semantic headers, a caption and a focusable, named scroll region', () => {
    const markup = html(h(Table, { caption: 'Stock', columns, rows }));
    expect(markup).toContain('<caption>Stock</caption>');
    expect(markup).toContain('scope="col"');
    expect(markup).toContain('scope="row"');
    expect(markup).toContain('role="region"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('aria-label="Stock table"');
  });
  it('offers a muted or plain header and an optional row hover, with a muted header by default', () => {
    expect(attr(html(h(Table, { caption: 'Stock', columns, rows })), 'data-header')).toBe('muted');
    expect(html(h(Table, { caption: 'Stock', columns, rows }))).not.toContain('data-row-hover');
    const markup = html(h(Table, { caption: 'Stock', columns, rows, header: 'plain', rowHover: true }));
    expect(attr(markup, 'data-header')).toBe('plain');
    expect(markup).toContain('data-row-hover="true"');
  });
  it('shows the empty message across every column and never sorts', () => {
    const markup = html(h(Table, { caption: 'Stock', columns, rows: [] }));
    expect(markup).toContain('No rows to show.');
    expect(markup).toContain('colSpan="2"');
    const unsorted = html(h(Table, { caption: 'Stock', columns, rows: [{ id: 'z', cells: { name: 'Zed', qty: '1' } }, { id: 'a', cells: { name: 'Abe', qty: '2' } }] }));
    expect(unsorted.indexOf('Zed')).toBeLessThan(unsorted.indexOf('Abe'));
    expect(html(h(Table, { caption: 'Stock', columns, rows: [], emptyMessage: 'Nothing yet.' }))).toContain('Nothing yet.');
  });
});

describe('SYX-067 Field, Fieldset and Legend', () => {
  it('wires the label, hint and error to a native control', () => {
    const markup = html(h(FormField, { id: 'email', label: 'Email', helpText: 'Work address', error: 'Required', required: true }, h(Input)));
    expect(markup).toContain('for="email"');
    expect(markup).toContain('id="email"');
    expect(markup).toContain('aria-describedby="email-help email-error"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('id="email-help"');
    expect(markup).toContain('id="email-error"');
    expect(markup).toContain('required=""');
  });
  it('adds no description or invalid state when there is no hint or error', () => {
    const markup = html(h(FormField, { id: 'plain', label: 'Name' }, h(Input)));
    expect(markup).not.toContain('aria-describedby');
    expect(markup).not.toContain('aria-invalid');
    expect(markup).not.toContain('required');
  });
  it('keeps a control description the caller supplied', () => {
    expect(html(h(FormField, { id: 'f', label: 'Name', helpText: 'Hint' }, h(Input, { 'aria-describedby': 'extra' })))).toContain('aria-describedby="f-help extra"');
  });
  it('places the field props on one element of a composite control', () => {
    const markup = html(h(FormField, { id: 'when', label: 'When', error: 'Pick a date' }, (control: Record<string, unknown>) => h('div', { role: 'group' }, h('input', { ...control, type: 'text' }), h('button', { type: 'button' }, 'Open'))));
    expect(markup.match(/id="when"/g)).toHaveLength(1);
    expect(markup).toContain('aria-describedby="when-error"');
  });
  it('rejects a child that is not a control element', () => {
    expect(() => html(h(FormField, { id: 'x', label: 'X' }, 'text' as unknown as ReactElement))).toThrow(/native form control/);
  });
  it('names a group with a native fieldset and legend and wires hint and error', () => {
    const markup = html(h(Fieldset, { legend: 'Contact', helpText: 'How we reach you', error: 'Choose one', required: true, id: 'contact' }, h(Input, { 'aria-label': 'Phone' })));
    expect(markup).toMatch(/^<fieldset/);
    expect(markup).toContain('<legend');
    expect(markup).toContain('Contact');
    expect(markup).toContain('(required)');
    expect(markup).toContain('aria-describedby="contact-help contact-error"');
    expect(markup).toContain('data-invalid="true"');
  });
  it('disables descendants through the native fieldset attribute', () => {
    expect(html(h(Fieldset, { legend: 'Group', disabled: true }, h(Input, { 'aria-label': 'A' })))).toContain('disabled=""');
    expect(html(h(Fieldset, { legend: 'Group' }, h(Input, { 'aria-label': 'A' })))).not.toContain('data-invalid');
  });
});

describe('SYX-068 Textarea', () => {
  it('defaults to three rows, medium, fixed height with native resizing', () => {
    const markup = html(h(Textarea, { 'aria-label': 'Notes' }));
    expect(markup).toContain('rows="3"');
    expect(attr(markup, 'data-size')).toBe('medium');
    expect(markup).not.toContain('data-auto-grow');
  });
  it('marks auto-grow and honors an explicit row count and size', () => {
    const markup = html(h(Textarea, { 'aria-label': 'Notes', autoGrow: true, rows: 5, size: 'large' }));
    expect(markup).toContain('data-auto-grow="true"');
    expect(markup).toContain('rows="5"');
    expect(attr(markup, 'data-size')).toBe('large');
  });
  it('passes read-only, required, invalid and disabled state through', () => {
    const markup = html(h(Textarea, { 'aria-label': 'Notes', readOnly: true, required: true, 'aria-invalid': true, disabled: true }));
    for (const token of ['readOnly=""', 'required=""', 'aria-invalid="true"', 'disabled=""']) expect(markup).toContain(token);
  });
  const metrics = { lineHeight: 20, fontSize: 16, paddingY: 16, border: 2 };
  it('computes bounds from the row limit, falling back to the font size when line height is not a number', () => {
    expect(maxHeightForRows(6, metrics)).toBe(6 * 20 + 16 + 2);
    expect(maxHeightForRows(6, { ...metrics, lineHeight: Number.NaN })).toBeGreaterThan(6 * 16);
  });
  it('grows to the content, stops at the maximum and scrolls beyond it', () => {
    expect(fitHeight({ needed: 60, natural: 60, floor: 0, max: 140 })).toEqual({ height: 60, scrolls: false });
    expect(fitHeight({ needed: 300, natural: 60, floor: 0, max: 140 })).toEqual({ height: 140, scrolls: true });
  });
  it('never shrinks below a height the reader dragged to; a drag beyond the maximum is kept', () => {
    expect(fitHeight({ needed: 60, natural: 60, floor: 100, max: 140 }).height).toBe(100);
    expect(fitHeight({ needed: 60, natural: 60, floor: 200, max: 140 }).height).toBe(200);
    expect(fitHeight({ needed: 300, natural: 60, floor: 100, max: 140 })).toEqual({ height: 140, scrolls: true });
  });
});

describe('SYX-069 Radio group', () => {
  const options = [{ value: 'a', label: 'Email', hint: 'Fastest' }, { value: 'b', label: 'Post', error: 'Not available here', disabled: true }, { value: 'c', label: 'Phone' }];
  it('has no implicit selection and is a named fieldset', () => {
    const markup = html(h(RadioGroup, { name: 'channel', label: 'Channel', options }));
    expect(markup).toMatch(/^<fieldset/);
    expect(markup).toContain('<legend');
    expect(markup).not.toMatch(/checked=""/);
    expect(attr(markup, 'data-orientation')).toBe('vertical');
    expect((markup.match(/type="radio"/g) ?? []).length).toBe(3);
    expect(markup).not.toContain('aria-required');
  });
  it('honors a controlled value or a default value, and the controlled value wins', () => {
    expect(html(h(RadioGroup, { name: 'c', label: 'C', options, defaultValue: 'c' }))).toMatch(/value="c"[^>]*checked=""|checked=""[^>]*value="c"/);
    const controlled = html(h(RadioGroup, { name: 'c', label: 'C', options, value: 'a', defaultValue: 'c', onChange: () => undefined }));
    expect(controlled).toMatch(/value="a"[^>]*checked=""|checked=""[^>]*value="a"/);
    expect(controlled.match(/checked=""/g)).toHaveLength(1);
  });
  it('describes an option by its own hint and error as well as the group messages', () => {
    const markup = html(h(RadioGroup, { name: 'c', label: 'C', options, id: 'g', helpText: 'Pick one', error: 'Required' }));
    expect(markup).toContain('id="g-0-hint"');
    expect(markup).toContain('aria-describedby="g-help g-error g-0-hint"');
    expect(markup).toContain('id="g-1-error"');
    expect(markup).toContain('aria-describedby="g-help g-error g-1-error"');
    expect(markup).toContain('aria-invalid="true"');
  });
  it('supports horizontal layout, required and a disabled option', () => {
    const markup = html(h(RadioGroup, { name: 'c', label: 'C', options, orientation: 'horizontal', required: true }));
    expect(attr(markup, 'data-orientation')).toBe('horizontal');
    expect(markup).toContain('aria-required="true"');
    expect(markup).toContain('disabled=""');
  });
});

describe('SYX-073 Alert', () => {
  it('maps tones to live-region roles so urgency is not just color', () => {
    expect(html(h(Alert, { tone: 'info' }, 'Saved'))).toContain('role="status"');
    expect(html(h(Alert, { tone: 'success' }, 'Saved'))).toContain('role="status"');
    expect(html(h(Alert, { tone: 'warning' }, 'Careful'))).toContain('role="alert"');
    expect(html(h(Alert, { tone: 'destructive' }, 'Failed'))).toContain('role="alert"');
  });
  it('supports solid, outline and text for every tone and defaults to info', () => {
    expect(attr(html(h(Alert, null, 'Hello')), 'data-tone')).toBe('info');
    for (const tone of ['info', 'success', 'warning', 'destructive'] as const) for (const variant of ['solid', 'outline', 'text'] as const) {
      const markup = html(h(Alert, { tone, variant }, 'Message'));
      expect(markup).toContain(`data-tone="${tone}"`);
      expect(markup).toContain(`data-variant="${variant}"`);
      expect(markup).toContain('Message');
      expect(markup).toContain('aria-hidden="true"');
    }
  });
  it('keeps an optional title and no dismiss control', () => {
    const markup = html(h(Alert, { title: 'Heads up' }, 'Body'));
    expect(markup).toContain('Heads up');
    expect(markup).not.toContain('<button');
  });
});

describe('SYX-074 Skeleton, SYX-075 Spinner, SYX-076 Progress, SYX-077 Separator', () => {
  it('Skeleton is a hidden decorative placeholder with three shapes and consumer dimensions', () => {
    expect(attr(html(h(Skeleton)), 'data-shape')).toBe('text');
    for (const shape of ['text', 'rect', 'circle'] as const) {
      const markup = html(h(Skeleton, { shape }));
      expect(attr(markup, 'data-shape')).toBe(shape);
      expect(markup).toContain('aria-hidden="true"');
    }
    expect(html(h(Skeleton, { width: '8rem', height: '2rem' }))).toContain('width:8rem;height:2rem');
  });
  it('Spinner offers three sizes, defaults to medium and stays hidden from announcement', () => {
    expect(attr(html(h(Spinner)), 'data-size')).toBe('medium');
    for (const size of ['small', 'medium', 'large'] as const) expect(attr(html(h(Spinner, { size })), 'data-size')).toBe(size);
    expect(html(h(Spinner))).toContain('aria-hidden="true"');
  });
  it('Progress is determinate with a value and indeterminate without', () => {
    const none = html(h(Progress, { label: 'Uploading' }));
    expect(none).toContain('<progress');
    expect(none).not.toMatch(/ value=/);
    expect(none).not.toContain('%');
    const partial = html(h(Progress, { label: 'Uploading', value: 40 }));
    expect(partial).toContain('value="40"');
    expect(partial).toContain('max="100"');
    expect(partial).toContain('40%');
    expect(partial).toContain('aria-label="Uploading"');
  });
  it('Progress covers 0, complete, clamping, a custom max and neutral tone', () => {
    expect(html(h(Progress, { label: 'L', value: 0 }))).toContain('value="0"');
    expect(html(h(Progress, { label: 'L', value: 100 }))).toContain('100%');
    expect(html(h(Progress, { label: 'L', value: 250 }))).toContain('value="100"');
    expect(html(h(Progress, { label: 'L', value: -5 }))).toContain('value="0"');
    const custom = html(h(Progress, { label: 'L', value: 5, max: 10 }));
    expect(custom).toContain('max="10"');
    expect(custom).toContain('50%');
    expect(html(h(Progress, { label: 'L', value: 5, max: 0 }))).toContain('max="100"');
    expect(attr(html(h(Progress, { label: 'L', tone: 'neutral' })), 'data-tone')).toBe('neutral');
    expect(attr(html(h(Progress, { label: 'L' })), 'data-tone')).toBe('primary');
    expect(html(h(Progress, { label: 'L', value: null }))).not.toMatch(/ value=/);
  });
  it('Separator is decorative and horizontal by default, and exposes structure when asked', () => {
    const plain = html(h(Separator));
    expect(plain).toMatch(/^<hr/);
    expect(plain).toContain('aria-hidden="true"');
    expect(plain).not.toContain('role=');
    const structural = html(h(Separator, { decorative: false }));
    expect(structural).toContain('role="separator"');
    expect(structural).toContain('aria-orientation="horizontal"');
    expect(structural).not.toContain('aria-hidden');
    const vertical = html(h(Separator, { orientation: 'vertical', decorative: false }));
    expect(vertical).toMatch(/^<span/);
    expect(vertical).toContain('aria-orientation="vertical"');
    expect(html(h(Separator, { orientation: 'vertical' }))).toContain('aria-hidden="true"');
  });
});

describe('X2 contracts', () => {
  const ids = ['button', 'card', 'badge', 'input', 'select', 'dialog', 'dropdown-menu', 'avatar', 'switch', 'checkbox', 'tabs', 'table', 'tooltip', 'form-field', 'fieldset', 'textarea', 'radio-group', 'alert', 'skeleton', 'spinner', 'progress', 'separator'];
  it('registers every X2 component with a contract and at least one example', () => {
    for (const id of ids) {
      const component = registry.components.find(item => item.id === id);
      expect(component, id).toBeDefined();
      expect(registry.examples.filter(example => example.intent === 'recommended' && example.componentIds.includes(id)).length, `${id} recommended examples`).toBeGreaterThan(0);
    }
  });
  it('lists the new options in the contracts', () => {
    const variants = (id: string) => registry.components.find(item => item.id === id)!.variants;
    const button = registry.components.find(item => item.id === 'button')!;
    expect(variants('button').variant).toEqual(expect.arrayContaining(['outline', 'soft', 'muted']));
    // Aliases are accepted values, not separate styles, so they are in the prop and not in the style list.
    expect(variants('button').variant).not.toContain('solid');
    expect(button.props.find(prop => prop.name === 'variant')!.allowedValues).toEqual(expect.arrayContaining(['solid', 'danger']));
    expect(variants('tabs').variant).toEqual(expect.arrayContaining(['line', 'boxed']));
    expect(variants('alert').variant).toEqual(expect.arrayContaining(['solid', 'outline', 'text']));
    expect(variants('progress').tone).toEqual(expect.arrayContaining(['primary', 'neutral']));
    expect(variants('switch').tone).toEqual(expect.arrayContaining(['primary', 'neutral']));
    expect(variants('checkbox').tone).toEqual(expect.arrayContaining(['primary', 'neutral']));
  });
});

describe('SYX-021 menu structure', () => {
  const action = (id: string) => ({ id, label: id });
  it('keeps action-only lists unchanged', () => {
    const items = [action('a'), { ...action('b'), destructive: true }];
    expect(normalizeMenuItems(items)).toEqual(items);
  });
  it('drops empty groups and leading, trailing and repeated separators', () => {
    const sep = (id: string) => ({ type: 'separator' as const, id });
    const result = normalizeMenuItems([sep('s0'), action('a'), sep('s1'), sep('s2'), { type: 'group', id: 'g', label: 'Empty', items: [] }, sep('s3'), action('b'), sep('s4')]);
    expect(result.map(item => item.id)).toEqual(['a', 's1', 'b']);
  });
  it('keeps a group that has items and returns nothing for an empty list', () => {
    const group = { type: 'group' as const, id: 'g', label: 'File', items: [action('a')] };
    expect(normalizeMenuItems([group])).toEqual([group]);
    expect(normalizeMenuItems([])).toEqual([]);
  });
});
