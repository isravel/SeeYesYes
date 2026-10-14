import type { DesignSystem } from './schema';
import { createContext } from './context';
import { contextMarkdown } from './serialize';

const DEFAULT_THEME_NOTE = 'This file is generated at build time from the registry and the default theme preset. It cannot see a browser\'s applied settings. For an export that matches your applied theme, use AI Context at /ai/context.';
const byId = <T extends { id: string }>(items: T[]) => [...items].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

/**
 * `/llms.txt` in the llms.txt format: a heading, a one-line summary, the principles, then link sections.
 * Only links to screens that exist are written; Getting Started and Documentation are added with those screens.
 */
export function buildLlmsTxt(system: DesignSystem): string {
  const lines = [
    `# ${system.name}`, '',
    `> ${system.principles[0]} A design system that humans and AI can understand: one contract of components, tokens, and rules.`, '',
    DEFAULT_THEME_NOTE, '',
    '## Principles', '', ...system.principles.map(principle => `- ${principle}`), '',
    '## Project guidance', '', ...system.project.guidance.map(item => `- ${item}`), '',
    '## System', '',
    '- [Tokens](/system/tokens): Resolved design tokens with values, purposes, and Design Tokens downloads.',
    '- [Rules](/system/rules): The system rules with violation and corrected examples.',
    '- [Accessibility](/accessibility): Review evidence, measured contrast, and clearly labeled sample results.',
    '- [Layouts](/layouts): Seven demo compositions built only from system components.', '',
    '## Components', '', ...byId(system.components).map(component => `- [${component.name}](/components/${component.id}): ${component.shortPurpose}`), '',
    '## AI', '',
    '- [AI Context](/ai/context): Overview, task, and full context exports for the applied theme.',
    '- [Full context](/llms-full.txt): The complete system in one Markdown file, for the default theme.', '',
  ];
  return `${lines.join('\n')}\n`;
}

/** `/llms-full.txt`: the full-mode Markdown export for the default theme. Documentation articles are appended once they exist. */
export function buildLlmsFullTxt(system: DesignSystem): string {
  const context = createContext(system, { mode: 'full' });
  return `> ${DEFAULT_THEME_NOTE}\n\n${contextMarkdown(context)}`;
}

export const AGENTS_SNIPPET_TARGET_BYTES = 4096;

import { validateTheme, effectiveDefaults } from './validate';
import { WorkspaceSettingsSchema } from './schema';

/**
 * The `AGENTS.md` snippet: an index like overview mode, not implementation guidance. Every line comes from contract fields.
 * Nothing is dropped to fit a size target; if it runs long, tighten `shortPurpose` or rule descriptions in the registry.
 */
export function buildAgentsSnippet(system: DesignSystem, settingsInput: unknown): string {
  const settings = WorkspaceSettingsSchema.parse(settingsInput);
  const theme = validateTheme(settings.theme, system);
  const contractDefaults = (component: DesignSystem['components'][number]) => effectiveDefaults(component, { ...theme, componentDefaults: {} });
  const componentLine = (component: DesignSystem['components'][number]) => {
    const applied = effectiveDefaults(component, theme);
    const base = contractDefaults(component);
    const changed = Object.keys(applied).filter(name => applied[name] !== base[name]).sort().map(name => `${name}=${String(applied[name])}`);
    return `- ${component.name}: \`import { ${component.publicImport.exportName} } from "${component.publicImport.module}";\` ${component.shortPurpose}${changed.length ? ` (default ${changed.join(', ')})` : ''}`;
  };
  const rules = byId(system.rules.filter(rule => rule.appliesTo === 'system'));
  const lines = [
    `## ${system.name} design system`, '',
    `Use the ${system.name} design system for UI in this project. ${system.principles[0]}`, '',
    '### Principles', '', ...system.principles.map(principle => `- ${principle}`), '',
    '### Project guidance', '', ...system.project.guidance.map(item => `- ${item}`), '',
    `### Theme`, '', `Theme: \`${theme.id}\`${theme.basedOn ? ` (based on \`${theme.basedOn}\`)` : ''}. Appearance: ${settings.appearance}. Use semantic CSS variables from the system; do not hard-code colors.`, '',
    '### Components', '', 'Prefer these over custom markup. Import each from its module.', '', ...byId(system.components).map(componentLine), '',
    '### Rules', '', ...rules.map(rule => `- \`${rule.id}\` (${rule.severity}): ${rule.description}`), '',
    '### More detail', '', 'For detailed work on specific components, copy a task export from AI Context (/ai/context). The full system is at /llms-full.txt and an index at /llms.txt.', '',
  ];
  return `${lines.join('\n')}\n`;
}
