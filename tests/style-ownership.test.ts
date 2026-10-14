import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => { const path = join(dir, name); return statSync(path).isDirectory() ? (name === 'node_modules' || name === '.next' ? [] : walk(path)) : [path]; });
const pageStyles = [...walk('app'), ...walk('components/examples'), ...walk('components/shell')].filter(file => file.endsWith('.module.css'));
const selectors = (file: string) => [...readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}@]+)\{/g)].flatMap(m => m[1].split(',').map(s => s.trim()).filter(Boolean));

// Containers that hold live components: a descendant element selector rooted in one can reach into a component's own markup.
const liveContainers = ['section', 'step', 'previewColumn', 'page', 'preview', 'stage', 'previewScope', 'details', 'panel', 'main', 'next', 'content', 'frame', 'shell', 'dashboard', 'split', 'detail', 'settings', 'dense', 'marketing', 'body', 'side'];
const tags = 'button|input|select|textarea|table|thead|tbody|tr|th|td|caption|svg|label|dialog|nav|ul|ol|li|p|h[1-6]|a|span|div|code|pre|dl|dt|dd|strong';

describe('style ownership (A18)', () => {
  it('finds the page and layout style modules to audit', () => { expect(pageStyles.length).toBeGreaterThan(10); });

  it('page and layout CSS never styles the inside of a component through a descendant element selector', () => {
    const leaks = pageStyles.flatMap(file => selectors(file).filter(sel => new RegExp(`^\\.(${liveContainers.join('|')})\\s+(${tags})(?=[\\s:.\\[]|$)`).test(sel)).map(sel => `${file}: ${sel}`));
    expect(leaks).toEqual([]);
  });

  it('page and layout CSS never targets a component state attribute such as data-variant or data-size', () => {
    const leaks = pageStyles.flatMap(file => selectors(file).filter(sel => /\[data-(variant|size|tone|shape|orientation|activation|placement|appearance|theme-scope)/.test(sel)).map(sel => `${file}: ${sel}`));
    expect(leaks).toEqual([]);
  });

  it('page and layout CSS does not override component colors, radii, or font sizes on component class names', () => {
    for (const file of pageStyles) expect(readFileSync(file, 'utf8')).not.toMatch(/Button_|Input_|Select_|Badge_|Card_|Alert_/);
  });
});

describe('layouts reuse primitives (A18)', () => {
  const source = readFileSync('components/examples/layouts.tsx', 'utf8');

  it('use no raw interactive or table elements, only the system components', () => {
    for (const element of ['button', 'input', 'select', 'textarea', 'table', 'dialog']) expect(source, `<${element}`).not.toMatch(new RegExp(`<${element}[\\s>]`));
  });

  it('import every component from its public import module', () => {
    const modules = [...source.matchAll(/from '(@\/components\/ui\/[^']+)'/g)].map(m => m[1]);
    expect(modules.length).toBeGreaterThanOrEqual(12);
    for (const module of modules) expect(readFileSync(`${module.replace('@/', '')}.tsx`, 'utf8').length).toBeGreaterThan(0);
    expect([...source.matchAll(/from '(\.[^']*)'/g)].map(m => m[1])).toEqual(['./Layouts.module.css']);
  });

  it('layout styles set only placement and spacing, using semantic tokens', () => {
    const css = readFileSync('components/examples/Layouts.module.css', 'utf8');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(/i);
    expect(css).toMatch(/var\(--sys-spacing-/);
  });
});
