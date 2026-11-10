'use client';
import type { ReactNode } from 'react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { useSurface } from '@/components/theme/ThemeScope';
import { Button } from './button';
import styles from './Navigation.module.css';

/** The mobile drawer. Navigation loads it on demand, so pages that never open it do not ship its overlay code. */
export function NavigationDrawer({ label, onOpenChange, children, side = 'left', closeLabel = 'Close navigation' }: { side?: 'left' | 'right'; closeLabel?: string; label: string; onOpenChange: (open: boolean) => void; children: (close: () => void) => ReactNode }) {
  const surface = useSurface();
  return <ModalOverlay className={styles.overlay} isOpen isDismissable onOpenChange={onOpenChange}><Modal className={styles.drawer} data-side={side} data-surface={surface}><Dialog className={styles.dialog}>
    {({ close }) => <><div className={styles.drawerHeader}><Heading slot="title">{label}</Heading><Button variant="ghost" onClick={close}>{closeLabel}</Button></div>{children(close)}</>}
  </Dialog></Modal></ModalOverlay>;
}
