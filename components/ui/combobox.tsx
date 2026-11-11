'use client';
import { useId, type ReactNode, type Ref } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { Button as AriaButton, ComboBox as AriaComboBox, Header, Input as AriaInput, Label as AriaLabel, ListBox, ListBoxItem, ListBoxSection, Popover, Text } from 'react-aria-components';
import { useComponentDefaults, useSurface } from '@/components/theme/ThemeScope';
import type { FormControlSize } from './input';
import { Spinner } from './spinner';
import inputStyles from './Input.module.css';
import labelStyles from './Label.module.css';
import styles from './Combobox.module.css';

export type ComboboxOption = { value: string; label: string; disabled?: boolean; group?: string };
export type ComboboxProps = {
  label: string; options: ComboboxOption[]; name?: string;
  value?: string | null; defaultValue?: string | null; onChange?: (value: string | null) => void;
  inputValue?: string; defaultInputValue?: string; onInputChange?: (text: string) => void;
  /** Set to false when the caller filters `options` itself (for example from a server search). */
  filter?: boolean; placeholder?: string;
  loading?: boolean; loadingLabel?: string; emptyLabel?: string;
  size?: FormControlSize; helpText?: string; error?: string; required?: boolean; disabled?: boolean; readOnly?: boolean; id?: string; className?: string; ref?: Ref<HTMLDivElement>;
};

/** Keep the caller's order. A group appears where its first option is, and holds every option that names it. */
function arrange(options: ComboboxOption[]): (ComboboxOption | { group: string; items: ComboboxOption[] })[] {
  const seen = new Map<string, { group: string; items: ComboboxOption[] }>();
  const result: (ComboboxOption | { group: string; items: ComboboxOption[] })[] = [];
  for (const option of options) {
    if (!option.group) { result.push(option); continue; }
    let section = seen.get(option.group);
    if (!section) { section = { group: option.group, items: [] }; seen.set(option.group, section); result.push(section); }
    section.items.push(option);
  }
  return result;
}

const renderOption = (option: ComboboxOption) => <ListBoxItem key={option.value} id={option.value} textValue={option.label} className={styles.option}>{option.label}</ListBoxItem>;

/**
 * A searchable single-choice field. Typing filters the list, the arrow keys move through it and Enter picks the highlighted option. Only a listed option can be chosen:
 * leaving the field with text that matches nothing restores the last choice, so free text is never submitted. `name` submits the chosen option's value.
 * With `loading`, the list says so instead of showing "No results". Use Select for a short list that needs no search.
 */
export function Combobox({ label, options, name, value, defaultValue, onChange, inputValue, defaultInputValue, onInputChange, filter = true, placeholder, loading = false, loadingLabel = 'Loading…', emptyLabel = 'No results', size, helpText, error, required = false, disabled, readOnly, id, className = '', ref }: ComboboxProps) {
  const defaults = useComponentDefaults('combobox');
  const surface = useSurface();
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const arranged = arrange(options);
  const disabledKeys = options.filter(option => option.disabled).map(option => option.value);
  const empty: ReactNode = <p className={styles.empty}>{loading ? loadingLabel : emptyLabel}</p>;
  return <AriaComboBox ref={ref} id={fieldId} name={name} className={`${styles.root} ${className}`} data-size={size ?? defaults.size}
    selectedKey={value} defaultSelectedKey={defaultValue} onSelectionChange={key => onChange?.(key === null ? null : String(key))}
    inputValue={inputValue} defaultInputValue={defaultInputValue} onInputChange={onInputChange}
    defaultFilter={filter ? undefined : () => true} allowsCustomValue={false} allowsEmptyCollection menuTrigger="input"
    disabledKeys={disabledKeys} isDisabled={disabled} isReadOnly={readOnly} isRequired={required} isInvalid={error ? true : undefined} validationBehavior="aria">
    <AriaLabel className={labelStyles.root}>{label}{required && <span className={labelStyles.required} aria-hidden="true">*</span>}</AriaLabel>
    <div className={styles.control}>
      <AriaInput className={`${inputStyles.root} ${styles.input}`} data-size={size ?? defaults.size} placeholder={placeholder} />
      <span className={styles.trailing}>
        {loading && <Spinner size="small" />}
        <AriaButton className={styles.trigger} aria-label={`Show ${label} options`} excludeFromTabOrder><CaretDown aria-hidden="true" /></AriaButton>
      </span>
    </div>
    {helpText && <Text slot="description" className={styles.help}>{helpText}</Text>}
    {error && <Text slot="errorMessage" className={styles.error}>{error}</Text>}
    <span role="status" className={styles.status}>{loading ? loadingLabel : ''}</span>
    <Popover className={styles.popover} data-surface={surface} placement="bottom start" offset={4}>
      <ListBox className={styles.list} renderEmptyState={() => empty}>
        {arranged.map(entry => 'items' in entry
          ? <ListBoxSection key={`group-${entry.group}`} className={styles.group}><Header className={styles.heading}>{entry.group}</Header>{entry.items.map(renderOption)}</ListBoxSection>
          : renderOption(entry))}
      </ListBox>
    </Popover>
  </AriaComboBox>;
}
