import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { ShinyText } from '@/components/ui/shiny-text';
import { RotatingWord } from '@/components/ui/rotating-word';
import { MenuToggle } from '@/components/ui/menu-toggle';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const get = (id: string) => registry.components.find(component => component.id === id)!;
const prop = (id: string, name: string) => get(id).props.find(item => item.name === name)!;

describe('SYX-025 AnimatedBadge', () => {
  it('is a plain Badge with its text until animation is asked for', () => {
    const markup = html(h(AnimatedBadge, { tone: 'primary' }, 'New'));
    expect(markup).toContain('New');
    expect(markup).toContain('data-tone="primary"');
    expect(markup).not.toContain('data-animated');
  });
  it('marks only an animated badge, and keeps the label and tone', () => {
    const markup = html(h(AnimatedBadge, { animated: true, tone: 'success' }, 'Live'));
    expect(markup).toContain('data-animated="true"');
    expect(markup).toContain('data-tone="success"');
    expect(markup).toContain('Live');
  });
});

describe('SYX-028 ShinyText', () => {
  it('is plain inline text, static by default', () => {
    const markup = html(h(ShinyText, null, 'faster'));
    expect(markup).toContain('>faster<');
    expect(markup).not.toContain('data-animated');
    expect(markup.startsWith('<span')).toBe(true);
  });
  it('marks the animated form without changing the words', () => {
    const markup = html(h(ShinyText, { animated: true }, 'faster'));
    expect(markup).toContain('data-animated="true"');
    expect(markup).toContain('>faster<');
  });
});

describe('SYX-034 RotatingWord', () => {
  const words = ['teams', 'designers', 'agents'];
  it('renders every word so the line reserves the widest one, and shows only the first before hydration', () => {
    const markup = html(h(RotatingWord, { words, animated: true }));
    for (const word of words) expect(markup).toContain(`>${word}<`);
    expect(markup.match(/data-active="true"/g)).toHaveLength(1);
    expect(markup).toContain('data-active="true">teams<');
  });
  it('hides the cycling words from assistive technology and reads one phrase instead', () => {
    const markup = html(h(RotatingWord, { words }));
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('teams, designers, agents</span>');
    expect(html(h(RotatingWord, { words, label: 'for everyone' }))).toContain('for everyone</span>');
  });
  it('does not rotate until after hydration, and never for one word or none', () => {
    expect(html(h(RotatingWord, { words, animated: true }))).not.toContain('data-rotating');
    expect(html(h(RotatingWord, { words: ['solo'], animated: true }))).not.toContain('data-rotating');
    expect(html(h(RotatingWord, { words: [] }))).toBe('');
  });
});

describe('SYX-027 MenuToggle', () => {
  it('is a native button named by its label, collapsed by default, and never submits a form', () => {
    const markup = html(h(MenuToggle, { label: 'Menu', controls: 'site-menu' }));
    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-label="Menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-controls="site-menu"');
    expect(markup.match(/aria-hidden="true"/g)).toHaveLength(1);
  });
  it('shows an expanded state, a size, and a disabled button', () => {
    expect(html(h(MenuToggle, { label: 'Menu', defaultExpanded: true }))).toContain('aria-expanded="true"');
    expect(html(h(MenuToggle, { label: 'Menu', expanded: true, defaultExpanded: false }))).toContain('aria-expanded="true"');
    expect(html(h(MenuToggle, { label: 'Menu' }))).toContain('data-size="medium"');
    expect(html(h(MenuToggle, { label: 'Menu', size: 'large' }))).toContain('data-size="large"');
    expect(html(h(MenuToggle, { label: 'Menu', disabled: true }))).toContain('disabled=""');
  });
  it('animates by default and can turn it off', () => {
    expect(html(h(MenuToggle, { label: 'Menu' }))).toContain('data-animated="true"');
    expect(html(h(MenuToggle, { label: 'Menu', animated: false }))).not.toContain('data-animated');
  });
});

describe('X4 effect contracts', () => {
  const ids = ['animated-badge', 'shiny-text', 'rotating-word', 'menu-toggle'];
  it('registers each with a recommended example; only MenuToggle is interactive and documents keys', () => {
    for (const id of ids) {
      expect(get(id), id).toBeDefined();
      expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes(id)), id).toBe(true);
      expect(get(id).interactive, id).toBe(id === 'menu-toggle');
      expect(get(id).accessibility.keyboard.length > 0, id).toBe(id === 'menu-toggle');
    }
    expect(registry.rules.find(rule => rule.id === 'wcag-focus-visible')!.appliesTo).toContain('menu-toggle');
  });
  it('keeps every effect opt-in with the planned defaults', () => {
    expect(prop('animated-badge', 'animated').defaultValue).toBe(false);
    expect(prop('shiny-text', 'animated').defaultValue).toBe(false);
    expect(prop('rotating-word', 'animated').defaultValue).toBe(false);
    expect(prop('rotating-word', 'interval').defaultValue).toBe(3000);
    expect(prop('menu-toggle', 'defaultExpanded').defaultValue).toBe(false);
    expect(prop('menu-toggle', 'size').defaultValue).toBe('medium');
  });
  it('treats reduced motion as a documented state of every animated component', () => {
    for (const id of ['animated-badge', 'shiny-text', 'menu-toggle']) expect(get(id).states, id).toContain('reduced-motion');
    expect(get('rotating-word').states).toContain('paused');
  });
});
