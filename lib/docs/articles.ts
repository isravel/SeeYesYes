import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DesignSystem } from '@/lib/contract/schema';
import { extractHeadings, plainText, type Heading } from './markdown';

export type Article = { slug: string; title: string; description: string; order: number; kind: 'guide' | 'reference'; markdown: string; headings: Heading[]; text: string };

const DOCS_DIR = join(/* turbopackIgnore: true */ process.cwd(), 'content', 'docs');

function parse(slug: string, source: string): Article {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Article ${slug} needs a front matter block.`);
  const meta = Object.fromEntries(match[1].split('\n').map(line => { const i = line.indexOf(':'); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }));
  for (const key of ['title', 'description', 'order']) if (!meta[key]) throw new Error(`Article ${slug} is missing "${key}".`);
  const markdown = match[2].trim();
  return { slug, title: meta.title, description: meta.description, order: Number(meta.order), kind: 'guide', markdown, headings: extractHeadings(markdown), text: plainText(markdown) };
}

/** Hand-written articles, read from Markdown files so the page, search, Copy for LLM, and llms-full all share one source. */
export function loadGuides(dir = DOCS_DIR): Article[] {
  const files = readdirSync(/* turbopackIgnore: true */ dir).filter(file => file.endsWith('.md'));
  const articles = files.map(file => {
    const path = join(/* turbopackIgnore: true */ dir, file);
    return parse(file.replace(/\.md$/, ''), readFileSync(/* turbopackIgnore: true */ path, 'utf8'));
  });
  return articles.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

const byId = <T extends { id: string }>(items: T[]) => [...items].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const article = (slug: string, title: string, description: string, order: number, markdown: string): Article =>
  ({ slug, title, description, order, kind: 'reference', markdown, headings: extractHeadings(markdown), text: plainText(markdown) });

/** Short registry-generated summaries that link to the canonical screens. They never rebuild those screens. */
export function buildReferenceArticles(system: DesignSystem): Article[] {
  const components = ['# Components reference', '', 'One line per component, generated from the registry. Open a component for its variants, states, props, and rules.', '',
    ...byId(system.components).map(c => `- [${c.name}](/components/${c.id}): ${c.shortPurpose} (${c.category}, ${c.maturity})`), ''].join('\n');
  const tokens = ['# Tokens reference', '', 'Token categories and counts, generated from the registry. Values for your applied theme are on the Tokens screen.', '',
    ...[...new Set(system.tokens.map(t => t.category))].sort().map(category => `- [${category}](/system/tokens): ${system.tokens.filter(t => t.category === category).length} tokens`), '',
    `There are ${system.tokens.length} tokens in total. Each has an ID, a CSS variable, and a purpose.`, ''].join('\n');
  const rules = ['# Rules reference', '', 'Every rule, generated from the registry. The Rules screen has violation and corrected examples.', '',
    ...byId(system.rules).map(r => `- [${r.id}](/system/rules#${r.id}): ${r.description} (${r.severity}, ${r.category})`), ''].join('\n');
  return [
    article('reference-components', 'Components reference', 'Every component with its purpose, generated from the registry.', 100, components),
    article('reference-tokens', 'Tokens reference', 'Token categories and counts, generated from the registry.', 101, tokens),
    article('reference-rules', 'Rules reference', 'Every system rule, generated from the registry.', 102, rules),
  ];
}

export function loadArticles(system: DesignSystem, dir?: string): Article[] {
  return [...loadGuides(dir), ...buildReferenceArticles(system)];
}
