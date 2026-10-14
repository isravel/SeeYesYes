import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { layoutExamples } from '@/lib/data/layout-contracts';

describe('layout examples', () => {
  it('provide the seven required compositions with unique IDs and preview keys', () => {
    expect(layoutExamples.map(l => l.id).sort()).toEqual(['dashboard', 'dense-data', 'detail-view', 'marketing', 'page-shell', 'settings', 'split-view']);
    expect(new Set(layoutExamples.map(l => l.previewKey)).size).toBe(7);
    expect(registry.layouts).toEqual(layoutExamples);
  });

  it('use only registered components, each listed once', () => {
    const ids = new Set(registry.components.map(c => c.id));
    for (const layout of layoutExamples) {
      expect(layout.componentIds.length, layout.id).toBeGreaterThan(0);
      expect(new Set(layout.componentIds).size).toBe(layout.componentIds.length);
      for (const id of layout.componentIds) expect(ids.has(id), `${layout.id} uses ${id}`).toBe(true);
    }
  });
});
