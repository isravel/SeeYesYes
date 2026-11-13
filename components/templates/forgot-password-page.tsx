'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { emailProblem } from '@/lib/utils/auth';
import { AuthShell, type AuthNotice, type AuthShellProps } from './auth-shell';
import { TextField } from './auth-fields';
import { useSubmission, type SubmissionStatus } from './use-submission';
import styles from './AuthForm.module.css';

export type ForgotPasswordLabels = {
  heading: string; description: string; email: string; submit: string; submitting: string; signInPrompt: string; signIn: string; emailRequired: string; emailInvalid: string;
  failed: string; pending: string; sentHeading: string; sentDescription: (email: string) => string; sentNotice: string; retry: string; useAnother: string;
};
const defaults: ForgotPasswordLabels = {
  heading: 'Reset your password', description: 'Enter your email address and we will send reset instructions if there is an account for it.', email: 'Email address', submit: 'Send reset instructions', submitting: 'Sending…',
  signInPrompt: 'Remembered it?', signIn: 'Back to sign in', emailRequired: 'Enter your email address.', emailInvalid: 'Enter an email address like name@example.com.',
  failed: 'We could not send that request. Try again in a moment.', pending: 'Sending your request…',
  sentHeading: 'Check your inbox', sentDescription: email => `If there is an account for ${email}, instructions to reset the password are on their way.`, sentNotice: 'The message can take a few minutes. Check your spam folder too.',
  retry: 'Send again', useAnother: 'Use a different email address',
};
export type ForgotPasswordPageProps = Pick<AuthShellProps, 'identity' | 'backdrop' | 'variant' | 'level' | 'mainId' | 'className'> & {
  /** Your integration point. Resolve when the request was accepted, whether or not an account exists; reject (or throw) only when the request itself could not be made. */
  onSubmit: (values: { email: string }) => void | Promise<void>;
  signInHref?: string; initialStatus?: SubmissionStatus; labels?: Partial<ForgotPasswordLabels>;
};

/**
 * A reset-request screen and a neutral check-inbox screen. After a request is accepted it always says "if there is an account", so the page never confirms or denies that an address is registered, and the same screen follows for every address.
 * A request that could not be made shows a fixed retry message that holds no account details. The inbox screen offers Send again and a way back to change the address; focus moves to its heading when it appears.
 * Sending the email, token handling and rate limiting are yours; `onSubmit` is the integration point and should itself respond the same for known and unknown addresses.
 */
export function ForgotPasswordPage({ onSubmit, signInHref, initialStatus = 'idle', labels, ...shell }: ForgotPasswordPageProps) {
  const text = { ...defaults, ...labels };
  const id = useId();
  const [email, setEmail] = useState('');
  const [problem, setProblem] = useState<string | undefined>();
  const submission = useSubmission(initialStatus);
  const emailRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pending = submission.status === 'pending';
  const sent = submission.status === 'success';
  const send = async () => { await submission.run(() => onSubmit({ email: email.trim() })); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const issue = emailProblem(email);
    const message = issue === 'required' ? text.emailRequired : issue ? text.emailInvalid : undefined;
    setProblem(message);
    if (message) { emailRef.current?.focus(); return; }
    void send();
  };
  // The inbox screen replaces the form, so its heading takes focus and the change is announced.
  useEffect(() => { if (sent) headingRef.current?.focus(); }, [sent]);
  if (sent) return <AuthShell {...shell} headingRef={headingRef} heading={text.sentHeading} description={text.sentDescription(email.trim() || '…')} notice={{ tone: 'info', message: text.sentNotice }}
    footer={signInHref ? <Link href={signInHref}>{text.signIn}</Link> : undefined}>
    <div className={styles.actions}>
      <Button variant="outline" onClick={() => void send()}>{text.retry}</Button>
      <Button variant="ghost" onClick={() => { submission.reset(); setTimeout(() => emailRef.current?.focus(), 0); }}>{text.useAnother}</Button>
    </div>
  </AuthShell>;
  const notice: AuthNotice | undefined = submission.status === 'failed' ? { tone: 'error', message: text.failed } : pending ? { tone: 'info', message: text.pending } : undefined;
  return <AuthShell {...shell} heading={text.heading} description={text.description} notice={notice}
    footer={signInHref ? <p className={styles.note}>{text.signInPrompt} <Link href={signInHref}>{text.signIn}</Link></p> : undefined}>
    <form noValidate className={styles.form} onSubmit={submit} aria-busy={pending || undefined}>
      <TextField id={`${id}-email`} label={text.email} type="email" autoComplete="email" value={email} onChange={setEmail} error={problem} readOnly={pending} inputRef={emailRef} />
      <Button type="submit" aria-disabled={pending || undefined}>{pending ? text.submitting : text.submit}</Button>
    </form>
  </AuthShell>;
}
