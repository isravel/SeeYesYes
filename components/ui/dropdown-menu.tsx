'use client';
import type { Ref } from 'react';
import { MenuTrigger, Menu, MenuItem, Popover } from 'react-aria-components';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './DropdownMenu.module.css';

export type DropdownMenuItem = { id: string; label: string; disabled?: boolean };
export type DropdownMenuProps = {
  triggerLabel: string; items: DropdownMenuItem[]; onAction: (id: string) => void; disabled?: boolean;
  isOpen?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  className?: string; ref?: Ref<HTMLDivElement>;
};
export function DropdownMenu({ triggerLabel, items, onAction, disabled, isOpen, defaultOpen, onOpenChange, className = '', ref }: DropdownMenuProps) {
  return <MenuTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} />
    <Popover className={styles.popover} placement="bottom start" offset={8}>
      <Menu ref={ref} className={`${styles.menu} ${className}`} aria-label={triggerLabel} onAction={key => onAction(String(key))} renderEmptyState={() => <p className={styles.empty}>No actions available.</p>}>
        {items.map(item => <MenuItem key={item.id} id={item.id} textValue={item.label} isDisabled={item.disabled} className={styles.item}>{item.label}</MenuItem>)}
      </Menu>
    </Popover>
  </MenuTrigger>;
}
