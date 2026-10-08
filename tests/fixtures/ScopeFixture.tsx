'use client';
import { useState } from 'react';
import { Modal } from 'react-aria-components/Modal';
import { Dialog } from 'react-aria-components/Dialog';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { ThemeScope } from '@/components/theme/ThemeScope';
import type { Theme } from '@/lib/contract/schema';
import styles from './ScopeFixture.module.css';

function PortalProbe() {
  const [open, setOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)}>Open scope probe</Button><Modal isOpen={open} onOpenChange={setOpen} isDismissable><Dialog aria-label="Scope portal probe" className={styles.dialog}><p>This overlay belongs to the inner theme.</p><Button onClick={() => setOpen(false)}>Close probe</Button></Dialog></Modal></>;
}
export function ScopeFixture({ theme }: { theme: Theme }) {
  const [compact, setCompact] = useState(true);
  const [visible, setVisible] = useState(true);
  const outer: Theme = { ...theme, density: compact ? 'compact' : 'spacious', radius: 'sharp', componentDefaults: { button: {variant: 'secondary', size: 'small'}, link: {variant: 'subtle'}, spinner: {size: 'small'} } };
  const inner: Theme = { ...theme, density: 'spacious', radius: 'curvy', typography: {...theme.typography, scale: 'large'}, componentDefaults: {button: {variant: 'ghost', size: 'large'}} };
  return <main className={styles.main}><h1>Theme scope checks</h1><Button>Workspace action</Button><Button onClick={() => setCompact(v => !v)}>Toggle outer density</Button><Button onClick={() => setVisible(v => !v)}>Toggle nested scopes</Button>{visible && <ThemeScope id="outer-scope" theme={outer} appearance="dark" className={styles.panel}><h2>Outer theme</h2><Button>Outer default</Button><Link href="#inner-scope">Outer link</Link><Spinner /><ThemeScope id="inner-scope" theme={inner} appearance="light" className={styles.panel}><h2>Inner theme</h2><Button>Inner default</Button><Button variant="primary" size="medium">Explicit action</Button><PortalProbe /></ThemeScope></ThemeScope>}</main>;
}
