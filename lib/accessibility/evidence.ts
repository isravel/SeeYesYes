import type { ComponentContract, DesignSystem, ValidationResult } from '@/lib/contract/schema';

export type EvidenceRow = {
  id: string; name: string; interactive: boolean; reviewed: boolean; reviewedOn?: string; evidencePath?: string;
  keyboard: string; focus: string; reducedMotion: string;
};

/** Visible focus is documented by a focus state or by the focus-visible rule the contract links. */
const documentsFocus = (component: ComponentContract) =>
  component.states.includes('focus-visible') || component.states.includes('focused') || component.accessibility.ruleIds.includes('wcag-focus-visible');

/** Review evidence read straight from contracts. A component is reviewed only when its contract says so and links evidence. */
export function evidenceRows(components: ComponentContract[]): EvidenceRow[] {
  return [...components].sort((a, b) => a.name.localeCompare(b.name)).map(component => {
    const reviewed = component.accessibility.status === 'reviewed' && Boolean(component.accessibility.evidence);
    return {
      id: component.id, name: component.name, interactive: component.interactive, reviewed,
      ...(reviewed ? { reviewedOn: component.accessibility.evidence!.reviewedOn, evidencePath: component.accessibility.evidence!.path } : {}),
      keyboard: component.accessibility.keyboard.length ? component.accessibility.keyboard.map(item => item.key).join('; ') : 'No keyboard behavior of its own',
      focus: documentsFocus(component) ? 'Documents visible focus' : component.interactive ? 'Missing focus documentation' : 'Not focusable',
      reducedMotion: component.states.includes('reduced-motion') ? 'Respects reduced motion' : 'No motion of its own',
    };
  });
}

export const formSemantics = (components: ComponentContract[]) =>
  components.filter(component => component.category === 'form').sort((a, b) => a.name.localeCompare(b.name))
    .map(component => ({ id: component.id, name: component.name, element: component.semantics.element, meaning: component.semantics.meaning, requirement: component.accessibility.requirements[0] }));

/** Accessibility-category results across the demo reports, for a side-by-side summary. These are fixtures, not measurements. */
export function sampleAccessibilityResults(reports: ValidationResult[], rules: DesignSystem['rules']) {
  const accessibility = new Set(rules.filter(rule => rule.category === 'accessibility').map(rule => rule.id));
  return reports.map(report => {
    const items = report.items.filter(item => accessibility.has(item.ruleId));
    return { scenarioId: report.scenarioId, total: items.length, passed: items.filter(item => item.status === 'passed').length, findings: items.filter(item => item.status !== 'passed').map(item => ({ id: item.id, ruleId: item.ruleId, status: item.status, message: item.message })) };
  });
}
