import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Popover } from '@/components/ui/popover';
import { Drawer } from '@/components/ui/drawer';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const get = (id: string) => registry.components.find(item => item.id === id)!;
const def = (id: string, name: string) => get(id).props.find(prop => prop.name === name)!.defaultValue;

describe('SYX-065 Popover and SYX-066 Drawer', () => {
  it('render only a named trigger button while closed', () => {
    const popover = html(h(Popover, { triggerLabel: 'Filter options', label: 'Filter options' }, h('p', null, 'Panel text')));
    const drawer = html(h(Drawer, { triggerLabel: 'Open filters', title: 'Filters' }, h('p', null, 'Panel text')));
    for (const [markup, name] of [[popover, 'Filter options'], [drawer, 'Open filters']]) {
      expect(markup).toContain('<button');
      expect(markup).toContain(name);
      expect(markup).not.toContain('Panel text');
      expect(markup).not.toContain('role="dialog"');
    }
  });
  it('disable the trigger', () => {
    expect(html(h(Popover, { triggerLabel: 'Open', label: 'Panel', disabled: true }, 'x'))).toContain('disabled=""');
    expect(html(h(Drawer, { triggerLabel: 'Open', title: 'Panel', disabled: true }, 'x'))).toContain('disabled=""');
  });
  it('document the planned defaults', () => {
    expect(def('popover', 'placement')).toBe('bottom');
    expect(def('drawer', 'side')).toBe('right');
    expect(def('drawer', 'size')).toBe('medium');
    expect(def('drawer', 'dismissOnOutsidePress')).toBe(true);
    expect(def('drawer', 'closeOnEscape')).toBe(true);
  });
  it('register as interactive with keyboard guidance, the focus rule and a recommended example', () => {
    const focus = registry.rules.find(rule => rule.id === 'wcag-focus-visible')!;
    for (const id of ['popover', 'drawer']) {
      const component = get(id);
      expect(component.interactive, id).toBe(true);
      expect(component.accessibility.keyboard.some(key => key.key === 'Escape'), id).toBe(true);
      expect(component.accessibility.status, id).toBe('not-reviewed');
      expect(focus.appliesTo, id).toContain(id);
      expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes(id)), id).toBe(true);
    }
  });
  it('do not let a theme change the drawer side, which is a layout choice', () => {
    expect(get('drawer').themeDefaults).toEqual({});
    expect(get('popover').themeDefaults).toEqual({});
  });
});
