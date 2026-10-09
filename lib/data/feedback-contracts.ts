import type { ComponentContract, Example } from '@/lib/contract/schema';
type Prop = ComponentContract['props'][number];
const prop = (name: string, type: string, description: string, required = false): Prop => ({ name, type, description, required });
const entries: ComponentContract[] = [
  {
    id: 'loading-state', name: 'LoadingState', publicImport: { module: '@/components/ui/loading-state', exportName: 'LoadingState' }, category: 'feedback', maturity: 'experimental', interactive: false,
    purpose: 'Show clearly named content that is still loading.', shortPurpose: 'Name content while it loads.', semantics: { element: 'div[role=status]', meaning: 'One politely announced, busy status with a visible label.' },
    anatomy: ['status', 'indicator', 'label', 'description'].map(part => ({ part, description: `LoadingState ${part}.` })),
    props: [prop('label', 'string', 'Visible name of the loading work.', true), prop('description', 'string', 'Optional extra context.'), { ...prop('variant', 'spinner | skeleton', 'Choose an indicator.'), defaultValue: 'spinner', allowedValues: ['spinner', 'skeleton'] }, prop('ref', 'Ref<HTMLDivElement>', 'Status wrapper reference.')],
    variants: { variant: ['spinner', 'skeleton'] }, compoundVariants: [], themeDefaults: {}, states: ['default', 'loading', 'spinner', 'skeleton'],
    tokenIds: ['color.foreground', 'color.muted-foreground', 'typography.label', 'typography.caption', 'typography.weight-medium', 'spacing.stack', 'spacing.inline'],
    accessibility: { status: 'not-reviewed', requirements: ['Keep the status label visible and announced once.', 'Put aria-busy on the loading region that owns the content.', 'Prefer Skeleton when reserving the shape of known content.'], keyboard: [], ruleIds: [] },
    composition: { allowedComponentIds: ['spinner', 'skeleton'], constraints: ['Decorative indicators stay hidden from assistive technology.'] },
    prohibitedUsage: ['Showing a spinner without describing the work.', 'Keeping a loading status after content is ready.'], exampleIds: ['loading-members'], ruleIds: [], aiGuidance: { prefer: ['Use one LoadingState for the pending request.'], avoid: ['Repeating announcements in each placeholder.'] },
  },
  {
    id: 'empty-state', name: 'EmptyState', publicImport: { module: '@/components/ui/empty-state', exportName: 'EmptyState' }, category: 'feedback', maturity: 'experimental', interactive: true,
    purpose: 'Explain that a result set has no items and offer a next step.', shortPurpose: 'Explain an empty result and next step.', semantics: { element: 'section', meaning: 'A named section with a heading, explanation, and optional action.' },
    anatomy: ['section', 'heading', 'description', 'action'].map(part => ({ part, description: `EmptyState ${part}.` })),
    props: [prop('title', 'string', 'Visible section heading.', true), prop('description', 'string', 'Explain the empty result and useful next step.', true), prop('action', 'ReactNode', 'Optional Button or Link.'), prop('ref', 'Ref<HTMLElement>', 'Section reference.')],
    variants: {}, compoundVariants: [], themeDefaults: {}, states: ['empty', 'action'],
    tokenIds: ['color.foreground', 'color.muted-foreground', 'typography.heading', 'typography.label', 'typography.weight-medium', 'spacing.stack', 'spacing.inline'],
    accessibility: { status: 'not-reviewed', requirements: ['Keep a visible heading and an explanation.', 'Offer a meaningful action when users can change the result.'], keyboard: [{ key: 'Enter / Space', behavior: 'Activate a supplied native Link or Button.' }], ruleIds: ['wcag-focus-visible'] },
    composition: { allowedComponentIds: ['button', 'link'], constraints: ['Use native Button or Link semantics for the optional action.'] },
    prohibitedUsage: ['Using an empty state for a failed request.', 'Using search-result emptiness without a Clear filters action.'], exampleIds: ['empty-projects'], ruleIds: [], aiGuidance: { prefer: ['Explain what is empty and how to add or find items.'], avoid: ['Blaming the user or showing an unexplained blank page.'] },
  },
  {
    id: 'error-state', name: 'ErrorState', publicImport: { module: '@/components/ui/error-state', exportName: 'ErrorState' }, category: 'feedback', maturity: 'experimental', interactive: true,
    purpose: 'Explain a failed request and let the user retry.', shortPurpose: 'Explain a failure and offer retry.', semantics: { element: 'div with alert and button', meaning: 'An assertive error message with a native retry action.' },
    anatomy: ['error', 'title', 'message', 'retry action'].map(part => ({ part, description: `ErrorState ${part}.` })),
    props: [prop('message', 'string', 'Plain-language error details.', true), prop('onRetry', '() => void', 'Repeat the failed request.', true), { ...prop('title', 'string', 'Short error heading.'), defaultValue: 'Could not load this content' }, { ...prop('retryLabel', 'string', 'Visible retry button name.'), defaultValue: 'Retry' }, prop('ref', 'Ref<HTMLDivElement>', 'Wrapper reference.')],
    variants: {}, compoundVariants: [], themeDefaults: {}, states: ['error', 'retry'],
    tokenIds: ['spacing.stack'],
    accessibility: { status: 'not-reviewed', requirements: ['Name the failed operation and explain the problem.', 'Give the user a visible retry action.', 'Do not announce the same error repeatedly while nothing changes.'], keyboard: [{ key: 'Enter / Space', behavior: 'Retry using the native button.' }], ruleIds: ['wcag-focus-visible'] },
    composition: { allowedComponentIds: ['alert', 'button'], constraints: ['Render only for a failed request; keep retry state with the consumer.'] },
    prohibitedUsage: ['Showing errors for successful empty results.', 'Hiding the only retry action.'], exampleIds: ['error-registry'], ruleIds: [], aiGuidance: { prefer: ['Use ErrorState for request failures and missing required data.'], avoid: ['Treating an error as an empty list.'] },
  },
  {
    id: 'not-found', name: 'NotFound', publicImport: { module: '@/components/ui/not-found', exportName: 'NotFound' }, category: 'feedback', maturity: 'experimental', interactive: true,
    purpose: 'Help users recover from an unknown page or resource.', shortPurpose: 'Explain a missing page and return.', semantics: { element: 'section with h1 and link', meaning: 'A page-level not-found heading with a recovery destination.' },
    anatomy: ['status code', 'heading', 'description', 'recovery link'].map(part => ({ part, description: `NotFound ${part}.` })),
    props: [{ ...prop('title', 'string', 'Page heading.'), defaultValue: 'We could not find that page' }, { ...prop('description', 'string', 'Explain that the address may have moved.'), defaultValue: 'It may have moved or the address may be incorrect.' }, { ...prop('homeHref', 'string', 'Recovery destination.'), defaultValue: '/' }, { ...prop('homeLabel', 'string', 'Recovery link text.'), defaultValue: 'Return to overview' }, prop('ref', 'Ref<HTMLElement>', 'Section reference.')],
    variants: {}, compoundVariants: [], themeDefaults: {}, states: ['not-found'],
    tokenIds: ['color.foreground', 'color.muted-foreground', 'typography.caption', 'typography.heading', 'typography.label', 'typography.weight-medium', 'spacing.stack'],
    accessibility: { status: 'not-reviewed', requirements: ['Use a clear page heading and useful recovery link.', 'Keep unknown resources as not found across request scenarios.'], keyboard: [{ key: 'Enter', behavior: 'Follow the recovery link.' }], ruleIds: ['wcag-focus-visible'] },
    composition: { allowedComponentIds: ['link'], constraints: ['The route chooses the title and valid recovery destination.'] },
    prohibitedUsage: ['Using a not-found screen for network errors.', 'Linking to an unavailable destination.'], exampleIds: ['not-found-component'], ruleIds: [], aiGuidance: { prefer: ['Use for unknown routes and singleton resources.'], avoid: ['Use ErrorState for retryable request failures.'] },
  },
  {
    id: 'copy-button', name: 'CopyButton', publicImport: { module: '@/components/ui/copy-button', exportName: 'CopyButton' }, category: 'action', maturity: 'experimental', interactive: true,
    purpose: 'Copy text to the clipboard and report whether it worked.', shortPurpose: 'Copy text and report the result.', semantics: { element: 'button and status', meaning: 'A named action with polite success or failure feedback.' },
    anatomy: ['button', 'feedback'].map(part => ({ part, description: `CopyButton ${part}.` })),
    props: [prop('value', 'string', 'Exact text to write.', true), prop('label', 'string', 'Identifies what the button copies.', true), { ...prop('successMessage', 'string', 'Polite success message.'), defaultValue: 'Copied to clipboard.' }, { ...prop('failureMessage', 'string', 'Explain that clipboard access failed.'), defaultValue: 'Could not copy. Check clipboard access and try again.' }, prop('disabled', 'boolean', 'Disable the action.'), prop('ref', 'Ref<HTMLDivElement>', 'Wrapper reference.')],
    variants: {}, compoundVariants: [], themeDefaults: {}, states: ['idle', 'success', 'error', 'disabled'],
    tokenIds: ['spacing.inline', 'color.muted-foreground', 'typography.caption'],
    accessibility: { status: 'not-reviewed', requirements: ['Name the copied content.', 'Announce success or failure in a polite status.', 'Do not report success when clipboard access is unavailable.'], keyboard: [{ key: 'Enter / Space', behavior: 'Copy using the native button.' }], ruleIds: ['wcag-focus-visible'] },
    composition: { allowedComponentIds: ['button'], constraints: ['Clipboard feedback is local to this action.'] },
    prohibitedUsage: ['Copying without a visible action label.', 'Claiming success when the browser blocks clipboard access.'], exampleIds: ['copy-context'], ruleIds: [], aiGuidance: { prefer: ['Keep a concise success or failure message next to the copy action.'], avoid: ['Silently ignoring clipboard failures.'] },
  },
];
const examples: Example[] = [
  { id: 'loading-members', title: 'Show a named loading result', componentIds: ['loading-state', 'skeleton'], code: 'import { LoadingState } from "@/components/ui/loading-state";\nimport { Skeleton } from "@/components/ui/skeleton";\n<LoadingState label="Loading team members" description="This may take a moment." variant="skeleton" />', intent: 'recommended', previewKey: 'loadingMembers' },
  { id: 'empty-projects', title: 'Give an empty list a next step', componentIds: ['empty-state', 'button'], code: 'import { EmptyState } from "@/components/ui/empty-state";\nimport { Button } from "@/components/ui/button";\n<EmptyState title="No projects yet" description="Create a project to keep related work together." action={<Button onClick={createProject}>Create project</Button>} />', intent: 'recommended', previewKey: 'emptyProjects' },
  { id: 'error-registry', title: 'Retry a failed request', componentIds: ['error-state', 'alert', 'button'], code: 'import { ErrorState } from "@/components/ui/error-state";\nimport { Alert } from "@/components/ui/alert";\nimport { Button } from "@/components/ui/button";\n<ErrorState message="The component list did not load." onRetry={reloadComponents} />', intent: 'recommended', previewKey: 'errorRegistry' },
  { id: 'not-found-component', title: 'Recover from a missing page', componentIds: ['not-found', 'link'], code: 'import { NotFound } from "@/components/ui/not-found";\nimport { Link } from "@/components/ui/link";\n<NotFound title="Component not found" description="That component is not in this registry." />', intent: 'recommended', previewKey: 'notFoundComponent' },
  { id: 'copy-context', title: 'Copy a useful snippet', componentIds: ['copy-button', 'button'], code: 'import { CopyButton } from "@/components/ui/copy-button";\nimport { Button } from "@/components/ui/button";\n<CopyButton label="component context" value={contextMarkdown} />', intent: 'recommended', previewKey: 'copyContext' },
];
export const feedbackComponentContracts = entries;
export const feedbackComponentExamples = examples;
