import type { ComponentContract, Example } from '@/lib/contract/schema';
const moduleName = (name: string) => `@/components/ui/${name}`;
function contract(input: {
  id: string; name: string; category: ComponentContract['category']; purpose: string;
  shortPurpose: string; semantics: ComponentContract['semantics']; props: ComponentContract['props'];
  variants?: ComponentContract['variants']; tokenIds: string[]; exampleId: string;
  previewKey: string; code: string; prohibitedUsage: string[];
  requirements: string[]; states?: string[];
}): { component: ComponentContract; example: Example } {
  const { exampleId, previewKey, code, requirements, ...details } = input;
  const component: ComponentContract = {
    ...details, publicImport: { module: moduleName(details.id), exportName: details.name },
    maturity: 'experimental', interactive: false,
    anatomy: [{ part: 'root', description: details.semantics.meaning }],
    variants: details.variants ?? {}, compoundVariants: [], themeDefaults: {
      ...(details.variants?.variant ? { variant: details.variants.variant } : {}),
      ...(details.variants?.size ? { size: details.variants.size } : {}),
    },
    states: details.states ?? ['default'],
    accessibility: { status: 'not-reviewed', requirements, keyboard: [], ruleIds: [] },
    composition: { allowedComponentIds: [], constraints: ['Keep interaction semantics on native interactive elements.'] },
    exampleIds: [exampleId], ruleIds: [],
    aiGuidance: { prefer: [`Use ${details.name} for its documented purpose.`], avoid: details.prohibitedUsage },
  };
  return { component, example: { id: exampleId, title: details.purpose, componentIds: [details.id], code, intent: 'recommended', previewKey } };
}
const create = (name: string, type: string, description: string, values?: string[]) => ({
  name, type, required: false, ...(values?.[0] ? { defaultValue: values[0] } : {}), ...(values ? { allowedValues: values } : {}), description,
});
const entries = [
  contract({ id: 'card', name: 'Card', category: 'layout', purpose: 'Group related content with a shared surface.', shortPurpose: 'Group related content together.', semantics: { element: 'div', meaning: 'A non-interactive grouping for related content.' },
    props: [create('variant', 'CardVariant', 'Surface treatment.', ['default', 'outlined']), { name: 'children', type: 'ReactNode', required: true, description: 'Related content.' }], variants: { variant: ['default', 'outlined'] }, tokenIds: ['color.surface', 'color.border', 'color.foreground', 'radius.panel', 'spacing.stack'], exampleId: 'card-profile', previewKey: 'cardProfile',
    code: 'import { Card } from "@/components/ui/card";\n<Card><h3>Workspace settings</h3><p>Choose the defaults your team shares.</p></Card>', prohibitedUsage: ['Clickable container; use a Button or Link for the action.'], requirements: ['Keep headings and actions as native elements.'] }),
  contract({ id: 'badge', name: 'Badge', category: 'feedback', purpose: 'Show a short label or status.', shortPurpose: 'Show a short status or category.', semantics: { element: 'span', meaning: 'A concise label that is not an interactive control.' },
    props: [create('tone', 'BadgeTone', 'Semantic status.', ['neutral', 'primary', 'success', 'warning', 'destructive']), { name: 'children', type: 'ReactNode', required: true, description: 'Short status text.' }], variants: { tone: ['neutral', 'primary', 'success', 'warning', 'destructive'] }, tokenIds: ['color.muted', 'color.foreground', 'color.primary', 'color.on-primary', 'color.success', 'color.on-success', 'color.warning', 'color.on-warning', 'color.destructive', 'color.on-destructive', 'radius.control', 'spacing.inline', 'typography.caption', 'typography.weight-medium'], exampleId: 'badge-status', previewKey: 'badgeStatus',
    code: 'import { Badge } from "@/components/ui/badge";\n<Badge tone="success">Ready</Badge>', prohibitedUsage: ['An interactive action or a long message.'], requirements: ['Use text so status is not conveyed by color alone.'] }),
  contract({ id: 'separator', name: 'Separator', category: 'layout', purpose: 'Separate nearby content.', shortPurpose: 'Separate nearby content.', semantics: { element: 'hr or separator', meaning: 'A decorative boundary or named structural separator.' },
    props: [create('orientation', 'horizontal | vertical', 'Separator direction.', ['horizontal', 'vertical']), { name: 'decorative', type: 'boolean', required: false, defaultValue: true, description: 'Hide a purely visual separator from assistive technology.' }], variants: { orientation: ['horizontal', 'vertical'] }, tokenIds: ['color.border', 'spacing.row-height'], exampleId: 'separator-sections', previewKey: 'separatorSections',
    code: 'import { Separator } from "@/components/ui/separator";\n<Separator />', prohibitedUsage: ['Using a separator to replace a heading or group label.'], states: ['default', 'decorative', 'structural'], requirements: ['Use the decorative default for visual rules.', 'Give structural separators the native separator role and orientation.'] }),
  contract({ id: 'avatar', name: 'Avatar', category: 'layout', purpose: 'Identify a person or group with an image or initials.', shortPurpose: 'Identify a person or group.', semantics: { element: 'span', meaning: 'A named portrait or a decorative identity mark beside the person’s name.' },
    props: [{ name: 'initials', type: 'string', required: true, description: 'Short fallback shown when no image is available.' }, { name: 'alt', type: 'string', required: true, description: 'Meaningful name, or empty when nearby text already identifies the person.' }, { name: 'src', type: 'string', required: false, description: 'Optional local or consumer-owned image URL.' }, { name: 'size', type: 'AvatarSize', required: false, defaultValue: 'medium', allowedValues: ['small', 'medium', 'large'], description: 'Visual size.' }], variants: { size: ['small', 'medium', 'large'] }, tokenIds: ['color.muted', 'color.foreground', 'typography.label', 'typography.weight-medium'], exampleId: 'avatar-member', previewKey: 'avatarMember',
    code: 'import { Avatar } from "@/components/ui/avatar";\n<Avatar initials="MC" alt="Maya Chen" />', prohibitedUsage: ['Leaving a meaningful portrait without alternative text.'], states: ['default', 'image', 'fallback'], requirements: ['Keep decorative avatars empty-named when nearby text supplies identity.', 'Show useful fallback initials if an image fails.'] }),
  contract({ id: 'alert', name: 'Alert', category: 'feedback', purpose: 'Explain an important status or problem.', shortPurpose: 'Explain an important status.', semantics: { element: 'div', meaning: 'A labeled status message with an appropriate announcement role.' },
    props: [create('tone', 'AlertTone', 'Message type.', ['info', 'success', 'warning', 'destructive']), { name: 'title', type: 'string', required: false, description: 'Optional short heading.' }, { name: 'children', type: 'ReactNode', required: true, description: 'Useful message text.' }], variants: { tone: ['info', 'success', 'warning', 'destructive'] }, tokenIds: ['color.info', 'color.on-info', 'color.success', 'color.on-success', 'color.warning', 'color.on-warning', 'color.destructive', 'color.on-destructive', 'radius.control', 'spacing.inline', 'spacing.stack', 'color.border', 'typography.weight-medium'], exampleId: 'alert-recovery', previewKey: 'alertRecovery',
    code: 'import { Alert } from "@/components/ui/alert";\n<Alert tone="info" title="Preview mode">Your changes stay in this preview.</Alert>', prohibitedUsage: ['Making an unrequested action or repeating an assertive alert on every render.'], requirements: ['Use a polite status role for routine feedback and alert for urgent problems.', 'Keep the message available as text.'] }),
  contract({ id: 'progress', name: 'Progress', category: 'feedback', purpose: 'Show measured or indeterminate work.', shortPurpose: 'Show progress with a clear label.', semantics: { element: 'progress', meaning: 'Native progress indicator with a required accessible label.' },
    props: [{ name: 'label', type: 'string', required: true, description: 'Name the task that is progressing.' }, { name: 'value', type: 'number | null', required: false, description: 'Completion from zero to max; null or omitted is indeterminate.' }, { name: 'max', type: 'number', required: false, defaultValue: 100, description: 'Completion value for finished work.' }],
    tokenIds: ['color.primary', 'color.muted', 'color.foreground', 'radius.control', 'spacing.inline', 'typography.label'], exampleId: 'progress-upload', previewKey: 'progressUpload',
    code: 'import { Progress } from "@/components/ui/progress";\n<Progress label="Uploading files" value={68} />', prohibitedUsage: ['Using an unlabeled indicator or inventing a completion percentage.'], requirements: ['Expose a useful accessible name.', 'Keep indeterminate progress indeterminate.'], states: ['default', 'determinate', 'indeterminate'] }),
  contract({ id: 'skeleton', name: 'Skeleton', category: 'feedback', purpose: 'Reserve space while nearby content loads.', shortPurpose: 'Reserve space while content loads.', semantics: { element: 'span', meaning: 'A decorative placeholder with no repeated announcement.' },
    props: [create('shape', 'SkeletonShape', 'Placeholder shape.', ['text', 'rect', 'circle']), { name: 'width', type: 'string', required: false, description: 'Optional bounded width.' }, { name: 'height', type: 'string', required: false, description: 'Optional bounded height.' }], variants: { shape: ['text', 'rect', 'circle'] }, tokenIds: ['color.muted', 'radius.control', 'motion.duration', 'spacing.row-height'], exampleId: 'skeleton-list', previewKey: 'skeletonList',
    code: 'import { Skeleton } from "@/components/ui/skeleton";\n<section aria-busy="true" aria-label="Loading members"><Skeleton shape="text" /><Skeleton shape="rect" /></section>', prohibitedUsage: ['Announcing each placeholder or showing a skeleton after content has loaded.'], requirements: ['Hide decorative placeholders from assistive technology.', 'Respect reduced motion.'], states: ['default', 'loading', 'reduced-motion'] }),
];
export const additionalComponentContracts = entries.map(entry => entry.component);
export const additionalComponentExamples = entries.map(entry => entry.example);
