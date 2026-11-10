import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IconButton } from '@/components/ui/icon-button';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Chip } from '@/components/ui/chip';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const attr = (markup: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(markup)?.[1];
const icon = h('svg', { 'data-icon': true });

describe('SYX-017 IconButton', () => {
  it('uses the required label as the accessible name and hides the icon', () => {
    const markup = html(h(IconButton, { label: 'Add member', icon }));
    expect(markup).toContain('aria-label="Add member"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('type="button"');
  });
  it('defaults to a medium ghost button and accepts the documented variants and sizes', () => {
    const plain = html(h(IconButton, { label: 'Add', icon }));
    expect(attr(plain, 'data-variant')).toBe('ghost');
    expect(attr(plain, 'data-size')).toBe('medium');
    for (const variant of ['outline', 'soft', 'muted', 'primary', 'secondary', 'destructive']) expect(attr(html(h(IconButton, { label: 'Add', icon, variant })), 'data-variant')).toBe(variant);
    for (const size of ['small', 'large']) expect(attr(html(h(IconButton, { label: 'Add', icon, size })), 'data-size')).toBe(size);
  });
  it('exposes pressed only when asked, and loading as busy and disabled', () => {
    expect(html(h(IconButton, { label: 'Pin', icon }))).not.toContain('aria-pressed');
    expect(html(h(IconButton, { label: 'Pin', icon, pressed: false }))).toContain('aria-pressed="false"');
    expect(html(h(IconButton, { label: 'Pin', icon, pressed: true }))).toContain('aria-pressed="true"');
    const loading = html(h(IconButton, { label: 'Save', icon, loading: true }));
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain('disabled=""');
  });
  it('keeps the label as the name when a tooltip is added', () => {
    const markup = html(h(IconButton, { label: 'Add member', icon, tooltip: 'Add a member' }));
    expect(markup).toContain('aria-label="Add member"');
    expect(markup).toContain('<button');
  });
  it('never makes destructive a theme default', () => {
    const contract = registry.components.find(item => item.id === 'icon-button')!;
    expect(contract.themeDefaults.variant).not.toContain('destructive');
    expect(contract.props.find(prop => prop.name === 'label')!.required).toBe(true);
  });
});

describe('SYX-014 SearchInput', () => {
  it('is a labelled native search input with a decorative icon and no clear button while empty', () => {
    const markup = html(h(SearchInput, { label: 'Search members' }));
    expect(markup).toContain('type="search"');
    expect(markup).toContain('aria-label="Search members"');
    expect(markup).not.toContain('Clear search');
    expect(attr(markup, 'data-size')).toBe('medium');
  });
  it('shows the clear button once there is text, for controlled and uncontrolled use', () => {
    expect(html(h(SearchInput, { label: 'Search', defaultValue: 'Maya' }))).toContain('aria-label="Clear search"');
    expect(html(h(SearchInput, { label: 'Search', value: 'Maya', onChange: () => undefined }))).toContain('value="Maya"');
    expect(html(h(SearchInput, { label: 'Search', value: 'Maya', onChange: () => undefined, clearLabel: 'Reset' }))).toContain('aria-label="Reset"');
  });
  it('hides the clear button when disabled or read-only, and reports searching in text', () => {
    expect(html(h(SearchInput, { label: 'Search', defaultValue: 'x', disabled: true }))).not.toContain('Clear search');
    expect(html(h(SearchInput, { label: 'Search', defaultValue: 'x', readOnly: true }))).not.toContain('Clear search');
    const searching = html(h(SearchInput, { label: 'Search', searching: true }));
    expect(searching).toContain('aria-busy="true"');
    expect(searching).toContain('Searching…');
  });
});

describe('SYX-016 Segmented', () => {
  const options = [{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'map', label: 'Map', disabled: true }];
  it('is a named radio group of native radios sharing one name, with no tab semantics', () => {
    const markup = html(h(Segmented, { label: 'View', options, name: 'view', defaultValue: 'list' }));
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-label="View"');
    expect(markup.match(/type="radio"/g)).toHaveLength(3);
    expect(markup.match(/name="view"/g)).toHaveLength(3);
    expect(markup).not.toContain('role="tab');
  });
  it('selects the default and the controlled value, and disables one option or all', () => {
    const input = (markup: string, value: string) => markup.match(/<input[^>]*>/g)!.find(tag => tag.includes(`value="${value}"`))!;
    const byDefault = html(h(Segmented, { label: 'View', options, defaultValue: 'grid', name: 'v' }));
    expect(input(byDefault, 'grid')).toContain('checked');
    expect(input(byDefault, 'list')).not.toContain('checked');
    expect(input(html(h(Segmented, { label: 'View', options, value: 'list', onChange: () => undefined, name: 'v' })), 'list')).toContain('checked');
    const mixed = html(h(Segmented, { label: 'View', options, name: 'v' }));
    expect(input(mixed, 'map')).toContain('disabled');
    expect(input(mixed, 'grid')).not.toContain('disabled');
    expect(html(h(Segmented, { label: 'View', options, name: 'v', disabled: true })).match(/disabled=""/g)).toHaveLength(3);
  });
  it('generates a group name when none is given and supports every size', () => {
    expect(attr(html(h(Segmented, { label: 'View', options })), 'name')).toBeTruthy();
    for (const size of ['small', 'medium', 'large']) expect(attr(html(h(Segmented, { label: 'View', options, size })), 'data-size')).toBe(size);
  });
});

describe('SYX-009 Chip', () => {
  it('is plain text with no role or tab stop when it has no action', () => {
    const markup = html(h(Chip, null, 'Design'));
    expect(markup).toMatch(/^<span/);
    expect(markup).not.toContain('<button');
    expect(markup).not.toContain('role=');
    expect(attr(markup, 'data-tone')).toBe('neutral');
    expect(attr(markup, 'data-size')).toBe('medium');
  });
  it('becomes a toggle button with aria-pressed when selectable', () => {
    const off = html(h(Chip, { onSelectedChange: () => undefined }, 'In stock'));
    expect(off).toMatch(/^<button/);
    expect(off).toContain('aria-pressed="false"');
    expect(html(h(Chip, { onSelectedChange: () => undefined, defaultSelected: true }, 'In stock'))).toContain('aria-pressed="true"');
    expect(html(h(Chip, { onSelectedChange: () => undefined, selected: true }, 'In stock'))).toContain('aria-pressed="true"');
  });
  it('adds a named remove button, and shows pending and failed removal without dropping the chip', () => {
    const removable = html(h(Chip, { onRemove: () => undefined }, 'Archived'));
    expect(removable).toContain('aria-label="Remove Archived"');
    expect(html(h(Chip, { onRemove: () => undefined, removeLabel: 'Remove tag Archived' }, 'Archived'))).toContain('aria-label="Remove tag Archived"');
    const pending = html(h(Chip, { onRemove: () => undefined, removing: true }, 'Archived'));
    expect(pending).toContain('aria-busy="true"');
    expect(pending).toContain('disabled=""');
    const failed = html(h(Chip, { onRemove: () => undefined, error: 'Could not remove.' }, 'Archived'));
    expect(failed).toContain('Could not remove.');
    expect(failed).toContain('Archived');
    expect(failed).toContain('aria-describedby');
  });
  it('rejects a chip that is both selectable and removable, and accepts every tone', () => {
    expect(() => html(h(Chip, { onSelectedChange: () => undefined, onRemove: () => undefined }, 'x'))).toThrow(/either selectable or removable/);
    for (const tone of ['neutral', 'primary', 'success', 'warning', 'destructive', 'info']) expect(attr(html(h(Chip, { tone }, 'x')), 'data-tone')).toBe(tone);
  });
});

describe('SYX-070 CheckboxGroup', () => {
  const options = [{ value: 'email', label: 'Email' }, { value: 'sms', label: 'Text', hint: 'Rates may apply.' }, { value: 'push', label: 'Push', disabled: true }];
  it('is a named fieldset of native checkboxes sharing a name, empty by default', () => {
    const markup = html(h(CheckboxGroup, { name: 'channels', label: 'Notify me by', options }));
    expect(markup).toContain('<fieldset');
    expect(markup).toContain('Notify me by');
    expect(markup.match(/type="checkbox"/g)).toHaveLength(3);
    expect(markup.match(/name="channels"/g)).toHaveLength(3);
    expect(markup).not.toContain('checked');
  });
  it('checks the default and controlled values, including none, some and all', () => {
    expect(html(h(CheckboxGroup, { name: 'c', label: 'L', options, defaultValue: ['email'] })).match(/checked/g)).toHaveLength(1);
    expect(html(h(CheckboxGroup, { name: 'c', label: 'L', options, value: ['email', 'sms', 'push'], onChange: () => undefined })).match(/checked/g)).toHaveLength(3);
    expect(html(h(CheckboxGroup, { name: 'c', label: 'L', options, value: [], onChange: () => undefined }))).not.toContain('checked');
  });
  it('describes an option by its hint, disables one option or all, and shows help and error as text', () => {
    const markup = html(h(CheckboxGroup, { name: 'c', label: 'L', options, helpText: 'Choose any.', error: 'Choose one.' }));
    expect(markup).toContain('Rates may apply.');
    expect(markup).toMatch(/aria-describedby="[^"]*-1-hint"/);
    expect(markup).toContain('Choose any.');
    expect(markup).toContain('Choose one.');
    expect(markup.match(/<input[^>]*>/g)!.find(tag => tag.includes('value="push"'))).toContain('disabled');
    expect(html(h(CheckboxGroup, { name: 'c', label: 'L', options, disabled: true })).match(/disabled=""/g)!.length).toBeGreaterThanOrEqual(3);
  });
  it('supports both orientations', () => {
    for (const orientation of ['vertical', 'horizontal']) expect(html(h(CheckboxGroup, { name: 'c', label: 'L', options, orientation }))).toContain(`data-orientation="${orientation}"`);
  });
});

describe('X3 control contracts', () => {
  const ids = ['icon-button', 'search-input', 'segmented', 'chip', 'checkbox-group'];
  it('registers each as interactive with keyboard behavior and a recommended example', () => {
    for (const id of ids) {
      const component = registry.components.find(item => item.id === id)!;
      expect(component, id).toBeDefined();
      expect(component.interactive, id).toBe(true);
      expect(component.accessibility.keyboard.length, id).toBeGreaterThan(0);
      expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes(id)), id).toBe(true);
    }
  });
  it('documents the planned defaults', () => {
    const get = (id: string) => registry.components.find(item => item.id === id)!;
    const def = (id: string, name: string) => get(id).props.find(prop => prop.name === name)!.defaultValue;
    expect(def('icon-button', 'variant')).toBe('ghost');
    expect(def('icon-button', 'size')).toBe('medium');
    expect(def('search-input', 'size')).toBe('medium');
    expect(def('search-input', 'defaultValue')).toBe('');
    expect(def('segmented', 'size')).toBe('medium');
    expect(def('chip', 'tone')).toBe('neutral');
    expect(def('chip', 'size')).toBe('medium');
    expect(def('checkbox-group', 'orientation')).toBe('vertical');
  });
});
