'use client';
import { useEffect, useId, useState, useSyncExternalStore, type KeyboardEvent, type Ref } from 'react';
import { CheckCircle, Info, Warning, WarningCircle, X } from '@phosphor-icons/react';
import { Button as AriaButton, Text, UNSTABLE_Toast as AriaToast, UNSTABLE_ToastContent as ToastContent, UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastRegion as ToastRegion, type QueuedToast } from 'react-aria-components';
import { InternalTriggerButton } from './internal-trigger-button';
import styles from './Toast.module.css';

type ToastTone = 'info' | 'success' | 'warning' | 'destructive';
type ToastPosition = 'bottom-center' | 'bottom-end' | 'top-center' | 'top-end';
type ToastData = { tone: ToastTone; title?: string; message: string; actionLabel?: string; onAction?: () => void | Promise<void>; actionErrorMessage: string };
export type ToastProps = {
  triggerLabel: string; message: string; title?: string;
  tone?: ToastTone; position?: ToastPosition;
  actionLabel?: string; onAction?: () => void | Promise<void>; actionErrorMessage?: string;
  timeout?: number; disabled?: boolean; className?: string; ref?: Ref<HTMLDivElement>;
};

const icons = { info: Info, success: CheckCircle, warning: Warning, destructive: WarningCircle };
const toneNames = { info: 'Information', success: 'Success', warning: 'Warning', destructive: 'Error' };
/** A toast with an action never expires, so there is always time to respond; one without an action expires after `timeout` milliseconds. */
export const toastExpiry = (timeout: number, actionLabel?: string) => actionLabel ? undefined : timeout;
const MAX_VISIBLE = 3;

// Toasts queue per screen position, shared by every Toast on the page. One region per position shows them, so they never overlap and the page has one notifications landmark.
const queues = new Map<ToastPosition, ToastQueue<ToastData>>();
const queueFor = (position: ToastPosition) => {
  let queue = queues.get(position);
  if (!queue) { queue = new ToastQueue<ToastData>({ maxVisibleToasts: MAX_VISIBLE }); queues.set(position, queue); }
  return queue;
};
// The first mounted Toast at a position owns that position's region. When it unmounts, the next one takes over.
const owners = new Map<ToastPosition, string[]>();
const listeners = new Set<() => void>();
const ownerOf = (position: ToastPosition) => owners.get(position)?.[0];
const claim = (position: ToastPosition, id: string) => {
  owners.set(position, [...(owners.get(position) ?? []), id]);
  listeners.forEach(listener => listener());
  return () => { owners.set(position, (owners.get(position) ?? []).filter(item => item !== id)); listeners.forEach(listener => listener()); };
};
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

function ToastItem({ toast, queue }: { toast: QueuedToast<ToastData>; queue: ToastQueue<ToastData> }) {
  const { tone, title, message, actionLabel, onAction, actionErrorMessage } = toast.content;
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const Icon = icons[tone];
  const urgent = tone === 'warning' || tone === 'destructive';
  const run = async () => {
    if (pending) return;
    setPending(true); setFailed(false);
    try { await onAction?.(); queue.close(toast.key); }
    // A failed action keeps the toast open, says so in text, and leaves the action available for another try.
    catch { setFailed(true); setPending(false); }
  };
  // React Aria's toast does not handle Escape, so a focused toast closes here; the key press bubbles up from the toast to this wrapper.
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (event.key === 'Escape') { event.stopPropagation(); queue.close(toast.key); } };
  return <div className={styles.keys} onKeyDown={keyDown}><AriaToast toast={toast} className={styles.toast} data-tone={tone}>
    <Icon className={styles.icon} aria-hidden="true" weight="regular" />
    {/* One live region per toast: information and success are announced politely, warnings and errors interrupt. Text added later (progress, failure) is announced by it too. */}
    <ToastContent className={styles.content} role={urgent ? 'alert' : 'status'} aria-live={urgent ? 'assertive' : 'polite'}>
      {/* The tone is a color, so a toast without a title still names it in text. */}
      <Text slot="title" className={title ? styles.title : styles.hidden}>{title ?? toneNames[tone]}</Text>
      <Text slot="description" className={styles.message}>{message}</Text>
      {pending && <p className={styles.detail}>Working…</p>}
      {failed && <p className={styles.detail}>{actionErrorMessage}</p>}
      {actionLabel && <AriaButton className={styles.action} isPending={pending} onPress={run}>{actionLabel}</AriaButton>}
    </ToastContent>
    <AriaButton slot="close" className={styles.close}><X aria-hidden="true" /></AriaButton>
  </AriaToast></div>;
}

/**
 * A button that shows a transient message. Each press queues a toast; up to three show at once per position and the rest wait their turn.
 * A toast without an action expires after `timeout` (5 seconds) and its timer pauses on hover and focus. A toast with an `actionLabel` stays until dismissed.
 * If `onAction` rejects, the toast stays open and shows `actionErrorMessage` as text. The close button is always present, Escape closes a focused toast, and the region is a labelled landmark.
 */
export function Toast({ triggerLabel, message, title, tone = 'info', position = 'bottom-center', actionLabel, onAction, actionErrorMessage = 'That did not work. Try again.', timeout = 5000, disabled, className = '', ref }: ToastProps) {
  const id = useId();
  const queue = queueFor(position);
  useEffect(() => claim(position, id), [position, id]);
  const owner = useSyncExternalStore(subscribe, () => ownerOf(position), () => undefined);
  return <>
    <InternalTriggerButton label={triggerLabel} disabled={disabled} onPress={() => queue.add({ tone, title, message, actionLabel, onAction, actionErrorMessage }, { timeout: toastExpiry(timeout, actionLabel) })} />
    {owner === id && <ToastRegion ref={ref} queue={queue} aria-label="Notifications" className={`${styles.region} ${className}`} data-position={position}>
      {({ toast }) => <ToastItem toast={toast} queue={queue} />}
    </ToastRegion>}
  </>;
}
