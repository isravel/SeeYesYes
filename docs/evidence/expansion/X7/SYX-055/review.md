# SYX-055 Auth shell review

Status: automated evidence only. No human visual review, no packed-consumer run.

`AuthShell` (`components/templates/auth-shell.tsx`) is a centered auth panel on the shared `Backdrop`. The panel is a `Card`, so the glass surface, its edge and the opaque fallbacks are the theme's own.

- **Slots only:** `identity`, a heading, a `description`, an optional `notice`, supplied `providers`, the form as `children`, and a `footer`.
- **Notice:** an error is announced at once; information and success are announced politely. It is rendered with the existing `Alert`.
- **Providers** are shown only when supplied, in a labelled group. The divider appears only when a form follows.
- **Landmarks:** `variant="page"` makes the panel the page's one `main`; `contained` leaves landmarks to the host page.
- **Heading focus:** the heading is focusable but not in the Tab order, so a page can move focus to it with `headingRef` when the screen changes.
- **Shared fields** (`auth-fields.tsx`): labelled text and password fields; the password starts hidden and can be shown with a named button.

## Evidence

- Unit (`tests/x7-templates.test.ts`): one `main` and an h1 by default; contained has no `main` and follows `level`; notice shown when supplied; divider only with a form.
- Browser: the `auth-shell` preview is covered by `layouts.spec.ts` (theme scope, 320px, axe) and the 320px check in `x7-templates.spec.ts`.

## Not covered

- Human visual review of the glass panel over the backdrop, reduced-transparency rendering and screen readers.
- Real provider buttons: the shell only places buttons the consumer supplies.
