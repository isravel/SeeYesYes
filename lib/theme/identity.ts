import type { Theme } from '@/lib/contract/schema';
import { stableJson } from '@/lib/contract/serialize';
import { parseTheme } from './check';
export function themeValues(theme: Theme) {
  const { id: _id, basedOn: _basedOn, ...values } = theme;
  void _id; void _basedOn;
  return stableJson(values);
}
export function assignThemeIdentity(draft: Theme, presets: Theme[]): Theme {
  parseTheme(draft);
  const preset = presets.find(p => p.id === (draft.basedOn ?? draft.id));
  if (!preset) throw new Error('The theme must name a known starting preset.');
  const { basedOn: _basedOn, ...values } = draft;
  void _basedOn;
  return parseTheme(themeValues(draft) === themeValues(preset)
    ? { ...values, id: preset.id } : { ...values, id: 'custom', basedOn: preset.id });
}
