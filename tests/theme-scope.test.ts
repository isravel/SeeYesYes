import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { registry, defaultTheme } from '@/lib/data/registry';

describe('scope server boundaries and contract defaults', () => {
  it('uses generated contract defaults outside a scope', () => {
    expect(renderToStaticMarkup(createElement(Button, {children: 'Action'}))).toContain('data-variant="primary"');
    expect(renderToStaticMarkup(createElement(Link, {href: '/', children: 'Home'}))).toContain('data-variant="default"');
    expect(renderToStaticMarkup(createElement(Spinner))).toContain('data-size="medium"');
  });
  it('workspace adds no wrapper or variables to server markup', () => {
    const content = renderToStaticMarkup(createElement(ThemeScope, {theme: defaultTheme, appearance: 'system', workspace: true, system: registry, children: createElement(Button, {children: 'Action'})}));
    expect(content).toMatch(/^<button/);
    expect(content).not.toContain('data-theme-scope');
    expect(content).not.toContain('style=');
  });
  it('known nested settings render their own variables and defaults', () => {
    const theme = {...defaultTheme, componentDefaults: {button: {variant: 'secondary', size: 'small'}}};
    const content = renderToStaticMarkup(createElement(ThemeScope, {theme, appearance: 'dark', system: registry, children: createElement(Button, {children: 'Action'})}));
    expect(content).toContain('data-appearance="dark"');
    expect(content).toContain('--sys-color-primary:oklch(0.8 0.1 264 / 1)');
    expect(content).toContain('data-variant="secondary"');
    expect(content).toContain('data-size="small"');
  });
  it('system previews wait until their OS mode is known', () => {
    expect(renderToStaticMarkup(createElement(ThemeScope, {theme: defaultTheme, appearance: 'system', system: registry, children: 'Preview'}))).toBe('');
  });
});
