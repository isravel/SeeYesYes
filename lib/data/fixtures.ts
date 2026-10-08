import type { DesignSystem, ValidationResult } from '@/lib/contract/schema';
/** Honest fixtures derived from valid registry references. No project scan happens here. */
export function demoReports(system: DesignSystem): ValidationResult[] {
  return (['clean', 'mixed', 'failing'] as const).map(scenarioId => ({
    id: `demo-${scenarioId}`, source: 'demo-fixture', scenarioId,
    items: system.rules.map((rule, index) => {
      const passed = scenarioId === 'clean' || (scenarioId === 'mixed' && index % 2 === 0);
      return { id: `${scenarioId}-${rule.id}`, ruleId: rule.id, status: passed ? 'passed' : rule.severity,
        ...(rule.appliesTo === 'system' ? {} : { componentId: rule.appliesTo[0] }),
        message: passed ? `Demo pass: ${rule.description}` : `Demo finding: ${rule.description}`,
        exampleId: passed ? rule.correctExampleId : rule.violationExampleId,
      };
    }),
  }));
}
