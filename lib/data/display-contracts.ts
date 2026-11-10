import type { ComponentContract, Example } from '@/lib/contract/schema';

// X3 display primitives: small, non-interactive pieces that carry meaning in text. Each is a plain contract with no keyboard behavior.
type Entry = {
  id: string; name: string; category: ComponentContract['category']; purpose: string; shortPurpose: string; element: string; meaning: string;
  props: ComponentContract['props']; variants?: ComponentContract['variants']; tokenIds: string[]; states?: string[];
  requirements: string[]; prohibitedUsage: string[]; prefer?: string[];
  exampleId: string; previewKey: string; code: string;
};
const prop = (name: string, type: string, description: string, required = false): ComponentContract['props'][number] => ({ name, type, description, required });
const choice = (name: string, values: string[], description: string): ComponentContract['props'][number] => ({ ...prop(name, values.join(' | '), description), defaultValue: values[0], allowedValues: values });
const common = [prop('className', 'string', 'Additional class for placement.')];

const entries: Entry[] = [
  {
    id: 'highlight', name: 'Highlight', category: 'layout', purpose: 'Emphasize one key phrase inside running text.', shortPurpose: 'Emphasize a key phrase inline.', element: 'mark', meaning: 'A native mark element: the words stay readable and are announced by assistive technology without the background.',
    props: [prop('children', 'ReactNode', 'The phrase to emphasize.', true), ...common, prop('ref', 'Ref<HTMLElement>', 'Mark element reference.')],
    tokenIds: ['color.primary', 'color.surface', 'color.foreground', 'color.on-primary', 'color.muted', 'radius.control'],
    requirements: ['Keep the phrase readable without the tint; the foreground color supplies the contrast.', 'Use it for at most one phrase in a short passage.', 'Do not rely on the tint alone to convey a status or error.'],
    prohibitedUsage: ['Emphasizing whole paragraphs or several phrases in a row.', 'Using the tint as the only signal for status, errors or required content.'],
    exampleId: 'highlight-note', previewKey: 'highlightNote',
    code: 'import { Highlight } from "@/components/ui/highlight";\n<p>Your export includes <Highlight>every saved theme</Highlight> in this workspace.</p>',
  },
  {
    id: 'level', name: 'Level', category: 'feedback', purpose: 'Show a named level, such as a difficulty, with a dot and text.', shortPurpose: 'Show a named level with a dot.', element: 'span', meaning: 'A text label with a decorative dot. The caller supplies the words; nothing is inferred.',
    props: [choice('tone', ['neutral', 'success', 'warning', 'destructive', 'info'], 'Dot color. It never carries the meaning on its own; the label text does.'), prop('children', 'ReactNode', 'The level name, such as Easy, Medium or Hard.', true), ...common, prop('ref', 'Ref<HTMLSpanElement>', 'Root element reference.')],
    variants: { tone: ['neutral', 'success', 'warning', 'destructive', 'info'] },
    tokenIds: ['color.foreground', 'color.muted-foreground', 'color.border', 'color.success', 'color.warning', 'color.destructive', 'color.info', 'spacing.inline', 'typography.caption', 'typography.weight-medium'],
    requirements: ['Always show the level as text; the dot is decorative and hidden from assistive technology.', 'Choose the tone from what the level means to your audience; the component does not infer difficulty.'],
    prohibitedUsage: ['Showing a dot without a label.', 'Using the tone to imply a level the text does not state.'],
    exampleId: 'level-difficulty', previewKey: 'levelDifficulty',
    code: 'import { Level } from "@/components/ui/level";\n<Level tone="success">Easy</Level>\n<Level tone="warning">Medium</Level>\n<Level tone="destructive">Hard</Level>',
  },
  {
    id: 'live-dot', name: 'LiveDot', category: 'feedback', purpose: 'Show a status dot beside text that states the status.', shortPurpose: 'Show a status dot with text.', element: 'span', meaning: 'A status label with a decorative dot. A filled dot is live and a hollow ring is inactive, so shape and text carry the meaning, not color or motion.',
    props: [choice('status', ['live', 'inactive'], 'Live shows a filled dot; inactive shows a hollow ring.'), choice('size', ['small', 'medium'], 'Dot and text size.'), { ...prop('animated', 'boolean', 'Add a ping to a live dot. Off by default, ignored when inactive, and removed by reduced motion.'), defaultValue: false }, prop('children', 'ReactNode', 'Text that states the status, such as "Live now".', true), ...common, prop('ref', 'Ref<HTMLSpanElement>', 'Root element reference.')],
    variants: { status: ['live', 'inactive'], size: ['small', 'medium'] },
    tokenIds: ['color.foreground', 'color.success', 'color.muted-foreground', 'spacing.inline', 'typography.caption', 'typography.label', 'typography.weight-medium', 'motion.duration'],
    states: ['static', 'animated', 'reduced-motion'],
    requirements: ['Always supply text that states the status.', 'Keep animation optional; the ping only decorates a status the text already gives.', 'The animation stops under reduced motion and in forced colors.'],
    prohibitedUsage: ['Using color or animation as the only indication of status.', 'Animating an inactive status.'],
    exampleId: 'live-dot-status', previewKey: 'liveDotStatus',
    code: 'import { LiveDot } from "@/components/ui/live-dot";\n<LiveDot animated>Live now</LiveDot>\n<LiveDot status="inactive">Offline</LiveDot>',
  },
  {
    id: 'kbd', name: 'Kbd', category: 'layout', purpose: 'Show a keyboard shortcut hint.', shortPurpose: 'Show a keyboard shortcut hint.', element: 'kbd', meaning: 'Native kbd elements that display keys. It never binds a shortcut.',
    props: [prop('children', 'ReactNode', 'A single key, when `keys` is not used.'), prop('keys', 'string[]', 'A shortcut as an ordered list of key names; they are shown joined by a plus sign.'), choice('size', ['small', 'medium'], 'Key size.'), ...common, prop('ref', 'Ref<HTMLElement>', 'Root element reference.')],
    variants: { size: ['small', 'medium'] },
    tokenIds: ['color.foreground', 'color.border', 'color.muted', 'radius.control', 'spacing.inline', 'typography.mono', 'typography.caption', 'typography.label', 'typography.weight-medium'],
    requirements: ['Use platform-neutral key names such as Ctrl or Mod, and choose the display for the reader platform in the caller.', 'Bind the shortcut separately; Kbd only displays it.', 'Name the action in nearby text so the hint is not the only description.'],
    prohibitedUsage: ['Expecting Kbd to handle the key press.', 'Showing a shortcut that is not bound.'],
    exampleId: 'kbd-shortcut', previewKey: 'kbdShortcut',
    code: 'import { Kbd } from "@/components/ui/kbd";\n<p>Press <Kbd keys={["Ctrl", "K"]} /> to search, or <Kbd>Esc</Kbd> to close.</p>',
  },
  {
    id: 'avatar-group', name: 'AvatarGroup', category: 'layout', purpose: 'Show several people as overlapping avatars with a +N count.', shortPurpose: 'Show people as overlapping avatars.', element: 'div', meaning: 'A named group of avatars. People beyond the limit collapse into a +N count with its own accessible name.',
    props: [prop('label', 'string', 'Accessible name for the whole group, such as "Project members".', true), prop('people', 'AvatarGroupPerson[]', 'People in display order, each with `initials`, `alt` and an optional `src`.', true), { ...prop('max', 'number', 'Most avatars to show before the +N count.'), defaultValue: 4 }, choice('size', ['medium', 'small', 'large'], 'Avatar size.'), prop('overflowLabel', '(count: number) => string', 'Accessible name for the +N count. Defaults to "N more".'), ...common, prop('ref', 'Ref<HTMLDivElement>', 'Group element reference.')],
    variants: { size: ['medium', 'small', 'large'] },
    tokenIds: ['color.surface', 'color.muted', 'color.foreground', 'typography.caption', 'typography.weight-medium'],
    requirements: ['Name the group; each person keeps their own name from Avatar.', 'Give the +N count a meaningful name, not only the number.', 'The group is not interactive. Put a real button or link beside it when the full list should open.'],
    prohibitedUsage: ['Using the group as a button without a native control.', 'Leaving the group unnamed.'],
    exampleId: 'avatar-group-team', previewKey: 'avatarGroupTeam',
    code: 'import { AvatarGroup } from "@/components/ui/avatar-group";\n<AvatarGroup label="Project members" people={[{ initials: "MC", alt: "Maya Chen" }, { initials: "AB", alt: "Ada Bell" }, { initials: "JO", alt: "Jon Ortiz" }, { initials: "LK", alt: "Lena Koh" }, { initials: "TS", alt: "Tariq Shah" }, { initials: "NP", alt: "Nia Park" }]} />',
  },
];

export const displayComponentContracts: ComponentContract[] = entries.map(entry => ({
  id: entry.id, name: entry.name, publicImport: { module: `@/components/ui/${entry.id}`, exportName: entry.name },
  purpose: entry.purpose, shortPurpose: entry.shortPurpose, category: entry.category, maturity: 'experimental', interactive: false,
  semantics: { element: entry.element, meaning: entry.meaning }, anatomy: [{ part: 'root', description: entry.meaning }], props: entry.props,
  variants: entry.variants ?? {}, compoundVariants: [],
  themeDefaults: entry.variants?.size ? { size: entry.variants.size } : {}, states: entry.states ?? ['default'], tokenIds: entry.tokenIds,
  accessibility: { status: 'not-reviewed', requirements: entry.requirements, keyboard: [], ruleIds: [] },
  composition: { allowedComponentIds: entry.id === 'avatar-group' ? ['avatar'] : [], constraints: ['Meaning stays in text; decoration is hidden from assistive technology.'] },
  prohibitedUsage: entry.prohibitedUsage, exampleIds: [entry.exampleId], ruleIds: [],
  aiGuidance: { prefer: entry.prefer ?? [`Use ${entry.name} for its documented purpose.`], avoid: entry.prohibitedUsage },
}));
export const displayComponentExamples: Example[] = entries.map(entry => ({
  id: entry.exampleId, title: entry.purpose, componentIds: [entry.id], code: entry.code, intent: 'recommended', previewKey: entry.previewKey,
}));
