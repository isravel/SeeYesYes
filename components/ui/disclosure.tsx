'use client';
import { useId, useState, type HTMLAttributes, type PointerEvent, type ReactNode, type Ref } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import styles from './Disclosure.module.css';
export type DisclosureProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> & {
  label: string; children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  openOnHover?: boolean; headingLevel?: 2 | 3 | 4 | 5 | 6; disabled?: boolean; ref?: Ref<HTMLDivElement>;
};
/**
 * One trigger that shows or hides one block of content. The trigger is a native button with `aria-expanded` and `aria-controls`, and collapsed content is
 * `hidden`, so it cannot receive focus. `openOnHover` adds a mouse-only preview: hovering shows the content, leaving hides it, and a click keeps it open.
 * Touch and keyboard users always use the click path, so nothing depends on hover. `headingLevel` places the trigger in a heading, as an accordion needs.
 */
export function Disclosure({ label, children, open, defaultOpen = false, onOpenChange, openOnHover = false, headingLevel, disabled, className = '', onPointerEnter, onPointerLeave, ref, ...props }: DisclosureProps) {
  const [inner, setInner] = useState(defaultOpen);
  const [hovering, setHovering] = useState(false);
  const base = useId();
  const triggerId = `${base}-trigger`;
  const panelId = `${base}-panel`;
  const pinned = open ?? inner;
  const shown = pinned || (hovering && !disabled);
  const change = (next: boolean) => { if (open === undefined) setInner(next); onOpenChange?.(next); };
  const toggle = () => {
    if (disabled) return;
    // A click while the content is only hover-previewed keeps it open; a click on pinned content closes it, even under the pointer.
    if (hovering && !pinned) { change(true); return; }
    setHovering(false);
    change(!pinned);
  };
  const Heading = `h${headingLevel}` as 'h2';
  const trigger = <button type="button" id={triggerId} className={styles.trigger} aria-expanded={shown} aria-controls={panelId} disabled={disabled} onClick={toggle}>
    <span>{label}</span><CaretDown className={styles.icon} aria-hidden="true" />
  </button>;
  return <div {...props} ref={ref} className={`${styles.root} ${className}`}
    onPointerEnter={(event: PointerEvent<HTMLDivElement>) => { onPointerEnter?.(event); if (openOnHover && !disabled && event.pointerType === 'mouse') setHovering(true); }}
    onPointerLeave={(event: PointerEvent<HTMLDivElement>) => { onPointerLeave?.(event); setHovering(false); }}>
    {headingLevel ? <Heading className={styles.heading}>{trigger}</Heading> : trigger}
    <div id={panelId} className={styles.panel} hidden={!shown} role={headingLevel ? 'region' : undefined} aria-labelledby={headingLevel ? triggerId : undefined}>{children}</div>
  </div>;
}
