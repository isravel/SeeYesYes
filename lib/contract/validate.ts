import { DesignSystemSchema, ThemeSchema, type DesignSystem, type Theme, type ComponentContract } from './schema';
import { resolveTokens, toCssVariable } from '@/lib/theme/resolve';

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
export function validateRegistry(input: unknown): DesignSystem {
  const system = DesignSystemSchema.parse(input);
  const errors: string[] = [];
  const collections = { fonts: system.fonts, presets: system.themePresets, tokens: system.tokens, components: system.components, rules: system.rules, examples: system.examples, layouts: system.layouts };
  const ids = Object.fromEntries(Object.entries(collections).map(([name, records]) => {
    const found = new Set<string>();
    for (const item of records) { if (found.has(item.id)) errors.push(`Duplicate ${name} ID: ${item.id}`); found.add(item.id); }
    return [name, found];
  }));
  const reference = (owner: string, collection: string, references: string[]) => {
    for (const ref of references) if (!ids[collection].has(ref)) errors.push(`${owner}: missing ${collection} reference ${ref}`);
  };
  reference('defaultThemeId', 'presets', [system.defaultThemeId]);
  const variables = new Set<string>();
  for (const token of system.tokens) {
    if (token.cssVariable !== toCssVariable(token.id)) errors.push(`${token.id}: CSS variable must be ${toCssVariable(token.id)}`);
    if (variables.has(token.cssVariable)) errors.push(`Duplicate CSS variable: ${token.cssVariable}`);
    variables.add(token.cssVariable);
    reference(token.id, 'examples', token.exampleIds);
    if (token.source.kind === 'theme' && token.source.path.startsWith('colors.') && !/^colors\.\*\.[A-Za-z]+$/.test(token.source.path)) errors.push(`${token.id}: color paths must include both modes with colors.*.role`);
  }
  for (const component of system.components) {
    reference(component.id, 'tokens', component.tokenIds);
    reference(component.id, 'examples', component.exampleIds);
    reference(component.id, 'components', component.composition.allowedComponentIds);
    reference(component.id, 'rules', [...component.ruleIds, ...component.accessibility.ruleIds]);
    if (component.interactive && !component.accessibility.keyboard.length) errors.push(`${component.id}: interactive component needs keyboard guidance`);
    if (component.accessibility.status === 'reviewed' && !component.accessibility.evidence) errors.push(`${component.id}: reviewed status requires evidence`);
    if (!component.exampleIds.some(ref => system.examples.some(e => e.id === ref && e.intent === 'recommended'))) errors.push(`${component.id}: needs a recommended example`);
    for (const [key, values] of Object.entries(component.themeDefaults)) {
      const prop = component.props.find(p => p.name === key);
      if (!prop || values.some(v => !prop.allowedValues?.includes(v))) errors.push(`${component.id}: themeDefaults.${key} must be allowed by its prop`);
    }
    for (const [key, values] of Object.entries(component.variants)) {
      const prop = component.props.find(p => p.name === key);
      if (!prop || values.some(v => !prop.allowedValues?.includes(v))) errors.push(`${component.id}: variants.${key} must match allowed prop values`);
    }
    for (const prop of component.props) {
      if (prop.defaultValue !== undefined && prop.allowedValues && !prop.allowedValues.includes(prop.defaultValue)) errors.push(`${component.id}.${prop.name}: default is not allowed`);
    }
    const combinations = new Set<string>();
    for (const compound of component.compoundVariants) {
      const entries = Object.entries(compound.when).sort(([a], [b]) => a.localeCompare(b));
      const key = JSON.stringify(entries);
      if (entries.length < 2 || entries.some(([name, value]) => !component.variants[name]?.includes(value))) errors.push(`${component.id}: invalid compound variant`);
      if (combinations.has(key)) errors.push(`${component.id}: duplicate compound variant`);
      combinations.add(key);
    }
    for (const ruleId of [...component.ruleIds, ...component.accessibility.ruleIds]) {
      const rule = system.rules.find(r => r.id === ruleId);
      if (rule && (rule.appliesTo === 'system' || !rule.appliesTo.includes(component.id))) errors.push(`${component.id}: rule ${ruleId} does not apply to this component`);
    }
  }
  const focus = system.rules.find(r => r.id === 'wcag-focus-visible');
  const interactive = system.components.filter(c => c.interactive).map(c => c.id).sort();
  if (!focus || focus.appliesTo === 'system' || JSON.stringify([...focus.appliesTo].sort()) !== JSON.stringify(interactive)) errors.push('wcag-focus-visible must apply exactly to interactive components');
  const required = ['component-prefer-existing', 'token-no-raw-color', 'wcag-focus-visible', 'wcag-contrast', 'avoid-unnecessary-wrapper', 'avoid-custom-button', 'prefer-semantic-link', 'minimize-custom-css'];
  reference('Required rules', 'rules', required);
  for (const rule of system.rules) {
    reference(rule.id, 'examples', [rule.violationExampleId, rule.correctExampleId]);
    if (system.examples.find(e => e.id === rule.violationExampleId)?.intent !== 'violation') errors.push(`${rule.id}: violation example has wrong intent`);
    if (system.examples.find(e => e.id === rule.correctExampleId)?.intent !== 'recommended') errors.push(`${rule.id}: correct example has wrong intent`);
    if (rule.appliesTo !== 'system') {
      reference(rule.id, 'components', rule.appliesTo);
      for (const componentId of rule.appliesTo) {
        const component = system.components.find(c => c.id === componentId);
        if (component && ![...component.ruleIds, ...component.accessibility.ruleIds].includes(rule.id)) errors.push(`${rule.id}: ${componentId} must list this rule`);
      }
    }
  }
  for (const example of system.examples) {
    reference(example.id, 'components', example.componentIds);
    // Only named imports from verified contract modules are allowed in public examples.
    const imports = [...example.code.matchAll(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)];
    if (/\bimport\s*\(/.test(example.code)) errors.push(`${example.id}: dynamic example imports are unsupported`);
    const imported = new Set<string>();
    for (const match of imports) {
      const named = match[1].match(/^\{\s*([\s\S]*?)\s*\}$/);
      if (!named) { errors.push(`${example.id}: use named public imports`); continue; }
      for (const item of named[1].split(',').filter(v => v.trim())) {
        const [symbol] = item.trim().split(/\s+as\s+/);
        const component = system.components.find(c => c.publicImport.module === match[2] && c.publicImport.exportName === symbol);
        if (!component || !example.componentIds.includes(component.id)) errors.push(`${example.id}: unverified public import ${symbol} from ${match[2]}`);
        else imported.add(component.id);
      }
    }
    if (example.intent === 'recommended') for (const ref of example.componentIds) if (!imported.has(ref)) errors.push(`${example.id}: missing public import for ${ref}`);
  }
  for (const layout of system.layouts) reference(layout.id, 'components', layout.componentIds);
  for (const preset of system.themePresets) {
    if (preset.basedOn || preset.id === 'custom') errors.push(`${preset.id}: preset cannot be custom or have basedOn`);
    try { validateTheme(preset, system); } catch (error) { errors.push(`${preset.id}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  if (errors.length) throw new Error(`Registry validation failed:\n- ${errors.join('\n- ')}`);
  return system;
}
