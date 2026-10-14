import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { componentReadiness } from '@/lib/contract/readiness';

const required = ['button', 'link', 'card', 'badge', 'separator', 'avatar', 'alert', 'progress', 'spinner', 'skeleton', 'input', 'textarea', 'select', 'checkbox',
  'radio-group', 'switch', 'label', 'form-field', 'dialog', 'dropdown-menu', 'tabs', 'tooltip', 'table', 'navigation',
  'loading-state', 'empty-state', 'error-state', 'not-found', 'copy-button'];
// Listed as interactive in the visual-system spec.
const specInteractive = ['button', 'link', 'navigation', 'tabs', 'dropdown-menu', 'dialog', 'tooltip', 'input', 'textarea', 'select', 'checkbox', 'radio-group', 'switch'];
// Feedback patterns that contain an action, retry, link, or copy control, so the spec's own rule makes them interactive.
const interactivePatterns = ['empty-state', 'error-state', 'not-found', 'copy-button'];

describe('required component inventory', () => {
  it('contains exactly the required components', () => {
    expect(registry.components.map(c => c.id).sort()).toEqual([...required].sort());
  });

  it('gives every component an implementation file, a recommended example, and complete metadata', () => {
    for (const component of registry.components) {
      const file = component.publicImport.module.replace('@/', '') + '.tsx';
      expect(existsSync(file), `${component.id} implementation ${file}`).toBe(true);
      expect(component.exampleIds.some(id => registry.examples.some(e => e.id === id && e.intent === 'recommended')), `${component.id} recommended example`).toBe(true);
      const readiness = componentReadiness(component, registry);
      expect(readiness.checks.filter(check => !check.passed), component.id).toEqual([]);
    }
  });

  it('marks interactive components consistently with the spec and documents keyboard behavior for each', () => {
    const interactive = registry.components.filter(c => c.interactive).map(c => c.id).sort();
    expect(interactive).toEqual([...specInteractive, ...interactivePatterns].sort());
    // Table is not interactive, but its scrollable region must be keyboard reachable, so it documents that one behavior.
    const documented = registry.components.filter(c => c.accessibility.keyboard.length > 0).map(c => c.id).sort();
    expect(documented).toEqual([...interactive, 'table'].sort());
  });

  it('does not claim any accessibility review that has not happened', () => {
    for (const component of registry.components) {
      expect(component.accessibility.status, component.id).toBe('not-reviewed');
      expect(component.accessibility.evidence, component.id).toBeUndefined();
    }
  });
});
