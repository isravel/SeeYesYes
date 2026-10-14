import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { buildReferenceArticles, loadArticles, loadGuides } from '@/lib/docs/articles';
import { extractHeadings, plainText, renderMarkdown, slugify, withRootLinks } from '@/lib/docs/markdown';
import { buildSearchIndex, excerpt, searchDocs, summarize } from '@/lib/docs/search';

const articles = loadArticles(registry);
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
const knownRoutes = new Set(['/', '/getting-started', '/system/theme', '/system/tokens', '/system/rules', '/components', '/layouts', '/ai/context', '/accessibility', '/validation', '/playground', '/docs', '/llms.txt', '/llms-full.txt',
  ...registry.components.map(c => `/components/${c.id}`), ...articles.map(a => `/docs/${a.slug}`)]);
const linksIn = (markdown: string) => [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1]);

describe('documentation sources', () => {
  it('has the eight required topics, hand-written ones apart from generated reference', () => {
    expect(articles.map(a => a.slug).sort()).toEqual(['accessibility', 'concepts', 'configuration', 'context', 'reference-components', 'reference-rules', 'reference-tokens', 'setup']);
    expect(articles.filter(a => a.kind === 'guide')).toHaveLength(5);
    expect(articles.filter(a => a.kind === 'reference').map(a => a.slug)).toEqual(['reference-components', 'reference-tokens', 'reference-rules']);
    expect(loadGuides().every(a => a.kind === 'guide')).toBe(true);
    for (const a of articles) { expect(a.title.length, a.slug).toBeGreaterThan(3); expect(a.description.length).toBeGreaterThan(10); expect(a.markdown.startsWith('# ')).toBe(true); }
  });

  it('keeps links valid: every site link resolves to a real screen or heading', () => {
    for (const a of articles) for (const target of linksIn(a.markdown)) {
      expect(target.startsWith('/'), `${a.slug}: ${target} must be a site-root path`).toBe(true);
      const [path, hash] = target.split('#');
      expect(knownRoutes.has(path), `${a.slug}: ${target}`).toBe(true);
      if (hash && path.startsWith('/docs/')) expect(articles.find(x => `/docs/${x.slug}` === path)!.headings.map(h => h.id), target).toContain(hash);
      if (hash && path === '/system/rules') expect(registry.rules.map(r => r.id)).toContain(hash);
    }
  });

  it('matches the shipped prototype: scripts, imports, and the Node version exist', () => {
    const major = readFileSync('.nvmrc', 'utf8').trim();
    for (const a of articles) {
      for (const [, script] of a.markdown.matchAll(/npm run ([\w:-]+)/g)) expect(pkg.scripts[script], `${a.slug}: npm run ${script}`).toBeDefined();
      for (const [, module] of a.markdown.matchAll(/from "(@\/[^"]+)"/g)) expect(existsSync(`${module.replace('@/', '')}.tsx`), `${a.slug}: ${module}`).toBe(true);
    }
    expect(articles.find(a => a.slug === 'setup')!.markdown).toContain(`Node.js ${major}`);
  });

  it('makes no claim about a package, installer, hosting, or review that does not exist', () => {
    const text = articles.map(a => a.markdown.toLowerCase()).join('\n');
    for (const claim of ['npm install seeyesyes', 'npx seeyesyes', 'pnpm add', 'yarn add', 'is wcag compliant', 'fully accessible', 'certified']) expect(text).not.toContain(claim);
    expect(articles.find(a => a.slug === 'accessibility')!.markdown).toContain('Not reviewed');
  });
});

describe('generated reference', () => {
  it('summarizes the registry and links to the canonical screens', () => {
    const reference = buildReferenceArticles(registry);
    const components = reference.find(a => a.slug === 'reference-components')!;
    expect([...components.markdown.matchAll(/\]\((\/components\/[a-z-]+)\)/g)].map(m => m[1])).toEqual(registry.components.map(c => `/components/${c.id}`).sort());
    const tokens = reference.find(a => a.slug === 'reference-tokens')!;
    expect(tokens.markdown).toContain(`There are ${registry.tokens.length} tokens in total.`);
    const rules = reference.find(a => a.slug === 'reference-rules')!;
    for (const rule of registry.rules) expect(rules.markdown).toContain(`(/system/rules#${rule.id})`);
    expect(buildReferenceArticles(registry)).toEqual(reference);
  });
});

describe('markdown helpers', () => {
  it('gives headings unique stable IDs that match the rendered anchors', () => {
    const md = '# Title\n\n## Same\n\n## Same\n\n### `Code` heading';
    const headings = extractHeadings(md);
    expect(headings.map(h => h.id)).toEqual(['title', 'same', 'same-2', 'code-heading']);
    const html = renderMarkdown(md);
    for (const heading of headings) expect(html).toContain(`id="${heading.id}"`);
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('escapes raw HTML and makes code blocks keyboard reachable', () => {
    const html = renderMarkdown('# T\n\n<script>alert(1)</script>\n\n```sh\nnpm ci\n```');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('<pre tabindex="0">');
  });

  it('writes links as site-root paths for Copy for LLM, leaving absolute and hash links alone', () => {
    expect(withRootLinks('[a](docs/x) [b](./y) [c](/z) [d](https://example.com) [e](#top)')).toBe('[a](/docs/x) [b](/y) [c](/z) [d](https://example.com) [e](#top)');
    expect(plainText('# T\n\nSome `code` and [link](/x).')).toBe('T Some code and link.');
  });
});

describe('local search', () => {
  const index = buildSearchIndex(articles.map(summarize));

  it('finds articles and headings, and deep links to the heading', () => {
    const hits = searchDocs(index, 'discard');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].href.startsWith('/docs/configuration')).toBe(true);
    const heading = searchDocs(index, 'Apply, Discard').find(hit => hit.headingId);
    expect(heading?.href).toBe('/docs/configuration#apply-discard-and-reset');
  });

  it('requires every term, ignores case, ranks title matches first, and reports no match with an empty list', () => {
    expect(searchDocs(index, 'CONTRAST measured').length).toBeGreaterThan(0);
    expect(searchDocs(index, 'contrast zzz-none')).toEqual([]);
    expect(searchDocs(index, '   ')).toEqual([]);
    const ranked = searchDocs(index, 'accessibility');
    expect(ranked[0].slug).toBe('accessibility');
  });

  it('indexes the generated reference too, so results land on real routes', () => {
    const hit = searchDocs(index, 'wcag-contrast').find(result => result.slug === 'reference-rules');
    expect(hit?.href).toBe('/docs/reference-rules');
    for (const result of searchDocs(index, 'the')) expect(knownRoutes.has(result.href.split('#')[0]), result.href).toBe(true);
  });

  it('shows an excerpt around the match', () => {
    const text = 'a'.repeat(100) + ' needle ' + 'b'.repeat(200);
    expect(excerpt(text, 'needle')).toContain('needle');
    expect(excerpt(text, 'needle').startsWith('…')).toBe(true);
  });
});
