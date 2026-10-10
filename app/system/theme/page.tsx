'use client';
import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Mode, Oklch } from '@/lib/contract/schema';
import styles from './theme.module.css';

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

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>SYSTEM · THEME</p><h1>Theme editor</h1><p>Edit color values in a local draft. Light and dark stay independent.</p></div>
      <a href="/">Back to overview</a>
    </header>
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
        <p role="status" aria-live="polite" className={styles.status}>{message || 'Draft colors stay separate from the workspace until Apply is added.'}</p>
      </section>

      <section className={styles.panel} aria-labelledby="preview-heading">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>PREVIEW</p><h2 id="preview-heading">See the selected colors</h2></div></div>
        <label className={styles.field}>Preview appearance
          <Select aria-label="Preview appearance" value={previewAppearance} onChange={event => setPreviewAppearance(event.currentTarget.value as typeof previewAppearance)}>
            <option value="light">Light</option><option value="dark">Dark</option><option value="system">Follow system</option>
          </Select>
        </label>
        <ThemeScope theme={theme} appearance={previewAppearance} className={styles.previewScope}>
          <Card><p className={styles.eyebrow}>COLOR SAMPLE</p><h3>{labels[role]}</h3><p>This preview uses the selected {mode} color values.</p><Button>Example action</Button></Card>
          <div className={styles.colorSamples}>
            {([['background', 'foreground'], ['surface', 'foreground'], ['primary', 'onPrimary'], ['accent', 'onAccent']] as const).map(([sample, foreground]) => <div key={sample} style={{ backgroundColor: `oklch(${theme.colors[mode][sample].l} ${theme.colors[mode][sample].c} ${theme.colors[mode][sample].h} / ${theme.colors[mode][sample].alpha})`, color: `oklch(${theme.colors[mode][foreground].l} ${theme.colors[mode][foreground].c} ${theme.colors[mode][foreground].h} / ${theme.colors[mode][foreground].alpha})` }}>{labels[sample]}</div>)}
          </div>
        </ThemeScope>
      </section>
    </div>
  </main>;
}
