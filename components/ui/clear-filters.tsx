'use client';
import type { ButtonHTMLAttributes, Ref } from 'react';
import { Button } from './button';
import styles from './ClearFilters.module.css';
export type ClearFiltersAppearance = 'text' | 'button';
export type ClearFiltersProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick' | 'type' | 'disabled' | 'aria-disabled'> & {
  active: boolean; onClear: () => void; label?: string; appearance?: ClearFiltersAppearance; size?: 'small' | 'medium' | 'large'; ref?: Ref<HTMLButtonElement>;
};
/**
 * The control that removes a listing's search and filters. It only calls `onClear`: keeping the sort and view and returning to page 1 is what `useListing` does for you.
 * With nothing to clear (`active` false) it stays in place and focusable but does nothing, and is marked unavailable with `aria-disabled`, so focus is not lost when the last filter is cleared. `appearance="button"` uses a Button, whose `size` it takes.
 */
export function ClearFilters({ active, onClear, label = 'Clear filters', appearance = 'text', size, className = '', ref, ...props }: ClearFiltersProps) {
  const shared = { ...props, className: `${styles.root} ${className}`, 'data-appearance': appearance, 'aria-disabled': active ? undefined : true, onClick: () => { if (active) onClear(); } };
  if (appearance === 'button') return <Button {...shared} ref={ref} variant="secondary" size={size}>{label}</Button>;
  return <button {...shared} ref={ref} type="button">{label}</button>;
}
