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
  {
    id: 'logo', name: 'Logo', category: 'layout', purpose: 'Show your own mark, wordmark or both under one stable name, with a text fallback.', shortPurpose: 'Slot for a supplied mark and wordmark.', element: 'span',
    meaning: 'One image with a fixed accessible name. The mark and wordmark are decoration of that name, so they never add to what assistive technology reads. The system ships no brand; the mark and text come from you.',
    props: [
      prop('label', 'string', 'Accessible name of the whole logo, for example the product name. It does not change with the image or wordmark.', true),
      prop('src', 'string', 'URL of the supplied mark image. If it fails to load, the wordmark (or the label) shows as text.'),
      prop('mark', 'ReactNode', 'An inline mark, such as an SVG, used when there is no `src`. Hidden from assistive technology.'),
      prop('wordmark', 'string', 'Optional text shown beside the mark. With neither a mark nor a wordmark, the label is shown as the text.'),
      choice('size', ['medium', 'small', 'large'], 'Height of the mark; the wordmark scales with it.'),
      prop('animated', 'boolean', 'Give the mark a slow breathing motion. Off by default; removed by reduced motion.', false, false), ...common, prop('ref', 'Ref<HTMLSpanElement>', 'Root element reference.'),
    ],
    variants: { size: ['medium', 'small', 'large'] },
    tokenIds: ['spacing.inline', 'color.foreground', 'typography.weight-medium', 'motion.duration'], states: ['static', 'animating', 'image-unavailable', 'reduced-motion'],
    requirements: ['Always supply `label`; the parts inside never add to the name.', 'Supply the identity yourself. The system does not create, copy or include a brand mark.', 'If the image cannot load, text takes its place so the slot is never empty.', 'Motion is off by default and removed by reduced motion; the wordmark never moves.'],
    prohibitedUsage: ['Adding a third-party or invented brand as a default.', 'Repeating the product name in `label` and in a separate visible heading right beside it without need.', 'Using the logo as the only link text without wrapping it in a Link that has its own name.'],
    prefer: ['Use Logo in a header or footer with your own `src` or `mark`; wrap it in Link to make a home link.'], allowed: ['link'],
    exampleId: 'logo-header', previewKey: 'logoHeader',
    code: 'import { Logo } from "@/components/ui/logo";\n<Logo label="Acme" src="/acme-mark.svg" wordmark="Acme" />',
  },
  {
    id: 'fancy-arrow', name: 'FancyArrow', category: 'layout', purpose: 'Place a supplied decorative arrow beside content, inline or in a corner.', shortPurpose: 'Supplied decorative arrow with placement.', element: 'span',
    meaning: 'A decorative arrow you supply. It is hidden from assistive technology, has no focus and ignores the pointer, so the nearby text carries the meaning. With `alt` it becomes one named image.',
    props: [
      prop('src', 'string', 'URL of the supplied arrow image. The art is assumed to point right.'),
      prop('children', 'ReactNode', 'An inline arrow, such as an SVG, used when there is no `src`.'),
      prop('alt', 'string', 'Text alternative. Set it only when the arrow carries meaning the nearby text does not; leave it out for a decorative arrow.'),
      choice('placement', ['inline', 'top-start', 'top-end', 'bottom-start', 'bottom-end'], 'Inline in the flow, or a corner of the nearest positioned parent.'),
      choice('direction', ['right', 'down', 'left', 'up'], 'Turn or mirror the art, which is assumed to point right.'), ...common, prop('ref', 'Ref<HTMLSpanElement>', 'Root element reference.'),
    ],
    variants: { placement: ['inline', 'top-start', 'top-end', 'bottom-start', 'bottom-end'], direction: ['right', 'down', 'left', 'up'] },
    tokenIds: ['color.muted-foreground', 'typography.caption'], states: ['decorative', 'named', 'image-unavailable'],
    requirements: ['A decorative arrow is hidden from assistive technology and never focusable; the adjacent content states the meaning.', 'Use `alt` only for an arrow that adds meaning, and then keep it short.', 'Supply the art yourself. The system includes no arrow asset.', 'A failed image disappears when decorative and shows its `alt` text when named.'],
    prohibitedUsage: ['Making the arrow the only way to understand a step or a direction.', 'Making it a button or link; wrap real controls instead.', 'Giving a purely decorative arrow an `alt`.'],
    prefer: ['Use FancyArrow to point from a heading or note toward a control that already has its own label.'],
    exampleId: 'fancy-arrow-hint', previewKey: 'fancyArrowHint',
    code: 'import { FancyArrow } from "@/components/ui/fancy-arrow";\n<FancyArrow src="/arrow.svg" />',
  },
  {
    id: 'tilt-card', name: 'TiltCard', category: 'layout', purpose: 'Lean a card toward a mouse or pen pointer, with optional layer depth.', shortPurpose: 'Card that can lean toward the pointer.', element: 'div',
    meaning: 'A Card. Its surface, glass look, reading order and content are Card\'s own; the lean is an opt-in transform that follows a mouse or pen pointer. It is not a button and has no role.',
    props: [
      prop('tilt', 'boolean', 'Lean toward the pointer. Off by default; never follows touch or keyboard focus and is removed by reduced motion.', false, false),
      prop('maxTilt', 'number', 'Largest lean in degrees. Clamped between 0 and 15.', false, 8),
      prop('depth', 'boolean', 'Also shift descendants marked `data-tilt-layer` against the lean. Needs `tilt`.', false, false),
      { ...prop('variant', "'default' | 'outlined' | 'elevated'", 'Card variant; the theme default for Card applies when omitted.'), allowedValues: ['default', 'outlined', 'elevated'] },
      prop('children', 'ReactNode', 'Card content. Any action inside stays clickable and focusable as usual.', true), ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    tokenIds: ['motion.duration', 'motion.easing'], states: ['rest', 'tilting', 'reduced-motion'],
    requirements: ['The card reads and works the same with tilt off, on touch, with the keyboard and under reduced motion.', 'Never give the card a button role or click handler; put actions inside it.', 'Keep the lean small; the default of 8 degrees keeps text legible.', 'Use at most a few tilting cards in view.'],
    prohibitedUsage: ['Using tilt as the only sign that a card is interactive.', 'Tilting a card that holds long text or a form.', 'Making the whole card the click target.'],
    prefer: ['Use TiltCard for a featured piece of marketing content. Use Card for everything else.'], allowed: ['card'],
    exampleId: 'tilt-card-feature', previewKey: 'tiltCardFeature',
    code: 'import { TiltCard } from "@/components/ui/tilt-card";\n<TiltCard tilt><h3>Feature</h3><p>Hover to lean.</p></TiltCard>',
  },
  {
    id: 'card-swap', name: 'CardSwap', category: 'layout', purpose: 'Bring one card of a stack to the front with Previous and Next buttons.', shortPurpose: 'Stack of cards with manual swap.', element: 'div',
    meaning: 'A named group of cards where one is in front. Every card stays in the document in the order given; only the front card is exposed to assistive technology and the keyboard. A status line says which card is in front.',
    props: [
      prop('label', 'string', 'Accessible name of the group.', true),
      prop('items', 'CardSwapItem[]', 'The cards in reading order, each with a stable `id` and `content`. An empty list renders nothing.', true),
      prop('defaultIndex', 'number', 'Index of the card in front at the start.', false, 0),
      prop('onIndexChange', '(index: number) => void', 'Called with the new front index after a swap.'),
      prop('autoplay', 'boolean', 'Swap on a timer. Off by default. Pauses on hover and focus, adds a pause button, and never runs under reduced motion.', false, false),
      prop('interval', 'number', 'Milliseconds each card stays in front when `autoplay` is on. Never less than 3000.', false, 5000), ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    tokenIds: ['spacing.inline', 'spacing.stack', 'color.muted-foreground', 'typography.caption', 'motion.duration', 'motion.easing'], states: ['front', 'swapping', 'paused', 'reduced-motion'],
    keyboard: [{ key: 'Tab', behavior: 'Moves into the front card, then through Previous card, Next card and, with autoplay, the pause button. Cards behind are skipped.' }, { key: 'Enter', behavior: 'Activates the focused button.' }, { key: 'Space', behavior: 'Activates the focused button.' }],
    requirements: ['Cards behind the front one are inert: not focusable and not read.', 'Previous and Next are real buttons with fixed names; a status line reports "Card N of M".', 'Autoplay is off by default; when on it pauses on hover and focus, has a visible pause button and stops under reduced motion.', 'The stack keeps the height of the tallest card so the page does not jump.'],
    prohibitedUsage: ['Hiding essential content only in cards behind the front one.', 'Autoplay for content people must read in full.', 'Putting a single card in a swap; use a Card.'],
    prefer: ['Use CardSwap to show a few related highlights in one spot. Use Carousel-style navigation for long lists.'], allowed: ['card', 'button'],
    exampleId: 'card-swap-highlights', previewKey: 'cardSwapHighlights',
    code: 'import { CardSwap } from "@/components/ui/card-swap";\n<CardSwap label="Highlights" items={[{ id: "a", content: <p>First</p> }, { id: "b", content: <p>Second</p> }]} />',
  },
  {
    id: 'carousel', name: 'Carousel', category: 'layout', purpose: 'Scroll through a row of slides that snap into place, with Previous and Next buttons and optional autoplay.', shortPurpose: 'Scroll-snap row of slides with buttons.', element: 'div',
    meaning: 'A named region holding a sideways-scrolling row of slides. The browser does the scrolling and snapping, so swipe, trackpad, scrollbar and the arrow keys on the focused row work natively. Previous and Next buttons and a status line ("Slide 2 of 5") follow where the row actually is. There is no loop.',
    props: [
      prop('label', 'string', 'Accessible name of the carousel.', true),
      prop('items', 'CarouselItem[]', 'The slides in reading order, each with a stable `id` and `content`. An empty list renders nothing.', true),
      prop('autoplay', 'boolean', 'Move to the next slide on a timer. Off by default. Pauses on mouse hover, focus and touch, adds a pause button, stops on the last slide, and never runs under reduced motion.', false, false),
      prop('interval', 'number', 'Milliseconds each slide stays when `autoplay` is on. Never less than 3000.', false, 3000),
      prop('edgeFade', 'boolean', 'Soften an edge of the row, only where more slides lie beyond it. Decoration; removed in forced colors.', false, false),
      prop('peek', 'boolean', 'Make slides narrower so the start of the next one shows, hinting that the row scrolls.', false, false),
      prop('onIndexChange', '(index: number) => void', 'Called with the index of the slide at the start of the row whenever scrolling settles on a different one.'), ...common, prop('ref', 'Ref<HTMLDivElement>', 'Root element reference.'),
    ],
    tokenIds: ['spacing.inline', 'spacing.stack', 'color.focus', 'color.muted-foreground', 'typography.caption'], states: ['manual', 'autoplay', 'first', 'middle', 'last', 'paused', 'focus-visible', 'reduced-motion'],
    keyboard: [
      { key: 'Tab', behavior: 'Moves to the scrolling row, then through any controls inside the slides, then Previous slide, Next slide and, with autoplay, the pause button. A control in an off-screen slide scrolls into view when it takes focus.' },
      { key: 'ArrowLeft / ArrowRight', behavior: 'Scroll the focused row sideways; it snaps to a slide. This is the browser\'s own scrolling.' },
      { key: 'Enter', behavior: 'Activates the focused button.' }, { key: 'Space', behavior: 'Activates the focused button.' },
    ],
    requirements: ['Scrolling is native scroll-snap; no scripted drag handler replaces it, so touch swipe, momentum and the scrollbar keep working.', 'Previous and Next are real buttons with fixed names; each is disabled at its end because there is no loop. Focus moves to the other button when the one holding it is disabled.', 'Autoplay is off by default; when on it pauses on mouse hover, focus and touch, has a visible pause button, never runs faster than every 3 seconds, stops on the last slide and does not run under reduced motion.', 'The status line follows the real scroll position, and stops announcing while autoplay runs.', 'Every slide stays in the document in reading order and is reachable by scrolling, so nothing is hidden from assistive technology.', 'Slides are laid out left to right; the row does not mirror in right-to-left languages yet.'],
    prohibitedUsage: ['Putting the only copy of important content on a slide that people must swipe to find.', 'Autoplay for content people must read in full.', 'Using a carousel for two or three short items; lay them out in a row or grid.', 'Replacing the buttons with a scripted drag handler.'],
    prefer: ['Use Carousel for a longer row of cards or images. Use CardSwap for a few related highlights stacked in one spot.'], allowed: ['card', 'button', 'media-frame'],
    exampleId: 'carousel-cards', previewKey: 'carouselCards',
    code: 'import { Carousel } from "@/components/ui/carousel";\n<Carousel label="Featured" items={[{ id: "a", content: <p>First</p> }, { id: "b", content: <p>Second</p> }, { id: "c", content: <p>Third</p> }]} />',
  },
  {
    id: 'media-frame', name: 'MediaFrame', category: 'layout', purpose: 'Show an image or video in a frame of fixed proportions with a caption and failure fallback.', shortPurpose: 'Image or video in a fixed-ratio frame.', element: 'figure',
    meaning: 'A figure holding one image or video in a frame whose proportions are fixed, so the page does not jump while it loads. The caption is a real figcaption and a failed load shows readable text, not a broken icon.',
    props: [
      prop('src', 'string', 'URL of the image or video.', true),
      prop('alt', 'string', 'Text alternative. Required; use an empty string only for a purely decorative image.', true),
      choice('kind', ['image', 'video'], 'What `src` is. A video has native controls; pass `<track>` children for captions.'),
      choice('ratio', ['16:9', '4:3', '1:1', '3:2', '21:9'], 'Proportions of the frame. Its width comes from the parent.'),
      choice('fit', ['cover', 'contain'], 'Crop to fill the frame, or show all of the media inside it.'),
      choice('hover', ['none', 'zoom', 'color'], 'Optional decoration for images when hovered; reduced motion removes the movement.'),
      prop('vignette', 'boolean', 'Darken the edges slightly.', false, false), prop('caption', 'ReactNode', 'Optional caption shown as a figcaption.'),
      prop('fallback', 'ReactNode', 'Shown if the media fails to load. Defaults to the alt text.'), prop('poster', 'string', 'Poster image for a video.'),
      prop('children', 'ReactNode', 'For a video, `<track>` elements.'), ...common, prop('ref', 'Ref<HTMLElement>', 'Figure element reference.'),
    ],
    variants: { ratio: ['16:9', '4:3', '1:1', '3:2', '21:9'], fit: ['cover', 'contain'], hover: ['none', 'zoom', 'color'] },
    tokenIds: ['spacing.inline', 'radius.panel', 'color.muted', 'color.muted-foreground', 'color.foreground', 'typography.caption', 'motion.duration', 'motion.easing'], states: ['loading', 'loaded', 'error', 'hover', 'reduced-motion'],
    requirements: ['Always supply `alt`; a video also needs captions as `<track>` children where it has speech.', 'The frame reserves its ratio before the media loads.', 'Hover and vignette are decoration; nothing depends on them and reduced motion removes the movement.', 'A failed load shows the fallback or the alt text, never a broken-image icon.'],
    prohibitedUsage: ['Putting text that must be read inside the image without repeating it in `alt` or the caption.', 'Autoplaying video; the native controls are always shown.', 'Using the hover color change to show state.'],
    prefer: ['Use MediaFrame for any content image or video with a known ratio. Use Avatar for people.'],
    exampleId: 'media-frame-figure', previewKey: 'mediaFrameFigure',
    code: 'import { MediaFrame } from "@/components/ui/media-frame";\n<MediaFrame src="/picture.jpg" alt="A hillside at dusk" caption="Hillside at dusk" />',
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
