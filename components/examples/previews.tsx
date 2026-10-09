'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
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
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Tabs } from '@/components/ui/tabs';
import { Table } from '@/components/ui/table';
import { Navigation } from '@/components/ui/navigation';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { NotFound } from '@/components/ui/not-found';
import { CopyButton } from '@/components/ui/copy-button';
import { Tooltip } from '@/components/ui/tooltip';
function ButtonSave() {
  const [saved, setSaved] = useState(false);
  return <><Button onClick={() => setSaved(true)}>Save settings</Button><span role="status">{saved ? 'Settings saved for this example.' : ''}</span></>;
}
function SpinnerProgress() { return <p role="status"><Spinner /> Preparing your preview…</p>; }
function LinkDocs() { return <Link href="/api/registry">Read the registry</Link>; }
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
function DialogPreview() { return <Dialog triggerLabel="Open preview settings" title="Preview settings"><p>Changes here stay in this preview.</p></Dialog>; }
function MenuActions() {
  const [message, setMessage] = useState('');
  return <><DropdownMenu triggerLabel="Preview actions" items={[{ id: 'save', label: 'Save preview' }, { id: 'reset', label: 'Reset preview' }]} onAction={id => setMessage(id === 'save' ? 'Preview saved for this example.' : 'Preview reset for this example.')} /><span role="status">{message}</span></>;
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
export const previewMap = {
  buttonSave: ButtonSave, spinnerProgress: SpinnerProgress, linkDocs: LinkDocs,
  cardProfile: CardProfile, badgeStatus: BadgeStatus, separatorSections: SeparatorSections,
  avatarMember: AvatarMember, alertRecovery: AlertRecovery, progressUpload: ProgressUpload, skeletonList: SkeletonList,
  inputEmail: InputEmail, textareaNotes: TextareaNotes, selectRole: SelectRole, checkboxArchive: CheckboxArchive,
  radioPlan: RadioPlan, switchNotifications: SwitchNotifications, labelName: LabelName, formFieldEmail: FormFieldEmail,
  dialogPreview: DialogPreview, menuActions: MenuActions, tabsOverview: TabsOverview, tooltipSave: TooltipSave, tableInvoices: TableInvoices, navigationPreview: NavigationPreview,
  loadingMembers: LoadingMembers, emptyProjects: EmptyProjects, errorRegistry: ErrorRegistry, notFoundComponent: NotFoundComponent, copyContext: CopyContext,
};
export const layoutPreviewMap = {};

export function ExamplePreview({ previewKey }: { previewKey: string }) {
  if (!Object.hasOwn(previewMap, previewKey)) throw new Error(`Unknown preview key: ${previewKey}`);
  const Preview = previewMap[previewKey as keyof typeof previewMap];
  return <Preview />;
}
