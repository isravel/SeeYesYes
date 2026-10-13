'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { ExamplePreview } from '@/components/examples/previews';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Table } from '@/components/ui/table';
import { createHttpAdapter } from '@/lib/data/adapter';
import type { Scenario } from '@/lib/data/api';
import type { ComponentContract, DesignSystem } from '@/lib/contract/schema';
import { componentReadiness } from '@/lib/contract/readiness';
import { effectiveDefaults } from '@/lib/contract/validate';
import styles from './detail.module.css';

const adapter = createHttpAdapter();

export function ComponentDetail({ componentId, scenario }: { componentId: string; scenario: Scenario }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Detail componentId={componentId} scenario={scenario} /></QueryClientProvider>;
}

function Detail({ componentId, scenario }: { componentId: string; scenario: Scenario }) {
  const primary = useQuery({ queryKey: ['component', componentId, scenario], queryFn: ({ signal }) => adapter.get('component', { componentId, scenario, signal }), retry: false, staleTime: Infinity });
  // The registry supplies linked examples and components, so it loads only after the component succeeds.
  const secondary = useQuery({ queryKey: ['registry', scenario], queryFn: ({ signal }) => adapter.get('registry', { scenario, signal }), enabled: primary.isSuccess, retry: false, staleTime: Infinity });
  const crumbs = <nav aria-label="Breadcrumb" className={styles.crumbs}><Link href="/components">Components</Link><span aria-hidden="true"> / </span><span aria-current="page">{primary.data?.name ?? componentId}</span></nav>;

  if (primary.isPending) return <main className={styles.page}>{crumbs}<LoadingState label="Loading component" description="Reading the component contract." variant="skeleton" /></main>;
  if (primary.isError) return <main className={styles.page}>{crumbs}<ErrorState message={primary.error.message} onRetry={() => { void primary.refetch(); }} /></main>;
  if (secondary.isError) return <main className={styles.page}>{crumbs}<ErrorState title="Linked data did not load" message={secondary.error.message} onRetry={() => { void secondary.refetch(); }} /></main>;
  if (!secondary.data) return <main className={styles.page}>{crumbs}<LoadingState label="Loading examples and linked components" variant="skeleton" /></main>;
  return <main className={styles.page}>{crumbs}<DetailContent component={primary.data} system={secondary.data} /></main>;
}

const list = (items: string[]) => <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>;

function DetailContent({ component, system }: { component: ComponentContract; system: DesignSystem }) {
  const stores = useThemeStores();
  const theme = useStore(stores.applied, state => state.settings.theme);
  const readiness = componentReadiness(component, system);
  const examples = system.examples.filter(example => component.exampleIds.includes(example.id));
  const recommended = examples.filter(example => example.intent === 'recommended');
  const violations = examples.filter(example => example.intent === 'violation');
  const preview = recommended[0];
  const reviewed = component.accessibility.status === 'reviewed';
  const contractDefaults = effectiveDefaults(component, { ...theme, componentDefaults: {} });
  const appliedDefaults = effectiveDefaults(component, theme);
  const differing = Object.keys(appliedDefaults).filter(name => appliedDefaults[name] !== contractDefaults[name]);
  const tokenName = (id: string) => system.tokens.find(token => token.id === id);

  return <>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>COMPONENT · {component.category.toUpperCase()}</p><h1>{component.name}</h1><p className={styles.lead}>{component.purpose}</p></div>
      <div className={styles.badges}>
        <Badge tone={component.maturity === 'stable' ? 'success' : 'warning'}>{component.maturity === 'stable' ? 'Stable' : 'Experimental'}</Badge>
        <Badge tone={reviewed ? 'success' : 'neutral'}>{reviewed ? 'Accessibility reviewed' : 'Not reviewed'}</Badge>
        <Badge tone={readiness.complete ? 'success' : 'warning'}>{readiness.complete ? 'Metadata-complete' : 'Metadata incomplete'}</Badge>
      </div>
    </header>

    <section className={styles.section} aria-labelledby="overview-heading">
      <h2 id="overview-heading">Overview</h2>
      <dl className={styles.facts}>
        <div><dt>Import</dt><dd><code>{`import { ${component.publicImport.exportName} } from "${component.publicImport.module}";`}</code></dd></div>
        <div><dt>Element</dt><dd><code>{component.semantics.element}</code>: {component.semantics.meaning}</dd></div>
        <div><dt>Interactive</dt><dd>{component.interactive ? 'Yes' : 'No'}</dd></div>
      </dl>
    </section>

    <section className={styles.section} aria-labelledby="preview-heading">
      <h2 id="preview-heading">Live preview</h2>
      {preview?.intent === 'recommended'
        ? <><div className={styles.preview}><ExamplePreview previewKey={preview.previewKey} /></div><p className={styles.caption}>{preview.title}</p></>
        : <p>No recommended example with a preview is registered.</p>}
    </section>

    <section className={styles.section} aria-labelledby="variants-heading">
      <h2 id="variants-heading">Variants</h2>
      {Object.keys(component.variants).length === 0 ? <p>This component has no variants.</p>
        : <dl className={styles.facts}>{Object.entries(component.variants).map(([name, options]) => <div key={name}><dt>{name}</dt><dd>{options.map(option => <code key={option} className={styles.chip}>{option}</code>)}</dd></div>)}</dl>}
      {component.compoundVariants.length > 0 && <><h3>Compound variants</h3>
        <ul>{component.compoundVariants.map(compound => <li key={JSON.stringify(compound.when)}><code>{Object.entries(compound.when).map(([k, v]) => `${k}=${v}`).join(', ')}</code> · {compound.effect === 'disallowed' ? 'Not allowed' : 'Styled'}: {compound.description}</li>)}</ul></>}
      {differing.length > 0 && <p className={styles.note}>Under the applied theme, defaults differ from the contract: {differing.map(name => `${name} is ${String(appliedDefaults[name])} (contract: ${String(contractDefaults[name])})`).join('; ')}.</p>}
    </section>

    <section className={styles.section} aria-labelledby="states-heading">
      <h2 id="states-heading">States</h2>
      <p>The states this component documents. Not every state applies to every component.</p>
      <p>{component.states.map(state => <code key={state} className={styles.chip}>{state}</code>)}</p>
    </section>

    <section className={styles.section} aria-labelledby="anatomy-heading">
      <h2 id="anatomy-heading">Anatomy</h2>
      <dl className={styles.facts}>{component.anatomy.map(part => <div key={part.part}><dt>{part.part}</dt><dd>{part.description}</dd></div>)}</dl>
    </section>

    <section className={styles.section} aria-labelledby="props-heading">
      <h2 id="props-heading">Props</h2>
      <Table caption={`${component.name} props`} columns={[{ id: 'name', label: 'Prop', rowHeader: true }, { id: 'type', label: 'Type' }, { id: 'default', label: 'Default' }, { id: 'description', label: 'Description' }]}
        rows={component.props.map(prop => ({ id: prop.name, cells: {
          name: <><code>{prop.name}</code>{prop.required ? ' (required)' : ''}</>,
          type: <code>{prop.allowedValues ? prop.allowedValues.map(value => JSON.stringify(value)).join(' | ') : prop.type}</code>,
          default: prop.defaultValue === undefined ? '—' : <code>{String(prop.defaultValue)}</code>,
          description: prop.description,
        } }))} />
    </section>

    <section className={styles.section} aria-labelledby="use-heading">
      <h2 id="use-heading">Recommended use</h2>
      {recommended.length === 0 ? <p>No recommended examples are registered.</p> : recommended.map(example => <div key={example.id} className={styles.example}>
        <h3>{example.title}</h3><pre><code>{example.code}</code></pre>
      </div>)}
    </section>

    <section className={styles.section} aria-labelledby="prohibited-heading">
      <h2 id="prohibited-heading">Prohibited use</h2>
      {list(component.prohibitedUsage)}
      {violations.map(example => <div key={example.id} className={styles.example}>
        <h3>{example.title}</h3><pre><code>{example.code}</code></pre>
        {example.intent === 'violation' && <p>{example.explanation}</p>}
      </div>)}
    </section>

    <section className={styles.section} aria-labelledby="a11y-heading">
      <h2 id="a11y-heading">Accessibility</h2>
      <p><strong>{reviewed ? 'Reviewed' : 'Not reviewed'}.</strong> {reviewed && component.accessibility.evidence
        ? <>Reviewed on {component.accessibility.evidence.reviewedOn}. <Link href={component.accessibility.evidence.path}>Review evidence</Link></>
        : 'No human accessibility review has been recorded for this component.'}</p>
      {list(component.accessibility.requirements)}
      {component.accessibility.keyboard.length > 0 && <Table caption={`${component.name} keyboard behavior`} columns={[{ id: 'key', label: 'Key', rowHeader: true }, { id: 'behavior', label: 'Behavior' }]}
        rows={component.accessibility.keyboard.map(item => ({ id: item.key, cells: { key: <kbd>{item.key}</kbd>, behavior: item.behavior } }))} />}
    </section>

    <section className={styles.section} aria-labelledby="tokens-heading">
      <h2 id="tokens-heading">Tokens</h2>
      <ul>{component.tokenIds.map(id => <li key={id}><Link href={`/system/tokens#${id}`}>{id}</Link>{tokenName(id) ? <> · <code>{tokenName(id)!.cssVariable}</code></> : null}</li>)}</ul>
    </section>

    <section className={styles.section} aria-labelledby="composition-heading">
      <h2 id="composition-heading">Composition</h2>
      {component.composition.allowedComponentIds.length > 0
        ? <p>Can contain or work with: {component.composition.allowedComponentIds.map((id, index) => <span key={id}>{index > 0 && ', '}<Link href={`/components/${id}`}>{system.components.find(item => item.id === id)?.name ?? id}</Link></span>)}.</p>
        : <p>This component has no composition partners listed.</p>}
      {component.composition.constraints.length > 0 && list(component.composition.constraints)}
    </section>

    <section className={styles.section} aria-labelledby="ai-heading">
      <h2 id="ai-heading">AI guidance</h2>
      <div className={styles.columns}>
        <div><h3>Prefer</h3>{list(component.aiGuidance.prefer)}</div>
        <div><h3>Avoid</h3>{list(component.aiGuidance.avoid)}</div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="readiness-heading">
      <h2 id="readiness-heading">Metadata readiness</h2>
      <p>This checks that the contract and its references are complete. It does not mean the component was reviewed or an agent was tested.</p>
      <ul className={styles.checks}>{readiness.checks.map(check => <li key={check.id} data-passed={check.passed}><span aria-hidden="true">{check.passed ? '✓' : '✗'}</span> <span className={styles.visuallyHidden}>{check.passed ? 'Passed: ' : 'Failed: '}</span>{check.label}</li>)}</ul>
    </section>
  </>;
}
