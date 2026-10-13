import type { ComponentContract, DesignSystem } from './schema';

export type ReadinessCheck = { id: string; label: string; passed: boolean };
export type ComponentReadiness = { complete: boolean; checks: ReadinessCheck[] };

const filled = (value: unknown) => Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim().length > 0 : Boolean(value);

/**
 * Metadata readiness from the contract's checklist. It says metadata and references are complete,
 * not that an agent was tested. Recommended previews are proven to resolve by the generated
 * `verifiedPreviews` type check, so the check here is that a recommended example with a preview key exists.
 */
export function componentReadiness(component: ComponentContract, system: Pick<DesignSystem, 'components' | 'tokens' | 'examples' | 'rules'>): ComponentReadiness {
  const tokens = new Set(system.tokens.map(token => token.id));
  const components = new Set(system.components.map(item => item.id));
  const rules = new Set(system.rules.map(rule => rule.id));
  const examples = new Map(system.examples.map(example => [example.id, example]));
  const recommended = component.exampleIds.some(id => {
    const example = examples.get(id);
    return example?.intent === 'recommended' && filled(example.previewKey);
  });
  const missing = [
    ...component.tokenIds.filter(id => !tokens.has(id)).map(id => `token ${id}`),
    ...component.exampleIds.filter(id => !examples.has(id)).map(id => `example ${id}`),
    ...[...component.ruleIds, ...component.accessibility.ruleIds].filter(id => !rules.has(id)).map(id => `rule ${id}`),
    ...component.composition.allowedComponentIds.filter(id => !components.has(id)).map(id => `component ${id}`),
  ];
  const checks: ReadinessCheck[] = [
    { id: 'description', label: 'Purpose, short purpose, semantics, and anatomy are written', passed: filled(component.purpose) && filled(component.shortPurpose) && filled(component.semantics.element) && filled(component.semantics.meaning) && filled(component.anatomy) },
    { id: 'contract', label: 'Props, states, and tokens are documented', passed: filled(component.props) && filled(component.states) && filled(component.tokenIds) },
    { id: 'guidance', label: 'Prohibited usage and prefer/avoid guidance are written', passed: filled(component.prohibitedUsage) && filled(component.aiGuidance.prefer) && filled(component.aiGuidance.avoid) },
    { id: 'accessibility', label: component.interactive ? 'Accessibility requirements and keyboard behavior are documented' : 'Accessibility requirements are documented', passed: filled(component.accessibility.requirements) && (!component.interactive || filled(component.accessibility.keyboard)) },
    { id: 'example', label: 'A recommended example with a preview exists', passed: recommended },
    { id: 'references', label: missing.length ? `Every reference resolves (missing: ${missing.join(', ')})` : 'Every reference resolves', passed: missing.length === 0 },
  ];
  return { complete: checks.every(check => check.passed), checks };
}

export function registryReadiness(system: Pick<DesignSystem, 'components' | 'tokens' | 'examples' | 'rules'>): Record<string, ComponentReadiness> {
  return Object.fromEntries(system.components.map(component => [component.id, componentReadiness(component, system)]));
}
