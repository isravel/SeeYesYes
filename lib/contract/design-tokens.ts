import type { InterchangeValue, Mode, Oklch, ResolvedToken } from './schema';

/** Pinned format: https://www.designtokens.org/tr/2025.10/ */
export const DESIGN_TOKENS_FORMAT = 'Design Tokens Format Module 2025.10';
export const EXTENSION_KEY = 'com.seeyesyes';
export const NOTES_FILENAME = 'seeyesyes.export-notes.json';
export const tokenFilename = (mode: Mode) => `seeyesyes.${mode}.tokens.json`;

type Supported = Exclude<InterchangeValue, { type: 'unsupported' }>;
export type DesignTokenType = Supported['type'];
const types: readonly DesignTokenType[] = ['color', 'dimension', 'duration', 'cubicBezier', 'shadow', 'fontFamily', 'fontWeight', 'number'];

/** A supported token had an invalid value, or the token set cannot form a valid document. The whole export fails. */
export class TokenExportError extends Error {
  constructor(message: string) { super(message); this.name = 'TokenExportError'; }
}

type Json = Record<string, unknown>;
const isRecord = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const between = (value: unknown, min: number, max: number): value is number => finite(value) && value >= min && value <= max;

/** Shape problems for a `$value` of the given type, or an empty list. Shared by the exporter and the document validator. */
export function valueIssues(type: string, value: unknown): string[] {
  const dimension = (v: unknown, label: string, units: string[], minimum = -Infinity): string[] =>
    isRecord(v) && finite(v.value) && v.value >= minimum && typeof v.unit === 'string' && units.includes(v.unit) && Object.keys(v).length === 2 ? [] : [`${label} must be { value, unit } with a finite value and unit ${units.join(' or ')}`];
  switch (type) {
    case 'color': {
      if (!isRecord(value) || value.colorSpace !== 'oklch' || !Array.isArray(value.components) || value.components.length !== 3) return ['color must be { colorSpace: "oklch", components: [l, c, h], alpha }'];
      const [l, c, h] = value.components as unknown[];
      const issues: string[] = [];
      if (!between(l, 0, 1)) issues.push('color lightness must be between 0 and 1');
      if (!finite(c) || c < 0) issues.push('color chroma must be a finite number of at least 0');
      if (!between(h, 0, 360)) issues.push('color hue must be between 0 and 360');
      if (value.alpha !== undefined && !between(value.alpha, 0, 1)) issues.push('color alpha must be between 0 and 1');
      return issues;
    }
    case 'dimension': return dimension(value, 'dimension', ['px', 'rem']);
    case 'duration': return dimension(value, 'duration', ['ms', 's'], 0);
    case 'cubicBezier': return Array.isArray(value) && value.length === 4 && value.every(finite) && between(value[0], 0, 1) && between(value[2], 0, 1) ? [] : ['cubicBezier must be four numbers with the first and third between 0 and 1'];
    case 'shadow': {
      const layers = Array.isArray(value) ? value : [value];
      if (layers.length === 0) return ['shadow must have at least one layer'];
      return layers.flatMap((layer, index) => {
        if (!isRecord(layer)) return [`shadow layer ${index + 1} must be an object`];
        return [
          ...valueIssues('color', layer.color).map(issue => `shadow ${issue}`),
          ...dimension(layer.offsetX, 'shadow offsetX', ['px', 'rem']), ...dimension(layer.offsetY, 'shadow offsetY', ['px', 'rem']),
          ...dimension(layer.blur, 'shadow blur', ['px', 'rem'], 0), ...dimension(layer.spread, 'shadow spread', ['px', 'rem']),
          ...(layer.inset === undefined || typeof layer.inset === 'boolean' ? [] : ['shadow inset must be a boolean']),
        ];
      });
    }
    case 'fontFamily': {
      const names = Array.isArray(value) ? value : [value];
      return names.length > 0 && names.every(name => typeof name === 'string' && name.trim() !== '') ? [] : ['fontFamily must be a family name or a non-empty array of family names'];
    }
    case 'fontWeight': return between(value, 1, 1000) ? [] : ['fontWeight must be a number between 1 and 1000'];
    case 'number': return finite(value) ? [] : ['number must be a finite number'];
    default: return [`unsupported $type "${type}"`];
  }
}

function toDtcgValue(interchange: Supported): unknown {
  const color = (c: Oklch) => ({ colorSpace: 'oklch', components: [c.l, c.c, c.h], alpha: c.alpha });
  switch (interchange.type) {
    case 'color': return color(interchange.value);
    case 'shadow': {
      const layer = (s: Extract<Supported, { type: 'shadow' }>['value'] extends infer V ? V extends readonly unknown[] ? V[number] : V : never) => ({
        color: color(s.color), offsetX: s.offsetX, offsetY: s.offsetY, blur: s.blur, spread: s.spread, ...(s.inset ? { inset: true } : {}),
      });
      return Array.isArray(interchange.value) ? interchange.value.map(layer) : layer(interchange.value as Parameters<typeof layer>[0]);
    }
    default: return interchange.value;
  }
}

export type ExportExclusion = { id: string; reason: string };
export type TokenFile = { document: Json; exported: string[]; excluded: ExportExclusion[] };

const byId = (a: ResolvedToken, b: ResolvedToken) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** One document for one mode. Mode-independent tokens appear in every mode; unsupported values are listed, never guessed. */
export function buildTokenFile(tokens: ResolvedToken[], mode: Mode): TokenFile {
  const document: Json = {};
  const exported: string[] = [];
  const excluded: ExportExclusion[] = [];
  for (const token of [...tokens].sort(byId)) {
    const picked = 'type' in token.interchange ? token.interchange : token.interchange[mode];
    if (picked.type === 'unsupported') { excluded.push({ id: token.id, reason: picked.reason }); continue; }
    if (!(types as readonly string[]).includes(picked.type)) throw new TokenExportError(`${token.id}: unknown token type "${String(picked.type)}"`);
    const issues = valueIssues(picked.type, toDtcgValue(picked));
    if (issues.length) throw new TokenExportError(`${token.id} (${mode}): ${issues.join('; ')}`);
    const path = token.id.split('.');
    if (path.some(segment => !segmentPattern.test(segment))) throw new TokenExportError(`${token.id}: token ID segments must be lowercase words joined by hyphens`);
    let group = document;
    for (const segment of path.slice(0, -1)) {
      const next = group[segment] ?? (group[segment] = {});
      if (!isRecord(next) || '$value' in next) throw new TokenExportError(`${token.id}: group "${segment}" collides with a token of the same name`);
      group = next;
    }
    const leaf = path[path.length - 1];
    if (leaf in group) throw new TokenExportError(`${token.id}: a token or group named "${leaf}" already exists here`);
    group[leaf] = {
      $type: picked.type, $value: toDtcgValue(picked), $description: token.purpose,
      $extensions: { [EXTENSION_KEY]: { id: token.id, cssVariable: token.cssVariable, kind: token.kind, exampleIds: token.exampleIds } },
    };
    exported.push(token.id);
  }
  return { document, exported, excluded };
}

/** Check a document against the pinned format's shape for the types this exporter emits. Returns readable problems. */
export function validateTokenDocument(document: unknown): string[] {
  const issues: string[] = [];
  const walk = (node: unknown, path: string[]) => {
    const where = path.join('.') || '(root)';
    if (!isRecord(node)) { issues.push(`${where}: expected an object`); return; }
    if ('$value' in node) {
      const type = node.$type;
      if (typeof type !== 'string' || !(types as readonly string[]).includes(type)) { issues.push(`${where}: missing or unsupported $type`); return; }
      issues.push(...valueIssues(type, node.$value).map(issue => `${where}: ${issue}`));
      if (typeof node.$description !== 'string' || node.$description.trim() === '') issues.push(`${where}: $description is required`);
      const extension = isRecord(node.$extensions) ? node.$extensions[EXTENSION_KEY] : undefined;
      if (!isRecord(extension) || typeof extension.id !== 'string' || extension.id !== path.join('.') || typeof extension.cssVariable !== 'string' || !Array.isArray(extension.exampleIds)) {
        issues.push(`${where}: $extensions["${EXTENSION_KEY}"] must carry the token id, cssVariable, kind, and exampleIds`);
      }
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) { if (!['$description', '$type', '$extensions'].includes(key)) issues.push(`${where}: unknown property ${key}`); continue; }
      if (/[{}.]/.test(key)) issues.push(`${[...path, key].join('.')}: names cannot contain { } or .`);
      walk(child, [...path, key]);
    }
  };
  walk(document, []);
  return issues;
}

export type ExportNotes = {
  format: string; themeId: string; basedOnThemeId?: string; registryTokenCount: number;
  files: { name: string; mode: Mode; tokenCount: number }[];
  exclusions: { id: string; reason: string; modes: Mode[] }[];
  summary: string;
};
export type DesignTokensExport = { files: { name: string; mode: Mode; content: string }[]; notes: ExportNotes; notesContent: string };

/** Pure export for the applied theme: one file per mode plus matching notes. Throws TokenExportError rather than emit a bad file. */
export function exportDesignTokens(tokens: ResolvedToken[], theme: { id: string; basedOn?: string }): DesignTokensExport {
  const modes: Mode[] = ['light', 'dark'];
  const built = modes.map(mode => ({ mode, ...buildTokenFile(tokens, mode) }));
  for (const file of built) {
    const issues = validateTokenDocument(file.document);
    if (issues.length) throw new TokenExportError(`${tokenFilename(file.mode)} failed format validation: ${issues.join('; ')}`);
  }
  const exclusions = new Map<string, { id: string; reason: string; modes: Mode[] }>();
  for (const file of built) for (const item of file.excluded) {
    const existing = exclusions.get(item.id);
    if (existing) existing.modes.push(file.mode); else exclusions.set(item.id, { ...item, modes: [file.mode] });
  }
  const excluded = [...exclusions.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
  const counts = built.map(file => file.exported.length);
  const summary = excluded.length === 0
    ? `Every one of the ${tokens.length} registry tokens is in both files.`
    : `The files contain ${counts[0]} (light) and ${counts[1]} (dark) of ${tokens.length} registry tokens. ${excluded.length} token${excluded.length === 1 ? ' is' : 's are'} excluded; the reasons are listed below.`;
  const notes: ExportNotes = {
    format: DESIGN_TOKENS_FORMAT, themeId: theme.id, ...(theme.basedOn ? { basedOnThemeId: theme.basedOn } : {}), registryTokenCount: tokens.length,
    files: built.map(file => ({ name: tokenFilename(file.mode), mode: file.mode, tokenCount: file.exported.length })), exclusions: excluded, summary,
  };
  return {
    files: built.map(file => ({ name: tokenFilename(file.mode), mode: file.mode, content: `${JSON.stringify(file.document, null, 2)}\n` })),
    notes, notesContent: `${JSON.stringify(notes, null, 2)}\n`,
  };
}
