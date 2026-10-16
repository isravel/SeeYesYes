import type {
  Theme, FontOption, TokenDefinition, ResolvedToken,
  LiteralTokenValue, InterchangeValue, Oklch, Mode,
} from '@/lib/contract/schema';
import { parseTheme } from './check';

import { spacingScale, radiusScale, typeScale, typeSizes } from './scales';

export const RESOLVER_VERSION = '1.1';
export const modes: Mode[] = ['light', 'dark'];
export const toCssVariable = (id: string): `--sys-${string}` => `--sys-${id.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replaceAll('.', '-').toLowerCase()}`;
export const colorCss = (color: Oklch) => `oklch(${color.l} ${color.c} ${color.h} / ${color.alpha})`;

/** Constants are validated by their schema where they enter, so formatting does not re-parse them. */
export function formatConstant(constant: LiteralTokenValue): { value: string | number; interchange: InterchangeValue } {
  switch (constant.type) {
    case 'color': return { value: colorCss(constant.value), interchange: constant };
    case 'dimension': case 'duration': return { value: `${constant.value.value}${constant.value.unit}`, interchange: constant };
    case 'number': case 'fontWeight': return { value: constant.value, interchange: constant };
    case 'fontFamily': return { value: (Array.isArray(constant.value) ? constant.value : [constant.value]).map(v => `"${v.replaceAll('"', '\\"')}"`).join(', '), interchange: constant };
    case 'cubicBezier': return { value: `cubic-bezier(${constant.value.join(', ')})`, interchange: constant };
    case 'shadow': {
      const shadows = Array.isArray(constant.value) ? constant.value : [constant.value];
      return { value: shadows.map(s => `${s.inset ? 'inset ' : ''}${s.offsetX.value}${s.offsetX.unit} ${s.offsetY.value}${s.offsetY.unit} ${s.blur.value}${s.blur.unit} ${s.spread.value}${s.spread.unit} ${colorCss(s.color)}`).join(', '), interchange: constant };
    }
    case 'unsupported': return { value: constant.cssValue, interchange: { type: 'unsupported', reason: constant.reason } };
  }
}

function readPath(theme: Theme, path: string): unknown {
  let value: unknown = theme;
  for (const segment of path.split('.')) {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, segment)) throw new Error(`Unknown theme token path: ${path}`);
    value = (value as Record<string, unknown>)[segment];
  }
  return value;
}
function themeConstant(theme: Theme, path: string, token: TokenDefinition, fonts: FontOption[]): LiteralTokenValue {
  const value = readPath(theme, path);
  if (path.startsWith('colors.') || path.startsWith('palette.')) return { type: 'color', value: value as Oklch };
  if (path === 'typography.sansFontId' || path === 'typography.monoFontId') {
    const kind = path.includes('sans') ? 'sans' : 'mono';
    const font = fonts.find(f => f.id === value && f.kind === kind);
    if (!font) throw new Error(`Unknown ${kind} font: ${String(value)}`);
    return { type: 'fontFamily', value: [font.family, kind === 'sans' ? 'sans-serif' : 'monospace'] };
  }
  if (path === 'typography.scale') {
    const role = token.id.split('.')[1] as keyof typeof typeSizes;
    if (!(role in typeSizes)) throw new Error(`No typography scale for ${token.id}`);
    return { type: 'dimension', value: { value: typeSizes[role] * typeScale[theme.typography.scale], unit: 'rem' } };
  }
  if (path === 'radius') return { type: 'dimension', value: { value: radiusScale[theme.radius] * (token.id === 'radius.panel' ? 1.5 : 1), unit: 'rem' } };
  if (path === 'density') {
    const role = token.id.split('.')[1] as keyof typeof spacingScale.comfortable;
    if (!(role in spacingScale[theme.density])) throw new Error(`No density scale for ${token.id}`);
    return { type: 'dimension', value: { value: spacingScale[theme.density][role], unit: 'rem' } };
  }
  if (path === 'motion') return { type: 'duration', value: { value: theme.motion === 'none' ? 0 : 140, unit: 'ms' } };
  if (path === 'effects.surface') return { type: 'number', value: theme.effects.surface === 'clean' ? 0 : 1 };
  if (path === 'shadows') throw new Error('Shadow resolution requires a mode.');
  throw new Error(`Unsupported theme token path: ${path}`);
}
function shadowConstant(theme: Theme, mode: Mode, token: TokenDefinition): LiteralTokenValue {
  const depth = theme.shadows === 'none' || (token.id === 'shadow.surface' && theme.effects.surface === 'clean') ? 0 : theme.shadows === 'soft' ? 1 : 2;
  const dimension = (value: number) => ({ value, unit: 'px' as const });
  return { type: 'shadow', value: {
    color: { l: 0, c: 0, h: 0, alpha: depth ? mode === 'dark' ? 0.35 : 0.1 : 0 },
    offsetX: dimension(0), offsetY: dimension(2 * depth), blur: dimension(8 * depth), spread: dimension(0),
  } };
}
export function resolveTokens(definitions: TokenDefinition[], input: Theme, fonts: FontOption[]): ResolvedToken[] {
  const theme = parseTheme(input);
  return [...definitions].sort((a, b) => a.id.localeCompare(b.id)).map(token => {
    const source = token.source;
    const paired = source.kind === 'literal' ? !('type' in source.constant) : source.path.includes('*') || source.path === 'shadows';
    if (paired) {
      const resolved = Object.fromEntries(modes.map(mode => {
        const constant = source.kind === 'literal' ? (source.constant as Record<Mode, LiteralTokenValue>)[mode]
          : source.path === 'shadows' ? shadowConstant(theme, mode, token)
          : themeConstant(theme, source.path.replace('*', mode), token, fonts);
        return [mode, formatConstant(constant)];
      })) as Record<Mode, ReturnType<typeof formatConstant>>;
      return { ...token, value: { light: resolved.light.value, dark: resolved.dark.value }, interchange: { light: resolved.light.interchange, dark: resolved.dark.interchange } } as ResolvedToken;
    }
    const constant = source.kind === 'literal' ? source.constant as LiteralTokenValue : themeConstant(theme, source.path, token, fonts);
    const formatted = formatConstant(constant);
    if (source.kind === 'theme' && ['typography.sansFontId', 'typography.monoFontId'].includes(source.path)) {
      const fontId = String(readPath(theme, source.path));
      if (fonts.find(f => f.id === fontId)?.source === 'self-hosted') formatted.value = `var(--font-${fontId})`;
    }
    return { ...token, ...formatted } as ResolvedToken;
  });
}
export function cssVariables(tokens: ResolvedToken[], mode: Mode): Record<string, string> {
  return Object.fromEntries(tokens.map(t => [t.cssVariable, String(typeof t.value === 'object' ? t.value[mode] : t.value)]));
}
