import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Toast, toastExpiry } from '@/components/ui/toast';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);

describe('SYX-020 Toast', () => {
  it('renders only its trigger until a toast is queued, so nothing is announced on load', () => {
    const markup = html(h(Toast, { triggerLabel: 'Save changes', message: 'Changes saved.' }));
    expect(markup).toContain('Save changes');
    expect(markup).toContain('type="button"');
    expect(markup).not.toContain('Changes saved.');
    expect(markup).not.toContain('role="alert"');
    expect(markup).not.toContain('Notifications');
  });
  it('disables the trigger', () => {
    expect(html(h(Toast, { triggerLabel: 'Save', message: 'm', disabled: true }))).toContain('disabled=""');
  });
  it('expires a toast without an action after five seconds by default, and never expires one with an action', () => {
    expect(toastExpiry(5000)).toBe(5000);
    expect(toastExpiry(1200)).toBe(1200);
    expect(toastExpiry(5000, 'Undo')).toBeUndefined();
  });
});

describe('Toast contract', () => {
  const toast = registry.components.find(component => component.id === 'toast')!;
  const prop = (name: string) => toast.props.find(item => item.name === name)!;
  it('is registered as interactive with keyboard behavior and a recommended example', () => {
    expect(toast.interactive).toBe(true);
    expect(toast.accessibility.keyboard.length).toBeGreaterThan(0);
    expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes('toast'))).toBe(true);
  });
  it('documents the planned defaults and is not offered as a theme default', () => {
    expect(prop('tone').defaultValue).toBe('info');
    expect(prop('position').defaultValue).toBe('bottom-center');
    expect(prop('timeout').defaultValue).toBe(5000);
    expect(prop('tone').allowedValues).toEqual(['info', 'success', 'warning', 'destructive']);
    expect(toast.themeDefaults).toEqual({});
  });
});
