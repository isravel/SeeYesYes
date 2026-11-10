import type { ComponentContract, Example } from '@/lib/contract/schema';

// X3 disclosure and navigation compositions: Disclosure, Accordion, Pagination and Breadcrumbs. Each is built from native buttons, links and lists.
type Entry = {
  id: string; name: string; category: ComponentContract['category']; purpose: string; shortPurpose: string; element: string; meaning: string;
  anatomy: ComponentContract['anatomy']; props: ComponentContract['props']; variants: ComponentContract['variants']; themeDefaults: ComponentContract['themeDefaults'];
  states: string[]; tokenIds: string[]; keyboard: { key: string; behavior: string }[]; requirements: string[]; prohibitedUsage: string[];
  prefer: string[]; allowed: string[]; exampleId: string; previewKey: string; code: string;
};
const prop = (name: string, type: string, description: string, required = false, defaultValue?: string | number | boolean): ComponentContract['props'][number] =>
  ({ name, type, description, required, ...(defaultValue === undefined ? {} : { defaultValue }) });
const choice = (name: string, values: string[], description: string): ComponentContract['props'][number] => ({ ...prop(name, values.join(' | '), description), defaultValue: values[0], allowedValues: values });
const levels = [2, 3, 4, 5, 6];
const common = [prop('className', 'string', 'Additional class for placement.')];

const entries: Entry[] = [
  {
    id: 'disclosure', name: 'Disclosure', category: 'layout', purpose: 'Show or hide one block of content from a single trigger.', shortPurpose: 'Show or hide one block of content.', element: 'div',
    meaning: 'A native button with `aria-expanded` and `aria-controls` that shows or hides a panel. Collapsed content is `hidden`, so it cannot receive focus.',
    anatomy: [{ part: 'root', description: 'Wrapper that owns the pointer-hover enhancement.' }, { part: 'trigger', description: 'Native button, optionally inside a heading.' }, { part: 'panel', description: 'Content, hidden while collapsed.' }],
    props: [
      prop('label', 'string', 'Visible trigger text.', true), prop('children', 'ReactNode', 'The content to show or hide.', true),
      prop('open', 'boolean', 'Controlled open state.'), prop('defaultOpen', 'boolean', 'Initial open state when uncontrolled.', false, false), prop('onOpenChange', '(open: boolean) => void', 'Called with the new state after a click.'),
      prop('openOnHover', 'boolean', 'Mouse-only preview: hovering shows the content and leaving hides it unless a click opened it. Keyboard and touch use the click path.', false, false),
      { ...prop('headingLevel', '2 | 3 | 4 | 5 | 6', 'Put the trigger inside a heading of this level and name the panel as a region. Omit it when the page structure does not call for a heading.'), allowedValues: levels },
      prop('disabled', 'boolean', 'Disable the trigger.'), ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    variants: {}, themeDefaults: {},
    states: ['collapsed', 'expanded', 'hover', 'focus-visible', 'disabled', 'reduced-motion'],
    tokenIds: ['color.foreground', 'typography.label', 'typography.weight-medium', 'spacing.inline', 'spacing.target-minimum', 'spacing.control-block', 'spacing.control-inline', 'radius.control', 'color.muted', 'color.focus', 'motion.duration'],
    keyboard: [{ key: 'Enter', behavior: 'Toggle the content when the trigger is focused.' }, { key: 'Space', behavior: 'Toggle using native button behavior.' }],
    requirements: ['Use a native button as the trigger, with `aria-expanded` and `aria-controls`.', 'Hide collapsed content with `hidden` so it is not focusable or announced.', 'Keep hover optional: every action is also available by click and keyboard.', 'The chevron turns but does not carry the state alone; `aria-expanded` does.'],
    prohibitedUsage: ['Opening only on hover, which excludes keyboard and touch users.', 'Putting content that must be seen first behind a collapsed trigger.'],
    prefer: ['Use Disclosure for one optional block such as "more details".'], allowed: [],
    exampleId: 'disclosure-details', previewKey: 'disclosureDetails',
    code: 'import { Disclosure } from "@/components/ui/disclosure";\n<Disclosure label="Shipping details"><p>Orders ship within two business days.</p></Disclosure>',
  },
  {
    id: 'accordion', name: 'Accordion', category: 'layout', purpose: 'Stack sections that expand one at a time or together.', shortPurpose: 'Stack sections that expand one at a time or together.', element: 'div',
    meaning: 'A stack of Disclosures. Each trigger sits in a heading and each panel is a region named by that heading.',
    anatomy: [{ part: 'root', description: 'Container for the sections.' }, { part: 'section', description: 'One Disclosure with a heading, a trigger and a panel.' }],
    props: [
      prop('items', 'AccordionItem[]', 'Sections with an `id`, `label`, `content` and optional `disabled`.', true), choice('mode', ['single', 'multiple'], 'Single keeps one section open at a time; multiple lets any number stay open.'),
      prop('collapsible', 'boolean', 'In single mode, allow the open section to close. When false, one section stays open once chosen.', false, true),
      prop('value', 'string[]', 'Controlled open section ids.'), prop('defaultValue', 'string[]', 'Initially open section ids when uncontrolled. All collapsed when omitted.'),
      prop('onChange', '(values: string[]) => void', 'Called with the open section ids, in item order.'),
      { ...prop('headingLevel', '2 | 3 | 4 | 5 | 6', 'Heading level for every trigger; choose it to fit the page outline.', false, 3), allowedValues: levels }, ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    variants: { mode: ['single', 'multiple'] }, themeDefaults: {},
    states: ['default', 'collapsed', 'expanded', 'disabled'],
    tokenIds: ['color.border'],
    keyboard: [{ key: 'Tab', behavior: 'Move between section triggers; collapsed content is skipped.' }, { key: 'Enter', behavior: 'Toggle the focused section.' }, { key: 'Space', behavior: 'Toggle using native button behavior.' }],
    requirements: ['Give every trigger a heading level that fits the page outline.', 'Collapsed content cannot receive focus.', 'In single mode with `collapsible` off, say so nearby: the open section cannot be closed.', 'Arrow-key movement between triggers is not provided; Tab reaches each one.'],
    prohibitedUsage: ['Hiding content that most readers need to compare side by side.', 'Nesting accordions several levels deep.'],
    prefer: ['Use Accordion for several related sections such as an FAQ.'], allowed: ['disclosure'],
    exampleId: 'accordion-faq', previewKey: 'accordionFaq',
    code: 'import { Accordion } from "@/components/ui/accordion";\n<Accordion items={[{ id: "shipping", label: "Shipping", content: "Orders ship within two business days." }, { id: "returns", label: "Returns", content: "Return items within thirty days." }, { id: "support", label: "Support", content: "Write to us any time." }]} />',
  },
  {
    id: 'pagination', name: 'Pagination', category: 'navigation', purpose: 'Move between the pages of a long list.', shortPurpose: 'Move between pages of a list.', element: 'nav',
    meaning: 'A named navigation landmark with a list of page controls. The current page has `aria-current="page"`. Pages are links when `getHref` is given, buttons otherwise.',
    anatomy: [{ part: 'root', description: 'Named navigation landmark.' }, { part: 'previous', description: 'Previous-page control, disabled on the first page.' }, { part: 'page', description: 'Page link or button; the current one is marked.' }, { part: 'ellipsis', description: 'Hidden placeholder for skipped pages; not actionable.' }, { part: 'next', description: 'Next-page control, disabled on the last page.' }],
    props: [
      prop('pageCount', 'number', 'Total number of pages. Renders nothing when zero.', true), prop('page', 'number', 'Controlled current page, starting at 1.'), prop('defaultPage', 'number', 'Initial page when uncontrolled.', false, 1),
      prop('onPageChange', '(page: number) => void', 'Called with the chosen page. The caller loads the data.'), prop('getHref', '(page: number) => string', 'Makes each page a real link to this address instead of a button.'),
      prop('label', 'string', 'Accessible name for the landmark. Make it distinct when a page has several.', false, 'Pagination'),
      { ...prop('size', 'small | medium | large', 'Control size.'), defaultValue: 'medium', allowedValues: ['small', 'medium', 'large'] },
      prop('siblings', 'number', 'Pages shown on each side of the current page before an ellipsis.', false, 1), prop('previousLabel', 'string', 'Text of the previous control.', false, 'Previous'), prop('nextLabel', 'string', 'Text of the next control.', false, 'Next'),
      prop('pageLabel', '(page: number) => string', 'Accessible name of a page control. Defaults to "Page N".'), ...common, prop('ref', 'Ref<HTMLElement>', 'Landmark element reference.'),
    ],
    variants: { size: ['small', 'medium', 'large'] }, themeDefaults: { size: ['small', 'medium', 'large'] },
    states: ['default', 'current', 'first', 'last', 'hover', 'focus-visible', 'disabled'],
    tokenIds: ['color.foreground', 'typography.label', 'typography.caption', 'typography.heading', 'spacing.inline', 'spacing.target-minimum', 'spacing.control-block', 'spacing.control-inline', 'radius.control', 'color.muted', 'color.primary', 'color.on-primary', 'typography.weight-medium', 'color.focus', 'color.muted-foreground'],
    keyboard: [{ key: 'Tab', behavior: 'Move between the enabled page controls; ellipses and disabled ends are skipped.' }, { key: 'Enter', behavior: 'Go to the focused page.' }, { key: 'Space', behavior: 'Go to the focused page when it is a button.' }],
    requirements: ['Name the landmark, and make the name distinct when a page has several.', 'Mark the current page with `aria-current`; it also differs by fill and weight, not color alone.', 'Use `getHref` when each page has its own address, so links work without script.', 'The first and last pages are always shown, and ellipses are not focusable.'],
    prohibitedUsage: ['Fetching data inside the component.', 'Using Pagination for steps in a flow; use a stepper or Tabs.'],
    prefer: ['Use Pagination below a long list or table.'], allowed: [],
    exampleId: 'pagination-results', previewKey: 'paginationResults',
    code: 'import { Pagination } from "@/components/ui/pagination";\n<Pagination label="Example pages" pageCount={12} defaultPage={6} />',
  },
  {
    id: 'breadcrumbs', name: 'Breadcrumbs', category: 'navigation', purpose: 'Show where the current page sits in the hierarchy.', shortPurpose: 'Show where this page sits in the hierarchy.', element: 'nav',
    meaning: 'A named navigation landmark with an ordered list. Ancestors are links; the last item is the current page and is not a link.',
    anatomy: [{ part: 'root', description: 'Named navigation landmark.' }, { part: 'link', description: 'Link to an ancestor page.' }, { part: 'current', description: 'Text for the current page, with `aria-current="page"`.' }, { part: 'separator', description: 'Decorative glyph hidden from assistive technology.' }],
    props: [
      prop('items', 'BreadcrumbItem[]', 'The trail in display order, each with a `label` and an `href`. The last item is the current page. Renders nothing when empty.', true),
      prop('label', 'string', 'Accessible name for the landmark. Make it distinct when a page has several.', false, 'Breadcrumbs'), choice('separator', ['slash', 'chevron'], 'Glyph between items. It is decorative.'), ...common, prop('ref', 'Ref<HTMLElement>', 'Landmark element reference.'),
    ],
    variants: { separator: ['slash', 'chevron'] }, themeDefaults: {},
    states: ['default', 'current', 'hover', 'focus-visible'],
    tokenIds: ['color.muted-foreground', 'spacing.inline', 'color.foreground', 'color.focus', 'radius.control', 'typography.weight-medium'],
    keyboard: [{ key: 'Tab', behavior: 'Move between the ancestor links; the current page is not a stop.' }, { key: 'Enter', behavior: 'Follow the focused link.' }],
    requirements: ['Supply the real hierarchy; nothing is read from the URL.', 'The last item is the current page and is not a link.', 'Separators are hidden from assistive technology.', 'The list wraps on narrow screens instead of overflowing.'],
    prohibitedUsage: ['Building the trail from the URL path when it differs from the information hierarchy.', 'Linking the current page.'],
    prefer: ['Use Breadcrumbs for a page several levels below the root.'], allowed: [],
    exampleId: 'breadcrumbs-trail', previewKey: 'breadcrumbsTrail',
    code: 'import { Breadcrumbs } from "@/components/ui/breadcrumbs";\n<Breadcrumbs label="Example trail" items={[{ label: "Components", href: "/components" }, { label: "Navigation", href: "/components?category=navigation" }, { label: "Breadcrumbs", href: "/components/breadcrumbs" }]} />',
  },
];

export const compositionComponentContracts: ComponentContract[] = entries.map(entry => ({
  id: entry.id, name: entry.name, publicImport: { module: `@/components/ui/${entry.id}`, exportName: entry.name },
  purpose: entry.purpose, shortPurpose: entry.shortPurpose, category: entry.category, maturity: 'experimental', interactive: true,
  semantics: { element: entry.element, meaning: entry.meaning }, anatomy: entry.anatomy, props: entry.props,
  variants: entry.variants, compoundVariants: [], themeDefaults: entry.themeDefaults, states: entry.states, tokenIds: entry.tokenIds,
  accessibility: { status: 'not-reviewed', requirements: entry.requirements, keyboard: entry.keyboard, ruleIds: ['wcag-focus-visible'] },
  composition: { allowedComponentIds: entry.allowed, constraints: ['Keep native buttons and links, visible names and focus indicators.'] },
  prohibitedUsage: entry.prohibitedUsage, exampleIds: [entry.exampleId], ruleIds: ['wcag-focus-visible'],
  aiGuidance: { prefer: entry.prefer, avoid: entry.prohibitedUsage },
}));
export const compositionComponentExamples: Example[] = entries.map(entry => ({
  id: entry.exampleId, title: entry.purpose, componentIds: [entry.id], code: entry.code, intent: 'recommended', previewKey: entry.previewKey,
}));
