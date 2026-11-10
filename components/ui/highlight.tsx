import type { HTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Highlight.module.css';
export type HighlightProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { children: ReactNode; ref?: Ref<HTMLElement> };
/** Restrained inline emphasis for one key phrase. It is a native `mark`, so the words stay readable without the background. */
export function Highlight({ className = '', children, ref, ...props }: HighlightProps) {
  return <mark {...props} ref={ref} className={`${styles.root} ${className}`}>{children}</mark>;
}
