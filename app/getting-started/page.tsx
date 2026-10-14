import type { Metadata } from 'next';
import { ExamplePreview } from '@/components/examples/previews';
import { Alert } from '@/components/ui/alert';
import { Link } from '@/components/ui/link';
import { localAdapter } from '@/lib/data/adapter';
import { integrationPaths, layoutSnippet, nodeNote, setupCommands } from '@/lib/docs/getting-started';
import { CodeBlock, CommandBlock } from './CommandBlock';
import styles from './getting-started.module.css';

export const metadata: Metadata = { title: 'Getting Started — SeeYesYes' };
export default async function GettingStartedPage() {
  const system = await localAdapter.get('registry');
  const example = system.examples.find(item => item.id === 'button-save' && item.intent === 'recommended');
  const button = system.components.find(component => component.id === 'button')!;
  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <p className={styles.eyebrow}>GETTING STARTED</p><h1>Getting started</h1>
      <p>Run SeeYesYes locally, set a theme, use a component, and hand the same contract to an AI agent. Every command and path below comes from this repository.</p>
      <Alert tone="info" title="This is a local prototype">No package is published and nothing is deployed. Today you run the repository itself. The future package workflow is described at the end and is not available yet.</Alert>
    </header>

    <section className={styles.step} aria-labelledby="setup-heading"><h2 id="setup-heading">1. Run it locally</h2>
      <p>{nodeNote}</p>
      {setupCommands.map(item => <CommandBlock key={item.command} {...item} />)}
    </section>

    <section className={styles.step} aria-labelledby="theme-heading"><h2 id="theme-heading">2. Set a theme</h2>
      <p>Open the <Link href="/system/theme">Theme editor</Link>, change colors, type, shape, density, shadows, effects, or motion, and watch a live preview update. Your edits stay in a draft until you choose <strong>Apply to workspace</strong>, which saves them in this browser. Then check <Link href="/system/tokens">Tokens</Link> for the resolved values, or try ideas without committing in the <Link href="/playground">Playground</Link>.</p>
    </section>

    <section className={styles.step} aria-labelledby="use-heading"><h2 id="use-heading">3. Use a component</h2>
      <p>Components are imported from their own files through the repository alias. This example runs for real:</p>
      {example?.intent === 'recommended' && <>
        <div className={styles.preview}><ExamplePreview previewKey={example.previewKey} /></div>
        <CodeBlock label={`${button.name} example code`} code={example.code} />
      </>}
      <p>Browse every component, its variants, states, props, and rules in <Link href="/components">Components</Link>.</p>
    </section>

    <section className={styles.step} aria-labelledby="integration-heading"><h2 id="integration-heading">4. How it is wired into the app</h2>
      <p>The app wraps its pages in a provider that holds the applied theme, and an early script that restores saved settings before the first paint. This is the real root layout setup, shortened:</p>
      <CodeBlock label="Root layout setup" code={layoutSnippet} />
      <ul className={styles.paths}>{integrationPaths.map(item => <li key={item.path}><code>{item.path}</code> {item.purpose}</li>)}</ul>
    </section>

    <section className={styles.step} aria-labelledby="context-heading"><h2 id="context-heading">5. Export context for an AI agent</h2>
      <p>Open <Link href="/ai/context">AI Context</Link> to export an overview, a task export for the components you pick, or the full system, as readable Markdown or structured JSON. The <strong>Agent instructions</strong> section there gives you a short <code>AGENTS.md</code> snippet to paste into your project. For the default theme, build-time files are at <Link href="/llms.txt">/llms.txt</Link> and <Link href="/llms-full.txt">/llms-full.txt</Link>.</p>
    </section>

    <section className={styles.step} aria-labelledby="future-heading"><h2 id="future-heading">Future package workflow <span className={styles.future}>Not available yet</span></h2>
      <p>A published package, a command-line installer, and a hosted site are not part of this prototype. Until they exist, use the repository as shown above. Nothing on this page asks you to install something that does not exist.</p>
    </section>
  </main>;
}
