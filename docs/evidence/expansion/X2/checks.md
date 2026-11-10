# X2 — Shared checks

Date: 2026-11-10. Revision: `9acfd3f` plus uncommitted working tree. Environment: macOS, Node 25.6.1 (`.nvmrc` pins the project version), Chromium via Playwright, `next build` then `next start` on port 3108 with `SEEYESYES_TEST_ROUTES=1`.

## Commands and results

| Command | Result |
| --- | --- |
| `npx vitest run` | 41 files, 542 tests passed (486 before the X2 pass; 53 new in `tests/x2-controls.test.ts`; 3 added with the SYX-021 menu work) |
| `npx tsc --noEmit` | exit 0 |
| `npx eslint .` | exit 0 |
| `npx tsx scripts/audit-components.ts` | All 32 component implementations match their documented props, literal defaults, CSS tokens and compounds |
| `npm run build` | exit 0 |
| `npx playwright test tests/browser/x2-controls.spec.ts tests/browser/keyboard-matrix.spec.ts tests/browser/component-detail.spec.ts tests/browser/review-matrix.spec.ts tests/browser/overlays.spec.ts tests/browser/glass-theme.spec.ts` | 43 passed; rerun after SYX-021 with `playground.spec.ts` added: 55 passed |

The full browser suite was not run.

## What was added in this pass

- `tests/x2-controls.test.ts`: server-render checks for every X2 component's variants, defaults, boundary values and state attributes, plus the auto-grow height rules and contract checks.
- `tests/fixtures/ControlsFixture.tsx` and `app/internal-checks/controls/page.tsx`: one scoped page holding every X2 control, available only with `SEEYESYES_TEST_ROUTES=1` (same gate as the other internal checks). `?surface=clean` renders the same page without glass.
- `tests/browser/x2-controls.spec.ts`: 15 browser tests on that page (real focus, hover, press, keyboard, computed glass styles, axe, 320px overflow).
- `Fieldset` registered as its own contract (`fieldset`) with an example, preview and playground demo. It was an implemented component with no contract, so the catalog, AI context and the keyboard matrix did not know it. Component count is now 32.
- `Avatar` fix found by a browser test: an image that fails before hydration never showed the initials, because React was not yet listening for the error event. The component now checks for a finished load with no pixels after mount.

## Not covered by any check

- Human visual review of glass over a real backdrop in light and dark. It waits on the SYX-001 gate.
- `prefers-reduced-transparency`: the CSS fallback exists for Card, Dialog, menu, tooltip and drawer, but Playwright cannot emulate that media feature, so it is only inspected, not run. Forced colors is run for Dialog.
- Blur performance on slow devices.
- Screen-reader output. Names, roles and descriptions are checked through the accessibility tree only.
- A packed consumer install (SYX-004).
