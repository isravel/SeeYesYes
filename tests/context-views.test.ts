import { describe, expect, it } from 'vitest';
import { registry, defaultTheme } from '@/lib/data/registry';
import { createContext } from '@/lib/contract/context';
import { assignThemeIdentity } from '@/lib/theme/identity';
import { contextCounts, contextMarkdown, stableJson } from '@/lib/contract/serialize';

const settings = (appearance: 'light' | 'dark' | 'system' = 'system', theme = defaultTheme) => ({ settingsVersion: 1 as const, theme, appearance });
const modes = [
  { mode: 'overview' as const }, { mode: 'task' as const, componentIds: ['button'] }, { mode: 'task' as const, componentIds: ['dialog', 'tabs'] }, { mode: 'full' as const },
];

describe('context Markdown agrees with the JSON export', () => {
  for (const options of modes) {
    it(`${options.mode}${'componentIds' in options ? ` (${(options.componentIds ?? []).join(', ')})` : ''}: same components, tokens, rules, and examples in the same order`, () => {
      const context = createContext(registry, { ...options, settings: settings() });
      const markdown = contextMarkdown(context);
      expect(markdown).toBe(contextMarkdown(createContext(registry, { ...options, settings: settings() })));
      expect(markdown.startsWith(`# ${registry.name}`)).toBe(true);
      expect(markdown).toContain(`${context.mode} context · schema ${context.schemaVersion} · scope ${context.scope} · theme ${context.themeId}`);
      const headings = (pattern: RegExp) => [...markdown.matchAll(pattern)].map(match => match[1]);
      if (context.mode === 'overview') {
        const rows = [...markdown.matchAll(/^\| .*? \(`([a-z-]+)`\) \|/gm)].map(m => m[1]);
        expect(rows).toEqual(context.catalog.map(c => c.id));
        expect(markdown).not.toContain('## Tokens');
        return;
      }
      expect(headings(/^### .*? \(`([a-z-]+)`\)$/gm).filter(id => context.components.some(c => c.id === id))).toEqual(context.components.map(c => c.id));
      expect([...markdown.matchAll(/^\| ([a-z0-9.-]+) \| `--sys-/gm)].map(m => m[1])).toEqual(context.tokens.map(t => t.id));
      const rules = context.mode === 'full' ? context.system.rules : context.rules;
      const examples = context.mode === 'full' ? context.system.examples : context.examples;
      expect(headings(/^### ([a-z-]+)$/gm)).toEqual(rules.map(r => r.id));
      for (const example of examples) expect(markdown).toContain(`### ${example.title} (\`${example.id}\`)`);
      for (const component of context.components) for (const [name, value] of Object.entries(component.effectiveDefaults)) expect(markdown).toContain(`${name}=${String(value)}`);
    });
  }

  it('shows both light and dark values for mode-dependent tokens and both color maps', () => {
    const markdown = contextMarkdown(createContext(registry, { mode: 'task', componentIds: ['button'], settings: settings() }));
    expect(markdown).toMatch(/\| color\.primary \| `--sys-color-primary` \| color \| light oklch\(.*\); dark oklch\(.*\) \|/);
    expect(markdown).toContain('### Light colors');
    expect(markdown).toContain('### Dark colors');
  });

  it('is the same for any appearance setting except the labeled appearance', () => {
    const system = contextMarkdown(createContext(registry, { mode: 'task', componentIds: ['button'], settings: settings('system') }));
    const dark = contextMarkdown(createContext(registry, { mode: 'task', componentIds: ['button'], settings: settings('dark') }));
    expect(dark.replace('appearance dark', 'appearance system')).toBe(system);
  });

  it('changes with the applied theme and labels a custom theme and its base', () => {
    const edited = assignThemeIdentity({ ...defaultTheme, radius: 'curvy', componentDefaults: { button: { variant: 'ghost' } } }, registry.themePresets);
    const markdown = contextMarkdown(createContext(registry, { mode: 'task', componentIds: ['button'], settings: settings('light', edited) }));
    expect(markdown).toContain(`theme custom (based on ${defaultTheme.id})`);
    expect(markdown).toContain('variant=ghost');
    expect(markdown).toMatch(/\| radius\.control \| `--sys-radius-control` \| radius \| 1rem \|/);
    expect(markdown).not.toBe(contextMarkdown(createContext(registry, { mode: 'task', componentIds: ['button'], settings: settings('light') })));
  });

  it('counts what the export contains', () => {
    const task = createContext(registry, { mode: 'task', componentIds: ['dialog'], settings: settings() });
    if (task.mode !== 'task') throw new Error('expected task context');
    expect(contextCounts(task)).toEqual({ components: task.components.length, tokens: task.tokens.length, rules: task.rules.length, examples: task.examples.length });
    const full = createContext(registry, { mode: 'full', settings: settings() });
    expect(contextCounts(full)).toEqual({ components: registry.components.length, tokens: registry.tokens.length, rules: registry.rules.length, examples: registry.examples.length });
    expect(contextCounts(createContext(registry, { mode: 'overview', settings: settings() })).components).toBe(registry.components.length);
  });

  it('keeps JSON stable and sorted regardless of selection order', () => {
    const a = createContext(registry, { mode: 'task', componentIds: ['tabs', 'dialog'], settings: settings() });
    const b = createContext(registry, { mode: 'task', componentIds: ['dialog', 'tabs'], settings: settings() });
    expect(stableJson(a)).toBe(stableJson(b));
    expect(a.mode === 'task' && a.selection.requestedComponentIds).toEqual(['dialog', 'tabs']);
  });

  it('rejects an empty or unknown task selection with a clear error', () => {
    expect(() => createContext(registry, { mode: 'task', componentIds: [] })).toThrow(/Select at least one component/);
    expect(() => createContext(registry, { mode: 'task', componentIds: ['nope'] })).toThrow(/Unknown selected component: nope/);
  });
});
