import type { DesignSystem } from '@/lib/contract/schema';

type Rule = DesignSystem['rules'][number];
export type RuleFilters = { category: Rule['category'] | 'all'; severity: Rule['severity'] | 'all' };
export const noRuleFilters: RuleFilters = { category: 'all', severity: 'all' };
export const ruleCategories: Rule['category'][] = ['component', 'token', 'accessibility', 'composition', 'styling', 'performance'];
export const ruleSeverities: Rule['severity'][] = ['error', 'warning', 'info'];

export const filterRules = (rules: Rule[], filters: RuleFilters) =>
  rules.filter(rule => (filters.category === 'all' || rule.category === filters.category) && (filters.severity === 'all' || rule.severity === filters.severity));

/** The component IDs a rule names, or an empty list when it applies to the whole system. */
export const affectedComponentIds = (rule: Rule): string[] => rule.appliesTo === 'system' ? [] : rule.appliesTo;
