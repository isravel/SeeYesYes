'use client';
import type { ReactNode, Ref } from 'react';
import { Alert, type AlertTone } from '@/components/ui/alert';
import { Backdrop, type BackdropVariant } from '@/components/ui/backdrop';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import styles from './AuthShell.module.css';

export type AuthNoticeTone = 'error' | 'info' | 'success';
/** A message for the status region above the form. An error is announced at once; information and success are announced politely. */
export type AuthNotice = { tone: AuthNoticeTone; message: string; title?: string };
export type AuthShellLevel = 1 | 2 | 3;
export type AuthShellProps = {
  heading: string; level?: AuthShellLevel; description?: ReactNode; identity?: ReactNode; notice?: AuthNotice;
  /** Provider buttons you supply. Nothing is shown without them. */
  providers?: ReactNode; providersLabel?: string; dividerLabel?: string;
  children?: ReactNode; footer?: ReactNode; backdrop?: boolean | BackdropVariant; variant?: 'page' | 'contained';
  mainId?: string; headingRef?: Ref<HTMLHeadingElement>; className?: string;
};
const tones: Record<AuthNoticeTone, AlertTone> = { error: 'destructive', info: 'info', success: 'success' };

/**
 * A centered auth panel on the shared layered Backdrop. It is a Card, so the glass surface, its edge and its opaque fallbacks are the theme's own.
 * It holds slots only: an `identity` mark, a heading, a `description`, an optional `notice` (error, information or success, as an Alert), supplied `providers` above a labelled divider, your form as `children`, and a `footer` for links.
 * `variant="page"` (the default) makes the panel the page's one `main` landmark and fills the viewport; `contained` leaves landmarks to the host page. The heading takes focus when you move it with `headingRef` (it is focusable, not in the Tab order).
 */
export function AuthShell({ heading, level = 1, description, identity, notice, providers, providersLabel = 'Continue with', dividerLabel = 'or', children, footer, backdrop = true, variant = 'page', mainId = 'main', headingRef, className }: AuthShellProps) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
  const panel = <Card variant="elevated" className={styles.panel}>
    {identity && <div className={styles.identity}>{identity}</div>}
    <Heading ref={headingRef} tabIndex={-1} className={styles.heading}>{heading}</Heading>
    {description && <p className={styles.description}>{description}</p>}
    {notice && <div className={styles.notice}><Alert tone={tones[notice.tone]} title={notice.title}>{notice.message}</Alert></div>}
    {providers && <>
      <div role="group" aria-label={providersLabel} className={styles.providers}>{providers}</div>
      {children && <p className={styles.divider}>{dividerLabel}</p>}
    </>}
    {children}
    {footer && <div className={styles.footer}>{footer}</div>}
  </Card>;
  const body = variant === 'page'
    ? <main id={mainId} tabIndex={-1} className={styles.main}>{panel}</main>
    : <div className={styles.main}>{panel}</div>;
  return backdrop
    ? <Backdrop variant={backdrop === true ? undefined : backdrop} className={cn(styles.root, className)} data-variant={variant}>{body}</Backdrop>
    : <div className={cn(styles.root, className)} data-variant={variant}>{body}</div>;
}
