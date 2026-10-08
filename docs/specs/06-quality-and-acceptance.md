# Quality and acceptance

## Accessibility target

Target [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) for the shipped workspace and default theme. Maintain an applicable-success-criteria checklist. Automated checks and the short list below do not establish complete conformance.

For default themes, normal text must meet 4.5:1 contrast; qualifying large text must meet 3:1. Required non-text visual cues must meet 3:1 against adjacent colors. The required pairs are listed in [Contrast pairs](02-architecture-and-theme.md#contrast-pairs). Record exceptions using the standard rather than treating every decorative border as a failure.

The workspace must provide keyboard access, visible and unobscured focus, semantic structure, accessible names, labeled forms, useful error text, reduced-motion support, and appropriate status announcements. Review target sizes and spacing under the standard.

Do not show a conformance claim based on demo fixtures. User-edited themes may fail contrast; report those failures clearly.

## Acceptance checks

| ID | Required result | Evidence |
| --- | --- | --- |
| A01 | All 13 views and documented deep links load; unknown IDs show useful not-found views. | Route smoke report |
| A02 | Registry references and validation rules pass; every required component has implementation, contract, recommended example, and metadata-complete status. | Registry validation report |
| A03 | Draft changes affect only Theme preview; Apply updates workspace, Tokens, and context; first paint with valid compatible settings/cache shows applied settings without a flash of defaults, including an OS appearance change between visits. Invalid/stale caches follow the documented safe fallback. | Theme journey test |
| A04 | Discard, Reset draft, navigation, refresh, corrupted storage, and blocked storage follow the spec. Changing workspace appearance during an open draft leaves the draft and unsaved indicator unchanged, and Apply does not revert appearance. With two tabs open, locked theme/appearance saves preserve each other's fields; a stale theme draft is rejected without writing or losing the draft. Tabs adopt the latest stored envelope. Without Web Locks or writable storage, changes remain session-only and do not overwrite shared storage. | Persistence test results |
| A05 | Light/dark maps remain independent; system preference responds to OS changes. | Appearance tests |
| A06 | Radius, density, typography, shadows, effects, motion, and defaults affect multiple components consistently. Theme defaults only use `themeDefaults` values and never override explicit props. | Preview matrix and interaction checks |
| A07 | Playground changes remain local, including overlay portals. Reset reloads applied settings. | Isolation test |
| A08 | Overview/task/full context is deterministic, including under `system` appearance, and agrees across views. Every token value in an export is resolved from the theme its `scope` names, and `scope`, `themeId`, and `basedOnThemeId` are truthful. Task exports follow the one-way closure, include effective defaults, relevant theme values, and required guidance without dangling references; values update after Apply. A single-component task export omits unrelated components. | Serializer, closure, export, and size-comparison tests |
| A09 | Search, filters, copy/download, demo scenario selection, and suggested-fix details work. Design Tokens files pass structured format validation and mandatory Style Dictionary parsing, update after Apply, report unsupported exclusions, and reject invalid supported values. The `AGENTS.md` snippet includes every component with verified public imports and every system rule, stays near its size target, and after Apply shows the new theme ID and any changed effective defaults. | User journey checks and export tests |
| A10 | Context, detail, rule, and layout adapters supply all referenced data through the shared registry without raw-fixture imports. Scenario cache keys stay isolated. Every data-driven view shows the outcome its scenario table specifies in the production build via the `scenario` parameter, including empty lists that do not wait on secondary requests; Retry recovers. | Scenario report |
| A11 | Demo health/validation data, measured contrast, and real component review evidence stay clearly labeled. | UI/content review |
| A12 | Required components and complex controls pass keyboard, focus, naming, and state checks. | Component review matrix |
| A13 | Default light/dark themes meet applicable contrast requirements; reduced motion suppresses nonessential animation. | Contrast and motion checks |
| A14 | No page-level overflow at 320, 768, 1280, and 1920px; 200% zoom remains usable. | Screenshots and viewport checks |
| A15 | Type checking, linting, focused tests, and production build pass with no hydration or console errors in core journeys. | Check logs |
| A16 | Local setup instructions and examples work against the shipped files; all documentation links resolve, including every link in `/llms.txt`. `/llms.txt` and `/llms-full.txt` are deterministic and say they use the default theme. Copy for LLM output matches the matching export or article source. | Fresh-setup, link, and agent-file checks |
| A17 | Performance budget passes under the repeatable procedure below. | Performance report |
| A18 | Required layouts reuse primitives; component structure and appearance stay separate; components work across containers without parent-specific overrides. Screens show finished content and real actions. | Visual review, style ownership, and composition audit |

## Verification approach

Add focused tests where failure would break the contract: registry integrity, public import exports and example imports, interactive/focus-rule agreement, theme identity on Apply, complete adapter dependencies, rule/component agreement, token resolution (including canonical literal constants and missing/invalid literals), interchange-value validation, and CSS variable naming, default validation and precedence, compound-variant validation (including defaults that would form a disallowed combination), context serialization, task dependency closure (including token-linked examples, referenced-only example components, cycles, missing references, and proof that rule `appliesTo` lists do not widen the closure), theme persistence, and scope isolation. Add controlled two-tab tests that contend for the settings lock: concurrent theme/appearance changes preserve both fields, competing theme drafts reject the stale Apply, queued storage events resolve to the latest envelope, and missing-lock/blocked-storage fallback never writes shared settings. Run context, closure, token-resolution, and serializer tests in a Node environment with no DOM, so the Phase 2 MCP server can reuse them. Compare task/full export sizes on a fixed small-component fixture; verify that unrelated records are omitted and required guidance remains intact. Add browser journeys for theme application, context export, mock recovery, and complex keyboard controls.

Use automated accessibility checks on required routes and interactive states. Require zero unresolved serious/critical findings. Review lesser findings and record their resolution. Manually test keyboard navigation throughout the workspace and a screen reader on Theme forms, Dialog, Dropdown Menu, Tabs, and validation details. Record browser, assistive technology, versions, and results.

Screen-reader testing and the final WCAG criteria review need a human tester. An AI agent may prepare the checklist and record results the tester supplies, but must not mark those checks passed on its own.

Store evidence under `docs/evidence/<milestone>/`, for example `docs/evidence/M3/persistence-tests.txt`.

Review light/dark component previews with compact/comfortable/spacious density and sharp/soft/curvy radius. Use representative combination screenshots plus targeted checks for all scale settings. Review mobile navigation, code, tables, theme controls, and long content. The required default themes must pass; an intentionally failing draft must visibly warn.

## Agent evaluation

The [agent evaluation](07-agent-evaluation.md) is not an acceptance check and does not block Phase 1 completion. Its fixture app and scoring script are development tooling outside the shipped product. Its results gate the start of Phase 2, as described in the milestone plan.

## OOCSS review

Review Button, Input, and Card in standalone, nested, and overlay examples under the same theme. Confirm their internal styles and behavior remain consistent; parent-owned placement may differ. Existing preview screenshots and code review are sufficient unless a real regression warrants a focused test.

Check that variants reuse base structure, geometry uses shared scales, and appearance uses semantic tokens. Check for parent-specific component selectors, private-class overrides, duplicated variant base styles, and unnecessary wrapper elements. Verify theme/density changes propagate without modifying component rules. Do not require separate structure/appearance files or a fixed count of classes.

## Performance budget

Use the production build, fixed mock latency, and normal fixtures. Record machine/browser versions and throttling settings. Run Lighthouse mobile on Overview, Theme, Components, and AI Context three times per route and use median results.

Project targets: performance score at least 90, LCP at most 2.5s, and CLS at most 0.1. These are project acceptance targets under the recorded lab conditions, not a claim about real-user traffic.

Record route JavaScript transfer sizes and dependency choices. Do not ship a styling runtime or load optional editors/motion tools on routes that do not use them. Server-render static content, load assets sensibly, reserve layout space, and avoid heavy effects and unnecessary wrappers.

Record a production interaction trace while editing Theme and filtering the catalog. Target no application-attributable long task above 50ms during steady interaction. Investigate failures with evidence rather than masking them with higher budgets.

## Handoff

Provide actual setup/check commands, a short architecture explanation, completed task status, acceptance evidence, and remaining limitations. Say which results are mocked. Do not mark completion when required tests or milestone gates remain unverified.
