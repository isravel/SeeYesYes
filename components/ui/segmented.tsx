'use client';
import { useId, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Segmented.module.css';
export type SegmentedOption = { value: string; label: string; icon?: ReactNode; disabled?: boolean };
export type SegmentedProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'role' | 'aria-label' | 'aria-labelledby' | 'defaultValue'> & {
  label: string; options: SegmentedOption[]; name?: string; value?: string; defaultValue?: string; onChange?: (value: string) => void;
  size?: 'small' | 'medium' | 'large'; disabled?: boolean; ref?: Ref<HTMLDivElement>;
};
/**
 * A single-choice view switcher built on native radios, so arrow keys, one tab stop and form behavior come from the browser.
 * Use it to change how the same content is shown (list or grid). Use Tabs only when each choice owns a panel of content.
 */
export function Segmented({ label, options, name, value, defaultValue, onChange, size, disabled, className = '', ref, ...props }: SegmentedProps) {
  const defaults = useComponentDefaults('segmented');
  const generated = useId();
  const group = name ?? generated;
  return <div {...props} ref={ref} className={`${styles.root} ${className}`} role="radiogroup" aria-label={label} data-size={size ?? defaults.size}>
    {options.map(option => <label className={styles.option} key={option.value}>
      <input className={styles.input} type="radio" name={group} value={option.value} checked={value === undefined ? undefined : value === option.value} defaultChecked={value === undefined ? defaultValue === option.value : undefined}
        disabled={disabled || option.disabled} onChange={event => onChange?.(event.currentTarget.value)} />
      <span className={styles.face}>{option.icon && <span className={styles.icon} aria-hidden="true">{option.icon}</span>}{option.label}</span>
    </label>)}
  </div>;
}
