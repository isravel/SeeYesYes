'use client';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CopyButton } from '@/components/ui/copy-button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FormField } from '@/components/ui/form-field';
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
  alert: { element: as(Alert), name: 'Alert', states: ['default'], props: v => ({ tone: v.tone, title: 'Heads up' }), children: () => text('Your changes stay in this preview.') },
  progress: { element: as(Progress), name: 'Progress', states: ['determinate', 'indeterminate'], props: (_v, s) => ({ label: 'Uploading files', value: s === 'indeterminate' ? undefined : 68 }) },
  skeleton: { element: as(Skeleton), name: 'Skeleton', states: ['default'], props: v => ({ shape: v.shape }) },
  input: control(Input, 'Input', { type: 'email', 'aria-label': 'Email address', placeholder: 'name@example.com' }, ['default', 'disabled', 'read-only', 'invalid', 'required']),
  textarea: control(Textarea, 'Textarea', { 'aria-label': 'Notes', placeholder: 'Add a note' }, ['default', 'disabled', 'read-only', 'invalid', 'required']),
  select: control(Select, 'Select', { 'aria-label': 'Role', defaultValue: 'editor' }, ['default', 'disabled', 'invalid', 'required'], {
    children: () => ({ node: <><option value="editor">Editor</option><option value="viewer">Viewer</option></>, code: optionCode }),
  }),
  checkbox: { element: as(Checkbox), name: 'Checkbox', states: ['unchecked', 'checked', 'disabled', 'invalid', 'required'], props: (v, s) => ({ size: v.size, 'aria-label': 'Include archived projects', defaultChecked: flag(s === 'checked'), disabled: flag(s === 'disabled'), 'aria-invalid': flag(s === 'invalid'), required: flag(s === 'required') }) },
  'radio-group': { element: as(RadioGroup), name: 'RadioGroup', states: ['unselected', 'selected', 'disabled', 'invalid', 'required', 'help'],
    props: (v, s) => ({ name: 'demo-plan', label: 'Plan', orientation: v.orientation, defaultValue: s === 'selected' ? 'team' : undefined, disabled: flag(s === 'disabled'), required: flag(s === 'required'), error: s === 'invalid' ? 'Choose a plan to continue.' : undefined, helpText: s === 'help' ? 'You can change plans later.' : undefined }),
    extra: () => ({ options }), codeExtra: ' options={[{ value: "basic", label: "Basic" }, { value: "team", label: "Team" }]}' },
  switch: { element: as(Switch), name: 'Switch', states: ['off', 'on', 'disabled'], props: (v, s) => ({ label: 'Email notifications', size: v.size, defaultChecked: flag(s === 'on'), disabled: flag(s === 'disabled') }) },
  label: { element: as(Label), name: 'Label', states: ['default', 'required'], props: (_v, s) => ({ htmlFor: 'demo-email', required: flag(s === 'required') }), children: () => text('Email address') },
  'form-field': { element: as(FormField), name: 'FormField', states: ['default', 'help', 'error', 'required'],
    props: (_v, s) => ({ id: 'demo-field-email', label: 'Email address', helpText: s === 'help' ? 'We will send your receipt here.' : undefined, error: s === 'error' ? 'Enter a valid email address.' : undefined, required: flag(s === 'required') }),
    children: () => ({ node: <Input type="email" />, code: '<Input type="email" />' }) },
  dialog: { element: as(Dialog), name: 'Dialog', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Open settings', title: 'Preview settings', size: v.size, disabled: flag(s === 'disabled') }), children: () => ({ node: <p>Changes here stay in this preview.</p>, code: '<p>Changes here stay in this preview.</p>' }) },
  'dropdown-menu': { element: as(DropdownMenu), name: 'DropdownMenu', states: ['closed', 'disabled', 'empty'], props: (_v, s) => ({ triggerLabel: 'Actions', disabled: flag(s === 'disabled') }),
    extra: s => ({ items: s === 'empty' ? [] : [{ id: 'save', label: 'Save' }, { id: 'reset', label: 'Reset' }], onAction: noop }), codeExtra: ' items={items} onAction={handleAction}' },
  tabs: { element: as(Tabs), name: 'Tabs', states: ['default', 'disabled'], props: (v) => ({ label: 'Preview details', orientation: v.orientation, activation: v.activation }),
    extra: s => ({ items: [{ id: 'overview', label: 'Overview', content: 'A shared starting point.' }, { id: 'tokens', label: 'Tokens', content: 'Semantic values from the theme.' }, { id: 'rules', label: 'Rules', content: 'Guidance for builders.', disabled: s === 'disabled' }] }), codeExtra: ' items={items}' },
  tooltip: { element: as(Tooltip), name: 'Tooltip', states: ['closed', 'disabled'], props: (v, s) => ({ triggerLabel: 'Save preview', content: 'Only this preview is saved.', placement: v.placement, disabled: flag(s === 'disabled') }), extra: () => ({ onPress: noop }), codeExtra: ' onPress={handleSave}', frame: { padding: 48 } },
  table: { element: as(Table), name: 'Table', states: ['default', 'empty'], props: () => ({ caption: 'Recent invoices', emptyMessage: 'No invoices yet.' }),
    extra: s => ({ columns: [{ id: 'invoice', label: 'Invoice', rowHeader: true }, { id: 'status', label: 'Status' }], rows: s === 'empty' ? [] : [{ id: '104', cells: { invoice: 'INV-104', status: 'Paid' } }, { id: '105', cells: { invoice: 'INV-105', status: 'Pending' } }] }), codeExtra: ' columns={columns} rows={rows}' },
  navigation: { element: as(Navigation), name: 'Navigation', states: ['desktop'], props: () => ({ label: 'Example navigation', showSkipLink: false, triggerLabel: 'Open example navigation', currentHref: '#overview', mainId: 'main' }),
    extra: () => ({ groups: [{ label: 'Explore', items: [{ label: 'Overview', href: '#overview' }, { label: 'Components', href: '#components' }] }] }), codeExtra: ' groups={groups}' },
  'loading-state': { element: as(LoadingState), name: 'LoadingState', states: ['default'], props: v => ({ label: 'Loading team members', description: 'Checking the shared workspace.', variant: v.variant }) },
  'empty-state': { element: as(EmptyState), name: 'EmptyState', states: ['empty', 'action'], props: () => ({ title: 'No projects yet', description: 'Create a project to keep related work together.' }),
    extra: s => s === 'action' ? { action: <Button>Create project</Button> } : {}, codeExtra: '', },
  'error-state': { element: as(ErrorState), name: 'ErrorState', states: ['error'], props: () => ({ title: 'Could not load components', message: 'The preview could not reach the component registry.' }), extra: () => ({ onRetry: noop }), codeExtra: ' onRetry={retry}' },
  'not-found': { element: as(NotFound), name: 'NotFound', states: ['not-found'], props: () => ({ title: 'Component not found', description: 'That component is not in this registry.', homeHref: '/components', homeLabel: 'Browse components', headingLevel: 2 }) },
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
