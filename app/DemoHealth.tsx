'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Table } from '@/components/ui/table';
import { createHttpAdapter } from '@/lib/data/adapter';
import type { Scenario } from '@/lib/data/api';
import { statusCounts, statuses } from '@/lib/validation/browse';
import styles from './page.module.css';

const adapter = createHttpAdapter();

export function DemoHealth({ scenario }: { scenario: Scenario }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Panel scenario={scenario} /></QueryClientProvider>;
}

function Panel({ scenario }: { scenario: Scenario }) {
  const query = useQuery({ queryKey: ['validation', scenario], queryFn: ({ signal }) => adapter.get('validation', { scenario, signal }), retry: false, staleTime: Infinity });
  const rows = useMemo(() => (query.data ?? []).map(report => ({ report, counts: statusCounts(report.items) })), [query.data]);
  return <section aria-labelledby="health-title" className={styles.health}>
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>DEMO HEALTH</p><h2 id="health-title">Sample validation results <Badge tone="warning">Demo results</Badge></h2></div>
      <p>Fixture data that shows what a report looks like. It is not a measurement of this system and is never combined with the coverage above.</p></div>
    {query.isPending && <LoadingState label="Loading demo results" variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {query.data && rows.length === 0 && <EmptyState title="No demo results" description="No sample reports are available. Switch to the normal demo data to see them." action={<Link href="/">Show the normal data</Link>} />}
    {rows.length > 0 && <>
      <Table caption="Demo results by sample report" columns={[{ id: 'sample', label: 'Sample report', rowHeader: true }, ...statuses.map(status => ({ id: status, label: status[0].toUpperCase() + status.slice(1) }))]}
        rows={rows.map(({ report, counts }) => ({ id: report.scenarioId, cells: { sample: report.scenarioId, ...counts } }))} />
      <p><Link href="/validation">Explore the demo reports ↗</Link></p>
    </>}
  </section>;
}
