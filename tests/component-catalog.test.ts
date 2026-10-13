import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { componentReadiness, registryReadiness } from '@/lib/contract/readiness';
import { catalogSummary, filterComponents, noComponentFilters, variantOptionCount } from '@/lib/components/catalog';

const button = registry.components.find(c => c.id === 'button')!;

describe('metadata readiness', () => {
  it('marks every seeded component complete with a per-check breakdown', () => {
    const all = registryReadiness(registry);
    expect(Object.keys(all).sort()).toEqual(registry.components.map(c => c.id).sort());
    for (const readiness of Object.values(all)) {
      expect(readiness.complete).toBe(true);
      expect(readiness.checks.length).toBe(6);
    }
  });

  const fails = (component: typeof button, check: string, system = registry) => {
    const readiness = componentReadiness(component, system);
    expect(readiness.complete).toBe(false);
    expect(readiness.checks.filter(c => !c.passed).map(c => c.id)).toEqual([check]);
    return readiness;
  };

  it('fails the specific check when metadata is empty', () => {
    fails({ ...button, prohibitedUsage: [] as unknown as typeof button.prohibitedUsage }, 'guidance');
    fails({ ...button, aiGuidance: { ...button.aiGuidance, avoid: [] as unknown as typeof button.aiGuidance.avoid } }, 'guidance');
    fails({ ...button, states: [] as unknown as typeof button.states }, 'contract');
    fails({ ...button, shortPurpose: ' ' }, 'description');
  });

  it('requires keyboard behavior only for interactive components', () => {
    expect(button.interactive).toBe(true);
    fails({ ...button, accessibility: { ...button.accessibility, keyboard: [] } }, 'accessibility');
    const passive = registry.components.find(c => !c.interactive)!;
    expect(componentReadiness({ ...passive, accessibility: { ...passive.accessibility, keyboard: [] } }, registry).complete).toBe(true);
  });

  it('needs a recommended example and resolvable references, and names what is missing', () => {
    const violationOnly = registry.examples.filter(e => !(e.intent === 'recommended' && button.exampleIds.includes(e.id)));
    // Dropping the examples also leaves their IDs dangling, so both checks report it.
    const withoutExamples = componentReadiness(button, { ...registry, examples: violationOnly });
    expect(withoutExamples.checks.filter(c => !c.passed).map(c => c.id)).toEqual(['example', 'references']);
    const violationExample = registry.examples.find(e => e.intent === 'violation')!;
    const swapped = { ...button, exampleIds: [violationExample.id] };
    fails(swapped, 'example');
    const dangling = fails({ ...button, tokenIds: [...button.tokenIds, 'color.missing'], ruleIds: [...button.ruleIds, 'no-such-rule'] }, 'references');
    const message = dangling.checks.find(c => c.id === 'references')!.label;
    expect(message).toContain('token color.missing');
    expect(message).toContain('rule no-such-rule');
  });
});

describe('catalog helpers', () => {
  it('filters by name or purpose and category', () => {
    expect(filterComponents(registry.components, noComponentFilters)).toHaveLength(registry.components.length);
    expect(filterComponents(registry.components, { query: 'BUTTON', category: 'all' }).map(c => c.id)).toContain('button');
    const forms = filterComponents(registry.components, { query: '', category: 'form' });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every(c => c.category === 'form')).toBe(true);
    expect(filterComponents(registry.components, { query: 'button', category: 'form' }).every(c => c.category === 'form')).toBe(true);
    expect(filterComponents(registry.components, { query: 'zzz-none', category: 'all' })).toEqual([]);
  });

  it('derives counts only from contracts', () => {
    const summary = catalogSummary(registry.components, registryReadiness(registry));
    expect(summary.total).toBe(registry.components.length);
    expect(summary.reviewed).toBe(registry.components.filter(c => c.accessibility.status === 'reviewed').length);
    expect(summary.stable).toBe(registry.components.filter(c => c.maturity === 'stable').length);
    expect(summary.categories.reduce((sum, [, n]) => sum + n, 0)).toBe(summary.total);
    expect(summary.metadataComplete).toBe(summary.total);
    expect(variantOptionCount(button)).toBe(Object.values(button.variants).flat().length);
  });

  it('keeps unreviewed components unreviewed', () => {
    const summary = catalogSummary(registry.components, registryReadiness(registry));
    expect(summary.reviewed).toBe(0);
  });
});
