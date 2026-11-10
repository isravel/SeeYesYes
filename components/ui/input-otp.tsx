'use client';
import { useId, useState, type ChangeEvent, type ClipboardEvent, type FocusEvent, type MouseEvent, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { FormField } from './form-field';
import type { FormControlSize } from './input';
import styles from './InputOtp.module.css';
export type InputOtpProps = {
  label: string; name?: string; length?: number; masked?: boolean;
  value?: string; defaultValue?: string; onChange?: (value: string) => void; onComplete?: (value: string) => void;
  size?: FormControlSize; helpText?: string; error?: string; required?: boolean; disabled?: boolean; readOnly?: boolean; id?: string; className?: string; ref?: Ref<HTMLDivElement>;
};
const digits = (text: string, length: number) => text.replace(/\D/g, '').slice(0, length);
/**
 * A one-time code field. It is one real text input (numeric keyboard, `one-time-code` autofill, native typing and correction) with the digit boxes drawn behind it,
 * so the label, value and errors are read as a single field. Only digits are kept. A pasted code replaces the whole value. Nothing is submitted when the code is complete;
 * `onComplete` only reports it.
 */
export function InputOtp({ label, name, length = 6, masked = false, value, defaultValue = '', onChange, onComplete, size, helpText, error, required = false, disabled, readOnly, id, className = '', ref }: InputOtpProps) {
  const defaults = useComponentDefaults('input-otp');
  const generatedId = useId();
  const count = Math.max(1, Math.floor(length));
  const [inner, setInner] = useState(() => digits(defaultValue, count));
  const [focused, setFocused] = useState(false);
  const current = value === undefined ? inner : digits(value, count);
  const active = focused && !disabled && !readOnly ? Math.min(current.length, count - 1) : -1;
  function update(next: string) {
    if (value === undefined) setInner(next);
    if (next === current) return;
    onChange?.(next);
    if (next.length === count) onComplete?.(next);
  }
  // The caret stays at the end, so the highlighted box always matches where the next digit goes.
  const toEnd = (event: FocusEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
  };
  return <FormField id={id ?? generatedId} label={label} helpText={helpText} error={error} required={required} className={className} ref={ref}>
    {control => <div className={styles.group} data-size={size ?? defaults.size} data-complete={current.length === count ? true : undefined}>
      <input {...control} name={name} className={styles.input} type={masked ? 'password' : 'text'} inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code" autoCapitalize="off" spellCheck={false}
        value={current} disabled={disabled} readOnly={readOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) => update(digits(event.target.value, count))}
        onPaste={(event: ClipboardEvent<HTMLInputElement>) => {
          const pasted = digits(event.clipboardData.getData('text'), count);
          event.preventDefault();
          if (pasted && !readOnly && !disabled) update(pasted);
        }}
        onFocus={event => { setFocused(true); toEnd(event); }} onBlur={() => setFocused(false)} onClick={toEnd} />
      <div className={styles.slots} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => <span key={index} className={styles.slot} data-active={index === active ? true : undefined}>{index < current.length ? (masked ? '•' : current[index]) : ''}</span>)}
      </div>
    </div>}
  </FormField>;
}
