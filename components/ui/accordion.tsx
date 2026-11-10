'use client';
import { useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { Disclosure } from './disclosure';
import styles from './Accordion.module.css';
export type AccordionItem = { id: string; label: string; content: ReactNode; disabled?: boolean };
export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'defaultValue'> & {
  items: AccordionItem[]; mode?: 'single' | 'multiple'; collapsible?: boolean; value?: string[]; defaultValue?: string[];
  onChange?: (values: string[]) => void; headingLevel?: 2 | 3 | 4 | 5 | 6; ref?: Ref<HTMLDivElement>;
};
/**
 * A stack of Disclosures, each with its trigger in a heading and its content in a region named by that heading. `single` keeps one section open at a time
 * (and `collapsible={false}` keeps that one open); `multiple` lets any number stay open. Controlled with `value`, or uncontrolled with `defaultValue`.
 * Keyboard use is Tab to each trigger and Enter or Space to toggle it; arrow-key movement between triggers is not added.
 */
export function Accordion({ items, mode = 'single', collapsible = true, value, defaultValue, onChange, headingLevel = 3, className = '', ref, ...props }: AccordionProps) {
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const known = new Set(items.map(item => item.id));
  const listed = (value ?? inner).filter(id => known.has(id));
  const current = mode === 'single' ? listed.slice(0, 1) : listed;
  function change(id: string, open: boolean) {
    let next: string[];
    if (mode === 'single') {
      if (open) next = [id];
      else if (!collapsible) return;
      else next = [];
    } else {
      // Sections keep their listed order whatever order they were opened in.
      next = items.filter(item => open ? item.id === id || current.includes(item.id) : item.id !== id && current.includes(item.id)).map(item => item.id);
    }
    if (value === undefined) setInner(next);
    onChange?.(next);
  }
  return <div {...props} ref={ref} className={`${styles.root} ${className}`}>
    {items.map(item => <div className={styles.item} key={item.id}>
      <Disclosure label={item.label} headingLevel={headingLevel} disabled={item.disabled} open={current.includes(item.id)} onOpenChange={open => change(item.id, open)}>{item.content}</Disclosure>
    </div>)}
  </div>;
}
