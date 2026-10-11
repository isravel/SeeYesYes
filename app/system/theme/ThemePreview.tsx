'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import styles from './theme.module.css';

export function ThemePreview() {
  const [name, setName] = useState('Alex Morgan');
  const [team, setTeam] = useState('design');
  const [notifications, setNotifications] = useState(true);
  const [savedName, setSavedName] = useState('');
  const [actions, setActions] = useState(0);
  return <>
    <div className={styles.previewColumns}>
      <Card className={styles.sampleCard}>
        <Badge tone="primary">Sample workspace</Badge>
        <h3>Team profile</h3>
        <p>Try the controls to see how the draft feels in everyday use.</p>
        <form aria-label="Preview profile" className={styles.sampleForm} onSubmit={event => { event.preventDefault(); setSavedName(name); }}>
          <FormField id="preview-name" label="Display name" required>
            <Input value={name} onChange={event => setName(event.currentTarget.value)} />
          </FormField>
          <FormField id="preview-team" label="Team">
            <Select value={team} onChange={event => setTeam(event.currentTarget.value)}>
              <option value="design">Design</option><option value="engineering">Engineering</option>
            </Select>
          </FormField>
          <label className={styles.checkLabel}><Checkbox checked={notifications} onChange={event => setNotifications(event.currentTarget.checked)} />Send sample notifications</label>
          <Button type="submit">Save sample profile</Button>
          <p aria-live="polite">{savedName ? `Sample profile saved for ${savedName}.` : 'This form only changes the sample.'}</p>
        </form>
      </Card>
      <Card className={styles.sampleCard}>
        <h3>Actions and surfaces</h3>
        <Tabs label="Preview details" items={[
          { id: 'overview', label: 'Overview', content: <p>A shared theme shapes text, spacing, surfaces, and focus states.</p> },
          { id: 'activity', label: 'Activity', content: <p>Sample activity: {actions} example {actions === 1 ? 'action' : 'actions'} run.</p> },
        ]} />
        <div className={styles.sampleActions}>
          <Button onClick={() => setActions(count => count + 1)}>Example action</Button>
          <Button variant="secondary" onClick={() => setActions(0)}>Reset sample activity</Button>
          <Button disabled>Disabled action</Button>
          <Dialog triggerLabel="Open preview dialog" title="Preview dialog" closeLabel="Close preview dialog">
            {close => <><p>This dialog uses the draft theme and stays inside the preview scope.</p><Button onClick={close}>Done with preview</Button></>}
          </Dialog>
        </div>
      </Card>
    </div>
    <Table caption="Sample team members" columns={[{ id: 'name', label: 'Name', rowHeader: true }, { id: 'team', label: 'Team' }, { id: 'status', label: 'Status' }]} rows={[
      { id: 'alex', cells: { name: savedName || 'Alex Morgan', team: 'Design', status: <Badge tone="success">Active</Badge> } },
      { id: 'sam', cells: { name: 'Sam Patel', team: 'Engineering', status: <Badge tone="neutral">Invited</Badge> } },
    ]} />
    <div className={styles.colorSamples} aria-label="Preview colors">
      <div className={styles.backgroundSample}>Background</div><div className={styles.surfaceSample}>Surface</div>
      <div className={styles.primarySample}>Primary</div><div className={styles.accentSample}>Accent</div>
    </div>
  </>;
}
