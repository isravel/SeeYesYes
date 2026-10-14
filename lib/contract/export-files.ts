import type { AIContext } from './schema';

/** UTF-8 size in bytes. These are byte counts, not token counts. */
export const byteLength = (text: string) => new TextEncoder().encode(text).length;
export const formatBytes = (bytes: number) => `${bytes.toLocaleString('en-US')} bytes`;

/** A stable, descriptive filename for a context export. Task exports name their requested components. */
export function contextFilename(context: AIContext, extension: 'json' | 'md'): string {
  const selection = context.mode === 'task' ? `-${context.selection.requestedComponentIds.join('+')}` : '';
  return `seeyesyes.${context.mode}${selection}.context.${extension}`;
}
export const SETTINGS_FILENAME = 'seeyesyes.settings.json';
