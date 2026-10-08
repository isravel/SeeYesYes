'use client';
import { useId, type ChangeEvent, type FieldsetHTMLAttributes, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './RadioGroup.module.css';
export type RadioOption = { value: string; label: string; disabled?: boolean };
export type RadioGroupProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'children' | 'onChange' | 'value' | 'defaultValue'> & {
  name: string; label: string; options: RadioOption[]; value?: string; defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  orientation?: 'horizontal' | 'vertical'; helpText?: string; error?: string; required?: boolean; ref?: Ref<HTMLFieldSetElement>;
};
export function RadioGroup({ name, label, options, value, defaultValue, onChange, orientation, helpText, error, disabled, required, id, className = '', ref, ...props }: RadioGroupProps) {
  const defaults = useComponentDefaults('radio-group');
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const direction = orientation ?? defaults.orientation;
  const helpId = helpText ? `${groupId}-help` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  const describedBy = [props['aria-describedby'], helpId, errorId].filter(Boolean).join(' ') || undefined;
  return <fieldset {...props} ref={ref} id={groupId} className={`${styles.root} ${className}`} disabled={disabled} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={describedBy}>
    <legend className={styles.legend}>{label}{required && <span aria-hidden="true"> *</span>}</legend>
    <div className={styles.options} data-orientation={direction}>
      {options.map((option, index) => <label className={styles.option} key={option.value} htmlFor={`${groupId}-${index}`}>
        <input id={`${groupId}-${index}`} type="radio" name={name} value={option.value} checked={value === undefined ? undefined : value === option.value} defaultChecked={value === undefined ? defaultValue === option.value : undefined} required={required} disabled={disabled || option.disabled} aria-invalid={error ? true : undefined} aria-describedby={describedBy} onChange={event => onChange?.(event.currentTarget.value, event)} />
        <span>{option.label}</span>
      </label>)}
    </div>
    {helpText && <p className={styles.help} id={helpId}>{helpText}</p>}
    {error && <p className={styles.error} id={errorId}>{error}</p>}
  </fieldset>;
}
