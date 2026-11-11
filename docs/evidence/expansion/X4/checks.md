# X4 shared checks

Working tree on top of `bcaba65`, 2026-11-11. macOS (darwin), Node 25.6.1 (the repository asks for 22 or newer), Playwright 1.64.0 Chromium against a production build.

## First batch: AnimatedBadge, MenuToggle, ShinyText, RotatingWord

SYX-025, 027, 028 and 034. These four need no new dependency, so the dependency-reason gate does not apply yet.

| Command | Result |
| --- | --- |
| `npm run typecheck` | clean (56 components, 65 examples) |
| `npx eslint components lib tests` | clean |
| `npm run audit:components` | All 56 component implementations match their documented props, defaults, CSS tokens and compounds |
| `npx vitest run` | 698 pass across 48 files, including `tests/x4-effects.test.ts` and the type-check of every recommended example |
| `npm run build` | passes |
| `npx playwright test` on `x4-effects`, `x3-display`, `keyboard-matrix`, `component-detail`, `components-catalog`, `playground`, `review-matrix`, `console` | 44 pass. The full browser suite was not run |

## Failures found on the way

- ShinyText forced-colors check expected the text fill to equal `color`. Chrome reports the fill as the author colour and `color` as the system colour, so the check now asserts the fill is not transparent and the text is intact. This was a test defect, not a component problem.
- A first browser run failed to start because an earlier `next start` still held port 3108. It was stopped and the run repeated.

## Shared files changed

`lib/data/effect-contracts.ts` (new), `lib/data/registry.ts` (registration and the focus rule list), generated files, previews and demos, `tests/contract.test.ts`, `tests/component-inventory.test.ts`, `tests/browser/keyboard-matrix.spec.ts`, `tests/fixtures/ControlsFixture.tsx` (new "Effects" section), and the regenerated component review matrix.

## Not covered

Human visual review over glass, reduced-transparency rendering, screen readers, the full browser suite, the SYX-004 packed-consumer check, and touch devices.

## Remaining X4

SYX-026 Logo, 029 Fancy arrow, 030 Tilt card, 031 Card swap, 033 Media frame and 044 Carousel. Carousel needs an evaluation of the platform and installed tools before any dependency is chosen.
