'use client';
import { Fragment, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './Kbd.module.css';
export type KbdSize = 'small' | 'medium';
export type KbdProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick' | 'role' | 'tabIndex'> & { children?: ReactNode; keys?: string[]; size?: KbdSize; ref?: Ref<HTMLElement> };
/**
 * Displays a keyboard shortcut hint with native `kbd` elements. It never binds a shortcut: the page that shows a hint owns the handler.
 * Pass `keys` for a sequence such as Ctrl + K, or children for a single key. Write platform-neutral names, such as "Ctrl" or "Mod", and let the caller choose.
 */
export function Kbd({ children, keys, size, className = '', ref, ...props }: KbdProps) {
  const defaults = useComponentDefaults('kbd');
  const chosen = size ?? defaults.size;
  if (keys && keys.length > 0) {
    return <span {...props} ref={ref as Ref<HTMLSpanElement>} className={`${styles.group} ${className}`} data-size={chosen}>
      {keys.map((key, index) => <Fragment key={`${index}-${key}`}>{index > 0 && <span className={styles.plus} aria-hidden="true">+</span>}<kbd className={styles.key} data-size={chosen}>{key}</kbd></Fragment>)}
    </span>;
  }
  return <kbd {...props} ref={ref} className={`${styles.key} ${className}`} data-size={chosen}>{children}</kbd>;
}
