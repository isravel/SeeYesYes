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
