'use client';
import { useState, type ButtonHTMLAttributes, type Ref } from 'react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import styles from './MenuToggle.module.css';
export type MenuToggleSize = 'small' | 'medium' | 'large';
export type MenuToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'onClick' | 'aria-label' | 'aria-labelledby' | 'aria-expanded' | 'aria-controls'> & {
  label: string; expanded?: boolean; defaultExpanded?: boolean; onExpandedChange?: (expanded: boolean) => void; controls?: string;
  size?: MenuToggleSize; animated?: boolean; ref?: Ref<HTMLButtonElement>;
};
/**
 * A native button that shows and hides a menu or panel. Its name stays the same (`label`) and `aria-expanded` carries the state, so the icon never has to.
 * The three bars turn into a close mark when expanded, which is a change of shape and not only of color. `animated` (on by default) eases that change; reduced motion swaps it instantly.
 * The toggle owns no menu: the page shows and hides the panel in `onExpandedChange` and points `controls` at its id.
 */
export function MenuToggle({ label, expanded, defaultExpanded = false, onExpandedChange, controls, size, animated = true, disabled, className = '', ref, ...props }: MenuToggleProps) {
  const defaults = useComponentDefaults('menu-toggle');
  const [inner, setInner] = useState(defaultExpanded);
  const open = expanded ?? inner;
  const toggle = () => { const next = !open; if (expanded === undefined) setInner(next); onExpandedChange?.(next); };
  return <button {...props} ref={ref} type="button" className={`${styles.root} ${className}`} aria-label={label} aria-expanded={open} aria-controls={controls} disabled={disabled}
    data-size={size ?? defaults.size} data-animated={animated ? true : undefined} onClick={toggle}>
    <span className={styles.bars} aria-hidden="true"><span className={styles.bar} /><span className={styles.bar} /><span className={styles.bar} /></span>
  </button>;
}
