'use client';
import { useId, useState, type FieldsetHTMLAttributes, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { Checkbox } from './checkbox';
import { Fieldset } from './fieldset';
import type { FormControlSize } from './input';
import styles from './CheckboxGroup.module.css';
export type CheckboxOption = { value: string; label: string; disabled?: boolean; hint?: string };
export type CheckboxGroupProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'children' | 'onChange' | 'value' | 'defaultValue' | 'name'> & {
  name: string; label: string; options: CheckboxOption[]; value?: string[]; defaultValue?: string[]; onChange?: (values: string[]) => void;
  orientation?: 'horizontal' | 'vertical'; size?: FormControlSize; helpText?: string; error?: string; required?: boolean; ref?: Ref<HTMLFieldSetElement>;
};
/**
 * Several independent choices that produce an array of values, inside a named fieldset. Each option is a native checkbox that submits `name=value`.
 * `required` means "choose at least one" and is shown in the legend; it is not placed on every checkbox, which would require all of them.
 */
export function CheckboxGroup({ name, label, options, value, defaultValue, onChange, orientation, size, helpText, error, required = false, disabled, id, className = '', ref, ...props }: CheckboxGroupProps) {
  const defaults = useComponentDefaults('checkbox-group');
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const current = value ?? inner;
  function toggle(optionValue: string, on: boolean) {
    const selected = new Set(current);
    if (on) selected.add(optionValue); else selected.delete(optionValue);
    // Options keep their listed order; a value the options do not list is preserved after them.
    const next = [...options.filter(option => selected.has(option.value)).map(option => option.value), ...current.filter(item => selected.has(item) && !options.some(option => option.value === item))];
    if (value === undefined) setInner(next);
    onChange?.(next);
  }
  return <Fieldset {...props} ref={ref} id={groupId} className={className} legend={label} helpText={helpText} error={error} required={required} disabled={disabled}>
    <div className={styles.options} data-orientation={orientation ?? defaults.orientation}>
      {options.map((option, index) => {
        const optionId = `${groupId}-${index}`;
        const hintId = option.hint ? `${optionId}-hint` : undefined;
        const off = disabled || option.disabled;
        return <div className={styles.choice} key={option.value}>
          <label className={styles.option} htmlFor={optionId} data-disabled={off || undefined}>
            <Checkbox id={optionId} name={name} value={option.value} size={size ?? defaults.size} checked={current.includes(option.value)} disabled={off}
              aria-invalid={error ? true : undefined} aria-describedby={hintId} onChange={event => toggle(option.value, event.currentTarget.checked)} />
            <span>{option.label}</span>
          </label>
          {option.hint && <p className={styles.hint} id={hintId}>{option.hint}</p>}
        </div>;
      })}
    </div>
  </Fieldset>;
}
