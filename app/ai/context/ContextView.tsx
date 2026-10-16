'use client';
import { lazy, Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { createLazyHttpAdapter } from '@/lib/data/lazy-adapter';
import type { Scenario } from '@/lib/data/api';
import styles from './context.module.css';

const Builder = lazy(() => import('./ContextBuilder'));
const adapter = createLazyHttpAdapter();

export function ContextView({ scenario }: { scenario: Scenario }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Context scenario={scenario} /></QueryClientProvider>;
}

function Context({ scenario }: { scenario: Scenario }) {
  const query = useQuery({ queryKey: ['registry', scenario], queryFn: ({ signal }) => adapter.get('registry', { scenario, signal }), retry: false, staleTime: Infinity });
  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>AI · CONTEXT</p><h1>AI context</h1>
        <p>The shared contract as an AI-readable export, generated locally from the registry and your applied theme. Nothing is sent anywhere, and no model is called. Whether agents build better interfaces with these exports has not been measured yet.</p></div>
      <Link href="/getting-started">Getting started</Link>
    </header>
    {query.isPending && <LoadingState label="Loading the registry" description="Reading the contracts the export is built from." variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {query.data && <Suspense fallback={<LoadingState label="Loading the export builder" variant="skeleton" />}><Builder system={query.data} /></Suspense>}
  </main>;
}
