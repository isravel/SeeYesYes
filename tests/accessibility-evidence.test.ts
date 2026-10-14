import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { demoReports } from '@/lib/data/fixtures';
import { evidenceRows, formSemantics, sampleAccessibilityResults } from '@/lib/accessibility/evidence';

describe('accessibility evidence', () => {
  it('reads review status from contracts and claims no review that has not happened', () => {
    const rows = evidenceRows(registry.components);
    expect(rows).toHaveLength(registry.components.length);
    expect(rows.every(row => !row.reviewed && row.evidencePath === undefined)).toBe(true);
  });

  it('counts a component as reviewed only with evidence, and links it', () => {
    const base = registry.components[0];
    const withEvidence = { ...base, accessibility: { ...base.accessibility, status: 'reviewed' as const, evidence: { reviewedOn: '2026-11-01', path: '/docs/evidence/x.md' } } };
    const claimedWithoutEvidence = { ...base, id: 'other', name: 'Other', accessibility: { ...base.accessibility, status: 'reviewed' as const } };
    const rows = evidenceRows([withEvidence, claimedWithoutEvidence]);
    expect(rows.find(r => r.id === base.id)).toMatchObject({ reviewed: true, reviewedOn: '2026-11-01', evidencePath: '/docs/evidence/x.md' });
    expect(rows.find(r => r.id === 'other')?.reviewed).toBe(false);
  });

  it('summarizes keyboard, focus, and reduced motion from the contract', () => {
    const rows = evidenceRows(registry.components);
    const button = rows.find(r => r.id === 'button')!;
    expect(button).toMatchObject({ keyboard: 'Enter; Space', focus: 'Documents visible focus' });
    expect(rows.find(r => r.id === 'spinner')!.reducedMotion).toBe('Respects reduced motion');
    expect(rows.find(r => r.id === 'card')).toMatchObject({ focus: 'Not focusable', reducedMotion: 'No motion of its own' });
    for (const row of rows.filter(r => r.interactive)) expect(row.focus, row.id).toBe('Documents visible focus');
  });

  it('lists form semantics for form components', () => {
    const forms = formSemantics(registry.components);
    expect(forms.map(f => f.id).sort()).toEqual(registry.components.filter(c => c.category === 'form').map(c => c.id).sort());
    expect(forms.find(f => f.id === 'select')!.element).toBe('select');
  });

  it('summarizes only accessibility-rule results from the demo reports', () => {
    const summary = sampleAccessibilityResults(demoReports(registry), registry.rules);
    expect(summary.map(s => s.scenarioId)).toEqual(['clean', 'mixed', 'failing']);
    expect(summary.map(s => s.total)).toEqual([2, 2, 2]);
    expect(summary[0]).toMatchObject({ passed: 2, findings: [] });
    expect(summary[2]).toMatchObject({ passed: 0 });
    expect(summary[2].findings.map(f => f.ruleId).sort()).toEqual(['wcag-contrast', 'wcag-focus-visible']);
  });
});
