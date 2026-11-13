# SYX-058 Forgot password page review

Status: automated evidence only. No human visual review, no packed-consumer run.

`ForgotPasswordPage` (`components/templates/forgot-password-page.tsx`) is a reset-request screen and a neutral check-inbox screen.

- **Never reveals whether an address is registered.** After a request is accepted the screen always says "if there is an account", and it is the same screen for every address. `onSubmit` should itself respond the same for known and unknown addresses.
- **A request that could not be made** shows a fixed retry message with no account details; the rejection is never read.
- **The inbox screen** offers Send again and a way back to change the address. Focus moves to its heading when it appears, so the change is announced. Changing the address returns focus to the email field.
- **Validation:** one email field, shape-checked, with the problem focused.
- The sign-in link appears only when an address is supplied.

## Evidence

- Unit (`tests/x7-templates.test.ts`): the request screen, the link only when supplied, and an inbox screen with no wording that confirms or denies an account.
- Browser (`tests/browser/x7-templates.spec.ts`): a request leads to the inbox screen with its heading focused and the neutral sentence; Use a different email address returns focus to the field.

## Not covered

- Sending the email, token handling and rate limiting, which the consumer's backend owns.
- Whether the consumer's backend answers in the same time for known and unknown addresses; timing can still reveal an account.
- Human visual review and screen readers.
