'use client';
import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { useThemeScope } from '@/components/theme/ThemeScope';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { Select } from '@/components/ui/select';
import type { DesignSystem, Mode, ResolvedToken } from '@/lib/contract/schema';
import { resolveTokens } from '@/lib/theme/resolve';
import { filterTokens, isColorValue, noFilters, tokenUsage, type TokenFilters } from '@/lib/tokens/browse';
import styles from './tokens.module.css';

const categories: ResolvedToken['category'][] = ['color', 'typography', 'spacing', 'radius', 'shadow', 'effect', 'motion'];

export function TokensView({ system }: { system: DesignSystem }) {
  const stores = useThemeStores();
  const theme = useStore(stores.applied, state => state.settings.theme);
  const initialized = useStore(stores.applied, state => state.initialized);
  const mode = useThemeScope()?.mode ?? null;
  const [filters, setFilters] = useState<TokenFilters>(noFilters);
  const tokens = useMemo(() => resolveTokens(system.tokens, theme, system.fonts), [system, theme]);
  const usage = useMemo(() => tokenUsage(system), [system]);
  const shown = useMemo(() => filterTokens(tokens, filters), [tokens, filters]);
  const filtered = filters.query !== '' || filters.category !== 'all' || filters.kind !== 'all';
  const clear = () => setFilters(noFilters);

  return <main className={styles.page} aria-busy={!initialized}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>SYSTEM · TOKENS</p><h1>Tokens</h1>
        <p>Resolved values from the applied theme{theme.id === 'custom' ? ` (custom, based on ${theme.basedOn})` : ` (${theme.id})`}. Draft edits in the Theme editor appear here only after you apply them.</p></div>
      <Link href="/system/theme">Edit the theme</Link>
    </header>
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
      : <ul className={styles.list}>{shown.map(token => <TokenCard key={token.id} token={token} mode={mode} usage={usage[token.id]} />)}</ul>}
  </main>;
}

function TokenCard({ token, mode, usage }: { token: ResolvedToken; mode: Mode | null; usage: ReturnType<typeof tokenUsage>[string] }) {
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
