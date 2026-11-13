# SYX-057 Sign up page review

Status: automated evidence only. No human visual review, no packed-consumer run.

`SignUpPage` (`components/templates/sign-up-page.tsx`) asks for name, email and a new password on the auth shell, with optional provider buttons, a sign-in link and terms and privacy links.

- **Baseline minimum of eight characters,** counted in characters rather than UTF-16 units. `minPasswordLength` can only raise it; a lower or invalid value falls back to the baseline. The minimum is stated in the field's hint.
- **This is a convenience check in the browser, not a security policy.** The consumer enforces the real policy on the server.
- **Password:** starts hidden, is never trimmed, and uses `autocomplete="new-password"`.
- **Validation order:** name, email, then password; the first problem takes focus.
- **States:** pending, failed and success are text; a failure never gives a reason.
- **Terms and privacy links** appear only when addresses are supplied.

## Evidence

- Unit (`tests/x7-templates.test.ts`): character counting, stronger and weaker minimums, autocomplete values, the stated minimum, and links only when supplied.
- Browser (`tests/browser/x7-templates.spec.ts`): a short password shows the minimum-length message and focuses the password field.

## Not covered

- Account creation, email verification, duplicate-account handling and server-side password policy, all the consumer's.
- Human visual review and screen readers.
