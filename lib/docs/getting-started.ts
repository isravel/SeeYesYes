/** The facts Getting Started states. A test checks each command, script, and path against the repository. */
export const setupCommands = [
  { command: 'npm ci', note: 'Install the exact dependencies in the lockfile.' },
  { command: 'npm run dev', note: 'Start the local app, then open http://localhost:3000.' },
  { command: 'npm run check', note: 'Type-check, audit components, lint, run unit tests, and build.' },
  { command: 'npx playwright install chromium', note: 'Once, to download the browser the end-to-end tests use.' },
  { command: 'npm run test:browser', note: 'Run the browser journeys against a production build.' },
] as const;

export const nodeNote = 'Use Node.js 24 LTS (the repository includes an .nvmrc, so `nvm use` picks it) and npm.';

/** Repository files and folders the integration step names. */
export const integrationPaths = [
  { path: 'components/ui', purpose: 'The components. Import each one from its own file.' },
  { path: 'components/theme/ThemeLifecycleProvider.tsx', purpose: 'Applied and draft theme state, wrapped around the app in the root layout.' },
  { path: 'components/theme/ThemeScope.tsx', purpose: 'Provides theme variables, component defaults, and the overlay container for an area.' },
  { path: 'lib/data/registry.ts', purpose: 'The single registry of tokens, components, rules, and examples.' },
  { path: 'app/layout.tsx', purpose: 'Where the provider and the early theme script are mounted.' },
  { path: 'app/tokens.css', purpose: 'Default CSS variables, generated from the registry by `npm run generate`.' },
] as const;

export const layoutSnippet = `import { ThemeLifecycleProvider } from '@/components/theme/ThemeLifecycleProvider';
import { buildThemeBootstrapScript } from '@/lib/theme/persistence';

export default async function RootLayout({ children }) {
  const system = await localAdapter.get('registry');
  return (
    <html suppressHydrationWarning lang="en">
      <head><script dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }} /></head>
      <body><ThemeLifecycleProvider system={system}>{children}</ThemeLifecycleProvider></body>
    </html>
  );
}`;
