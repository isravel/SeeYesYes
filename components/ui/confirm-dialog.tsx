'use client';
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type Ref } from 'react';
import { DialogTrigger, ModalOverlay, Modal, Dialog as AriaDialog, Heading } from 'react-aria-components';
import { useComponentDefaults, useSurface } from '@/components/theme/ThemeScope';
import { GlassLayerContext } from '@/components/theme/glass-layer';
import { assignRef } from '@/lib/utils/merge-refs';
import { Button } from './button';
import { FormField } from './form-field';
import { Input } from './input';
import { InternalTriggerButton } from './internal-trigger-button';
// Borrowed from Dialog so the two panels look alike; Dialog's contract owns these styles.
import dialogStyles from './Dialog.module.css';
import styles from './ConfirmDialog.module.css';

export type ConfirmDialogProps = {
  triggerLabel: string; title: string;
  /** What will happen if the person confirms. It becomes the dialog description. */
  children: ReactNode;
  /** Runs when the person confirms. The dialog closes when it resolves; if it throws or rejects, the dialog stays open with `errorMessage`. */
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string; cancelLabel?: string; destructive?: boolean;
  /** When set, the person must type this exact text before Confirm is enabled. */
  confirmText?: string;
  errorMessage?: string; pendingLabel?: string;
  size?: 'small' | 'medium' | 'large'; disabled?: boolean;
  isOpen?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  className?: string; ref?: Ref<HTMLElement>;
};
/**
 * A modal that asks for confirmation before a consequential action. It is an alert dialog: it is named by its title, described by its message,
 * and an outside press never dismisses it. Focus starts on Cancel (or on the text field when typing is required), never on Confirm.
 * While the action runs, Confirm shows progress and the dialog cannot be closed. A failure keeps the dialog open, shows `errorMessage`, and keeps what was typed.
 */
export function ConfirmDialog({ triggerLabel, title, children, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false, confirmText, errorMessage = 'Could not finish. Try again.', pendingLabel = 'Working…', size, disabled, isOpen, defaultOpen = false, onOpenChange, className = '', ref }: ConfirmDialogProps) {
  const defaults = useComponentDefaults('confirm-dialog');
  const surface = useSurface();
  const [inner, setInner] = useState(defaultOpen);
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const root = useRef<HTMLElement | null>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const ids = useId();
  const open = isOpen ?? inner;
  const ready = confirmText === undefined || typed === confirmText;
  const setOpen = (next: boolean) => {
    if (next) { setTyped(''); setFailed(false); }
    if (isOpen === undefined) setInner(next);
    onOpenChange?.(next);
  };
  // A running action cannot be abandoned by a close request from the trigger, Escape or a controlled parent.
  const change = (next: boolean) => { if (!next && pending) return; setOpen(next); };
  useEffect(() => { if (failed) confirmButton.current?.focus(); }, [failed]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || pending) return;
    setPending(true); setFailed(false);
    // Confirm is about to be disabled; keep focus inside the dialog rather than letting it fall to the page.
    root.current?.focus();
    try { await onConfirm(); } catch { setPending(false); setFailed(true); return; }
    setPending(false);
    setOpen(false);
  }
  return <DialogTrigger isOpen={open} onOpenChange={change}>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} variant={destructive ? 'destructive' : undefined} />
    <ModalOverlay className={dialogStyles.overlay} isDismissable={false} isKeyboardDismissDisabled={pending}>
      {surface === 'glass' && <div className={dialogStyles.scrimBlur} aria-hidden="true" />}
      <Modal className={dialogStyles.modal} data-size={size ?? defaults.size} data-surface={surface}>
        <AriaDialog role="alertdialog" aria-describedby={`${ids}-message`} ref={node => { root.current = node; assignRef(ref, node); }} className={`${dialogStyles.root} ${className}`}>
          <GlassLayerContext.Provider value={true}>
            <form className={styles.form} onSubmit={submit} noValidate>
              <Heading slot="title" className={dialogStyles.title}>{title}</Heading>
              <div id={`${ids}-message`} className={dialogStyles.content}>{children}</div>
              {confirmText !== undefined && <FormField id={`${ids}-typed`} label={`Type “${confirmText}” to confirm`}>
                <Input value={typed} onChange={event => setTyped(event.target.value)} disabled={pending} autoComplete="off" autoCapitalize="off" spellCheck={false} autoFocus />
              </FormField>}
              {pending && <p role="status" className={styles.status}>{pendingLabel}</p>}
              {failed && <p role="alert" className={styles.error}>{errorMessage}</p>}
              <div className={dialogStyles.actions}>
                <Button variant="secondary" disabled={pending} autoFocus={confirmText === undefined} onClick={() => change(false)}>{cancelLabel}</Button>
                <Button ref={confirmButton} type="submit" variant={destructive ? 'destructive' : 'primary'} loading={pending} disabled={!ready}>{confirmLabel}</Button>
              </div>
            </form>
          </GlassLayerContext.Provider>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>;
}
