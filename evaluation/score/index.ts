// Score a run of the fixture app. Automated checks only; requirements and keyboard checks are scored by a person.
//   node --import tsx evaluation/score/index.ts --dir <fixture dir> --task <T1..T8> [--build] [--url <page url> ...]
// It scores only files the run changed or added, compared with a clean copy, and prints one JSON result row.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { registry } from '../../lib/data/registry';
// @ts-expect-error The reset script is plain ESM without type declarations.
import { resetFixture } from '../reset.mjs';
import { checkSource, summarize, type Violation } from './checks';
import { runAxe } from './axe';

const sources = /\.(tsx?|css)$/;
const generated = new Set(['next-env.d.ts']);
const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => name === 'node_modules' || name === '.next' ? [] : statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)]);

/** Source files a run changed or added, relative to a clean copy of the fixture app. */
export function changedFiles(dir: string, baselineDir: string): string[] {
  return walk(dir).map(file => relative(dir, file)).filter(file => sources.test(file) && !generated.has(file)).filter(file => {
    const baseline = join(baselineDir, file);
    return !existsSync(baseline) || readFileSync(baseline, 'utf8') !== readFileSync(join(dir, file), 'utf8');
  }).sort();
}

export function scoreDirectory(dir: string, baselineDir: string): { files: string[]; violations: Violation[] } {
  const files = changedFiles(dir, baselineDir);
  return { files, violations: files.flatMap(file => checkSource(file, readFileSync(join(dir, file), 'utf8'), registry)) };
}

/** Type errors from the run's code. Unknown variants and disallowed combinations surface here as assignability errors. */
export function typeCheck(dir: string): { passed: boolean; errors: string[] } {
  try { execFileSync('npx', ['tsc', '--noEmit'], { cwd: dir, encoding: 'utf8', stdio: 'pipe' }); return { passed: true, errors: [] }; }
  catch (error) { const output = String((error as { stdout?: string }).stdout ?? ''); return { passed: false, errors: output.split('\n').filter(line => /error TS\d+/.test(line)) }; }
}

async function main() {
  const args = process.argv.slice(2);
  const value = (name: string) => args[args.indexOf(name) + 1];
  const dir = resolve(value('--dir') ?? 'evaluation/work/fixture-app');
  const urls = args.flatMap((arg, i) => arg === '--url' ? [args[i + 1]] : []);
  const baseline = mkdtempSync(join(tmpdir(), 'seeyesyes-fixture-baseline-'));
  try {
    resetFixture({ outDir: join(baseline, 'fixture-app') });
    const { files, violations } = scoreDirectory(dir, join(baseline, 'fixture-app'));
    const types = typeCheck(dir);
    let builds: boolean | null = null;
    if (args.includes('--build')) { try { execFileSync('npx', ['next', 'build'], { cwd: dir, stdio: 'pipe' }); builds = types.passed; } catch { builds = false; } }
    const axe = urls.length ? await runAxe(urls) : null;
    console.log(JSON.stringify({ taskId: value('--task') ?? null, filesScored: files, builds, typeCheck: types, violations, summary: summarize(violations), axe,
      manual: ['Requirements checklist', 'avoid-unnecessary-wrapper and minimize-custom-css review (flagged items marked needsReview)', 'Keyboard checks for T2, T6, and T8'] }, null, 2));
  } finally { rmSync(baseline, { recursive: true, force: true }); }
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) await main();
