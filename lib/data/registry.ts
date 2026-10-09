import { ColorRoleSchema, type Theme, type DesignSystem, type TokenDefinition, type ComponentContract, type Example, type Rule, type Oklch } from '@/lib/contract/schema';
import { additionalComponentContracts, additionalComponentExamples } from './component-contracts';
import { formComponentContracts, formComponentExamples } from './form-contracts';
import { overlayComponentContracts, overlayComponentExamples } from './overlay-contracts';
import { feedbackComponentContracts, feedbackComponentExamples } from './feedback-contracts';
import { structureComponentContracts, structureComponentExamples } from './structure-contracts';
import { spacingSteps, typeSizes } from '@/lib/theme/scales';
import { toCssVariable } from '@/lib/theme/resolve';
const color = (l: number, c = 0, h = 260): Oklch => ({ l, c, h, alpha: 1 });
const light = {
  primary: color(0.44, 0.16, 264), onPrimary: color(1), secondary: color(0.91, 0.01), onSecondary: color(0.22, 0.02),
  accent: color(0.4, 0.1, 170), onAccent: color(1), background: color(0.985, 0.002), foreground: color(0.22, 0.02),
  surface: color(1), muted: color(0.94, 0.005), mutedForeground: color(0.43, 0.015), border: color(0.56, 0.015), focus: color(0.44, 0.16, 264),
  destructive: color(0.43, 0.16, 25), onDestructive: color(1), success: color(0.38, 0.09, 150), onSuccess: color(1),
  warning: color(0.82, 0.13, 85), onWarning: color(0.2), info: color(0.43, 0.1, 235), onInfo: color(1),
};
const dark = {
  primary: color(0.8, 0.1, 264), onPrimary: color(0.18, 0.02), secondary: color(0.3, 0.015), onSecondary: color(0.96),
  accent: color(0.8, 0.09, 170), onAccent: color(0.18), background: color(0.16, 0.01), foreground: color(0.95, 0.005),
  surface: color(0.21, 0.01), muted: color(0.28, 0.01), mutedForeground: color(0.76, 0.01), border: color(0.6, 0.01), focus: color(0.8, 0.1, 264),
  destructive: color(0.78, 0.1, 25), onDestructive: color(0.18), success: color(0.8, 0.09, 150), onSuccess: color(0.18),
  warning: color(0.82, 0.13, 85), onWarning: color(0.18), info: color(0.8, 0.09, 235), onInfo: color(0.18),
};
export const defaultTheme: Theme = {
  id: 'default', palette: { 'brand-500': light.primary, 'neutral-100': light.muted, 'neutral-900': light.foreground },
  colors: { light, dark }, typography: { sansFontId: 'inter', monoFontId: 'jetbrains-mono', scale: 'default' },
  radius: 'soft', density: 'comfortable', shadows: 'soft', effects: { surface: 'clean' }, motion: 'subtle', componentDefaults: {},
};
const themeToken = (id: string, path: string, category: TokenDefinition['category'], exampleIds: string[] = []): TokenDefinition => ({
  id, cssVariable: toCssVariable(id), category, kind: path.startsWith('palette.') ? 'primitive' : 'semantic',
  purpose: `Shared ${id.replaceAll('.', ' ')} value.`, source: { kind: 'theme', path }, exampleIds,
});
const literal = (id: string, category: TokenDefinition['category'], constant: Extract<TokenDefinition['source'], {kind: 'literal'}>['constant']): TokenDefinition => ({
  id, category, cssVariable: toCssVariable(id), kind: 'primitive', purpose: `Shared ${id.replaceAll('.', ' ')} value.`, source: { kind: 'literal', constant }, exampleIds: [],
});
const tokens: TokenDefinition[] = [
  ...ColorRoleSchema.options.map(role => themeToken(`color.${role.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`, `colors.*.${role}`, 'color', ['button-save'])),
  ...Object.keys(defaultTheme.palette).map(key => themeToken(`palette.${key}`, `palette.${key}`, 'color')),
  themeToken('typography.sans', 'typography.sansFontId', 'typography'), themeToken('typography.mono', 'typography.monoFontId', 'typography'),
  ...Object.keys(typeSizes).map(role => themeToken(`typography.${role}`, 'typography.scale', 'typography')),
  themeToken('radius.control', 'radius', 'radius'), themeToken('radius.panel', 'radius', 'radius'),
  ...['inline', 'control-block', 'control-inline', 'stack', 'section', 'row-height'].map(key => themeToken(`spacing.${key}`, 'density', 'spacing', ['button-save'])),
  ...Object.entries(spacingSteps).map(([step, value]) => literal(`spacing.${step}`, 'spacing', { type: 'dimension', value: { value, unit: 'rem' } })),
  literal('spacing.target-minimum', 'spacing', { type: 'dimension', value: { value: 2.75, unit: 'rem' } }),
  themeToken('shadow.surface', 'shadows', 'shadow'), themeToken('shadow.raised', 'shadows', 'shadow'), themeToken('effect.surface-depth', 'effects.surface', 'effect'),
  themeToken('motion.duration', 'motion', 'motion'), literal('motion.easing', 'motion', { type: 'cubicBezier', value: [0.2, 0, 0, 1] }),
  literal('typography.weight-medium', 'typography', { type: 'fontWeight', value: 500 }),
  literal('typography.line-height', 'typography', { type: 'number', value: 1.6 }),
];

const buttonContract = {
  id: "button",
  name: "Button",
  publicImport: { module: "@/components/ui/button", exportName: "Button" },
  purpose: "Run an action, such as saving settings or opening a dialog.",
  shortPurpose: "Run an action on the current page.",
  category: "action",
  maturity: "experimental",
  interactive: true,
  semantics: { element: "button", meaning: "An explicit user action." },
  anatomy: [
    { part: "root", description: "Native button with focus and disabled behavior." },
    { part: "label", description: "Visible action text or an accessible icon label." },
    { part: "indicator", description: "Optional loading indicator." },
  ],
  props: [
    { name: "variant", type: "ButtonVariant", required: false, defaultValue: "primary", allowedValues: ["primary", "secondary", "ghost", "destructive"], description: "Action emphasis." },
    { name: "size", type: "ButtonSize", required: false, defaultValue: "medium", allowedValues: ["small", "medium", "large"], description: "Size within the density scale." },
    { name: "type", type: "button | submit | reset", required: false, defaultValue: "button", allowedValues: ["button", "submit", "reset"], description: "Native form behavior." },
    { name: "disabled", type: "boolean", required: false, defaultValue: false, description: "Prevent activation." },
    { name: "loading", type: "boolean", required: false, defaultValue: false, description: "Show progress and prevent repeat activation." },
    { name: "children", type: "ReactNode", required: true, description: "Action text or a labeled icon." },
    { name: "aria-label", type: "string", required: false, description: "Required when visible content has no action text." },
    { name: "onClick", type: "MouseEventHandler<HTMLButtonElement>", required: false, description: "Run the action on native activation." },
  ],
  variants: { variant: ["primary", "secondary", "ghost", "destructive"], size: ["small", "medium", "large"] },
  compoundVariants: [
    {
      when: { variant: "ghost", size: "small" },
      effect: "styled",
      description: "Uses shared inline spacing instead of density control padding for a small ghost button.",
    },
  ],
  // Destructive is never a theme default: it changes the meaning of every unmarked action.
  themeDefaults: { variant: ["primary", "secondary", "ghost"], size: ["small", "medium", "large"] },
  states: ["default", "hover", "focus-visible", "pressed", "disabled", "loading"],
  tokenIds: [
    "color.primary", "color.on-primary",
    "color.secondary", "color.on-secondary",
    "color.destructive", "color.on-destructive",
    "color.foreground", "color.muted", "color.focus",
    "radius.control", "spacing.target-minimum", "typography.weight-medium",
    "spacing.inline", "spacing.control-block", "spacing.control-inline",
  ],
  accessibility: {
    status: "not-reviewed",
    requirements: ["Use a native button.", "Provide an accessible action name.", "Expose loading with aria-busy and preserve the label."],
    keyboard: [
      { key: "Enter", behavior: "Activate when focused and enabled." },
      { key: "Space", behavior: "Activate using native behavior." },
    ],
    ruleIds: ["wcag-focus-visible"],
  },
  composition: {
    allowedComponentIds: ["spinner"],
    constraints: ["Icons are decorative when text supplies the name.", "Do not nest interactive elements."],
  },
  prohibitedUsage: ["Navigation to another URL; use Link.", "Clickable divs styled as buttons."],
  exampleIds: ["button-save"],
  ruleIds: ["avoid-custom-button", "prefer-semantic-link"],
  aiGuidance: {
    prefer: ["Import Button for actions.", "Use existing variants and semantic tokens."],
    avoid: ["Recreating Button with a div.", "Adding raw colors for an existing variant."],
  },
} satisfies ComponentContract;
// Seed components stay experimental until M2's implementation review.

const spinnerContract: ComponentContract = {
  id: 'spinner', name: 'Spinner', publicImport: { module: '@/components/ui/spinner', exportName: 'Spinner' },
  purpose: 'Show an action is in progress without repeating announcements.', shortPurpose: 'Show that work is in progress.', category: 'feedback', maturity: 'experimental', interactive: false,
  semantics: { element: 'span', meaning: 'Decorative activity indicator; status text belongs to its parent.' },
  anatomy: [{ part: 'root', description: 'An animated ring hidden from assistive technology.' }],
  props: [{ name: 'size', type: 'small | medium | large', required: false, defaultValue: 'medium', allowedValues: ['small', 'medium', 'large'], description: 'Indicator size.' }],
  variants: { size: ['small', 'medium', 'large'] }, compoundVariants: [], themeDefaults: { size: ['small', 'medium', 'large'] },
  states: ['default', 'loading', 'reduced-motion'], tokenIds: ['motion.duration'],
  accessibility: { status: 'not-reviewed', requirements: ['Keep decorative activity hidden; put a useful status on its parent.'], keyboard: [], ruleIds: [] },
  composition: { allowedComponentIds: [], constraints: ['Keep the action label visible.'] }, prohibitedUsage: ['Announcing every animation frame.'],
  exampleIds: ['spinner-progress'], ruleIds: [], aiGuidance: { prefer: ['Use inside an action or beside status text.'], avoid: ['Using a spinner as the only status message.'] },
};
const linkContract: ComponentContract = {
  id: 'link', name: 'Link', publicImport: { module: '@/components/ui/link', exportName: 'Link' },
  purpose: 'Navigate to a real destination with a native anchor.', shortPurpose: 'Navigate to a destination.', category: 'navigation', maturity: 'experimental', interactive: true,
  semantics: { element: 'a', meaning: 'A link to another URL or a named part of the page.' }, anatomy: [{ part: 'root', description: 'Native anchor with a destination and descriptive text.' }],
  props: [
    { name: 'href', type: 'string', required: true, description: 'A real destination.' },
    { name: 'children', type: 'ReactNode', required: true, description: 'Describe the destination.' },
    { name: 'variant', type: 'default | subtle', required: false, defaultValue: 'default', allowedValues: ['default', 'subtle'], description: 'Link emphasis.' },
  ], variants: { variant: ['default', 'subtle'] }, compoundVariants: [], themeDefaults: { variant: ['default', 'subtle'] }, states: ['default', 'hover', 'focus-visible'],
  tokenIds: ['color.primary', 'color.foreground', 'color.focus'], accessibility: { status: 'not-reviewed', requirements: ['Use meaningful link text and a real href.', 'Keep focus visible.'], keyboard: [{ key: 'Enter', behavior: 'Follow the link.' }], ruleIds: ['wcag-focus-visible'] },
  composition: { allowedComponentIds: [], constraints: ['Do not nest links or buttons.'] }, prohibitedUsage: ['Running an action without navigation; use Button.'],
  exampleIds: ['link-docs'], ruleIds: ['prefer-semantic-link'], aiGuidance: { prefer: ['Use Link for navigation.'], avoid: ['Buttons that only change the URL.'] },
};
const example = (id: string, title: string, componentIds: string[], code: string, previewKey: string): Example => ({ id, title, componentIds, code, intent: 'recommended', previewKey });
const examples: Example[] = [
  example('button-save', 'Save settings', ['button'], 'import { Button } from "@/components/ui/button";\n<Button onClick={() => window.alert("Settings saved for this example.")}>Save settings</Button>', 'buttonSave'),
  example('spinner-progress', 'Working with a clear label', ['spinner'], 'import { Spinner } from "@/components/ui/spinner";\n<p role="status"><Spinner /> Preparing your preview…</p>', 'spinnerProgress'),
  example('link-docs', 'Read the contract', ['link'], 'import { Link } from "@/components/ui/link";\n<Link href="/api/registry">Read the registry</Link>', 'linkDocs'),
];
const ruleSeeds: { id: string; category: Rule['category']; severity: Rule['severity']; appliesTo: Rule['appliesTo']; description: string; bad: string; fix: string; correct: string; components: string[]; preview: string }[] = [
  { id: 'component-prefer-existing', category: 'component', severity: 'warning', appliesTo: 'system', description: 'Reuse a shipped component before creating another.', bad: '<button className="newButton">Save</button>', fix: 'Import the existing Button and choose a supported variant.', correct: 'button-save', components: ['button'], preview: 'buttonSave' },
  { id: 'token-no-raw-color', category: 'token', severity: 'warning', appliesTo: 'system', description: 'Use semantic tokens instead of raw colors.', bad: '<button style={{ background: "#2244ff" }}>Save</button>', fix: 'Use Button; its variants read the semantic color tokens.', correct: 'button-save', components: ['button'], preview: 'buttonSave' },
  { id: 'wcag-focus-visible', category: 'accessibility', severity: 'error', appliesTo: ['button', 'checkbox', 'copy-button', 'dialog', 'dropdown-menu', 'empty-state', 'error-state', 'input', 'link', 'navigation', 'not-found', 'radio-group', 'select', 'switch', 'tabs', 'textarea', 'tooltip'], description: 'Keep keyboard focus visible and unobscured.', bad: '<button style={{ outline: "none" }}>Save</button>', fix: 'Use the component focus style and never remove the outline without a replacement.', correct: 'button-save', components: ['button'], preview: 'buttonSave' },
  { id: 'wcag-contrast', category: 'accessibility', severity: 'error', appliesTo: 'system', description: 'Meet contrast requirements for text and required cues.', bad: '<button style={{ color: "#ddd", background: "#fff" }}>Save</button>', fix: 'Use semantic foreground/background pairs and check both appearances.', correct: 'button-save', components: ['button'], preview: 'buttonSave' },
  { id: 'avoid-unnecessary-wrapper', category: 'performance', severity: 'info', appliesTo: 'system', description: 'Add wrappers only when they serve layout or semantics.', bad: '<div><div><div><button>Save</button></div></div></div>', fix: 'Use a single Button when the extra wrappers do no work.', correct: 'button-save', components: ['button'], preview: 'buttonSave' },
  { id: 'avoid-custom-button', category: 'component', severity: 'error', appliesTo: ['button'], description: 'Use a native Button for actions.', bad: '<div onClick={save}>Save</div>', fix: 'Replace the clickable div with Button and preserve its action label.', correct: 'button-save', components: ['button'], preview: 'buttonSave' },
  { id: 'prefer-semantic-link', category: 'composition', severity: 'warning', appliesTo: ['button', 'link'], description: 'Use Link for navigation and Button for actions.', bad: '<button onClick={() => location.href = "/api/registry"}>Registry</button>', fix: 'Use Link with the destination in href.', correct: 'link-docs', components: ['link'], preview: 'linkDocs' },
  { id: 'minimize-custom-css', category: 'styling', severity: 'warning', appliesTo: 'system', description: 'Choose supported variants before adding custom styles.', bad: '<button style={{ padding: 27, borderRadius: 17 }}>Save</button>', fix: 'Use the shared Button size and variant props.', correct: 'button-save', components: ['button'], preview: 'buttonSave' },
];
const rules: Rule[] = ruleSeeds.map(seed => {
  const badId = `${seed.id}-violation`;
  examples.push({ id: badId, title: seed.description, componentIds: seed.components, code: seed.bad, intent: 'violation', explanation: seed.fix });
  return { id: seed.id, category: seed.category, severity: seed.severity, appliesTo: seed.appliesTo,
    description: seed.description, violationExampleId: badId, correctExampleId: seed.correct,
    suggestedFix: seed.fix, autoFix: { available: false, reason: 'Phase 1 shows suggested fixes; it does not edit your project.' } };
});
export const registry: DesignSystem = {
  schemaVersion: '1.0', id: 'seeyesyes', name: 'SeeYesYes', productVersion: '0.1.0',
  principles: ['Use the same decisions for people and agents.', 'Choose semantic components and tokens.', 'Keep accessibility part of the contract.', 'Show what is verified and what is still a demo.'],
  fonts: [{ id: 'inter', family: 'Inter', kind: 'sans', source: 'self-hosted' }, { id: 'jetbrains-mono', family: 'JetBrains Mono', kind: 'mono', source: 'self-hosted' }],
  defaultThemeId: 'default', themePresets: [defaultTheme], tokens,
  components: [buttonContract, spinnerContract, linkContract, ...additionalComponentContracts, ...formComponentContracts, ...overlayComponentContracts, ...structureComponentContracts, ...feedbackComponentContracts], rules, examples: [...examples, ...additionalComponentExamples, ...formComponentExamples, ...overlayComponentExamples, ...structureComponentExamples, ...feedbackComponentExamples], layouts: [],
  project: { framework: 'react', styling: 'css-variables', guidance: ['Import components through their public repository aliases.', 'Use CSS Modules for local structure and semantic variables for appearance.', 'Parents own placement; components own their internal behavior.', 'The local prototype has no published package or project scanner.'] },
};
