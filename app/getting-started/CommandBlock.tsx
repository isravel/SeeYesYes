'use client';
import { CopyButton } from '@/components/ui/copy-button';
import styles from './getting-started.module.css';

export function CommandBlock({ command, note }: { command: string; note: string }) {
  return <div className={styles.command}>
    <div><code>{command}</code><p>{note}</p></div>
    <CopyButton label={`command ${command}`} value={command} />
  </div>;
}
export function CodeBlock({ label, code }: { label: string; code: string }) {
  return <div className={styles.codeBlock}><pre tabIndex={0} aria-label={label}><code>{code}</code></pre><CopyButton label={label} value={code} /></div>;
}
