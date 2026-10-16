// Theme validation and effective defaults, kept in a module of their own so components can use them on their own.
import type { DesignSystem, Theme, ComponentContract } from './schema';
import { parseTheme } from '@/lib/theme/check';

/** The slice of a component contract that theme validation and effective defaults need. */
export type ThemeComponent = { id: string; name: string; props: { name: string; defaultValue?: ComponentContract['props'][number]['defaultValue'] }[]; themeDefaults: ComponentContract['themeDefaults']; compoundVariants: ComponentContract['compoundVariants'] };
/** The slice of the design system the theme runtime needs, so pages do not ship every contract to the browser. */
export type ThemeSystem = Pick<DesignSystem, 'themePresets' | 'defaultThemeId' | 'fonts' | 'tokens'> & { components: ThemeComponent[] };

export const toThemeSystem = (system: DesignSystem): ThemeSystem => ({
  themePresets: system.themePresets, defaultThemeId: system.defaultThemeId, fonts: system.fonts, tokens: system.tokens,
  components: system.components.map(component => ({ id: component.id, name: component.name, props: component.props.filter(prop => prop.defaultValue !== undefined).map(prop => ({ name: prop.name, defaultValue: prop.defaultValue })), themeDefaults: component.themeDefaults, compoundVariants: component.compoundVariants })),
});

import { resolveTokens } from '@/lib/theme/resolve';

export function effectiveDefaults(component: Pick<ThemeComponent, 'id' | 'props'>, theme: Theme, explicit: Record<string, string | number | boolean | undefined> = {}) {
  const defaults = Object.fromEntries(component.props.filter(p => p.defaultValue !== undefined).map(p => [p.name, p.defaultValue!]));
  return { ...defaults, ...theme.componentDefaults[component.id], ...Object.fromEntries(Object.entries(explicit).filter(([, v]) => v !== undefined)) } as Record<string, string | number | boolean>;
}
export function validateTheme(input: unknown, system: ThemeSystem): Theme {
  const theme = parseTheme(input);
  const preset = system.themePresets.find(p => p.id === (theme.basedOn ?? theme.id));
  if (!preset) throw new Error(`Unknown theme identity: ${theme.basedOn ?? theme.id}`);
  for (const [kind, fontId] of [['sans', theme.typography.sansFontId], ['mono', theme.typography.monoFontId]]) {
    if (!system.fonts.some(f => f.id === fontId && f.kind === kind)) throw new Error(`Unknown ${kind} font: ${fontId}`);
  }
  for (const [componentId, defaults] of Object.entries(theme.componentDefaults)) {
    const component = system.components.find(c => c.id === componentId);
    if (!component) throw new Error(`Theme default names unknown component: ${componentId}`);
    for (const [key, value] of Object.entries(defaults)) {
      if (!component.themeDefaults[key as 'variant' | 'size']?.includes(value!)) throw new Error(`Invalid theme default ${componentId}.${key}: ${value}`);
    }
  }
  for (const component of system.components) {
    const defaults = effectiveDefaults(component, theme);
    for (const compound of component.compoundVariants) {
      if (compound.effect === 'disallowed' && Object.entries(compound.when).every(([key, value]) => defaults[key] === value)) throw new Error(`Disallowed default combination for ${component.id}`);
    }
  }
  resolveTokens(system.tokens, theme, system.fonts);
  return theme;
}
