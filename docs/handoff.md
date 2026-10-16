# SeeYesYes handoff

Status as of 2026-10-16. The [final gate review](evidence/M7/gate.md) passes the automated checks. Phase 1 remains open for the human checks listed under [Open work](#open-work).

## Setup and checks

Use Node.js 24 LTS and npm (the repository has an `.nvmrc`). The final check, browser suite, performance procedure, and app port smoke checks passed on Node 24.22.0 using an isolated temporary runtime. The earlier fresh-clone walkthrough ran on Node 25.6.1.

```sh
npm ci                              # install the locked dependencies
npm run dev                         # local app at http://localhost:8088
npm run check                       # generate + type-check, component audit, lint, unit tests, production build
npx playwright install chromium     # once
npm run test:browser                # browser tests against a production build (port 3108)
npm run perf                        # Lighthouse mobile procedure (needs a production build first)
npm run report:sizes                # export size comparison
```

A fresh-clone run of the setup commands passed (see `docs/evidence/M6/M6.7/walkthrough.log`). Current results: 459 unit tests in 35 files and 165 browser tests in 33 files, all passing; lint clean. The [final gate logs](evidence/M7/gate.md#verification) record the current working tree. Both `npm run dev` and `npm start` serve port 8088; browser tests use 3108 and performance checks use 3160.

## Architecture

- **One registry** (`lib/data/registry.ts` and its contract modules) holds tokens, component contracts, rules, examples, layouts, fonts, theme presets, and project guidance as typed data, validated by zod schemas (`lib/contract/schema.ts`, `validate.ts`). Everything else is derived from it: resolved tokens (`lib/theme/resolve.ts`), context exports (`lib/contract/context.ts`, `serialize.ts`), the design-token files (`design-tokens.ts`), generated defaults and public-import checks (`scripts/generate.ts`), agent files (`agent-files.ts`), and the documentation reference.
- **Pure, Node-testable core.** Context, closure, token resolution, serialization, readiness, coverage, contrast, and the exporters have no React or browser dependencies, so a later MCP server can reuse them.
- **Theme runtime.** Three Zustand stores hold default, applied, and draft theme state, plus a session-only Playground store (`lib/theme/stores.ts`, `playground.ts`). Saves go through one writer that takes a Web Lock, rejects stale drafts, and syncs tabs from `storage` events (`writer.ts`). An inline script restores a validated cache before first paint (`persistence.ts`). Small runtime checks in `lib/theme/check.ts` keep zod off the shared first-load path; tests compare their accepted values with the schemas. `ThemeScope` provides variables, component defaults, and the overlay container to the workspace and to nested previews. Pages receive only a slim theme system, not the whole registry.
- **Components** (`components/ui`) are native-first, token-driven CSS Modules; Dialog, Dropdown Menu, Tabs, and Tooltip wrap React Aria Components. Each component's contract lives in the registry, and `npm run audit:components` compares CSS, tokens, states, and compound variants with it.
- **Screens** are Next.js App Router pages under `app/`. Data-driven views (Tokens, Components, Component Detail, Rules, Layouts, Validation, Accessibility, AI Context, the Overview's demo health) load through typed adapters with TanStack Query and show loading, error with Retry, and empty states. A shared workspace shell wraps every screen.
- **Documentation** is Markdown in `content/docs`, rendered by one pipeline that also feeds search, Copy for LLM, and `/llms-full.txt`; the reference pages are generated from the registry.
- **Evaluation tooling** (`evaluation/`) is separate development tooling: the eight task files, a fixture app and reset script, condition preparation, and a rule-keyed scoring script. No evaluation has been run.

## What is mocked

- **API.** `/api/*` route handlers answer from the same in-process registry with the `scenario` parameter (`normal`, `empty`, `error`). There is no database, no server-side session, and no authentication. The HTTP adapter and the local adapter share one contract so a real transport could replace them.
- **Validation and health data.** The clean, mixed, and failing reports are fixtures derived from the registry's rules. They are labeled "Demo results" wherever they appear and say nothing about any project. Nothing scans, uploads, or edits code.
- **Persistence** is browser `localStorage` guarded by Web Locks; there is no server storage. Nothing is published or deployed.
- **Review status.** Every component is "Experimental" and "Not reviewed". Metadata-complete means the contract and its references are complete, not that anyone reviewed accessibility or tested an agent.

## Acceptance evidence (A01 to A18)

| ID | Status | Evidence |
| --- | --- | --- |
| A01 | Passes (automated) | `tests/browser/views.spec.ts`; [M6 gate](evidence/M6/gate.md) |
| A02 | Passes | `tests/component-inventory.test.ts`; [M4.7](evidence/M4/M4.7/review.md), [matrix](evidence/M4/M4.7/component-review-matrix.md) |
| A03 | Passes | `tests/browser/theme-lifecycle|theme-appearance|theme-bootstrap.spec.ts`, `tests/theme-bootstrap.test.ts`; [M3.8](evidence/M3/M3.8/review.md) |
| A04 | Passes | `tests/theme-writer.test.ts`, `tests/browser/theme-tabs.spec.ts`; [M3.7](evidence/M3/M3.7/review.md) |
| A05 | Passes | `tests/browser/theme-editor.spec.ts`, `theme-scope.spec.ts`; [M3.2](evidence/M3/M3.2/review.md) |
| A06 | Passes | `tests/scales.test.ts`, `tests/browser/theme-controls.spec.ts`, `review-matrix.spec.ts`; [M3.3](evidence/M3/M3.3/review.md), [M7.5](evidence/M7/M7.5-review.md) |
| A07 | Passes | `tests/browser/playground.spec.ts`; [M6.2](evidence/M6/M6.2/review.md) |
| A08 | Passes | `tests/context-views.test.ts`, `context-completeness.test.ts`; [M5.8](evidence/M5/M5.8/review.md), [sizes](evidence/M5/M5.8/export-sizes.md) |
| A09 | Passes | Tokens, Components, Rules, Validation, AI Context, Layouts, and Docs journeys; [M4.8](evidence/M4/M4.8/review.md), [M5.10](evidence/M5/M5.10/review.md) |
| A10 | Passes | `tests/browser/data-states.spec.ts`, `tests/adapter.test.ts`; [M4.6](evidence/M4/M4.6/review.md) |
| A11 | Passes | Labels asserted in `validation`, `accessibility`, `overview`, and `content-claims` specs; [M7.7](evidence/M7/M7.7-review.md) |
| A12 | Partial: automated checks pass; human review open | `tests/browser/keyboard-matrix.spec.ts`; [human checklist](evidence/M7/M7.4-checklist.md) |
| A13 | Passes | `tests/theme-contrast.test.ts`, reduced-motion specs; [M3.6](evidence/M3/M3.6/review.md) |
| A14 | Partial: viewport checks pass; actual 200% zoom untested | `tests/browser/review-matrix.spec.ts`; [M7.5](evidence/M7/M7.5-review.md) uses a 640px viewport proxy |
| A15 | Passes | [Final gate summary](evidence/M7/gate.md); `tests/browser/console.spec.ts` finds no console, page, or hydration errors in core journeys |
| A16 | Passes | `tests/getting-started.test.ts`, `docs.test.ts`, `agent-files.test.ts`, `example-code.test.ts`, browser agent-file and docs specs; [M6.7](evidence/M6/M6.7/review.md), [M6.8](evidence/M6/M6.8/review.md) |
| A17 | Passes under recorded lab conditions | LCP 2.11–2.41 s, scores 98–99, CLS at most 0.063, no interaction long task above 50 ms. [M7.6](evidence/M7/M7.6-review.md), [performance report](evidence/M7/performance.md) |
| A18 | Partial: automated and agent screenshot checks pass; human visual review open | `tests/style-ownership.test.ts`, `tests/oocss.test.ts`, `review-matrix.spec.ts`; [M6 gate](evidence/M6/gate.md), [M7.5](evidence/M7/M7.5-review.md) |

Automated accessibility audit: 0 serious or critical findings across 53 states in both appearances ([M7.3](evidence/M7/M7.3-review.md)).

## Open work

1. **M7.4: manual keyboard and screen-reader testing and the WCAG criteria review need a human tester.** A checklist is in [M7.4-checklist.md](evidence/M7/M7.4-checklist.md). Nothing in this repository claims those checks passed.
2. **M7.5: actual 200% browser zoom and human visual review are untested.** The viewport matrix and four preview screenshots pass their automated and agent checks. A14 and A18 remain partial until the remaining review is recorded; the [checklist](evidence/M7/M7.4-checklist.md#zoom-and-visual-review-m75-a14-and-a18) names the checks.
3. **M7.8: final signoff stays open** until the human evidence closes A12, A14, A18, and the WCAG review, and any findings are fixed and rechecked.
4. **Agent evaluation E4 and E5** need an operator to run round 1 (96 runs) and to score the manual checks. They do not block Phase 1; Phase 2 must not start before E5 is recorded.

## Known limitations

- Automated checks (axe-core, keyboard tests, Lighthouse) find problems and do not prove conformance, accessibility, or real-user performance. Lighthouse numbers are lab results on one machine.
- Browser tests run in Chromium only. Native select arrow-key behavior differs by platform, so only type-ahead is asserted.
- The registry is TypeScript source; there is no editor for contracts. Contrast checks cover the listed pairs only.
- Interactive components number 17, not the 13 the visual-system spec listed; the extra four (Empty State, Error State, Not Found, Copy Button) contain actions, and the spec was updated to say so.
- Unit-tested paths that the seeded data does not exercise: disallowed compound variants, unsupported token exclusions, and reference-resolution errors in task exports.
- The fixture app and scoring tooling are untested against a real agent run.
