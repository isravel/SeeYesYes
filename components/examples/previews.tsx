'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Backdrop } from '@/components/ui/backdrop';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { Fieldset } from '@/components/ui/fieldset';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { menuExampleItems, menuExampleMessage } from './menu-items';
import { Tabs } from '@/components/ui/tabs';
import { Table } from '@/components/ui/table';
import { Navigation } from '@/components/ui/navigation';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { NotFound } from '@/components/ui/not-found';
import { CopyButton } from '@/components/ui/copy-button';
import { Highlight } from '@/components/ui/highlight';
import { Level } from '@/components/ui/level';
import { LiveDot } from '@/components/ui/live-dot';
import { Kbd } from '@/components/ui/kbd';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Tooltip } from '@/components/ui/tooltip';
import { IconButton } from '@/components/ui/icon-button';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Chip } from '@/components/ui/chip';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { Plus } from '@phosphor-icons/react';
import { DashboardLayout, DenseDataLayout, DetailViewLayout, MarketingLayout, PageShellLayout, SettingsLayout, SplitViewLayout } from './layouts';
function ButtonSave() {
  const [saved, setSaved] = useState(false);
  return <><Button onClick={() => setSaved(true)}>Save settings</Button><span role="status">{saved ? 'Settings saved for this example.' : ''}</span></>;
}
function SpinnerProgress() { return <p role="status"><Spinner /> Preparing your preview…</p>; }
function LinkButtons() { return <div><Link href="/docs" variant="button-primary">Read in the app →</Link> <Link href="https://example.com" variant="button-secondary" target="_blank" rel="noopener noreferrer">Publisher (opens in a new tab) ↗</Link></div>; }
function LinkDocs() { return <Link href="/api/registry">Read the registry</Link>; }
function BackdropGlass() {
  return <Backdrop>
    <Card>
      <h3>Glass panel</h3>
      <p>Text stays crisp over a tinted, blurred surface.</p>
      <Dialog triggerLabel="Open glass dialog" title="Glass dialog"><p>Dialogs use a denser tint.</p></Dialog>
    </Card>
  </Backdrop>;
}
function ThemeSwitcherLabeled() { return <ThemeSwitcher variant="labeled" />; }
function CardProfile() { return <Card><h3>Workspace settings</h3><p>Choose the defaults your team shares.</p></Card>; }
function BadgeStatus() { return <Badge tone="success">Ready</Badge>; }
function SeparatorSections() { return <div className="previewSections"><span>Overview</span><Separator /><span>Details</span></div>; }
function AvatarMember() { return <Avatar initials="MC" alt="Maya Chen" />; }
function AlertRecovery() { return <Alert tone="info" title="Preview mode">Your changes stay in this preview.</Alert>; }
function ProgressUpload() { return <Progress label="Uploading files" value={68} />; }
function SkeletonList() { return <section aria-busy="true" aria-label="Loading members"><Skeleton shape="text" /><Skeleton shape="rect" /></section>; }
function InputEmail() { return <Input type="email" aria-label="Email address" placeholder="name@example.com" />; }
function TextareaNotes() { return <Textarea aria-label="Notes" placeholder="Add a note" />; }
function SelectRole() { return <Select aria-label="Role" defaultValue="editor"><option value="editor">Editor</option><option value="viewer">Viewer</option></Select>; }
function CheckboxArchive() { return <Checkbox aria-label="Include archived projects" />; }
function RadioPlan() { return <RadioGroup name="preview-plan" label="Plan" options={[{ value: 'basic', label: 'Basic' }, { value: 'team', label: 'Team' }]} />; }
function SwitchNotifications() { return <Switch label="Email notifications" defaultChecked />; }
function LabelName() { return <><Label htmlFor="preview-email">Email address</Label><Input id="preview-email" type="email" /></>; }
function FormFieldEmail() { return <FormField id="preview-field-email" label="Email address" helpText="We will send your receipt here."><Input type="email" /></FormField>; }
function FieldsetContact() { return <Fieldset legend="Contact details" helpText="We only use these to confirm your order."><FormField id="preview-phone" label="Phone"><Input type="tel" /></FormField><FormField id="preview-contact-email" label="Email"><Input type="email" /></FormField></Fieldset>; }
function DialogPreview() { return <Dialog triggerLabel="Open preview settings" title="Preview settings"><p>Changes here stay in this preview.</p></Dialog>; }
function MenuActions() {
  const [message, setMessage] = useState('');
  return <><DropdownMenu triggerLabel="Preview actions" items={menuExampleItems} onAction={id => setMessage(menuExampleMessage(id))} /><span role="status">{message}</span></>;
}
function TabsOverview() { return <Tabs label="Preview details" items={[{ id: 'overview', label: 'Overview', content: 'A shared starting point.' }, { id: 'tokens', label: 'Tokens', content: 'Semantic values from the theme.' }]} />; }
function TooltipSave() {
  const [saved, setSaved] = useState(false);
  return <><Tooltip triggerLabel="Save preview" content="Only this preview is saved." onPress={() => setSaved(true)} /><span role="status">{saved ? 'Preview saved for this example.' : ''}</span></>;
}
function TableInvoices() { return <Table caption="Recent invoices" columns={[{ id: 'invoice', label: 'Invoice', rowHeader: true }, { id: 'status', label: 'Status' }]} rows={[{ id: '104', cells: { invoice: 'INV-104', status: <Badge tone="success">Paid</Badge> } }, { id: '105', cells: { invoice: 'INV-105', status: <Badge tone="warning">Pending</Badge> } }]} />; }
function NavigationPreview() { return <Navigation label="Example navigation" showSkipLink={false} triggerLabel="Open example navigation" currentHref="#components-title" mainId="main" groups={[{ label: 'Explore', items: [{ label: 'Components', href: '#components-title' }, { label: 'Overview', href: '#main' }] }]} />; }
function LoadingMembers() { return <LoadingState label="Loading team members" description="Checking the shared workspace." variant="skeleton" />; }
function EmptyProjects() {
  const [created, setCreated] = useState(false);
  return <><EmptyState title="No projects yet" description="Create a project to keep related work together." action={<Button onClick={() => setCreated(true)}>Create project</Button>} /><span role="status">{created ? 'Sample project created.' : ''}</span></>;
}
function ErrorRegistry() {
  const [attempts, setAttempts] = useState(0);
  return <><ErrorState title="Could not load components" message="The preview could not reach the component registry." onRetry={() => setAttempts(count => count + 1)} /><span role="status">{attempts ? `Retry requested (${attempts}).` : ''}</span></>;
}
function NotFoundComponent() { return <NotFound title="Component not found" description="That component is not in this registry." homeHref="#main" homeLabel="Return to overview" headingLevel={2} />; }
function CopyContext() { return <CopyButton label="sample context" value={'Component: Button\nPurpose: Run a named action.'} />; }
function HighlightNote() { return <p>Your export includes <Highlight>every saved theme</Highlight> in this workspace.</p>; }
function LevelDifficulty() { return <div className="previewSections"><Level tone="success">Easy</Level><Level tone="warning">Medium</Level><Level tone="destructive">Hard</Level></div>; }
function LiveDotStatus() { return <div className="previewSections"><LiveDot animated>Live now</LiveDot><LiveDot status="inactive">Offline</LiveDot></div>; }
// The block wrapper keeps the sentence out of the preview's flex-row paragraph rule, so it wraps instead of overflowing narrow cards.
function KbdShortcut() { return <div className="previewSections"><p>Press <Kbd keys={['Ctrl', 'K']} /> to search, or <Kbd>Esc</Kbd> to close.</p></div>; }
const teamPeople = [{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }, { initials: 'JO', alt: 'Jon Ortiz' }, { initials: 'LK', alt: 'Lena Koh' }, { initials: 'TS', alt: 'Tariq Shah' }, { initials: 'NP', alt: 'Nia Park' }];
function AvatarGroupTeam() { return <AvatarGroup label="Project members" people={teamPeople} />; }
function IconButtonAdd() {
  const [added, setAdded] = useState(0);
  return <><IconButton label="Add member" tooltip="Add member" icon={<Plus />} onClick={() => setAdded(count => count + 1)} /><span role="status">{added ? `${added} member${added === 1 ? '' : 's'} added in this preview.` : ''}</span></>;
}
function SearchInputMembers() { return <div className="previewSections"><SearchInput label="Search members" placeholder="Search members" /></div>; }
function SegmentedView() {
  const [view, setView] = useState('list');
  return <div className="previewSections"><Segmented label="View" value={view} onChange={setView} options={[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }]} /><span role="status">Showing the {view} view.</span></div>;
}
function ChipFilters() {
  const [tags, setTags] = useState(['Archived', 'Draft']);
  return <div className="previewSections"><div><Chip tone="info">Design</Chip> <Chip onSelectedChange={() => undefined}>In stock</Chip></div><div>{tags.map(tag => <Chip key={tag} onRemove={() => setTags(list => list.filter(item => item !== tag))}>{tag}</Chip>)}</div></div>;
}
function CheckboxGroupChannels() {
  return <div className="previewSections"><CheckboxGroup name="preview-channels" label="Notify me by" defaultValue={['email']} options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'Text message', hint: 'Carrier rates may apply.' }, { value: 'push', label: 'Push', disabled: true }]} /></div>;
}
export const previewMap = {
  buttonSave: ButtonSave, spinnerProgress: SpinnerProgress, linkDocs: LinkDocs, linkButtons: LinkButtons,
  cardProfile: CardProfile, badgeStatus: BadgeStatus, separatorSections: SeparatorSections,
  avatarMember: AvatarMember, alertRecovery: AlertRecovery, progressUpload: ProgressUpload, skeletonList: SkeletonList,
  inputEmail: InputEmail, textareaNotes: TextareaNotes, selectRole: SelectRole, checkboxArchive: CheckboxArchive,
  radioPlan: RadioPlan, switchNotifications: SwitchNotifications, labelName: LabelName, formFieldEmail: FormFieldEmail, fieldsetContact: FieldsetContact,
  dialogPreview: DialogPreview, menuActions: MenuActions, tabsOverview: TabsOverview, tooltipSave: TooltipSave, tableInvoices: TableInvoices, navigationPreview: NavigationPreview,
  backdropGlass: BackdropGlass, themeSwitcherLabeled: ThemeSwitcherLabeled,
  highlightNote: HighlightNote, levelDifficulty: LevelDifficulty, liveDotStatus: LiveDotStatus, kbdShortcut: KbdShortcut, avatarGroupTeam: AvatarGroupTeam,
  iconButtonAdd: IconButtonAdd, searchInputMembers: SearchInputMembers, segmentedView: SegmentedView, chipFilters: ChipFilters, checkboxGroupChannels: CheckboxGroupChannels,
  loadingMembers: LoadingMembers, emptyProjects: EmptyProjects, errorRegistry: ErrorRegistry, notFoundComponent: NotFoundComponent, copyContext: CopyContext,
};
export const layoutPreviewMap = { pageShell: PageShellLayout, dashboard: DashboardLayout, splitView: SplitViewLayout, detailView: DetailViewLayout, settings: SettingsLayout, denseData: DenseDataLayout, marketing: MarketingLayout };

export function ExamplePreview({ previewKey }: { previewKey: string }) {
  if (!Object.hasOwn(previewMap, previewKey)) throw new Error(`Unknown preview key: ${previewKey}`);
  const Preview = previewMap[previewKey as keyof typeof previewMap];
  return <Preview />;
}

export function ExampleLayoutPreview({ previewKey }: { previewKey: string }) {
  if (!Object.hasOwn(layoutPreviewMap, previewKey)) throw new Error(`Unknown layout preview key: ${previewKey}`);
  const Preview = layoutPreviewMap[previewKey as keyof typeof layoutPreviewMap];
  return <Preview />;
}
