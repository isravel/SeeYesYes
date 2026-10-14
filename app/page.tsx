import { localAdapter } from '@/lib/data/adapter';
import { ExamplePreview } from '@/components/examples/previews';
import { Navigation } from '@/components/ui/navigation';
import type { Metadata } from 'next';
import { Link } from '@/components/ui/link';
import { AppearanceSelector } from '@/components/theme/AppearanceSelector';
import { DemoHealth } from './DemoHealth';
import { ScenarioSchema } from '@/lib/data/api';
import { registryCoverage } from '@/lib/contract/coverage';
import styles from './page.module.css';
export const metadata: Metadata = { title: 'Overview — SeeYesYes' };
export default async function Home({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const parsedScenario = ScenarioSchema.safeParse(scenario ?? 'normal');
  const coverage = registryCoverage(await localAdapter.get('registry'));
  const system = await localAdapter.get('registry');
  return <>
    <a className={styles.skip} href="#main">Skip to content</a>

    <header className={styles.header}><a href="/" className={styles.brand}>SeeYesYes<span className={styles.brandMark} aria-hidden="true">↗</span></a><span className={styles.stage}>Foundation preview · v{system.productVersion}</span><AppearanceSelector /></header>
    <div className={styles.workspace}><aside className={styles.sidebar}><Navigation showSkipLink={false} label="Workspace" currentHref="/" mainId="main" groups={[{ items: [{ label: "Overview", href: "/" }, { label: "Components", href: "/components" }] }, { label: "System", items: [{ label: "Theme", href: "/system/theme" }, { label: "Tokens", href: "/system/tokens" }, { label: "Rules", href: "/system/rules" }, { label: "Validation", href: "/validation" }, { label: "Accessibility", href: "/accessibility" }, { label: "Registry", href: "/api/registry" }, { label: "AI context", href: "/ai/context" }] }]} breadcrumbs={[{ label: "Overview", href: "/" }]} /></aside><main id="main" tabIndex={-1} className={styles.main}>
      <section className={styles.hero}><p className={styles.eyebrow}>ONE SYSTEM. SHARED DECISIONS.</p><h1>Overview</h1><p className={styles.tagline}>Good interfaces start with a common language.</p><p className={styles.intro}>A design system that humans and AI can understand.<br />Components, tokens, and guidance. All from one contract.</p><div className={styles.heroLinks}><Link href="/system/theme">Edit the theme ↗</Link><Link href="/components">Browse the components ↗</Link><Link href="/ai/context">Export the AI context ↗</Link><Link href="/api/registry" variant="subtle">Explore the registry ↗</Link></div></section>
      <section aria-labelledby="foundation-title" className={styles.foundation}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SYSTEM COVERAGE</p><h2 id="foundation-title">What the registry covers.</h2></div><p>Calculated from the registry, not typed in. Metadata-complete means a component&apos;s contract and references are complete. It does not mean the component was reviewed or an agent was tested.</p></div><dl className={styles.stats}>{[
        [coverage.components, 'Components'], [`${coverage.metadataComplete} of ${coverage.components}`, 'Metadata-complete'], [`${coverage.accessibilityReviewed} of ${coverage.components}`, 'Accessibility reviewed'], [coverage.tokens, 'Resolved tokens'],
        [coverage.rules, 'Usage rules'], [coverage.examples, 'Examples'], [coverage.interactive, 'Interactive components'], [system.themePresets.length, 'Default preset']].map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <DemoHealth scenario={parsedScenario.success ? parsedScenario.data : 'normal'} />
      <section aria-labelledby="components-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>TRY THE COMPONENTS</p><h2 id="components-title" tabIndex={-1}>Small pieces. Clear intent.</h2></div><p>Maturity and review status are on each component page.</p></div><div className={styles.componentGrid}>{system.components.map(component => {
        const example = system.examples.find(e => component.exampleIds.includes(e.id) && e.intent === 'recommended');
        return <article key={component.id} className={styles.component}><div className={styles.preview}>{example?.intent === 'recommended' && <ExamplePreview previewKey={example.previewKey} />}</div><div className={styles.componentText}><h3>{component.name}</h3><p>{component.shortPurpose}</p><code>{component.publicImport.exportName}</code></div></article>;
      })}</div></section>
      <section className={styles.next}><p className={styles.eyebrow}>WHERE TO GO NEXT</p><h2>A workspace built from the system itself.</h2><p>Change the theme and watch components update together. Explore tokens, rules, and accessibility evidence, then export the same contract for people and AI agents. This preview has no project scanner, and validation results are labeled demo fixtures.</p><div className={styles.heroLinks}><Link href="/system/tokens">Tokens ↗</Link><Link href="/system/rules">Rules ↗</Link><Link href="/accessibility">Accessibility ↗</Link><Link href="/validation">Validation ↗</Link></div></section>
    </main></div><footer className={styles.footer}><span>See + Yes + Yes. A little nod to CSS.</span><span>Define once. Build together.</span></footer>
  </>;
}
