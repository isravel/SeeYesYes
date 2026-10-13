import { describe, expect, it } from 'vitest';
import { defaultTheme, registry } from '@/lib/data/registry';
import { resolveTokens } from '@/lib/theme/resolve';
import { filterTokens, noFilters, tokenUsage } from '@/lib/tokens/browse';

const tokens = resolveTokens(registry.tokens, defaultTheme, registry.fonts);

describe('token browsing', () => {
  it('returns every token with no filters and never mutates the list', () => {
    const copy = [...tokens];
    expect(filterTokens(tokens, noFilters)).toHaveLength(tokens.length);
    expect(tokens).toEqual(copy);
  });

  it('searches id, CSS variable, category, and purpose, case-insensitively, with every term required', () => {
    const byId = filterTokens(tokens, { ...noFilters, query: 'COLOR.PRIMARY' });
    expect(byId.map(t => t.id)).toContain('color.primary');
    expect(filterTokens(tokens, { ...noFilters, query: '--sys-radius-control' }).map(t => t.id)).toContain('radius.control');
    const purposeWord = tokens.find(t => t.id === 'color.primary')!.purpose.split(' ')[0];
    expect(filterTokens(tokens, { ...noFilters, query: purposeWord }).map(t => t.id)).toContain('color.primary');
    expect(filterTokens(tokens, { ...noFilters, query: 'color zzz-no-match' })).toEqual([]);
    expect(filterTokens(tokens, { ...noFilters, query: '   ' })).toHaveLength(tokens.length);
  });

  it('combines category and kind filters', () => {
    const colors = filterTokens(tokens, { ...noFilters, category: 'color' });
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.every(t => t.category === 'color')).toBe(true);
    const semanticColors = filterTokens(tokens, { query: '', category: 'color', kind: 'semantic' });
    expect(semanticColors.every(t => t.kind === 'semantic' && t.category === 'color')).toBe(true);
    expect(filterTokens(tokens, { query: '', category: 'color', kind: 'primitive' }).length + semanticColors.length).toBe(colors.length);
  });

  it('derives usage from component contracts and token examples only', () => {
    const usage = tokenUsage(registry);
    expect(Object.keys(usage).sort()).toEqual(registry.tokens.map(t => t.id).sort());
    const expected = registry.components.filter(c => c.tokenIds.includes('color.primary')).map(c => c.id).sort();
    expect(usage['color.primary'].components.map(c => c.id).sort()).toEqual(expected);
    expect(expected.length).toBeGreaterThan(0);
    for (const token of registry.tokens) {
      const ids = new Set(registry.examples.map(e => e.id));
      expect(usage[token.id].examples.map(e => e.id)).toEqual(token.exampleIds.filter(id => ids.has(id)));
    }
  });
});
