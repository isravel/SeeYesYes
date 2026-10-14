import type { DesignSystem } from './schema';
import { registryReadiness } from './readiness';

/** Counts calculated from the registry itself. Metadata readiness and accessibility review are reported separately, never combined. */
export function registryCoverage(system: Pick<DesignSystem, 'components' | 'tokens' | 'examples' | 'rules' | 'layouts'>) {
  const readiness = registryReadiness(system);
  const total = system.components.length;
  return {
    components: total,
    metadataComplete: system.components.filter(component => readiness[component.id].complete).length,
    interactive: system.components.filter(component => component.interactive).length,
    accessibilityReviewed: system.components.filter(component => component.accessibility.status === 'reviewed' && Boolean(component.accessibility.evidence)).length,
    stable: system.components.filter(component => component.maturity === 'stable').length,
    tokens: system.tokens.length, rules: system.rules.length, examples: system.examples.length, layouts: system.layouts.length,
  };
}
