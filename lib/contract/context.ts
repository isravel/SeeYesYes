import { AIContextSchema, WorkspaceSettingsSchema, type DesignSystem, type AIContext, type CatalogEntry, type ComponentContract, type ColorRole } from './schema';
import { validateRegistry, validateTheme, effectiveDefaults } from './validate';
import { resolveTokens } from '@/lib/theme/resolve';

export const catalogEntry = (component: ComponentContract): CatalogEntry => ({
  id: component.id, name: component.name, shortPurpose: component.shortPurpose,
  category: component.category, publicImport: component.publicImport,
});
const sorted = <T extends { id: string }>(items: T[]) => [...items].sort((a, b) => a.id.localeCompare(b.id));
export function createContext(input: DesignSystem, options: {
  mode: AIContext['mode']; settings?: unknown; componentIds?: string[];
}): AIContext {
  const system = validateRegistry(input);
  const settings = options.settings === undefined
    ? { settingsVersion: 1 as const, theme: system.themePresets.find(t => t.id === system.defaultThemeId)!, appearance: 'system' as const }
    : WorkspaceSettingsSchema.parse(options.settings);
  const theme = validateTheme(settings.theme, system);
  const base = {
    schemaVersion: '1.0' as const, scope: options.settings === undefined ? 'default-theme' as const : 'applied-theme' as const,
    identity: { id: system.id, name: system.name, productVersion: system.productVersion },
    principles: system.principles, project: system.project, themeId: theme.id,
    ...(theme.basedOn ? { basedOnThemeId: theme.basedOn } : {}), appearance: settings.appearance,
  };
  const resolved = resolveTokens(system.tokens, theme, system.fonts);
  const contextComponent = (c: ComponentContract) => ({ ...c, effectiveDefaults: effectiveDefaults(c, theme) });
  if (options.mode === 'overview') return AIContextSchema.parse({ ...base, mode: 'overview', catalog: sorted(system.components).map(catalogEntry) });
  if (options.mode === 'full') {
    const { components: _components, tokens: _tokens, ...rest } = system;
    void _components; void _tokens;
    return AIContextSchema.parse({ ...base, mode: 'full', theme, tokens: resolved, components: sorted(system.components).map(contextComponent), system: {
      ...rest, fonts: sorted(rest.fonts), themePresets: sorted(rest.themePresets), rules: sorted(rest.rules), examples: sorted(rest.examples), layouts: sorted(rest.layouts),
    } });
  }
  const requested = [...new Set(options.componentIds ?? [])].sort();
  if (!requested.length) throw new Error('Select at least one component for task context.');
  const componentMap = new Map(system.components.map(c => [c.id, c]));
  const included = new Set<string>();
  const tokenIds = new Set<string>();
  const ruleIds = new Set(system.rules.filter(r => r.appliesTo === 'system').map(r => r.id));
  const exampleIds = new Set<string>();
  const queue = [...requested];
  while (queue.length) {
    const id = queue.shift()!;
    if (included.has(id)) continue;
    const component = componentMap.get(id);
    if (!component) throw new Error(`Unknown selected component: ${id}`);
    included.add(id);
    component.tokenIds.forEach(t => tokenIds.add(t));
    [...component.ruleIds, ...component.accessibility.ruleIds].forEach(r => ruleIds.add(r));
    component.exampleIds.forEach(e => exampleIds.add(e));
    queue.push(...component.composition.allowedComponentIds);
  }
  const tokens = resolved.filter(t => tokenIds.has(t.id));
  tokens.forEach(t => t.exampleIds.forEach(e => exampleIds.add(e)));
  const rules = sorted(system.rules.filter(r => ruleIds.has(r.id)));
  rules.forEach(r => { exampleIds.add(r.violationExampleId); exampleIds.add(r.correctExampleId); });
  const examples = sorted(system.examples.filter(e => exampleIds.has(e.id)));
  if (examples.length !== exampleIds.size) throw new Error('Task context has missing example references.');
  const referenced = new Set<string>();
  examples.forEach(e => e.componentIds.forEach(id => { if (!included.has(id)) referenced.add(id); }));
  rules.forEach(r => { if (r.appliesTo !== 'system') r.appliesTo.forEach(id => { if (!included.has(id)) referenced.add(id); }); });
  const { palette: _palette, colors: _colors, componentDefaults: _defaults, ...themeRest } = theme;
  void _palette; void _colors; void _defaults;
  const roles = tokens.flatMap(t => t.source.kind === 'theme' && t.source.path.startsWith('colors.*.') ? [t.source.path.split('.')[2] as ColorRole] : []);
  const pickColors = (mode: 'light' | 'dark') => Object.fromEntries(roles.map(role => [role, theme.colors[mode][role]]));
  return AIContextSchema.parse({ ...base, mode: 'task',
    selection: { requestedComponentIds: requested, includedComponentIds: [...included].sort() },
    theme: { ...themeRest, colors: { light: pickColors('light'), dark: pickColors('dark') }, componentDefaults: Object.fromEntries(Object.entries(theme.componentDefaults).filter(([id]) => included.has(id))) },
    components: sorted(system.components.filter(c => included.has(c.id))).map(contextComponent), tokens, rules, examples,
    referencedComponents: sorted(system.components.filter(c => referenced.has(c.id))).map(catalogEntry),
  });
}
