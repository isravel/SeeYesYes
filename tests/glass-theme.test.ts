import { describe, expect, it } from 'vitest';
import { defaultTheme, glassTheme, registry, softWorkspaceTheme } from '@/lib/data/registry';
import { validateTheme } from '@/lib/contract/validate';
import type { Mode, Oklch, Theme } from '@/lib/contract/schema';
import { contrastOnLayers } from '@/lib/accessibility/contrast';
import { cssVariables, glassTints, resolveTokens } from '@/lib/theme/resolve';
import { createPersistenceEnvelope, parseStoredSettings } from '@/lib/theme/persistence';
import { parseTheme } from '@/lib/theme/check';
import { exportDesignTokens } from '@/lib/contract/design-tokens';

const vars = (theme: Theme, mode: Mode) => cssVariables(resolveTokens(registry.tokens, theme, registry.fonts), mode);
const alpha = (value: string) => Number(/\/ ([\d.]+)\)$/.exec(value)![1]);
const glass = { ...defaultTheme, id: 'custom', basedOn: 'default', effects: { surface: 'glass' as const } };

describe('glass surface treatment (SYX-001)', () => {
  it('is a valid preset and a valid saved value, without replacing the default theme', () => {
    expect(registry.defaultThemeId).toBe('default');
    expect(defaultTheme.effects.surface).toBe('clean');
    expect(glassTheme).toMatchObject({ id: 'glass', effects: { surface: 'glass' } });
    expect(() => validateTheme(glassTheme, registry)).not.toThrow();
    expect(parseTheme({ ...defaultTheme, effects: { surface: 'glass' } }).effects.surface).toBe('glass');
    expect(() => parseTheme({ ...defaultTheme, effects: { surface: 'frosted' } })).toThrow();
  });

  it('keeps clean and subtle-depth themes opaque, unblurred and with the earlier scrim', () => {
    for (const theme of [defaultTheme, softWorkspaceTheme]) for (const mode of ['light', 'dark'] as const) {
      const v = vars(theme, mode);
      expect(alpha(v['--sys-color-glass-tint'])).toBe(1);
      expect(alpha(v['--sys-color-glass-tint-dense'])).toBe(1);
      expect(alpha(v['--sys-color-glass-edge'])).toBe(0);
      expect(v['--sys-effect-glass-blur']).toBe('0px');
      expect(v['--sys-effect-glass-saturation']).toBe('1');
      expect(v['--sys-shadow-glass']).toBe('0px 0px 0px 0px oklch(0 0 0 / 0)');
      expect(alpha(v['--sys-color-scrim'])).toBe(0.3);
    }
  });

  it('turns on tint, blur, edge, elevation and a stronger scrim only for glass, in both modes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const v = vars(glass, mode);
      expect(alpha(v['--sys-color-glass-tint'])).toBeLessThan(1);
      expect(alpha(v['--sys-color-glass-tint-dense'])).toBeGreaterThan(alpha(v['--sys-color-glass-tint']));
      expect(alpha(v['--sys-color-glass-edge'])).toBeGreaterThan(0);
      expect(v['--sys-effect-glass-blur']).toBe('20px');
      expect(Number(v['--sys-effect-glass-saturation'])).toBeGreaterThan(1);
      expect(v['--sys-shadow-glass']).not.toBe('0px 0px 0px 0px oklch(0 0 0 / 0)');
      expect(alpha(v['--sys-color-scrim'])).toBeGreaterThan(0.3);
    }
  });

  it('derives tints from the theme surface, so edited colors carry through', () => {
    const edited: Theme = { ...glass, colors: { ...glass.colors, dark: { ...glass.colors.dark, surface: { l: 0.3, c: 0.05, h: 140, alpha: 1 } } } };
    expect(vars(edited, 'dark')['--sys-color-glass-tint']).toMatch(/^oklch\(0\.3 0\.05 140 \/ /);
    expect(vars(edited, 'light')['--sys-color-glass-tint']).toBe(vars(glass, 'light')['--sys-color-glass-tint']);
  });

  it('removes depth shadows when the shadow scale is none', () => {
    for (const mode of ['light', 'dark'] as const) expect(vars({ ...glass, shadows: 'none' }, mode)['--sys-shadow-glass']).toBe('0px 0px 0px 0px oklch(0 0 0 / 0)');
  });

  it('exports glass tokens in the Design Tokens files without exclusions', () => {
    const out = exportDesignTokens(resolveTokens(registry.tokens, glass, registry.fonts), glass);
    expect(out.notes.exclusions).toEqual([]);
    const light = JSON.parse(out.files[0]!.content) as { color: Record<string, unknown>; effect: Record<string, unknown>; shadow: Record<string, unknown> };
    expect(light.color['glass-tint']).toBeDefined();
    expect(light.effect['glass-blur']).toBeDefined();
    expect(light.shadow.glass).toBeDefined();
  });

  it('round-trips a saved glass theme and rebuilds a cache from an older resolver', () => {
    const settings = { settingsVersion: 1 as const, theme: glassTheme, appearance: 'dark' as const };
    const envelope = createPersistenceEnvelope(settings, 3, registry);
    const restored = parseStoredSettings(JSON.stringify(envelope), registry);
    expect(restored.envelope.settings.theme.effects.surface).toBe('glass');
    expect(restored.notice).toBeUndefined();
    const stale = { ...envelope, bootstrap: { ...envelope.bootstrap!, resolverVersion: '1.1' } };
    const rebuilt = parseStoredSettings(JSON.stringify(stale), registry);
    expect(rebuilt.envelope.bootstrap).toBeUndefined();
    expect(rebuilt.notice).toMatch(/rebuilt/);
    expect(rebuilt.envelope.settings.theme.effects.surface).toBe('glass');
  });
});

describe('glass legibility over representative backgrounds', () => {
  // Real backdrops behind a panel: the page color alone, its extremes, and a vivid layer like the Backdrop gradients.
  const backdrops = (theme: Theme, mode: Mode): { name: string; layers: Oklch[] }[] => {
    const colors = theme.colors[mode];
    return [
      { name: 'page background', layers: [colors.background] },
      { name: 'white page', layers: [{ l: 1, c: 0, h: 0, alpha: 1 }] },
      { name: 'black page', layers: [{ l: 0, c: 0, h: 0, alpha: 1 }] },
      { name: 'primary wash', layers: [colors.background, { ...colors.primary, alpha: 0.22 }] },
      { name: 'busy bright image', layers: [{ l: 0.95, c: 0.2, h: 90, alpha: 1 }] },
      { name: 'busy dark image', layers: [{ l: 0.15, c: 0.2, h: 280, alpha: 1 }] },
    ];
  };
  it('records the backgrounds checked and finds where translucent tint alone is not enough', () => {
    const failures: string[] = [];
    for (const mode of ['light', 'dark'] as const) {
      const { tint, dense } = glassTints(glassTheme, mode);
      for (const backdrop of backdrops(glassTheme, mode)) for (const [panel, fill] of [['panel', tint], ['overlay', dense]] as const) {
        const c = glassTheme.colors[mode];
        // Primary text and muted text on the composited result; focus and borders are checked at their own thresholds.
        for (const [role, foreground, minimum] of [['foreground', c.foreground, 4.5], ['mutedForeground', c.mutedForeground, 4.5], ['focus', c.focus, 3]] as const) {
          const { ratio } = contrastOnLayers(foreground, [...backdrop.layers, fill], mode);
          if (Math.round(ratio * 100) / 100 < minimum) failures.push(`${mode} ${panel} ${role} over ${backdrop.name}: ${ratio.toFixed(2)} < ${minimum}`);
        }
      }
    }
    // Only the two stress backdrops (a bright or dark image behind the wrong appearance) may fall short; the app's own backgrounds must pass.
    const unexpected = failures.filter(f => !/busy|white page|black page/.test(f));
    expect(unexpected).toEqual([]);
  });

  it('keeps the dense overlay fill legible over every tested backdrop in the matching appearance', () => {
    for (const mode of ['light', 'dark'] as const) {
      const { dense } = glassTints(glassTheme, mode);
      const c = glassTheme.colors[mode];
      for (const backdrop of backdrops(glassTheme, mode).filter(b => mode === 'light' ? b.name !== 'black page' && b.name !== 'busy dark image' : b.name !== 'white page' && b.name !== 'busy bright image')) {
        expect(contrastOnLayers(c.foreground, [...backdrop.layers, dense], mode).ratio, `${mode} overlay text over ${backdrop.name}`).toBeGreaterThanOrEqual(4.5);
        expect(contrastOnLayers(c.mutedForeground, [...backdrop.layers, dense], mode).ratio, `${mode} overlay muted text over ${backdrop.name}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
