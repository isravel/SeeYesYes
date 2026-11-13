'use client';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Backdrop } from '@/components/ui/backdrop';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyButton } from '@/components/ui/copy-button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { menuExampleItems } from './menu-items';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormField } from '@/components/ui/form-field';
import { Fieldset } from '@/components/ui/fieldset';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/components/ui/link';
import { LoadingState } from '@/components/ui/loading-state';
import { Navigation } from '@/components/ui/navigation';
import { NotFound } from '@/components/ui/not-found';
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
import { Highlight } from '@/components/ui/highlight';
import { Level } from '@/components/ui/level';
import { LiveDot } from '@/components/ui/live-dot';
import { Kbd } from '@/components/ui/kbd';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { IconButton } from '@/components/ui/icon-button';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Chip } from '@/components/ui/chip';
import { CheckboxGroup } from '@/components/ui/checkbox-group';
import { Disclosure } from '@/components/ui/disclosure';
import { Accordion } from '@/components/ui/accordion';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Popover } from '@/components/ui/popover';
import { Drawer } from '@/components/ui/drawer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InputOtp } from '@/components/ui/input-otp';
import { Combobox } from '@/components/ui/combobox';
import { Toast } from '@/components/ui/toast';
import { AnimatedBadge } from '@/components/ui/animated-badge';
import { ShinyText } from '@/components/ui/shiny-text';
import { RotatingWord } from '@/components/ui/rotating-word';
import { MenuToggle } from '@/components/ui/menu-toggle';
import { Logo } from '@/components/ui/logo';
import { FancyArrow } from '@/components/ui/fancy-arrow';
import { TiltCard } from '@/components/ui/tilt-card';
import { CardSwap } from '@/components/ui/card-swap';
import { MediaFrame } from '@/components/ui/media-frame';
import { Carousel } from '@/components/ui/carousel';
import { ShareButtons } from '@/components/ui/share-buttons';
import { Footer } from '@/components/ui/footer';
import { SectionHead } from '@/components/ui/section-head';
import { StatStrip } from '@/components/ui/stat-strip';
import { CtaPanel } from '@/components/ui/cta-panel';
import { Navbar } from '@/components/ui/navbar';
import { Hero } from '@/components/ui/hero';
import { FeatureBento } from '@/components/ui/feature-bento';
import { Testimonials } from '@/components/ui/testimonials';
import { AppBadges } from '@/components/ui/app-badges';
import { Instructor } from '@/components/ui/instructor';
import { ListingHead } from '@/components/ui/listing-head';
import { Toolbar } from '@/components/ui/toolbar';
import { CardGrid } from '@/components/ui/card-grid';
import { ListCard } from '@/components/ui/list-card';
import { ClearFilters } from '@/components/ui/clear-filters';
import { CourseCard } from '@/components/ui/course-card';
import { EventCard } from '@/components/ui/event-card';
import { CohortCard } from '@/components/ui/cohort-card';
import { Plus } from '@phosphor-icons/react';
import { jsxProps, type Selection } from '@/lib/components/playground';

type AnyComponent = ComponentType<Record<string, unknown>>;
type Props = Record<string, unknown>;
type Children = { node: ReactNode; code: string };
export type Demo = {
  /** Contract states this demo can force on the real component, in display order. The rest are interaction states. */
  states: string[];
  element: AnyComponent;
  name: string;
  props: (variants: Selection, state: string) => Props;
  /** Props that are not simple attributes (functions, arrays); the code snippet shows `codeExtra` for them. */
  extra?: (state: string) => Props;
  codeExtra?: string;
  children?: (state: string) => Children;
  frame?: CSSProperties;
};
const as = (component: unknown) => component as AnyComponent;
const flag = (on: boolean) => on || undefined;
const text = (value: string): Children => ({ node: value, code: value });
const noop = () => undefined;

const control = (element: unknown, name: string, base: Props, states: string[], extra?: Partial<Demo>): Demo => ({
  element: as(element), name, states,
  props: (v, s) => ({ size: v.size, ...base, disabled: flag(s === 'disabled'), readOnly: flag(s === 'read-only'), 'aria-invalid': flag(s === 'invalid'), required: flag(s === 'required') }),
  ...extra,
});

const options = [{ value: 'basic', label: 'Basic' }, { value: 'team', label: 'Team' }];
const optionCode = '<option value="editor">Editor</option>\n  <option value="viewer">Viewer</option>';

export const demos: Record<string, Demo> = {
  button: { element: as(Button), name: 'Button', states: ['default', 'disabled', 'loading'], props: (v, s) => ({ variant: v.variant, size: v.size, disabled: flag(s === 'disabled'), loading: flag(s === 'loading') }), children: () => text('Save changes') },
  spinner: { element: as(Spinner), name: 'Spinner', states: ['default'], props: v => ({ size: v.size }) },
  link: { element: as(Link), name: 'Link', states: ['default'], props: v => ({ href: '/components', variant: v.variant }), children: () => text('Browse components') },
  card: { element: as(Card), name: 'Card', states: ['default'], props: v => ({ variant: v.variant }), children: () => ({ node: <><h3>Workspace settings</h3><p>Choose the defaults your team shares.</p></>, code: '<h3>Workspace settings</h3>\n  <p>Choose the defaults your team shares.</p>' }) },
  badge: { element: as(Badge), name: 'Badge', states: ['default'], props: v => ({ tone: v.tone }), children: () => text('Ready') },
  separator: { element: as(Separator), name: 'Separator', states: ['default', 'decorative', 'structural'], props: (v, s) => ({ orientation: v.orientation, decorative: flag(s === 'decorative') }), frame: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80, minWidth: 160 } },
  avatar: { element: as(Avatar), name: 'Avatar', states: ['fallback', 'image'], props: (v, s) => ({ initials: 'MC', alt: 'Maya Chen', size: v.size, src: s === 'image' ? '/sample-avatar.svg' : undefined }) },
  alert: { element: as(Alert), name: 'Alert', states: ['default'], props: v => ({ tone: v.tone, variant: v.variant, title: 'Heads up' }), children: () => text('Your changes stay in this preview.') },
  progress: { element: as(Progress), name: 'Progress', states: ['determinate', 'indeterminate'], props: (v, s) => ({ label: 'Uploading files', tone: v.tone, value: s === 'indeterminate' ? undefined : 68 }) },
  skeleton: { element: as(Skeleton), name: 'Skeleton', states: ['default'], props: v => ({ shape: v.shape }) },
  input: control(Input, 'Input', { type: 'email', 'aria-label': 'Email address', placeholder: 'name@example.com' }, ['default', 'disabled', 'read-only', 'invalid', 'required']),
  textarea: control(Textarea, 'Textarea', { 'aria-label': 'Notes', placeholder: 'Add a note' }, ['default', 'disabled', 'read-only', 'invalid', 'required']),
  select: control(Select, 'Select', { 'aria-label': 'Role', defaultValue: 'editor' }, ['default', 'disabled', 'invalid', 'required'], {
    children: () => ({ node: <><option value="editor">Editor</option><option value="viewer">Viewer</option></>, code: optionCode }),
  }),
  checkbox: { element: as(Checkbox), name: 'Checkbox', states: ['unchecked', 'checked', 'disabled', 'invalid', 'required'], props: (v, s) => ({ size: v.size, tone: v.tone, 'aria-label': 'Include archived projects', defaultChecked: flag(s === 'checked'), disabled: flag(s === 'disabled'), 'aria-invalid': flag(s === 'invalid'), required: flag(s === 'required') }) },
  'radio-group': { element: as(RadioGroup), name: 'RadioGroup', states: ['unselected', 'selected', 'disabled', 'invalid', 'required', 'help'],
    props: (v, s) => ({ name: 'demo-plan', label: 'Plan', orientation: v.orientation, defaultValue: s === 'selected' ? 'team' : undefined, disabled: flag(s === 'disabled'), required: flag(s === 'required'), error: s === 'invalid' ? 'Choose a plan to continue.' : undefined, helpText: s === 'help' ? 'You can change plans later.' : undefined }),
    extra: () => ({ options }), codeExtra: ' options={[{ value: "basic", label: "Basic" }, { value: "team", label: "Team" }]}' },
  switch: { element: as(Switch), name: 'Switch', states: ['off', 'on', 'disabled'], props: (v, s) => ({ label: 'Email notifications', size: v.size, tone: v.tone, defaultChecked: flag(s === 'on'), disabled: flag(s === 'disabled') }) },
  label: { element: as(Label), name: 'Label', states: ['default', 'required'], props: (_v, s) => ({ htmlFor: 'demo-email', required: flag(s === 'required') }), children: () => text('Email address') },
  'form-field': { element: as(FormField), name: 'FormField', states: ['default', 'help', 'error', 'required'],
    props: (_v, s) => ({ id: 'demo-field-email', label: 'Email address', helpText: s === 'help' ? 'We will send your receipt here.' : undefined, error: s === 'error' ? 'Enter a valid email address.' : undefined, required: flag(s === 'required') }),
    children: () => ({ node: <Input type="email" />, code: '<Input type="email" />' }) },
  fieldset: { element: as(Fieldset), name: 'Fieldset', states: ['default', 'help', 'invalid', 'required', 'disabled'],
    props: (_v, s) => ({ legend: 'Contact details', helpText: s === 'help' ? 'We only use these to confirm your order.' : undefined, error: s === 'invalid' ? 'Add at least one way to reach you.' : undefined, required: flag(s === 'required'), disabled: flag(s === 'disabled') }),
    children: () => ({ node: <><FormField id="demo-phone" label="Phone"><Input type="tel" /></FormField><FormField id="demo-contact-email" label="Email"><Input type="email" /></FormField></>, code: '<FormField id="phone" label="Phone"><Input type="tel" /></FormField>\n  <FormField id="email" label="Email"><Input type="email" /></FormField>' }) },
  dialog: { element: as(Dialog), name: 'Dialog', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Open settings', title: 'Preview settings', size: v.size, disabled: flag(s === 'disabled') }), children: () => ({ node: <p>Changes here stay in this preview.</p>, code: '<p>Changes here stay in this preview.</p>' }) },
  'dropdown-menu': { element: as(DropdownMenu), name: 'DropdownMenu', states: ['closed', 'disabled', 'empty'], props: (_v, s) => ({ triggerLabel: 'Actions', disabled: flag(s === 'disabled') }),
    extra: s => ({ items: s === 'empty' ? [] : menuExampleItems, onAction: noop }),
    codeExtra: ` items={[\n    { type: "group", id: "file", label: "File", items: [{ id: "save", label: "Save preview" }, { id: "duplicate", label: "Duplicate preview" }, { id: "archive", label: "Archive preview", disabled: true }] },\n    { type: "separator", id: "after-file" },\n    { type: "group", id: "help", label: "Help", items: [{ id: "docs", label: "Accessibility guide", href: "/docs/accessibility" }, { id: "aria", label: "React Aria menu guide", href: "https://react-aria.adobe.com/Menu", external: true }] },\n    { type: "separator", id: "before-delete" },\n    { id: "delete", label: "Delete preview", destructive: true },\n  ]} onAction={handleAction}` },
  tabs: { element: as(Tabs), name: 'Tabs', states: ['default', 'disabled'], props: (v) => ({ label: 'Preview details', orientation: v.orientation, activation: v.activation, variant: v.variant }),
    extra: s => ({ items: [{ id: 'overview', label: 'Overview', content: 'A shared starting point.' }, { id: 'tokens', label: 'Tokens', content: 'Semantic values from the theme.' }, { id: 'rules', label: 'Rules', content: 'Guidance for builders.', disabled: s === 'disabled' }] }), codeExtra: ' items={items}' },
  tooltip: { element: as(Tooltip), name: 'Tooltip', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Save preview', content: 'Only this preview is saved.', placement: v.placement, disabled: flag(s === 'disabled') }), extra: () => ({ onPress: noop }), codeExtra: ' onPress={handleSave}', frame: { padding: 48 } },
  table: { element: as(Table), name: 'Table', states: ['default', 'empty'], props: v => ({ caption: 'Recent invoices', header: v.header, emptyMessage: 'No invoices yet.' }),
    extra: s => ({ columns: [{ id: 'invoice', label: 'Invoice', rowHeader: true }, { id: 'status', label: 'Status' }], rows: s === 'empty' ? [] : [{ id: '104', cells: { invoice: 'INV-104', status: 'Paid' } }, { id: '105', cells: { invoice: 'INV-105', status: 'Pending' } }] }), codeExtra: ' columns={columns} rows={rows}' },
  navigation: { element: as(Navigation), name: 'Navigation', states: ['desktop'], props: () => ({ label: 'Example navigation', showSkipLink: false, triggerLabel: 'Open example navigation', currentHref: '#overview', mainId: 'main' }),
    extra: () => ({ groups: [{ label: 'Explore', items: [{ label: 'Overview', href: '#overview' }, { label: 'Components', href: '#components' }] }] }), codeExtra: ' groups={groups}' },
  'loading-state': { element: as(LoadingState), name: 'LoadingState', states: ['default'], props: v => ({ label: 'Loading team members', description: 'Checking the shared workspace.', variant: v.variant }) },
  'empty-state': { element: as(EmptyState), name: 'EmptyState', states: ['empty', 'action'], props: () => ({ title: 'No projects yet', description: 'Create a project to keep related work together.' }),
    extra: s => s === 'action' ? { action: <Button>Create project</Button> } : {}, codeExtra: '', },
  'error-state': { element: as(ErrorState), name: 'ErrorState', states: ['error'], props: () => ({ title: 'Could not load components', message: 'The preview could not reach the component registry.' }), extra: () => ({ onRetry: noop }), codeExtra: ' onRetry={retry}' },
  'not-found': { element: as(NotFound), name: 'NotFound', states: ['not-found'], props: () => ({ title: 'Component not found', description: 'That component is not in this registry.', homeHref: '/components', homeLabel: 'Browse components', headingLevel: 2 }) },
  backdrop: { element: as(Backdrop), name: 'Backdrop', states: ['default'], props: v => ({ variant: v.variant }), children: () => ({ node: <Card><h3>Glass panel</h3><p>Text stays crisp over a tinted surface.</p></Card>, code: '<Card>\n    <h3>Glass panel</h3>\n    <p>Text stays crisp over a tinted surface.</p>\n  </Card>' }) },
  'theme-switcher': { element: as(ThemeSwitcher), name: 'ThemeSwitcher', states: ['default'], props: v => ({ variant: v.variant, size: v.size }) },
  highlight: { element: as(Highlight), name: 'Highlight', states: ['default'], props: () => ({}), children: () => text('every saved theme'), frame: { padding: 8 } },
  level: { element: as(Level), name: 'Level', states: ['default'], props: v => ({ tone: v.tone }), children: () => text('Medium') },
  'live-dot': { element: as(LiveDot), name: 'LiveDot', states: ['static', 'animated'], props: (v, s) => ({ status: v.status, size: v.size, animated: flag(s === 'animated') }), children: (s) => text(s === 'animated' ? 'Live now' : 'Status') },
  kbd: { element: as(Kbd), name: 'Kbd', states: ['default'], props: v => ({ size: v.size }), extra: () => ({ keys: ['Ctrl', 'K'] }), codeExtra: ' keys={["Ctrl", "K"]}' },
  'avatar-group': { element: as(AvatarGroup), name: 'AvatarGroup', states: ['default', 'overflow-list'], props: v => ({ label: 'Project members', size: v.size }),
    extra: s => ({ people: [{ initials: 'MC', alt: 'Maya Chen' }, { initials: 'AB', alt: 'Ada Bell' }, { initials: 'JO', alt: 'Jon Ortiz' }, { initials: 'LK', alt: 'Lena Koh' }, { initials: 'TS', alt: 'Tariq Shah' }, { initials: 'NP', alt: 'Nia Park' }], ...(s === 'overflow-list' ? { overflowContent: <ul><li>Tariq Shah</li><li>Nia Park</li></ul> } : {}) }), codeExtra: ' people={people}' },
  'icon-button': { element: as(IconButton), name: 'IconButton', states: ['default', 'disabled', 'loading', 'pressed'], props: (v, s) => ({ label: 'Add member', variant: v.variant, size: v.size, disabled: flag(s === 'disabled'), loading: flag(s === 'loading'), pressed: s === 'pressed' ? true : undefined }),
    extra: () => ({ icon: <Plus />, tooltip: 'Add member' }), codeExtra: ' icon={<Plus />} tooltip="Add member"' },
  'search-input': { element: as(SearchInput), name: 'SearchInput', states: ['empty', 'filled', 'searching', 'disabled', 'read-only', 'invalid'],
    props: (v, s) => ({ label: 'Search members', size: v.size, placeholder: 'Search members', defaultValue: s === 'filled' || s === 'searching' ? 'Maya' : undefined, searching: flag(s === 'searching'), disabled: flag(s === 'disabled'), readOnly: flag(s === 'read-only'), 'aria-invalid': flag(s === 'invalid') }) },
  segmented: { element: as(Segmented), name: 'Segmented', states: ['default', 'disabled'], props: (v, s) => ({ label: 'View', size: v.size, defaultValue: 'list', disabled: flag(s === 'disabled'), name: 'demo-view' }),
    extra: () => ({ options: [{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'map', label: 'Map' }] }), codeExtra: ' options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }, { value: "map", label: "Map" }]}' },
  chip: { element: as(Chip), name: 'Chip', states: ['static', 'selectable', 'selected', 'removable', 'removing', 'invalid', 'disabled'],
    props: (v, s) => ({ tone: v.tone, size: v.size, defaultSelected: flag(s === 'selected'), removing: flag(s === 'removing'), error: s === 'invalid' ? 'Could not remove. Try again.' : undefined, disabled: flag(s === 'disabled'), onSelectedChange: undefined }),
    extra: s => s === 'selectable' || s === 'selected' ? { onSelectedChange: noop } : s === 'removable' || s === 'removing' || s === 'invalid' ? { onRemove: noop } : {},
    codeExtra: '', children: () => text('Design') },
  'checkbox-group': { element: as(CheckboxGroup), name: 'CheckboxGroup', states: ['empty', 'some-selected', 'all-selected', 'disabled', 'invalid', 'required', 'help'],
    props: (v, s) => ({ name: 'demo-channels', label: 'Notify me by', orientation: v.orientation, size: v.size, defaultValue: s === 'some-selected' ? ['email'] : s === 'all-selected' ? ['email', 'sms', 'push'] : undefined, disabled: flag(s === 'disabled'), required: flag(s === 'required'), error: s === 'invalid' ? 'Choose at least one.' : undefined, helpText: s === 'help' ? 'You can change this later.' : undefined }),
    extra: () => ({ options: [{ value: 'email', label: 'Email' }, { value: 'sms', label: 'Text message', hint: 'Carrier rates may apply.' }, { value: 'push', label: 'Push' }] }), codeExtra: ' options={[{ value: "email", label: "Email" }, { value: "sms", label: "Text message", hint: "Carrier rates may apply." }, { value: "push", label: "Push" }]}' },
  'input-otp': { element: as(InputOtp), name: 'InputOtp', states: ['empty', 'partial', 'complete', 'invalid', 'disabled', 'read-only'],
    props: (v, s) => ({ name: 'demo-code', label: 'Verification code', helpText: 'Enter the 6-digit code we sent you.', size: v.size, defaultValue: s === 'partial' ? '123' : s === 'complete' || s === 'read-only' ? '123456' : undefined, error: s === 'invalid' ? 'That code is not right. Check it and try again.' : undefined, disabled: flag(s === 'disabled'), readOnly: flag(s === 'read-only') }) },
  combobox: { element: as(Combobox), name: 'Combobox', states: ['empty', 'filled', 'loading', 'invalid', 'disabled', 'read-only'],
    props: (v, s) => ({ name: 'demo-country', label: 'Country', placeholder: 'Search countries', helpText: 'Type to filter, then choose one.', size: v.size, defaultValue: s === 'filled' || s === 'read-only' ? 'jp' : undefined, loading: flag(s === 'loading'), error: s === 'invalid' ? 'Choose a country from the list.' : undefined, disabled: flag(s === 'disabled'), readOnly: flag(s === 'read-only') }),
    extra: () => ({ options: [{ value: 'in', label: 'India', group: 'Asia' }, { value: 'jp', label: 'Japan', group: 'Asia' }, { value: 'fr', label: 'France', group: 'Europe' }] }), codeExtra: ' options={[{ value: "in", label: "India", group: "Asia" }, { value: "jp", label: "Japan", group: "Asia" }, { value: "fr", label: "France", group: "Europe" }]}' },
  disclosure: { element: as(Disclosure), name: 'Disclosure', states: ['collapsed', 'expanded', 'disabled'], props: (_v, s) => ({ label: 'Shipping details', defaultOpen: flag(s === 'expanded'), disabled: flag(s === 'disabled') }), children: () => ({ node: <p>Orders ship within two business days.</p>, code: '<p>Orders ship within two business days.</p>' }) },
  accordion: { element: as(Accordion), name: 'Accordion', states: ['collapsed', 'expanded', 'disabled'], props: v => ({ mode: v.mode }),
    extra: s => ({ defaultValue: s === 'expanded' ? ['shipping'] : undefined, items: [{ id: 'shipping', label: 'Shipping', content: 'Orders ship within two business days.' }, { id: 'returns', label: 'Returns', content: 'Return items within thirty days.' }, { id: 'support', label: 'Support', content: 'Write to us any time.', disabled: s === 'disabled' }] }), codeExtra: ' items={items}' },
  pagination: { element: as(Pagination), name: 'Pagination', states: ['default', 'first', 'last'], props: (v, s) => ({ label: 'Example pages', pageCount: 12, defaultPage: s === 'first' ? 1 : s === 'last' ? 12 : 6, size: v.size }) },
  breadcrumbs: { element: as(Breadcrumbs), name: 'Breadcrumbs', states: ['default'], props: v => ({ label: 'Example trail', separator: v.separator }),
    extra: () => ({ items: [{ label: 'Components', href: '/components' }, { label: 'Navigation', href: '/components?category=navigation' }, { label: 'Breadcrumbs', href: '/components/breadcrumbs' }] }), codeExtra: ' items={items}' },
  popover: { element: as(Popover), name: 'Popover', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Filter options', label: 'Filter options', placement: v.placement, disabled: flag(s === 'disabled') }), children: () => ({ node: <p>Filters apply to this list only.</p>, code: '<p>Filters apply to this list only.</p>' }), frame: { padding: 48 } },
  drawer: { element: as(Drawer), name: 'Drawer', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Open filters', title: 'Filters', side: v.side, size: v.size, disabled: flag(s === 'disabled') }), children: () => ({ node: <p>Filters apply to this list only.</p>, code: '<p>Filters apply to this list only.</p>' }) },
  'confirm-dialog': { element: as(ConfirmDialog), name: 'ConfirmDialog', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Remove member', title: 'Remove Ada Bell?', confirmLabel: 'Remove member', destructive: true, size: v.size, disabled: flag(s === 'disabled') }),
    extra: () => ({ onConfirm: noop }), codeExtra: ' onConfirm={() => undefined}', children: () => ({ node: <p>Ada Bell loses access to this workspace.</p>, code: '<p>Ada Bell loses access to this workspace.</p>' }) },
  toast: { element: as(Toast), name: 'Toast', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Save changes', message: 'Changes saved.', tone: v.tone, position: v.position, disabled: flag(s === 'disabled') }) },
  'animated-badge': { element: as(AnimatedBadge), name: 'AnimatedBadge', states: ['static', 'animating'], props: (_v, s) => ({ tone: 'primary', animated: flag(s === 'animating') }), children: () => text('New') },
  'shiny-text': { element: as(ShinyText), name: 'ShinyText', states: ['static', 'animating'], props: (_v, s) => ({ animated: flag(s === 'animating') }), children: () => text('Ship faster'), frame: { padding: 8 } },
  'rotating-word': { element: as(RotatingWord), name: 'RotatingWord', states: ['static', 'cycling'], props: (_v, s) => ({ animated: flag(s === 'cycling') }), extra: () => ({ words: ['teams', 'designers', 'agents'] }), codeExtra: ' words={["teams", "designers", "agents"]}', frame: { padding: 8 } },
  'menu-toggle': { element: as(MenuToggle), name: 'MenuToggle', states: ['collapsed', 'expanded', 'disabled'], props: (v, s) => ({ label: 'Menu', size: v.size, defaultExpanded: flag(s === 'expanded'), disabled: flag(s === 'disabled') }) },
  logo: { element: as(Logo), name: 'Logo', states: ['static', 'animating'], props: (v, s) => ({ label: 'Acme', src: '/sample-mark.svg', wordmark: 'Acme', size: v.size, animated: flag(s === 'animating') }), frame: { padding: 8 } },
  'fancy-arrow': { element: as(FancyArrow), name: 'FancyArrow', states: ['decorative', 'named'], props: (v, s) => ({ src: '/sample-arrow.svg', placement: v.placement, direction: v.direction, alt: s === 'named' ? 'Next step' : undefined }), frame: { position: 'relative', minHeight: 96, minWidth: 160, padding: 8 } },
  'tilt-card': { element: as(TiltCard), name: 'TiltCard', states: ['rest', 'tilting'], props: (_v, s) => ({ tilt: flag(s === 'tilting') }), children: () => ({ node: <><h3>Featured</h3><p>Move a mouse over the card to lean it.</p></>, code: '<h3>Featured</h3>\n  <p>Move a mouse over the card to lean it.</p>' }) },
  'card-swap': { element: as(CardSwap), name: 'CardSwap', states: ['front'], props: () => ({ label: 'Highlights' }),
    extra: () => ({ items: [{ id: 'fast', content: <p>Fast to set up.</p> }, { id: 'accessible', content: <p>Keyboard friendly.</p> }, { id: 'themed', content: <p>Themed from one place.</p> }] }),
    codeExtra: ' items={[{ id: "fast", content: <p>Fast to set up.</p> }, { id: "accessible", content: <p>Keyboard friendly.</p> }]}' },
  carousel: { element: as(Carousel), name: 'Carousel', states: ['manual', 'autoplay'], props: (_v, s) => ({ label: 'Featured', peek: true, autoplay: flag(s === 'autoplay') }),
    extra: () => ({ items: [{ id: 'setup', content: <Card><h3>Set up</h3><p>Install and theme in minutes.</p></Card> }, { id: 'build', content: <Card><h3>Build</h3><p>Compose pages from tested parts.</p></Card> }, { id: 'ship', content: <Card><h3>Ship</h3><p>Check contrast and keyboard use first.</p></Card> }] }),
    codeExtra: ' items={[{ id: "setup", content: <p>Set up</p> }, { id: "build", content: <p>Build</p> }, { id: "ship", content: <p>Ship</p> }]}' },
  'media-frame': { element: as(MediaFrame), name: 'MediaFrame', states: ['loaded', 'error'], props: (v, s) => ({ src: s === 'error' ? '/unavailable-media.png' : '/sample-media.svg', alt: 'A green hillside under a pale sky', ratio: v.ratio, fit: v.fit, hover: v.hover, caption: 'Hillside at midday' }) },
  'share-buttons': { element: as(ShareButtons), name: 'ShareButtons', states: ['default', 'unavailable'], props: (v, s) => ({ url: s === 'unavailable' ? 'mailto:team@example.com' : 'https://example.com/guides/getting-started', title: 'Getting started', size: v.size }) },
  footer: { element: as(Footer), name: 'Footer', states: ['static'], props: () => ({ legal: '© Acme' }),
    extra: () => ({ identity: <p>Acme helps teams ship consistent interfaces.</p>, columns: [{ id: 'product', heading: 'Product', links: [{ label: 'Components', href: '/components' }, { label: 'Docs', href: '/docs' }] }, { id: 'company', heading: 'Company', links: [{ label: 'Publisher site', href: 'https://example.com', external: true }] }] }),
    codeExtra: ' identity={<p>Acme helps teams ship consistent interfaces.</p>} columns={[{ id: "product", heading: "Product", links: [{ label: "Components", href: "/components" }] }]}' },
  'section-head': { element: as(SectionHead), name: 'SectionHead', states: ['with-link', 'heading-only'], props: (_v, s) => ({ heading: 'Featured guides', subtitle: 'Start with the basics.', viewAllHref: s === 'with-link' ? '/docs' : undefined }) },
  'stat-strip': { element: as(StatStrip), name: 'StatStrip', states: ['static', 'missing-value'], props: () => ({}),
    extra: (s) => ({ items: [{ id: 'members', label: 'Team members', value: '24' }, { id: 'projects', label: 'Active projects', value: '9' }, s === 'missing-value' ? { id: 'regions', label: 'Regions' } : { id: 'regions', label: 'Regions', value: '3' }] }),
    codeExtra: ' items={[{ id: "members", label: "Team members", value: "24" }, { id: "projects", label: "Active projects", value: "9" }]}' },
  'cta-panel': { element: as(CtaPanel), name: 'CtaPanel', states: ['default', 'textured'], props: (_v, s) => ({ heading: 'Ready to start?', description: 'Create a workspace in a minute.', texture: flag(s === 'textured') }),
    extra: () => ({ action: <Button>Create project</Button> }) },
  navbar: { element: as(Navbar), name: 'Navbar', states: ['default', 'menu-open'], props: (_v, s) => ({ label: 'Main', currentHref: '/docs', sticky: false, defaultMenuOpen: flag(s === 'menu-open') }),
    extra: () => ({ brand: <Logo label="Acme" wordmark="Acme" />, groups: [{ id: 'main', links: [{ label: 'Components', href: '/components' }, { label: 'Docs', href: '/docs' }] }], actions: <Button>Get started</Button> }),
    codeExtra: ' brand={<Link href="/">Acme</Link>} groups={[{ id: "main", links: [{ label: "Docs", href: "/docs" }] }]}' },
  hero: { element: as(Hero), name: 'Hero', states: ['centered', 'split'], props: (v) => ({ level: 2, heading: 'Ship a consistent interface', lead: 'Reusable parts that keep every screen accessible.', layout: v.layout }),
    extra: (s) => ({ actions: <Button>Get started</Button>, ...(s === 'split' ? { media: <MediaFrame src="/sample-media.svg" alt="A green hillside under a pale sky" /> } : {}) }) },
  'feature-bento': { element: as(FeatureBento), name: 'FeatureBento', states: ['static', 'with-link'], props: (v) => ({ label: 'Highlights', layout: v.layout }),
    extra: (s) => ({ items: [{ id: 'tokens', title: 'Shared tokens', description: 'One source for color and spacing.', href: s === 'with-link' ? '/system/tokens' : undefined }, { id: 'a11y', title: 'Keyboard friendly', badge: 'Built in' }, { id: 'docs', title: 'Readable contracts' }] }),
    codeExtra: ' items={[{ id: "tokens", title: "Shared tokens" }, { id: "docs", title: "Readable contracts" }]}' },
  testimonials: { element: as(Testimonials), name: 'Testimonials', states: ['story', 'review', 'video-unavailable'], props: () => ({}),
    extra: (s) => ({ items: [
      ...(s === 'review' ? [] : [{ kind: 'story', id: 'story-1', src: s === 'video-unavailable' ? '/unavailable-story.webm' : '/sample-story.webm', title: 'How we adopted it', author: { name: 'Sam Okoye' }, captions: { src: '/sample-captions.vtt', srclang: 'en' } }]),
      { kind: 'review', id: 'review-1', quote: 'Setup took an afternoon.', author: { name: 'Priya Nair', role: 'Engineering lead' } },
    ] }),
    codeExtra: ' items={[{ kind: "review", id: "review-1", quote: "Setup took an afternoon.", author: { name: "Priya Nair" } }]}' },
  'app-badges': { element: as(AppBadges), name: 'AppBadges', states: ['default', 'image-unavailable'], props: (v) => ({ size: v.size }),
    extra: (s) => ({ badges: [{ id: 'ios', store: 'app-store', href: 'https://example.com/ios', src: s === 'image-unavailable' ? '/unavailable-badge.svg' : '/sample-badge.svg' }, { id: 'android', store: 'google-play', href: 'https://example.com/android', src: '/sample-badge.svg' }] }),
    codeExtra: ' badges={[{ id: "ios", store: "app-store", href: "https://example.com/ios", src: "/sample-badge.svg" }]}' },
  instructor: { element: as(Instructor), name: 'Instructor', states: ['with-portrait', 'text-only', 'portrait-unavailable'], props: () => ({ name: 'Maya Chen', role: 'Lead instructor' }),
    extra: (s) => ({ bio: <p>Maya teaches interface design.</p>, socials: [{ id: 'site', label: 'Website', href: 'https://example.com' }], ...(s === 'text-only' ? {} : { portrait: { src: s === 'portrait-unavailable' ? '/unavailable-portrait.png' : '/sample-avatar.svg', alt: 'Portrait of Maya Chen' } }) }) },
  'listing-head': { element: as(ListingHead), name: 'ListingHead', states: ['count-known', 'count-unknown', 'loading'], props: (_v, s) => ({ heading: 'Courses', description: 'Pick up where you left off.', count: s === 'count-known' ? 12 : undefined, loading: flag(s === 'loading') }) },
  toolbar: { element: as(Toolbar), name: 'Toolbar', states: ['default', 'pending'], props: (_v, s) => ({ pending: flag(s === 'pending') }),
    extra: () => ({ search: <SearchInput label="Search courses" />, sort: <Select aria-label="Sort by" defaultValue="title"><option value="title">Title</option><option value="price">Price</option></Select>, view: <Segmented label="View" defaultValue="grid" options={[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]} />, clear: <ClearFilters active onClear={noop} /> }),
    codeExtra: ' search={<SearchInput label="Search courses" />} clear={<ClearFilters active onClear={clear} />}' },
  'card-grid': { element: as(CardGrid), name: 'CardGrid', states: ['ready', 'loading', 'error', 'empty', 'no-matches'], props: (v, s) => ({ view: v.view, status: s === 'loading' || s === 'error' ? s : undefined, filtered: flag(s === 'no-matches') }),
    extra: s => ({ items: s === 'empty' || s === 'no-matches' ? [] : [{ id: 'a', content: <ListCard title="Design basics" description="Start here." href="/courses/design-basics" /> }, { id: 'b', content: <ListCard title="Advanced layout" href="/courses/advanced-layout" /> }, { id: 'c', content: <ListCard title="Color and contrast" href="/courses/color" /> }], ...(s === 'error' ? { error: 'The course list could not be loaded.', onRetry: noop } : {}) }),
    codeExtra: ' items={[{ id: "a", content: <ListCard title="Design basics" href="/courses/design-basics" /> }]}' },
  'list-card': { element: as(ListCard), name: 'ListCard', states: ['static', 'linked'], props: (_v, s) => ({ title: 'Design basics', meta: '6 lessons', description: 'Start here.', href: s === 'linked' ? '/courses/design-basics' : undefined }),
    extra: () => ({ media: <MediaFrame src="/sample-media.svg" alt="A green hillside under a pale sky" ratio="4:3" /> }), codeExtra: ' media={<MediaFrame src="/sample-media.svg" alt="A green hillside under a pale sky" ratio="4:3" />}' },
  'clear-filters': { element: as(ClearFilters), name: 'ClearFilters', states: ['active', 'inactive'], props: (v, s) => ({ active: s === 'active', appearance: v.appearance }), extra: () => ({ onClear: noop }), codeExtra: ' onClear={clear}' },
  'course-card': { element: as(CourseCard), name: 'CourseCard', states: ['complete', 'minimal', 'image-unavailable'], props: (v, s) => ({ title: 'Design basics', href: '/courses/design-basics', layout: v.layout, description: s === 'minimal' ? undefined : 'Learn the building blocks.' }),
    extra: s => s === 'minimal' ? {} : { image: { src: s === 'image-unavailable' ? '/unavailable-media.png' : '/sample-media.svg', alt: 'A green hillside under a pale sky' }, badges: ['Bestseller'], rating: { value: '4.6', label: 'Rated 4.6 out of 5 from 1,280 reviews' }, chips: ['Layout', 'Color'], price: { current: '$49', original: '$99', saving: 'Save 50%' } },
    codeExtra: ' image={{ src: "/sample-media.svg", alt: "A green hillside under a pale sky" }} price={{ current: "$49", original: "$99", saving: "Save 50%" }}' },
  'event-card': { element: as(EventCard), name: 'EventCard', states: ['complete', 'minimal', 'poster-unavailable'], props: (_v, s) => ({ title: 'Design systems meetup', href: '/events/design-systems-meetup', date: '14 March 2026', dateTime: '2026-03-14', time: s === 'minimal' ? undefined : '6:30 pm', location: s === 'minimal' ? undefined : 'Community hall, Chennai', description: s === 'minimal' ? undefined : 'An evening of short talks.' }),
    extra: s => ({ poster: { src: s === 'poster-unavailable' ? '/unavailable-poster.png' : '/sample-media.svg', alt: 'Poster: Design systems meetup', width: 3, height: 4 } }), codeExtra: ' poster={{ src: "/sample-media.svg", alt: "Poster: Design systems meetup", width: 3, height: 4 }}' },
  'cohort-card': { element: as(CohortCard), name: 'CohortCard', states: ['static', 'tilt', 'textured', 'tool-unavailable'], props: (_v, s) => ({ title: 'Spring design cohort', href: '/cohorts/spring-design', status: 'Enrolling', statusTone: 'success', description: 'Eight weeks of guided practice.', tilt: flag(s === 'tilt'), texture: flag(s === 'textured') }),
    extra: s => ({ tools: [{ id: 'mark', label: 'Design tool', src: s === 'tool-unavailable' ? '/unavailable-tool.svg' : '/sample-mark.svg' }] }), codeExtra: ' tools={[{ id: "mark", label: "Design tool", src: "/sample-mark.svg" }]}' },
  'copy-button': { element: as(CopyButton), name: 'CopyButton', states: ['idle', 'disabled'], props: (_v, s) => ({ label: 'sample context', value: 'Component: Button', disabled: flag(s === 'disabled') }) },
};

export function renderDemo(id: string, variants: Selection, state: string): ReactNode {
  const demo = demos[id];
  if (!demo) return null;
  const Element = demo.element;
  const children = demo.children?.(state);
  const body = <Element {...demo.props(variants, state)} {...demo.extra?.(state)}>{children?.node}</Element>;
  return demo.frame ? <div style={demo.frame}>{body}</div> : body;
}

/** Code for exactly the props the preview renders, so the two cannot disagree. */
export function demoCode(id: string, variants: Selection, state: string): string {
  const demo = demos[id];
  if (!demo) return '';
  const children = demo.children?.(state);
  const extraProps = demo.extra?.(state) ?? {};
  const actionCode = 'action' in extraProps ? ' action={<Button>Create project</Button>}' : '';
  const opening = `<${demo.name}${jsxProps(demo.props(variants, state))}${demo.codeExtra ?? ''}${actionCode}`;
  return children ? `${opening}>\n  ${children.code}\n</${demo.name}>` : `${opening} />`;
}
