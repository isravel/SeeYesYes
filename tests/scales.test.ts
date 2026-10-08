import { describe, it, expect } from 'vitest';
import { registry, defaultTheme } from '@/lib/data/registry';
import { resolveTokens } from '@/lib/theme/resolve';
import { typeSizes } from '@/lib/theme/scales';

describe('shared scale resolution', () => {
  it('resolves every supported scale combination into valid token records', () => {
    for (const density of ['compact', 'comfortable', 'spacious'] as const)
      for (const radius of ['sharp', 'soft', 'curvy'] as const)
        for (const scale of ['small', 'default', 'large'] as const) {
          const tokens = resolveTokens(registry.tokens, {...defaultTheme, density, radius, typography: {...defaultTheme.typography, scale}}, registry.fonts);
          expect(tokens).toHaveLength(registry.tokens.length);
          expect(tokens.find(t => t.id === 'spacing.target-minimum')?.value).toBe('2.75rem');
          expect(tokens.find(t => t.id === 'radius.control')?.value).toBe(radius === 'sharp' ? '0rem' : radius === 'soft' ? '0.5rem' : '1rem');
          expect(tokens.find(t => t.id === 'typography.body')?.value).toBe(scale === 'small' ? '0.875rem' : scale === 'default' ? '1rem' : '1.125rem');
        }
  });
  it('uses one typography scale for labels, headings, and code-sized body text', () => {
    const tokens = resolveTokens(registry.tokens, {...defaultTheme, typography: {...defaultTheme.typography, scale: 'large'}}, registry.fonts);
    for (const [role, size] of Object.entries(typeSizes)) expect(tokens.find(t => t.id === `typography.${role}`)?.value).toBe(`${size * 1.125}rem`);
  });
  it('keeps raised-element shadows available in clean mode, while surfaces stay flat', () => {
    const tokens = resolveTokens(registry.tokens, defaultTheme, registry.fonts);
    expect(tokens.find(t => t.id === 'shadow.raised')?.value).not.toEqual(tokens.find(t => t.id === 'shadow.surface')?.value);
    const depth = resolveTokens(registry.tokens, {...defaultTheme, effects: {surface: 'subtle-depth'}}, registry.fonts);
    expect(depth.find(t => t.id === 'shadow.surface')?.value).toEqual(depth.find(t => t.id === 'shadow.raised')?.value);
  });
  it('disables shadows in either surface effect and supports zero motion', () => {
    for (const surface of ['clean', 'subtle-depth'] as const) {
      const tokens = resolveTokens(registry.tokens, {...defaultTheme, shadows: 'none', motion: 'none', effects: {surface}}, registry.fonts);
      expect(tokens.find(t => t.id === 'motion.duration')?.value).toBe('0ms');
      for (const id of ['shadow.raised', 'shadow.surface']) expect(tokens.find(t => t.id === id)?.value).toEqual({light: '0px 0px 0px 0px oklch(0 0 0 / 0)', dark: '0px 0px 0px 0px oklch(0 0 0 / 0)'});
    }
  });
});
