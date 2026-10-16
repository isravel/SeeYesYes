// Restores a clean copy of the evaluation fixture app before every run.
//   node evaluation/reset.mjs [--out <dir>] [--link-node-modules] [--verify]
// --verify installs the copy's dependencies, then type-checks and builds it.
// The copy holds the shipped component source and its types, plus one empty page per task. It never holds the registry,
// documentation, exports, or an AGENTS.md, so condition C0 has no hidden context.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = name => args.includes(name);
const out = resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : join(root, 'evaluation', 'work', 'fixture-app'));

/** Shipped component source and the files it imports. The test suite recomputes this closure and checks it matches. */
export const componentSources = [
  'components/ui', 'components/theme/ThemeScope.tsx', 'components/theme/ThemeScope.module.css',
  'lib/contract/schema.ts', 'lib/contract/theme-validation.ts', 'lib/generated/component-defaults.ts', 'lib/routes.ts', 'lib/theme/check.ts', 'lib/theme/resolve.ts', 'lib/theme/scales.ts', 'app/tokens.css',
];
const dependencies = ['next', 'react', 'react-dom', 'react-aria-components', '@react-aria/overlays', '@phosphor-icons/react', 'zod'];
const devDependencies = ['typescript', '@types/react', '@types/react-dom', '@types/node'];

export function resetFixture({ outDir = out, linkNodeModules = false } = {}) {
  if (!basename(outDir).includes('fixture')) throw new Error(`Refusing to reset ${outDir}: the output directory name must contain "fixture".`);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(join(root, 'evaluation', 'fixture-app'), outDir, { recursive: true, filter: source => !source.endsWith('README.md') });
  for (const path of componentSources) {
    const from = join(root, path);
    if (!existsSync(from)) throw new Error(`Missing component source: ${path}`);
    mkdirSync(dirname(join(outDir, path)), { recursive: true });
    cpSync(from, join(outDir, path), { recursive: true });
  }
  const rootPackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const pick = names => Object.fromEntries(names.map(name => [name, rootPackage.dependencies?.[name] ?? rootPackage.devDependencies?.[name]]).filter(([, version]) => version));
  writeFileSync(join(outDir, 'package.json'), `${JSON.stringify({
    name: 'fixture-app', private: true, version: '0.0.0',
    scripts: { dev: 'next dev', build: 'next build', typecheck: 'tsc --noEmit' }, dependencies: pick(dependencies), devDependencies: pick(devDependencies),
  }, null, 2)}\n`);
  if (linkNodeModules) symlinkSync(join(root, 'node_modules'), join(outDir, 'node_modules'));
  return outDir;
}

/** Every `@/` import in the copy must resolve inside the copy, so the copy needs nothing else from the repository. */
export function unresolvedImports(dir) {
  const missing = [];
  const walk = d => readdirSync(d).flatMap(name => { const p = join(d, name); return name === 'node_modules' || name === '.next' ? [] : statSync(p).isDirectory() ? walk(p) : [p]; });
  for (const file of walk(dir).filter(f => /\.tsx?$/.test(f))) {
    for (const [, spec] of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s+['"]((?:@\/|\.\.?\/)[^'"]+)['"]/g)) {
      const base = spec.startsWith('@/') ? join(dir, spec.slice(2)) : resolve(dirname(file), spec);
      if (!['.ts', '.tsx', '.css', '/index.ts', ''].some(ext => existsSync(base + ext) && !(ext === '' && statSync(base + ext).isDirectory()))) missing.push(`${relative(dir, file)} -> ${spec}`);
    }
  }
  return missing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const verify = flag('--verify');
  const dir = resetFixture({ linkNodeModules: flag('--link-node-modules') });
  const missing = unresolvedImports(dir);
  if (missing.length) { console.error(`The copy imports files it does not contain:\n${missing.join('\n')}`); process.exit(1); }
  console.log(`Clean fixture app written to ${relative(process.cwd(), dir) || dir}`);
  if (verify) {
    // A symlinked node_modules cannot be built by Turbopack, so verification installs the copy's own dependencies.
    execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit' });
    execFileSync('npx', ['tsc', '--noEmit'], { cwd: dir, stdio: 'inherit' });
    execFileSync('npx', ['next', 'build'], { cwd: dir, stdio: 'inherit' });
    console.log('Fixture app type-checks and builds.');
  }
}
