import {
  PersistenceEnvelopeSchema, WorkspaceSettingsSchema,
  type DesignSystem, type Mode, type PersistenceEnvelope, type Theme, type WorkspaceSettings,
} from '@/lib/contract/schema';
import { resolveTokens } from './resolve';
import { validateTheme } from '@/lib/contract/validate';

export const SETTINGS_STORAGE_KEY = 'seeyesyes:settings:v1';
export const ENVELOPE_VERSION = 1;
export const CACHE_VERSION = 1;
export const RESOLVER_VERSION = '1.1';

const variableName = /^--sys-[a-z0-9-]+$/;
const number = '-?(?:\\d+\\.?\\d*|\\.\\d+)';
const color = new RegExp(`^oklch\\(${number} ${number} ${number} \\/ ${number}\\)$`);
const length = new RegExp(`^${number}(?:px|rem|ms|s)$`);
const fontList = /^(?:"[^"\r\n]{1,100}"|[A-Za-z][A-Za-z0-9 -]{0,60})(?:,\s*(?:"[^"\r\n]{1,100}"|[A-Za-z][A-Za-z0-9 -]{0,60}))*$/;
const shadow = new RegExp(`^(?:inset )?${number}(?:px|rem) ${number}(?:px|rem) ${number}(?:px|rem) ${number}(?:px|rem) oklch\\(${number} ${number} ${number} \\/ ${number}\\)(?:, (?:inset )?${number}(?:px|rem) ${number}(?:px|rem) ${number}(?:px|rem) ${number}(?:px|rem) oklch\\(${number} ${number} ${number} \\/ ${number}\\))*$`);
const cubicBezier = new RegExp(`^cubic-bezier\\(${number}, ${number}, ${number}, ${number}\\)$`);

export function isAllowedBootstrapValue(value: string): boolean {
  return value.length <= 512 && !/[;{}\r\n]/.test(value) && (
    value === 'transparent' || value === 'none' || color.test(value) || length.test(value) ||
    new RegExp(`^${number}$`).test(value) || fontList.test(value) ||
    /^var\(--(?:font|sys)-[a-z0-9-]+\)$/.test(value) || shadow.test(value) || cubicBezier.test(value)
  );
}

export function createBootstrapCache(theme: Theme, system: DesignSystem, themeRevision: number): NonNullable<PersistenceEnvelope['bootstrap']> {
  const tokens = resolveTokens(system.tokens, theme, system.fonts);
  const modeIndependent: Record<string, string> = {};
  const modes: Record<Mode, Record<string, string>> = { light: {}, dark: {} };
  for (const token of tokens) {
    if (typeof token.value === 'object') {
      modes.light[token.cssVariable] = String(token.value.light);
      modes.dark[token.cssVariable] = String(token.value.dark);
    } else {
      modeIndependent[token.cssVariable] = String(token.value);
    }
  }
  return { cacheVersion: CACHE_VERSION, resolverVersion: RESOLVER_VERSION, themeRevision, modeIndependent, modes };
}

export function createPersistenceEnvelope(settings: WorkspaceSettings, themeRevision: number, system: DesignSystem): PersistenceEnvelope {
  const validatedSettings = WorkspaceSettingsSchema.parse(settings);
  const theme = validateTheme(validatedSettings.theme, system);
  return PersistenceEnvelopeSchema.parse({
    envelopeVersion: ENVELOPE_VERSION, themeRevision, settings: { ...validatedSettings, theme },
    bootstrap: createBootstrapCache(theme, system, themeRevision),
  });
}

function validateCache(envelope: PersistenceEnvelope): PersistenceEnvelope['bootstrap'] {
  const cache = envelope.bootstrap;
  if (!cache || cache.cacheVersion !== CACHE_VERSION || cache.resolverVersion !== RESOLVER_VERSION || cache.themeRevision !== envelope.themeRevision) return undefined;
  const maps = [cache.modeIndependent, cache.modes.light, cache.modes.dark];
  if (maps.some(map => Object.keys(map).length === 0 || Object.entries(map).some(([name, value]) => !variableName.test(name) || !isAllowedBootstrapValue(value)))) return undefined;
  if (JSON.stringify(Object.keys(cache.modes.light).sort()) !== JSON.stringify(Object.keys(cache.modes.dark).sort())) return undefined;
  return cache;
}

export type StoredSettingsResult = { envelope: PersistenceEnvelope; notice?: string };
export function parseStoredSettings(raw: string, system: DesignSystem): StoredSettingsResult {
  const parsed: unknown = JSON.parse(raw);
  const envelope = PersistenceEnvelopeSchema.parse(parsed);
  const settings = WorkspaceSettingsSchema.parse(envelope.settings);
  const theme = validateTheme(settings.theme, system);
  const bootstrap = validateCache(envelope);
  return {
    envelope: { ...envelope, settings: { ...settings, theme }, ...(bootstrap ? { bootstrap } : { bootstrap: undefined }) },
    ...(!bootstrap && envelope.bootstrap ? { notice: 'Saved settings were restored; the early theme cache was out of date and has been rebuilt.' } : {}),
  };
}

export function buildThemeBootstrapScript(): string {
  return `(()=>{try{const k='${SETTINGS_STORAGE_KEY}';const e=JSON.parse(localStorage.getItem(k)||'null');if(!e||e.envelopeVersion!==${ENVELOPE_VERSION}||!Number.isInteger(e.themeRevision)||e.settings?.settingsVersion!==1||!['light','dark','system'].includes(e.settings.appearance))return;const b=e.bootstrap;if(!b||b.cacheVersion!==${CACHE_VERSION}||b.resolverVersion!=='${RESOLVER_VERSION}'||b.themeRevision!==e.themeRevision)return;const n=/^--sys-[a-z0-9-]+$/;const v=/^(?:transparent|none|oklch\\(-?(?:\\d+\\.?\\d*|\\.\\d+) -?(?:\\d+\\.?\\d*|\\.\\d+) -?(?:\\d+\\.?\\d*|\\.\\d+) [/] -?(?:\\d+\\.?\\d*|\\.\\d+)\\)|-?(?:\\d+\\.?\\d*|\\.\\d+)(?:px|rem|ms|s)|-?(?:\\d+\\.?\\d*|\\.\\d+)|cubic-bezier\\(-?[\\d.]+, -?[\\d.]+, -?[\\d.]+, -?[\\d.]+\\)|var\\(--(?:font|sys)-[a-z0-9-]+\\)|(?:"[^"\\r\\n]{1,100}"|[A-Za-z][A-Za-z0-9 -]{0,60})(?:,\\s*(?:"[^"\\r\\n]{1,100}"|[A-Za-z][A-Za-z0-9 -]{0,60}))*|(?:inset )?-?[\\d.]+(?:px|rem) -?[\\d.]+(?:px|rem) -?[\\d.]+(?:px|rem) -?[\\d.]+(?:px|rem) oklch\\([\\d.]+ [\\d.]+ [\\d.]+ [/] [\\d.]+\\)(?:, (?:inset )?-?[\\d.]+(?:px|rem) -?[\\d.]+(?:px|rem) -?[\\d.]+(?:px|rem) -?[\\d.]+(?:px|rem) oklch\\([\\d.]+ [\\d.]+ [\\d.]+ [/] [\\d.]+\\))*)$/;const maps=[b.modeIndependent,b.modes?.light,b.modes?.dark];if(maps.some(m=>!m||!Object.keys(m).length||Object.entries(m).some(([key,value])=>!n.test(key)||typeof value!=='string'||value.length>512||/[;{}\\r\\n]/.test(value)||!v.test(value))))return;if(JSON.stringify(Object.keys(b.modes.light).sort())!==JSON.stringify(Object.keys(b.modes.dark).sort()))return;const mode=e.settings.appearance==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):e.settings.appearance;const root=document.documentElement;for(const [key,value] of Object.entries({...b.modeIndependent,...b.modes[mode]}))root.style.setProperty(key,value);root.setAttribute('data-appearance',mode);root.style.colorScheme=mode}catch{}})();`;
}
