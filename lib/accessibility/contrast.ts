import type { Mode, Oklch, Theme } from '@/lib/contract/schema';

type Rgb = [number, number, number];
type Colors = Theme['colors'][Mode];

/** Convert OKLCH to linear sRGB without clamping. */
function toLinearSrgb({ l, c, h }: Pick<Oklch, 'l' | 'c' | 'h'>): Rgb {
  const radians = h * Math.PI / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ];
}

const epsilon = 1e-6;
const inGamut = (rgb: Rgb) => rgb.every(channel => channel >= -epsilon && channel <= 1 + epsilon);

/**
 * Map a color into the sRGB display gamut by reducing chroma at constant lightness and hue,
 * which keeps the lightness that contrast depends on. `mapped` reports whether it was out of gamut.
 */
export function toDisplayGamut(color: Oklch): { rgb: Rgb; mapped: boolean } {
  const lightness = Math.max(0, Math.min(1, color.l));
  const direct = toLinearSrgb({ l: lightness, c: color.c, h: color.h });
  if (inGamut(direct)) return { rgb: direct.map(v => Math.max(0, Math.min(1, v))) as Rgb, mapped: false };
  let low = 0;
  let high = color.c;
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (inGamut(toLinearSrgb({ l: lightness, c: middle, h: color.h }))) low = middle; else high = middle;
  }
  const rgb = toLinearSrgb({ l: lightness, c: low, h: color.h }).map(v => Math.max(0, Math.min(1, v))) as Rgb;
  return { rgb, mapped: true };
}

/** Composite a color over an opaque backdrop. Translucent backgrounds sit on white (light) or black (dark). */
function composite(color: Oklch, backdrop: Rgb): { rgb: Rgb; mapped: boolean } {
  const { rgb, mapped } = toDisplayGamut(color);
  const alpha = Math.max(0, Math.min(1, color.alpha));
  return { rgb: rgb.map((v, i) => v * alpha + backdrop[i] * (1 - alpha)) as Rgb, mapped };
}

const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export function contrastRatio(foreground: Oklch, background: Oklch, mode: Mode = 'light'): { ratio: number; mapped: boolean } {
  const page: Rgb = mode === 'light' ? [1, 1, 1] : [0, 0, 0];
  const back = composite(background, page);
  const front = composite(foreground, back.rgb);
  const a = luminance(front.rgb);
  const b = luminance(back.rgb);
  return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), mapped: front.mapped || back.mapped };
}

export type ContrastPair = { foreground: keyof Colors; background: keyof Colors; minimum: 3 | 4.5; label: string };

const roles = ['primary', 'secondary', 'accent', 'destructive', 'success', 'warning', 'info'] as const;
const onRole = (role: (typeof roles)[number]) => `on${role[0].toUpperCase()}${role.slice(1)}` as keyof Colors;

/** The required pairs from the theme spec. Border is checked only where it is a control's sole boundary. */
export const contrastPairs: ContrastPair[] = [
  ...(['background', 'surface'] as const).map(background => ({ foreground: 'foreground' as const, background, minimum: 4.5 as const, label: `Text on ${background}` })),
  ...(['background', 'surface', 'muted'] as const).map(background => ({ foreground: 'mutedForeground' as const, background, minimum: 4.5 as const, label: `Muted text on ${background}` })),
  ...roles.map(role => ({ foreground: onRole(role), background: role, minimum: 4.5 as const, label: `Text on ${role}` })),
  ...(['background', 'surface'] as const).map(background => ({ foreground: 'focus' as const, background, minimum: 3 as const, label: `Focus indicator on ${background}` })),
  ...(['background', 'surface'] as const).map(background => ({ foreground: 'border' as const, background, minimum: 3 as const, label: `Control border on ${background}` })),
];

export type ContrastResult = ContrastPair & { mode: Mode; ratio: number; passes: boolean; mapped: boolean };

export function checkThemeContrast(theme: Theme): ContrastResult[] {
  return (['light', 'dark'] as const).flatMap(mode => contrastPairs.map(pair => {
    const { ratio, mapped } = contrastRatio(theme.colors[mode][pair.foreground], theme.colors[mode][pair.background], mode);
    return { ...pair, mode, ratio, passes: Math.round(ratio * 100) / 100 >= pair.minimum, mapped };
  }));
}

export const failingContrast = (theme: Theme) => checkThemeContrast(theme).filter(result => !result.passes);
