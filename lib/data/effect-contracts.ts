import type { ComponentContract, Example } from '@/lib/contract/schema';

// X4 optional effects: each one decorates content that already reads and works without it. Motion is opt-in, and reduced motion and forced colors return the plain element.
type Entry = {
  id: string; name: string; category: ComponentContract['category']; purpose: string; shortPurpose: string; element: string; meaning: string;
  props: ComponentContract['props']; variants?: ComponentContract['variants']; tokenIds: string[]; states: string[];
  requirements: string[]; prohibitedUsage: string[]; prefer: string[]; allowed?: string[];
  /** Set only when the component is a real control (MenuToggle). */
  keyboard?: ComponentContract['accessibility']['keyboard'];
  exampleId: string; previewKey: string; code: string;
};
const prop = (name: string, type: string, description: string, required = false, defaultValue?: string | number | boolean): ComponentContract['props'][number] =>
  ({ name, type, description, required, ...(defaultValue === undefined ? {} : { defaultValue }) });
const choice = (name: string, values: string[], description: string): ComponentContract['props'][number] => ({ ...prop(name, values.join(' | '), description), defaultValue: values[0], allowedValues: values });
const common = [prop('className', 'string', 'Additional class for placement.')];

const entries: Entry[] = [
  {
    id: 'animated-badge', name: 'AnimatedBadge', category: 'feedback', purpose: 'Draw attention to a short label with a glint that travels along its border.', shortPurpose: 'Badge with an optional border glint.', element: 'span',
    meaning: 'A Badge with an optional decorative glint on its border. The label, fill and tone are Badge\'s own, so the text reads the same with the glint off.',
    props: [
      { ...prop('tone', 'BadgeTone', 'Semantic status, shared with Badge. The theme default for Badge applies when omitted.'), allowedValues: ['neutral', 'primary', 'success', 'warning', 'destructive'] },
      prop('icon', 'ReactNode', 'Optional decorative mark before the text, hidden from assistive technology.'),
      prop('animated', 'boolean', 'Run the border glint. Off by default; removed by reduced motion and forced colors.', false, false),
      prop('children', 'ReactNode', 'Short label text.', true), ...common, prop('ref', 'Ref<HTMLSpanElement>', 'Root element reference.'),
    ],
    tokenIds: ['color.accent', 'motion.duration'], states: ['static', 'animating', 'reduced-motion'],
    requirements: ['Keep the label as text; the glint is decoration and never carries the meaning.', 'The glint is off by default and stops under reduced motion and in forced colors, leaving a plain Badge.', 'Use it for at most one badge in view.'],
    prohibitedUsage: ['Putting the only status of an item in the glint.', 'Animating several badges at once.', 'Using it as a button; it has no interaction.'],
    prefer: ['Use AnimatedBadge for one new or featured label. Use Badge for everything else.'], allowed: ['badge'],
    exampleId: 'animated-badge-new', previewKey: 'animatedBadgeNew',
    code: 'import { AnimatedBadge } from "@/components/ui/animated-badge";\n<AnimatedBadge animated tone="primary">New</AnimatedBadge>',
  },
  {
    id: 'shiny-text', name: 'ShinyText', category: 'layout', purpose: 'Sweep a soft highlight across one short passage of text.', shortPurpose: 'Text with an optional sweeping highlight.', element: 'span',
    meaning: 'Ordinary inline text. When animated, a highlight sweeps across it; the words stay in the inherited color and stay selectable.',
    props: [prop('animated', 'boolean', 'Run the sweep. Off by default; removed by reduced motion and forced colors.', false, false), prop('children', 'ReactNode', 'The passage to highlight.', true), ...common, prop('ref', 'Ref<HTMLSpanElement>', 'Root element reference.')],
    tokenIds: ['color.primary', 'motion.duration'], states: ['static', 'animating', 'reduced-motion'],
    requirements: ['The text is readable without the sweep, in the inherited color.', 'Use it sparingly: one short passage per page, never body copy.', 'The sweep stops under reduced motion and in forced colors and the text returns to its plain fill.'],
    prohibitedUsage: ['Applying it to paragraphs or to several passages.', 'Relying on the sweep to show that text is important.', 'Using it on text that must meet a contrast level only the sweep colors achieve.'],
    prefer: ['Use ShinyText for one headline word or phrase on a marketing page.'],
    exampleId: 'shiny-text-headline', previewKey: 'shinyTextHeadline',
    code: 'import { ShinyText } from "@/components/ui/shiny-text";\n<h2>Ship <ShinyText animated>faster</ShinyText> with one system</h2>',
  },
  {
    id: 'rotating-word', name: 'RotatingWord', category: 'layout', purpose: 'Cycle one headline word through a list without moving the text around it.', shortPurpose: 'Headline word that can cycle a list.', element: 'span',
    meaning: 'A word in a headline. Every word occupies the same space, so the line never changes width, and one visually hidden phrase is what assistive technology reads.',
    props: [
      prop('words', 'string[]', 'The words in display order. One word is static text; an empty list renders nothing.', true),
      prop('label', 'string', 'The phrase assistive technology reads in place of the cycling words. Defaults to every word, in order, separated by commas.'),
      prop('animated', 'boolean', 'Cycle through the words. Off by default, and the first word stays.', false, false),
      prop('interval', 'number', 'Milliseconds each word stays. Never less than 1000.', false, 3000),
      prop('paused', 'boolean', 'Stop cycling while true, for a page-level pause control.', false, false), ...common, prop('ref', 'Ref<HTMLSpanElement>', 'Root element reference.'),
    ],
    tokenIds: ['motion.duration'], states: ['static', 'cycling', 'paused', 'reduced-motion'],
    requirements: ['Reserve space for the widest word so the headline does not jump.', 'The cycling words are hidden from assistive technology; one hidden phrase is read once and never re-announced.', 'Cycling is off by default, starts after hydration and stops under reduced motion (the first word stays) and while the pointer is over the word.', 'Offer a way to pause when cycling lasts more than five seconds; `paused` is for that control.'],
    prohibitedUsage: ['Cycling a word that carries information people must read in full.', 'Rotating several words in one headline.', 'Putting the only call to action in a rotating word.'],
    prefer: ['Use RotatingWord for one decorative word in a headline, with a stable label.'],
    exampleId: 'rotating-word-headline', previewKey: 'rotatingWordHeadline',
    code: 'import { RotatingWord } from "@/components/ui/rotating-word";\n<h2>Built for <RotatingWord animated words={["teams", "designers", "agents"]} /></h2>',
  },
  {
    id: 'menu-toggle', name: 'MenuToggle', category: 'navigation', purpose: 'Open and close a menu or panel with a button whose bars turn into a close mark.', shortPurpose: 'Show or hide a menu with a bars-to-close button.', element: 'button',
    meaning: 'A native button with a fixed accessible name and `aria-expanded`. The bars turn into a close mark when expanded, so the state is a shape and not only a color.',
    props: [
      prop('label', 'string', 'Accessible name. It stays the same whether the menu is open or closed; `aria-expanded` carries the state.', true),
      prop('expanded', 'boolean', 'Controlled expanded state.'), prop('defaultExpanded', 'boolean', 'Initial state when uncontrolled.', false, false),
      prop('onExpandedChange', '(expanded: boolean) => void', 'Called with the new state after a press. The page shows or hides the menu.'),
      prop('controls', 'string', 'Id of the menu or panel this button shows, for `aria-controls`.'),
      choice('size', ['medium', 'small', 'large'], 'Icon size. The target is never smaller than the minimum target size.'),
      prop('animated', 'boolean', 'Ease the bars into the close mark. Reduced motion swaps them instantly.', false, true), prop('disabled', 'boolean', 'Disable the button.'), ...common, prop('ref', 'Ref<HTMLButtonElement>', 'Button element reference.'),
    ],
    variants: { size: ['medium', 'small', 'large'] },
    tokenIds: ['spacing.target-minimum', 'radius.control', 'color.foreground', 'color.muted', 'color.focus', 'motion.duration'],
    states: ['collapsed', 'expanded', 'hover', 'focus-visible', 'disabled', 'reduced-motion'],
    keyboard: [{ key: 'Enter', behavior: 'Toggle when focused and enabled.' }, { key: 'Space', behavior: 'Toggle using native button behavior.' }],
    requirements: ['Always supply `label`; do not change it when the state changes.', '`aria-expanded` carries the state and `controls` points at the panel it shows.', 'Keep the panel reachable without the toggle\'s animation.', 'The bars-to-close change is a shape; reduced motion applies it instantly.'],
    prohibitedUsage: ['Using it for an action that is not showing or hiding something.', 'Changing the label between "Open menu" and "Close menu" while also setting `aria-expanded`.', 'Expecting it to render or manage the menu.'],
    prefer: ['Use MenuToggle to open a navigation drawer or a collapsed menu.'], allowed: [],
    exampleId: 'menu-toggle-nav', previewKey: 'menuToggleNav',
    code: 'import { MenuToggle } from "@/components/ui/menu-toggle";\n<MenuToggle label="Menu" controls="site-menu" />',
  },
];

export const effectComponentContracts: ComponentContract[] = entries.map(entry => ({
  id: entry.id, name: entry.name, publicImport: { module: `@/components/ui/${entry.id}`, exportName: entry.name },
  purpose: entry.purpose, shortPurpose: entry.shortPurpose, category: entry.category, maturity: 'experimental', interactive: Boolean(entry.keyboard),
  semantics: { element: entry.element, meaning: entry.meaning }, anatomy: [{ part: 'root', description: entry.meaning }], props: entry.props,
  variants: entry.variants ?? {}, compoundVariants: [],
  themeDefaults: entry.variants?.size ? { size: entry.variants.size } : {}, states: entry.states, tokenIds: entry.tokenIds,
  accessibility: { status: 'not-reviewed', requirements: entry.requirements, keyboard: entry.keyboard ?? [], ruleIds: entry.keyboard ? ['wcag-focus-visible'] : [] },
  composition: { allowedComponentIds: entry.allowed ?? [], constraints: ['The effect is optional: content and controls work without it, and reduced motion and forced colors remove it.'] },
  prohibitedUsage: entry.prohibitedUsage, exampleIds: [entry.exampleId], ruleIds: entry.keyboard ? ['wcag-focus-visible'] : [],
  aiGuidance: { prefer: entry.prefer, avoid: entry.prohibitedUsage },
}));
export const effectComponentExamples: Example[] = entries.map(entry => ({
  id: entry.exampleId, title: entry.purpose, componentIds: [entry.id], code: entry.code, intent: 'recommended', previewKey: entry.previewKey,
}));
