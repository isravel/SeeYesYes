import type { ComponentContract, Example } from '@/lib/contract/schema';

// X5 reusable page sections. Each one composes existing primitives (Link, Button, Card), keeps content with the consumer and never invents copy, assets or endorsements.
type Entry = {
  id: string; name: string; category: ComponentContract['category']; purpose: string; shortPurpose: string; element: string; meaning: string;
  props: ComponentContract['props']; variants?: ComponentContract['variants']; tokenIds: string[]; states: string[];
  requirements: string[]; prohibitedUsage: string[]; prefer: string[]; allowed?: string[]; constraints?: string[];
  /** Set when the section itself renders a real control or link. */
  keyboard?: ComponentContract['accessibility']['keyboard'];
  exampleId: string; previewKey: string; code: string; exampleComponentIds?: string[];
};
const prop = (name: string, type: string, description: string, required = false, defaultValue?: string | number | boolean): ComponentContract['props'][number] =>
  ({ name, type, description, required, ...(defaultValue === undefined ? {} : { defaultValue }) });
const choice = (name: string, values: (string | number)[], description: string): ComponentContract['props'][number] => ({ ...prop(name, values.join(' | '), description), defaultValue: values[0], allowedValues: values });
const common = [prop('className', 'string', 'Additional class for placement.')];
const levelProp = (what: string) => choice('level', [2, 3, 4], `Heading level of the ${what}. The page chooses it so heading order stays correct.`);

const entries: Entry[] = [
  {
    id: 'share-buttons', name: 'ShareButtons', category: 'action', purpose: 'Share one page address to LinkedIn, X and WhatsApp, or copy it.', shortPurpose: 'Share links and a copy-link button.', element: 'div',
    meaning: 'A named group of links to LinkedIn, X and WhatsApp share pages, and a Copy link button, all for one address you supply. The address keeps its existing query parameters and hash and gains `via=share`. Nothing is shared until a control is pressed.',
    props: [
      prop('url', 'string', 'The address to share. Query parameters and the hash are kept. A relative address is resolved against the current page in the browser. Anything that is not an http or https address disables the controls.', true),
      prop('title', 'string', 'Optional text sent with the address to X and WhatsApp.'),
      prop('label', 'string', 'Accessible name of the group.', false, 'Share'),
      prop('networks', 'ShareNetwork[]', 'Which networks to link, in order: `linkedin`, `x`, `whatsapp`. All three by default; duplicates are ignored.'),
      prop('copyLink', 'boolean', 'Show the Copy link button.', false, true),
      prop('attribution', 'boolean', 'Add `via=share` to the shared address, replacing any existing `via`. Turn it off to share the address unchanged.', false, true),
      choice('size', ['medium', 'small', 'large'], 'Control size within the density scale.'),
      prop('copiedMessage', 'string', 'Status text after a successful copy.', false, 'Link copied.'),
      prop('copyFailedMessage', 'string', 'Status text when copying is blocked or unavailable. Failure is stated in text, never only by color.', false, 'Could not copy the link. Select the address and copy it by hand.'),
      ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    variants: { size: ['medium', 'small', 'large'] },
    tokenIds: ['color.muted-foreground', 'typography.caption', 'spacing.inline'],
    states: ['default', 'hover', 'focus-visible', 'pressed', 'disabled', 'copy-success', 'copy-failure', 'unavailable'],
    keyboard: [{ key: 'Tab', behavior: 'Moves through each network link, then Copy link.' }, { key: 'Enter', behavior: 'Opens the focused share link, or copies the address.' }, { key: 'Space', behavior: 'Copies the address when Copy link is focused.' }],
    requirements: ['Network controls are native links that open the network in a new tab and say so in their name; Copy link is a native button.', 'Everything placed in a share link is percent-encoded, so `&`, `#`, spaces and non-Latin text survive.', 'Never opens a share window or copies without a press; there is no auto-share.', 'Copy success and failure are reported in a status region as text.', 'An unusable address disables every control and explains why in text.'],
    prohibitedUsage: ['Passing an address that is not the page people will open.', 'Using it for an action that is not sharing.', 'Relying on the network icon alone; each control shows its name.', 'Changing the semantics of a share link with a global cosmetic default.'],
    prefer: ['Use ShareButtons once near an article or result. Use CopyButton to copy text that is not a page address.'], allowed: ['button', 'link'],
    constraints: ['Share targets are third-party pages; the component sends only the address and optional text.'],
    exampleId: 'share-buttons-article', previewKey: 'shareButtonsArticle', exampleComponentIds: ['share-buttons'],
    code: 'import { ShareButtons } from "@/components/ui/share-buttons";\n<ShareButtons url="https://example.com/guides/getting-started" title="Getting started" />',
  },
  {
    id: 'footer', name: 'Footer', category: 'navigation', purpose: 'Close a page with your identity and up to four columns of links.', shortPurpose: 'Page footer with identity and link columns.', element: 'footer',
    meaning: 'The page footer landmark. It renders your identity content, up to four columns of links in one named navigation, and an optional legal line. A column heading names its list but is not a document heading.',
    props: [
      prop('identity', 'ReactNode', 'Your own identity content, such as a Logo and a sentence. The system supplies none.'),
      prop('columns', 'FooterColumn[]', 'Up to four columns, each with a stable `id`, a `heading` and `links` (`label`, `href`, optional `external`). Columns beyond the fourth, and columns with no links, are not shown.'),
      prop('label', 'string', 'Accessible name of the links navigation. Make it distinct from other navigation on the page.', false, 'Footer'),
      prop('legal', 'ReactNode', 'Optional legal or copyright line below the links.'),
      ...common, prop('ref', 'Ref<HTMLElement>', 'Footer element reference.'),
    ],
    tokenIds: ['spacing.section', 'color.border', 'color.foreground', 'typography.label', 'spacing.stack', 'color.muted-foreground', 'typography.caption', 'typography.weight-medium', 'spacing.inline'],
    states: ['static', 'wrapped-links', 'focus-visible'],
    keyboard: [{ key: 'Tab', behavior: 'Moves through every footer link in column order.' }, { key: 'Enter', behavior: 'Follows the focused link.' }],
    requirements: ['Renders only the identity, links and text you supply.', 'Use one Footer per page, at the top level, so it is the contentinfo landmark.', 'Links sit in one named navigation; column headings are text and never change heading order.', 'An external link opens in a new tab and says so to assistive technology.', 'Links wrap on a 320px screen without horizontal scrolling.'],
    prohibitedUsage: ['Placing more than four columns; group the links instead.', 'Inventing social or legal links the product does not have.', 'Using column headings as document headings.', 'Nesting a Footer inside another landmark.'],
    prefer: ['Use Footer once at the bottom of a page. Use Navigation for the main site links.'], allowed: ['link', 'logo'],
    constraints: ['The top edge is a soft line from the border token, so the footer separates from the page with or without a glass surface behind it.'],
    exampleId: 'footer-site', previewKey: 'footerSite', exampleComponentIds: ['footer'],
    code: 'import { Footer } from "@/components/ui/footer";\n<Footer identity={<p>Acme helps teams ship consistent interfaces.</p>} columns={[{ id: "product", heading: "Product", links: [{ label: "Components", href: "/components" }, { label: "Docs", href: "/docs" }] }]} legal="© Acme" />',
  },
  {
    id: 'section-head', name: 'SectionHead', category: 'layout', purpose: 'Introduce a page section with a heading, a subtitle and an optional View all link.', shortPurpose: 'Section heading, subtitle and View all link.', element: 'div',
    meaning: 'A real heading at the level the page chooses, an optional subtitle, and a View all link only when you supply an address. The link\'s accessible name ends with the heading, so several View all links on one page stay distinct.',
    props: [
      prop('heading', 'string', 'The heading text.', true), levelProp('heading'),
      prop('subtitle', 'ReactNode', 'Optional supporting line under the heading.'),
      prop('viewAllHref', 'string', 'Destination of the View all link. No link is shown without it.'),
      prop('viewAllLabel', 'string', 'Visible text of the link. The heading is appended for assistive technology.', false, 'View all'),
      ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    tokenIds: ['spacing.inline', 'spacing.stack', 'color.foreground', 'typography.heading', 'typography.title', 'color.muted-foreground', 'typography.body'],
    states: ['heading-only', 'with-link', 'hover', 'focus-visible'],
    keyboard: [{ key: 'Tab', behavior: 'Moves to the View all link when one is shown.' }, { key: 'Enter', behavior: 'Follows the link.' }],
    requirements: ['The heading level is supplied by the page; do not skip levels.', 'Heading size follows the level on the shared type scale; there is no separate size prop.', 'No View all link without a destination.', 'The link\'s name is its label followed by the heading, so it is meaningful out of context.', 'The row wraps so the link drops below the heading on narrow screens.'],
    prohibitedUsage: ['Choosing a level for its size; pick it for document structure.', 'A View all link that goes nowhere or repeats the page.', 'Using it for the page title; use the page h1.'],
    prefer: ['Use SectionHead above each group of content on a page.'], allowed: ['link'],
    exampleId: 'section-head-guides', previewKey: 'sectionHeadGuides', exampleComponentIds: ['section-head'],
    code: 'import { SectionHead } from "@/components/ui/section-head";\n<SectionHead heading="Featured guides" subtitle="Start with the basics." viewAllHref="/docs" />',
  },
  {
    id: 'stat-strip', name: 'StatStrip', category: 'data', purpose: 'Show a few short values with their labels in a responsive row.', shortPurpose: 'Responsive value and label groups.', element: 'dl',
    meaning: 'A description list of short value and label pairs. The label is read before its value. The values and what they mean come from you; nothing is counted, animated or invented.',
    props: [
      prop('items', 'StatItem[]', 'The pairs in reading order, each with a stable `id`, a `label` and a `value`. An empty list renders nothing.', true),
      prop('missingLabel', 'string', 'Shown in place of a pair with no value, so a gap is never silent.', false, 'Not provided'),
      ...common, prop('ref', 'Ref<HTMLDListElement>', 'List element reference.'),
    ],
    tokenIds: ['spacing.stack', 'spacing.inline', 'color.border', 'color.muted-foreground', 'typography.label', 'color.foreground', 'typography.title', 'typography.weight-medium', 'typography.body'],
    states: ['static', 'missing-value'],
    requirements: ['Values and their meaning come from the consumer; the component never fabricates or rounds a figure.', 'Each label is stated in text and read before its value.', 'There is no counting animation.', 'A pair with no value shows the missing label in text.', 'The row wraps to fewer columns on narrow screens, down to one at 320px.'],
    prohibitedUsage: ['Showing placeholder numbers as if they were real.', 'Using a stat with no label.', 'Packing long sentences into a value.'],
    prefer: ['Use StatStrip for three to five headline figures. Use Table for comparable rows of data.'], allowed: [],
    exampleId: 'stat-strip-numbers', previewKey: 'statStripNumbers', exampleComponentIds: ['stat-strip'],
    code: 'import { StatStrip } from "@/components/ui/stat-strip";\n<StatStrip items={[{ id: "members", label: "Team members", value: "24" }, { id: "projects", label: "Active projects", value: "9" }, { id: "regions", label: "Regions" }]} />',
  },
  {
    id: 'cta-panel', name: 'CtaPanel', category: 'layout', purpose: 'Close a page with an emphasized panel and one main action.', shortPurpose: 'Emphasized closing panel with one action.', element: 'div',
    meaning: 'A Card with a heading, an optional description and one main action you supply. The glass surface, edge and fallbacks are Card\'s own; a soft brand tint and an optional dot texture sit behind the content.',
    props: [
      prop('heading', 'string', 'The panel heading.', true), levelProp('heading'),
      prop('description', 'ReactNode', 'Optional supporting text.'),
      prop('action', 'ReactNode', 'The one main action: a Button or a Link you supply.', true),
      prop('texture', 'boolean', 'Add a faint dot pattern behind the text. Decoration; off by default and removed in forced colors.', false, false),
      ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    tokenIds: ['color.primary', 'color.foreground', 'spacing.stack', 'spacing.inline', 'typography.heading', 'typography.title', 'typography.body', 'color.muted-foreground'],
    states: ['default', 'textured', 'focus-visible'],
    keyboard: [{ key: 'Tab', behavior: 'Moves to the supplied action.' }, { key: 'Enter', behavior: 'Activates the action using its own behavior.' }],
    requirements: ['Provide exactly one main action; the panel does not render a second.', 'Text keeps its foreground color on the surface; the tint and texture are decoration and never carry meaning.', 'The texture is off by default and removed in forced colors.', 'The heading level is supplied by the page.'],
    prohibitedUsage: ['Two competing primary actions in one panel.', 'Placing the only copy of important content in the texture or tint.', 'Using it for several sections in a row; one closing panel per page.'],
    prefer: ['Use CtaPanel once to close a page. Use Card for ordinary content groups.'], allowed: ['card', 'button', 'link'],
    constraints: ['The glass look comes from the theme surface through Card, not from a separate variant.'],
    exampleId: 'cta-panel-start', previewKey: 'ctaPanelStart', exampleComponentIds: ['cta-panel', 'button'],
    code: 'import { CtaPanel } from "@/components/ui/cta-panel";\nimport { Button } from "@/components/ui/button";\n<CtaPanel heading="Ready to start?" description="Create a workspace in a minute." action={<Button>Create workspace</Button>} />',
  },
];

export const sectionComponentContracts: ComponentContract[] = entries.map(entry => ({
  id: entry.id, name: entry.name, publicImport: { module: `@/components/ui/${entry.id}`, exportName: entry.name },
  purpose: entry.purpose, shortPurpose: entry.shortPurpose, category: entry.category, maturity: 'experimental', interactive: Boolean(entry.keyboard),
  semantics: { element: entry.element, meaning: entry.meaning }, anatomy: [{ part: 'root', description: entry.meaning }], props: entry.props,
  variants: entry.variants ?? {}, compoundVariants: [],
  themeDefaults: entry.variants?.size ? { size: entry.variants.size } : {}, states: entry.states, tokenIds: entry.tokenIds,
  accessibility: { status: 'not-reviewed', requirements: entry.requirements, keyboard: entry.keyboard ?? [], ruleIds: entry.keyboard ? ['wcag-focus-visible'] : [] },
  composition: { allowedComponentIds: entry.allowed ?? [], constraints: entry.constraints ?? ['Composed from existing primitives; content and assets come from the consumer.'] },
  prohibitedUsage: entry.prohibitedUsage, exampleIds: [entry.exampleId], ruleIds: entry.keyboard ? ['wcag-focus-visible'] : [],
  aiGuidance: { prefer: entry.prefer, avoid: entry.prohibitedUsage },
}));
export const sectionComponentExamples: Example[] = entries.map(entry => ({
  id: entry.exampleId, title: entry.purpose, componentIds: entry.exampleComponentIds ?? [entry.id], code: entry.code, intent: 'recommended', previewKey: entry.previewKey,
}));
