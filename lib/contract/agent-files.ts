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
    '- [Accessibility](/accessibility): Review evidence, measured contrast, and clearly labeled sample results.', '',
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
