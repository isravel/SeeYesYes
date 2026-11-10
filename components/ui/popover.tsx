'use client';
import { useRef, type ReactNode, type Ref } from 'react';
import { DialogTrigger, Popover as AriaPopover, Dialog as AriaDialog } from 'react-aria-components';
import { useSurface } from '@/components/theme/ThemeScope';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './Popover.module.css';

export type PopoverProps = {
  triggerLabel: string; label: string; children: ReactNode | ((close: () => void) => ReactNode);
  placement?: 'bottom' | 'top' | 'left' | 'right'; disabled?: boolean;
  isOpen?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  className?: string; ref?: Ref<HTMLElement>;
};
/**
 * A light-dismiss panel anchored to a trigger. A press outside or Escape closes it and focus returns to the trigger; the page behind is inert while it is open.
 * The panel has dialog semantics because it holds interactive content, so `label` names it. For a short description with nothing to operate, use Tooltip.
 */
export function Popover({ triggerLabel, label, children, placement = 'bottom', disabled, isOpen, defaultOpen, onOpenChange, className = '', ref }: PopoverProps) {
  const surface = useSurface();
  const panel = useRef<HTMLDivElement>(null);
  return <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} />
    <AriaPopover ref={panel} className={styles.popover} data-surface={surface} placement={placement} offset={8}>
      <AriaDialog ref={ref} aria-label={label} className={`${styles.root} ${className}`}>
        {({ close }) => typeof children === 'function' ? children(close) : children}
      </AriaDialog>
    </AriaPopover>
  </DialogTrigger>;
}
