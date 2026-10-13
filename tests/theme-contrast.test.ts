import { describe, expect, it } from 'vitest';
import { defaultTheme } from '@/lib/data/registry';
import type { Mode, Oklch } from '@/lib/contract/schema';
import { checkThemeContrast, contrastPairs, contrastRatio, failingContrast, toDisplayGamut } from '@/lib/accessibility/contrast';

function contrast(a: Oklch, b: Oklch, mode: Mode = 'light'): number {
  return contrastRatio(a, b, mode).ratio;
}

describe('default theme contrast', () => {
  for (const mode of ['light', 'dark'] as const) {
    const colors = defaultTheme.colors[mode];
    it(`${mode} text, control cues, and paired role labels meet their minimums`, () => {
      for (const background of [colors.background, colors.surface]) {
        expect(contrast(colors.foreground, background)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors.mutedForeground, background)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors.focus, background)).toBeGreaterThanOrEqual(3);
      }
      expect(contrast(colors.mutedForeground, colors.muted)).toBeGreaterThanOrEqual(4.5);
      for (const role of ['primary', 'secondary', 'accent', 'destructive', 'success', 'warning', 'info'] as const) {
        const onRole = `on${role[0].toUpperCase()}${role.slice(1)}` as keyof typeof colors;
        expect(contrast(colors[onRole] as Oklch, colors[role])).toBeGreaterThanOrEqual(4.5);
      }
      for (const background of [colors.background, colors.surface]) {
        expect(contrast(colors.border, background)).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

describe('local contrast calculation', () => {
  const black: Oklch = { l: 0, c: 0, h: 0, alpha: 1 };
  const white: Oklch = { l: 1, c: 0, h: 0, alpha: 1 };

  it('matches known ratios and is symmetric', () => {
    expect(contrastRatio(black, white).ratio).toBeCloseTo(21, 1);
    expect(contrastRatio(white, white).ratio).toBeCloseTo(1, 5);
    expect(contrastRatio(white, black).ratio).toBeCloseTo(contrastRatio(black, white).ratio, 5);
  });

  it('maps out-of-gamut colors by reducing chroma and reports it', () => {
    const vivid: Oklch = { l: 0.7, c: 0.4, h: 145, alpha: 1 };
    const result = toDisplayGamut(vivid);
    expect(result.mapped).toBe(true);
    expect(result.rgb.every(v => v >= 0 && v <= 1)).toBe(true);
    expect(toDisplayGamut({ l: 0.5, c: 0.02, h: 200, alpha: 1 }).mapped).toBe(false);
  });

  it('composites translucent colors over the backdrop for the mode', () => {
    const half: Oklch = { ...black, alpha: 0.5 };
    expect(contrastRatio(half, white, 'light').ratio).toBeLessThan(contrastRatio(black, white, 'light').ratio);
    expect(contrastRatio(half, { ...white, alpha: 0 }, 'dark').ratio).toBeCloseTo(1, 5);
  });

  it('passes every required pair for the default theme in both modes', () => {
    expect(failingContrast(defaultTheme)).toEqual([]);
    expect(checkThemeContrast(defaultTheme)).toHaveLength(2 * contrastPairs.length);
  });

  it('flags a failing pair in only the edited mode', () => {
    const weak = { ...defaultTheme, colors: { ...defaultTheme.colors, dark: { ...defaultTheme.colors.dark, foreground: { ...defaultTheme.colors.dark.background } } } };
    const failures = failingContrast(weak);
    expect(failures.length).toBeGreaterThan(0);
    expect(failures.every(f => f.mode === 'dark')).toBe(true);
    expect(failures[0]).toMatchObject({ foreground: 'foreground', passes: false });
  });
});
