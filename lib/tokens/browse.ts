import type { DesignSystem, ResolvedToken } from '@/lib/contract/schema';

export type TokenFilters = { query: string; category: ResolvedToken['category'] | 'all'; kind: ResolvedToken['kind'] | 'all' };
export const noFilters: TokenFilters = { query: '', category: 'all', kind: 'all' };

export type TokenUsage = { components: { id: string; name: string }[]; examples: { id: string; title: string }[] };

/** Search by ID, CSS variable, category, or purpose; filters combine with AND. */
export function filterTokens(tokens: ResolvedToken[], filters: TokenFilters): ResolvedToken[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.filter(token => {
    if (filters.category !== 'all' && token.category !== filters.category) return false;
    if (filters.kind !== 'all' && token.kind !== filters.kind) return false;
    const haystack = `${token.id} ${token.cssVariable} ${token.category} ${token.purpose}`.toLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}

/** Where each token is used, derived only from component contracts and examples in the registry. */
export function tokenUsage(system: Pick<DesignSystem, 'components' | 'examples' | 'tokens'>): Record<string, TokenUsage> {
  const usage: Record<string, TokenUsage> = Object.fromEntries(system.tokens.map(token => [token.id, { components: [], examples: [] }]));
  for (const component of system.components) {
    for (const id of component.tokenIds) usage[id]?.components.push({ id: component.id, name: component.name });
  }
  const examples = new Map(system.examples.map(example => [example.id, example]));
  for (const token of system.tokens) {
    for (const id of token.exampleIds) {
      const example = examples.get(id);
      if (example) usage[token.id].examples.push({ id: example.id, title: example.title });
    }
  }
  return usage;
}

export const isColorValue = (value: string) => value.startsWith('oklch(');
export const tokenValueText = (value: ResolvedToken['value']): string => typeof value === 'object' ? JSON.stringify(value) : String(value);
