'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { useThemeScope } from '@/components/theme/ThemeScope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { Select } from '@/components/ui/select';
import type { FontOption, Mode, ResolvedToken } from '@/lib/contract/schema';
import { createHttpAdapter } from '@/lib/data/adapter';
import { downloadText } from '@/lib/browser/download';
import type { Scenario } from '@/lib/data/api';
import { resolveTokens } from '@/lib/theme/resolve';
import { DESIGN_TOKENS_FORMAT, exportDesignTokens, NOTES_FILENAME, TokenExportError } from '@/lib/contract/design-tokens';
import { filterTokens, isColorValue, noFilters, type TokenFilters, type TokenUsage } from '@/lib/tokens/browse';
import styles from './tokens.module.css';

const categories: ResolvedToken['category'][] = ['color', 'typography', 'spacing', 'radius', 'shadow', 'effect', 'motion'];

type Props = { scenario: Scenario; fonts: FontOption[]; usage: Record<string, TokenUsage> };
const adapter = createHttpAdapter();

export function TokensView(props: Props) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Tokens {...props} /></QueryClientProvider>;
}

function Tokens({ scenario, fonts, usage }: Props) {
  const stores = useThemeStores();
  const theme = useStore(stores.applied, state => state.settings.theme);
  const initialized = useStore(stores.applied, state => state.initialized);
  const mode = useThemeScope()?.mode ?? null;
  const query = useQuery({ queryKey: ['tokens', scenario], queryFn: ({ signal }) => adapter.get('tokens', { scenario, signal }), retry: false, staleTime: Infinity });
  const [filters, setFilters] = useState<TokenFilters>(noFilters);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const tokens = useMemo(() => query.data ? resolveTokens(query.data, theme, fonts) : [], [query.data, theme, fonts]);
  const exported = useMemo(() => {
    if (tokens.length === 0) return null;
    try { return { ok: true as const, ...exportDesignTokens(tokens, theme) }; }
    catch (error) { return { ok: false as const, message: error instanceof TokenExportError ? error.message : 'The export could not be built.' }; }
  }, [tokens, theme]);
  const shown = useMemo(() => filterTokens(tokens, filters), [tokens, filters]);
  const filtered = filters.query !== '' || filters.category !== 'all' || filters.kind !== 'all';
  const clear = () => setFilters(noFilters);

  return <main className={styles.page} aria-busy={!initialized || query.isPending}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>SYSTEM · TOKENS</p><h1>Tokens</h1>
        <p>Resolved values from the applied theme{theme.id === 'custom' ? ` (custom, based on ${theme.basedOn})` : ` (${theme.id})`}. Draft edits in the Theme editor appear here only after you apply them.</p></div>
      <Link href="/system/theme">Edit the theme</Link>
    </header>
    {query.isPending && <LoadingState label="Loading tokens" description="Reading the token definitions." variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {query.data && query.data.length === 0 && <EmptyState title="No tokens yet" description="The registry returned no token definitions. Switch to the normal demo data to see them." action={<Link href="/system/tokens">Show the normal tokens</Link>} />}
    {query.data && query.data.length > 0 && <>
      <section className={styles.export} aria-labelledby="export-heading">
        <h2 id="export-heading">Download design tokens</h2>
        {exported?.ok === false && <p className={styles.exportError} role="alert">Design tokens cannot be downloaded because a value is invalid: {exported.message}</p>}
        {exported?.ok && <>
          <p>One file per mode for the applied theme, in the {DESIGN_TOKENS_FORMAT}. Tools that read this format, such as Style Dictionary, can use them. {exported.notes.summary}</p>
          <div className={styles.exportActions}>
            {exported.files.map(file => <Button key={file.name} variant="secondary" onClick={() => { setDownloadError(downloadText(file.name, file.content)); }}>Download {file.mode} tokens</Button>)}
            <Button variant="ghost" onClick={() => { setDownloadError(downloadText(NOTES_FILENAME, exported.notesContent)); }}>Download export notes</Button>
          </div>
          {downloadError && <p className={styles.exportError} role="alert">{downloadError}</p>}
          {exported.notes.exclusions.length > 0 && <><h3>Excluded from the files</h3>
            <ul>{exported.notes.exclusions.map(item => <li key={item.id}><code>{item.id}</code> ({item.modes.join(' and ')}): {item.reason}</li>)}</ul></>}
          {exported.notes.exclusions.length === 0 && <p className={styles.exportNote}>No tokens are excluded.</p>}
        </>}
      </section>
      <section className={styles.filters} aria-label="Find tokens">
        <label className={styles.field}>Search tokens
          <Input type="search" value={filters.query} placeholder="Name, variable, or purpose" onChange={event => setFilters({ ...filters, query: event.currentTarget.value })} />
        </label>
        <label className={styles.field}>Category
          <Select value={filters.category} onChange={event => setFilters({ ...filters, category: event.currentTarget.value as TokenFilters['category'] })}>
            <option value="all">All categories</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}
          </Select>
        </label>
        <label className={styles.field}>Kind
          <Select value={filters.kind} onChange={event => setFilters({ ...filters, kind: event.currentTarget.value as TokenFilters['kind'] })}>
            <option value="all">Primitive and semantic</option><option value="primitive">Primitive</option><option value="semantic">Semantic</option>
          </Select>
        </label>
        {filtered && <Button variant="ghost" onClick={clear}>Clear filters</Button>}
      </section>
      <p className={styles.count} role="status" aria-live="polite">{shown.length === tokens.length ? `${tokens.length} tokens` : `${shown.length} of ${tokens.length} tokens`}</p>
      {shown.length === 0
        ? <EmptyState title="No tokens match" description="Try a different search, or clear the category and kind filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} />
        : <ul className={styles.list}>{shown.map(token => <TokenCard key={token.id} token={token} mode={mode} usage={usage[token.id] ?? { components: [], examples: [] }} />)}</ul>}
    </>}
  </main>;
}

function TokenCard({ token, mode, usage }: { token: ResolvedToken; mode: Mode | null; usage: TokenUsage }) {
  const value = token.value;
  const paired = typeof value === 'object';
  const entries: [string, string, Mode | null][] = typeof value === 'object'
    ? (['light', 'dark'] as const).map(m => [`${m} value`, String(value[m]), m])
    : [['value', String(value), null]];
  return <li className={styles.card} id={token.id}>
    <div className={styles.cardHeader}>
      <h2><code>{token.id}</code></h2>
      <span className={styles.badges}><Badge>{token.category}</Badge><Badge tone={token.kind === 'semantic' ? 'primary' : 'neutral'}>{token.kind}</Badge></span>
    </div>
    <p className={styles.purpose}>{token.purpose}</p>
    <dl className={styles.values}>
      {entries.map(([label, text, entryMode]) => <div key={label} className={styles.value}>
        <dt>{paired ? `${entryMode === 'light' ? 'Light' : 'Dark'}${mode === entryMode ? ' (in effect)' : ''}` : 'Value'}</dt>
        <dd>
          {isColorValue(text) && <span className={styles.swatch} role="img" aria-label={`${token.id} ${entryMode ?? ''} color`.replace('  ', ' ')} style={{ backgroundColor: text }} />}
          <code>{text}</code>
          <CopyButton value={text} label={`${token.id}${paired ? ` ${entryMode}` : ''} value`} />
        </dd>
      </div>)}
      <div className={styles.value}>
        <dt>CSS variable</dt>
        <dd><code>{token.cssVariable}</code><CopyButton value={token.cssVariable} label={`${token.id} CSS variable`} /></dd>
      </div>
    </dl>
    {(usage.components.length > 0 || usage.examples.length > 0) && <div className={styles.usage}>
      {usage.components.length > 0 && <p>Used by: {usage.components.map(component => component.name).join(', ')}</p>}
      {usage.examples.length > 0 && <p>Examples: {usage.examples.map(example => example.title).join(', ')}</p>}
    </div>}
  </li>;
}
