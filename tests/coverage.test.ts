import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { registryCoverage } from '@/lib/contract/coverage';

describe('registry coverage', () => {
  it('is calculated from the registry', () => {
    const coverage = registryCoverage(registry);
    expect(coverage).toEqual({
      components: registry.components.length, metadataComplete: registry.components.length, interactive: registry.components.filter(c => c.interactive).length,
      accessibilityReviewed: 0, stable: registry.components.filter(c => c.maturity === 'stable').length,
      tokens: registry.tokens.length, rules: registry.rules.length, examples: registry.examples.length, layouts: registry.layouts.length,
    });
  });

  it('drops metadata-complete when a component loses required metadata, and never counts an unevidenced review', () => {
    const [first, ...rest] = registry.components;
    const broken = { ...first, prohibitedUsage: [] as unknown as typeof first.prohibitedUsage, accessibility: { ...first.accessibility, status: 'reviewed' as const } };
    const coverage = registryCoverage({ ...registry, components: [broken, ...rest] });
    expect(coverage.metadataComplete).toBe(registry.components.length - 1);
    expect(coverage.accessibilityReviewed).toBe(0);
  });
});
