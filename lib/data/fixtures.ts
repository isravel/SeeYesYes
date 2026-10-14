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

/** Reference problems in demo reports, or an empty list. Every finding must resolve to a real rule, example, and component. */
export function checkDemoReports(system: DesignSystem, reports: ValidationResult[]): string[] {
  const rules = new Map(system.rules.map(rule => [rule.id, rule]));
  const examples = new Set(system.examples.map(example => example.id));
  const components = new Set(system.components.map(component => component.id));
  const issues: string[] = [];
  for (const report of reports) for (const item of report.items) {
    const rule = rules.get(item.ruleId);
    if (!rule) { issues.push(`${item.id}: unknown rule ${item.ruleId}`); continue; }
    if (!examples.has(item.exampleId)) issues.push(`${item.id}: unknown example ${item.exampleId}`);
    if (item.componentId && !components.has(item.componentId)) issues.push(`${item.id}: unknown component ${item.componentId}`);
    const expectedExample = item.status === 'passed' ? rule.correctExampleId : rule.violationExampleId;
    if (item.exampleId !== expectedExample) issues.push(`${item.id}: shows ${item.exampleId}, expected ${expectedExample}`);
    if (item.status !== 'passed' && item.status !== rule.severity) issues.push(`${item.id}: status ${item.status} differs from rule severity ${rule.severity}`);
  }
  return issues;
}
