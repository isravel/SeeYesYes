import { describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { registry } from '@/lib/data/registry';

const h = createElement as unknown as (type: unknown, props?: Record<string, unknown> | null, ...children: unknown[]) => ReactElement;
const html = (element: ReactElement) => renderToStaticMarkup(element);
const get = () => registry.components.find(item => item.id === 'confirm-dialog')!;
const def = (name: string) => get().props.find(prop => prop.name === name)!.defaultValue;

describe('SYX-019 ConfirmDialog', () => {
  it('renders only a named trigger while closed', () => {
    const markup = html(h(ConfirmDialog, { triggerLabel: 'Archive project', title: 'Archive?', onConfirm: () => undefined }, h('p', null, 'Message text')));
    expect(markup).toContain('<button');
    expect(markup).toContain('Archive project');
    expect(markup).not.toContain('Message text');
    expect(markup).not.toContain('alertdialog');
  });
  it('styles the trigger as destructive and disables it on request', () => {
    const base = { triggerLabel: 'Delete', title: 'Delete?', onConfirm: () => undefined };
    expect(html(h(ConfirmDialog, { ...base, destructive: true }, 'x'))).toContain('data-variant="destructive"');
    expect(html(h(ConfirmDialog, base, 'x'))).not.toContain('data-variant="destructive"');
    expect(html(h(ConfirmDialog, { ...base, disabled: true }, 'x'))).toContain('disabled=""');
  });
  it('documents the planned defaults', () => {
    expect(def('size')).toBe('medium');
    expect(def('confirmLabel')).toBe('Confirm');
    expect(def('cancelLabel')).toBe('Cancel');
    expect(def('destructive')).toBe(false);
    expect(get().props.find(prop => prop.name === 'confirmText')!.defaultValue).toBeUndefined();
  });
  it('registers as an interactive alert dialog with keyboard guidance and an example', () => {
    const component = get();
    expect(component.interactive).toBe(true);
    expect(component.semantics.element).toBe('alertdialog');
    expect(component.accessibility.keyboard.some(key => key.key === 'Escape')).toBe(true);
    expect(component.accessibility.status).toBe('not-reviewed');
    expect(registry.rules.find(rule => rule.id === 'wcag-focus-visible')!.appliesTo).toContain('confirm-dialog');
    expect(registry.examples.some(example => example.intent === 'recommended' && example.componentIds.includes('confirm-dialog'))).toBe(true);
  });
  it('lists every state the planning matrix names', () => {
    for (const state of ['mismatch', 'ready', 'pending', 'failed']) expect(get().states).toContain(state);
  });
});
