import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { affectedComponentIds, filterRules, noRuleFilters, ruleCategories, ruleSeverities } from '@/lib/rules/browse';

describe('rules browsing', () => {
  it('returns every rule without filters and combines category and severity', () => {
    expect(filterRules(registry.rules, noRuleFilters)).toHaveLength(registry.rules.length);
    for (const category of ruleCategories) for (const severity of ruleSeverities) {
      const found = filterRules(registry.rules, { category, severity });
      expect(found.every(rule => rule.category === category && rule.severity === severity)).toBe(true);
    }
    const total = ruleSeverities.reduce((sum, severity) => sum + filterRules(registry.rules, { category: 'all', severity }).length, 0);
    expect(total).toBe(registry.rules.length);
    expect(filterRules(registry.rules, { category: 'accessibility', severity: 'all' }).map(r => r.id)).toEqual(expect.arrayContaining(['wcag-contrast', 'wcag-focus-visible']));
  });

  it('knows which components a rule names', () => {
    const system = registry.rules.find(r => r.appliesTo === 'system')!;
    expect(affectedComponentIds(system)).toEqual([]);
    const named = registry.rules.find(r => r.id === 'avoid-custom-button')!;
    expect(affectedComponentIds(named)).toEqual(['button']);
  });

  it('every rule has a resolvable violation and corrected example', () => {
    for (const rule of registry.rules) {
      expect(registry.examples.find(e => e.id === rule.violationExampleId)?.intent, rule.id).toBe('violation');
      expect(registry.examples.find(e => e.id === rule.correctExampleId)?.intent, rule.id).toBe('recommended');
    }
  });
});
