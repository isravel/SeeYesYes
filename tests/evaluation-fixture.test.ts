import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { registry } from '@/lib/data/registry';
import { buildAgentsSnippet } from '@/lib/contract/agent-files';
import { createContext } from '@/lib/contract/context';
import { contextMarkdown } from '@/lib/contract/serialize';
// @ts-expect-error The reset script is plain ESM without type declarations.
import { componentSources, resetFixture, unresolvedImports } from '../evaluation/reset.mjs';
import { buildCondition, conditions, readTask } from '../evaluation/lib/condition';

const temp = mkdtempSync(join(tmpdir(), 'seeyesyes-fixture-'));
afterAll(() => rmSync(temp, { recursive: true, force: true }));
const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => { const path = join(dir, name); return name === 'node_modules' ? [] : statSync(path).isDirectory() ? walk(path) : [path]; });

describe('fixture app (E2)', () => {
  const dir = join(temp, 'fixture-app');
  resetFixture({ outDir: dir });
  const files = walk(dir);
  const relative = files.map(file => file.slice(dir.length + 1));

  it('has one empty page per task and the shipped components, and nothing from the registry or docs', () => {
    for (let i = 1; i <= 8; i += 1) expect(relative, `t${i}`).toContain(`app/t${i}/page.tsx`);
    expect(relative).toContain('components/ui/button.tsx');
    expect(relative).toContain('app/tokens.css');
    for (const forbidden of ['lib/data', 'content', 'docs', 'evaluation', 'tests', 'scripts']) expect(relative.some(path => path.startsWith(`${forbidden}/`)), forbidden).toBe(false);
    for (const name of ['AGENTS.md', 'CLAUDE.md', 'README.md', 'llms.txt', 'llms-full.txt']) expect(relative.some(path => path.split('/').pop() === name), name).toBe(false);
    expect(relative.some(path => path.startsWith('lib/contract/') && !['lib/contract/schema.ts', 'lib/contract/theme-validation.ts'].includes(path))).toBe(false);
  });

  it('contains no registry, documentation, or export content anywhere in its files', () => {
    const text = files.map(file => readFileSync(file, 'utf8')).join('\n');
    const forbidden = [
      ...registry.principles, ...registry.project.guidance,
      ...registry.rules.flatMap(rule => [rule.id, rule.description, rule.suggestedFix]),
      ...registry.examples.flatMap(example => [example.title, example.id]),
      ...registry.components.flatMap(component => [component.purpose, component.shortPurpose, ...component.prohibitedUsage, ...component.aiGuidance.prefer, ...component.aiGuidance.avoid]),
      'SeeYesYes', 'seeyesyes', 'registry', 'llms.txt', 'AGENTS.md',
    ];
    for (const needle of forbidden) expect(text.includes(needle), `fixture mentions: ${needle}`).toBe(false);
  });

  it('needs nothing outside itself: every alias import resolves inside the copy', () => {
    expect(unresolvedImports(dir)).toEqual([]);
  });

  it('copies exactly the component source closure, which does not include registry data', () => {
    const closure = (() => {
      const seen = new Set<string>();
      const visit = (file: string) => {
        if (seen.has(file) || !/\.tsx?$/.test(file)) { seen.add(file); return; }
        seen.add(file);
        for (const [, spec] of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s+['"]((?:@\/|\.\.?\/)[^'"]+)['"]/g)) {
          const base = spec.startsWith('@/') ? spec.slice(2) : join(dirname(file), spec);
          const found = ['.tsx', '.ts', '.css', '/index.ts'].map(ext => base + ext).find(candidate => existsSync(candidate));
          if (found) visit(found);
        }
      };
      for (const file of readdirSync('components/ui').filter(name => name.endsWith('.tsx'))) visit(`components/ui/${file}`);
      return [...seen].filter(file => /\.(tsx?)$/.test(file) && !file.startsWith('components/ui/')).sort();
    })();
    const copied = (componentSources as string[]).filter(path => /\.tsx?$/.test(path) && !path.startsWith('components/ui'));
    expect(copied.sort()).toEqual(closure);
    expect(closure.some(file => file.startsWith('lib/data/'))).toBe(false);
  });

  it('resets to a clean copy each time, discarding anything an earlier run left behind', async () => {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(join(dir, 'app', 't1', 'extra.tsx'), 'export {}');
    writeFileSync(join(dir, 'AGENTS.md'), 'leftover');
    resetFixture({ outDir: dir });
    expect(existsSync(join(dir, 'app', 't1', 'extra.tsx'))).toBe(false);
    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(false);
  });

  it('refuses to reset a directory that is not clearly a fixture', () => {
    expect(() => resetFixture({ outDir: join(temp, 'important-work') })).toThrow(/fixture/);
  });
});

describe('conditions (E2)', () => {
  const task = (id: string) => readTask(id);
  const defaults = { settingsVersion: 1 as const, theme: registry.themePresets[0], appearance: 'system' as const };

  it('C0 adds nothing; C1 adds the AGENTS.md snippet; C2 adds the task export; C3 adds the full export', () => {
    const t2 = task('T2');
    const c0 = buildCondition('C0', t2, registry), c1 = buildCondition('C1', t2, registry), c2 = buildCondition('C2', t2, registry), c3 = buildCondition('C3', t2, registry);
    expect(c0).toMatchObject({ agentsMd: null, preamble: '', contextBytes: 0 });
    expect(c1.agentsMd).toBe(buildAgentsSnippet(registry, defaults));
    expect(c1.preamble).toBe('');
    expect(c2.agentsMd).toBe(c1.agentsMd);
    expect(c2.preamble).toBe(contextMarkdown(createContext(registry, { mode: 'task', componentIds: ['dialog', 'button'] })));
    expect(c3.preamble).toBe(contextMarkdown(createContext(registry, { mode: 'full' })));
    expect(c0.contextBytes).toBeLessThan(c1.contextBytes);
    expect(c1.contextBytes).toBeLessThan(c2.contextBytes);
    expect(c2.contextBytes).toBeLessThan(c3.contextBytes);
  });

  it('uses the default preset for every condition and never alters an export', () => {
    for (const id of ['T1', 'T3', 'T6']) for (const condition of conditions) {
      const result = buildCondition(condition, task(id), registry);
      if (condition === 'C2' || condition === 'C3') { expect(result.preamble).toContain('scope default-theme'); expect(result.preamble).toContain('theme default'); }
      expect(result.prompt).toBe(task(id).prompt);
    }
  });

  it('is deterministic', () => {
    expect(buildCondition('C2', task('T5'), registry)).toEqual(buildCondition('C2', task('T5'), registry));
  });
});
