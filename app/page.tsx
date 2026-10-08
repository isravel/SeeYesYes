import { localAdapter } from '@/lib/data/adapter';
import { ExamplePreview } from '@/components/examples/previews';
import { Navigation } from '@/components/ui/navigation';
import type { Metadata } from 'next';
import { Link } from '@/components/ui/link';
import { resolveTokens } from '@/lib/theme/resolve';
import styles from './page.module.css';
export const metadata: Metadata = { title: 'Overview — SeeYesYes' };
export default async function Home() {
  const system = await localAdapter.get('registry');
  const theme = await localAdapter.get('theme');
  const tokens = resolveTokens(system.tokens, theme, system.fonts);
  return <>
    <a className={styles.skip} href="#main">Skip to content</a>

    <header className={styles.header}><a href="/" className={styles.brand}>SeeYesYes<span className={styles.brandMark} aria-hidden="true">↗</span></a><span className={styles.stage}>Foundation preview · v{system.productVersion}</span></header>
    <div className={styles.workspace}><aside className={styles.sidebar}><Navigation showSkipLink={false} label="Workspace" currentHref="/" mainId="main" groups={[{ items: [{ label: "Overview", href: "/" }, { label: "Components", href: "#components-title" }] }, { label: "System", items: [{ label: "Registry", href: "/api/registry" }, { label: "AI context", href: "/api/ai-context" }] }]} breadcrumbs={[{ label: "Overview", href: "/" }]} /></aside><main id="main" tabIndex={-1} className={styles.main}>
      <section className={styles.hero}><p className={styles.eyebrow}>ONE SYSTEM. SHARED DECISIONS.</p><h1>Overview</h1><p className={styles.tagline}>Good interfaces start with a common language.</p><p className={styles.intro}>A design system that humans and AI can understand.<br />Components, tokens, and guidance. All from one contract.</p><div className={styles.heroLinks}><Link href="/api/registry">Explore the registry ↗</Link><Link href="/api/ai-context" variant="subtle">Read the AI context ↗</Link></div></section>
      <section aria-labelledby="foundation-title" className={styles.foundation}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>MILESTONE 02</p><h2 id="foundation-title">Shared components are taking shape.</h2></div><p>Real components. Validated references.<br />A small, connected starting point.</p></div><dl className={styles.stats}>{[[system.components.length, 'Working components'], [tokens.length, 'Resolved tokens'], [system.rules.length, 'Usage rules'], [system.themePresets.length, 'Default preset']].map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <section aria-labelledby="components-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>TRY THE COMPONENTS</p><h2 id="components-title" tabIndex={-1}>Small pieces. Clear intent.</h2></div><p>Experimental · Accessibility review pending</p></div><div className={styles.componentGrid}>{system.components.map(component => {
        const example = system.examples.find(e => component.exampleIds.includes(e.id) && e.intent === 'recommended');
        return <article key={component.id} className={styles.component}><div className={styles.preview}>{example?.intent === 'recommended' && <ExamplePreview previewKey={example.previewKey} />}</div><div className={styles.componentText}><h3>{component.name}</h3><p>{component.shortPurpose}</p><code>{component.publicImport.exportName}</code></div></article>;
      })}</div></section>
      <section className={styles.next}><p className={styles.eyebrow}>WHAT COMES NEXT</p><h2>A workspace built from the system itself.</h2><p>Theme editing, component exploration, and context exports arrive in the next milestones. This preview has no project scanner. Validation API results are labeled demo fixtures.</p><Link href="/api/rules">Read the eight system rules ↗</Link></section>
    </main></div><footer className={styles.footer}><span>See + Yes + Yes. A little nod to CSS.</span><span>Define once. Build together.</span></footer>
  </>;
}
