'use client';
import { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { effectiveMinimum, emailProblem, nameProblem, passwordProblem } from '@/lib/utils/auth';
import { AuthShell, type AuthNotice, type AuthShellProps } from './auth-shell';
import { AuthProviderButtons, type AuthProvider } from './auth-providers';
import { PasswordField, TextField } from './auth-fields';
import { useSubmission, type SubmissionStatus } from './use-submission';
import styles from './AuthForm.module.css';

export type SignUpValues = { name: string; email: string; password: string };
export type SignUpLabels = {
  heading: string; description: string; name: string; email: string; password: string; showPassword: string; submit: string; submitting: string; signInPrompt: string; signIn: string;
  providerAction: (provider: string) => string; nameRequired: string; emailRequired: string; emailInvalid: string; passwordRequired: string; passwordShort: (minimum: number) => string; passwordHelp: (minimum: number) => string;
  termsLead: string; terms: string; and: string; privacy: string; failed: string; providerFailed: string; success: string; pending: string;
};
const defaults: SignUpLabels = {
  heading: 'Create your account', description: 'Start with your name and email address.', name: 'Name', email: 'Email address', password: 'Password', showPassword: 'Show password', submit: 'Create account', submitting: 'Creating account…',
  signInPrompt: 'Already have an account?', signIn: 'Sign in', providerAction: provider => `Sign up with ${provider}`,
  nameRequired: 'Enter your name.', emailRequired: 'Enter your email address.', emailInvalid: 'Enter an email address like name@example.com.', passwordRequired: 'Choose a password.',
  passwordShort: minimum => `Use at least ${minimum} characters.`, passwordHelp: minimum => `At least ${minimum} characters.`,
  termsLead: 'By creating an account you agree to the', terms: 'Terms', and: 'and', privacy: 'Privacy policy',
  failed: 'We could not create your account. Check your details and try again.', providerFailed: 'We could not start that sign-up. Try again or use your email address.', success: 'Account created.', pending: 'Creating your account…',
};
export type SignUpPageProps = Pick<AuthShellProps, 'identity' | 'backdrop' | 'variant' | 'level' | 'mainId' | 'className'> & {
  /** Your integration point. Resolve to create the account, reject (or throw) to show the failure message. Nothing is sent until the user presses Create account. */
  onSubmit: (values: SignUpValues) => void | Promise<void>;
  /** Called once after `onSubmit` or a provider resolves. This is where you redirect; the template never navigates. */
  onSuccess?: () => void;
  providers?: AuthProvider[]; signInHref?: string; termsHref?: string; privacyHref?: string;
  /** A stronger minimum than the baseline of 8 characters. A smaller value is ignored. Enforce your real policy on the server too. */
  minPasswordLength?: number; initialStatus?: SubmissionStatus; labels?: Partial<SignUpLabels>;
};

/**
 * A complete sign-up screen: name, email and password, optional Google and GitHub buttons you wire, a sign-in link and optional terms and privacy links.
 * The password has a baseline minimum of 8 characters, counted in characters, which `minPasswordLength` can only raise. That is a convenience check in the browser, not your security policy.
 * Account creation, email verification, OAuth and duplicate-account handling are yours; the failure text is fixed so it never says whether an address is already registered.
 */
export function SignUpPage({ onSubmit, onSuccess, providers = [], signInHref, termsHref, privacyHref, minPasswordLength, initialStatus = 'idle', labels, ...shell }: SignUpPageProps) {
  const text = { ...defaults, ...labels };
  const minimum = effectiveMinimum(minPasswordLength);
  const id = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [problems, setProblems] = useState<{ name?: string; email?: string; password?: string }>({});
  const [source, setSource] = useState<'form' | 'provider'>('form');
  const submission = useSubmission(initialStatus);
  const nameRef = useRef<HTMLInputElement>(null);
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
    const passwordIssue = passwordProblem(password, minimum);
    const next = {
      name: nameProblem(name) ? text.nameRequired : undefined,
      email: emailProblem(email) === 'required' ? text.emailRequired : emailProblem(email) ? text.emailInvalid : undefined,
      password: passwordIssue === 'required' ? text.passwordRequired : passwordIssue ? text.passwordShort(minimum) : undefined,
    };
    setProblems(next);
    const first = (['name', 'email', 'password'] as const).find(key => next[key]);
    if (first) { ({ name: nameRef, email: emailRef, password: passwordRef })[first].current?.focus(); return; }
    void finish(() => onSubmit({ name: name.trim(), email: email.trim(), password }), 'form');
  };
  const notice: AuthNotice | undefined = submission.status === 'failed' ? { tone: 'error', message: source === 'provider' ? text.providerFailed : text.failed }
    : submission.status === 'success' ? { tone: 'success', message: text.success }
    : pending ? { tone: 'info', message: text.pending } : undefined;
  const legal = termsHref || privacyHref;
  return <AuthShell {...shell} heading={text.heading} description={text.description} notice={notice}
    providers={providers.length > 0 ? <AuthProviderButtons providers={providers} busy={pending} label={text.providerAction} onSelect={provider => void finish(provider.onSelect, 'provider')} /> : undefined}
    footer={signInHref ? <p className={styles.note}>{text.signInPrompt} <Link href={signInHref}>{text.signIn}</Link></p> : undefined}>
    <form noValidate className={styles.form} onSubmit={submit} aria-busy={pending || undefined}>
      <TextField id={`${id}-name`} label={text.name} autoComplete="name" value={name} onChange={setName} error={problems.name} readOnly={pending} inputRef={nameRef} />
      <TextField id={`${id}-email`} label={text.email} type="email" autoComplete="email" value={email} onChange={setEmail} error={problems.email} readOnly={pending} inputRef={emailRef} />
      <PasswordField id={`${id}-password`} label={text.password} showLabel={text.showPassword} autoComplete="new-password" value={password} onChange={setPassword} error={problems.password} helpText={text.passwordHelp(minimum)} readOnly={pending} inputRef={passwordRef} />
      {legal && <p className={styles.note}>{text.termsLead}{termsHref && <> <Link href={termsHref}>{text.terms}</Link></>}{termsHref && privacyHref && <> {text.and}</>}{privacyHref && <> <Link href={privacyHref}>{text.privacy}</Link></>}.</p>}
      <Button type="submit" aria-disabled={pending || undefined}>{pending ? text.submitting : text.submit}</Button>
    </form>
  </AuthShell>;
}
