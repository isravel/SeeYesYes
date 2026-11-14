'use client';
import type { Ref } from 'react';
import { MenuTrigger, Menu, MenuItem, MenuSection, Header, Separator, Popover } from 'react-aria-components';
import { useSurface } from '@/components/theme/ThemeScope';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './DropdownMenu.module.css';

/** An action item. Existing callers pass only these fields, so `type` stays optional. */
export type DropdownMenuActionItem = { type?: 'item'; id: string; label: string; disabled?: boolean; destructive?: boolean; href?: undefined };
/** A navigation item. It renders a real anchor, so open-in-new-tab and native navigation keep working. */
export type DropdownMenuLinkItem = { type?: 'item'; id: string; label: string; href: string; disabled?: boolean; external?: boolean };
export type DropdownMenuEntry = DropdownMenuActionItem | DropdownMenuLinkItem;
export type DropdownMenuGroup = { type: 'group'; id: string; label: string; items: DropdownMenuEntry[] };
export type DropdownMenuSeparator = { type: 'separator'; id: string };
/** Kept as the name existing callers import; it now covers actions, links, groups and separators. */
export type DropdownMenuItem = DropdownMenuEntry | DropdownMenuGroup | DropdownMenuSeparator;
export type DropdownMenuProps = {
  triggerLabel: string; items: DropdownMenuItem[]; onAction: (id: string) => void; disabled?: boolean;
  isOpen?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  className?: string; ref?: Ref<HTMLDivElement>;
};

const isSeparator = (item: DropdownMenuItem): item is DropdownMenuSeparator => item.type === 'separator';
const isGroup = (item: DropdownMenuItem): item is DropdownMenuGroup => item.type === 'group';

/** Drop empty groups and any separator that would lead, trail or repeat, so the menu never shows a dangling divider. */
export function normalizeMenuItems(items: DropdownMenuItem[]): DropdownMenuItem[] {
  const kept = items.filter(item => !isGroup(item) || item.items.length > 0);
  const result: DropdownMenuItem[] = [];
  const endsWithSeparator = () => { const last = result[result.length - 1]; return last !== undefined && isSeparator(last); };
  for (const item of kept) {
    if (isSeparator(item) && (result.length === 0 || endsWithSeparator())) continue;
    result.push(item);
  }
  while (endsWithSeparator()) result.pop();
  return result;
}

function renderEntry(item: DropdownMenuEntry) {
  if (item.href !== undefined) {
    const target = item.external ? '_blank' : undefined;
    return <MenuItem key={item.id} id={item.id} href={item.href} target={target} rel={item.external ? 'noopener noreferrer' : undefined} textValue={item.label} isDisabled={item.disabled} className={styles.item}>{item.label}{item.external ? <span className={styles.hint}> (opens in a new tab)</span> : null}</MenuItem>;
  }
  return <MenuItem key={item.id} id={item.id} textValue={item.label} isDisabled={item.disabled} className={styles.item} data-tone={item.destructive ? 'destructive' : undefined}>{item.label}</MenuItem>;
}

export function DropdownMenu({ triggerLabel, items, onAction, disabled, isOpen, defaultOpen, onOpenChange, className = '', ref }: DropdownMenuProps) {
  const surface = useSurface();
  const visible = normalizeMenuItems(items);
  const actionIds = new Set<string>();
  const collect = (entry: DropdownMenuEntry) => { if (entry.href === undefined) actionIds.add(entry.id); };
  for (const item of visible) { if (isGroup(item)) item.items.forEach(collect); else if (!isSeparator(item)) collect(item); }
  return <MenuTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} />
    <Popover className={styles.popover} data-surface={surface} placement="bottom start" offset={8}>
      <Menu ref={ref} className={`${styles.menu} ${className}`} aria-label={triggerLabel} onAction={key => { const id = String(key); if (actionIds.has(id)) onAction(id); }} renderEmptyState={() => <p className={styles.empty}>No actions available.</p>}>
        {visible.map(item => {
          if (isSeparator(item)) return <Separator key={item.id} className={styles.separator} />;
          if (isGroup(item)) return <MenuSection key={item.id} className={styles.group}><Header className={styles.heading}>{item.label}</Header>{item.items.map(renderEntry)}</MenuSection>;
          return renderEntry(item);
        })}
      </Menu>
    </Popover>
  </MenuTrigger>;
}
