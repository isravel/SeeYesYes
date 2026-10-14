'use client';
import type { ReactNode } from 'react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { Button } from './button';
import styles from './Navigation.module.css';

/** The mobile drawer. Navigation loads it on demand, so pages that never open it do not ship its overlay code. */
export function NavigationDrawer({ label, onOpenChange, children }: { label: string; onOpenChange: (open: boolean) => void; children: (close: () => void) => ReactNode }) {
  return <ModalOverlay className={styles.overlay} isOpen isDismissable onOpenChange={onOpenChange}><Modal className={styles.drawer}><Dialog className={styles.dialog}>
    {({ close }) => <><div className={styles.drawerHeader}><Heading slot="title">{label}</Heading><Button variant="ghost" onClick={close}>Close navigation</Button></div>{children(close)}</>}
  </Dialog></Modal></ModalOverlay>;
}
