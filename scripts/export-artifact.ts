/**
 * Export a portable consumer artifact from this repository.
 *
 * The artifact contains only the reusable design-system surface: the `components/ui` controls,
 * the `ThemeScope` theme provider, the token stylesheet, and the trimmed theme system the
 * provider needs. Routes, the workspace shell, demo fixtures, the preview catalog, the API
 * handlers, and the documentation pages are never copied.
 *
 * Source-only `@/...` aliases are rewritten to relative specifiers so the package resolves
 * without this repository's tsconfig paths. React and the other runtime libraries stay peer
 * dependencies, which keeps a single React instance in the consumer.
 *
 * Usage:
 *   node --import tsx scripts/export-artifact.ts [--out <dir>] [--pack-to <dir>]
 *
 * `--out` defaults to `artifact/`. `--pack-to` additionally runs `npm pack` and copies the
 * resulting tarball into the given directory, which is how a consumer installs a pinned copy.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { registry } from '../lib/data/registry.ts';
import { toThemeSystem } from '../lib/contract/theme-validation.ts';
import { resolveTokens, cssVariables, RESOLVER_VERSION } from '../lib/theme/resolve.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  version: string;
  dependencies: Record<string, string>;
};

/** Entry points define the public surface. Everything else is pulled in only if an entry needs it. */
const entryPoints = [
  ...readdirSync(join(root, 'components/ui'))
    .filter(name => name.endsWith('.tsx') && name !== 'internal-trigger-button.tsx')
    .map(name => `components/ui/${name}`),
  // X7 page templates are public too: they sit beside the controls and import only the shared controls and utilities.
  ...readdirSync(join(root, 'components/templates')).filter(name => name.endsWith('.tsx')).map(name => `components/templates/${name}`),
  'components/theme/ThemeScope.tsx',
  'components/theme/ThemeLifecycleProvider.tsx',
  'components/theme/ThemeSwitcher.tsx',
  'lib/utils/cn.ts',
  'lib/theme/persistence.ts',
];

/** Peer dependencies are resolved by the consumer so there is exactly one copy of each runtime. */
const peerDependencies = ['react', 'react-dom', 'next', 'zod', 'react-aria-components', 'react-aria', '@phosphor-icons/react', 'zustand'];

type Args = { out: string; packTo: string | null };
function parseArgs(argv: string[]): Args {
  const read = (flag: string) => {
    const index = argv.indexOf(flag);
    return index === -1 ? null : argv[index + 1] ?? null;
  };
  return { out: resolve(root, read('--out') ?? 'artifact'), packTo: read('--pack-to') };
}

const importPattern = /\bfrom\s+'([^']+)'/g;
const extensions = ['.ts', '.tsx'];

function resolveModule(specifier: string, fromFile: string): string | null {
  const base = specifier.startsWith('@/')
    ? join(root, specifier.slice(2))
    : specifier.startsWith('.')
      ? resolve(dirname(join(root, fromFile)), specifier)
      : null;
  if (!base) return null;
  if (base.endsWith('.css')) return existsSync(base) ? relative(root, base) : null;
  for (const candidate of [base, ...extensions.map(ext => `${base}${ext}`), join(base, 'index.ts')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return relative(root, candidate);
  }
  return null;
}

/** Rewrites one source file's `@/...` aliases into relative specifiers valid inside the artifact. */
function rewriteAliases(source: string, fromFile: string): string {
  return source.replace(importPattern, (match, specifier: string) => {
    if (!specifier.startsWith('@/')) return match;
    const target = resolveModule(specifier, fromFile);
    if (!target) throw new Error(`Cannot resolve ${specifier} from ${fromFile}`);
    const withoutExtension = target.replace(/\.(ts|tsx)$/, '');
    let rewritten = relative(dirname(fromFile), withoutExtension).replaceAll('\\', '/');
    if (!rewritten.startsWith('.')) rewritten = `./${rewritten}`;
    return `from '${rewritten}'`;
  });
}

function collect(entries: string[]): { modules: Set<string>; externals: Set<string>; missing: string[] } {
  const modules = new Set<string>();
  const externals = new Set<string>();
  const missing: string[] = [];
  const queue = [...entries];
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (modules.has(file)) continue;
    modules.add(file);
    if (file.endsWith('.css')) continue;
    const source = readFileSync(join(root, file), 'utf8');
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1]!;
      if (!specifier.startsWith('.') && !specifier.startsWith('@/')) {
        externals.add(specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]!);
        continue;
      }
      const target = resolveModule(specifier, file);
      if (!target) { missing.push(`${specifier} (from ${file})`); continue; }
      queue.push(target);
    }
  }
  return { modules, externals, missing };
}

/** Token stylesheet built by the same resolver the provider uses, so defaults and runtime agree. */
function buildTokenStylesheet(): string {
  const system = toThemeSystem(registry);
  const theme = system.themePresets.find(preset => preset.id === system.defaultThemeId);
  if (!theme) throw new Error(`Default theme ${system.defaultThemeId} is missing.`);
  const resolved = resolveTokens(system.tokens, theme, system.fonts);
  const block = (mode: 'light' | 'dark', indent: string) =>
    Object.entries(cssVariables(resolved, mode))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => `${indent}${name}: ${value};`)
      .join('\n');
  return [
    `/* Generated from the ${system.defaultThemeId} preset by scripts/export-artifact.ts. Resolver ${RESOLVER_VERSION}. */`,
    ':root {',
    block('light', '  '),
    '}',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-appearance="light"]) {',
    block('dark', '    '),
    '  }',
    '}',
    ':root[data-appearance="dark"] {',
    block('dark', '  '),
    '}',
    '',
  ].join('\n');
}

const baseStylesheet = `/* Minimal base styles the shared controls assume. Consumers own layout and page styling. */
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--sys-color-background);
  color: var(--sys-color-foreground);
  font-family: var(--sys-typography-sans);
  font-size: var(--sys-typography-body);
  line-height: var(--sys-typography-line-height);
  -webkit-font-smoothing: antialiased;
}
button, input, select, textarea { font: inherit; }
a { color: inherit; }
code, pre, kbd, samp { font-family: var(--sys-typography-mono); }
::selection { background: var(--sys-color-secondary); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; scroll-behavior: auto !important; }
}
`;

function buildThemeSystemModule(): string {
  const system = toThemeSystem(registry);
  return [
    '// Generated by scripts/export-artifact.ts. Do not edit.',
    "// The trimmed theme system ThemeScope needs: presets, fonts, tokens, and component defaults.",
    "import type { ThemeSystem } from '../lib/contract/theme-validation';",
    "import type { Theme } from '../lib/contract/schema';",
    '',
    `export const themeSystem: ThemeSystem = ${JSON.stringify(system, null, 2)};`,
    '',
    'export const defaultTheme: Theme = (() => {',
    '  const preset = themeSystem.themePresets.find(theme => theme.id === themeSystem.defaultThemeId);',
    '  if (!preset) throw new Error(`Default theme ${themeSystem.defaultThemeId} is missing.`);',
    '  return preset;',
    '})();',
    '',
  ].join('\n');
}

function buildIndexModule(controlFiles: string[], templateFiles: string[]): string {
  const lines = [
    '// Public surface of the shared design system. Consumers import controls and the theme provider from here.',
    "export { artifactMetadata } from './artifact.generated';",
    "export type { ArtifactMetadata } from './artifact.generated';",
    "export { ThemeScope, useThemeScope, useComponentDefaults } from './components/theme/ThemeScope';",

    "export type { ThemeScopeProps } from './components/theme/ThemeScope';",
    "export { useSurface } from './components/theme/ThemeScope';",
    "export { ThemeLifecycleProvider, useThemeStores, useThemeSystem } from './components/theme/ThemeLifecycleProvider';",
    "export { ThemeSwitcher } from './components/theme/ThemeSwitcher';",
    "export type { ThemeSwitcherProps } from './components/theme/ThemeSwitcher';",
    "export { cn } from './lib/utils/cn';",
    "export type { ClassValue } from './lib/utils/cn';",
    "export { buildThemeBootstrapScript, SETTINGS_STORAGE_KEY } from './lib/theme/persistence';",
    "export type { ThemeSystem, ThemeComponent } from './lib/contract/theme-validation';",
    "export { validateTheme, effectiveDefaults, toThemeSystem } from './lib/contract/theme-validation';",
    "export type { Appearance, Mode, Theme } from './lib/contract/schema';",
    "export { parseTheme } from './lib/theme/check';",
    "export { resolveTokens, cssVariables, toCssVariable, RESOLVER_VERSION } from './lib/theme/resolve';",
    "export { themeSystem, defaultTheme } from './system/theme-system.generated';",
    '',
  ];
  for (const file of controlFiles.sort()) {
    const specifier = `./${file.replace(/\.tsx$/, '')}`;
    lines.push(`export * from '${specifier}';`);
  }
  for (const file of templateFiles.sort()) lines.push(`export * from './${file.replace(/\.tsx$/, '')}';`);
  lines.push('');
  return lines.join('\n');
}

function sourceRevision(): { revision: string; clean: boolean } {
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
  return { revision, clean: status.length === 0 };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const { modules, externals, missing } = collect(entryPoints);
  if (missing.length > 0) throw new Error(`Unresolved imports:\n${missing.join('\n')}`);

  const unexpected = [...externals].filter(name => !peerDependencies.includes(name));
  if (unexpected.length > 0) throw new Error(`Unexpected runtime dependencies: ${unexpected.join(', ')}. Add them to peerDependencies or remove the import.`);

  rmSync(args.out, { recursive: true, force: true });
  mkdirSync(join(args.out, 'src'), { recursive: true });

  for (const file of modules) {
    const destination = join(args.out, 'src', file);
    mkdirSync(dirname(destination), { recursive: true });
    if (file.endsWith('.css')) copyFileSync(join(root, file), destination);
    else writeFileSync(destination, rewriteAliases(readFileSync(join(root, file), 'utf8'), file));
  }

  mkdirSync(join(args.out, 'src/styles'), { recursive: true });
  writeFileSync(join(args.out, 'src/styles/tokens.css'), buildTokenStylesheet());
  writeFileSync(join(args.out, 'src/styles/base.css'), `@import './tokens.css';\n\n${baseStylesheet}`);
  mkdirSync(join(args.out, 'src/system'), { recursive: true });
  writeFileSync(join(args.out, 'src/system/theme-system.generated.ts'), buildThemeSystemModule());

  const controlFiles = [...modules].filter(file => file.startsWith('components/ui/') && file.endsWith('.tsx'));

  const templateFiles = [...modules].filter(file => file.startsWith('components/templates/') && file.endsWith('.tsx'));

  const { revision, clean } = sourceRevision();

  const fingerprint = createHash('sha256').update([...modules, 'lib/data/registry.ts', 'scripts/export-artifact.ts'].sort().map(file => `${file}\n${readFileSync(join(root, file), 'utf8')}`).join('\n')).update(buildThemeSystemModule()).digest('hex').slice(0, 10);
  const version = `${sourcePackage.version}-src.${revision.slice(0, 7)}${clean ? '' : `.dirty.${fingerprint}`}`;
  const dependencyVersion = (name: string) => sourcePackage.dependencies[name];
  const packageJson = {
    name: '@seeyesyes/ui',
    version,
    description: 'Portable SeeYesYes design-system controls, tokens, and theme scope for consuming applications.',
    type: 'module',
    sideEffects: ['**/*.css'],
    exports: {
      '.': './src/index.ts',
      './styles.css': './src/styles/base.css',
      './tokens.css': './src/styles/tokens.css',
      './artifact': './ARTIFACT.json',
      './package.json': './package.json',
    },

    files: ['src', 'README.md', 'ARTIFACT.json'],
    peerDependencies: {
      react: '>=19.0.0',
      'react-dom': '>=19.0.0',
      next: '>=15.0.0',
      zod: `^${(dependencyVersion('zod') ?? '4.0.0').replace(/^[^\d]*/, '')}`,
      // react-aria-components depends on an exact react-aria version. These two peers are exact, not ranges: a range lets npm pick a newer
      // react-aria than the one react-aria-components pins, which installs two copies and splits the portal context (nested-theme dialogs then render in the root theme).
      'react-aria-components': (dependencyVersion('react-aria-components') ?? '1.22.0').replace(/^[^\d]*/, ''),
      'react-aria': (dependencyVersion('react-aria') ?? '3.53.0').replace(/^[^\d]*/, ''),
      '@phosphor-icons/react': `^${(dependencyVersion('@phosphor-icons/react') ?? '2.1.10').replace(/^[^\d]*/, '')}`,
      zustand: `^${(dependencyVersion('zustand') ?? '5.0.0').replace(/^[^\d]*/, '')}`,
    },
  };
  writeFileSync(join(args.out, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);

  const artifactMetadata = {
    source: { repository: 'SeeYesYes', revision, workingTreeClean: clean },
    generatedBy: 'scripts/export-artifact.ts',
    resolverVersion: RESOLVER_VERSION,
    entryPoints,
    moduleCount: modules.size,
    exportedControls: controlFiles.map(file => file.replace('components/ui/', '').replace('.tsx', '')).sort(),
    peerDependencies: Object.keys(packageJson.peerDependencies).sort(),
    notes: [
      'Source files ship as TypeScript and CSS Modules; consumers must transpile this package (for example Next.js transpilePackages).',
      'Routes, the workspace shell, demo fixtures, the preview catalog, and API handlers are intentionally excluded.',
      'Component accessibility review in the source project is incomplete; composed consumer screens still need their own checks.',
    ],
  };
  writeFileSync(join(args.out, 'ARTIFACT.json'), `${JSON.stringify(artifactMetadata, null, 2)}\n`);
  // The same metadata as a typed module, so consumers can read it without JSON module resolution.
  writeFileSync(join(args.out, 'src/artifact.generated.ts'), [
    '// Generated by scripts/export-artifact.ts. Do not edit.',
    'export type ArtifactMetadata = {',
    '  source: { repository: string; revision: string; workingTreeClean: boolean };',
    '  generatedBy: string;',
    '  resolverVersion: string;',
    '  entryPoints: string[];',
    '  moduleCount: number;',
    '  exportedControls: string[];',
    '  peerDependencies: string[];',
    '  notes: string[];',
    '};',
    '',
    `export const artifactMetadata: ArtifactMetadata = ${JSON.stringify(artifactMetadata, null, 2)};`,
    '',
  ].join('\n'));
  writeFileSync(join(args.out, 'src/index.ts'), buildIndexModule(controlFiles, templateFiles));


  writeFileSync(join(args.out, 'README.md'), [
    '# @seeyesyes/ui',
    '',
    `Portable export of the SeeYesYes design system, generated from source revision \`${revision}\`.`,
    '',
    '## Install',
    '',
    'Install the packed tarball so the consumer never depends on a sibling checkout:',
    '',
    '```sh',
    'npm install ./vendor/seeyesyes-ui-<version>.tgz',
    '```',
    '',
    '## Peer dependencies',
    '',
    'Install these, at versions that satisfy `package.json`: `react`, `react-dom`, `next`, `zod`, `react-aria-components`, `react-aria`, `@phosphor-icons/react` and `zustand`.',
    'Each is a peer so your app has exactly one copy. Do not add `overrides` or `resolutions` to make them dedupe.',
    '`react-aria-components` and `react-aria` are pinned to exact versions on purpose. `react-aria-components` depends on one exact `react-aria`, and `ThemeScope` must use that same copy, or a dialog opened inside a nested theme renders in the root theme. Keep them at the versions this package declares; if you want a newer pair, take a newer release of this package.',
    'npm 7+ installs missing peers for you, but you can also list them in your own `package.json`. If a missing peer is not installed (for example with `--legacy-peer-deps`), the build stops with `Module not found`.',
    '',
    '## Set up the theme (Next.js App Router)',
    '',
    '1. Add `transpilePackages: ["@seeyesyes/ui"]` to `next.config`. The package ships TypeScript and CSS Modules.',
    '2. In the root layout, import the stylesheet, put the bootstrap script in `<head>`, and wrap the app in `ThemeLifecycleProvider`:',
    '',
    '```tsx',
    "import '@seeyesyes/ui/styles.css';",
    "import { ThemeLifecycleProvider, buildThemeBootstrapScript, themeSystem } from '@seeyesyes/ui';",
    '',
    'export default function RootLayout({ children }: { children: React.ReactNode }) {',
    '  return (',
    '    <html lang="en" suppressHydrationWarning>',
    '      <head><script dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }} /></head>',
    '      <body><ThemeLifecycleProvider system={themeSystem}>{children}</ThemeLifecycleProvider></body>',
    '    </html>',
    '  );',
    '}',
    '```',
    '',
    '- `suppressHydrationWarning` on `<html>` is required: the bootstrap script sets `data-appearance` and theme variables on the root before React hydrates, which is what prevents a flash of the wrong appearance.',
    '- The script reads the saved appearance from `localStorage` and does nothing when storage is empty, blocked or invalid, so the first visit uses the default theme and `prefers-color-scheme`.',
    '- Controls such as `ThemeSwitcher` need the provider above them. `ThemeSwitcher` reads and saves the appearance.',
    '- A nested `ThemeScope` (`<ThemeScope id="x" theme={preset} appearance="light" workspace={false}>`) applies a different theme to its subtree. Dialogs, menus and other portals opened inside it inherit that scope.',
    '- Templates such as `SignInPage` link to routes you own (`signUpHref`, `forgotPasswordHref`). Provide those routes or pass your own hrefs; otherwise Next prefetches them and logs 404s.',
    '',
    '## Use without the provider',
    '',
    '```tsx',
    "import '@seeyesyes/ui/styles.css';",
    "import { ThemeScope, themeSystem, defaultTheme, Button } from '@seeyesyes/ui';",
    '',
    '<ThemeScope system={themeSystem} theme={defaultTheme} appearance="system" workspace>',
    '  <Button>Save</Button>',
    '</ThemeScope>',
    '```',
    '',
    '## Regenerate',
    '',
    '```sh',
    'node --import tsx scripts/export-artifact.ts --out artifact --pack-to <consumer>/vendor',
    '```',
    '',
    '## Limitations',
    '',
    '- Components are marked experimental upstream and human accessibility review is incomplete.',
    '- Consumers own layout, navigation composition, and product styling.',
    '',
  ].join('\n'));

  console.log(`Exported ${modules.size} modules and ${controlFiles.length} controls to ${relative(process.cwd(), args.out) || '.'}`);
  console.log(`Package @seeyesyes/ui@${version}`);
  if (!clean) console.warn('Warning: the working tree is dirty; the artifact version is marked .dirty.');

  if (args.packTo) {
    const target = resolve(process.cwd(), args.packTo);
    mkdirSync(target, { recursive: true });
    const output = execFileSync('npm', ['pack', '--silent', '--pack-destination', args.out], { cwd: args.out, encoding: 'utf8' }).trim();
    const tarball = output.split('\n').filter(Boolean).pop()!;
    cpSync(join(args.out, tarball), join(target, tarball));
    rmSync(join(args.out, tarball));
    console.log(`Packed ${tarball} into ${relative(process.cwd(), target)}`);
  }
}

main();
