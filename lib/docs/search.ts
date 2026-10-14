import type { Article } from './articles';

export type SearchEntry = { slug: string; title: string; heading: string | null; headingId: string | null; text: string };
export type SearchResult = SearchEntry & { href: string; score: number };

/** The serializable subset of articles the client needs to search them. */
export type ArticleSummary = Pick<Article, 'slug' | 'title' | 'description' | 'kind' | 'headings' | 'text'>;
export const summarize = (article: Article): ArticleSummary => ({ slug: article.slug, title: article.title, description: article.description, kind: article.kind, headings: article.headings, text: article.text });

/** One entry per article and one per heading, so a result can deep link to the right section. */
export function buildSearchIndex(articles: ArticleSummary[]): SearchEntry[] {
  return articles.flatMap(article => [
    { slug: article.slug, title: article.title, heading: null, headingId: null, text: `${article.description} ${article.text}` },
    ...article.headings.filter(h => h.depth > 1).map(h => ({ slug: article.slug, title: article.title, heading: h.text, headingId: h.id, text: h.text })),
  ]);
}

export function searchDocs(index: SearchEntry[], query: string): SearchResult[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const results: SearchResult[] = [];
  for (const entry of index) {
    const title = entry.title.toLowerCase(), heading = (entry.heading ?? '').toLowerCase(), text = entry.text.toLowerCase();
    if (!terms.every(term => title.includes(term) || heading.includes(term) || text.includes(term))) continue;
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 6 : 0) + (heading.includes(term) ? 4 : 0) + (text.includes(term) ? 1 : 0), 0) - (entry.heading ? 0 : 0);
    results.push({ ...entry, href: entry.headingId ? `/docs/${entry.slug}#${entry.headingId}` : `/docs/${entry.slug}`, score });
  }
  return results.sort((a, b) => b.score - a.score || a.href.localeCompare(b.href));
}

/** A short excerpt around the first match, for showing why a result matched. */
export function excerpt(text: string, query: string, length = 140): string {
  const first = query.toLowerCase().split(/\s+/).filter(Boolean).map(term => text.toLowerCase().indexOf(term)).filter(i => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, first - 40);
  return `${start > 0 ? '…' : ''}${text.slice(start, start + length).trim()}${start + length < text.length ? '…' : ''}`;
}
