import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Highlight } from '@/components/ui/highlight';
import { Level } from '@/components/ui/level';
import { LiveDot } from '@/components/ui/live-dot';
import { Kbd } from '@/components/ui/kbd';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const attr = (markup: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(markup)?.[1];
const people = (count: number) => Array.from({ length: count }, (_, index) => ({ initials: `P${index}`, alt: `Person ${index}` }));

describe('SYX-007 Highlight', () => {
  it('is a native mark with its words in the markup and no role or tab stop', () => {
    const markup = html(h(Highlight, null, 'every saved theme'));
    expect(markup).toMatch(/^<mark/);
    expect(markup).toContain('every saved theme');
    expect(markup).not.toContain('role=');
    expect(markup).not.toContain('tabindex');
  });
  it('passes className through so a caller can place it', () => expect(html(h(Highlight, { className: 'extra' }, 'x'))).toContain('extra'));
});

describe('SYX-011 Level', () => {
  it('renders the caller text with a decorative dot and defaults to neutral', () => {
    const markup = html(h(Level, null, 'Medium'));
    expect(markup).toContain('Medium');
    expect(attr(markup, 'data-tone')).toBe('neutral');
    expect(markup).toContain('aria-hidden="true"');
  });
  it('accepts every documented tone and infers nothing from the words', () => {
    for (const tone of ['neutral', 'success', 'warning', 'destructive', 'info'] as const) expect(attr(html(h(Level, { tone }, 'Hard')), 'data-tone')).toBe(tone);
    // The same word with a different tone stays the same text: the component never maps Easy/Medium/Hard to a tone.
    expect(attr(html(h(Level, null, 'Easy')), 'data-tone')).toBe('neutral');
    expect(attr(html(h(Level, null, 'Hard')), 'data-tone')).toBe('neutral');
  });
  it('supports a custom label', () => expect(html(h(Level, { tone: 'info' }, 'Beginner friendly'))).toContain('Beginner friendly'));
});

describe('SYX-012 LiveDot', () => {
  it('defaults to a small, live, static dot with the status text', () => {
    const markup = html(h(LiveDot, null, 'Live now'));
    expect(markup).toContain('Live now');
    expect(attr(markup, 'data-status')).toBe('live');
    expect(attr(markup, 'data-size')).toBe('small');
    expect(markup).not.toContain('data-animated');
  });
  it('animates only when asked and only while live', () => {
    expect(html(h(LiveDot, { animated: true }, 'Live'))).toContain('data-animated="true"');
    expect(html(h(LiveDot, { animated: true, status: 'inactive' }, 'Offline'))).not.toContain('data-animated');
  });
  it('keeps the dot decorative and the status in text for both statuses and sizes', () => {
    for (const status of ['live', 'inactive'] as const) for (const size of ['small', 'medium'] as const) {
      const markup = html(h(LiveDot, { status, size }, `Status ${status}`));
      expect(attr(markup, 'data-status')).toBe(status);
      expect(attr(markup, 'data-size')).toBe(size);
      expect(markup).toContain(`Status ${status}`);
      expect(markup).toContain('aria-hidden="true"');
    }
  });
});

describe('SYX-078 Kbd', () => {
  it('renders one key as a native kbd, small by default', () => {
    const markup = html(h(Kbd, null, 'Esc'));
    expect(markup).toMatch(/^<kbd/);
    expect(markup).toContain('Esc');
    expect(attr(markup, 'data-size')).toBe('small');
  });
  it('renders a sequence as one kbd per key with a hidden separator and no role', () => {
    const markup = html(h(Kbd, { keys: ['Ctrl', 'Shift', 'K'] }));
    expect(markup.match(/<kbd/g)).toHaveLength(3);
    expect(markup.match(/aria-hidden="true">\+</g)).toHaveLength(2);
    expect(markup).not.toContain('role=');
    expect(markup).not.toContain('tabindex');
  });
  it('falls back to children when keys is empty, and supports the medium size', () => {
    expect(html(h(Kbd, { keys: [] }, 'Tab'))).toMatch(/^<kbd[^>]*>Tab<\/kbd>$/);
    expect(attr(html(h(Kbd, { size: 'medium' }, 'K')), 'data-size')).toBe('medium');
  });
  it('handles a long sequence without dropping keys', () => {
    const keys = Array.from({ length: 8 }, (_, index) => `K${index}`);
    expect(html(h(Kbd, { keys })).match(/<kbd/g)).toHaveLength(8);
  });
  it('does not bind a shortcut: no handlers are rendered', () => expect(html(h(Kbd, { keys: ['Ctrl', 'K'] }))).not.toMatch(/\son\w+=/i));
});

describe('SYX-079 AvatarGroup', () => {
  it('names the group and shows at most four avatars by default, with a +N count named for assistive technology', () => {
    const markup = html(h(AvatarGroup, { label: 'Project members', people: people(6) }));
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Project members"');
    expect(markup.match(/aria-label="Person \d"/g)).toHaveLength(4);
    expect(markup).toContain('aria-label="2 more"');
    expect(markup).toContain('+2');
  });
  it('shows no count when everyone fits, including exactly max', () => {
    expect(html(h(AvatarGroup, { label: 'Team', people: people(4) }))).not.toContain('more"');
    expect(html(h(AvatarGroup, { label: 'Team', people: people(1) }))).not.toContain('more"');
  });
  it('honors max, including zero, and an empty list', () => {
    const none = html(h(AvatarGroup, { label: 'Team', people: people(3), max: 0 }));
    expect(none).not.toContain('aria-label="Person');
    expect(none).toContain('aria-label="3 more"');
    expect(html(h(AvatarGroup, { label: 'Team', people: [] }))).not.toContain('more"');
    expect(html(h(AvatarGroup, { label: 'Team', people: people(5), max: 2.9 })).match(/aria-label="Person \d"/g)).toHaveLength(2);
    expect(html(h(AvatarGroup, { label: 'Team', people: people(5), max: -3 }))).toContain('aria-label="5 more"');
  });
  it('lets the caller name the overflow and sets the size on the group and the avatars', () => {
    const markup = html(h(AvatarGroup, { label: 'Team', people: people(6), size: 'large', overflowLabel: (count: number) => `${count} more members` }));
    expect(markup).toContain('aria-label="2 more members"');
    expect(attr(markup, 'data-size')).toBe('large');
    expect(markup.match(/data-size="large"/g)!.length).toBeGreaterThan(1);
  });
  it('is not interactive by default: no buttons, links or tab stops', () => {
    const markup = html(h(AvatarGroup, { label: 'Team', people: people(6) }));
    expect(markup).not.toMatch(/<(button|a)[\s>]/);
    expect(markup).not.toContain('tabindex');
  });
  it('turns only the +N count into a named button when overflow content is supplied', () => {
    const markup = html(h(AvatarGroup, { label: 'Team', people: people(6), overflowContent: h('p', null, 'Hidden people') }));
    expect(markup.match(/<button[\s>]/g)).toHaveLength(1);
    expect(markup).toContain('aria-label="Show 2 more"');
    expect(markup).not.toContain('role="img" aria-label="2 more"');
    expect(markup).not.toContain('Hidden people'); // closed until pressed
    expect(html(h(AvatarGroup, { label: 'Team', people: people(6), overflowContent: 'x', overflowTriggerLabel: (count: number) => `See ${count} more members` }))).toContain('aria-label="See 2 more members"');
  });
  it('has no trigger when nobody overflows, even with overflow content', () => {
    expect(html(h(AvatarGroup, { label: 'Team', people: people(3), overflowContent: 'x' }))).not.toContain('<button');
  });
});

describe('X3 display contracts', () => {
  const ids = ['highlight', 'level', 'live-dot', 'kbd', 'avatar-group'];
  it('registers each component with an example; only AvatarGroup (its optional overflow button) is interactive and documents keys', () => {
    for (const id of ids) {
      const component = registry.components.find(item => item.id === id)!;
      expect(component, id).toBeDefined();
      expect(component.interactive, id).toBe(id === 'avatar-group');
      if (id === 'avatar-group') expect(component.accessibility.keyboard.map(k => k.key)).toEqual(['Enter / Space', 'Tab / Shift+Tab', 'Escape']);
      else expect(component.accessibility.keyboard, id).toEqual([]);
      expect(component.accessibility.status, id).toBe('not-reviewed');
      expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes(id)), id).toBe(true);
    }
  });
  it('documents the options the components accept', () => {
    const get = (id: string) => registry.components.find(item => item.id === id)!;
    expect(get('level').variants.tone).toEqual(['neutral', 'success', 'warning', 'destructive', 'info']);
    expect(get('live-dot').variants.status).toEqual(['live', 'inactive']);
    expect(get('live-dot').props.find(prop => prop.name === 'animated')!.defaultValue).toBe(false);
    expect(get('kbd').variants.size).toEqual(['small', 'medium']);
    expect(get('avatar-group').props.find(prop => prop.name === 'max')!.defaultValue).toBe(4);
  });
  it('keeps animation opt-in and the live dot size small by default', () => {
    const live = registry.components.find(item => item.id === 'live-dot')!;
    expect(live.props.find(prop => prop.name === 'size')!.defaultValue).toBe('small');
  });
});
