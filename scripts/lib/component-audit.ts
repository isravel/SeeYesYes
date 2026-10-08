import type { ComponentContract, TokenDefinition } from '../../lib/contract/schema';

// This checks direct CSS imports. Child components own their own token contracts.
export function auditComponentStyles(component: ComponentContract, css: string, tokens: TokenDefinition[]): string[] {
  const issues: string[] = [];
  const variables = new Map(tokens.map(token => [token.cssVariable, token.id]));
  const referenced = new Set<string>();
  for (const [, variable] of css.matchAll(/var\((--sys-[\w-]+)/g)) {
    const id = variables.get(variable);
    if (id) referenced.add(id); else issues.push(`Unknown CSS token ${variable}`);
  }
  for (const id of referenced) if (!component.tokenIds.includes(id)) issues.push(`Missing CSS token ${id}`);
  for (const id of component.tokenIds) if (!referenced.has(id)) issues.push(`Unused CSS token ${id}`);
  const cssStates: [RegExp, string[]][] = [
    [/:hover|\[data-hovered\]/, ['hover', 'hovered']],
    [/:active/, ['pressed']],
    [/:focus-visible|\[data-focus-visible\]/, ['focus-visible']],
    [/\[data-focused\]/, ['focused']],
    [/:disabled|\[data-disabled\]/, ['disabled']],
    [/:read-only/, ['read-only']],
    [/\[aria-invalid="true"\]/, ['invalid']],
    [/:checked/, ['checked', 'selected', 'on']],
    [/\[data-selected\]/, ['selected']],
    [/prefers-reduced-motion/, ['reduced-motion']],
  ];
  for (const [selector, names] of cssStates) if (selector.test(css) && !names.some(name => component.states.includes(name))) issues.push(`Missing CSS state ${names.join(' / ')}`);
  const combinations: Record<string, string>[] = [];
  for (const [, selectors] of css.matchAll(/([^{}]+)\{/g)) {
    for (const selector of selectors.split(',')) {
      const when: Record<string, string> = {};
      for (const [, name, value] of selector.matchAll(/\[data-([\w-]+)="([^"]+)"\]/g)) {
        if (!component.variants[name]) continue;
        if (!component.variants[name].includes(value)) issues.push(`Unknown CSS variant ${name}=${value}`);
        when[name] = value;
      }
      if (Object.keys(when).length >= 2) combinations.push(when);
    }
  }
  const key = (when: Record<string, string>) => JSON.stringify(Object.entries(when).sort(([a], [b]) => a.localeCompare(b)));
  for (const when of combinations) if (!component.compoundVariants.some(compound => compound.effect === 'styled' && key(compound.when) === key(when))) issues.push(`Missing styled compound ${key(when)}`);
  for (const compound of component.compoundVariants) if (compound.effect === 'styled' && !combinations.some(when => key(when) === key(compound.when))) issues.push(`Unused styled compound ${key(compound.when)}`);
  return issues;
}
