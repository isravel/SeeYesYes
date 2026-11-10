'use client';
import { useId, useState, type HTMLAttributes, type Ref } from 'react';
import { Check, X } from '@phosphor-icons/react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { Spinner } from './spinner';
import styles from './Chip.module.css';
export type ChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
export type ChipProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick' | 'role' | 'tabIndex' | 'onChange'> & {
  children: string; tone?: ChipTone; size?: 'small' | 'medium'; selected?: boolean; defaultSelected?: boolean; onSelectedChange?: (selected: boolean) => void;
  onRemove?: () => void; removeLabel?: string; removing?: boolean; error?: string; disabled?: boolean; ref?: Ref<HTMLElement>;
};
/**
 * A compact label. With no action it is plain text. `onSelectedChange` makes it a toggle button, and `onRemove` adds a remove button.
 * A chip is one or the other, never both, because a button cannot hold another button. Removal itself belongs to the caller: show `removing` while it runs and `error` if it fails.
 */
export function Chip({ children, tone, size, selected, defaultSelected = false, onSelectedChange, onRemove, removeLabel, removing = false, error, disabled, className = '', ref, ...props }: ChipProps) {
  const defaults = useComponentDefaults('chip');
  const [inner, setInner] = useState(defaultSelected);
  const errorId = useId();
  if (onSelectedChange && onRemove) throw new Error('A chip is either selectable or removable, not both.');
  const common = { 'data-tone': tone ?? defaults.tone, 'data-size': size ?? defaults.size };
  const root = `${styles.root} ${className}`;
  if (onSelectedChange) {
    const on = selected ?? inner;
    return <button {...props} ref={ref as Ref<HTMLButtonElement>} type="button" className={`${root} ${styles.action}`} {...common} aria-pressed={on} disabled={disabled}
      onClick={() => { if (selected === undefined) setInner(!on); onSelectedChange(!on); }}>
      {on && <Check className={styles.icon} aria-hidden="true" weight="bold" />}{children}
    </button>;
  }
  if (onRemove) {
    return <span {...props} ref={ref as Ref<HTMLSpanElement>} className={root} {...common} data-invalid={error ? true : undefined}>
      <span>{children}</span>
      <button type="button" className={styles.remove} aria-label={removeLabel ?? `Remove ${children}`} aria-busy={removing || undefined} aria-describedby={error ? errorId : undefined} disabled={disabled || removing} onClick={onRemove}>
        {removing ? <Spinner size="small" /> : <X aria-hidden="true" weight="bold" />}
      </button>
      {error && <span id={errorId} className={styles.error}>{error}</span>}
    </span>;
  }
  return <span {...props} ref={ref as Ref<HTMLSpanElement>} className={root} {...common}>{children}</span>;
}
