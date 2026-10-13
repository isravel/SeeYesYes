'use client';
import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { registry } from '@/lib/data/registry';
import type { Mode, Oklch } from '@/lib/contract/schema';
import { applyDraft, discardDraft, resetDraft } from '@/lib/theme/stores';
import styles from './theme.module.css';
import { ThemePreview } from './ThemePreview';

const roles = [
  ['Surface and text', ['background', 'foreground', 'surface', 'muted', 'mutedForeground', 'border', 'focus']],
  ['Brand', ['primary', 'onPrimary', 'secondary', 'onSecondary', 'accent', 'onAccent']],
  ['Feedback', ['destructive', 'onDestructive', 'success', 'onSuccess', 'warning', 'onWarning', 'info', 'onInfo']],
] as const;
const labels: Record<string, string> = {
  background: 'Background', foreground: 'Foreground', surface: 'Surface', muted: 'Muted surface',
  mutedForeground: 'Muted text', border: 'Border', focus: 'Focus', primary: 'Primary', onPrimary: 'Text on primary',
  secondary: 'Secondary', onSecondary: 'Text on secondary', accent: 'Accent', onAccent: 'Text on accent',
  destructive: 'Destructive', onDestructive: 'Text on destructive', success: 'Success', onSuccess: 'Text on success',
  warning: 'Warning', onWarning: 'Text on warning', info: 'Information', onInfo: 'Text on information',
};
type Channel = keyof Oklch;

export default function ThemeEditorPage() {
  const stores = useThemeStores();
  const theme = useStore(stores.draft, state => state.theme);
  const setTheme = useStore(stores.draft, state => state.setTheme);
  const dirty = useStore(stores.draft, state => state.dirty);
  const persistence = useStore(stores.applied, state => state.persistence);
  const initialized = useStore(stores.applied, state => state.initialized);
  const notice = useStore(stores.applied, state => state.notice);
  const [mode, setMode] = useState<Mode>('light');
  const [previewAppearance, setPreviewAppearance] = useState<'light' | 'dark' | 'system'>('light');
  const [role, setRole] = useState<keyof typeof theme.colors.light>('primary');
  const [paletteId, setPaletteId] = useState(Object.keys(theme.palette)[0] ?? '');
  const [message, setMessage] = useState('');
  const color = theme.colors[mode][role];
  const cssColor = useMemo(() => `oklch(${color.l} ${color.c} ${color.h} / ${color.alpha})`, [color]);

  function updateChannel(channel: Channel, value: number) {
    const next = { ...theme.colors[mode][role], [channel]: value };
    setTheme({ ...theme, colors: { ...theme.colors, [mode]: { ...theme.colors[mode], [role]: next } } });
    setMessage(`${labels[role]} ${mode} value updated in the draft.`);
  }
  function usePaletteSuggestion() {
    const suggestion = theme.palette[paletteId];
    if (!suggestion) return;
    setTheme({ ...theme, colors: { ...theme.colors, [mode]: { ...theme.colors[mode], [role]: { ...suggestion } } } });
    setMessage(`${paletteId} copied into ${labels[role]} for ${mode} only.`);
  }
  function updateThemeValue<K extends 'radius' | 'density' | 'shadows' | 'motion'>(key: K, value: (typeof theme)[K]) {
    setTheme({ ...theme, [key]: value });
    setMessage(`${key[0].toUpperCase()}${key.slice(1)} updated in the draft.`);
  }
  function updateFont(kind: 'sansFontId' | 'monoFontId', value: string) {
    setTheme({ ...theme, typography: { ...theme.typography, [kind]: value } });
    setMessage(`${kind === 'sansFontId' ? 'Sans' : 'Monospace'} font updated in the draft.`);
  }
  function updateScale(value: 'small' | 'default' | 'large') {
    setTheme({ ...theme, typography: { ...theme.typography, scale: value } });
    setMessage('Typography scale updated in the draft.');
  }
  function updateSurfaceEffect(value: 'clean' | 'subtle-depth') {
    setTheme({ ...theme, effects: { ...theme.effects, surface: value } });
    setMessage('Surface effect updated in the draft.');
  }
  function updateComponentDefault(componentId: string, property: 'variant' | 'size', value: string) {
    setTheme({ ...theme, componentDefaults: { ...theme.componentDefaults, [componentId]: { ...theme.componentDefaults[componentId], [property]: value } } });
    setMessage(`${componentId} ${property} default updated in the draft.`);
  }

  function apply() {
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* Blocked storage leaves the change session-only. */ }
    try {
      const result = applyDraft(stores, registry, storage);
      setMessage(result.status === 'unchanged' ? 'The draft already matches the workspace theme.'
        : result.persisted ? 'Draft applied to the workspace and saved.' : (result.notice ?? 'Draft applied to the workspace for this session.'));
    } catch (error) {
      setMessage(`The draft could not be applied: ${error instanceof Error ? error.message : 'it is not a valid theme.'} Your draft is unchanged.`);
    }
  }
  function discard() { discardDraft(stores); setMessage('Changes discarded. The draft matches the workspace theme.'); }
  function reset() { resetDraft(stores); setMessage('Draft reset to the default preset. Apply to change the workspace.'); }

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>SYSTEM · THEME</p><h1>Theme editor</h1><p>Edit a local draft and try it in the preview. Light and dark colors stay independent.</p></div>
      <Link href="/">Back to overview</Link>
    </header>
    <section className={styles.actions} aria-label="Draft actions">
      <p className={styles.unsaved} data-dirty={dirty}>{dirty ? 'Unsaved changes: the draft differs from the workspace theme.' : 'No unsaved changes.'}</p>
      <div className={styles.actionButtons}>
        <Button variant="primary" onClick={apply} disabled={!initialized || !dirty}>Apply to workspace</Button>
        <Button variant="secondary" onClick={discard} disabled={!dirty}>Discard changes</Button>
        <Button variant="secondary" onClick={reset}>Reset draft</Button>
      </div>
      {persistence === 'session-only' && <p className={styles.status}>Changes stay in this tab and reset on refresh because browser storage is unavailable.</p>}
      {notice && persistence !== 'session-only' && <p className={styles.status}>{notice}</p>}
    </section>
    <div className={styles.controls}>
      <section className={styles.panel} aria-labelledby="color-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>COLORS</p><h2 id="color-heading">Edit a semantic role</h2></div><span className={styles.swatch} role="img" aria-label={`${labels[role]} preview`} style={{ backgroundColor: cssColor }} /></div>
        <div className={styles.modeSwitch} role="group" aria-label="Color mode">
          <Button variant={mode === 'light' ? 'primary' : 'secondary'} aria-pressed={mode === 'light'} onClick={() => setMode('light')}>Light colors</Button>
          <Button variant={mode === 'dark' ? 'primary' : 'secondary'} aria-pressed={mode === 'dark'} onClick={() => setMode('dark')}>Dark colors</Button>
        </div>
        <label className={styles.field}>Color role
          <Select aria-label="Color role" value={role} onChange={event => setRole(event.currentTarget.value as keyof typeof theme.colors.light)}>
            {roles.map(([group, items]) => <optgroup label={group} key={group}>{items.map(item => <option key={item} value={item}>{labels[item]}</option>)}</optgroup>)}
          </Select>
        </label>
        <div className={styles.channels}>
          {([
            ['l', 'Lightness', 0, 1, 0.01], ['c', 'Chroma', 0, 0.4, 0.005],
            ['h', 'Hue', 0, 360, 1], ['alpha', 'Alpha', 0, 1, 0.01],
          ] as const).map(([channel, title, min, max, step]) => <label className={styles.field} key={channel}>{title}
            <Input aria-label={title} type="number" min={min} max={max} step={step} value={color[channel]} onChange={event => updateChannel(channel, Math.max(min, Math.min(max, Number(event.currentTarget.value))))} />
          </label>)}
        </div>
        <p className={styles.value}>OKLCH: <code>{cssColor}</code></p>
        <div className={styles.suggestion}>
          <label className={styles.field}>Palette suggestion
            <Select aria-label="Palette suggestion" value={paletteId} onChange={event => setPaletteId(event.currentTarget.value)}>
              {Object.entries(theme.palette).map(([id, value]) => <option value={id} key={id}>{id} · oklch({value.l} {value.c} {value.h} / {value.alpha})</option>)}
            </Select>
          </label>
          <Button variant="secondary" onClick={usePaletteSuggestion}>Use suggestion for {mode}</Button>
          <p>Suggestions copy into the selected role and mode only. They do not change the other mode.</p>
        </div>
        <p role="status" aria-live="polite" className={styles.status}>{message || 'Draft colors stay separate from the workspace until you apply them.'}</p>
      </section>

      <section className={styles.panel} aria-labelledby="type-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>TYPOGRAPHY</p><h2 id="type-heading">Choose type settings</h2></div></div>
        <div className={styles.settingsGrid}>
          <label className={styles.field}>Sans font
            <Select aria-label="Sans font" value={theme.typography.sansFontId} onChange={event => updateFont('sansFontId', event.currentTarget.value)}>
              {registry.fonts.filter(font => font.kind === 'sans').map(font => <option key={font.id} value={font.id}>{font.family}</option>)}
            </Select>
          </label>
          <label className={styles.field}>Monospace font
            <Select aria-label="Monospace font" value={theme.typography.monoFontId} onChange={event => updateFont('monoFontId', event.currentTarget.value)}>
              {registry.fonts.filter(font => font.kind === 'mono').map(font => <option key={font.id} value={font.id}>{font.family}</option>)}
            </Select>
          </label>
          <label className={styles.field}>Type scale
            <Select aria-label="Type scale" value={theme.typography.scale} onChange={event => updateScale(event.currentTarget.value as typeof theme.typography.scale)}>
              <option value="small">Small</option><option value="default">Default</option><option value="large">Large</option>
            </Select>
          </label>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="shape-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SHAPE AND DENSITY</p><h2 id="shape-heading">Set shared geometry</h2></div></div>
        <div className={styles.settingsGrid}>
          <label className={styles.field}>Corner shape
            <Select aria-label="Corner shape" value={theme.radius} onChange={event => updateThemeValue('radius', event.currentTarget.value as typeof theme.radius)}>
              <option value="sharp">Sharp</option><option value="soft">Soft</option><option value="curvy">Curvy</option>
            </Select>
          </label>
          <label className={styles.field}>Density
            <Select aria-label="Density" value={theme.density} onChange={event => updateThemeValue('density', event.currentTarget.value as typeof theme.density)}>
              <option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option>
            </Select>
          </label>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="effects-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SHADOWS, EFFECTS, AND MOTION</p><h2 id="effects-heading">Tune surface and motion settings</h2></div></div>
        <div className={styles.settingsGrid}>
          <label className={styles.field}>Shadow scale
            <Select aria-label="Shadow scale" value={theme.shadows} onChange={event => updateThemeValue('shadows', event.currentTarget.value as typeof theme.shadows)}>
              <option value="none">None</option><option value="soft">Soft</option><option value="defined">Defined</option>
            </Select>
          </label>
          <label className={styles.field}>Surface effect
            <Select aria-label="Surface effect" value={theme.effects.surface} onChange={event => updateSurfaceEffect(event.currentTarget.value as typeof theme.effects.surface)}>
              <option value="clean">Clean</option><option value="subtle-depth">Subtle depth</option>
            </Select>
          </label>
          <label className={styles.field}>Motion
            <Select aria-label="Motion" value={theme.motion} onChange={event => updateThemeValue('motion', event.currentTarget.value as typeof theme.motion)}>
              <option value="none">None</option><option value="subtle">Subtle</option>
            </Select>
          </label>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="defaults-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>COMPONENT DEFAULTS</p><h2 id="defaults-heading">Set allowed defaults</h2><p>Options come from each component contract.</p></div></div>
        <div className={styles.componentDefaults}>
          {registry.components.filter(component => Object.keys(component.themeDefaults).length > 0).map(component => <fieldset className={styles.defaultGroup} key={component.id}>
            <legend>{component.name}</legend>
            {(['variant', 'size'] as const).filter(property => component.themeDefaults[property]?.length).map(property => {
              const options = component.themeDefaults[property]!;
              const current = theme.componentDefaults[component.id]?.[property] ?? String(component.props.find(prop => prop.name === property)?.defaultValue ?? options[0]);
              return <label className={styles.field} key={property}>{property === 'variant' ? 'Variant' : 'Size'}
                <Select aria-label={`${component.name} ${property} default`} value={current} onChange={event => updateComponentDefault(component.id, property, event.currentTarget.value)}>
                  {options.map(option => <option key={option} value={option}>{option}</option>)}
                </Select>
              </label>;
            })}
          </fieldset>)}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.previewPanel}`} aria-labelledby="preview-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>PREVIEW</p><h2 id="preview-heading">Try the draft theme</h2><p>Preview appearance is separate from the color mode you are editing.</p></div></div>
        <label className={styles.field}>Preview appearance
          <Select aria-label="Preview appearance" value={previewAppearance} onChange={event => setPreviewAppearance(event.currentTarget.value as typeof previewAppearance)}>
            <option value="light">Light</option><option value="dark">Dark</option><option value="system">Follow system</option>
          </Select>
        </label>
        <ThemeScope id="theme-editor-preview" theme={theme} appearance={previewAppearance} className={styles.previewScope}>
          <ThemePreview />
        </ThemeScope>
      </section>
    </div>
  </main>;
}
