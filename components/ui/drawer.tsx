'use client';
import type { ReactNode, Ref } from 'react';
import { DialogTrigger, ModalOverlay, Modal, Dialog as AriaDialog, Heading } from 'react-aria-components';
import { useSurface } from '@/components/theme/ThemeScope';
import { GlassLayerContext } from '@/components/theme/glass-layer';
import { Button } from './button';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './Drawer.module.css';

export type DrawerProps = {
  triggerLabel: string; title: string; children: ReactNode | ((close: () => void) => ReactNode);
  side?: 'right' | 'left' | 'top' | 'bottom'; size?: 'small' | 'medium' | 'large'; disabled?: boolean;
  isOpen?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  dismissOnOutsidePress?: boolean; closeOnEscape?: boolean; closeLabel?: string;
  className?: string; ref?: Ref<HTMLElement>;
};
/**
 * A modal panel docked to one edge of the viewport, for a secondary task such as filters or details. Like Dialog it is named by its title,
 * contains focus, closes with Escape or an outside press, and returns focus to its trigger. The panel is clamped to the viewport.
 */
export function Drawer({ triggerLabel, title, children, side = 'right', size = 'medium', disabled, isOpen, defaultOpen, onOpenChange, dismissOnOutsidePress = true, closeOnEscape = true, closeLabel = 'Close', className = '', ref }: DrawerProps) {
  const surface = useSurface();
  return <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} />
    <ModalOverlay className={styles.overlay} isDismissable={dismissOnOutsidePress} isKeyboardDismissDisabled={!closeOnEscape}>
      {/* A sibling of the panel, not its ancestor, so the panel can still blur the page behind it. */}
      {surface === 'glass' && <div className={styles.scrimBlur} aria-hidden="true" />}
      <Modal className={styles.panel} data-side={side} data-size={size} data-surface={surface}>
        <AriaDialog ref={ref} className={`${styles.root} ${className}`}>
          {({ close }) => <GlassLayerContext.Provider value={true}>
            <div className={styles.header}>
              <Heading slot="title" className={styles.title}>{title}</Heading>
              <Button variant="ghost" onClick={close}>{closeLabel}</Button>
            </div>
            <div className={styles.content}>{typeof children === 'function' ? children(close) : children}</div>
          </GlassLayerContext.Provider>}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>;
}
