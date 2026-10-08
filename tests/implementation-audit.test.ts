import { describe, expect, it } from 'vitest';
import type { ComponentContract } from '@/lib/contract/schema';
import { registry } from '@/lib/data/registry';
import { auditComponentStyles } from '../scripts/lib/component-audit';
const component = (): ComponentContract => ({ ...structuredClone(registry.components[0]), tokenIds: ['color.primary'], compoundVariants: [] });
const base = '.root { color: var(--sys-color-primary); }';
describe('implementation audit', () => {
  it('accepts exact direct token references and ignores private CSS variables', () => {
    expect(auditComponentStyles(component(), base + '.root { width: var(--local-width); }', registry.tokens)).toEqual([]);
  });
  it.each([
    ['missing', '.root { color: var(--sys-color-focus); }', 'Missing CSS token color.focus'],
    ['unused', '.root { color: inherit; }', 'Unused CSS token color.primary'],
    ['unknown', base + '.root { color: var(--sys-color-unknown); }', 'Unknown CSS token --sys-color-unknown'],
    ['state', base + '.root:read-only { opacity: 1; }', 'Missing CSS state read-only'],
    ['variant', base + '.root[data-size="huge"] { font-size: 2em; }', 'Unknown CSS variant size=huge'],
    ['compound', base + '.root[data-size="small"][data-variant="ghost"] { padding: 0; }', 'Missing styled compound'],
  ])('catches %s drift', (_, css, message) => {
    expect(auditComponentStyles(component(), css, registry.tokens).some(issue => issue.startsWith(message))).toBe(true);
  });
  it('matches compound selectors regardless of key order', () => {
    const contract = component();
    contract.compoundVariants = [{ when: { variant: 'ghost', size: 'small' }, effect: 'styled', description: 'Compact padding.' }];
    expect(auditComponentStyles(contract, base + '.root[data-size="small"][data-variant="ghost"] { padding: 0; }', registry.tokens)).toEqual([]);
    expect(auditComponentStyles(contract, base, registry.tokens).some(issue => issue.startsWith('Unused styled compound'))).toBe(true);
  });
  it('keeps state-only selectors out of compound variant requirements', () => {
    const contract = component();
    contract.states.push('checked');
    expect(auditComponentStyles(contract, base + '.root[data-size="small"]:checked { opacity: 1; }', registry.tokens)).toEqual([]);
  });
});
