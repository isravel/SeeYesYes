'use client';
import { cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type Ref } from 'react';
import { Label } from './label';
import styles from './FormField.module.css';
type ControlProps = { id?: string; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: boolean };
export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id' | 'onClick'> & { id: string; label: string; helpText?: string; error?: string; required?: boolean; children: ReactElement; ref?: Ref<HTMLDivElement> };
export function FormField({ id, label, helpText, error, required = false, children, className = '', ref, ...props }: FormFieldProps) {
  if (!isValidElement(children)) throw new Error('FormField expects one native form control element.');
  const childProps = (children as ReactElement<ControlProps>).props;
  const describedBy = [helpText ? `${id}-help` : '', error ? `${id}-error` : '', childProps['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const control = cloneElement(children as ReactElement<ControlProps>, { id, required: required || childProps.required || undefined, 'aria-describedby': describedBy, 'aria-invalid': error ? true : childProps['aria-invalid'] || undefined });
  return <div {...props} ref={ref} className={`${styles.root} ${className}`}>
    <Label htmlFor={id} required={required}>{label}</Label>
    {control}
    {helpText && <p className={styles.help} id={`${id}-help`}>{helpText}</p>}
    {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
  </div>;
}
