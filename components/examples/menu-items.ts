import type { DropdownMenuItem } from '@/components/ui/dropdown-menu';

/**
 * One menu for the catalog preview and the Playground: named groups, separators, an in-app link,
 * an external link and a destructive action. Both read this list so they cannot drift apart.
 */
export const menuExampleItems: DropdownMenuItem[] = [
  { type: 'group', id: 'file', label: 'File', items: [
    { id: 'save', label: 'Save preview' },
    { id: 'duplicate', label: 'Duplicate preview' },
    { id: 'archive', label: 'Archive preview', disabled: true },
  ] },
  { type: 'separator', id: 'after-file' },
  { type: 'group', id: 'help', label: 'Help', items: [
    { id: 'docs', label: 'Accessibility guide', href: '/docs/accessibility' },
    { id: 'aria', label: 'React Aria menu guide', href: 'https://react-aria.adobe.com/Menu', external: true },
  ] },
  { type: 'separator', id: 'before-delete' },
  { id: 'delete', label: 'Delete preview', destructive: true },
];

const messages: Record<string, string> = {
  save: 'Preview saved for this example.',
  duplicate: 'Preview duplicated for this example.',
  delete: 'Delete requested. Nothing is deleted in this example; a real app would ask to confirm first.',
};
/** The status line an action shows. Links never reach this: they navigate instead of calling `onAction`. */
export const menuExampleMessage = (id: string) => messages[id] ?? '';
