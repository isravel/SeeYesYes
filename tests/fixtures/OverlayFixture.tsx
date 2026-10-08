'use client';
import { useState } from 'react';
import type { Theme } from '@/lib/contract/schema';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Tabs } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import styles from './OverlayFixture.module.css';

export function OverlayFixture({ theme }: { theme: Theme }) {
  const [action, setAction] = useState('');
  const outer: Theme = { ...theme, density: 'compact', componentDefaults: { button: { variant: 'secondary', size: 'small' }, dialog: { size: 'small' } } };
  const inner: Theme = { ...theme, density: 'spacious', componentDefaults: { button: { variant: 'ghost', size: 'large' }, dialog: { size: 'large' } } };
  const items = [{ id: 'overview', label: 'Overview', content: 'Overview content' }, { id: 'disabled', label: 'Unavailable', content: 'Unavailable content', disabled: true }, { id: 'details', label: 'Details', content: 'Details content' }];
  return <main className={styles.main}><h1>Overlay integration checks</h1>
    <ThemeScope id="overlay-outer" theme={outer} appearance="dark" className={styles.scope}>
      <Dialog triggerLabel="Outer dialog" title="Outer task"><p>Outer scope.</p></Dialog>
      <ThemeScope id="overlay-inner" theme={inner} appearance="light" className={styles.scope}>
        <Dialog triggerLabel="Scope dialog" title="Scoped task" closeLabel="Close scope dialog"><FormField id="dialog-name" label="Preview name"><Input defaultValue="Local preview" /></FormField></Dialog>
        <Dialog triggerLabel="Required task" title="Required decision" closeOnEscape={false} closeLabel="Finish task"><p>Finish this task explicitly.</p></Dialog>
        <DropdownMenu triggerLabel="Scope actions" items={[{ id: 'save', label: 'Save' }, { id: 'blocked', label: 'Blocked', disabled: true }, { id: 'reset', label: 'Reset' }]} onAction={setAction} />
        <Tooltip triggerLabel="Scope tooltip" content="Supplemental scope description" delay={0} onPress={() => setAction('tooltip action')} />
        <p role="status">{action}</p>
        <Tabs label="Automatic details" items={items} />
        <Tabs label="Manual details" items={items} activation="manual" />
      </ThemeScope>
    </ThemeScope>
  </main>;
}
