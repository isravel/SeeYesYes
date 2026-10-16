'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { ExampleLayoutPreview } from '@/components/examples/previews';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Select } from '@/components/ui/select';
import { createLazyHttpAdapter } from '@/lib/data/lazy-adapter';
import type { Scenario } from '@/lib/data/api';
import type { DesignSystem, Theme } from '@/lib/contract/schema';
import styles from './layouts.module.css';

const adapter = createLazyHttpAdapter();

export function LayoutsView({ scenario }: { scenario: Scenario }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Layouts scenario={scenario} /></QueryClientProvider>;
}

function Layouts({ scenario }: { scenario: Scenario }) {
  const primary = useQuery({ queryKey: ['layouts', scenario], queryFn: ({ signal }) => adapter.get('layouts', { scenario, signal }), retry: false, staleTime: Infinity });
  // The registry names the components each layout uses; it loads only after the layouts succeed with at least one entry.
  const secondary = useQuery({ queryKey: ['registry', scenario], queryFn: ({ signal }) => adapter.get('registry', { scenario, signal }), enabled: primary.isSuccess && primary.data.length > 0, retry: false, staleTime: Infinity });
  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>PRODUCT · LAYOUTS</p><h1>Layouts</h1>
        <p>Demo compositions built only from the system&apos;s own components. They are not business features: save buttons give local feedback and store nothing. Change a preview&apos;s density or appearance to see the same components adapt, without touching the workspace.</p></div>
      <Link href="/components">Browse components</Link>
    </header>
    {primary.isPending && <LoadingState label="Loading layouts" description="Reading the layout examples." variant="skeleton" />}
    {primary.isError && <ErrorState message={primary.error.message} onRetry={() => { void primary.refetch(); }} />}
    {primary.data && primary.data.length === 0 && <EmptyState title="No layouts yet" description="The registry returned no layout examples. Switch to the normal demo data to see them." action={<Link href="/layouts">Show the normal layouts</Link>} />}
    {secondary.isError && <ErrorState title="Component names did not load" message={secondary.error.message} onRetry={() => { void secondary.refetch(); }} />}
    {primary.data && primary.data.length > 0 && <ul className={styles.list}>{primary.data.map(layout => <LayoutCard key={layout.id} layout={layout} system={secondary.data} />)}</ul>}
  </main>;
}

type Density = Theme['density'];
type Appearance = 'light' | 'dark' | 'system';

function LayoutCard({ layout, system }: { layout: DesignSystem['layouts'][number]; system?: DesignSystem }) {
  const stores = useThemeStores();
  const applied = useStore(stores.applied, state => state.settings.theme);
  const [density, setDensity] = useState<Density | null>(null);
  const [appearance, setAppearance] = useState<Appearance>('light');
  const theme: Theme = { ...applied, density: density ?? applied.density };
  return <li className={styles.card} id={layout.id}>
    <div className={styles.cardHeader}>
      <div><h2>{layout.title}</h2><p>{layout.purpose}</p></div>
      <div className={styles.controls}>
        <label className={styles.field}>Density
          <Select aria-label={`${layout.title} density`} value={theme.density} onChange={event => setDensity(event.currentTarget.value as Density)}>
            <option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option>
          </Select>
        </label>
        <label className={styles.field}>Appearance
          <Select aria-label={`${layout.title} appearance`} value={appearance} onChange={event => setAppearance(event.currentTarget.value as Appearance)}>
            <option value="light">Light</option><option value="dark">Dark</option><option value="system">Follow system</option>
          </Select>
        </label>
      </div>
    </div>
    <ThemeScope id={`layout-${layout.id}`} theme={theme} appearance={appearance} className={styles.preview}>
      <ExampleLayoutPreview previewKey={layout.previewKey} />
    </ThemeScope>
    <p className={styles.uses}>Uses: {layout.componentIds.map((id, index) => <span key={id}>{index > 0 && ', '}<Link href={`/components/${id}`}>{system?.components.find(component => component.id === id)?.name ?? id}</Link></span>)}</p>
  </li>;
}
