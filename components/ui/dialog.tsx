'use client';
import type { ReactNode, Ref } from 'react';
import { DialogTrigger, ModalOverlay, Modal, Dialog as AriaDialog, Heading } from 'react-aria-components';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { Button } from './button';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './Dialog.module.css';

export type DialogProps = {
  triggerLabel: string; title: string; children: ReactNode | ((close: () => void) => ReactNode);
  size?: 'small' | 'medium' | 'large'; disabled?: boolean;
  isOpen?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  dismissOnOutsidePress?: boolean; closeOnEscape?: boolean; closeLabel?: string;
  className?: string; ref?: Ref<HTMLElement>;
};
export function Dialog({ triggerLabel, title, children, size, disabled, isOpen, defaultOpen, onOpenChange, dismissOnOutsidePress, closeOnEscape, closeLabel, className = '', ref }: DialogProps) {
  const defaults = useComponentDefaults('dialog');
  return <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} />
    <ModalOverlay className={styles.overlay} isDismissable={dismissOnOutsidePress ?? defaults.dismissOnOutsidePress} isKeyboardDismissDisabled={!(closeOnEscape ?? defaults.closeOnEscape)}>
      <Modal className={styles.modal} data-size={size ?? defaults.size}>
        <AriaDialog ref={ref} className={`${styles.root} ${className}`}>
          {({ close }) => <>
            <Heading slot="title" className={styles.title}>{title}</Heading>
            <div className={styles.content}>{typeof children === 'function' ? children(close) : children}</div>
            <div className={styles.actions}><Button variant="secondary" onClick={close}>{closeLabel ?? defaults.closeLabel}</Button></div>
          </>}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>;
}
