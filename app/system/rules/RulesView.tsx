'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Select } from '@/components/ui/select';
import { createLazyHttpAdapter } from '@/lib/data/lazy-adapter';
import type { Scenario } from '@/lib/data/api';
import type { DesignSystem } from '@/lib/contract/schema';
import { affectedComponentIds, filterRules, noRuleFilters, ruleCategories, ruleSeverities, type RuleFilters } from '@/lib/rules/browse';
import styles from './rules.module.css';

const adapter = createLazyHttpAdapter();

export function RulesView({ scenario }: { scenario: Scenario }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Rules scenario={scenario} /></QueryClientProvider>;
}

function Rules({ scenario }: { scenario: Scenario }) {
  const primary = useQuery({ queryKey: ['rules', scenario], queryFn: ({ signal }) => adapter.get('rules', { scenario, signal }), retry: false, staleTime: Infinity });
  // The registry supplies examples and component names; it loads only after the rules list succeeds with at least one rule.
  const secondary = useQuery({ queryKey: ['registry', scenario], queryFn: ({ signal }) => adapter.get('registry', { scenario, signal }), enabled: primary.isSuccess && primary.data.length > 0, retry: false, staleTime: Infinity });
  const [filters, setFilters] = useState<RuleFilters>(noRuleFilters);
  const rules = useMemo(() => primary.data ?? [], [primary.data]);
  const shown = useMemo(() => filterRules(rules, filters), [rules, filters]);
  const filtered = filters.category !== 'all' || filters.severity !== 'all';
  const clear = () => setFilters(noRuleFilters);

  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>SYSTEM · RULES</p><h1>Rules</h1>
        <p>The guidance every component and screen is held to. Rules are documentation for people and AI agents; they do not inspect your code, and no fix edits a project.</p></div>
      <Link href="/components">Browse components</Link>
    </header>
    {primary.isPending && <LoadingState label="Loading rules" description="Reading the rule definitions." variant="skeleton" />}
    {primary.isError && <ErrorState message={primary.error.message} onRetry={() => { void primary.refetch(); }} />}
    {primary.data && primary.data.length === 0 && <EmptyState title="No rules yet" description="The registry returned no rules. Switch to the normal demo data to see them." action={<Link href="/system/rules">Show the normal rules</Link>} />}
    {primary.data && primary.data.length > 0 && <>
      <section className={styles.filters} aria-label="Filter rules">
        <label className={styles.field}>Category
          <Select value={filters.category} onChange={event => setFilters({ ...filters, category: event.currentTarget.value as RuleFilters['category'] })}>
            <option value="all">All categories</option>{ruleCategories.map(category => <option key={category} value={category}>{category}</option>)}
          </Select>
        </label>
        <label className={styles.field}>Severity
          <Select value={filters.severity} onChange={event => setFilters({ ...filters, severity: event.currentTarget.value as RuleFilters['severity'] })}>
            <option value="all">All severities</option>{ruleSeverities.map(severity => <option key={severity} value={severity}>{severity}</option>)}
          </Select>
        </label>
        {filtered && <Button variant="ghost" onClick={clear}>Clear filters</Button>}
      </section>
      <p className={styles.count} role="status" aria-live="polite">{shown.length === rules.length ? `${rules.length} rules` : `${shown.length} of ${rules.length} rules`}</p>
      {secondary.isError && <ErrorState title="Examples did not load" message={secondary.error.message} onRetry={() => { void secondary.refetch(); }} />}
      {shown.length === 0
        ? <EmptyState title="No rules match" description="Try a different category or severity, or clear the filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} />
        : <ul className={styles.list}>{shown.map(rule => <RuleCard key={rule.id} rule={rule} system={secondary.data} />)}</ul>}
    </>}
  </main>;
}

function RuleCard({ rule, system }: { rule: DesignSystem['rules'][number]; system?: DesignSystem }) {
  const affected = affectedComponentIds(rule);
  const example = (id: string) => system?.examples.find(item => item.id === id);
  const bad = example(rule.violationExampleId);
  const good = example(rule.correctExampleId);
  return <li className={styles.card} id={rule.id}>
    <div className={styles.cardHeader}><h2><code>{rule.id}</code></h2>
      <span className={styles.badges}><Badge tone={rule.severity === 'error' ? 'destructive' : rule.severity === 'warning' ? 'warning' : 'neutral'}>{rule.severity}</Badge><Badge>{rule.category}</Badge></span></div>
    <p>{rule.description}</p>
    <p className={styles.meta}>Applies to: {affected.length === 0 ? 'the whole system' : affected.map((id, index) => <span key={id}>{index > 0 && ', '}<Link href={`/components/${id}`}>{system?.components.find(c => c.id === id)?.name ?? id}</Link></span>)}</p>
    <div className={styles.examples}>
      <div><h3>Violation</h3>{bad ? <><p className={styles.meta}>{bad.title}</p><pre tabIndex={0} aria-label={`${rule.id} violation code`}><code>{bad.code}</code></pre>{bad.intent === 'violation' && <p className={styles.meta}>{bad.explanation}</p>}</> : <p className={styles.meta}>{system ? 'Example not found.' : 'Loading example…'}</p>}</div>
      <div><h3>Corrected</h3>{good ? <><p className={styles.meta}>{good.title}</p><pre tabIndex={0} aria-label={`${rule.id} corrected code`}><code>{good.code}</code></pre></> : <p className={styles.meta}>{system ? 'Example not found.' : 'Loading example…'}</p>}</div>
    </div>
    <div className={styles.fix}><p><strong>Suggested fix:</strong> {rule.suggestedFix}</p><CopyButton label={`${rule.id} suggested fix`} value={rule.suggestedFix} successMessage="Suggested fix copied to clipboard." />
      <p className={styles.meta}>Auto-fix unavailable in Phase 1. {rule.autoFix.reason}</p></div>
  </li>;
}
