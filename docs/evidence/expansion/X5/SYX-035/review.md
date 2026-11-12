# SYX-035 ShareButtons review

Status: automated evidence only. No human visual review, screen-reader test, real share-target check or reduced-transparency check.

`ShareButtons` (`components/ui/share-buttons.tsx`, helpers in `lib/utils/share.ts`) is a named group of LinkedIn, X and WhatsApp links and a Copy link button, all for one address the caller supplies.

- **Address.** `resolveShareUrl` keeps existing query parameters and the hash and adds `via=share`. An existing `via` is replaced, because it names where a visit came from. `attribution={false}` shares the address unchanged. A relative address resolves against the current page in the browser (it is unresolved during the server render, so the controls show disabled until hydration finishes only for relative addresses). Only `http` and `https` are shareable; `javascript:`, `mailto:`, `data:`, `file:` and `ftp:` are refused.
- **Encoding.** Every value placed in a share link goes through `encodeURIComponent`. Tests parse the produced links and check the address and caption come back whole, including `&`, `#`, `%`, spaces and Devanagari text, and that no link gains a fragment.
- **Links, not scripts.** Each network is a native link with `target="_blank"` and `rel="noopener noreferrer"`; its name ends with "(share, opens in a new tab)". Nothing opens or copies before a press (a test watches for popups on load).
- **Copy link** is a native button. Success and failure are written to a `role="status"` region as text. Failure covers a rejected write and a missing clipboard.
- **Unavailable.** An address that is not a web link renders every control disabled with "Sharing is unavailable". No link to a broken or unsafe address is produced.
- **Size.** `size` (small, medium, large) is the only variant; medium is the default. Links reuse Button's stylesheet, so they share its focus ring and 44px minimum target.

## Evidence

- Unit: address resolution (kept parameters and hash, via replaced, no attribution, relative with and without base, six refused schemes), encoding per network, empty caption, group and link markup, chosen and de-duplicated networks, unavailable state, size.
- Browser (`tests/browser/x5-sections.spec.ts`, production build): hrefs parsed per network; relative address resolved against the page; clipboard write read back; both failure paths; no popup and all controls disabled for `mailto:`; target heights and `data-size`; tab order and focus rings; axe in light, dark, glass and clean; 320px.

## Not covered

Real LinkedIn, X and WhatsApp pages (their parameters are third-party and can change), screen-reader reading of the status, and mobile share sheets. The share URL formats were written from the networks' public intent URLs and were not fetched during this work.
