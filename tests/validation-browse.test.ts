import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { demoReports } from '@/lib/data/fixtures';
import { filterFindings, noFindingFilters, statusCounts, withCategories } from '@/lib/validation/browse';

const report = (id: string) => withCategories(demoReports(registry).find(r => r.scenarioId === id)!, registry.rules);

describe('validation browsing', () => {
  it('takes each finding’s category and severity from its rule', () => {
    for (const finding of report('failing')) {
      const rule = registry.rules.find(r => r.id === finding.ruleId)!;
      expect(finding.category).toBe(rule.category);
      expect(finding.severity).toBe(rule.severity);
    }
  });

  it('counts follow the report and always add up to its findings', () => {
    for (const id of ['clean', 'mixed', 'failing']) {
      const counts = statusCounts(report(id));
      expect(counts.passed + counts.info + counts.warning + counts.error).toBe(registry.rules.length);
    }
    expect(statusCounts(report('clean')).passed).toBe(registry.rules.length);
  });

  it('filters by status and category together', () => {
    const findings = report('failing');
    expect(filterFindings(findings, noFindingFilters)).toHaveLength(findings.length);
    const errors = filterFindings(findings, { status: 'error', category: 'all' });
    expect(errors.every(f => f.status === 'error')).toBe(true);
    const accessibilityErrors = filterFindings(findings, { status: 'error', category: 'accessibility' });
    expect(accessibilityErrors.map(f => f.ruleId).sort()).toEqual(['wcag-contrast', 'wcag-focus-visible']);
    expect(filterFindings(report('clean'), { status: 'error', category: 'all' })).toEqual([]);
  });

  it('rejects a finding whose rule is unknown', () => {
    const broken = { ...demoReports(registry)[0], items: [{ ...demoReports(registry)[0].items[0], ruleId: 'nope' }] };
    expect(() => withCategories(broken, registry.rules)).toThrow(/unknown rule nope/);
  });
});
