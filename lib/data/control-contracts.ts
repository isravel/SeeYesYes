import type { ComponentContract, Example } from '@/lib/contract/schema';

// X3 interactive controls built on native elements: each is a real button, input or fieldset, so keyboard behavior comes from the platform.
type Entry = {
  id: string; name: string; category: ComponentContract['category']; purpose: string; shortPurpose: string; element: string; meaning: string;
  anatomy: ComponentContract['anatomy']; props: ComponentContract['props']; variants: ComponentContract['variants']; themeDefaults: ComponentContract['themeDefaults'];
  states: string[]; tokenIds: string[]; keyboard: { key: string; behavior: string }[]; requirements: string[]; prohibitedUsage: string[];
  prefer: string[]; allowed: string[]; exampleId: string; previewKey: string; code: string;
};
const prop = (name: string, type: string, description: string, required = false, defaultValue?: string | number | boolean): ComponentContract['props'][number] =>
  ({ name, type, description, required, ...(defaultValue === undefined ? {} : { defaultValue }) });
const choice = (name: string, values: string[], description: string): ComponentContract['props'][number] => ({ ...prop(name, values.join(' | '), description), defaultValue: values[0], allowedValues: values });
const size = (values: string[], defaultValue: string): ComponentContract['props'][number] => ({ ...prop('size', values.join(' | '), 'Control size.'), defaultValue, allowedValues: values });
const sizes = ['small', 'medium', 'large'];
const common = [prop('className', 'string', 'Additional class for placement.')];

const entries: Entry[] = [
  {
    id: 'icon-button', name: 'IconButton', category: 'action', purpose: 'Run an action with a compact, icon-only button.', shortPurpose: 'Run an action with an icon-only button.', element: 'button',
    meaning: 'A native button whose accessible name is the required label. The icon is decorative.',
    anatomy: [{ part: 'root', description: 'Square native button.' }, { part: 'icon', description: 'Decorative icon hidden from assistive technology.' }, { part: 'tooltip', description: 'Optional hover and focus hint that repeats or extends the label.' }],
    props: [
      prop('label', 'string', 'Accessible name. Always required: the icon never carries the meaning.', true), prop('icon', 'ReactNode', 'The icon to show. It is hidden from assistive technology.', true),
      { ...prop('variant', 'IconButtonVariant', 'Visual treatment shared with Button.'), defaultValue: 'ghost', allowedValues: ['ghost', 'outline', 'soft', 'muted', 'primary', 'secondary', 'destructive'] },
      size(sizes, 'medium'), prop('loading', 'boolean', 'Show progress and block repeat activation.', false, false),
      prop('pressed', 'boolean', 'Turns the button into a toggle and exposes `aria-pressed`.'), prop('tooltip', 'string', 'Optional hint shown on hover and keyboard focus. It does not replace `label`.'),
      prop('onClick', 'MouseEventHandler<HTMLButtonElement>', 'Run the action on native activation.'), ...common,
    ],
    variants: { variant: ['ghost', 'outline', 'soft', 'muted', 'primary', 'secondary', 'destructive'], size: sizes },
    // Destructive is never a theme default: it changes the meaning of every unmarked action.
    themeDefaults: { variant: ['ghost', 'outline', 'soft', 'muted', 'primary', 'secondary'], size: sizes },
    states: ['default', 'hover', 'focus-visible', 'pressed', 'disabled', 'loading'], tokenIds: ['spacing.target-minimum', 'color.foreground'],
    keyboard: [{ key: 'Enter', behavior: 'Activate when focused and enabled.' }, { key: 'Space', behavior: 'Activate using native button behavior.' }],
    requirements: ['Always supply `label`; it is the accessible name.', 'Keep the icon decorative.', 'A tooltip is a supplement: do not put the only description there.'],
    prohibitedUsage: ['Omitting the label.', 'Using an icon-only button for an unfamiliar action without a tooltip or nearby text.'],
    prefer: ['Use IconButton for compact, familiar actions such as close or add.'], allowed: ['button'],
    exampleId: 'icon-button-add', previewKey: 'iconButtonAdd',
    code: 'import { IconButton } from "@/components/ui/icon-button";\n<IconButton label="Add member" tooltip="Add member" icon={<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v10M3 8h10" /></svg>} />',
  },
  {
    id: 'search-input', name: 'SearchInput', category: 'form', purpose: 'Enter a search query with a clear button.', shortPurpose: 'Enter a query, with a clear button.', element: 'input',
    meaning: 'A native search input with a decorative icon and a clear button that exists only while there is text.',
    anatomy: [{ part: 'root', description: 'Native search input.' }, { part: 'icon', description: 'Decorative search icon.' }, { part: 'clear', description: 'Native button shown only while the field has text.' }, { part: 'status', description: 'Polite live region that reports the searching state.' }],
    props: [
      prop('label', 'string', 'Accessible name for the field.', true), prop('value', 'string', 'Controlled query.'), prop('defaultValue', 'string', 'Initial query when uncontrolled.', false, ''),
      prop('onChange', '(value: string) => void', 'Called with the new query after typing or clearing.'), prop('onClear', '() => void', 'Called after the clear button or Escape empties the field.'),
      prop('clearLabel', 'string', 'Accessible name for the clear button.', false, 'Clear search'), prop('searching', 'boolean', 'Reports that a search is running. The caller runs the search.', false, false),
      prop('searchingLabel', 'string', 'Text announced while `searching`.', false, 'Searching…'), size(sizes, 'medium'),
      prop('disabled', 'boolean', 'Disable interaction.'), prop('readOnly', 'boolean', 'Allow reading and focus without editing.'), prop('placeholder', 'string', 'Hint text. It never replaces `label`.'), ...common,
    ],
    variants: { size: sizes }, themeDefaults: { size: sizes },
    states: ['default', 'empty', 'filled', 'searching', 'focus-visible', 'hover', 'disabled', 'read-only', 'invalid'],
    tokenIds: ['spacing.control-inline', 'color.muted-foreground', 'spacing.inline', 'color.foreground', 'radius.control', 'color.muted', 'color.focus'],
    keyboard: [{ key: 'Typing', behavior: 'Enter and edit the query using native input behavior.' }, { key: 'Escape', behavior: 'Clear a populated field and keep focus in it. An empty field leaves Escape to a surrounding dialog.' }],
    requirements: ['Always supply `label`.', 'The clear button has its own accessible name and returns focus to the field.', 'Report `searching` in text, not only with the spinner.'],
    prohibitedUsage: ['Using the placeholder as the only label.', 'Expecting the component to run the search.'],
    prefer: ['Use SearchInput for filtering or searching a list.'], allowed: ['input', 'spinner'],
    exampleId: 'search-input-members', previewKey: 'searchInputMembers',
    code: 'import { SearchInput } from "@/components/ui/search-input";\n<SearchInput label="Search members" placeholder="Search members" />',
  },
  {
    id: 'segmented', name: 'Segmented', category: 'form', purpose: 'Switch between a few views of the same content.', shortPurpose: 'Choose one view from a few.', element: 'div',
    meaning: 'A radio group styled as joined segments. It has one tab stop and arrow-key movement from native radios.',
    anatomy: [{ part: 'root', description: 'Radio group with an accessible name.' }, { part: 'option', description: 'Native radio with a visible label and an optional decorative icon.' }],
    props: [
      prop('label', 'string', 'Accessible name for the group.', true), prop('options', 'SegmentedOption[]', 'Choices with a `value`, `label`, optional `icon` and optional `disabled`.', true),
      prop('name', 'string', 'Shared form name. A name is generated when omitted.'), prop('value', 'string', 'Controlled selection.'), prop('defaultValue', 'string', 'Initial selection when uncontrolled.'),
      prop('onChange', '(value: string) => void', 'Called with the chosen value.'), size(sizes, 'medium'), prop('disabled', 'boolean', 'Disable every choice.'), ...common,
    ],
    variants: { size: sizes }, themeDefaults: { size: sizes },
    states: ['default', 'unselected', 'selected', 'hover', 'focus-visible', 'disabled'],
    tokenIds: ['color.border', 'radius.control', 'color.surface', 'color.foreground', 'typography.label', 'typography.caption', 'typography.heading', 'spacing.target-minimum', 'spacing.control-block', 'spacing.control-inline', 'spacing.inline', 'color.muted', 'color.primary', 'color.on-primary', 'color.focus', 'typography.weight-medium'],
    keyboard: [{ key: 'Tab', behavior: 'Move focus into and out of the group; the group is one tab stop.' }, { key: 'Arrow keys', behavior: 'Move to and select the previous or next choice.' }, { key: 'Space', behavior: 'Select the focused choice.' }],
    requirements: ['Name the group and give every option a visible label.', 'Use it to change how content is shown. Use Tabs when each choice owns a panel.', 'The selected choice differs by fill and weight, not only by hue.'],
    prohibitedUsage: ['Using Segmented to switch tab panels.', 'Icon-only options without a visible or accessible label.'],
    prefer: ['Use Segmented for view switches such as list or grid.'], allowed: [],
    exampleId: 'segmented-view', previewKey: 'segmentedView',
    code: 'import { Segmented } from "@/components/ui/segmented";\n<Segmented label="View" defaultValue="list" options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} />',
  },
  {
    id: 'chip', name: 'Chip', category: 'feedback', purpose: 'Show compact metadata, a toggle or a removable item.', shortPurpose: 'Show metadata, a toggle or a removable tag.', element: 'span',
    meaning: 'Plain text by default. A selectable chip is a toggle button; a removable chip adds a remove button. It is never both.',
    anatomy: [{ part: 'root', description: 'Static text, or a toggle button when selectable.' }, { part: 'remove', description: 'Native button with its own name, on removable chips.' }, { part: 'error', description: 'Visible text when removal fails.' }],
    props: [
      prop('children', 'string', 'The chip text.', true), choice('tone', ['neutral', 'primary', 'success', 'warning', 'destructive', 'info'], 'Outline and fill tint. Text stays at the foreground color.'),
      choice('size', ['medium', 'small'], 'Chip size.'), prop('selected', 'boolean', 'Controlled selected state for a selectable chip.'), prop('defaultSelected', 'boolean', 'Initial selected state when uncontrolled.', false, false),
      prop('onSelectedChange', '(selected: boolean) => void', 'Makes the chip a toggle button and reports the new state.'), prop('onRemove', '() => void', 'Adds a remove button. The caller removes the item.'),
      prop('removeLabel', 'string', 'Accessible name for the remove button. Defaults to "Remove" and the chip text.'), prop('removing', 'boolean', 'Removal is pending: the remove button is disabled and shows progress.', false, false),
      prop('error', 'string', 'Visible message when removal failed. The item stays in place.'), prop('disabled', 'boolean', 'Disable the chip action.'), ...common,
    ],
    variants: { tone: ['neutral', 'primary', 'success', 'warning', 'destructive', 'info'], size: ['medium', 'small'] },
    themeDefaults: { size: ['medium', 'small'] },
    states: ['static', 'selectable', 'removable', 'hover', 'focus-visible', 'selected', 'disabled', 'removing', 'invalid'],
    tokenIds: ['color.border', 'color.surface', 'color.foreground', 'typography.caption', 'typography.label', 'typography.weight-medium', 'radius.control', 'spacing.inline', 'color.primary', 'color.success', 'color.warning', 'color.destructive', 'color.info', 'color.muted', 'color.on-primary', 'color.focus'],
    keyboard: [{ key: 'Enter', behavior: 'Toggle a selectable chip, or activate the remove button when it is focused.' }, { key: 'Space', behavior: 'Same as Enter for native buttons.' }],
    requirements: ['A selectable chip exposes `aria-pressed`; a static chip has no role.', 'The remove button names the item it removes.', 'Show a failed removal as text and keep the chip.', 'A chip cannot be selectable and removable at once.'],
    prohibitedUsage: ['Making a static label look clickable.', 'Using tone alone to carry meaning.', 'Combining `onSelectedChange` and `onRemove`.'],
    prefer: ['Use Badge for status and Chip for tags, filters and removable items.'], allowed: ['spinner'],
    exampleId: 'chip-filters', previewKey: 'chipFilters',
    code: 'import { Chip } from "@/components/ui/chip";\n<Chip>Design</Chip>\n<Chip onSelectedChange={() => undefined}>In stock</Chip>\n<Chip onRemove={() => undefined}>Archived</Chip>',
  },
  {
    id: 'checkbox-group', name: 'CheckboxGroup', category: 'form', purpose: 'Choose any number of options from a named set.', shortPurpose: 'Choose several options from a set.', element: 'fieldset',
    meaning: 'A native fieldset of checkboxes. Each checked option submits its value under the shared name, and `onChange` receives the array.',
    anatomy: [{ part: 'root', description: 'Fieldset with a legend.' }, { part: 'option', description: 'Native checkbox with a visible label and optional hint.' }, { part: 'message', description: 'Help and error text described on the group.' }],
    props: [
      prop('name', 'string', 'Shared form name for every option.', true), prop('label', 'string', 'Visible group legend.', true), prop('options', 'CheckboxOption[]', 'Options with a `value`, `label`, optional `hint` and optional `disabled`.', true),
      prop('value', 'string[]', 'Controlled selection.'), prop('defaultValue', 'string[]', 'Initial selection when uncontrolled. Empty when omitted.'), prop('onChange', '(values: string[]) => void', 'Called with the selected values in option order.'),
      choice('orientation', ['vertical', 'horizontal'], 'Option layout.'), size(sizes, 'medium'), prop('helpText', 'string', 'Group instruction.'), prop('error', 'string', 'Visible group validation message.'),
      prop('required', 'boolean', 'Mark the group as needing at least one choice, in the legend.', false, false), prop('disabled', 'boolean', 'Disable every option.'), ...common,
    ],
    variants: { orientation: ['vertical', 'horizontal'], size: sizes }, themeDefaults: { size: sizes },
    states: ['default', 'empty', 'some-selected', 'all-selected', 'focus-visible', 'disabled', 'invalid', 'required', 'help'],
    tokenIds: ['spacing.inline', 'spacing.stack', 'spacing.target-minimum', 'typography.label', 'color.muted-foreground', 'typography.caption'],
    keyboard: [{ key: 'Tab', behavior: 'Move between options; each checkbox is a tab stop.' }, { key: 'Space', behavior: 'Toggle the focused checkbox.' }],
    requirements: ['Give the group a visible legend and every option a label.', 'Show a group error as text and describe it on the fieldset.', 'Use RadioGroup when only one choice is allowed.'],
    prohibitedUsage: ['Using checkboxes for mutually exclusive choices.', 'Marking every checkbox required to mean "choose at least one".'],
    prefer: ['Use CheckboxGroup for a set of related independent options.'], allowed: ['checkbox', 'fieldset'],
    exampleId: 'checkbox-group-channels', previewKey: 'checkboxGroupChannels',
    code: 'import { CheckboxGroup } from "@/components/ui/checkbox-group";\n<CheckboxGroup name="channels" label="Notify me by" defaultValue={["email"]} options={[{ value: "email", label: "Email" }, { value: "sms", label: "Text message", hint: "Carrier rates may apply." }, { value: "push", label: "Push", disabled: true }]} />',
  },
];

export const controlComponentContracts: ComponentContract[] = entries.map(entry => ({
  id: entry.id, name: entry.name, publicImport: { module: `@/components/ui/${entry.id}`, exportName: entry.name },
  purpose: entry.purpose, shortPurpose: entry.shortPurpose, category: entry.category, maturity: 'experimental', interactive: true,
  semantics: { element: entry.element, meaning: entry.meaning }, anatomy: entry.anatomy, props: entry.props,
  variants: entry.variants, compoundVariants: [], themeDefaults: entry.themeDefaults, states: entry.states, tokenIds: entry.tokenIds,
  accessibility: { status: 'not-reviewed', requirements: entry.requirements, keyboard: entry.keyboard, ruleIds: ['wcag-focus-visible'] },
  composition: { allowedComponentIds: entry.allowed, constraints: ['Keep native elements, visible names and focus indicators.'] },
  prohibitedUsage: entry.prohibitedUsage, exampleIds: [entry.exampleId], ruleIds: ['wcag-focus-visible'],
  aiGuidance: { prefer: entry.prefer, avoid: entry.prohibitedUsage },
}));
export const controlComponentExamples: Example[] = entries.map(entry => ({
  id: entry.exampleId, title: entry.purpose, componentIds: [entry.id], code: entry.code, intent: 'recommended', previewKey: entry.previewKey,
}));
