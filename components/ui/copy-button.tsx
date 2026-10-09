'use client';
import { useState, type Ref } from 'react';
import { Button } from './button';
import styles from './CopyButton.module.css';
export type CopyButtonProps = { value: string; label: string; successMessage?: string; failureMessage?: string; disabled?: boolean; ref?: Ref<HTMLDivElement> };
export function CopyButton({ value, label, successMessage = 'Copied to clipboard.', failureMessage = 'Could not copy. Check clipboard access and try again.', disabled, ref }: CopyButtonProps) {
  const [message, setMessage] = useState('');
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(value);
      setMessage(successMessage);
    } catch {
      setMessage(failureMessage);
    }
  }
  return <div ref={ref} className={styles.root}>
    <Button variant="secondary" disabled={disabled} aria-label={`Copy ${label}`} onClick={copy}>Copy</Button>
    <span className={styles.message} role="status">{message}</span>
  </div>;
}
