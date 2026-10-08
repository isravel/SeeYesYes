'use client';
import { useEffect, useRef, useState, type Ref } from 'react';
import { TooltipTrigger, Tooltip as AriaTooltip } from 'react-aria-components/Tooltip';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './Tooltip.module.css';

export type TooltipProps = {
  triggerLabel: string; content: string; onPress: () => void; disabled?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right'; delay?: number; className?: string; ref?: Ref<HTMLDivElement>;
};
export function Tooltip({ triggerLabel, content, onPress, disabled, placement, delay, className = '', ref }: TooltipProps) {
  const defaults = useComponentDefaults('tooltip');
  const [isOpen, setOpen] = useState(false);
  const frame = useRef<number | null>(null);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  function changeOpen(open: boolean) {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (!open) { setOpen(false); return; }
    // Keyboard focus can scroll the trigger into view. Finish that scroll before
    // mounting the overlay, whose React Aria positioner dismisses on scroll.
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => { frame.current = null; setOpen(true); });
    });
  }
  return <TooltipTrigger isOpen={isOpen} onOpenChange={changeOpen} delay={delay ?? defaults.delay} closeDelay={100} isDisabled={disabled}>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} onPress={onPress} />
    <AriaTooltip ref={ref} className={`${styles.root} ${className}`} placement={placement ?? defaults.placement} offset={8}>{content}</AriaTooltip>
  </TooltipTrigger>;
}
