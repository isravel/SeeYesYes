import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { demoCode, demos, renderDemo } from '@/components/examples/demos';
import { activeCompounds, disallowedBy, initialSelection, jsxProps, optionStatus } from '@/lib/components/playground';
import { registry } from '@/lib/data/registry';
import type { ComponentContract } from '@/lib/contract/schema';

const button = registry.components.find(c => c.id === 'button')!;
const withCompound = (compound: ComponentContract['compoundVariants'][number]): ComponentContract => ({ ...button, compoundVariants: [...button.compoundVariants, compound] });

describe('variant selection rules', () => {
  it('starts from effective defaults and falls back to the first option', () => {
    expect(initialSelection(button, { variant: 'ghost', size: 'large' })).toEqual({ variant: 'ghost', size: 'large' });
    expect(initialSelection(button, { variant: 'unknown' })).toEqual({ variant: 'primary', size: 'small' });
  });

  it('reports a disallowed combination with its reason and never starts on one', () => {
    const blocked = withCompound({ when: { variant: 'destructive', size: 'small' }, effect: 'disallowed', description: 'Destructive actions need a larger target.' });
    expect(optionStatus(blocked, { variant: 'destructive', size: 'medium' }, 'size', 'small')).toEqual({ disabled: true, reason: 'Destructive actions need a larger target.' });
    expect(optionStatus(blocked, { variant: 'primary', size: 'small' }, 'variant', 'destructive').disabled).toBe(true);
    expect(optionStatus(blocked, { variant: 'primary', size: 'small' }, 'variant', 'secondary').disabled).toBe(false);
    expect(disallowedBy(blocked, { variant: 'destructive', size: 'small' })).toBeDefined();
    const start = initialSelection(blocked, { variant: 'destructive', size: 'small' });
    expect(disallowedBy(blocked, start)).toBeUndefined();
  });

  it('lists only styled compounds that match the whole selection', () => {
    expect(activeCompounds(button, { variant: 'ghost', size: 'small' })).toHaveLength(1);
    expect(activeCompounds(button, { variant: 'ghost', size: 'large' })).toHaveLength(0);
  });

  it('writes JSX attributes the way the examples do', () => {
    expect(jsxProps({ variant: 'primary', disabled: true, rows: 3, hidden: false, gone: undefined })).toBe(' variant="primary" disabled rows={3}');
  });
});

describe('live demos', () => {
  it('cover every component, forcing only states and variants the contract documents', () => {
    expect(Object.keys(demos).sort()).toEqual(registry.components.map(c => c.id).sort());
    for (const component of registry.components) {
      const demo = demos[component.id];
      expect(demo.name).toBe(component.publicImport.exportName);
      expect(demo.states.length).toBeGreaterThan(0);
      for (const state of demo.states) expect(component.states, `${component.id} state ${state}`).toContain(state);
      for (const dimension of Object.keys(component.variants)) expect(component.props.map(p => p.name), `${component.id} variant ${dimension}`).toContain(dimension);
    }
  });

  it('render every variant option and forced state for real, and the code matches the selection', () => {
    for (const component of registry.components) {
      const demo = demos[component.id];
      const base = initialSelection(component, {});
      const cases = [
        ...Object.entries(component.variants).flatMap(([name, options]) => options.map(option => ({ selection: { ...base, [name]: option }, state: demo.states[0], expected: `${name}=${JSON.stringify(option)}` }))),
        ...demo.states.map(state => ({ selection: base, state, expected: '' })),
      ];
      for (const { selection, state, expected } of cases) {
        const markup = renderToStaticMarkup(renderDemo(component.id, selection, state) as never);
        expect(markup.length, `${component.id} ${JSON.stringify(selection)} ${state}`).toBeGreaterThan(0);
        const code = demoCode(component.id, selection, state);
        expect(code.startsWith(`<${demo.name}`)).toBe(true);
        if (expected) expect(code, component.id).toContain(expected);
      }
    }
  });

  it('shows state-driven props in both the rendered element and the code', () => {
    const selection = { variant: 'secondary', size: 'large' };
    expect(renderToStaticMarkup(renderDemo('button', selection, 'disabled') as never)).toMatch(/disabled/);
    expect(demoCode('button', selection, 'disabled')).toBe('<Button variant="secondary" size="large" disabled>\n  Save changes\n</Button>');
    expect(renderToStaticMarkup(renderDemo('button', selection, 'loading') as never)).toMatch(/aria-busy="true"/);
    expect(demoCode('input', { size: 'medium' }, 'invalid')).toContain('aria-invalid');
  });
});
