'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Table } from '@/components/ui/table';
import { createHttpAdapter } from '@/lib/data/adapter';
import type { Scenario } from '@/lib/data/api';
import type { DesignSystem } from '@/lib/contract/schema';
import { checkThemeContrast } from '@/lib/accessibility/contrast';
import { evidenceRows, formSemantics, sampleAccessibilityResults } from '@/lib/accessibility/evidence';
import styles from './accessibility.module.css';

const adapter = createHttpAdapter();

export function AccessibilityView(props: { scenario: Scenario; rules: DesignSystem['rules'] }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Accessibility {...props} /></QueryClientProvider>;
}

function Accessibility({ scenario, rules }: { scenario: Scenario; rules: DesignSystem['rules'] }) {
  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>QUALITY · ACCESSIBILITY</p><h1>Accessibility</h1>
        <p>Three separate things, kept apart on purpose: what people have reviewed, a limited calculation on your applied theme, and sample results from fixtures. None of them is a conformance claim, and there is no single score.</p></div>
      <Link href="/system/theme">Edit the theme</Link>
    </header>
    <ReviewEvidence scenario={scenario} />
    <LiveContrast />
    <SampleResults scenario={scenario} rules={rules} />
  </main>;
}

function ReviewEvidence({ scenario }: { scenario: Scenario }) {
  const query = useQuery({ queryKey: ['components', scenario], queryFn: ({ signal }) => adapter.get('components', { scenario, signal }), retry: false, staleTime: Infinity });
  const rows = useMemo(() => query.data ? evidenceRows(query.data) : [], [query.data]);
  const forms = useMemo(() => query.data ? formSemantics(query.data) : [], [query.data]);
  const reviewed = rows.filter(row => row.reviewed).length;
  return <section className={styles.section} aria-labelledby="evidence-heading">
    <h2 id="evidence-heading">Component review evidence</h2>
    {query.isPending && <LoadingState label="Loading review evidence" variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {query.data && rows.length === 0 && <EmptyState title="No components to review" description="The registry returned no component contracts. Switch to the normal demo data to see review evidence." action={<Link href="/accessibility">Show the normal data</Link>} />}
    {rows.length > 0 && <>
      <p className={styles.summary}><Badge tone={reviewed ? 'success' : 'warning'}>{reviewed} of {rows.length} reviewed</Badge> {reviewed === 0 ? 'No component has had a human accessibility review yet. Automated keyboard checks exist, but they are not a review.' : 'Reviewed components link to their evidence.'}</p>
      <Table caption="Component review evidence" columns={[
        { id: 'name', label: 'Component', rowHeader: true }, { id: 'status', label: 'Human review' }, { id: 'keyboard', label: 'Keyboard' }, { id: 'focus', label: 'Focus' }, { id: 'motion', label: 'Reduced motion' }]}
        rows={rows.map(row => ({ id: row.id, cells: {
          name: <Link href={`/components/${row.id}`}>{row.name}</Link>,
          status: row.reviewed && row.evidencePath ? <>Reviewed {row.reviewedOn} · <Link href={row.evidencePath}>evidence</Link></> : 'Not reviewed',
          keyboard: row.keyboard, focus: row.focus, motion: row.reducedMotion } }))} />
      <h3>Form semantics</h3>
      <Table caption="Form semantics" columns={[{ id: 'name', label: 'Component', rowHeader: true }, { id: 'element', label: 'Element' }, { id: 'meaning', label: 'Meaning' }, { id: 'requirement', label: 'First requirement' }]}
        rows={forms.map(form => ({ id: form.id, cells: { name: form.name, element: <code>{form.element}</code>, meaning: form.meaning, requirement: form.requirement } }))} />
    </>}
  </section>;
}

function LiveContrast() {
  const stores = useThemeStores();
  const theme = useStore(stores.applied, state => state.settings.theme);
  const results = useMemo(() => checkThemeContrast(theme), [theme]);
  const failing = results.filter(result => !result.passes);
  return <section className={styles.section} aria-labelledby="contrast-heading">
    <h2 id="contrast-heading">Live contrast for the applied theme</h2>
    <p className={styles.note}>Measured now from the applied theme ({theme.id}), in both modes, for the required text, focus, and control-border pairs. This is a limited local calculation, not a complete audit. Out-of-gamut colors are reduced in chroma first.</p>
    <p className={styles.summary}><Badge tone={failing.length ? 'warning' : 'success'}>{results.length - failing.length} of {results.length} pairs meet their minimum</Badge> {failing.length ? 'A failing theme is not marked as verified.' : 'Passing these pairs does not make the theme conformant.'}</p>
    <Table caption="Measured contrast for the applied theme" columns={[
      { id: 'mode', label: 'Mode', rowHeader: true }, { id: 'pair', label: 'Pair' }, { id: 'ratio', label: 'Ratio' }, { id: 'minimum', label: 'Minimum' }, { id: 'result', label: 'Result' }]}
      rows={results.map(result => ({ id: `${result.mode}-${result.foreground}-${result.background}`, cells: {
        mode: result.mode === 'light' ? 'Light' : 'Dark', pair: result.label, ratio: `${result.ratio.toFixed(2)}:1${result.mapped ? ' (gamut adjusted)' : ''}`, minimum: `${result.minimum}:1`,
        result: <Badge tone={result.passes ? 'success' : 'destructive'}>{result.passes ? 'Meets minimum' : 'Below minimum'}</Badge> } }))} />
  </section>;
}

function SampleResults({ scenario, rules }: { scenario: Scenario; rules: DesignSystem['rules'] }) {
  const query = useQuery({ queryKey: ['validation', scenario], queryFn: ({ signal }) => adapter.get('validation', { scenario, signal }), retry: false, staleTime: Infinity });
  const summary = useMemo(() => query.data ? sampleAccessibilityResults(query.data, rules) : [], [query.data, rules]);
  return <section className={styles.section} aria-labelledby="samples-heading">
    <h2 id="samples-heading">Sample validation results <Badge tone="warning">Demo results</Badge></h2>
    {query.isPending && <LoadingState label="Loading sample results" variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {query.data && summary.length === 0 && <EmptyState title="No demo reports" description="No sample reports are available. Switch to the normal demo data to see them." action={<Link href="/accessibility">Show the normal data</Link>} />}
    {summary.length > 0 && <>
      <p className={styles.note}>Accessibility-rule results from the fixed demo reports. They are fixture data, not measurements of this system or your project.</p>
      <Table caption="Accessibility results in the demo reports" columns={[{ id: 'sample', label: 'Sample report', rowHeader: true }, { id: 'passed', label: 'Passed' }, { id: 'findings', label: 'Findings' }]}
        rows={summary.map(item => ({ id: item.scenarioId, cells: { sample: item.scenarioId, passed: `${item.passed} of ${item.total}`,
          findings: item.findings.length ? item.findings.map(finding => `${finding.ruleId} (${finding.status})`).join(', ') : 'None' } }))} />
      <p><Link href="/validation">Explore the demo reports</Link></p>
    </>}
  </section>;
}
