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
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { createHttpAdapter } from '@/lib/data/adapter';
import type { Scenario } from '@/lib/data/api';
import type { DesignSystem } from '@/lib/contract/schema';
import { filterFindings, noFindingFilters, statusCounts, statuses, withCategories, type Finding, type FindingFilters } from '@/lib/validation/browse';
import { ruleCategories } from '@/lib/rules/browse';
import styles from './validation.module.css';

const adapter = createHttpAdapter();
type Props = { scenario: Scenario; rules: DesignSystem['rules']; examples: DesignSystem['examples']; components: { id: string; name: string }[] };
type Sample = 'clean' | 'mixed' | 'failing';
const tone = (status: Finding['status']) => status === 'error' ? 'destructive' as const : status === 'warning' ? 'warning' as const : status === 'passed' ? 'success' as const : 'neutral' as const;

export function ValidationView(props: Props) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Validation {...props} /></QueryClientProvider>;
}

function Validation({ scenario, rules, examples, components }: Props) {
  const query = useQuery({ queryKey: ['validation', scenario], queryFn: ({ signal }) => adapter.get('validation', { scenario, signal }), retry: false, staleTime: Infinity });
  const [sample, setSample] = useState<Sample>('mixed');
  const [filters, setFilters] = useState<FindingFilters>(noFindingFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const report = query.data?.find(item => item.scenarioId === sample);
  const findings = useMemo(() => report ? withCategories(report, rules) : [], [report, rules]);
  const counts = useMemo(() => statusCounts(findings), [findings]);
  const shown = useMemo(() => filterFindings(findings, filters), [findings, filters]);
  const selected = findings.find(finding => finding.id === selectedId) ?? null;
  const filtered = filters.status !== 'all' || filters.category !== 'all';
  const clear = () => setFilters(noFindingFilters);
  const changeSample = (value: Sample) => { setSample(value); setSelectedId(null); };

  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>QUALITY · VALIDATION</p><h1>Validation</h1>
        <p>Sample reports that show what rule findings look like. They are demo results from fixed fixtures, not a scan of any project, and nothing here runs, uploads, or edits code.</p></div>
      <Link href="/system/rules">Read the rules</Link>
    </header>
    {query.isPending && <LoadingState label="Loading demo reports" description="Reading the sample reports." variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {query.data && query.data.length === 0 && <EmptyState title="No demo reports" description="No sample reports are available. Switch to the normal demo data to see them." action={<Link href="/validation">Show the demo reports</Link>} />}
    {query.data && query.data.length > 0 && <>
      <section className={styles.panel} aria-labelledby="sample-heading">
        <h2 id="sample-heading">Demo report <Badge tone="warning">Demo results</Badge></h2>
        <RadioGroup name="validation-sample" label="Sample report" value={sample} onChange={value => changeSample(value as Sample)} orientation="horizontal" options={[
          { value: 'clean', label: 'Clean' }, { value: 'mixed', label: 'Mixed' }, { value: 'failing', label: 'Failing' }]} />
        <dl className={styles.counts} aria-label="Demo result counts">
          {statuses.map(status => <div key={status}><dt>{status}</dt><dd>{counts[status]}</dd></div>)}
        </dl>
        <p className={styles.note}>Demo results for the “{sample}” sample. They are fixture data and say nothing about the quality of your own work.</p>
      </section>
      <section className={styles.filters} aria-label="Filter findings">
        <label className={styles.field}>Status
          <Select value={filters.status} onChange={event => setFilters({ ...filters, status: event.currentTarget.value as FindingFilters['status'] })}>
            <option value="all">All statuses</option>{statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </Select>
        </label>
        <label className={styles.field}>Category
          <Select value={filters.category} onChange={event => setFilters({ ...filters, category: event.currentTarget.value as FindingFilters['category'] })}>
            <option value="all">All categories</option>{ruleCategories.map(category => <option key={category} value={category}>{category}</option>)}
          </Select>
        </label>
        {filtered && <Button variant="ghost" onClick={clear}>Clear filters</Button>}
      </section>
      <p className={styles.count} role="status" aria-live="polite">{shown.length === findings.length ? `${findings.length} results` : `${shown.length} of ${findings.length} results`}</p>
      <div className={styles.layout}>
        <div>
          {shown.length === 0
            ? <EmptyState title="No results match" description="Try a different status or category, or clear the filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} />
            : <ul className={styles.list}>{shown.map(finding => <li key={finding.id}>
              <button type="button" className={styles.finding} aria-pressed={finding.id === selectedId} onClick={() => setSelectedId(finding.id)}>
                <span className={styles.findingHead}><Badge tone={tone(finding.status)}>{finding.status}</Badge><Badge>{finding.category}</Badge><code>{finding.ruleId}</code></span>
                <span>{finding.message}</span>
                {finding.componentId && <span className={styles.muted}>Component: {components.find(c => c.id === finding.componentId)?.name ?? finding.componentId}</span>}
              </button>
            </li>)}</ul>}
        </div>
        <Details finding={selected} rules={rules} examples={examples} />
      </div>
    </>}
  </main>;
}

function Details({ finding, rules, examples }: { finding: Finding | null; rules: Props['rules']; examples: Props['examples'] }) {
  if (!finding) return <aside className={styles.details} aria-label="Finding details"><p className={styles.muted}>Select a result to see its message, rule, example, and suggested fix.</p></aside>;
  const rule = rules.find(item => item.id === finding.ruleId)!;
  const example = examples.find(item => item.id === finding.exampleId);
  return <aside className={styles.details} aria-label="Finding details">
    <h2>Result details <Badge tone="warning">Demo result</Badge></h2>
    <p><Badge tone={tone(finding.status)}>{finding.status}</Badge> {finding.message}</p>
    <p><strong>Rule:</strong> <Link href={`/system/rules#${rule.id}`}><code>{rule.id}</code></Link> · {rule.category} · {rule.severity}</p>
    <p>{rule.description}</p>
    {example && <><h3>{finding.status === 'passed' ? 'Passing example' : 'Violating example'}: {example.title}</h3>
      <pre tabIndex={0} aria-label="Example code"><code>{example.code}</code></pre>
      {example.intent === 'violation' && <p className={styles.muted}>{example.explanation}</p>}</>}
    <h3>Suggested fix</h3>
    <p>{rule.suggestedFix}</p>
    <CopyButton label="suggested fix" value={rule.suggestedFix} successMessage="Suggested fix copied to clipboard." />
    <p className={styles.muted}>Auto-fix unavailable in Phase 1. {rule.autoFix.reason}</p>
  </aside>;
}
