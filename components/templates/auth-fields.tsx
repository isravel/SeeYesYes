'use client';
import { useState, type Ref } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { FormField } from '@/components/ui/form-field';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import styles from './AuthForm.module.css';

type FieldBase = { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; helpText?: string; readOnly?: boolean; inputRef?: Ref<HTMLInputElement> };

/** A labelled text or email field. The label, help and error text are tied to the input by FormField; the value is passed through unchanged. */
export function TextField({ id, label, value, onChange, error, helpText, readOnly, inputRef, type = 'text', autoComplete }: FieldBase & { type?: 'text' | 'email'; autoComplete: string }) {
  return <FormField id={id} label={label} error={error} helpText={helpText} required>
    <Input ref={inputRef} type={type} value={value} autoComplete={autoComplete} readOnly={readOnly} autoCapitalize={type === 'email' || autoComplete === 'username' ? 'none' : undefined} spellCheck={false} onChange={event => onChange(event.currentTarget.value)} />
  </FormField>;
}

/**
 * A labelled password field with a visibility button. The password starts hidden and is revealed only when the user presses the button.
 * The button keeps one name (`showLabel`) and reports its state with `aria-pressed`, so its name never flips. The value is never trimmed or changed.
 */
export function PasswordField({ id, label, value, onChange, autoComplete, error, helpText, readOnly, showLabel, inputRef }: FieldBase & { autoComplete: 'current-password' | 'new-password'; showLabel: string }) {
  const [visible, setVisible] = useState(false);
  return <FormField id={id} label={label} error={error} helpText={helpText} required>
    {control => <div className={styles.passwordRow}>
      <Input {...control} ref={inputRef} type={visible ? 'text' : 'password'} value={value} autoComplete={autoComplete} readOnly={readOnly} autoCapitalize="none" spellCheck={false} onChange={event => onChange(event.currentTarget.value)} />
      <IconButton label={showLabel} pressed={visible} variant="outline" icon={visible ? <EyeSlash /> : <Eye />} onClick={() => setVisible(current => !current)} />
    </div>}
  </FormField>;
}
