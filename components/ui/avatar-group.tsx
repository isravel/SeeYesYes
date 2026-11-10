'use client';
import type { HTMLAttributes, Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { Avatar } from './avatar';
import styles from './AvatarGroup.module.css';
export type AvatarGroupPerson = { initials: string; alt: string; src?: string };
export type AvatarGroupSize = 'small' | 'medium' | 'large';
export type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-label'> & {
  label: string; people: AvatarGroupPerson[]; max?: number; size?: AvatarGroupSize; overflowLabel?: (count: number) => string; ref?: Ref<HTMLDivElement>;
};
/** Overlapping avatars under one group name. People beyond `max` collapse into a "+N" count that has its own accessible name. */
export function AvatarGroup({ label, people, max = 4, size, overflowLabel = count => `${count} more`, className = '', ref, ...props }: AvatarGroupProps) {
  const defaults = useComponentDefaults('avatar-group');
  const chosen = size ?? defaults.size;
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 4;
  const shown = people.slice(0, limit);
  const overflow = people.length - shown.length;
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} role="group" aria-label={label} data-size={chosen}>
    {shown.map((person, index) => <span className={styles.item} key={`${index}-${person.initials}`}><Avatar initials={person.initials} alt={person.alt} src={person.src} size={chosen} /></span>)}
    {overflow > 0 && <span className={styles.item}><span className={styles.overflow} role="img" aria-label={overflowLabel(overflow)}><span aria-hidden="true">+{overflow}</span></span></span>}
  </div>;
}
