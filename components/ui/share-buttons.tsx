'use client';
import { useState, useSyncExternalStore, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { LinkSimple, LinkedinLogo, WhatsappLogo, XLogo } from '@phosphor-icons/react';
import { useComponentDefaults } from '@/components/theme/ThemeScope';
import { resolveShareUrl, shareHref, shareNetworks, type ShareNetwork } from '@/lib/utils/share';
import { Button } from './button';
import buttonStyles from './Button.module.css';
import styles from './ShareButtons.module.css';
export type ShareButtonsSize = 'small' | 'medium' | 'large';
export type ShareButtonsProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'title' | 'aria-label' | 'aria-labelledby'> & {
  url: string; title?: string; label?: string; networks?: ShareNetwork[]; copyLink?: boolean; attribution?: boolean; size?: ShareButtonsSize;
  copiedMessage?: string; copyFailedMessage?: string; ref?: Ref<HTMLDivElement>;
};
const networks: Record<ShareNetwork, { name: string; icon: ReactNode }> = {
  linkedin: { name: 'LinkedIn', icon: <LinkedinLogo aria-hidden="true" /> },
  x: { name: 'X', icon: <XLogo aria-hidden="true" /> },
  whatsapp: { name: 'WhatsApp', icon: <WhatsappLogo aria-hidden="true" /> },
};
const noSubscription = () => () => undefined;
const currentPage = () => window.location.href;
const serverPage = () => '';
/**
 * Share actions for one address you supply: links to LinkedIn, X and WhatsApp, and a Copy link button. Nothing is shared until someone presses a control.
 * The shared address keeps the query parameters and hash you gave it and adds `via=share` (turn it off with `attribution`). Everything placed in a share link is percent-encoded.
 * Each link opens in a new tab and says so. If `url` is not a web address, the controls render disabled with a note, rather than sharing a broken link. Copy failures are reported in text, not only by color.
 */
export function ShareButtons({ url, title, label = 'Share', networks: chosen = shareNetworks, copyLink = true, attribution = true, size, copiedMessage = 'Link copied.', copyFailedMessage = 'Could not copy the link. Select the address and copy it by hand.', className = '', ref, ...props }: ShareButtonsProps) {
  const defaults = useComponentDefaults('share-buttons');
  const [message, setMessage] = useState('');
  // A relative address needs the current page to resolve; that is known only in the browser, so the server render treats it as unresolved.
  const page = useSyncExternalStore(noSubscription, currentPage, serverPage);
  const shareUrl = resolveShareUrl(url, { base: page || undefined, attribution });
  const resolvedSize = size ?? defaults.size;
  async function copy() {
    try {
      if (!shareUrl || !navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(shareUrl);
      setMessage(copiedMessage);
    } catch {
      setMessage(copyFailedMessage);
    }
  }
  return <div {...props} ref={ref} role="group" aria-label={label} className={`${styles.root} ${className}`}>
    {[...new Set(chosen)].filter(network => network in networks).map(network => {
      const { name, icon } = networks[network];
      return shareUrl
        ? <a key={network} href={shareHref(network, shareUrl, title)} target="_blank" rel="noopener noreferrer" className={buttonStyles.root} data-variant="secondary" data-size={resolvedSize}>{icon}{name}<span className={styles.visuallyHidden}> (share, opens in a new tab)</span></a>
        : <Button key={network} variant="secondary" size={resolvedSize} disabled>{icon}{name}</Button>;
    })}
    {copyLink && <Button variant="secondary" size={resolvedSize} disabled={!shareUrl} onClick={copy}><LinkSimple aria-hidden="true" />Copy link</Button>}
    {!shareUrl && <span className={styles.note}>Sharing is unavailable: the address is not a valid web link.</span>}
    <span className={styles.status} role="status">{message}</span>
  </div>;
}
