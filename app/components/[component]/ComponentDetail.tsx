'use client';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { ExamplePreview } from '@/components/examples/previews';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { Select } from '@/components/ui/select';
import { demoCode, demos, renderDemo } from '@/components/examples/demos';
import { activeCompounds, initialSelection, optionStatus, type Selection } from '@/lib/components/playground';
import { ErrorState } from '@/components/ui/error-state';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Table } from '@/components/ui/table';
import { createLazyHttpAdapter } from '@/lib/data/lazy-adapter';
import type { Scenario } from '@/lib/data/api';
import type { ComponentContract, DesignSystem } from '@/lib/contract/schema';
import { componentReadiness } from '@/lib/contract/readiness';
import { effectiveDefaults } from '@/lib/contract/validate';
import { contextMarkdown, stableJson } from '@/lib/contract/serialize';
import { createContext } from '@/lib/contract/context';
import { resolveTokens } from '@/lib/theme/resolve';
import { useThemeScope } from '@/components/theme/ThemeScope';
import styles from './detail.module.css';

const adapter = createLazyHttpAdapter();

export function ComponentDetail({ componentId, scenario }: { componentId: string; scenario: Scenario }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><Detail componentId={componentId} scenario={scenario} /></QueryClientProvider>;
}

function Detail({ componentId, scenario }: { componentId: string; scenario: Scenario }) {
  const primary = useQuery({ queryKey: ['component', componentId, scenario], queryFn: ({ signal }) => adapter.get('component', { componentId, scenario, signal }), retry: false, staleTime: Infinity });
  // The registry supplies linked examples and components, so it loads only after the component succeeds.
  const secondary = useQuery({ queryKey: ['registry', scenario], queryFn: ({ signal }) => adapter.get('registry', { scenario, signal }), enabled: primary.isSuccess, retry: false, staleTime: Infinity });
  // The starting variant selection follows the applied theme, so wait until saved settings have been read.
  const settingsReady = useStore(useThemeStores().applied, state => state.initialized);
  const crumbs = <nav aria-label="Breadcrumb" className={styles.crumbs}><Link href="/components">Components</Link><span aria-hidden="true"> / </span><span aria-current="page">{primary.data?.name ?? componentId}</span></nav>;
  // While loading or after an error there is no contract yet, but the page still needs its heading.
  const placeholderTitle = <h1 className={styles.placeholderTitle}>{componentId}</h1>;

  if (primary.isPending) return <main id="main" tabIndex={-1} className={styles.page}>{crumbs}{placeholderTitle}<LoadingState label="Loading component" description="Reading the component contract." variant="skeleton" /></main>;
  if (primary.isError) return <main id="main" tabIndex={-1} className={styles.page}>{crumbs}{placeholderTitle}<ErrorState message={primary.error.message} onRetry={() => { void primary.refetch(); }} /></main>;
  if (secondary.isError) return <main id="main" tabIndex={-1} className={styles.page}>{crumbs}{placeholderTitle}<ErrorState title="Linked data did not load" message={secondary.error.message} onRetry={() => { void secondary.refetch(); }} /></main>;
  if (!secondary.data || !settingsReady) return <main id="main" tabIndex={-1} className={styles.page}>{crumbs}{placeholderTitle}<LoadingState label="Loading examples and linked components" variant="skeleton" /></main>;
  return <main id="main" tabIndex={-1} className={styles.page}>{crumbs}<DetailContent component={primary.data} system={secondary.data} /></main>;
}

const list = (items: string[]) => <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>;

function DetailContent({ component, system }: { component: ComponentContract; system: DesignSystem }) {
  const stores = useThemeStores();
  const settings = useStore(stores.applied, state => state.settings);
  const theme = settings.theme;
  const llmMarkdown = useMemo(() => contextMarkdown(createContext(system, { mode: 'task', componentIds: [component.id], settings })), [system, component.id, settings]);
  const readiness = componentReadiness(component, system);
  const contractDefaults = effectiveDefaults(component, { ...theme, componentDefaults: {} });
  const appliedDefaults = effectiveDefaults(component, theme);
  const examples = system.examples.filter(example => component.exampleIds.includes(example.id));
  const recommended = examples.filter(example => example.intent === 'recommended');
  const violations = examples.filter(example => example.intent === 'violation');
  const preview = recommended[0];
  const demo = demos[component.id];
  const [selection, setSelection] = useState<Selection>(() => initialSelection(component, appliedDefaults));
  const [state, setState] = useState(() => demo?.states[0] ?? 'default');
  const compounds = activeCompounds(component, selection);
  const unavailable = Object.entries(component.variants).flatMap(([name, choices]) => choices.filter(option => option !== selection[name]).map(option => ({ name, option, status: optionStatus(component, selection, name, option) })).filter(item => item.status.disabled));
  const interactionStates = component.states.filter(item => !demo?.states.includes(item));
  const importLine = `import { ${component.publicImport.exportName} } from "${component.publicImport.module}";`;
  const reviewed = component.accessibility.status === 'reviewed';
  const differing = Object.keys(appliedDefaults).filter(name => appliedDefaults[name] !== contractDefaults[name]);
  const tokenName = (id: string) => system.tokens.find(token => token.id === id);
  const mode = useThemeScope()?.mode ?? null;
  const resolved = new Map(resolveTokens(system.tokens, theme, system.fonts).map(token => [token.id, token]));
  const tokenValue = (id: string) => {
    const value = resolved.get(id)?.value;
    if (value === undefined) return null;
    return typeof value === 'object' ? String(value[mode ?? 'light']) : String(value);
  };
  const ruleIds = [...new Set([...component.ruleIds, ...component.accessibility.ruleIds])];
  const rules = ruleIds.map(id => system.rules.find(rule => rule.id === id)).filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));
  const contractJson = stableJson(component);

  return <>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>COMPONENT · {component.category.toUpperCase()}</p><h1>{component.name}</h1><p className={styles.lead}>{component.purpose}</p></div>
      <div className={styles.badges}>
        <CopyButton label="for LLM" text="Copy for LLM" value={llmMarkdown} successMessage="Copied the task export for LLM use." />
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
      {demo ? <>
        {(Object.keys(component.variants).length > 0 || demo.states.length > 1) && <div className={styles.controls}>
          {Object.entries(component.variants).map(([name, choices]) => <label key={name} className={styles.control}>{name}
            <Select value={selection[name]} aria-label={`${component.name} ${name}`} onChange={event => setSelection({ ...selection, [name]: event.currentTarget.value })}>
              {choices.map(option => { const status = optionStatus(component, selection, name, option); return <option key={option} value={option} disabled={status.disabled && option !== selection[name]}>{option}</option>; })}
            </Select>
          </label>)}
          {demo.states.length > 1 && <label className={styles.control}>state
            <Select value={state} aria-label={`${component.name} state`} onChange={event => setState(event.currentTarget.value)}>{demo.states.map(item => <option key={item} value={item}>{item}</option>)}</Select>
          </label>}
        </div>}
        {unavailable.length > 0 && <ul className={styles.note} aria-label="Unavailable combinations">{unavailable.map(item => <li key={`${item.name}-${item.option}`}><code>{item.name}={item.option}</code> is unavailable with the current selection: {item.status.reason}</li>)}</ul>}
        {compounds.map(compound => <p key={JSON.stringify(compound.when)} className={styles.note}>This combination has a dedicated style: {compound.description}</p>)}
        <div className={styles.preview} data-testid="component-preview" key={`${JSON.stringify(selection)}-${state}`}>{renderDemo(component.id, selection, state)}</div>
        {interactionStates.length > 0 && <p className={styles.note}>Interaction states to try in the preview with a pointer or keyboard: {interactionStates.join(', ')}.</p>}
        <h3>Matching code</h3>
        <div className={styles.example}><pre tabIndex={0} aria-label={`${component.name} matching code`}><code>{`${importLine}\n\n${demoCode(component.id, selection, state)}`}</code></pre><CopyButton label={`${component.name} code`} value={`${importLine}\n\n${demoCode(component.id, selection, state)}`} /></div>
      </> : preview?.intent === 'recommended'
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
        <h3>{example.title}</h3><pre tabIndex={0} aria-label={`${example.title} code`}><code>{example.code}</code></pre>
      </div>)}
    </section>

    <section className={styles.section} aria-labelledby="prohibited-heading">
      <h2 id="prohibited-heading">Prohibited use</h2>
      {list(component.prohibitedUsage)}
      {violations.map(example => <div key={example.id} className={styles.example}>
        <h3>{example.title}</h3><pre tabIndex={0} aria-label={`${example.title} code`}><code>{example.code}</code></pre>
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
      <p className={styles.note}>Values come from the applied theme{mode ? `; mode-dependent tokens show the ${mode} value, the mode in effect` : ''}.</p>
      <ul>{component.tokenIds.map(id => <li key={id}><Link href={`/system/tokens#${id}`}>{id}</Link>{tokenName(id) ? <> · <code>{tokenName(id)!.cssVariable}</code></> : null}{tokenValue(id) ? <> · <code>{tokenValue(id)}</code></> : null}</li>)}</ul>
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

    <section className={styles.section} aria-labelledby="rules-heading">
      <h2 id="rules-heading">Rules</h2>
      {rules.length === 0 ? <p>No system rules are linked to this component.</p> : <ul className={styles.rules}>{rules.map(rule => <li key={rule.id} id={`rule-${rule.id}`}>
        <p><Link href={`/system/rules#${rule.id}`}><code>{rule.id}</code></Link> <Badge tone={rule.severity === 'error' ? 'destructive' : rule.severity === 'warning' ? 'warning' : 'neutral'}>{rule.severity}</Badge> <Badge>{rule.category}</Badge></p>
        <p>{rule.description}</p><p className={styles.note}>Suggested fix: {rule.suggestedFix}</p>
      </li>)}</ul>}
    </section>

    <section className={styles.section} aria-labelledby="readiness-heading">
      <h2 id="readiness-heading">Metadata readiness</h2>
      <p>This checks that the contract and its references are complete. It does not mean the component was reviewed or an agent was tested.</p>
      <ul className={styles.checks}>{readiness.checks.map(check => <li key={check.id} data-passed={check.passed}><span aria-hidden="true">{check.passed ? '✓' : '✗'}</span> <span className={styles.visuallyHidden}>{check.passed ? 'Passed: ' : 'Failed: '}</span>{check.label}</li>)}</ul>
    </section>

    <section className={styles.section} aria-labelledby="contract-heading">
      <h2 id="contract-heading">Contract</h2>
      <p>The structured contract for this component, exactly as the registry stores it. Copy it to give a person or tool the same source of truth.</p>
      <div className={styles.example}>
        <pre tabIndex={0} aria-label={`${component.name} contract JSON`}><code>{contractJson}</code></pre>
        <CopyButton label={`${component.name} contract`} value={contractJson} successMessage="Contract copied to clipboard." />
      </div>
    </section>
  </>;
}
