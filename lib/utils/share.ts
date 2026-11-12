/** The networks ShareButtons can link to. Copy link is a separate action, not a network. */
export type ShareNetwork = 'linkedin' | 'x' | 'whatsapp';
export const shareNetworks: ShareNetwork[] = ['linkedin', 'x', 'whatsapp'];

/**
 * The address people will open after a share: the caller's URL with its existing query parameters and hash kept, plus `via=share` when `attribution` is on.
 * Only http and https addresses are shareable. A relative URL is resolved against `base`; with no base, or for anything that is not a web address, this returns null.
 * An existing `via` parameter is replaced, because `via` names where a visit came from. Query parameters come back re-encoded in standard form.
 */
export function resolveShareUrl(url: string, options: { base?: string; attribution?: boolean } = {}): string | null {
  const { base, attribution = true } = options;
  let parsed: URL;
  try { parsed = new URL(url, base); } catch { return null; }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (attribution) parsed.searchParams.set('via', 'share');
  return parsed.toString();
}

/** The share-intent address for a network. Every value placed in a query string is percent-encoded, so `&`, `#`, spaces and non-Latin text survive. */
export function shareHref(network: ShareNetwork, shareUrl: string, text?: string): string {
  const url = encodeURIComponent(shareUrl);
  const caption = text?.trim();
  switch (network) {
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case 'x': return `https://x.com/intent/post?url=${url}${caption ? `&text=${encodeURIComponent(caption)}` : ''}`;
    case 'whatsapp': return `https://wa.me/?text=${encodeURIComponent(caption ? `${caption} ${shareUrl}` : shareUrl)}`;
  }
}
