import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { integrationPaths, layoutSnippet, nodeNote, setupCommands } from '@/lib/docs/getting-started';
import { registry } from '@/lib/data/registry';

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };

describe('Getting Started matches the repository', () => {
  it('names only npm scripts that exist', () => {
    for (const { command } of setupCommands) {
      const script = command.match(/^npm run ([\w:-]+)$/)?.[1];
      if (script) expect(pkg.scripts[script], command).toBeDefined();
      else expect(command).toMatch(/^(npm ci|npx playwright install chromium)$/);
    }
    for (const required of ['dev', 'check', 'test:browser', 'generate']) expect(pkg.scripts[required]).toBeDefined();
  });

  it('states the Node version the repository pins', () => {
    const major = readFileSync('.nvmrc', 'utf8').trim();
    expect(nodeNote).toContain(`Node.js ${major}`);
    expect(JSON.stringify(readFileSync('README.md', 'utf8'))).toContain(`Node.js ${major}`);
  });

  it('names only files and folders that exist', () => {
    for (const { path } of integrationPaths) expect(existsSync(path), path).toBe(true);
  });

  it('shows root layout setup that the real layout contains', () => {
    const layout = readFileSync('app/layout.tsx', 'utf8');
    for (const line of ["import { ThemeLifecycleProvider } from '@/components/theme/ThemeLifecycleProvider';", "import { buildThemeBootstrapScript } from '@/lib/theme/persistence';", '<ThemeLifecycleProvider system={system}>', '<WorkspaceShell version={system.productVersion}>{children}</WorkspaceShell>', "import { WorkspaceShell } from '@/components/shell/WorkspaceShell';", "buildThemeBootstrapScript()", 'suppressHydrationWarning']) {
      expect(layout, line).toContain(line);
      expect(layoutSnippet, line).toContain(line.replace(/^import /, 'import '));
    }
  });

  it('uses a registry example whose import is a real public import', () => {
    const example = registry.examples.find(item => item.id === 'button-save' && item.intent === 'recommended')!;
    expect(example.code).toContain('import { Button } from "@/components/ui/button";');
    expect(existsSync('components/ui/button.tsx')).toBe(true);
  });
});
