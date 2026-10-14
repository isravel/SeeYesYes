'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyButton } from '@/components/ui/copy-button';
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
import { AGENTS_SNIPPET_TARGET_BYTES, buildAgentsSnippet } from '@/lib/contract/agent-files';
import { contextCounts, contextMarkdown, stableJson } from '@/lib/contract/serialize';
import { downloadText } from '@/lib/browser/download';
import { byteLength, contextFilename, formatBytes, SETTINGS_FILENAME } from '@/lib/contract/export-files';
import { WorkspaceSettingsSchema } from '@/lib/contract/schema';
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
  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>AI · CONTEXT</p><h1>AI context</h1>
        <p>The shared contract as an AI-readable export, generated locally from the registry and your applied theme. Nothing is sent anywhere, and no model is called. Whether agents build better interfaces with these exports has not been measured yet.</p></div>
      <Link href="/getting-started">Getting started</Link>
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
  const [fileMessage, setFileMessage] = useState('');
  const save = (name: string, content: string, type: string) => setFileMessage(downloadText(name, content, type) ?? `Saved ${name}.`);
  const agents = useMemo(() => buildAgentsSnippet(system, settings), [system, settings]);
  const settingsJson = useMemo(() => stableJson(WorkspaceSettingsSchema.parse(settings)), [settings]);

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

    <section className={styles.panel} aria-labelledby="agents-heading">
      <h2 id="agents-heading">Agent instructions</h2>
      <p className={styles.note}>A short <code>AGENTS.md</code> snippet for your project: the principles, project guidance, your applied theme, one line per component with its import, and every system rule. Paste it into <code>AGENTS.md</code>, <code>CLAUDE.md</code>, or whichever instructions file your coding agent reads. It is an index, so use a task export above for detailed work.</p>
      <div className={styles.exportRow}>
        <strong>AGENTS.md snippet</strong><span className={styles.muted}>{formatBytes(byteLength(agents))} (target about {formatBytes(AGENTS_SNIPPET_TARGET_BYTES)}; bytes, not token counts)</span>
        <CopyButton label="AGENTS.md snippet" value={agents} successMessage="AGENTS.md snippet copied to clipboard." />
      </div>
      <pre className={styles.code} tabIndex={0} aria-label="AGENTS.md snippet"><code>{agents}</code></pre>
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
      <section className={styles.panel} aria-labelledby="export-heading">
        <h2 id="export-heading">Copy or download</h2>
        <p className={styles.note}>Sizes are UTF-8 bytes of the file, not token counts.</p>
        <div className={styles.exports}>
          {([['JSON', json, 'json', 'application/json'], ['Markdown', markdown, 'md', 'text/markdown']] as const).map(([label, text, extension, type]) => <div key={label} className={styles.exportRow}>
            <strong>{label}</strong><span className={styles.muted}>{formatBytes(byteLength(text))}</span>
            <CopyButton label={`${label} context`} value={text} successMessage={`${label} copied to clipboard.`} />
            <Button variant="secondary" onClick={() => save(contextFilename(context, extension), text, type)}>Download {label}</Button>
          </div>)}
          <div className={styles.exportRow}>
            <strong>Applied settings</strong><span className={styles.muted}>{formatBytes(byteLength(settingsJson))}</span>
            <Button variant="secondary" onClick={() => save(SETTINGS_FILENAME, settingsJson, 'application/json')}>Download settings JSON</Button>
          </div>
        </div>
        <p className={styles.note} role="status">{fileMessage}</p>
        <p className={styles.note}>Agent files for the <strong>default theme</strong> (they are generated at build time and cannot see your applied settings): <Link href="/llms.txt">/llms.txt</Link> and <Link href="/llms-full.txt">/llms-full.txt</Link>.</p>
        <p className={styles.note}>The settings file holds your applied theme and appearance (no cache). The exports above use that same applied theme.</p>
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
