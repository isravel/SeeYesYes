import type { ComponentContract } from '@/lib/contract/schema';
import type { ComponentReadiness } from '@/lib/contract/readiness';

export type ComponentFilters = { query: string; category: ComponentContract['category'] | 'all' };
export const noComponentFilters: ComponentFilters = { query: '', category: 'all' };

/** Search by name or purpose; the category filter combines with it. */
export function filterComponents(components: ComponentContract[], filters: ComponentFilters): ComponentContract[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  return components.filter(component => {
    if (filters.category !== 'all' && component.category !== filters.category) return false;
    const haystack = `${component.name} ${component.id} ${component.shortPurpose} ${component.purpose}`.toLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}

/** Total variant options across all variant dimensions, counted from the contract. */
export const variantOptionCount = (component: ComponentContract) => Object.values(component.variants).reduce((sum, options) => sum + options.length, 0);

export function catalogSummary(components: ComponentContract[], readiness: Record<string, ComponentReadiness>) {
  const categories = new Map<ComponentContract['category'], number>();
  for (const component of components) categories.set(component.category, (categories.get(component.category) ?? 0) + 1);
  return {
    total: components.length,
    metadataComplete: components.filter(component => readiness[component.id]?.complete).length,
    reviewed: components.filter(component => component.accessibility.status === 'reviewed').length,
    stable: components.filter(component => component.maturity === 'stable').length,
    categories: [...categories.entries()].sort(([a], [b]) => a.localeCompare(b)),
  };
}
