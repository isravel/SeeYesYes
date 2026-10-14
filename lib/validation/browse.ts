import type { DesignSystem, ValidationResult } from '@/lib/contract/schema';

type Rule = DesignSystem['rules'][number];
export type FindingStatus = ValidationResult['items'][number]['status'];
export type Finding = ValidationResult['items'][number] & { category: Rule['category']; severity: Rule['severity'] };
export type FindingFilters = { status: FindingStatus | 'all'; category: Rule['category'] | 'all' };
export const noFindingFilters: FindingFilters = { status: 'all', category: 'all' };
export const statuses: FindingStatus[] = ['passed', 'info', 'warning', 'error'];

/** A finding takes its category from its rule. */
export function withCategories(report: ValidationResult, rules: Rule[]): Finding[] {
  const byId = new Map(rules.map(rule => [rule.id, rule]));
  return report.items.map(item => {
    const rule = byId.get(item.ruleId);
    if (!rule) throw new Error(`Finding ${item.id} names unknown rule ${item.ruleId}.`);
    return { ...item, category: rule.category, severity: rule.severity };
  });
}

/** Counts follow the selected report, not the filters. */
export function statusCounts(findings: Finding[]): Record<FindingStatus, number> {
  const counts: Record<FindingStatus, number> = { passed: 0, info: 0, warning: 0, error: 0 };
  for (const finding of findings) counts[finding.status] += 1;
  return counts;
}

export const filterFindings = (findings: Finding[], filters: FindingFilters) =>
  findings.filter(finding => (filters.status === 'all' || finding.status === filters.status) && (filters.category === 'all' || finding.category === filters.category));
