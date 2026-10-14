import { describe, expect, it } from 'vitest';
import { registry, defaultTheme } from '@/lib/data/registry';
import { createContext } from '@/lib/contract/context';
import { byteLength } from '@/lib/contract/export-files';
import { contextMarkdown, stableJson } from '@/lib/contract/serialize';

const settings = { settingsVersion: 1 as const, theme: defaultTheme, appearance: 'system' as const };
const task = (componentIds: string[]) => {
  const context = createContext(registry, { mode: 'task', componentIds, settings });
  if (context.mode !== 'task') throw new Error('expected task context');
  return context;
};

describe('task export dependency completeness', () => {
  for (const component of registry.components) {
    it(`${component.id}: every reference in the export resolves inside it`, () => {
      const context = task([component.id]);
      const included = new Set(context.components.map(c => c.id));
      const referenced = new Set(context.referencedComponents.map(c => c.id));
      const tokens = new Set(context.tokens.map(t => t.id));
      const rules = new Set(context.rules.map(r => r.id));
      const examples = new Set(context.examples.map(e => e.id));
      expect(included.has(component.id)).toBe(true);
      expect([...included].sort()).toEqual(context.selection.includedComponentIds);
      for (const c of context.components) {
        for (const id of c.tokenIds) expect(tokens.has(id), `${c.id} token ${id}`).toBe(true);
        for (const id of [...c.ruleIds, ...c.accessibility.ruleIds]) expect(rules.has(id), `${c.id} rule ${id}`).toBe(true);
        for (const id of c.exampleIds) expect(examples.has(id), `${c.id} example ${id}`).toBe(true);
        for (const id of c.composition.allowedComponentIds) expect(included.has(id), `${c.id} composition ${id}`).toBe(true);
      }
      for (const rule of context.rules) {
        expect(examples.has(rule.violationExampleId) && examples.has(rule.correctExampleId), rule.id).toBe(true);
        if (rule.appliesTo !== 'system') for (const id of rule.appliesTo) expect(included.has(id) || referenced.has(id), `${rule.id} applies to ${id}`).toBe(true);
      }
      for (const example of context.examples) for (const id of example.componentIds) expect(included.has(id) || referenced.has(id), `${example.id} uses ${id}`).toBe(true);
      for (const token of context.tokens) for (const id of token.exampleIds) expect(examples.has(id), `${token.id} example ${id}`).toBe(true);
      for (const id of referenced) expect(included.has(id)).toBe(false);
      for (const rule of registry.rules.filter(r => r.appliesTo === 'system')) expect(rules.has(rule.id), `system rule ${rule.id}`).toBe(true);
    });
  }

  it('keeps required guidance intact and omits unrelated records for a small fixture', () => {
    const spinner = task(['spinner']);
    expect(spinner.components.map(c => c.id)).toEqual(['spinner']);
    const [only] = spinner.components;
    const source = registry.components.find(c => c.id === 'spinner')!;
    expect(only.prohibitedUsage).toEqual(source.prohibitedUsage);
    expect(only.aiGuidance).toEqual(source.aiGuidance);
    expect(only.accessibility.requirements).toEqual(source.accessibility.requirements);
    expect(only.effectiveDefaults).toMatchObject({ size: 'medium' });
    expect(spinner.tokens.map(t => t.id).sort()).toEqual([...source.tokenIds].sort());
    for (const unrelated of ['dialog', 'table', 'navigation']) expect(JSON.stringify(spinner)).not.toContain(`"id":"${unrelated}"`);
    expect(spinner.theme).not.toHaveProperty('palette');
  });

  it('follows references one way: rule applicability never widens the closure', () => {
    const button = task(['button']);
    const included = new Set(button.components.map(c => c.id));
    const rulesNamingOthers = registry.rules.filter(r => r.appliesTo !== 'system' && r.appliesTo.some(id => !included.has(id)));
    for (const rule of rulesNamingOthers) {
      for (const id of (rule.appliesTo as string[]).filter(id => !included.has(id))) expect(button.components.some(c => c.id === id)).toBe(false);
    }
  });
});

describe('local export size comparison (bytes, not tokens)', () => {
  const overview = createContext(registry, { mode: 'overview', settings });
  const full = createContext(registry, { mode: 'full', settings });
  const sizes = {
    overview: byteLength(stableJson(overview)), full: byteLength(stableJson(full)),
    overviewMd: byteLength(contextMarkdown(overview)), fullMd: byteLength(contextMarkdown(full)),
  };

  it('a single-component task export is smaller than the full export, in JSON and Markdown', () => {
    for (const component of registry.components) {
      const context = task([component.id]);
      expect(byteLength(stableJson(context)), component.id).toBeLessThan(sizes.full);
      expect(byteLength(contextMarkdown(context)), component.id).toBeLessThan(sizes.fullMd);
    }
  });

  it('overview is the smallest export and full is the largest', () => {
    expect(sizes.overview).toBeLessThan(sizes.full);
    expect(sizes.overviewMd).toBeLessThan(sizes.fullMd);
    for (const component of registry.components) expect(byteLength(stableJson(task([component.id])))).toBeGreaterThan(sizes.overview);
  });

  it('a small fixture is much smaller than full, while a wide closure honestly reports its size', () => {
    const small = byteLength(stableJson(task(['spinner'])));
    expect(small).toBeLessThan(sizes.full / 3);
    const widest = Math.max(...registry.components.map(c => byteLength(stableJson(task([c.id])))));
    expect(widest).toBeLessThan(sizes.full);
  });

  it('adding a component never shrinks the export', () => {
    expect(byteLength(stableJson(task(['button', 'spinner'])))).toBeGreaterThanOrEqual(byteLength(stableJson(task(['button']))));
  });
});
