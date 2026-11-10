'use client';
import { useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type Ref } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { assignRef } from '@/lib/utils/merge-refs';
import { Input, type FormControlSize } from './input';
import { Spinner } from './spinner';
import styles from './SearchInput.module.css';
export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'aria-label' | 'aria-labelledby'> & {
  label: string; value?: string; defaultValue?: string; onChange?: (value: string) => void; onClear?: () => void;
  clearLabel?: string; searching?: boolean; searchingLabel?: string; size?: FormControlSize; ref?: Ref<HTMLInputElement>;
};
/**
 * An Input with a search icon and a clear button. The button exists only while there is text to clear, and clearing returns focus to the field.
 * Escape also clears a populated field. Controlled with `value`, or uncontrolled with `defaultValue`. `searching` only reports activity; the caller runs the search.
 */
export function SearchInput({ label, value, defaultValue = '', onChange, onClear, clearLabel = 'Clear search', searching = false, searchingLabel = 'Searching…', size, className = '', ref, disabled, readOnly, onKeyDown, ...props }: SearchInputProps) {
  const defaults = useComponentDefaults('search-input');
  const [inner, setInner] = useState(defaultValue);
  const input = useRef<HTMLInputElement | null>(null);
  const current = value ?? inner;
  const change = (next: string) => { if (value === undefined) setInner(next); onChange?.(next); };
  const clear = () => { change(''); onClear?.(); input.current?.focus(); };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    // Escape clears a populated field and stops there, so a surrounding dialog stays open; an empty field leaves Escape to the dialog.
    if (event.key === 'Escape' && current && !disabled && !readOnly && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); clear(); }
  };
  return <div className={`${styles.root} ${className}`} data-size={size ?? defaults.size}>
    <MagnifyingGlass className={styles.icon} aria-hidden="true" />
    <Input {...props} ref={node => { input.current = node; assignRef(ref, node); }} type="search" size={size ?? defaults.size} aria-label={label} aria-busy={searching || undefined}
      className={styles.input} value={current} disabled={disabled} readOnly={readOnly} onChange={event => change(event.currentTarget.value)} onKeyDown={keyDown} />
    <span className={styles.trailing}>
      {searching && <Spinner size="small" />}
      {current && !disabled && !readOnly && <button type="button" className={styles.clear} aria-label={clearLabel} onClick={clear}><X aria-hidden="true" /></button>}
    </span>
    <span role="status" className={styles.status}>{searching ? searchingLabel : ''}</span>
  </div>;
}
