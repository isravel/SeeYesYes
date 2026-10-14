/* eslint-disable @typescript-eslint/no-explicit-any -- these tests navigate exported JSON documents */
import { describe, expect, it } from 'vitest';
import StyleDictionary from 'style-dictionary';
import type { InterchangeValue, ResolvedToken, Theme } from '@/lib/contract/schema';
import { defaultTheme, registry } from '@/lib/data/registry';
import { resolveTokens } from '@/lib/theme/resolve';
import { buildTokenFile, EXTENSION_KEY, exportDesignTokens, TokenExportError, tokenFilename, validateTokenDocument } from '@/lib/contract/design-tokens';

const resolve = (theme: Theme = defaultTheme) => resolveTokens(registry.tokens, theme, registry.fonts);
const tok = (id: string, interchange: ResolvedToken['interchange'], extra: Partial<ResolvedToken> = {}): ResolvedToken => ({
  id, cssVariable: `--sys-${id.replaceAll('.', '-')}`, category: 'color', kind: 'semantic', purpose: `Purpose of ${id}.`,
  source: { kind: 'theme', path: 'x' }, exampleIds: [], value: 'x', interchange, ...extra,
});
const ink = { l: 0.4, c: 0.12, h: 250, alpha: 1 };
const px = (value: number) => ({ value, unit: 'px' as const });
// Loose JSON for navigating exported documents in assertions.
const parse = (content: string) => JSON.parse(content) as Record<string, any>;
const flat = (node: Record<string, any>, path: string[] = []): [string, any][] =>
  '$value' in node ? [[path.join('.'), node]] : Object.entries(node).flatMap(([key, child]) => key.startsWith('$') ? [] : flat(child, [...path, key]));

describe('Design Tokens export structure', () => {
  const out = exportDesignTokens(resolve(), defaultTheme);

  it('produces one deterministic file per mode with every supported token, nested by ID', () => {
    expect(out.files.map(f => f.name)).toEqual([tokenFilename('light'), tokenFilename('dark')]);
    for (const file of out.files) {
      const tokens = flat(parse(file.content));
      // JSON objects enumerate integer-like keys (spacing.1, spacing.12) numerically first; the order is fixed, so compare as sets.
      expect(tokens.map(([id]) => id).sort()).toEqual(registry.tokens.map(t => t.id).sort());
      for (const [id, token] of tokens) {
        expect(token.$description, id).toBe(registry.tokens.find(t => t.id === id)!.purpose);
        expect(token.$extensions[EXTENSION_KEY]).toMatchObject({ id, cssVariable: registry.tokens.find(t => t.id === id)!.cssVariable });
      }
      expect(parse(file.content).color['on-primary'].$type).toBe('color');
    }
    expect(exportDesignTokens(resolve(), defaultTheme).files.map(f => f.content)).toEqual(out.files.map(f => f.content));
    expect(exportDesignTokens([...resolve()].reverse(), defaultTheme).files.map(f => f.content)).toEqual(out.files.map(f => f.content));
  });

  it('puts mode-independent tokens in both files unchanged and mode-dependent tokens in their own mode', () => {
    const [light, dark] = out.files.map(f => parse(f.content));
    expect(light.radius.control).toEqual(dark.radius.control);
    expect(light.color.primary.$value).not.toEqual(dark.color.primary.$value);
    const resolved = resolve().find(t => t.id === 'color.primary')!;
    const pair = resolved.interchange as Record<'light' | 'dark', { value: { l: number; c: number; h: number } }>;
    expect(light.color.primary.$value.components).toEqual([pair.light.value.l, pair.light.value.c, pair.light.value.h]);
    expect(dark.color.primary.$value.components).toEqual([pair.dark.value.l, pair.dark.value.c, pair.dark.value.h]);
  });

  it('passes the format-shape validator and never emits CSS strings or var() references', () => {
    for (const file of out.files) {
      expect(validateTokenDocument(parse(file.content))).toEqual([]);
      expect(file.content).not.toMatch(/var\(|oklch\(|"none"/);
    }
  });

  it('reports no exclusions for the seeded tokens and says so', () => {
    expect(out.notes.exclusions).toEqual([]);
    expect(out.notes.summary).toBe(`Every one of the ${registry.tokens.length} registry tokens is in both files.`);
    expect(parse(out.notesContent)).toEqual(JSON.parse(JSON.stringify(out.notes)));
    expect(out.notes.format).toBe('Design Tokens Format Module 2025.10');
  });

  it('exports a no-shadow scale as a transparent zero shadow, not the string none', () => {
    const none = exportDesignTokens(resolve({ ...defaultTheme, shadows: 'none' }), defaultTheme);
    for (const file of none.files) {
      const shadow = parse(file.content).shadow.raised.$value;
      expect(shadow).toMatchObject({ offsetY: { value: 0 }, blur: { value: 0 }, color: { alpha: 0 } });
    }
  });

  it('follows the applied theme, mode by mode', () => {
    const edited: Theme = { ...defaultTheme, id: 'custom', basedOn: defaultTheme.id, radius: 'curvy', colors: { ...defaultTheme.colors, light: { ...defaultTheme.colors.light, primary: { l: 0.3, c: 0.2, h: 30, alpha: 1 } } } };
    const next = exportDesignTokens(resolve(edited), edited);
    const [light, dark] = next.files.map(f => parse(f.content));
    const [baseLight, baseDark] = out.files.map(f => parse(f.content));
    expect(light.color.primary.$value.components).toEqual([0.3, 0.2, 30]);
    expect(dark.color.primary.$value).toEqual(baseDark.color.primary.$value);
    expect(light.radius.control.$value).toEqual({ value: 1, unit: 'rem' });
    expect(baseLight.radius.control.$value).not.toEqual(light.radius.control.$value);
    expect(next.notes).toMatchObject({ themeId: 'custom', basedOnThemeId: defaultTheme.id });
  });
});

describe('representative fixtures for every supported type', () => {
  const fixtures: [string, InterchangeValue, unknown][] = [
    ['color', { type: 'color', value: ink }, { colorSpace: 'oklch', components: [0.4, 0.12, 250], alpha: 1 }],
    ['dimension', { type: 'dimension', value: { value: 1.5, unit: 'rem' } }, { value: 1.5, unit: 'rem' }],
    ['duration', { type: 'duration', value: { value: 140, unit: 'ms' } }, { value: 140, unit: 'ms' }],
    ['easing', { type: 'cubicBezier', value: [0.2, 0, 0, 1] }, [0.2, 0, 0, 1]],
    ['shadow', { type: 'shadow', value: { color: ink, offsetX: px(0), offsetY: px(2), blur: px(8), spread: px(0) } }, { color: { colorSpace: 'oklch', components: [0.4, 0.12, 250], alpha: 1 }, offsetX: px(0), offsetY: px(2), blur: px(8), spread: px(0) }],
    ['inset shadow layers', { type: 'shadow', value: [{ color: ink, offsetX: px(0), offsetY: px(1), blur: px(2), spread: px(0), inset: true }, { color: ink, offsetX: px(0), offsetY: px(4), blur: px(8), spread: px(1) }] }, 'array'],
    ['font family list', { type: 'fontFamily', value: ['Inter', 'sans-serif'] }, ['Inter', 'sans-serif']],
    ['font family name', { type: 'fontFamily', value: 'Inter' }, 'Inter'],
    ['font weight', { type: 'fontWeight', value: 600 }, 600],
    ['number', { type: 'number', value: 1.5 }, 1.5],
  ];
  for (const [name, interchange, expected] of fixtures) {
    it(`exports ${name}`, () => {
      const { document } = buildTokenFile([tok(`group.${name.replaceAll(' ', '-')}`, interchange)], 'light');
      const token = flat(document)[0][1];
      expect(token.$type).toBe(interchange.type);
      if (expected === 'array') {
        expect(token.$value).toHaveLength(2);
        expect(token.$value[0].inset).toBe(true);
        expect(token.$value[1]).not.toHaveProperty('inset');
      } else expect(token.$value).toEqual(expected);
      expect(validateTokenDocument(document)).toEqual([]);
    });
  }

  it('parses every fixture type with Style Dictionary', async () => {
    const tokens = fixtures.map(([name, interchange], index) => tok(`fixture.item-${index}-${name.replaceAll(' ', '-')}`, interchange));
    const { document } = buildTokenFile(tokens, 'light');
    const sd = new StyleDictionary({ tokens: document as never, usesDtcg: true, log: { warnings: 'error', verbosity: 'silent' }, platforms: { css: { transformGroup: 'css', files: [{ destination: 'fixtures.css', format: 'css/variables' }] } } });
    const [file] = await sd.formatPlatform('css');
    const css = file.output as string;
    expect(css.match(/--fixture-item-/g)).toHaveLength(fixtures.length);
    expect(css).toContain('--fixture-item-8-font-weight: 600;');
  }, 30_000);
});

describe('unsupported values', () => {
  const unsupported: InterchangeValue = { type: 'unsupported', reason: 'Animated gradients have no interchange type.' };

  it('stay out of the files and appear in the notes with their reason, and the notes never claim every token', () => {
    const tokens = [tok('color.a', { type: 'color', value: ink }), tok('effect.gradient', unsupported)];
    const out = exportDesignTokens(tokens, { id: 'default' });
    for (const file of out.files) expect(flat(parse(file.content)).map(([id]) => id)).toEqual(['color.a']);
    expect(out.notes.exclusions).toEqual([{ id: 'effect.gradient', reason: unsupported.reason, modes: ['light', 'dark'] }]);
    expect(out.notes.summary).toMatch(/1 \(light\) and 1 \(dark\) of 2 registry tokens/);
    expect(out.notes.summary).not.toMatch(/Every one/);
    expect(out.notes.files.map(f => f.tokenCount)).toEqual([1, 1]);
  });

  it('can be unsupported in only one mode', () => {
    const paired = tok('effect.glow', { light: unsupported, dark: { type: 'number', value: 1 } });
    const out = exportDesignTokens([paired], { id: 'default' });
    expect(out.notes.exclusions).toEqual([{ id: 'effect.glow', reason: unsupported.reason, modes: ['light'] }]);
    expect(flat(parse(out.files[0].content))).toHaveLength(0);
    expect(flat(parse(out.files[1].content))).toHaveLength(1);
  });
});

describe('invalid supported values', () => {
  const bad: [string, InterchangeValue | Record<string, unknown>, RegExp][] = [
    ['color lightness above 1', { type: 'color', value: { ...ink, l: 1.4 } }, /lightness/],
    ['negative chroma', { type: 'color', value: { ...ink, c: -0.1 } }, /chroma/],
    ['hue above 360', { type: 'color', value: { ...ink, h: 400 } }, /hue/],
    ['alpha above 1', { type: 'color', value: { ...ink, alpha: 2 } }, /alpha/],
    ['unknown dimension unit', { type: 'dimension', value: { value: 1, unit: 'em' } }, /dimension/],
    ['non-finite dimension', { type: 'dimension', value: { value: Number.NaN, unit: 'px' } }, /dimension/],
    ['negative duration', { type: 'duration', value: { value: -5, unit: 'ms' } }, /duration/],
    ['bezier x out of range', { type: 'cubicBezier', value: [1.5, 0, 0, 1] }, /cubicBezier/],
    ['negative shadow blur', { type: 'shadow', value: { color: ink, offsetX: px(0), offsetY: px(1), blur: px(-1), spread: px(0) } }, /blur/],
    ['empty font family', { type: 'fontFamily', value: [] }, /fontFamily/],
    ['font weight 0', { type: 'fontWeight', value: 0 }, /fontWeight/],
    ['infinite number', { type: 'number', value: Number.POSITIVE_INFINITY }, /number/],
    ['an unknown type', { type: 'gradient', value: 'x' }, /unknown token type/],
  ];
  for (const [name, interchange, message] of bad) {
    it(`fails the whole export for ${name}, naming the token`, () => {
      const tokens = [tok('color.good', { type: 'color', value: ink }), tok('size.bad', interchange as InterchangeValue)];
      expect(() => exportDesignTokens(tokens, { id: 'default' })).toThrow(TokenExportError);
      expect(() => exportDesignTokens(tokens, { id: 'default' })).toThrow(/size\.bad/);
      expect(() => exportDesignTokens(tokens, { id: 'default' })).toThrow(message);
    });
  }

  it('rejects an invalid value in only one mode of a paired token', () => {
    const paired = tok('color.mixed', { light: { type: 'color', value: ink }, dark: { type: 'color', value: { ...ink, l: 3 } } });
    expect(() => exportDesignTokens([paired], { id: 'default' })).toThrow(/color\.mixed \(dark\)/);
  });

  it('rejects IDs that cannot form valid groups', () => {
    expect(() => buildTokenFile([tok('Color.Bad', { type: 'number', value: 1 })], 'light')).toThrow(/lowercase/);
    expect(() => buildTokenFile([tok('size', { type: 'number', value: 1 }), tok('size.large', { type: 'number', value: 2 })], 'light')).toThrow(/collides|already exists/);
  });
});

describe('format validator', () => {
  const good = () => buildTokenFile([tok('color.a', { type: 'color', value: ink })], 'light').document as Record<string, any>;

  it('accepts a good document and flags each kind of defect', () => {
    expect(validateTokenDocument(good())).toEqual([]);
    const noType = good(); delete noType.color.a.$type;
    expect(validateTokenDocument(noType).join()).toMatch(/\$type/);
    const css = good(); css.color.a.$value = 'oklch(0.4 0.1 250)';
    expect(validateTokenDocument(css).join()).toMatch(/color must be/);
    const noDescription = good(); noDescription.color.a.$description = '';
    expect(validateTokenDocument(noDescription).join()).toMatch(/\$description/);
    const noExtension = good(); delete noExtension.color.a.$extensions;
    expect(validateTokenDocument(noExtension).join()).toMatch(/\$extensions/);
    const wrongId = good(); wrongId.color.a.$extensions[EXTENSION_KEY].id = 'other';
    expect(validateTokenDocument(wrongId).join()).toMatch(/\$extensions/);
    const badName = good(); badName['bad.name'] = {};
    expect(validateTokenDocument(badName).join()).toMatch(/names cannot contain/);
    expect(validateTokenDocument({ color: 'red' }).join()).toMatch(/expected an object/);
  });
});

describe('Style Dictionary interoperability', () => {
  it('parses both real files and resolves every token, with structured colors reaching CSS', async () => {
    const out = exportDesignTokens(resolve(), defaultTheme);
    const results: string[] = [];
    for (const file of out.files) {
      const sd = new StyleDictionary({ tokens: parse(file.content) as never, usesDtcg: true, log: { warnings: 'error', verbosity: 'silent' }, platforms: { css: { transformGroup: 'css', files: [{ destination: `${file.mode}.css`, format: 'css/variables' }] } } });
      const platform = await sd.getPlatformTokens('css');
      expect(platform.allTokens).toHaveLength(registry.tokens.length);
      const [css] = await sd.formatPlatform('css');
      expect(css.output as string).toMatch(/--color-primary: #[0-9a-f]{6};/);
      expect(css.output as string).toContain('--radius-control: 0.5rem;');
      results.push(css.output as string);
    }
    expect(results[0]).not.toBe(results[1]);
  }, 30_000);

  it('follows an edited theme through to the parsed CSS', async () => {
    const edited: Theme = { ...defaultTheme, id: 'custom', basedOn: defaultTheme.id, radius: 'curvy' };
    const out = exportDesignTokens(resolve(edited), edited);
    const sd = new StyleDictionary({ tokens: parse(out.files[0].content) as never, usesDtcg: true, log: { warnings: 'error', verbosity: 'silent' }, platforms: { css: { transformGroup: 'css', files: [{ destination: 'a.css', format: 'css/variables' }] } } });
    const [css] = await sd.formatPlatform('css');
    expect(css.output as string).toContain('--radius-control: 1rem;');
  }, 30_000);
});
