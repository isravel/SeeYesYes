import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { buildLlmsFullTxt, buildLlmsTxt } from '@/lib/contract/agent-files';
import { createContext } from '@/lib/contract/context';
import { contextMarkdown } from '@/lib/contract/serialize';
import { isPageRoute } from '@/lib/routes';

describe('llms.txt', () => {
  const text = buildLlmsTxt(registry);

  it('follows the llms.txt shape: heading, summary, principles, then link sections', () => {
    const lines = text.split('\n');
    expect(lines[0]).toBe(`# ${registry.name}`);
    expect(lines[2].startsWith('> ')).toBe(true);
    for (const principle of registry.principles) expect(text).toContain(`- ${principle}`);
    expect(text.indexOf('## Principles')).toBeLessThan(text.indexOf('## Components'));
    expect(text).toContain('default theme preset');
    expect(text).toContain('/ai/context');
  });

  it('links every component detail page, sorted by ID, with its short purpose, using site-root paths', () => {
    const links = [...text.matchAll(/^- \[(.+?)\]\((\/components\/[a-z-]+)\): (.+)$/gm)];
    expect(links.map(l => l[2])).toEqual(registry.components.map(c => `/components/${c.id}`).sort());
    for (const [, name, , purpose] of links) {
      const component = registry.components.find(c => c.name === name)!;
      expect(purpose).toBe(component.shortPurpose);
    }
    expect([...text.matchAll(/\]\((https?:)/g)]).toHaveLength(0);
  });

  it('only links to screens that exist', () => {
    const targets = [...text.matchAll(/\]\((\/[^)]*)\)/g)].map(m => m[1]);
    const known = new Set(['/system/tokens', '/system/rules', '/accessibility', '/ai/context', '/llms-full.txt', ...registry.components.map(c => `/components/${c.id}`)]);
    for (const target of targets) expect(known.has(target), target).toBe(true);
  });

  it('is deterministic', () => {
    expect(buildLlmsTxt(registry)).toBe(text);
    expect(buildLlmsTxt({ ...registry, components: [...registry.components].reverse() })).toBe(text);
  });
});

describe('llms-full.txt', () => {
  it('is the full-mode Markdown for the default theme, behind a note saying so', () => {
    const text = buildLlmsFullTxt(registry);
    const context = createContext(registry, { mode: 'full' });
    expect(context.scope).toBe('default-theme');
    expect(text.startsWith('> This file is generated at build time')).toBe(true);
    expect(text.endsWith(contextMarkdown(context))).toBe(true);
    expect(text).toContain('scope default-theme');
    for (const component of registry.components) expect(text).toContain(`(\`${component.id}\`)`);
    expect(buildLlmsFullTxt(registry)).toBe(text);
  });
});

describe('route kinds', () => {
  it('treats pages as client routes and files and API routes as plain links', () => {
    for (const href of ['/', '/components/button', '/system/tokens#color.primary', '/ai/context']) expect(isPageRoute(href), href).toBe(true);
    for (const href of ['/llms.txt', '/llms-full.txt', '/api/registry', '/sample-avatar.svg', '#main', 'https://example.com']) expect(isPageRoute(href), href).toBe(false);
  });
});

import { buildAgentsSnippet, AGENTS_SNIPPET_TARGET_BYTES } from '@/lib/contract/agent-files';
import { byteLength } from '@/lib/contract/export-files';
import { defaultTheme } from '@/lib/data/registry';
import { assignThemeIdentity } from '@/lib/theme/identity';

describe('AGENTS.md snippet', () => {
  const settings = (theme = defaultTheme, appearance: 'light' | 'dark' | 'system' = 'system') => ({ settingsVersion: 1 as const, theme, appearance });
  const snippet = buildAgentsSnippet(registry, settings());

  it('includes every component with its verified import, and every system rule', () => {
    for (const component of registry.components) {
      expect(snippet, component.id).toContain(`- ${component.name}: \`import { ${component.publicImport.exportName} } from "${component.publicImport.module}";\` ${component.shortPurpose}`);
    }
    for (const rule of registry.rules.filter(r => r.appliesTo === 'system')) expect(snippet, rule.id).toContain(`- \`${rule.id}\` (${rule.severity}): ${rule.description}`);
    for (const rule of registry.rules.filter(r => r.appliesTo !== 'system')) expect(snippet).not.toContain(`\`${rule.id}\``);
    for (const text of [...registry.principles, ...registry.project.guidance]) expect(snippet).toContain(text);
    expect(snippet).toContain('/ai/context');
    expect(snippet).toContain('/llms.txt');
  });

  it('stays near its size target without dropping anything', () => {
    expect(byteLength(snippet)).toBeLessThanOrEqual(AGENTS_SNIPPET_TARGET_BYTES * 1.25);
    expect(byteLength(snippet)).toBeGreaterThan(AGENTS_SNIPPET_TARGET_BYTES * 0.5);
  });

  it('is deterministic and independent of record order', () => {
    expect(buildAgentsSnippet(registry, settings())).toBe(snippet);
    expect(buildAgentsSnippet({ ...registry, components: [...registry.components].reverse(), rules: [...registry.rules].reverse() }, settings())).toBe(snippet);
  });

  it('updates after Apply: the theme ID, its base, the appearance, and only the defaults that changed', () => {
    expect(snippet).toContain('Theme: `default`.');
    expect(snippet).not.toContain('(default ');
    const edited = assignThemeIdentity({ ...defaultTheme, componentDefaults: { button: { variant: 'ghost' } } }, registry.themePresets);
    const applied = buildAgentsSnippet(registry, settings(edited, 'dark'));
    expect(applied).toContain('Theme: `custom` (based on `default`). Appearance: dark.');
    expect(applied).toMatch(/- Button: .* \(default variant=ghost\)/);
    expect(applied.match(/\(default /g)).toHaveLength(1);
    expect(applied).not.toBe(snippet);
  });

  it('rejects invalid settings instead of writing a misleading snippet', () => {
    expect(() => buildAgentsSnippet(registry, { settingsVersion: 1, theme: defaultTheme, appearance: 'sepia' })).toThrow();
  });
});
