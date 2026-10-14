'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Select } from '@/components/ui/select';
import { createHttpAdapter } from '@/lib/data/adapter';
import type { Scenario } from '@/lib/data/api';
import type { ComponentContract } from '@/lib/contract/schema';
import type { ComponentReadiness } from '@/lib/contract/readiness';
import { catalogSummary, filterComponents, noComponentFilters, variantOptionCount, type ComponentFilters } from '@/lib/components/catalog';
import styles from './components.module.css';

type Props = { scenario: Scenario; readiness: Record<string, ComponentReadiness> };

export function ComponentsCatalog(props: Props) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Catalog {...props} /></QueryClientProvider>;
}

const adapter = createHttpAdapter();

function Catalog({ scenario, readiness }: Props) {
  const query = useQuery({ queryKey: ['components', scenario], queryFn: ({ signal }) => adapter.get('components', { scenario, signal }), retry: false, staleTime: Infinity });
  const [filters, setFilters] = useState<ComponentFilters>(noComponentFilters);
  const components = query.data;
  const shown = useMemo(() => components ? filterComponents(components, filters) : [], [components, filters]);
  const summary = useMemo(() => components ? catalogSummary(components, readiness) : null, [components, readiness]);
  const filtered = filters.query !== '' || filters.category !== 'all';
  const clear = () => setFilters(noComponentFilters);

  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>COMPONENTS</p><h1>Components</h1>
        <p>Every component in the system, with its maturity and review status as recorded in its contract. Counts are derived from the contracts.</p></div>
      <Link href="/">Back to overview</Link>
    </header>
    {query.isPending && <LoadingState label="Loading components" description="Reading the component contracts." variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {components && components.length === 0 && <EmptyState title="No components yet" description="The registry returned no component contracts. Switch to the normal demo data to see the catalog." action={<Link href="/components">Show the normal catalog</Link>} />}
    {components && components.length > 0 && summary && <>
      <section className={styles.summary} aria-label="Catalog summary">
        <dl>
          <div><dt>Components</dt><dd>{summary.total}</dd></div>
          <div><dt>Metadata-complete</dt><dd>{summary.metadataComplete} of {summary.total}</dd></div>
          <div><dt>Accessibility reviewed</dt><dd>{summary.reviewed} of {summary.total}</dd></div>
          <div><dt>Stable</dt><dd>{summary.stable} of {summary.total}</dd></div>
        </dl>
        <p className={styles.note}>Metadata-complete means the contract and its references are complete. It does not mean the component was reviewed or an agent was tested. {summary.total - summary.reviewed} {summary.total - summary.reviewed === 1 ? 'component is' : 'components are'} not yet reviewed.</p>
      </section>
      <section className={styles.filters} aria-label="Find components">
        <label className={styles.field}>Search components
          <Input type="search" value={filters.query} placeholder="Name or purpose" onChange={event => setFilters({ ...filters, query: event.currentTarget.value })} />
        </label>
        <label className={styles.field}>Category
          <Select value={filters.category} onChange={event => setFilters({ ...filters, category: event.currentTarget.value as ComponentFilters['category'] })}>
            <option value="all">All categories</option>
            {summary.categories.map(([category, count]) => <option key={category} value={category}>{category} ({count})</option>)}
          </Select>
        </label>
        {filtered && <Button variant="ghost" onClick={clear}>Clear filters</Button>}
      </section>
      <p className={styles.count} role="status" aria-live="polite">{shown.length === components.length ? `${components.length} components` : `${shown.length} of ${components.length} components`}</p>
      {shown.length === 0
        ? <EmptyState title="No components match" description="Try a different search, or clear the category filter." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} />
        : <ul className={styles.grid}>{shown.map(component => <ComponentCard key={component.id} component={component} readiness={readiness[component.id]} />)}</ul>}
    </>}
  </main>;
}

function ComponentCard({ component, readiness }: { component: ComponentContract; readiness?: ComponentReadiness }) {
  const reviewed = component.accessibility.status === 'reviewed';
  const failed = readiness?.checks.filter(check => !check.passed) ?? [];
  const options = variantOptionCount(component);
  return <li className={styles.card} id={component.id}>
    <div className={styles.cardHeader}><h2><Link href={`/components/${component.id}`}>{component.name}</Link></h2><Badge>{component.category}</Badge></div>
    <p className={styles.purpose}>{component.purpose}</p>
    <div className={styles.badges}>
      <Badge tone={component.maturity === 'stable' ? 'success' : 'warning'}>{component.maturity === 'stable' ? 'Stable' : 'Experimental'}</Badge>
      <Badge tone={reviewed ? 'success' : 'neutral'}>{reviewed ? 'Accessibility reviewed' : 'Not reviewed'}</Badge>
      <Badge tone={readiness?.complete ? 'success' : 'warning'}>{readiness?.complete ? 'Metadata-complete' : 'Metadata incomplete'}</Badge>
    </div>
    <p className={styles.meta}>{options === 0 ? 'No variants' : `${options} variant ${options === 1 ? 'option' : 'options'}`} · {component.states.length} states · {component.interactive ? 'Interactive' : 'Not interactive'}</p>
    {failed.length > 0 && <ul className={styles.missing}>{failed.map(check => <li key={check.id}>{check.label}</li>)}</ul>}
  </li>;
}
