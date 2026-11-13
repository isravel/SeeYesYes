'use client';
import { GithubLogo, GoogleLogo } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export type AuthProviderId = 'google' | 'github';
/** One provider button. `onSelect` is where your integration starts its own sign-in flow; nothing here talks to a provider. */
export type AuthProvider = { id: AuthProviderId; onSelect: () => void | Promise<void> };
const names: Record<AuthProviderId, string> = { google: 'Google', github: 'GitHub' };
const icons = { google: <GoogleLogo aria-hidden="true" />, github: <GithubLogo aria-hidden="true" /> };

/** Only the providers supplied are shown, in the order supplied, each once. While busy a press does nothing and the button says so with `aria-disabled`, so focus is not lost. */
export function AuthProviderButtons({ providers, busy, onSelect, label }: { providers: AuthProvider[]; busy: boolean; onSelect: (provider: AuthProvider) => void; label: (provider: string) => string }) {
  const seen = new Set<AuthProviderId>();
  const unique = providers.filter(provider => Object.hasOwn(names, provider.id) && !seen.has(provider.id) && Boolean(seen.add(provider.id)));
  return <>{unique.map(provider => <Button key={provider.id} variant="outline" aria-disabled={busy || undefined} onClick={() => { if (!busy) onSelect(provider); }}>{icons[provider.id]}{label(names[provider.id])}</Button>)}</>;
}
