'use client';
import { cloneElement, isValidElement, type HTMLAttributes, type ReactElement, type Ref } from 'react';
import { Label } from './label';
import styles from './FormField.module.css';
/** What a control receives from its field. A composite control applies these to the one element the label should name. */
export type FieldControlProps = { id: string; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: boolean };
type ControlProps = Partial<FieldControlProps>;
export type FormFieldProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id' | 'onClick'> & {
  id: string; label: string; helpText?: string; error?: string; required?: boolean;
  /** One native control, or a function that places the field's accessibility props on a composite control. */
  children: ReactElement | ((control: FieldControlProps) => ReactElement); ref?: Ref<HTMLDivElement>;
};
export function FormField({ id, label, helpText, error, required = false, children, className = '', ref, ...props }: FormFieldProps) {
  const render = typeof children === 'function' ? children : null;
  if (!render && !isValidElement(children)) throw new Error('FormField expects one native form control element.');
  const childProps = render ? {} : (children as ReactElement<ControlProps>).props;
  const describedBy = [helpText ? `${id}-help` : '', error ? `${id}-error` : '', childProps['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const controlProps: FieldControlProps = { id, required: required || childProps.required || undefined, 'aria-describedby': describedBy, 'aria-invalid': error ? true : childProps['aria-invalid'] || undefined };
  const control = render ? render(controlProps) : cloneElement(children as ReactElement<ControlProps>, controlProps);
  return <div {...props} ref={ref} className={`${styles.root} ${className}`}>
    <Label htmlFor={id} required={required}>{label}</Label>
    {control}
    {helpText && <p className={styles.help} id={`${id}-help`}>{helpText}</p>}
    {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
  </div>;
}
