import type { AIContext } from './schema';

/** Sort object keys as well as records so insertion order never changes identity or exports. */
export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonicalize(v)]));
  return value;
}
export const stableJson = (value: unknown) => JSON.stringify(canonicalize(value), null, 2);
export function contextMarkdown(context: AIContext): string {
  const heading = `# ${context.identity.name}\n\n${context.mode} context · ${context.scope} · theme ${context.themeId} · appearance ${context.appearance}\n\n`;
  // Preserve the complete typed payload. Later screens can render the same object as structured prose.
  return `${heading}This export uses the ${context.scope === 'default-theme' ? 'default preset' : 'applied workspace theme'}. Mode-dependent values include both light and dark.\n\n\`\`\`json\n${stableJson(context)}\n\`\`\`\n`;
}
