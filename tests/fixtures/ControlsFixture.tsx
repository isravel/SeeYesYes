'use client';
import { useState } from 'react';
import type { Theme } from '@/lib/contract/schema';
import { ThemeScope } from '@/components/theme/ThemeScope';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Fieldset } from '@/components/ui/fieldset';
import { Highlight } from '@/components/ui/highlight';
import { Kbd } from '@/components/ui/kbd';
import { Level } from '@/components/ui/level';
import { LiveDot } from '@/components/ui/live-dot';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Table } from '@/components/ui/table';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { IconButton } from '@/components/ui/icon-button';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Chip } from '@/components/ui/chip';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { InputOtp } from '@/components/ui/input-otp';
import { Combobox } from '@/components/ui/combobox';
import { Disclosure } from '@/components/ui/disclosure';
import { Accordion } from '@/components/ui/accordion';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Popover } from '@/components/ui/popover';
import { Drawer } from '@/components/ui/drawer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus } from '@phosphor-icons/react';
import styles from './OverlayFixture.module.css';

const tabItems = [{ id: 'one', label: 'Overview', content: 'Overview content' }, { id: 'two', label: 'Details', content: 'Details content' }, { id: 'three', label: 'History', content: 'History content', disabled: true }];

/** Every X2 control in one scope, so browser checks can exercise real focus, layout and glass without the workspace shell. */
export function ControlsFixture({ theme, surface, appearance = 'light' }: { theme: Theme; surface: 'glass' | 'clean'; appearance?: 'light' | 'dark' }) {
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState<string[]>([]);
  const [tags, setTags] = useState(['Archived', 'Draft']);
  const [failing, setFailing] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpDone, setOtpDone] = useState('');
  const [country, setCountry] = useState<string | null>(null);
  const [page, setPage] = useState(6);
  const [open, setOpen] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState('');
  const [attempts, setAttempts] = useState(0);
  const scoped: Theme = { ...theme, effects: { ...theme.effects, surface } };
  return <main className={styles.main}><h1>Control checks</h1>
    <ThemeScope id="controls-scope" theme={scoped} appearance={appearance} className={styles.scope}>
      <section aria-label="Buttons" id="buttons">
        {(['primary', 'secondary', 'ghost', 'destructive', 'outline', 'soft', 'muted', 'solid', 'danger'] as const).map(variant => <Button key={variant} variant={variant}>{`Button ${variant}`}</Button>)}
        <Button loading>Saving</Button><Button disabled variant="outline">Unavailable</Button>
      </section>
      <section aria-label="Surfaces">
        <Card variant="elevated"><p>Outer card</p><Card><p>Inner card</p></Card></Card>
        <Badge tone="warning">4.8 rating</Badge><Badge tone="success">New</Badge>
        <Avatar initials="AB" alt="Ada B" ring />
        <Avatar initials="MC" alt="Maya Chen" src="/does-not-exist.png" />
      </section>
      <section aria-label="Toolbar">
        <Input aria-label="Search" size="small" /><Select aria-label="Sort" size="small"><option value="a">Newest</option><option value="b">Oldest</option></Select>
        <Input aria-label="Read only" readOnly defaultValue="Locked" />
      </section>
      <section aria-label="Growth">
        <FormField id="grow-field" label="Grow notes" helpText="Grows up to four lines." error={message === 'invalid' ? 'Add a note.' : undefined}>
          <Textarea autoGrow rows={2} maxRows={4} />
        </FormField>
        <Textarea aria-label="Fixed notes" rows={2} />
      </section>
      <section aria-label="Groups">
        <Fieldset legend="Contact details" helpText="How we reach you." error="Choose one way." required>
          <FormField id="group-phone" label="Phone"><Input type="tel" /></FormField>
          <Checkbox aria-label="Select all" indeterminate />
          <Switch label="Notifications" tone="neutral" />
        </Fieldset>
        <RadioGroup name="fixture-plan" label="Plan" value={plan} onChange={setPlan} options={[{ value: 'basic', label: 'Basic', hint: 'For one person' }, { value: 'team', label: 'Team', error: 'Needs an admin' }]} />
      </section>
      <section aria-label="Feedback">
        <Alert tone="destructive" variant="outline" title="Could not save">Try again in a moment.</Alert>
        <Alert tone="info" variant="text">Plain message</Alert>
        <Progress label="Upload" value={40} tone="neutral" /><Progress label="Scanning" />
        <Skeleton shape="rect" width="8rem" height="2rem" data-testid="skeleton" /><Spinner size="small" /><Separator decorative={false} />
      </section>
      <section aria-label="Navigation and data">
        <Tabs label="Line tabs" variant="line" items={tabItems} />
        <Tabs label="Boxed vertical tabs" variant="boxed" orientation="vertical" items={tabItems} />
        <Table caption="Stock" header="plain" rowHover columns={[{ id: 'name', label: 'Name', rowHeader: true }, { id: 'qty', label: 'Quantity' }]} rows={[{ id: '1', cells: { name: 'Apples', qty: '3' } }]} />
      </section>
      <section aria-label="Display" id="display">
        <p id="highlight-line">Your export includes <Highlight data-testid="highlight">every saved theme</Highlight> in this workspace.</p>
        <p><Level tone="success">Easy</Level> <Level tone="warning">Medium</Level> <Level tone="destructive">Hard</Level> <Level tone="info">Custom label</Level></p>
        <p><LiveDot animated data-testid="live-animated">Live now</LiveDot> <LiveDot status="inactive" size="medium">Offline</LiveDot> <LiveDot data-testid="live-static">Scheduled</LiveDot></p>
        <p id="kbd-line">Press <Kbd keys={['Ctrl', 'K']} /> to search, or <Kbd size="medium">Esc</Kbd> to close.</p>
        <AvatarGroup label="Project members" data-testid="group" people={[{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }, { initials: 'JO', alt: 'Jon Ortiz' }, { initials: 'LK', alt: 'Lena Koh' }, { initials: 'TS', alt: 'Tariq Shah' }, { initials: 'NP', alt: 'Nia Park' }]} />
        <AvatarGroup label="Reviewers with list" max={2} overflowContent={close => <><ul><li>Jon Ortiz</li><li>Lena Koh</li></ul><button type="button" onClick={close}>Close list</button></>} people={[{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }, { initials: 'JO', alt: 'Jon Ortiz' }, { initials: 'LK', alt: 'Lena Koh' }]} />
        <AvatarGroup label="Two reviewers" size="small" people={[{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }]} />
      </section>
      <section aria-label="Form controls" id="x3-controls">
        <IconButton label="Add member" tooltip="Add member" icon={<Plus />} onClick={() => setMessage('added')} />
        <IconButton label="Pin item" variant="outline" size="small" pressed={view === 'pinned'} icon={<Plus />} onClick={() => setView(view === 'pinned' ? 'list' : 'pinned')} />
        <IconButton label="Saving item" loading icon={<Plus />} />
        <IconButton label="Unavailable item" disabled icon={<Plus />} />
        <SearchInput label="Search members" value={query} onChange={setQuery} placeholder="Search members" />
        <SearchInput label="Searching members" defaultValue="Maya" searching />
        <Segmented label="View" value={view === 'pinned' ? 'list' : view} onChange={setView} options={[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'map', label: 'Map', disabled: true }]} />
        <Chip tone="info">Design</Chip>
        <Chip onSelectedChange={() => undefined}>In stock</Chip>
        {tags.map(tag => <Chip key={tag} onRemove={() => setTags(list => list.filter(item => item !== tag))}>{tag}</Chip>)}
        <Chip onRemove={() => setFailing(true)} error={failing ? 'Could not remove. Try again.' : undefined}>Pinned tag</Chip>
        <CheckboxGroup name="channels" label="Notify me by" value={picked} onChange={setPicked} helpText="Choose any." error={picked.length === 0 && message === 'submit' ? 'Choose at least one.' : undefined}
          options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'Text message', hint: 'Carrier rates may apply.' }, { value: 'push', label: 'Push', disabled: true }]} />
        <p data-testid="x3-picked">{picked.join(',')}|{view}</p>
        <InputOtp name="otp" label="Verification code" helpText="Enter the 6-digit code." value={otp} onChange={setOtp} onComplete={code => setOtpDone(code)} error={otp.length === 6 && otp !== '123456' ? 'That code is not right.' : undefined} />
        <InputOtp label="Masked code" length={4} masked defaultValue="12" />
        <InputOtp label="Locked code" defaultValue="123456" readOnly />
        <InputOtp label="Unavailable code" disabled />
        <p data-testid="x3-otp">{otp}|{otpDone}</p>
        <Combobox name="country" label="Country" placeholder="Search countries" helpText="Type to filter." value={country} onChange={setCountry}
          options={[{ value: 'in', label: 'India', group: 'Asia' }, { value: 'jp', label: 'Japan', group: 'Asia' }, { value: 'fr', label: 'France', group: 'Europe' }, { value: 'de', label: 'Germany', group: 'Europe', disabled: true }]} />
        <Combobox label="Searching country" loading options={[]} />
        <Combobox label="Locked country" defaultValue="jp" readOnly options={[{ value: 'jp', label: 'Japan' }]} />
        <Combobox label="Unavailable country" disabled options={[{ value: 'jp', label: 'Japan' }]} />
        <Combobox label="Invalid country" error="Choose a country from the list." options={[{ value: 'jp', label: 'Japan' }]} />
        <p data-testid="x3-country">{country ?? 'none'}</p>
      </section>
      <section aria-label="Disclosure and navigation" id="x3-compositions">
        <Disclosure label="Shipping details" data-testid="click-disclosure"><button type="button">Inside the panel</button></Disclosure>
        <Disclosure label="Hover preview" openOnHover data-testid="hover-disclosure"><p>Preview content</p></Disclosure>
        <Accordion headingLevel={3} items={[{ id: 'one', label: 'Shipping', content: 'Ships fast.' }, { id: 'two', label: 'Returns', content: 'Return in thirty days.' }, { id: 'three', label: 'Support', content: 'Write to us.', disabled: true }]} />
        <Accordion mode="multiple" value={open} onChange={setOpen} items={[{ id: 'm1', label: 'First multiple', content: 'One.' }, { id: 'm2', label: 'Second multiple', content: 'Two.' }]} />
        <Accordion collapsible={false} defaultValue={['k1']} items={[{ id: 'k1', label: 'Always one', content: 'Kept open.' }, { id: 'k2', label: 'Other', content: 'Other content.' }]} />
        <Pagination label="Results pages" pageCount={12} page={page} onPageChange={setPage} />
        <Pagination label="Linked pages" pageCount={3} defaultPage={2} getHref={target => `#page-${target}`} />
        <Breadcrumbs label="Trail" items={[{ label: 'Components', href: '/components' }, { label: 'Navigation', href: '#navigation' }, { label: 'Breadcrumbs', href: '#breadcrumbs' }]} />
        <Breadcrumbs label="Long trail" separator="chevron" items={[{ label: 'Workspace with a very long name that must wrap', href: '#one' }, { label: 'Another long section name to force wrapping', href: '#two' }, { label: 'Yet another deeply nested destination', href: '#three' }, { label: 'Current page with a long title', href: '#four' }]} />
        <p data-testid="x3-page">{page}|{open.join(',')}</p>
      </section>
      <section aria-label="Popover and drawer" id="x3-panels">
        <Popover triggerLabel="Filter options" label="Filter options">{close => <><label>Name filter <input type="text" /></label><button type="button" onClick={close}>Apply filters</button></>}</Popover>
        <Drawer triggerLabel="Open right drawer" title="Right filters">{close => <><label>Search <input type="text" /></label><button type="button" onClick={close}>Done</button></>}</Drawer>
        <Drawer triggerLabel="Open left drawer" title="Left filters" side="left" size="small"><p>Left content.</p></Drawer>
        <Drawer triggerLabel="Open bottom drawer" title="Bottom filters" side="bottom"><p>Bottom content.</p></Drawer>
        <Drawer triggerLabel="Open required drawer" title="Required drawer" dismissOnOutsidePress={false} closeOnEscape={false} closeLabel="Finish drawer"><p>Finish this first.</p></Drawer>
      </section>
      <section aria-label="Confirm dialogs" id="x3-confirm">
        <ConfirmDialog triggerLabel="Archive project" title="Archive this project?" confirmLabel="Archive project" onConfirm={() => setConfirmed('archived')}><p>The project moves to the archive.</p></ConfirmDialog>
        <ConfirmDialog triggerLabel="Delete project" title="Delete Orchard?" confirmLabel="Delete project" destructive confirmText="Orchard" onConfirm={() => new Promise<void>(resolve => setTimeout(() => { setConfirmed('deleted'); resolve(); }, 400))}><p>This removes the project for everyone.</p></ConfirmDialog>
        <ConfirmDialog triggerLabel="Remove member" title="Remove Ada Bell?" confirmLabel="Remove member" errorMessage="Could not remove the member. Try again." confirmText="Ada" onConfirm={async () => { setAttempts(count => count + 1); if (attempts < 1) throw new Error('offline'); setConfirmed('removed'); }}><p>Ada Bell loses access.</p></ConfirmDialog>
        <p data-testid="x3-confirmed">{confirmed}|{attempts}</p>
      </section>
      <section aria-label="Overlays">
        <Dialog triggerLabel="Open glass dialog" title="Glass dialog" closeLabel="Close glass dialog"><p>Panel over a scrim.</p></Dialog>
        <DropdownMenu triggerLabel="Open glass menu" items={[{ id: 'save', label: 'Save' }, { id: 'delete', label: 'Delete', destructive: true }]} onAction={setMessage} />
        <DropdownMenu triggerLabel="Open grouped menu" onAction={setMessage} items={[
          { type: 'group', id: 'file', label: 'File', items: [{ id: 'open', label: 'Open' }, { id: 'rename', label: 'Rename', disabled: true }] },
          { type: 'separator', id: 'sep-1' },
          { type: 'group', id: 'help', label: 'Help', items: [{ id: 'docs', label: 'Read the docs', href: '/docs' }, { id: 'site', label: 'Publisher site', href: 'https://example.com', external: true }] },
          { type: 'separator', id: 'sep-2' },
          { type: 'group', id: 'empty-group', label: 'Hidden group', items: [] },
          { id: 'remove', label: 'Remove everything permanently from this workspace and every connected project', destructive: true },
          { type: 'separator', id: 'sep-trailing' },
        ]} />
        <DropdownMenu triggerLabel="Open empty menu" items={[]} onAction={setMessage} />
        <Tooltip triggerLabel="Glass tooltip trigger" content="Short label" delay={0} onPress={() => setMessage('pressed')} />
        <p role="status">{message}</p>
      </section>
    </ThemeScope>
  </main>;
}
