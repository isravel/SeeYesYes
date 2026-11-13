'use client';
import { useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { emailProblem, passwordProblem } from '@/lib/utils/auth';
import { AuthShell, type AuthNotice, type AuthShellProps } from './auth-shell';
import { AuthProviderButtons, type AuthProvider } from './auth-providers';
import { PasswordField, TextField } from './auth-fields';
import { useSubmission, type SubmissionStatus } from './use-submission';
import styles from './AuthForm.module.css';

export type SignInValues = { email: string; password: string };
export type SignInLabels = {
  heading: string; description: string; email: string; password: string; showPassword: string; submit: string; submitting: string; forgot: string; signUpPrompt: string; signUp: string;
  providerAction: (provider: string) => string; emailRequired: string; emailInvalid: string; passwordRequired: string; failed: string; providerFailed: string; success: string; pending: string;
};
const defaults: SignInLabels = {
  heading: 'Sign in', description: 'Welcome back. Enter your details to continue.', email: 'Email address', password: 'Password', showPassword: 'Show password', submit: 'Sign in', submitting: 'Signing in…',
  forgot: 'Forgot your password?', signUpPrompt: 'New here?', signUp: 'Create an account', providerAction: provider => `Continue with ${provider}`,
  emailRequired: 'Enter your email address.', emailInvalid: 'Enter an email address like name@example.com.', passwordRequired: 'Enter your password.',
  failed: 'We could not sign you in. Check your details and try again.', providerFailed: 'We could not start that sign-in. Try again or use your email address.', success: 'Signed in.', pending: 'Signing in…',
};
export type SignInPageProps = Pick<AuthShellProps, 'identity' | 'backdrop' | 'variant' | 'level' | 'mainId' | 'className'> & {
  /** Your integration point. Resolve to sign in, reject (or throw) to show the failure message. Nothing is submitted until the user presses Sign in. */
  onSubmit: (values: SignInValues) => void | Promise<void>;
  /** Called once after `onSubmit` or a provider resolves. This is where you redirect; the template never navigates. */
  onSuccess?: () => void;
  providers?: AuthProvider[]; forgotPasswordHref?: string; signUpHref?: string; initialStatus?: SubmissionStatus; labels?: Partial<SignInLabels>; footerExtra?: ReactNode;
};

/**
 * A complete sign-in screen: email and password, optional Google and GitHub buttons you wire, a forgot-password link and a sign-up link.
 * It validates the shape of the email and that a password was entered (it never judges the password's strength), shows pending, failed and success states in text, and never reveals why a sign-in failed: the failure text is fixed.
 * Real authentication, sessions, OAuth and rate limiting are yours; `onSubmit` and each provider's `onSelect` are the integration points. The password starts hidden and is never trimmed.
 */
export function SignInPage({ onSubmit, onSuccess, providers = [], forgotPasswordHref, signUpHref, initialStatus = 'idle', labels, footerExtra, ...shell }: SignInPageProps) {
  const text = { ...defaults, ...labels };
  const id = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [problems, setProblems] = useState<{ email?: string; password?: string }>({});
  const [source, setSource] = useState<'form' | 'provider'>('form');
  const submission = useSubmission(initialStatus);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const pending = submission.status === 'pending';
  const finish = async (action: () => void | Promise<void>, from: 'form' | 'provider') => {
    setSource(from);
    if (await submission.run(action)) onSuccess?.();
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const next = {
      email: emailProblem(email) === 'required' ? text.emailRequired : emailProblem(email) ? text.emailInvalid : undefined,
      password: passwordProblem(password) ? text.passwordRequired : undefined,
    };
    setProblems(next);
    if (next.email) { emailRef.current?.focus(); return; }
    if (next.password) { passwordRef.current?.focus(); return; }
    void finish(() => onSubmit({ email: email.trim(), password }), 'form');
  };
  const notice: AuthNotice | undefined = submission.status === 'failed' ? { tone: 'error', message: source === 'provider' ? text.providerFailed : text.failed }
    : submission.status === 'success' ? { tone: 'success', message: text.success }
    : pending ? { tone: 'info', message: text.pending } : undefined;
  return <AuthShell {...shell} heading={text.heading} description={text.description} notice={notice}
    providers={providers.length > 0 ? <AuthProviderButtons providers={providers} busy={pending} label={text.providerAction} onSelect={provider => void finish(provider.onSelect, 'provider')} /> : undefined}
    footer={<>{signUpHref && <p className={styles.note}>{text.signUpPrompt} <Link href={signUpHref}>{text.signUp}</Link></p>}{footerExtra}</>}>
    <form noValidate className={styles.form} onSubmit={submit} aria-busy={pending || undefined}>
      <TextField id={`${id}-email`} label={text.email} type="email" autoComplete="email" value={email} onChange={setEmail} error={problems.email} readOnly={pending} inputRef={emailRef} />
      <PasswordField id={`${id}-password`} label={text.password} showLabel={text.showPassword} autoComplete="current-password" value={password} onChange={setPassword} error={problems.password} readOnly={pending} inputRef={passwordRef} />
      {forgotPasswordHref && <p className={styles.links}><Link href={forgotPasswordHref}>{text.forgot}</Link></p>}
      <Button type="submit" aria-disabled={pending || undefined}>{pending ? text.submitting : text.submit}</Button>
    </form>
  </AuthShell>;
}
