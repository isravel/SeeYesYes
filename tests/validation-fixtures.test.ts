import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { checkDemoReports, demoReports } from '@/lib/data/fixtures';
import { mockResponse } from '@/lib/data/api';

const reports = demoReports(registry);
const report = (id: string) => reports.find(r => r.scenarioId === id)!;
const counts = (id: string) => {
  const result = { passed: 0, info: 0, warning: 0, error: 0 };
  for (const item of report(id).items) result[item.status] += 1;
  return result;
};
const categories = (id: string) => new Set(report(id).items.filter(i => i.status !== 'passed').map(i => registry.rules.find(r => r.id === i.ruleId)!.category));

describe('demo validation scenarios', () => {
  it('seeds clean, mixed, and failing reports labeled as demo fixtures', () => {
    expect(reports.map(r => r.scenarioId)).toEqual(['clean', 'mixed', 'failing']);
    expect(reports.every(r => r.source === 'demo-fixture')).toBe(true);
    for (const r of reports) expect(r.items).toHaveLength(registry.rules.length);
  });

  it('resolves every rule, example, and component reference, and matches severity and example intent', () => {
    expect(checkDemoReports(registry, reports)).toEqual([]);
  });

  it('has the documented counts per scenario', () => {
    expect(counts('clean')).toEqual({ passed: 8, info: 0, warning: 0, error: 0 });
    expect(counts('mixed')).toEqual({ passed: 4, info: 0, warning: 2, error: 2 });
    expect(counts('failing')).toEqual({ passed: 0, info: 1, warning: 4, error: 3 });
  });

  it('puts at least one failing finding in every one of the six rule categories only in the failing report', () => {
    expect([...categories('failing')].sort()).toEqual(['accessibility', 'component', 'composition', 'performance', 'styling', 'token']);
    expect(categories('clean').size).toBe(0);
    expect(categories('mixed').size).toBeLessThan(6);
  });

  it('detects broken references', () => {
    const broken = structuredClone(reports);
    broken[1].items[0] = { ...broken[1].items[0], ruleId: 'nope' };
    broken[2].items[0] = { ...broken[2].items[0], exampleId: 'nope' };
    broken[2].items[1] = { ...broken[2].items[1], status: 'info' };
    const issues = checkDemoReports(registry, broken);
    expect(issues.join('\n')).toMatch(/unknown rule nope/);
    expect(issues.join('\n')).toMatch(/unknown example nope/);
    expect(issues.join('\n')).toMatch(/differs from rule severity/);
  });

  it('serves the same reports through the validation endpoint and is empty or an error in the other scenarios', () => {
    const normal = mockResponse('validation');
    expect(normal.status).toBe(200);
    expect((normal.body as { data: unknown }).data).toEqual(reports);
    expect(mockResponse('validation', 'empty').body).toEqual({ data: [] });
    expect(mockResponse('validation', 'error').status).toBe(503);
  });
});
