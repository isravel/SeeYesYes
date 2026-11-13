# SYX-056 Sign in page review

Status: automated evidence only. No human visual review, no packed-consumer run.

`SignInPage` (`components/templates/sign-in-page.tsx`) is email and password entry on the auth shell, with optional Google and GitHub buttons, a forgot-password link and a sign-up link.

- **Validation:** the email must have a plausible shape; the password must only be non-empty. The page never judges password strength, so an older, shorter password still works. The first problem takes focus. Surrounding spaces are removed from the email; the password is never trimmed.
- **States:** pending, failed and success are shown as text. While pending, the submit button and providers use `aria-disabled` so focus is not lost, and a second press does nothing.
- **A failed sign-in never says why.** The failure text is fixed, and the rejection itself is never read or shown, so a backend message cannot leak account details.
- **Nothing runs on its own.** `onSubmit` and each provider's `onSelect` are the integration points; `onSuccess` is where the consumer redirects. The template never navigates and sends nothing.
- **Optional parts:** providers appear only when supplied, once each, and the links only when an address is given.

## Evidence

- Unit (`tests/x7-templates.test.ts`): the auth rules in `lib/utils/auth.ts`; the fields, hidden password and single submit; providers and links only when supplied; fixed failure text; replaceable labels.
- Browser (`tests/browser/x7-templates.spec.ts`): empty and invalid email show their messages and focus the field; a rejected sign-in shows the fixed message and keeps the typed email; the password starts hidden, can be shown, and is not found in local or session storage.

## Not covered

- Real authentication, sessions, OAuth and rate limiting. These belong to the consumer's backend.
- Password-manager behaviour in real browsers; only the `autocomplete` values are set.
- Human visual review and screen readers.
