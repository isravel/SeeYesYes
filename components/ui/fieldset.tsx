'use client';
import { useId, type FieldsetHTMLAttributes, type ReactNode, type Ref } from 'react';
import styles from './Fieldset.module.css';
export type FieldsetProps = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'children' | 'onClick'> & {
  legend: string; helpText?: string; error?: string; required?: boolean; children: ReactNode; ref?: Ref<HTMLFieldSetElement>;
};
/** A native fieldset with its legend: the group name that assistive technology reads before each control inside it. */
export function Fieldset({ legend, helpText, error, required = false, disabled, id, children, className = '', ref, ...props }: FieldsetProps) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const helpId = helpText ? `${groupId}-help` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  const describedBy = [props['aria-describedby'], helpId, errorId].filter(Boolean).join(' ') || undefined;
  return <fieldset {...props} ref={ref} id={groupId} className={`${styles.root} ${className}`} disabled={disabled} aria-describedby={describedBy} data-invalid={error ? true : undefined}>
    <legend className={styles.legend}>{legend}{required && <><span aria-hidden="true"> *</span><span className={styles.hidden}> (required)</span></>}</legend>
    <div className={styles.controls}>{children}</div>
    {helpText && <p className={styles.help} id={helpId}>{helpText}</p>}
    {error && <p className={styles.error} id={errorId}>{error}</p>}
  </fieldset>;
}
