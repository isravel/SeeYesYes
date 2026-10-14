'use client';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { buildSearchIndex, excerpt, searchDocs, type ArticleSummary } from '@/lib/docs/search';
import styles from './docs.module.css';

export function DocsIndex({ articles }: { articles: ArticleSummary[] }) {
  const [query, setQuery] = useState('');
  const index = useMemo(() => buildSearchIndex(articles), [articles]);
  const results = useMemo(() => searchDocs(index, query), [index, query]);
  const searching = query.trim() !== '';
  const guides = articles.filter(article => article.kind === 'guide');
  const references = articles.filter(article => article.kind === 'reference');
  return <main className={styles.page}>
    <header className={styles.header}>
      <p className={styles.eyebrow}>DOCUMENTATION</p><h1>Documentation</h1>
      <p>Concepts, configuration, context, accessibility, and setup, written by hand, plus reference pages generated from the registry. Search works on this device and sends nothing anywhere.</p>
    </header>
    <section className={styles.search} aria-label="Search documentation">
      <label className={styles.field}>Search documentation
        <Input type="search" value={query} placeholder="Try “apply”, “contrast”, or “AGENTS.md”" onChange={event => setQuery(event.currentTarget.value)} />
      </label>
      {searching && <Button variant="ghost" onClick={() => setQuery('')}>Clear search</Button>}
    </section>
    {searching && <section aria-labelledby="results-heading">
      <h2 id="results-heading" className={styles.visuallyHidden}>Search results</h2>
      <p className={styles.count} role="status" aria-live="polite">{results.length === 0 ? `No results for “${query.trim()}”` : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}</p>
      {results.length === 0
        ? <EmptyState title="No documentation matches" description="Try a different word, or clear the search to browse every article." action={<Button variant="secondary" onClick={() => setQuery('')}>Clear search</Button>} />
        : <ul className={styles.results}>{results.map(result => <li key={result.href}>
          <Link href={result.href}>{result.heading ? `${result.title}: ${result.heading}` : result.title}</Link>
          <p>{excerpt(result.text, query)}</p>
        </li>)}</ul>}
    </section>}
    {!searching && <>
      <section aria-labelledby="guides-heading"><h2 id="guides-heading">Guides</h2>
        <ul className={styles.articles}>{guides.map(article => <li key={article.slug}><Link href={`/docs/${article.slug}`}>{article.title}</Link><p>{article.description}</p></li>)}</ul></section>
      <section aria-labelledby="reference-heading"><h2 id="reference-heading">Reference <Badge>Generated from the registry</Badge></h2>
        <ul className={styles.articles}>{references.map(article => <li key={article.slug}><Link href={`/docs/${article.slug}`}>{article.title}</Link><p>{article.description}</p></li>)}</ul></section>
    </>}
  </main>;
}
