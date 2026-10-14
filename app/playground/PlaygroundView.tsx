'use client';
import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { useThemeStores } from '@/components/theme/ThemeLifecycleProvider';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { demoCode, demos, renderDemo } from '@/components/examples/demos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Link } from '@/components/ui/link';
import { Select } from '@/components/ui/select';
import { registry } from '@/lib/data/registry';
import { effectiveDefaults } from '@/lib/contract/validate';
import { activeCompounds, initialSelection, optionStatus, type Selection } from '@/lib/components/playground';
import { hasOverrides, playgroundTheme, type PlaygroundAppearance } from '@/lib/theme/playground';
import styles from './playground.module.css';

const components = [...registry.components].sort((a, b) => a.name.localeCompare(b.name));

export function PlaygroundView() {
  const stores = useThemeStores();
  const applied = useStore(stores.applied, state => state.settings);
  const overrides = useStore(stores.playground, state => state.overrides);
  const appearance = useStore(stores.playground, state => state.appearance);
  const setOverride = useStore(stores.playground, state => state.setOverride);
  const setAppearance = useStore(stores.playground, state => state.setAppearance);
  const reset = useStore(stores.playground, state => state.reset);
  const theme = useMemo(() => playgroundTheme(applied.theme, overrides), [applied.theme, overrides]);
  const [componentId, setComponentId] = useState('button');
  const component = components.find(item => item.id === componentId)!;
  const demo = demos[componentId];
  const [selections, setSelections] = useState<Record<string, { variants: Selection; state: string }>>({});
  const current = selections[componentId] ?? { variants: initialSelection(component, effectiveDefaults(component, theme)), state: demo.states[0] };
  const update = (next: Partial<typeof current>) => setSelections({ ...selections, [componentId]: { ...current, ...next } });
  const compounds = activeCompounds(component, current.variants);
  const changed = hasOverrides(overrides, appearance);
  const importLine = `import { ${component.publicImport.exportName} } from "${component.publicImport.module}";`;
  const code = `${importLine}\n\n${demoCode(componentId, current.variants, current.state)}`;
  const [message, setMessage] = useState('');

  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>PLAYGROUND</p><h1>Playground</h1>
        <p>Try theme settings, components, variants, and states together. Everything here is session-only and affects only the preview below. It never changes your workspace theme.</p></div>
      <Link href="/system/theme">Edit the real theme</Link>
    </header>
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="controls-heading">
        <h2 id="controls-heading">Settings <Badge tone="warning">Playground only</Badge></h2>
        <p className={styles.note}>Starts from your applied theme ({applied.theme.id}). Not applied, not saved, and gone on refresh.</p>
        <div className={styles.controls}>
          <label className={styles.field}>Preview appearance
            <Select value={appearance ?? 'workspace'} onChange={event => setAppearance(event.currentTarget.value === 'workspace' ? null : event.currentTarget.value as PlaygroundAppearance)}>
              <option value="workspace">Follow workspace ({applied.appearance})</option><option value="light">Light</option><option value="dark">Dark</option><option value="system">Follow system</option>
            </Select>
          </label>
          <label className={styles.field}>Density
            <Select value={theme.density} onChange={event => setOverride('density', event.currentTarget.value as typeof theme.density)}>
              <option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option>
            </Select>
          </label>
          <label className={styles.field}>Corner shape
            <Select value={theme.radius} onChange={event => setOverride('radius', event.currentTarget.value as typeof theme.radius)}>
              <option value="sharp">Sharp</option><option value="soft">Soft</option><option value="curvy">Curvy</option>
            </Select>
          </label>
          <label className={styles.field}>Shadow scale
            <Select value={theme.shadows} onChange={event => setOverride('shadows', event.currentTarget.value as typeof theme.shadows)}>
              <option value="none">None</option><option value="soft">Soft</option><option value="defined">Defined</option>
            </Select>
          </label>
          <label className={styles.field}>Surface effect
            <Select value={theme.effects.surface} onChange={event => setOverride('surface', event.currentTarget.value as typeof theme.effects.surface)}>
              <option value="clean">Clean</option><option value="subtle-depth">Subtle depth</option>
            </Select>
          </label>
          <label className={styles.field}>Motion
            <Select value={theme.motion} onChange={event => setOverride('motion', event.currentTarget.value as typeof theme.motion)}>
              <option value="none">None</option><option value="subtle">Subtle</option>
            </Select>
          </label>
          <label className={styles.field}>Type scale
            <Select value={theme.typography.scale} onChange={event => setOverride('scale', event.currentTarget.value as typeof theme.typography.scale)}>
              <option value="small">Small</option><option value="default">Default</option><option value="large">Large</option>
            </Select>
          </label>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" disabled={!changed} onClick={() => { reset(); setMessage('Playground reset to your applied theme.'); }}>Reset to applied theme</Button>
          <span role="status" className={styles.note}>{message || (changed ? 'Playground settings differ from the applied theme.' : 'Matches the applied theme.')}</span>
        </div>

        <h2>Component</h2>
        <div className={styles.controls}>
          <label className={styles.field}>Component
            <Select value={componentId} onChange={event => { setComponentId(event.currentTarget.value); setMessage(''); }}>{components.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
          </label>
          {Object.entries(component.variants).map(([name, choices]) => <label key={name} className={styles.field}>{name}
            <Select aria-label={`${component.name} ${name}`} value={current.variants[name]} onChange={event => update({ variants: { ...current.variants, [name]: event.currentTarget.value } })}>
              {choices.map(option => <option key={option} value={option} disabled={optionStatus(component, current.variants, name, option).disabled && option !== current.variants[name]}>{option}</option>)}
            </Select>
          </label>)}
          {demo.states.length > 1 && <label className={styles.field}>state
            <Select aria-label={`${component.name} state`} value={current.state} onChange={event => update({ state: event.currentTarget.value })}>{demo.states.map(item => <option key={item} value={item}>{item}</option>)}</Select>
          </label>}
        </div>
        {compounds.map(compound => <p key={JSON.stringify(compound.when)} className={styles.note}>This combination has a dedicated style: {compound.description}</p>)}
      </section>

      <section className={styles.previewColumn} aria-labelledby="preview-heading">
        <h2 id="preview-heading">Preview <Badge tone="warning">Playground only</Badge></h2>
        <ThemeScope id="playground-preview" theme={theme} appearance={appearance ?? applied.appearance} className={styles.preview}>
          <div className={styles.stage} data-testid="playground-stage" key={`${componentId}-${JSON.stringify(current)}`}>{renderDemo(componentId, current.variants, current.state)}</div>
        </ThemeScope>
        <h3>Matching code</h3>
        <div className={styles.code}><pre tabIndex={0} aria-label="Playground code"><code>{code}</code></pre><CopyButton label="Playground code" value={code} /></div>
      </section>
    </div>
  </main>;
}
