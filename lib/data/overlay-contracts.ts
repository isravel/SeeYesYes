import type { ComponentContract, Example } from '@/lib/contract/schema';
type PropContract = ComponentContract['props'][number];

const prop = (name: string, type: string, description: string, required = false): PropContract => ({ name, type, description, required });
const choice = (name: string, values: string[], defaultValue: string): PropContract => ({ ...prop(name, values.join(' | '), `Choose ${name}.`), allowedValues: values, defaultValue });
const openProps = [prop('isOpen', 'boolean', 'Controlled open state.'), prop('defaultOpen', 'boolean', 'Initial uncontrolled open state.'), prop('onOpenChange', '(open: boolean) => void', 'Handle open state changes.')];
type Entry = {
  id: string; name: string; purpose: string; shortPurpose: string; element: string;
  props: PropContract[]; tokens: string[]; parts: string[]; states: string[];
  keyboard: ComponentContract['accessibility']['keyboard']; requirements: string[]; avoid: string[];
  variants?: ComponentContract['variants']; composition?: string[];
  exampleId: string; previewKey: string; code: string;
};
const entries: Entry[] = [
  {
    id: 'dialog', name: 'Dialog', purpose: 'Open a named modal for a focused task.', shortPurpose: 'Open a focused modal task.', element: 'dialog',
    props: [prop('triggerLabel', 'string', 'Visible trigger name.', true), prop('title', 'string', 'Visible dialog heading and accessible name.', true), prop('children', 'ReactNode | (close: () => void) => ReactNode', 'Task content; a render function can close the dialog.', true), choice('size', ['small', 'medium', 'large'], 'medium'), prop('disabled', 'boolean', 'Disable the trigger.'), ...openProps, { ...prop('dismissOnOutsidePress', 'boolean', 'Allow outside pointer dismissal.'), defaultValue: false }, { ...prop('closeOnEscape', 'boolean', 'Allow Escape dismissal; disable for a required task.'), defaultValue: true }, { ...prop('closeLabel', 'string', 'Visible explicit close action.'), defaultValue: 'Close' }],
    variants: { size: ['small', 'medium', 'large'] }, composition: ['button'], parts: ['trigger', 'overlay', 'dialog', 'title', 'content', 'close action'], states: ['closed', 'open', 'focus-visible', 'disabled'],
    tokens: ['color.foreground', 'color.surface', 'color.border', 'color.focus', 'radius.panel', 'spacing.stack', 'spacing.inline', 'shadow.raised', 'typography.heading', 'typography.weight-medium'],
    keyboard: [{ key: 'Enter / Space', behavior: 'Open from the focused trigger.' }, { key: 'Tab / Shift+Tab', behavior: 'Move within the modal; focus stays contained.' }, { key: 'Escape', behavior: 'Close and restore trigger focus unless closeOnEscape is false.' }],
    requirements: ['Use a visible title for the dialog name.', 'Keep focus in the modal and restore it on close.', 'Outside presses do not dismiss by default; required tasks can also block Escape.', 'Portal into the nearest ThemeScope.'], avoid: ['Opening unnamed dialogs.', 'Silently dismissing a required task.'],
    exampleId: 'dialog-preview', previewKey: 'dialogPreview', code: 'import { Dialog } from "@/components/ui/dialog";\n<Dialog triggerLabel="Open preview settings" title="Preview settings"><p>Changes here stay in this preview.</p></Dialog>',
  },
  {
    id: 'dropdown-menu', name: 'DropdownMenu', purpose: 'Choose an action from a named menu.', shortPurpose: 'Choose an action from a menu.', element: 'menu',
    props: [prop('triggerLabel', 'string', 'Visible trigger and menu name.', true), prop('items', 'DropdownMenuItem[]', 'Unique IDs, labels, and optional disabled states.', true), prop('onAction', '(id: string) => void', 'Run the selected action.', true), prop('disabled', 'boolean', 'Disable the trigger.'), ...openProps],
    composition: ['button'], parts: ['trigger', 'popover', 'menu', 'item'], states: ['closed', 'open', 'hovered', 'focused', 'focus-visible', 'disabled', 'empty'],
    tokens: ['color.surface', 'color.foreground', 'color.border', 'color.muted', 'color.muted-foreground', 'color.focus', 'radius.panel', 'radius.control', 'shadow.raised', 'spacing.stack', 'spacing.inline', 'spacing.target-minimum', 'spacing.control-block', 'spacing.control-inline', 'typography.label'],
    keyboard: [{ key: 'Enter / Space / ArrowDown', behavior: 'Open the menu and focus an enabled item.' }, { key: 'Arrow keys / Home / End', behavior: 'Move among enabled items.' }, { key: 'Typing', behavior: 'Find items by their labels.' }, { key: 'Enter / Space', behavior: 'Run the focused action and close.' }, { key: 'Escape', behavior: 'Close and restore focus to the trigger.' }],
    requirements: ['Give the trigger a clear visible name.', 'Skip disabled actions during keyboard navigation.', 'Restore focus when dismissed.', 'Portal into the nearest ThemeScope.'], avoid: ['Using menus for ordinary form selection; use Select.'],
    exampleId: 'menu-actions', previewKey: 'menuActions', code: 'import { DropdownMenu } from "@/components/ui/dropdown-menu";\n<DropdownMenu triggerLabel="Preview actions" items={[{ id: "save", label: "Save preview" }]} onAction={() => window.alert("Preview saved for this example.")} />',
  },
  {
    id: 'tabs', name: 'Tabs', purpose: 'Switch between related content panels.', shortPurpose: 'Switch between related panels.', element: 'tablist and tabpanel',
    props: [prop('label', 'string', 'Accessible name for the tab list.', true), prop('items', 'TabsItem[]', 'Unique IDs, labels, content, and optional disabled states.', true), prop('selectedId', 'string', 'Controlled selected tab.'), prop('defaultSelectedId', 'string', 'Initial selected tab.'), prop('onSelectionChange', '(id: string) => void', 'Handle selection changes.'), choice('orientation', ['horizontal', 'vertical'], 'horizontal'), choice('activation', ['automatic', 'manual'], 'automatic')],
    variants: { orientation: ['horizontal', 'vertical'], activation: ['automatic', 'manual'] }, parts: ['root', 'tablist', 'tab', 'tabpanel'], states: ['default', 'selected', 'hovered', 'focus-visible', 'disabled'],
    tokens: ['color.foreground', 'color.border', 'color.primary', 'color.on-primary', 'color.muted', 'color.focus', 'spacing.stack', 'spacing.inline', 'spacing.target-minimum', 'spacing.control-block', 'spacing.control-inline', 'radius.control', 'typography.label'],
    keyboard: [{ key: 'Arrow keys', behavior: 'Move focus by orientation, skipping disabled tabs; automatic mode also selects.' }, { key: 'Enter / Space', behavior: 'Select the focused tab in manual mode.' }, { key: 'Tab', behavior: 'Move from the tab list into the selected panel.' }],
    requirements: ['Name the tab list.', 'Connect each tab to its panel using the same item ID.', 'Keep disabled tabs out of selection.', 'Keep focus visible on tabs and panels.'], avoid: ['Using tabs for navigation to unrelated pages.'],
    exampleId: 'tabs-overview', previewKey: 'tabsOverview', code: 'import { Tabs } from "@/components/ui/tabs";\n<Tabs label="Preview details" items={[{ id: "overview", label: "Overview", content: "A shared starting point." }, { id: "tokens", label: "Tokens", content: "Semantic values from the theme." }]} />',
  },
  {
    id: 'tooltip', name: 'Tooltip', purpose: 'Add a short description to an action.', shortPurpose: 'Add a short action description.', element: 'tooltip',
    props: [prop('triggerLabel', 'string', 'Visible action name.', true), prop('content', 'string', 'Supplemental description.', true), prop('onPress', '() => void', 'Run the trigger action.', true), prop('disabled', 'boolean', 'Disable the trigger and tooltip.'), choice('placement', ['top', 'bottom', 'left', 'right'], 'top'), { ...prop('delay', 'number', 'Hover opening delay in milliseconds; focus opens immediately.'), defaultValue: 600 }],
    composition: ['button'], variants: { placement: ['top', 'bottom', 'left', 'right'] }, parts: ['trigger', 'description'], states: ['closed', 'open', 'hover', 'focus-visible', 'disabled'],
    tokens: ['color.surface', 'color.foreground', 'color.border', 'radius.control', 'shadow.raised', 'spacing.stack', 'spacing.control-block', 'spacing.control-inline', 'typography.caption'],
    keyboard: [{ key: 'Focus', behavior: 'Show the description without moving focus.' }, { key: 'Escape', behavior: 'Dismiss while leaving focus on the trigger.' }, { key: 'Enter / Space', behavior: 'Run the trigger action.' }],
    requirements: ['Show on focus and hover.', 'Allow Escape dismissal.', 'Keep essential instructions and the action name visible without a tooltip.', 'Portal into the nearest ThemeScope.'], avoid: ['Putting essential instructions or interactive content in a tooltip.'],
    exampleId: 'tooltip-save', previewKey: 'tooltipSave', code: 'import { Tooltip } from "@/components/ui/tooltip";\n<Tooltip triggerLabel="Save preview" content="Only this preview is saved." onPress={() => window.alert("Preview saved for this example.")} />',
  },
];
export const overlayComponentContracts: ComponentContract[] = entries.map(entry => ({
  id: entry.id, name: entry.name, publicImport: { module: `@/components/ui/${entry.id}`, exportName: entry.name },
  purpose: entry.purpose, shortPurpose: entry.shortPurpose, category: entry.id === 'tabs' || entry.id === 'dropdown-menu' ? 'navigation' : 'feedback', maturity: 'experimental', interactive: true,
  semantics: { element: entry.element, meaning: entry.purpose }, anatomy: entry.parts.map(part => ({ part, description: `${entry.name} ${part}.` })), props: [...entry.props, prop('className', 'string', 'Additional component class.'), prop('ref', entry.id === 'dialog' ? 'Ref<HTMLElement>' : 'Ref<HTMLDivElement>', 'Root element reference.')],
  variants: entry.variants ?? {}, compoundVariants: [], themeDefaults: entry.variants?.size ? { size: entry.variants.size } : {}, states: entry.states, tokenIds: entry.tokens,
  accessibility: { status: 'not-reviewed', requirements: entry.requirements, keyboard: entry.keyboard, ruleIds: ['wcag-focus-visible'] },
  composition: { allowedComponentIds: entry.composition ?? [], constraints: ['React Aria owns focus and ARIA relationships; parent containers own placement.'] },
  prohibitedUsage: entry.avoid, exampleIds: [entry.exampleId], ruleIds: [], aiGuidance: { prefer: [`Use ${entry.name} with the documented keyboard behavior.`], avoid: entry.avoid },
}));
export const overlayComponentExamples: Example[] = entries.map(entry => ({ id: entry.exampleId, title: entry.purpose, componentIds: [entry.id], code: entry.code, intent: 'recommended', previewKey: entry.previewKey }));
