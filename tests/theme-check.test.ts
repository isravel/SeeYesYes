/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { PersistenceEnvelopeSchema, ThemeSchema, WorkspaceSettingsSchema } from '@/lib/contract/schema';
import { defaultTheme, registry } from '@/lib/data/registry';
import { createPersistenceEnvelope } from '@/lib/theme/persistence';
import { parsePersistenceEnvelope, parseTheme, parseWorkspaceSettings } from '@/lib/theme/check';

const theme = (): Record<string, any> => structuredClone(defaultTheme);
const settings = (t: unknown = theme()) => ({ settingsVersion: 1, theme: t, appearance: 'dark' });
const envelope = (): Record<string, any> => structuredClone(createPersistenceEnvelope({ settingsVersion: 1, theme: defaultTheme, appearance: 'light' }, 2, registry));
const edited = (change: (t: Record<string, any>) => void) => { const t = theme(); change(t); return t; };

const themeCases: [string, unknown][] = [
  ['valid default', theme()],
  ['null', null], ['array', []], ['string', 'x'],
  ['extra key', { ...theme(), extra: 1 }],
  ['missing id', edited(t => { delete t.id; })],
  ['empty id', { ...theme(), id: '' }],
  ['uppercase id', { ...theme(), id: 'Default' }],
  ['custom without basedOn', { ...theme(), id: 'custom' }],
  ['basedOn on preset', { ...theme(), basedOn: 'default' }],
  ['custom with basedOn', { ...theme(), id: 'custom', basedOn: 'default' }],
  ['bad radius', { ...theme(), radius: 'round' }],
  ['bad density', { ...theme(), density: 'tight' }],
  ['bad shadows', { ...theme(), shadows: 'heavy' }],
  ['bad motion', { ...theme(), motion: 'wild' }],
  ['bad surface', { ...theme(), effects: { surface: 'glass' } }],
  ['extra effects key', { ...theme(), effects: { surface: 'clean', glow: 1 } }],
  ['bad scale', { ...theme(), typography: { ...theme().typography, scale: 'huge' } }],
  ['extra typography key', { ...theme(), typography: { ...theme().typography, extra: 'x' } }],
  ['missing mono font', edited(t => { delete t.typography.monoFontId; })],
  ['lightness too high', edited(t => { t.colors.light.primary.l = 1.1; })],
  ['chroma too high', edited(t => { t.colors.dark.primary.c = 0.5; })],
  ['hue too high', edited(t => { t.colors.dark.primary.h = 361; })],
  ['alpha negative', edited(t => { t.colors.dark.primary.alpha = -0.1; })],
  ['NaN lightness', edited(t => { t.colors.dark.primary.l = Number.NaN; })],
  ['string lightness', edited(t => { t.colors.dark.primary.l = '0.5'; })],
  ['extra color key', edited(t => { t.colors.dark.primary.extra = 1; })],
  ['missing role', edited(t => { delete t.colors.light.primary; })],
  ['unknown role', edited(t => { t.colors.light.mystery = t.colors.light.primary; })],
  ['missing mode', edited(t => { delete t.colors.dark; })],
  ['unknown mode', edited(t => { t.colors.sepia = t.colors.light; })],
  ['bad palette key', edited(t => { t.palette['Bad Key'] = t.colors.light.primary; })],
  ['bad palette value', edited(t => { t.palette['brand-x'] = { l: 2, c: 0, h: 0, alpha: 1 }; })],
  ['component default ok', { ...theme(), componentDefaults: { button: { variant: 'secondary', size: 'small' } } }],
  ['component default empty text', { ...theme(), componentDefaults: { button: { variant: '' } } }],
  ['component default extra', { ...theme(), componentDefaults: { button: { color: 'red' } } }],
  ['component default bad id', { ...theme(), componentDefaults: { Button: { variant: 'secondary' } } }],
  ['component default non-string', { ...theme(), componentDefaults: { button: { size: 3 } } }],
  ['component defaults array', { ...theme(), componentDefaults: [] }],
];

describe('zod-free theme checks agree with the zod schemas', () => {
  it.each(themeCases)('theme: %s', (_name, input) => {
    const expected = ThemeSchema.safeParse(input);
    if (expected.success) expect(parseTheme(input)).toEqual(expected.data);
    else expect(() => parseTheme(input)).toThrow();
  });

  const settingsCases: [string, unknown][] = [
    ['valid', settings()], ['wrong version', { ...settings(), settingsVersion: 2 }], ['bad appearance', { ...settings(), appearance: 'sepia' }],
    ['extra key', { ...settings(), extra: true }], ['missing theme', { settingsVersion: 1, appearance: 'dark' }], ['bad theme', settings({ ...theme(), radius: 'x' })], ['null', null],
  ];
  it.each(settingsCases)('settings: %s', (_name, input) => {
    const expected = WorkspaceSettingsSchema.safeParse(input);
    if (expected.success) expect(parseWorkspaceSettings(input)).toEqual(expected.data);
    else expect(() => parseWorkspaceSettings(input)).toThrow();
  });

  const withCache = (change: (cache: Record<string, any>) => void) => { const e = envelope(); change(e.bootstrap); return e; };
  const envelopeCases: [string, unknown][] = [
    ['valid with cache', envelope()],
    ['valid without cache', (() => { const e = envelope(); delete e.bootstrap; return e; })()],
    ['wrong envelope version', { ...envelope(), envelopeVersion: 2 }],
    ['negative revision', { ...envelope(), themeRevision: -1 }],
    ['fractional revision', { ...envelope(), themeRevision: 1.5 }],
    ['extra key', { ...envelope(), extra: 1 }],
    ['bad settings', { ...envelope(), settings: settings({ ...theme(), radius: 'x' }) }],
    ['cache wrong version', withCache(c => { c.cacheVersion = 2; })],
    ['cache empty resolver', withCache(c => { c.resolverVersion = ''; })],
    ['cache negative revision', withCache(c => { c.themeRevision = -1; })],
    ['cache non-string value', withCache(c => { c.modeIndependent['--sys-x'] = 1; })],
    ['cache empty value', withCache(c => { c.modeIndependent['--sys-x'] = ''; })],
    ['cache missing mode', withCache(c => { delete c.modes.dark; })],
    ['cache unknown mode', withCache(c => { c.modes.sepia = {}; })],
    ['cache extra key', withCache(c => { c.extra = 1; })],
  ];
  it.each(envelopeCases)('envelope: %s', (_name, input) => {
    const expected = PersistenceEnvelopeSchema.safeParse(input);
    if (expected.success) expect(parsePersistenceEnvelope(input)).toEqual(expected.data);
    else expect(() => parsePersistenceEnvelope(input)).toThrow();
  });
});
