# M2.1 scales and theme scopes

Reviewed 2026-10-08. M2.1 complete. The M2 completion gate remains open.

## What changed

The registry now has 57 token definitions, including named spacing steps, density-aware stack/section/row dimensions, label/caption/heading/title/display typography, a panel radius, and separate surface/raised shadows. Global `:root` defaults still come from the token resolver. Workspace styling now uses more of these shared variables.

`components/theme/ThemeScope.tsx` connects the pure resolver to React. The workspace adds no wrapper: it sets variables and appearance on `<html>` after hydration. Nested scopes set variables, foreground/background, typography, and color scheme on their own roots. A system-mode preview waits until the OS mode is known. No browser storage is read here.

Button, Link, and Spinner read defaults from their nearest scope. Explicit variant/size props win. Unscoped components use a small generated map of contract defaults and allowed prop types, so fallback values do not require a separate registry fixture.

React Aria's portal provider uses the nested scope root for preview overlays. The workspace uses `<body>`, which inherits the themed `<html>` root and keeps overlay markup inside the document body. Caller CSS owns placement and outer spacing; component CSS owns internal geometry and semantic appearance.

## Evidence

- [Check log](checks.txt): type checking, lint, 86 focused tests, and production build pass.
- [Browser log](browser.txt): all six production browser checks pass. They cover native activation and core axe checks; no workspace variables in server markup; OS mode changes after hydration; nearest-scope defaults; explicit prop precedence; local density changes and unmount; and a React Aria modal portal inside the inner scope with the correct tokens/defaults and Escape dismissal.
- Reviewed [light mobile](light-320.png), [light desktop](light-1280.png), [dark mobile](dark-320.png), and [dark desktop](dark-1280.png). No page-level overflow at the checked widths.
- Node scale tests exercise all 27 density/radius/type-scale combinations, typography roles, clean/depth surface shadows, disabled shadows, and zero motion. Server-rendering tests cover generated fallbacks, workspace markup, known nested settings, and deferred system previews.

The portal probe is a test fixture, not the completed SeeYesYes Dialog wrapper. Its route is enabled only by `SEEYESYES_TEST_ROUTES=1` in the test server. Normal preview returns 404 there. Full keyboard/focus checks remain in M2.4 and M2.8. Theme persistence, early bootstrap, and Apply behavior remain in M3. Human accessibility review stays open.

## Decisions and next task

Resolver version is now 1.1 because token output expanded and shadow behavior was corrected: clean surfaces stay flat while raised overlays retain their selected shadow scale. No scope or acceptance requirements changed. CSS Modules and the existing structure/appearance ownership rules remain the styling pattern.

Next: M2.2, one primitive at a time, starting with Button, Link, and Spinner, then Card and feedback primitives. Use GPT-6 Luna at Medium now that the shared logic is ready. Return to GPT-6.1 Sol at Medium for M2.4 overlay/focus behavior, M2.6 contract review, and the M2 completion gate.

Relevant specs: `docs/specs/05-visual-system-and-components.md` (shared API, inventory, and style ownership); `docs/specs/03-design-system-contract.md` (contracts, theme defaults, examples, compound variants); `docs/specs/06-quality-and-acceptance.md` (A12–A14).
