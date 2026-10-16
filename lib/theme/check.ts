// Zod-free runtime checks for the theme runtime that ships to every page (theme, settings, stored envelope).
// They accept exactly what ThemeSchema, WorkspaceSettingsSchema, and PersistenceEnvelopeSchema accept
// (tests/theme-check.test.ts compares them), so the first-load bundle does not need the validation library.
import type { Appearance, Mode, Oklch, PersistenceEnvelope, Theme, WorkspaceSettings } from '@/lib/contract/schema';

type Rec = Record<string, unknown>;
const idPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const modeNames: Mode[] = ['light', 'dark'];
const appearances: Appearance[] = ['light', 'dark', 'system'];
const colorRoles = [
  'primary', 'onPrimary', 'secondary', 'onSecondary', 'accent', 'onAccent',
  'background', 'foreground', 'surface', 'muted', 'mutedForeground', 'border', 'focus',
  'destructive', 'onDestructive', 'success', 'onSuccess', 'warning', 'onWarning', 'info', 'onInfo',
];
const scales = ['small', 'default', 'large'] as const;
const radii = ['sharp', 'soft', 'curvy'] as const;
const densities = ['compact', 'comfortable', 'spacious'] as const;
const shadowScales = ['none', 'soft', 'defined'] as const;
const surfaces = ['clean', 'subtle-depth'] as const;
const motions = ['none', 'subtle'] as const;

const fail = (path: string, message: string): never => { throw new Error(`Invalid ${path || 'value'}: ${message}`); };
const isRecord = (value: unknown): value is Rec => typeof value === 'object' && value !== null && !Array.isArray(value);
const at = (path: string, key: string) => path ? `${path}.${key}` : key;

function object(value: unknown, path: string, allowed: readonly string[]): Rec {
  if (!isRecord(value)) return fail(path, 'expected an object');
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(path, `unrecognized key "${key}"`);
  return value;
}
function exactKeys(value: unknown, path: string, keys: readonly string[]): Rec {
  const record = object(value, path, keys);
  for (const key of keys) if (!Object.hasOwn(record, key)) fail(at(path, key), 'required');
  return record;
}
function text(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0) return fail(path, 'expected a non-empty string');
  return value;
}
function id(value: unknown, path: string): string {
  const result = text(value, path);
  if (!idPattern.test(result)) fail(path, 'expected a lowercase identifier');
  return result;
}
function oneOf<T extends string>(value: unknown, path: string, options: readonly T[]): T {
  if (typeof value !== 'string' || !options.includes(value as T)) return fail(path, `expected one of ${options.join(', ')}`);
  return value as T;
}
function number(value: unknown, path: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) return fail(path, `expected a number from ${min} to ${max}`);
  return value;
}
function integer(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return fail(path, 'expected a non-negative integer');
  return value;
}
function oklch(value: unknown, path: string): Oklch {
  const color = object(value, path, ['l', 'c', 'h', 'alpha']);
  return {
    l: number(color.l, at(path, 'l'), 0, 1), c: number(color.c, at(path, 'c'), 0, 0.4),
    h: number(color.h, at(path, 'h'), 0, 360), alpha: number(color.alpha, at(path, 'alpha'), 0, 1),
  };
}
const optionalText = (value: unknown, path: string) => value === undefined ? undefined : text(value, path);

export function parseTheme(input: unknown): Theme {
  const theme = object(input, '', ['id', 'basedOn', 'palette', 'colors', 'typography', 'radius', 'density', 'shadows', 'effects', 'motion', 'componentDefaults']);
  const themeId = id(theme.id, 'id');
  const basedOn = theme.basedOn === undefined ? undefined : id(theme.basedOn, 'basedOn');
  if (!isRecord(theme.palette)) fail('palette', 'expected an object');
  const palette = Object.fromEntries(Object.entries(theme.palette as Rec).map(([key, value]) => [id(key, `palette key ${key}`), oklch(value, at('palette', key))]));
  const colorsInput = exactKeys(theme.colors, 'colors', modeNames);
  const colors = Object.fromEntries(modeNames.map(mode => {
    const roles = exactKeys(colorsInput[mode], at('colors', mode), colorRoles);
    return [mode, Object.fromEntries(colorRoles.map(role => [role, oklch(roles[role], `colors.${mode}.${role}`)]))];
  })) as Theme['colors'];
  const typography = object(theme.typography, 'typography', ['sansFontId', 'monoFontId', 'scale']);
  const effects = object(theme.effects, 'effects', ['surface']);
  if (!isRecord(theme.componentDefaults)) fail('componentDefaults', 'expected an object');
  const componentDefaults = Object.fromEntries(Object.entries(theme.componentDefaults as Rec).map(([key, value]) => {
    const path = at('componentDefaults', key);
    const defaults = object(value, path, ['variant', 'size']);
    const variant = optionalText(defaults.variant, at(path, 'variant'));
    const size = optionalText(defaults.size, at(path, 'size'));
    return [id(key, `componentDefaults key ${key}`), { ...(variant !== undefined ? { variant } : {}), ...(size !== undefined ? { size } : {}) }];
  }));
  const result: Theme = {
    id: themeId, ...(basedOn !== undefined ? { basedOn } : {}), palette, colors,
    typography: { sansFontId: id(typography.sansFontId, 'typography.sansFontId'), monoFontId: id(typography.monoFontId, 'typography.monoFontId'), scale: oneOf(typography.scale, 'typography.scale', scales) },
    radius: oneOf(theme.radius, 'radius', radii), density: oneOf(theme.density, 'density', densities),
    shadows: oneOf(theme.shadows, 'shadows', shadowScales), effects: { surface: oneOf(effects.surface, 'effects.surface', surfaces) },
    motion: oneOf(theme.motion, 'motion', motions), componentDefaults,
  };
  if ((result.id === 'custom') !== Boolean(result.basedOn)) fail('basedOn', 'Only a custom theme has a basedOn preset.');
  return result;
}

export function parseWorkspaceSettings(input: unknown): WorkspaceSettings {
  const settings = object(input, '', ['settingsVersion', 'theme', 'appearance']);
  if (settings.settingsVersion !== 1) fail('settingsVersion', 'expected 1');
  return { settingsVersion: 1, theme: parseTheme(settings.theme), appearance: oneOf(settings.appearance, 'appearance', appearances) };
}

function stringMap(value: unknown, path: string, keys?: readonly string[]): Record<string, string> {
  const record = keys ? exactKeys(value, path, keys) : object(value, path, Object.keys(isRecord(value) ? value : {}));
  return Object.fromEntries(Object.entries(record).map(([key, entry]) => [text(key, `${path} key`), text(entry, at(path, key))]));
}

export function parsePersistenceEnvelope(input: unknown): PersistenceEnvelope {
  const envelope = object(input, '', ['envelopeVersion', 'themeRevision', 'settings', 'bootstrap']);
  if (envelope.envelopeVersion !== 1) fail('envelopeVersion', 'expected 1');
  const result: PersistenceEnvelope = { envelopeVersion: 1, themeRevision: integer(envelope.themeRevision, 'themeRevision'), settings: parseWorkspaceSettings(envelope.settings) };
  if (envelope.bootstrap !== undefined) {
    const cache = object(envelope.bootstrap, 'bootstrap', ['cacheVersion', 'resolverVersion', 'themeRevision', 'modeIndependent', 'modes']);
    if (cache.cacheVersion !== 1) fail('bootstrap.cacheVersion', 'expected 1');
    const modes = exactKeys(cache.modes, 'bootstrap.modes', modeNames);
    result.bootstrap = {
      cacheVersion: 1, resolverVersion: text(cache.resolverVersion, 'bootstrap.resolverVersion'), themeRevision: integer(cache.themeRevision, 'bootstrap.themeRevision'),
      modeIndependent: stringMap(cache.modeIndependent, 'bootstrap.modeIndependent'),
      modes: { light: stringMap(modes.light, 'bootstrap.modes.light'), dark: stringMap(modes.dark, 'bootstrap.modes.dark') },
    };
  }
  return result;
}
