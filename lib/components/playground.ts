import type { ComponentContract } from '@/lib/contract/schema';

export type Selection = Record<string, string>;
type Compound = ComponentContract['compoundVariants'][number];

const matches = (compound: Compound, selection: Selection) => Object.entries(compound.when).every(([name, value]) => selection[name] === value);
export const disallowedBy = (component: ComponentContract, selection: Selection): Compound | undefined =>
  component.compoundVariants.find(compound => compound.effect === 'disallowed' && matches(compound, selection));

/** Whether choosing `option` for `dimension` would produce a combination the contract disallows. */
export function optionStatus(component: ComponentContract, selection: Selection, dimension: string, option: string): { disabled: boolean; reason?: string } {
  const blocked = disallowedBy(component, { ...selection, [dimension]: option });
  return blocked ? { disabled: true, reason: blocked.description } : { disabled: false };
}

/** Styled compound variants that apply to the current selection, for display. */
export const activeCompounds = (component: ComponentContract, selection: Selection) =>
  component.compoundVariants.filter(compound => compound.effect === 'styled' && matches(compound, selection));

/** Start from the effective defaults, then the first option of each variant, avoiding disallowed combinations. */
export function initialSelection(component: ComponentContract, defaults: Record<string, string | number | boolean>): Selection {
  const dimensions = Object.entries(component.variants);
  const start: Selection = Object.fromEntries(dimensions.map(([name, options]) => {
    const wanted = String(defaults[name]);
    return [name, options.includes(wanted) ? wanted : options[0]];
  }));
  if (!disallowedBy(component, start)) return start;
  const search = (index: number, current: Selection): Selection | null => {
    if (index === dimensions.length) return disallowedBy(component, current) ? null : current;
    for (const option of dimensions[index][1]) {
      const found = search(index + 1, { ...current, [dimensions[index][0]]: option });
      if (found) return found;
    }
    return null;
  };
  return search(0, {}) ?? start;
}

/** JSX attribute text for a props object: strings quoted, true bare, numbers braced, empty values skipped. */
export function jsxProps(props: Record<string, unknown>): string {
  return Object.entries(props).map(([name, value]) => {
    if (value === undefined || value === false || value === null) return '';
    if (value === true) return ` ${name}`;
    if (typeof value === 'number') return ` ${name}={${value}}`;
    return ` ${name}=${JSON.stringify(String(value))}`;
  }).join('');
}
