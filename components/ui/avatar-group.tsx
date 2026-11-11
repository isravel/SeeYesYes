'use client';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { DialogTrigger, Popover as AriaPopover, Dialog as AriaDialog, Button as AriaButton } from 'react-aria-components';
import { useComponentDefaults, useSurface } from '@/components/theme/ThemeScope';
import { Avatar } from './avatar';
// The panel borrows Popover's look so the two floating surfaces match; Popover's contract owns these styles.
import popoverStyles from './Popover.module.css';
import styles from './AvatarGroup.module.css';
export type AvatarGroupPerson = { initials: string; alt: string; src?: string };
export type AvatarGroupSize = 'small' | 'medium' | 'large';
export type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label'> & {
  label: string; people: AvatarGroupPerson[]; max?: number; size?: AvatarGroupSize; overflowLabel?: (count: number) => string;
  /** Content for the hidden people, such as a list of names. When supplied, the +N count becomes a button that opens it. */
  overflowContent?: ReactNode | ((close: () => void) => ReactNode);
  /** Accessible name of the +N button when `overflowContent` is supplied. */
  overflowTriggerLabel?: (count: number) => string;
  ref?: Ref<HTMLDivElement>;
};
/**
 * Overlapping avatars under one group name. People beyond `max` collapse into a "+N" count that has its own accessible name.
 * With `overflowContent` the count is a real button that opens a panel for the hidden people; without it the count is a plain image and the group has no tab stop.
 */
export function AvatarGroup({ label, people, max = 4, size, overflowLabel = count => `${count} more`, overflowContent, overflowTriggerLabel = count => `Show ${count} more`, className = '', ref, ...props }: AvatarGroupProps) {
  const defaults = useComponentDefaults('avatar-group');
  const surface = useSurface();
  const chosen = size ?? defaults.size;
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 4;
  const shown = people.slice(0, limit);
  const overflow = people.length - shown.length;
  const count = <span aria-hidden="true">+{overflow}</span>;
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} role="group" aria-label={label} data-size={chosen}>
    {shown.map((person, index) => <span className={styles.item} key={`${index}-${person.initials}`}><Avatar initials={person.initials} alt={person.alt} src={person.src} size={chosen} /></span>)}
    {overflow > 0 && overflowContent === undefined && <span className={styles.item}><span className={styles.overflow} role="img" aria-label={overflowLabel(overflow)}>{count}</span></span>}
    {overflow > 0 && overflowContent !== undefined && <span className={styles.item}>
      <DialogTrigger>
        <AriaButton className={`${styles.overflow} ${styles.trigger}`} aria-label={overflowTriggerLabel(overflow)}>{count}</AriaButton>
        <AriaPopover className={popoverStyles.popover} data-surface={surface} placement="bottom" offset={8}>
          <AriaDialog aria-label={overflowLabel(overflow)} className={popoverStyles.root}>
            {({ close }) => typeof overflowContent === 'function' ? overflowContent(close) : overflowContent}
          </AriaDialog>
        </AriaPopover>
      </DialogTrigger>
    </span>}
  </div>;
}
