'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { RadioGroup } from '@/components/ui/radio-group';
import { Tabs } from '@/components/ui/tabs';
import { createHttpAdapter } from '@/lib/data/adapter';
import type { Scenario } from '@/lib/data/api';
import type { AIContext, DesignSystem } from '@/lib/contract/schema';
import { createContext } from '@/lib/contract/context';
import { contextCounts, contextMarkdown, stableJson } from '@/lib/contract/serialize';
import { filterComponents, noComponentFilters } from '@/lib/components/catalog';
import { ContextHuman } from './ContextHuman';
import styles from './context.module.css';

const adapter = createHttpAdapter();
type Mode = AIContext['mode'];

export function ContextView({ scenario }: { scenario: Scenario }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Context scenario={scenario} /></QueryClientProvider>;
}

function Context({ scenario }: { scenario: Scenario }) {
  const query = useQuery({ queryKey: ['registry', scenario], queryFn: ({ signal }) => adapter.get('registry', { scenario, signal }), retry: false, staleTime: Infinity });
  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>AI · CONTEXT</p><h1>AI context</h1>
        <p>The shared contract as an AI-readable export, generated locally from the registry and your applied theme. Nothing is sent anywhere, and no model is called.</p></div>
      <Link href="/system/theme">Edit the theme</Link>
    </header>
    {query.isPending && <LoadingState label="Loading the registry" description="Reading the contracts the export is built from." variant="skeleton" />}
    {query.isError && <ErrorState message={query.error.message} onRetry={() => { void query.refetch(); }} />}
    {query.data && <Builder system={query.data} />}
  </main>;
}

function Builder({ system }: { system: DesignSystem }) {
  const stores = useThemeStores();
  const settings = useStore(stores.applied, state => state.settings);
  const [mode, setMode] = useState<Mode>('overview');
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const result = useMemo(() => {
    if (mode === 'task' && selected.length === 0) return { status: 'empty' as const };
    try { return { status: 'ok' as const, context: createContext(system, { mode, settings, componentIds: selected }) }; }
    catch (error) { return { status: 'error' as const, message: error instanceof Error ? error.message : 'The context could not be built.' }; }
  }, [system, settings, mode, selected]);
  const choices = useMemo(() => filterComponents(system.components, { ...noComponentFilters, query: search }), [system.components, search]);
  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id].sort());
  const context = result.status === 'ok' ? result.context : null;
  const json = useMemo(() => context ? stableJson(context) : '', [context]);
  const markdown = useMemo(() => context ? contextMarkdown(context) : '', [context]);

  return <>
    <section className={styles.panel} aria-labelledby="mode-heading">
      <h2 id="mode-heading">What to export</h2>
      <RadioGroup name="context-mode" label="Context mode" value={mode} onChange={value => setMode(value as Mode)} orientation="horizontal" options={[
        { value: 'overview', label: 'Overview' }, { value: 'task', label: 'Task' }, { value: 'full', label: 'Full' }]} />
      <p className={styles.note}>{mode === 'overview' ? 'Identity, principles, project guidance, appearance, and a short catalog of every component, so an agent can discover what exists.'
        : mode === 'task' ? 'The components you pick, plus the components, tokens, rules, and examples they depend on. Dependencies are included automatically.'
        : 'The complete system: every component, token, rule, example, layout, and font.'}</p>
      {mode === 'task' && <div className={styles.picker}>
        <label className={styles.field}>Find components
          <Input type="search" value={search} placeholder="Name or purpose" onChange={event => setSearch(event.currentTarget.value)} />
        </label>
        <fieldset className={styles.choices}>
          <legend>Components to include ({selected.length} selected)</legend>
          {choices.length === 0 ? <p>No components match “{search}”. <button type="button" className={styles.link} onClick={() => setSearch('')}>Clear search</button></p>
            : <ul>{choices.map(component => <li key={component.id}><label><Checkbox checked={selected.includes(component.id)} onChange={() => toggle(component.id)} /> <span>{component.name}</span> <span className={styles.muted}>{component.shortPurpose}</span></label></li>)}</ul>}
        </fieldset>
      </div>}
    </section>

    {result.status === 'empty' && <EmptyState title="Select a component to export" description="Task context needs at least one component. Pick one above, or switch to Overview or Full." />}
    {result.status === 'error' && <div className={styles.error} role="alert"><strong>The context could not be built.</strong> {result.message}</div>}
    {context && <>
      <section className={styles.summary} aria-label="Export summary">
        <dl>
          <div><dt>Schema</dt><dd>{context.schemaVersion}</dd></div>
          <div><dt>Mode</dt><dd>{context.mode}</dd></div>
          <div><dt>Scope</dt><dd>{context.scope}</dd></div>
          <div><dt>Theme</dt><dd>{context.themeId}{context.basedOnThemeId ? ` (based on ${context.basedOnThemeId})` : ''}</dd></div>
          <div><dt>Appearance</dt><dd>{context.appearance}</dd></div>
        </dl>
        <Counts context={context} />
        {context.mode === 'task' && <TaskSelection context={context} />}
      </section>
      <Tabs label="Context views" items={[
        { id: 'human', label: 'Human', content: <ContextHuman context={context} /> },
        { id: 'json', label: 'JSON', content: <pre className={styles.code} tabIndex={0} aria-label="Context JSON"><code>{json}</code></pre> },
        { id: 'markdown', label: 'Markdown', content: <pre className={styles.code} tabIndex={0} aria-label="Context Markdown"><code>{markdown}</code></pre> },
      ]} />
    </>}
  </>;
}

function Counts({ context }: { context: AIContext }) {
  const counts = contextCounts(context);
  return <p className={styles.counts} aria-label="Export counts">
    <Badge>{counts.components} components</Badge>{context.mode !== 'overview' && <> <Badge>{counts.tokens} tokens</Badge> <Badge>{counts.rules} rules</Badge> <Badge>{counts.examples} examples</Badge></>}
  </p>;
}

function TaskSelection({ context }: { context: Extract<AIContext, { mode: 'task' }> }) {
  const requested = context.selection.requestedComponentIds;
  const dependencies = context.selection.includedComponentIds.filter(id => !requested.includes(id));
  return <div className={styles.selection}>
    <p><strong>Requested ({requested.length}):</strong> {requested.join(', ')}</p>
    <p><strong>Included automatically as dependencies ({dependencies.length}):</strong> {dependencies.length ? dependencies.join(', ') : 'none'}</p>
    <p><strong>Referenced only ({context.referencedComponents.length}):</strong> {context.referencedComponents.length ? context.referencedComponents.map(c => c.id).join(', ') : 'none'}. These appear as catalog entries because an included example or rule mentions them; their full contracts are not in this export.</p>
  </div>;
}
