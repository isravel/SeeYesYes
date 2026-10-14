import { Badge } from '@/components/ui/badge';
import type { AIContext } from '@/lib/contract/schema';
import styles from './context.module.css';

/** A readable rendering of the same typed object that the JSON and Markdown views serialize. */
export function ContextHuman({ context }: { context: AIContext }) {
  return <div className={styles.human}>
    <section aria-labelledby="h-principles"><h3 id="h-principles">Principles</h3><ul>{context.principles.map(item => <li key={item}>{item}</li>)}</ul></section>
    <section aria-labelledby="h-project"><h3 id="h-project">Project guidance</h3><p>Framework {context.project.framework}; styling {context.project.styling}.</p><ul>{context.project.guidance.map(item => <li key={item}>{item}</li>)}</ul></section>
    {context.mode === 'overview' ? <section aria-labelledby="h-catalog"><h3 id="h-catalog">Component catalog</h3>
      <ul className={styles.items}>{context.catalog.map(entry => <li key={entry.id} data-id={entry.id}><strong>{entry.name}</strong> <code>{entry.id}</code> <Badge>{entry.category}</Badge><p>{entry.shortPurpose}</p></li>)}</ul></section> : <>
      <section aria-labelledby="h-theme"><h3 id="h-theme">Theme</h3>
        <p>Radius {context.theme.radius}, density {context.theme.density}, shadows {context.theme.shadows}, surface {context.theme.effects.surface}, motion {context.theme.motion}. Typography {context.theme.typography.sansFontId} and {context.theme.typography.monoFontId}, scale {context.theme.typography.scale}.</p></section>
      <section aria-labelledby="h-components"><h3 id="h-components">Components</h3>
        <ul className={styles.items}>{context.components.map(component => <li key={component.id} data-id={component.id}><strong>{component.name}</strong> <code>{component.id}</code> <Badge>{component.category}</Badge>
          <p>{component.purpose}</p>
          <p className={styles.muted}>Import <code>{`import { ${component.publicImport.exportName} } from "${component.publicImport.module}";`}</code>. Defaults under this theme: {Object.entries(component.effectiveDefaults).map(([k, v]) => `${k}=${String(v)}`).join(', ') || 'none'}.</p></li>)}</ul></section>
      <section aria-labelledby="h-tokens"><h3 id="h-tokens">Tokens</h3>
        <ul className={styles.items}>{context.tokens.map(token => <li key={token.id} data-id={token.id}><code>{token.id}</code> <code>{token.cssVariable}</code> {typeof token.value === 'object' ? `light ${token.value.light}; dark ${token.value.dark}` : String(token.value)}<p className={styles.muted}>{token.purpose}</p></li>)}</ul></section>
      <section aria-labelledby="h-rules"><h3 id="h-rules">Rules</h3>
        <ul className={styles.items}>{(context.mode === 'full' ? context.system.rules : context.rules).map(rule => <li key={rule.id} data-id={rule.id}><code>{rule.id}</code> <Badge tone={rule.severity === 'error' ? 'destructive' : rule.severity === 'warning' ? 'warning' : 'neutral'}>{rule.severity}</Badge><p>{rule.description}</p></li>)}</ul></section>
      <section aria-labelledby="h-examples"><h3 id="h-examples">Examples</h3>
        <ul className={styles.items}>{(context.mode === 'full' ? context.system.examples : context.examples).map(example => <li key={example.id} data-id={example.id}><strong>{example.title}</strong> <code>{example.id}</code> <Badge tone={example.intent === 'recommended' ? 'success' : 'warning'}>{example.intent}</Badge></li>)}</ul></section>
    </>}
  </div>;
}
