// Theme validation and effective defaults, kept in a module of their own so components can use them on their own.
import { ThemeSchema, type DesignSystem, type Theme, type ComponentContract } from './schema';
import { resolveTokens } from '@/lib/theme/resolve';

export function effectiveDefaults(component: ComponentContract, theme: Theme, explicit: Record<string, string | number | boolean | undefined> = {}) {
  const defaults = Object.fromEntries(component.props.filter(p => p.defaultValue !== undefined).map(p => [p.name, p.defaultValue!]));
  return { ...defaults, ...theme.componentDefaults[component.id], ...Object.fromEntries(Object.entries(explicit).filter(([, v]) => v !== undefined)) } as Record<string, string | number | boolean>;
}
export function validateTheme(input: unknown, system: DesignSystem): Theme {
  const theme = ThemeSchema.parse(input);
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
