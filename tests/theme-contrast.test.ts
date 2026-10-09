import { describe, expect, it } from 'vitest';
import { defaultTheme } from '@/lib/data/registry';
import type { Oklch } from '@/lib/contract/schema';

function linearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const radians = h * Math.PI / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);
  const lightness = l + 0.3963377774 * a + 0.2158037573 * b;
  const middle = l - 0.1055613458 * a - 0.0638541728 * b;
  const short = l - 0.0894841775 * a - 1.291485548 * b;
  const L = lightness ** 3;
  const M = middle ** 3;
  const S = short ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ].map(channel => Math.max(0, Math.min(1, channel))) as [number, number, number];
}

function luminance(color: Oklch): number {
  const [r, g, b] = linearSrgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Oklch, b: Oklch): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
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
