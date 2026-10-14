import type { AIContext } from './schema';

/** Sort object keys as well as records so insertion order never changes identity or exports. */
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonicalize(v)]));
  return value;
}
export const stableJson = (value: unknown) => JSON.stringify(canonicalize(value), null, 2);
type ContextComponent = Extract<AIContext, { mode: 'task' | 'full' }>['components'][number];
type ContextToken = Extract<AIContext, { mode: 'task' | 'full' }>['tokens'][number];
type ContextRule = Extract<AIContext, { mode: 'task' }>['rules'][number];
type ContextExample = Extract<AIContext, { mode: 'task' }>['examples'][number];

const list = (items: readonly string[]) => items.map(item => `- ${item}`).join('\n');
const code = (value: string, language = 'tsx') => `\`\`\`${language}\n${value}\n\`\`\``;
const cell = (value: unknown) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const colorText = (c: { l: number; c: number; h: number; alpha: number }) => `oklch(${c.l} ${c.c} ${c.h} / ${c.alpha})`;
const tokenValue = (token: ContextToken) => typeof token.value === 'object' ? `light ${token.value.light}; dark ${token.value.dark}` : String(token.value);

export function contextCounts(context: AIContext) {
  if (context.mode === 'overview') return { components: context.catalog.length, tokens: 0, rules: 0, examples: 0 };
  const system = context.mode === 'full' ? context.system : context;
  return { components: context.components.length, tokens: context.tokens.length, rules: system.rules.length, examples: system.examples.length };
}

function componentMarkdown(c: ContextComponent): string {
  const variants = Object.entries(c.variants).map(([name, options]) => `${name}: ${options.join(', ')}`);
  const defaults = Object.entries(c.effectiveDefaults).map(([name, value]) => `${name}=${String(value)}`);
  return [
    `### ${c.name} (\`${c.id}\`)`, '',
    `${c.purpose}`, '',
    `- Import: \`import { ${c.publicImport.exportName} } from "${c.publicImport.module}";\``,
    `- Category: ${c.category}; maturity: ${c.maturity}; interactive: ${c.interactive ? 'yes' : 'no'}; accessibility review: ${c.accessibility.status}`,
    `- Element: \`${c.semantics.element}\` (${c.semantics.meaning})`,
    `- Effective defaults under this theme: ${defaults.length ? defaults.join(', ') : 'none'}`,
    `- Variants: ${variants.length ? variants.join('; ') : 'none'}`,
    ...c.compoundVariants.map(v => `- Compound ${JSON.stringify(v.when)} (${v.effect}): ${v.description}`),
    `- States: ${c.states.join(', ')}`,
    `- Tokens: ${c.tokenIds.join(', ')}`,
    `- Rules: ${[...new Set([...c.ruleIds, ...c.accessibility.ruleIds])].join(', ') || 'none'}`,
    `- Examples: ${c.exampleIds.join(', ')}`, '',
    '**Props**', '', '| Prop | Type | Required | Default | Description |', '| --- | --- | --- | --- | --- |',
    ...c.props.map(p => `| ${cell(p.name)} | ${cell(p.allowedValues ? p.allowedValues.join(' \\| ') : p.type)} | ${p.required ? 'yes' : 'no'} | ${cell(p.defaultValue ?? '')} | ${cell(p.description)} |`), '',
    '**Anatomy**', '', list(c.anatomy.map(a => `${a.part}: ${a.description}`)), '',
    '**Accessibility requirements**', '', list(c.accessibility.requirements), '',
    ...(c.accessibility.keyboard.length ? ['**Keyboard**', '', list(c.accessibility.keyboard.map(k => `${k.key}: ${k.behavior}`)), ''] : []),
    '**Prohibited use**', '', list(c.prohibitedUsage), '',
    ...(c.composition.allowedComponentIds.length || c.composition.constraints.length ? ['**Composition**', '', ...(c.composition.allowedComponentIds.length ? [`Works with: ${c.composition.allowedComponentIds.join(', ')}`, ''] : []), ...(c.composition.constraints.length ? [list(c.composition.constraints), ''] : [])] : []),
    '**AI guidance**', '', 'Prefer:', list(c.aiGuidance.prefer), '', 'Avoid:', list(c.aiGuidance.avoid), '',
  ].join('\n');
}

const ruleMarkdown = (r: ContextRule) => [
  `### ${r.id}`, '',
  `- ${r.severity} · ${r.category} · applies to ${r.appliesTo === 'system' ? 'the whole system' : r.appliesTo.join(', ')}`,
  `- ${r.description}`, `- Suggested fix: ${r.suggestedFix}`, `- Violation example: ${r.violationExampleId}; correct example: ${r.correctExampleId}`,
  `- Auto-fix: unavailable. ${r.autoFix.reason}`, '',
].join('\n');

const exampleMarkdown = (e: ContextExample) => [
  `### ${e.title} (\`${e.id}\`)`, '', `- ${e.intent === 'recommended' ? 'Recommended' : 'Violation'} example for ${e.componentIds.join(', ') || 'no component'}`,
  ...(e.intent === 'violation' ? [`- Why it is wrong: ${e.explanation}`] : []), '', code(e.code), '',
].join('\n');

/**
 * Readable Markdown for the same data as the JSON export. Every component, token, rule, and example in the JSON appears here
 * with its identifying fields, in the same order. The JSON stays the exact structured payload.
 */
export function contextMarkdown(context: AIContext): string {
  const out: string[] = [
    `# ${context.identity.name}`, '',
    `${context.mode} context · schema ${context.schemaVersion} · scope ${context.scope} · theme ${context.themeId}${context.basedOnThemeId ? ` (based on ${context.basedOnThemeId})` : ''} · appearance ${context.appearance}`, '',
    `This export uses the ${context.scope === 'default-theme' ? 'default preset' : 'applied workspace theme'}. Mode-dependent values include both light and dark.`, '',
    '## Principles', '', list(context.principles), '',
    '## Project guidance', '', `Framework: ${context.project.framework}; styling: ${context.project.styling}.`, '', list(context.project.guidance), '',
  ];
  if (context.mode === 'overview') {
    out.push('## Component catalog', '', '| Component | Category | Purpose | Import |', '| --- | --- | --- | --- |',
      ...context.catalog.map(c => `| ${cell(c.name)} (\`${c.id}\`) | ${c.category} | ${cell(c.shortPurpose)} | \`import { ${c.publicImport.exportName} } from "${c.publicImport.module}";\` |`), '');
    return `${out.join('\n')}\n`;
  }
  const theme = context.theme;
  out.push('## Theme', '',
    `- Typography: sans ${theme.typography.sansFontId}, mono ${theme.typography.monoFontId}, scale ${theme.typography.scale}`,
    `- Radius ${theme.radius}; density ${theme.density}; shadows ${theme.shadows}; surface ${theme.effects.surface}; motion ${theme.motion}`,
    ...(Object.keys(theme.componentDefaults).length ? [`- Component defaults: ${Object.entries(theme.componentDefaults).map(([id, d]) => `${id} ${Object.entries(d).map(([k, v]) => `${k}=${String(v)}`).join(' ')}`).join('; ')}`] : []), '');
  for (const mode of ['light', 'dark'] as const) {
    out.push(`### ${mode[0].toUpperCase()}${mode.slice(1)} colors`, '', list(Object.entries(theme.colors[mode]).sort(([a], [b]) => a.localeCompare(b)).map(([role, color]) => `${role}: ${colorText(color)}`)), '');
  }
  if (context.mode === 'task') {
    out.push('## Selection', '', `Requested: ${context.selection.requestedComponentIds.join(', ')}`, '', `Included with required dependencies: ${context.selection.includedComponentIds.join(', ')}`, '');
  }
  out.push('## Components', '', ...context.components.map(componentMarkdown));
  out.push('## Tokens', '', '| Token | CSS variable | Category | Value | Purpose |', '| --- | --- | --- | --- | --- |',
    ...context.tokens.map(t => `| ${t.id} | \`${t.cssVariable}\` | ${t.category} | ${cell(tokenValue(t))} | ${cell(t.purpose)} |`), '');
  const rules = context.mode === 'full' ? context.system.rules : context.rules;
  const examples = context.mode === 'full' ? context.system.examples : context.examples;
  out.push('## Rules', '', ...rules.map(ruleMarkdown), '## Examples', '', ...examples.map(exampleMarkdown));
  if (context.mode === 'task' && context.referencedComponents.length) {
    out.push('## Referenced components', '', 'Mentioned by included examples or rules but not included in full:', '', list(context.referencedComponents.map(c => `${c.name} (\`${c.id}\`): ${c.shortPurpose}`)), '');
  }
  if (context.mode === 'full') {
    out.push('## Layouts', '', list(context.system.layouts.map(l => `${l.title} (\`${l.id}\`): ${l.purpose} Uses ${l.componentIds.join(', ')}.`)), '',
      '## Fonts', '', list(context.system.fonts.map(f => `${f.family} (${f.id}, ${f.kind}, ${f.source})`)), '',
      '## Theme presets', '', list(context.system.themePresets.map(t => t.id)), '');
  }
  return `${out.join('\n')}\n`;
}
