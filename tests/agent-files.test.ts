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
