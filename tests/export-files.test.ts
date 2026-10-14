import { describe, expect, it } from 'vitest';
import { registry, defaultTheme } from '@/lib/data/registry';
import { createContext } from '@/lib/contract/context';
import { byteLength, contextFilename, formatBytes, SETTINGS_FILENAME } from '@/lib/contract/export-files';
import { stableJson } from '@/lib/contract/serialize';
import { WorkspaceSettingsSchema } from '@/lib/contract/schema';

describe('export files', () => {
  it('counts UTF-8 bytes, not characters', () => {
    expect(byteLength('abc')).toBe(3);
    expect(byteLength('é')).toBe(2);
    expect(byteLength('日本')).toBe(6);
    expect(formatBytes(12345)).toBe('12,345 bytes');
  });

  it('names exports by mode and requested components', () => {
    expect(contextFilename(createContext(registry, { mode: 'overview' }), 'json')).toBe('seeyesyes.overview.context.json');
    expect(contextFilename(createContext(registry, { mode: 'full' }), 'md')).toBe('seeyesyes.full.context.md');
    expect(contextFilename(createContext(registry, { mode: 'task', componentIds: ['tabs', 'button'] }), 'json')).toBe('seeyesyes.task-button+tabs.context.json');
    expect(SETTINGS_FILENAME).toBe('seeyesyes.settings.json');
  });

  it('serializes settings stably and round-trips through the schema', () => {
    const settings = { settingsVersion: 1 as const, theme: defaultTheme, appearance: 'dark' as const };
    const json = stableJson(WorkspaceSettingsSchema.parse(settings));
    expect(json).toBe(stableJson(WorkspaceSettingsSchema.parse({ appearance: 'dark', theme: defaultTheme, settingsVersion: 1 })));
    expect(WorkspaceSettingsSchema.parse(JSON.parse(json))).toEqual(settings);
    expect(json).not.toContain('bootstrap');
  });
});
