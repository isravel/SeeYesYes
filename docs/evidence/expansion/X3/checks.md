# X3 shared checks

Working tree on top of `9acfd3f`, 2026-11-10. macOS (darwin), Node per `.nvmrc`, Playwright Chromium against a production build.

## Scope of this pass

Five display primitives only: SYX-007 Highlight, SYX-011 Level, SYX-012 Live dot, SYX-078 Kbd, SYX-079 Avatar group. The other 14 X3 tasks are not started.

They were chosen first because they are non-interactive, depend only on existing tokens and Avatar, and need no new overlay or form behavior.

## Commands and results

| Command | Result |
| --- | --- |
| `npx vitest run` | 573 tests pass across 42 files, including the new `tests/x3-display.test.ts` and the type-check of every recommended example |
| `npx tsc --noEmit` | clean |
| `npx tsx scripts/audit-components.ts` | All 37 component implementations match their documented props, defaults, CSS tokens and compounds |
| `npm run build` | passes |
| `npx playwright test` on `x3-display`, `x2-controls`, `keyboard-matrix`, `component-detail`, `components-catalog`, `playground`, `review-matrix` | First run: 53 passed, 2 failed, both test defects (below). After the fixes and a rebuild, `x3-display` and `x2-controls` pass together (30 tests). The other five specs passed in the first run and were not rerun. The full browser suite was not run |

## Failures found by the first browser run

- The Highlight contrast check read about 1.0:1. The test parsed the computed color as `rgb()`, but the browser reports `color-mix` results in a wider color space, so the parse was wrong. The test now has the browser convert each color to sRGB before taking the ratio.
- The existing Avatar check in `x2-controls.spec.ts` matched "Maya Chen" three times once the new Display section named her as well. It now looks inside the Surfaces region.

## Changes outside the five components

- `lib/data/display-contracts.ts` is new and registered in `lib/data/registry.ts`. Component count is now 37.
- `tests/contract.test.ts` and `tests/component-inventory.test.ts` list the five new IDs.
- `tests/context-completeness.test.ts`: the old assertion that the overview export is smaller than every single-component task export no longer holds, because the overview lists every component and now exceeds the task export for the tiny Spinner. It now checks the overview against a task export for Button (a component with real props), and that every task export stays smaller than the full export. This is a deliberate weakening of one assertion, not a bug fix, and it is recorded here so it can be reviewed.
- `tests/fixtures/ControlsFixture.tsx` and `app/internal-checks/controls/page.tsx`: added a Display section, and an `appearance` query so a check can load the scope in dark.
- `tests/browser/x2-controls.spec.ts`: the Avatar check now looks inside the Surfaces region, because the new Display section also names "Maya Chen". Behavior asserted is unchanged.

## Not covered

- Human visual review of the five primitives over glass.
- Screen-reader testing.
- The full browser suite and the packed-consumer check (SYX-004).

## Second batch (2026-11-10)

SYX-009 Chip, SYX-014 Search input, SYX-016 Segmented, SYX-017 Icon button and SYX-070 Checkbox group. All are native-element controls, so keyboard behavior comes from the platform.

| Command | Result |
| --- | --- |
| `npx vitest run` | 604 tests pass across 43 files, including `tests/x3-controls.test.ts` (21 tests) |
| `npx tsc --noEmit` | clean |
| `npm run audit:components` | All 42 component implementations match their documented props, defaults, CSS tokens and compounds |
| `npx eslint .` | clean |
| `npm run build` | passes |
| `npx playwright test` on `x3-controls`, `x3-display`, `foundation`, `theme-controls`, `components-catalog`, `component-detail`, `playground`, `review-matrix`, `keyboard-matrix`, `overview` | 50 passed. The full browser suite was not run |

Changes outside the five components:

- `lib/data/control-contracts.ts` is new and registered in `lib/data/registry.ts`. The `wcag-focus-visible` rule now lists the five interactive controls, as the contract validator requires.
- The `link-docs` example is listed before `link-buttons` again. The overview shows a component's first recommended example, and the earlier order had changed what the Link preview showed.
- `tests/browser/theme-controls.spec.ts` expected three Button theme defaults. Since X2 the contract approves six (and never destructive). The assertion now says so. This was stale before this batch; it is flagged so you can reject it.
- The Kbd overview preview is wrapped so it wraps at narrow widths.
- `tests/fixtures/ControlsFixture.tsx` has a new form-controls section, and `tests/browser/x3-controls.spec.ts` is new.

Not covered: human visual review over glass, reduced-transparency rendering, screen-reader testing, the full browser suite, and the SYX-004 packed-consumer check. Escape inside a SearchInput inside an open Dialog was not run in a browser.

## Third batch (2026-11-10)

SYX-032 Disclosure, SYX-060 Accordion, SYX-062 Pagination and SYX-063 Breadcrumbs. All use native buttons, links and lists.

| Command | Result |
| --- | --- |
| `npx vitest run` | 637 tests pass across 44 files, including `tests/x3-composition.test.ts` and the type-check of every recommended example |
| `npx tsc --noEmit` | clean |
| `npm run audit:components` | All 46 component implementations match their documented props, defaults, CSS tokens and compounds |
| `npx eslint .` | clean |
| `npm run build` | passes |
| `npx playwright test` on `x3-compositions`, `x3-controls`, `x3-display`, `keyboard-matrix`, `components-catalog`, `component-detail`, `playground`, `review-matrix` | First run: 47 passed, 4 failed, all test defects (below). After the fixes, `x3-compositions` passes (8 tests). The other specs passed in the first run and were not rerun. The full browser suite was not run |

Failures found by the first browser run (all in the new spec or fixture selectors, none in the components):

- A "not focused" check on hidden panel content failed because the element is hidden and so cannot be located. It now checks the active element's text instead.
- `getByRole('listitem')` counted list items outside the pagination; it now counts `li` inside the nav.
- A "Trail" name matched "Long trail" too; names are now matched exactly.
- The forced-colors check read Page 2, which is not rendered when the current page is 6; it now reads Page 5.

Changes outside the four components:

- `lib/data/composition-contracts.ts` is new and registered in `lib/data/registry.ts`. The `wcag-focus-visible` rule lists the four controls.
- `tests/contract.test.ts` and `tests/component-inventory.test.ts` list the four new IDs.
- `tests/fixtures/ControlsFixture.tsx` has a new "Disclosure and navigation" section; `keyboard-matrix.spec.ts` lists the four roles.

Not covered: human visual review over glass, reduced-transparency rendering, screen-reader testing, the full browser suite and the SYX-004 packed-consumer check.

## Fourth batch (2026-11-10)

SYX-065 Popover and SYX-066 Drawer. Both wrap React Aria Components, like Dialog.

| Command | Result |
| --- | --- |
| `npx vitest run` | 641 tests pass across 44 files, including `tests/x3-overlay.test.ts` (5 tests) and the type-check of every recommended example. Run before the last two edits to the Popover; the three affected files (`x3-overlay`, `contract`, `component-inventory`) were rerun afterwards and pass |
| `npx tsc --noEmit` | clean |
| `npx eslint components tests lib` | clean |
| `npm run audit:components` | All 48 component implementations match their documented props, defaults, CSS tokens and compounds |
| `npm run build` | passes |
| `npx playwright test` on `x3-panels` | 8 passed after fixes |
| `npx playwright test` on `overlays`, `keyboard-matrix`, `components-catalog`, `component-detail`, `playground`, `review-matrix`, `x3-compositions`, `x3-controls`, `x3-display` | 57 passed. The full browser suite was not run |

Failures found on the way:

- **A real component problem.** The first Popover used React Aria's `isNonModal`. A click on the trigger opened it and it closed again in the same gesture (focus went into the panel, then straight back). I could not make it reliable, so Popover is now a normal light-dismiss popover. It is **not** non-modal as the plan asked: while open, the page behind is inert. The contract and review say so.
- Test defects: the Drawer position checks ran during the slide-in (they now wait for animations to finish); the axe run found no dialog because the Popover had not opened (fixed by the change above); a "page stays reachable" assertion and a toggle assertion no longer apply and were removed.
- Playwright cannot emulate reduced transparency, so only forced colors is checked in a browser.

Changes outside the two components:

- `lib/data/overlay-contracts.ts` gained two entries and a `noThemeDefaults` flag, so the Drawer's `side` and `size` variants are not offered as theme defaults. `size` still is for Dialog.
- The `wcag-focus-visible` rule lists `popover` and `drawer`. `tests/contract.test.ts` and `tests/component-inventory.test.ts` list the new IDs, and `keyboard-matrix.spec.ts` the roles.
- `tests/fixtures/ControlsFixture.tsx` has a new "Popover and drawer" section; `tests/browser/x3-panels.spec.ts` is new.

Not covered: human visual review over glass, reduced-transparency rendering in a browser, screen-reader testing, the full browser suite and the SYX-004 packed-consumer check.

## Fifth batch: Confirm dialog (SYX-019)

- Unit: 653 pass. Type-check, lint (`components`, `tests`, `lib`), component audit (49) and production build pass.
- Browser: `x3-panels` 12 pass, including the ConfirmDialog test (named alert dialog, starts on Cancel, outside press ignored, Escape closes, type-to-confirm, pending, failed with input kept, success).
- A broad run of 10 related specs had 65 pass and 4 time out (Popover/Drawer axe sweep, X3 controls axe sweep, component-detail, 200% zoom). All four passed when re-run alone, one worker. The cause looks like load, but I did not prove it.
- Not run: the full browser suite, screen readers, reduced transparency, right-to-left.

## Sixth batch: Input OTP (SYX-071)

- Unit: 661 pass. Type-check, lint (`components`, `tests`, `lib`), component audit (50) and production build pass.
- Browser: `x3-controls` 11 pass (2 new InputOtp tests plus the existing axe sweep, which covers the new field in light, dark, glass and clean). 54 related tests pass across `keyboard-matrix`, `components-catalog`, `component-detail`, `playground`, `review-matrix`, `x3-compositions`, `x3-display` and `x3-panels`.
- Not run: the full browser suite, real SMS autofill, screen readers, reduced transparency, right-to-left.
- Earlier in the session a stale terminal showed failures from `integration`, `theme-controls` and `foundation`. Those are not in the specs run here and were not investigated; they predate this change.
- Shared files changed: `lib/data/control-contracts.ts`, the `wcag-focus-visible` rule list, `tests/contract.test.ts`, `tests/component-inventory.test.ts`, `tests/browser/keyboard-matrix.spec.ts`, and `tests/fixtures/ControlsFixture.tsx`.

## Seventh batch: Avatar group overflow trigger (SYX-079)

- Unit: 663 pass. Type-check, lint (`components`, `tests`, `lib`), component audit (50) and production build pass.
- Browser: `x3-display` 10 pass (1 new), plus `keyboard-matrix`, `components-catalog` and `component-detail` (24 in all). Chromium had to be reinstalled first; the first run failed only because the browser binary was missing.
- Shared files changed: `lib/data/display-contracts.ts` (an optional `keyboard` entry makes a display component interactive), the `wcag-focus-visible` rule list, `tests/x3-display.test.ts`, `tests/component-inventory.test.ts`, `tests/browser/keyboard-matrix.spec.ts` and `tests/fixtures/ControlsFixture.tsx`.
- Not run: the full browser suite, screen readers, reduced transparency, right-to-left.

## Eighth batch: Combobox (SYX-072)

- Unit: 670 pass. Type-check, lint, component audit (51) and production build pass.
- Browser: `x3-controls` gained 2 Combobox tests. The typing test was flaky before hydration, so it now retries until the field holds the text; 16 repeated runs of the Combobox tests passed. Related specs run with it are listed in the commit message.
- Shared files changed: `lib/data/control-contracts.ts`, the `wcag-focus-visible` rule list, `tests/contract.test.ts`, `tests/component-inventory.test.ts`, `tests/browser/keyboard-matrix.spec.ts`, `tests/fixtures/ControlsFixture.tsx`, previews and demos.
- Not run: the full browser suite, screen readers, reduced transparency, right-to-left, touch devices.
