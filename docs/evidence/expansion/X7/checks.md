# X7 shared checks

Working tree on top of `6ec9c95`, 2026-11-13. macOS (darwin), Playwright Chromium against a production build.

SYX-051 to SYX-058: PageShell, LandingPage, ListingPage, EventsPage, AuthShell, SignInPage, SignUpPage and ForgotPasswordPage, plus the shared `auth-fields`, `auth-providers` and `use-submission` helpers in `components/templates/`. No new dependency.

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run lint` | clean |
| `npx tsx scripts/audit-components.ts` | All 81 component implementations match their documented props, literal defaults, direct CSS tokens and styled compounds |
| `npx vitest run` | 892 pass across 51 files, including `tests/x7-templates.test.ts` |
| `npm run build` | passes |
| `npm run export:artifact` | exports 204 modules and 82 controls; the artifact includes the templates |
| `npx playwright test` on `x7-templates` | 9 pass |
| `npx playwright test` on `x7-templates`, `layouts`, `keyboard-matrix`, `component-detail`, `console` | 27 pass (9 `x7-templates` plus 18 related), against the build made after the last source edit |

The full browser suite was not run.

## Changes outside the new files

- **Layouts:** the layouts screen and registry now hold 15 entries: the seven original compositions and the eight templates. The registry adapter test and the layouts unit test were updated from 7 to 15, and the `llms.txt` line that said "Seven demo compositions" now describes the templates too.
- **X6 parts:** two small additive changes so the templates can compose them. `ListingHead` accepts an h1 level, and `CardGrid` accepts a two-column arrangement. Existing defaults are unchanged.
- **`lib/utils/listing.ts`:** gained `queryListing`, a pure search, filter, sort and page function.
- **`lib/utils/auth.ts`:** new, with the email, name and password rules.
- **Artifact:** `scripts/export-artifact.ts` now exports `components/templates/` beside the controls.

## Not covered

- The milestone gate's check of the glass look over the shared backdrop, and its fallback (opaque, no blur, reduced transparency), by a person.
- The packed-consumer run through public exports only. The artifact exports the templates, but no consumer project was installed from it.
- Screen readers, real password managers and touch devices.
- Real account creation, OAuth, email delivery and account-enumeration protection. These belong to the consumer's backend and are stated at each integration point.
- The full browser suite.
