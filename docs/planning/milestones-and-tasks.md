# Milestones and tasks

This is the implementation plan, not a record of completed implementation. All tasks started open. Completed work is marked below and linked from the evidence log. Milestones are ordered by dependency rather than calendar dates; estimate dates after the foundation is running.

## Milestone map

| Milestone | Outcome | Depends on | Acceptance coverage |
| --- | --- | --- | --- |
| M1 | App foundation and typed registry | None | A02 integrity (seeded registry), A15 foundation |
| M2 | Shared primitives and responsive shell | M1 | A12–A14 foundation |
| M3 | Complete theme lifecycle | M2 | A03–A06, A07 (Theme preview isolation only), A13 |
| M4 | Component and token exploration | M3 | A02, A09, A12 |
| M5 | Context, rules, and honest demo reports | M4 | A08, A11; A09 and A10 for views built so far |
| M6 | Layouts, playground, and documentation | M5 | A01, A07, A09, A10, A16, A18 |
| M7 | Full verification and handoff | M6 | A01–A18 |

Each task should deliver a reviewable change. Keep components with their contracts and examples. Avoid building every page first and filling in behavior at the end.

## Model guide and switch reminders

**Sol** means GPT-6.1 Sol; **Luna** means GPT-6 Luna. Start at Medium reasoning. Use Sol High for difficult reasoning or unresolved bugs. This guide is a starting point; adjust based on actual results and model availability.

| Stage | Use Sol for | Use Luna for | Switch-back reminder |
| --- | --- | --- | --- |
| M1 | All foundation, schema, registry, resolver, adapter, and dependency tests | Small copy/example edits after Sol establishes the structure | Stay with Sol through the M1 completion gate. |
| M2 | M2.1 shared styling/scope foundations, M2.4 overlay/focus behavior, M2.6 contract review, M2.8 integration review | M2.2–M2.3 one component at a time; M2.5–M2.7 straightforward shell and feedback work using established patterns | Return to Sol for overlays, contract inconsistencies, and the M2 completion gate. |
| M3 | M3.1 state/persistence, M3.2 mode/color logic, M3.4 isolation, M3.5 lifecycle, M3.6 contrast/gamut, M3.7–M3.8 concurrency and tests | M3.3 control UI once the state APIs and scales are ready | Return to Sol before changing shared state, Apply behavior, or persistence, and for the M3 completion gate. |
| M4 | M4.7 inventory/keyboard review, M4.8 token exporter and interoperability tests | M4.1–M4.6 catalog, detail templates, previews, filters, and feedback using verified adapters | Return to Sol for M4.7–M4.8 and the M4 completion gate. |
| M5 | M5.1–M5.2 context/export logic, M5.8 tests, M5.9–M5.10 generated agent files and completeness checks | M5.3–M5.7 rules and report screens using the shared registry and labeled fixtures | Return to Sol before changing serialization, dependency closure, or generated files, and for the M5 completion gate. |
| M6 | M6.2 Playground isolation, M6.6–M6.8 integration, setup, and agent-file checks | M6.1 layouts, M6.3–M6.5 setup copy, articles, and search using established patterns | Return to Sol for Playground scope/portals and the M6 completion gate. |
| M7 | Verification, interpreting failures, accessibility review preparation, performance diagnosis, and evidence review | Small fixes and documentation updates with a clear cause and expected result | Return to Sol to verify fixes and review the final gate. Human checks remain with the human tester. |
| Evaluation track | E1 task/criteria review, E2–E3 fixture isolation and scoring logic, E5 interpretation | Draft task text and format reports after criteria are fixed | Return to Sol to review criteria and scoring; E4 still needs an operator. Keep each measured agent setup fixed as the evaluation plan requires. |

Before each task, briefly name the recommended model and why it fits. When moving from Sol to Luna, say which task or review needs Sol next. When moving from Luna to Sol, explicitly remind the user to switch back in the picker. Do not claim to change the model automatically or pause work just to obtain confirmation.

If Luna fails the same requirement/check after two repair attempts, recommend Sol and carry forward the task ID, relevant files, failed check, and unresolved issue. At handoff, record the next task, recommended model, and next switch point. Avoid repeating unchanged reminders. Keep all completion gates and required evidence intact.

## M1 — Foundation and contract

Goal: a running app with a validated registry and a replaceable mock boundary.

- [x] M1.1 Initialize the git repository if none exists. Confirm the Next.js baseline is still supported; review stack versions and support/security status; choose test tooling; confirm the React Aria Components version and its portal-container API; confirm the current Design Tokens format version; record choices and commit the lockfile.
- [x] M1.2 Scaffold Next.js, strict TypeScript, linting, focused test tooling, and production build scripts.
- [x] M1.3 Define runtime schemas, and derive types from them, for Theme, WorkspaceSettings, PersistenceEnvelope, TokenDefinition, ResolvedToken, ComponentContract, Rule, Example, LayoutExample, FontOption, DesignSystem, AIContext, and ValidationResult.
- [x] M1.4 Seed identity, principles, font allowlist, default preset (palette, light/dark maps, scales), Button, Spinner, and Link contracts with public import metadata, minimal implementations, and working recommended examples; seed the eight required rules and their linked example/token records. Every rule applicability and example component reference must point to a component already seeded. M2 expands these implementations rather than creating duplicates.
- [x] M1.5 Implement registry validation for duplicate IDs, dangling references, token paths (including palette keys), required canonical literal constants, interchange values, CSS variable naming, public imports and preview keys (via a generated type-checked file), `shortPurpose`, example imports, `interactive` and focus-rule agreement, theme identity, font IDs, example intents, rule/component agreement, `themeDefaults`, compound variants, and review evidence.
- [x] M1.6 Build the pure token resolver (`TokenDefinition` plus theme to `ResolvedToken`), effective-default merge, theme-identity assignment on Apply, overview/task/full context projections, one-way dependency traversal, and serializers. Keep them free of React and browser APIs and test them in Node.
- [x] M1.7 Implement typed adapters, read-only mock handlers (including the complete registry endpoint), response validation, scenario-aware shared registry caching, and deterministic normal/empty/error fixtures selected by the `scenario` parameter.
- [x] M1.8 Test registry failures, invalid theme data, deterministic context generation (including `system` appearance), canonical literal resolution and invalid/missing literals, dependency cycles, missing references, token-linked examples and referenced-only components, closure width, task-scoped theme values, and complete adapter dependencies for examples, presets, project guidance, and layouts.

Completion gate: local app and production build work; the seeded registry passes; invalid references fail usefully; mock failures are reproducible. Record A02 integrity evidence for the seeded registry and foundation evidence for A15. Full A02 closes in M4.

## M2 — Foundations, primitives, and shell

Goal: reusable accessible components and an adaptive workspace frame.

- [x] M2.1 Define scales and semantic variables, with defaults as global CSS on `:root`; build `ThemeScope` (workspace scope on `<html>`, nested scopes on their own roots); adopt CSS Modules, naming rules, and OOCSS ownership boundaries for structure, appearance, and parent layout.
- [x] M2.2 Build Button, Link, Card, Badge, Separator, Avatar, Alert, Progress, Spinner, and Skeleton with contracts/examples. [Evidence](../evidence/M2/M2.2/review.md)
- [x] M2.3 Build Input, Textarea, Select, Checkbox, Radio Group, Switch, Label, and Form Field with labels, help/errors, and native behavior. [Evidence](../evidence/M2/M2.3/review.md)
- [x] M2.4 Build Dialog, Dropdown Menu, Tabs, and Tooltip as SeeYesYes wrappers over React Aria Components, with documented keyboard/focus behavior and overlays that portal into the nearest `ThemeScope`. [Evidence](../evidence/M2/M2.4/review.md)
- [x] M2.5 Build Table and Navigation, including mobile drawer, skip link, active destination, headings, and breadcrumbs. [Evidence](../evidence/M2/M2.5/review.md)
- [x] M2.6 Check every required contract for relevant states, `themeDefaults`, compound variants that match its combined CSS selectors, token IDs that match its CSS, and honest maturity and review status. Registry validation passes for the full inventory. [Evidence](../evidence/M2/M2.6/review.md)
- [x] M2.7 Build shared loading, empty, error/retry, not-found, and copy-feedback patterns. [Evidence](../evidence/M2/M2.7/review.md)
- [x] M2.8 Review keyboard behavior and light/dark styling; verify variants reuse structure and components work across containers; test mobile shell and contained overflow. Automated review completed 2026-10-09; the M2 gate remains open for the required human accessibility review. See [M2.8 evidence](../evidence/M2/M2.8/review.md).

Completion gate: complete required inventory renders through shared primitives; labels and keyboard interactions work; shell works at 320px and desktop. Record initial A12–A14 evidence.

## M3 — Theme lifecycle

Goal: top-level decisions propagate predictably without leaking preview edits.

- [x] M3.1 Implement default/applied/draft stores (appearance outside the draft), versioned local persistence, runtime validation, and early initialization from a validated/versioned cache with shared values and separate light/dark maps. [Evidence](../evidence/M3/M3.1/review.md)
- [x] M3.2 Add independent light/dark editing, system preference listeners, OKLCH controls, and explicit palette suggestions. [Evidence](../evidence/M3/M3.2/review.md)
- [x] M3.3 Add typography, radius, density, shadows, clean/depth effects, motion, and valid component-default controls. [Evidence](../evidence/M3/M3.3/review.md)
- [x] M3.4 Render a scoped multi-component preview; keep portal content inside its theme scope. [Evidence](../evidence/M3/M3.4/review.md)
- [x] M3.5 Implement Apply, Discard, Reset draft, unsaved indicator, session navigation, and refresh behavior. [Evidence](../evidence/M3/M3.5/review.md)
- [x] M3.6 Add local contrast calculation for the defined pairs, gamut handling, and warnings for failing draft/applied pairs. [Evidence](../evidence/M3/M3.6/review.md)
- [x] M3.7 Handle blocked/corrupt/incompatible storage, cross-tab Web Lock serialization, stale-draft conflict rejection, latest-envelope sync through the `storage` event, session-only fallback when Web Locks is unavailable, and reduced-motion override. [Evidence](../evidence/M3/M3.7/review.md)
- [x] M3.8 Test lifecycle, global appearance changes during an open draft, mode independence, token propagation, and first paint after OS mode changes between visits. Cover missing/stale/corrupt bootstrap caches, the bootstrap-to-hydration handoff, a resolver test that every emitted value matches the bootstrap allowlist, and controlled concurrent two-tab Apply/appearance sequences, competing stale drafts, queued storage events, and missing-lock fallback. [Evidence](../evidence/M3/M3.8/review.md)

Completion gate: A03–A06, A07 for the Theme preview (including its dialog portal), and theme-related A13 pass; editing stays local until Apply; refresh restores applied settings; failure notices are usable.

## M4 — Tokens and component exploration

Goal: developers can find, understand, and try the actual system.

- [x] M4.1 Build Tokens with applied resolved values, search/category filters, purpose/examples, and copy actions. [Evidence](../evidence/M4/M4.1/review.md)
- [x] M4.2 Build Components catalog with metadata-derived counts, categories, maturity, and review status. [Evidence](../evidence/M4/M4.2/review.md)
- [x] M4.3 Build a shared Component Detail template covering every specified section and props. [Evidence](../evidence/M4/M4.3/review.md)
- [x] M4.4 Wire variant/state controls to real components and matching examples. [Evidence](../evidence/M4/M4.4/review.md)
- [x] M4.5 Add usage boundaries, composition constraints, token/rule links, structured contract view, and copy feedback. [Evidence](../evidence/M4/M4.5/review.md)
- [x] M4.6 Exercise loading, empty, error/retry, no-match, and unknown-component behavior. [Evidence](../evidence/M4/M4.6/review.md)
- [x] M4.7 Verify every required component is metadata-complete and check keyboard interaction across the full inventory. [Evidence](../evidence/M4/M4.7/review.md)
- [x] M4.8 Build the pure typed Design Tokens exporter, light/dark downloads and exclusion notes, format-shape validation, and mandatory Style Dictionary parse tests. Test structured types, applied-theme updates, unsupported exclusions, and invalid-value rejection. [Evidence](../evidence/M4/M4.8/review.md)

Completion gate: A02, component- and token-related A09 (including the Design Tokens export), and A12 pass; each required component has a real detail route and working preview.

## M5 — AI context, rules, and demo quality

Goal: make the shared contract visible and exportable without overstating enforcement.

- [x] M5.1 Build overview/task/full context selection, searchable component selection, dependency counts, and matching human/JSON/Markdown views from applied settings. [Evidence](../evidence/M5/M5.1/review.md)
- [x] M5.2 Implement copy/download with failure feedback, `WorkspaceSettings` JSON download, stable serialization, schema/mode/scope labels, byte counts, and empty-selection/reference-error handling. [Evidence](../evidence/M5/M5.2/review.md)
- [x] M5.3 Build Rules with severity/category filters and referenced violation/corrected examples. [Evidence](../evidence/M5/M5.3/review.md)
- [x] M5.4 Seed clean, mixed, and failing validation scenarios with resolvable rule/example references. [Evidence](../evidence/M5/M5.4/review.md)
- [x] M5.5 Build Validation filters, findings, linked details, and copyable fixes; show unavailable auto-fix explicitly. [Evidence](../evidence/M5/M5.5/review.md)
- [x] M5.6 Build Accessibility with separate review evidence, measured contrast, and demo reports. [Evidence](../evidence/M5/M5.6/review.md)
- [x] M5.7 Build Overview using calculated registry coverage and clearly labeled demo health/results. [Evidence](../evidence/M5/M5.7/review.md)
- [x] M5.8 Test exports after Apply, mode/view agreement, dependency completeness, local task/full size comparisons, fixture counts, filters, and request recovery. [Evidence](../evidence/M5/M5.8/review.md)
- [x] M5.9 Generate `/llms.txt` and `/llms-full.txt` at build time from the registry and default preset; add Copy for LLM to Component Detail. [Evidence](../evidence/M5/M5.9/review.md)
- [x] M5.10 Build the `AGENTS.md` snippet in AI Context with size display, Copy, and tests for completeness and update after Apply. [Evidence](../evidence/M5/M5.10/review.md)

Completion gate: A08 and A11 pass. A09 and A10 pass for every view built so far; Layouts and Documentation close them in M6. Agent files generate deterministically for the content that exists so far; their full A16 link check runs in M6 once articles exist. Exports change with applied settings. Every fixture score is labeled. No action implies scanning or editing a user's project.

## M6 — Layouts, playground, and docs

Goal: complete the product journeys and show useful compositions.

- [x] M6.1 Build all seven required layout examples with shared primitives and density switching. [Evidence](../evidence/M6/M6.1/review.md)
- [x] M6.2 Build Playground with isolated session settings, component/variant/state selection, and Reset to applied theme. [Evidence](../evidence/M6/M6.2/review.md)
- [x] M6.3 Build Getting Started against actual local setup and imports; label any future package workflow. [Evidence](../evidence/M6/M6.3/review.md)
- [x] M6.4 Build concept/configuration articles and registry-derived reference documentation. [Evidence](../evidence/M6/M6.4/review.md)
- [x] M6.5 Implement local documentation search, real result destinations, no-match feedback, deep links, and Copy for LLM on articles. [Evidence](../evidence/M6/M6.5/review.md)
- [ ] M6.6 Check all thirteen views, navigation, unknown routes, long content, and copy actions.
- [ ] M6.7 Run a fresh local setup walkthrough and verify example code, route links, and Playground portal isolation.
- [x] M6.8 Include articles in `/llms.txt` and `/llms-full.txt` and run the agent-file checks in A16. [Evidence](../evidence/M6/M6.8/review.md)

Completion gate: A01, A07 (including Playground), A09 and A10 (including Layouts and Documentation search), A16, and A18 pass; complete configure/apply/export and discover/preview/copy journeys work.

## M7 — Verification and handoff

Goal: finish required quality checks and document what actually works.

- [ ] M7.1 Run type checking, linting, focused tests, and production build; fix failures.
- [ ] M7.2 Run browser journeys for theme persistence, context export, mock recovery, and key keyboard interactions.
- [ ] M7.3 Audit all routes and relevant states with automated accessibility checks; resolve serious/critical findings and review the rest.
- [ ] M7.4 Complete manual keyboard/screen-reader checks and the applicable WCAG criteria review. **Needs a human tester;** an agent prepares the checklist and records supplied results only.
- [ ] M7.5 Review viewport/zoom, light/dark, density/radius, motion, and overflow checks; audit OOCSS separation, naming, and independence across standalone/nested/overlay examples.
- [ ] M7.6 Run the recorded production performance procedure and investigate budget failures.
- [ ] M7.7 Review content for misleading package, AI, validation, maturity, or accessibility claims.
- [ ] M7.8 Complete A01–A18 evidence and write local setup, architecture, mock boundaries, and known limitations.

Completion gate: all required acceptance checks pass with evidence. Any failed or unverified required check keeps the milestone open. Optional enhancements and deployment remain separate tasks.

## Evaluation track

Runs alongside the product milestones, following the [agent evaluation plan](../specs/07-agent-evaluation.md). These tasks do not block Phase 1 completion, but Phase 2 does not start until E5 is recorded.

- [ ] E1 (during M6) Write the eight task files with prompts, expected components, probed rules, and requirement checklists. Confirm no task can be copied verbatim from a registry example.
- [ ] E2 (during M6) Build the fixture app and its reset script. Confirm C0 contains no registry, documentation, exports, or `AGENTS.md`.
- [ ] E3 (during M6) Build the scoring script for automated violation checks and axe runs, keyed by rule ID. Test it against the registry's violation and corrected examples.
- [ ] E4 (after M7) Run round 1: one agent setup, 8 tasks × 4 conditions × 3 runs, in randomized order. **Needs an operator;** an implementing agent must not score the manual checks of its own runs.
- [ ] E5 Write the round 1 report with per-task and overall results against the pre-set decision criteria, and record follow-up decisions in the change log.

## Phase 2 backlog

Not started. Do not begin until M7 passes and E5 is recorded. If Q1 is not met, revise contract content first.

- P2.1 Read-only MCP server wrapping the Phase 1 context functions, as planned in [Product and scope](../specs/01-product-and-scope.md#planned-for-phase-2-mcp-server).

## Evidence log

Add one entry when a milestone is reviewed. Keep check output and screenshots under `docs/evidence/<milestone>/`.

| Milestone | Status | Reviewed on | Evidence path | Open issues |
| --- | --- | --- | --- | --- |
| M1 | Complete | 2026-10-08 | [M1 review](../evidence/M1/review.md) | Full A02/A15 close in later milestones. |
| M2 | In progress | 2026-10-09 | [M2 task evidence](../evidence/M2/review.md) | Automated M2.8 review is complete; the quality gate remains open for human keyboard, screen-reader, and WCAG review. |
| M3 | Complete (automated) | 2026-10-13 | [M3.8 review](../evidence/M3/M3.8/review.md) | Human screen-reader and WCAG review remain open. |
| M4 | Complete (automated) | 2026-10-14 | [M4.8 review](../evidence/M4/M4.8/review.md) | Human screen-reader and WCAG review remain open. |
| M5 | Complete (automated) | 2026-10-14 | [M5.10 review](../evidence/M5/M5.10/review.md) | Full agent-file link check runs in M6; human accessibility review remains open. |
| M6 | In progress | 2026-10-14 | [M6.8 review](../evidence/M6/M6.8/review.md) | M6.6 and M6.7 remain open. |
| M7 | Not started | — | — | — |

## Change handling

Update the owning spec first when a requirement changes, then adjust affected tasks and acceptance checks. Record the reason here. Do not silently promote optional work or lower quality gates to finish a milestone.

Implementation guidance (2026-10-08, model choice): added GPT-6 Luna/GPT-6.1 Sol task guidance and reminders in both directions. Sol handles shared logic and milestone reviews; Luna handles focused work once its foundations are ready. Handoffs name the next model and switch point. This changes the working guidance only; scope, acceptance checks, and evaluation controls stay intact.

Initial planning decisions: density and clean/depth effects are required; richer effects and product components are deferred; local theme persistence is allowed; mock route handlers are allowed; context generation works locally; validation remains labeled sample data; Link is required to support semantic navigation guidance.

Context-consumption decision: the build prompt is a small shared baseline with task-specific reading. AI Context supports overview, task, and full exports from the same registry. Task export follows references and retains applicable accessibility/usage guidance. Inside Phase 1, the product checks scope, dependencies, and local export size. Measured agent comparisons run in the separate evaluation track.

Styling decision: use native CSS and CSS Modules with OOCSS principles. Base structure is reused, appearance comes from semantic tokens, and parents control placement rather than child internals. Local classes stay simple; generated names remain private. SCSS and full BEM naming are not required.

Specification revision (2026-10-07): before M1, the specs were tightened after a review. Task closure now follows references one way, so rule applicability no longer widens task exports. Mode-dependent tokens carry both modes, so exports stay deterministic under `system` appearance. Appearance moved out of the Theme draft, so Apply never reverts the workspace preference. Theme defaults are limited to `themeDefaults` values, and exports show effective defaults. Other additions: primitive palette, font allowlist, theme presets and layouts in the registry, optional previews for violation examples, listed contrast pairs, a required rule table, a metadata readiness checklist, a `ThemeScope` for portals and defaults, a production-testable `scenario` parameter, and early initialization of cached CSS variables. React Hook Form is no longer mandatory. M1 now claims A02 integrity only, and screen-reader checks need a human tester.

Specification revision (2026-10-07, after a market comparison with Spectrum, Chakra UI, Panda CSS, and vanilla-extract): React Aria Components is now the default foundation for Dialog, Dropdown Menu, Tabs, and Tooltip, wrapped in SeeYesYes APIs with overlays portaled into `ThemeScope`. Native elements stay for Select, Radio Group, Checkbox, and Switch. Contracts gain `compoundVariants`, following the recipe model used by Chakra UI and Panda CSS. These list styled and disallowed variant combinations so agents can see which combinations are valid, and validation rejects defaults that would form a disallowed combination.

Specification revision (2026-10-07, agent delivery): Phase 1 now generates `/llms.txt` and `/llms-full.txt` from the registry and default preset, and adds Copy for LLM to Component Detail and Documentation. AI Context can download the applied `WorkspaceSettings`. A read-only MCP server is the first Phase 2 item. Phase 1 keeps the context functions free of React and browser APIs and tests them in Node so that server can reuse them.

Specification revision (2026-10-07, interoperability): Tokens now export in the Design Tokens Format Module 2025.10, as one complete file per mode with SeeYesYes data under `$extensions`, checked by a Style Dictionary parse test. AI Context adds a short `AGENTS.md` snippet: an index of components, system rules, and where to get detailed context, kept near 4 KB without dropping rules or components.

Specification revision (review fixes): client context/detail views load complete shared registry data through a typed scenario-aware adapter. M1 now seeds Link alongside Button and Spinner so rule references pass integrity checks. Tokens carry explicit canonical interchange values; export validates structured types, reports unsupported exclusions, and requires the Style Dictionary check. Bootstrap stores both mode maps with theme/version checks and selects the current OS mode before paint. Contracts and discovery entries carry verified public import metadata for agent snippets.

Specification revision (2026-10-07, second review): the registry stores `TokenDefinition` records only; `ResolvedToken` values come from the resolver for the theme an export names, so full exports can no longer pair an applied theme with default-preset values. Context `scope` can be `"default-theme"` for build-time files, the mock context endpoint, and the MCP server without settings. An applied theme that differs from its preset becomes `id: "custom"` with `basedOn`. Contracts gain `interactive`, which defines where `wcag-focus-visible` and keyboard requirements apply. Each data-driven view has a per-scenario outcome table, with secondary registry requests deferred so empty lists stay reachable. Gates no longer claim checks whose views are built later: M3 covers Theme preview isolation only, and A09/A10 close in M6. The `AGENTS.md` snippet now carries theme identity and changed effective defaults. Smaller changes: palette keyed by ID, bootstrap compares a `themeRevision` number with pattern-based value checks, public imports are verified by a generated type-check file, and example imports must match public imports.

Specification revision (2026-10-07, third review): settings saves read the latest stored envelope and change only the edited field, and tabs sync through the `storage` event, to reduce stale writes. This alone does not prevent concurrent writes; the later serialization decision below supersedes that guarantee. A `PersistenceEnvelope` type now holds `themeRevision` and the bootstrap cache. The bootstrap value allowlist covers every resolver value form (including font families, easing, keywords, and `var()` references), a resolver test enforces it, and any failure discards the whole cache. Phase 1 ships exactly one preset; the list type stays for later. `/api/tokens` returns definitions only. The component inventory lists which components are interactive. The build prompt's reading guide covers agent files, token export, and persistence.

Specification revision (2026-10-07, fourth review): default variables live in global CSS on `:root`, the workspace `ThemeScope` uses `<html>` and renders no variables in server markup, and only `<html>` gets `suppressHydrationWarning`, so server-rendered defaults cannot hide the bootstrap values. Contracts gain `shortPurpose` (at most 60 characters) for the Overview catalog and the `AGENTS.md` snippet, which stays generated from contract fields. A working preview is defined as a `previewKey` present in the preview map, checked by the generated type-check file. Task context never includes the palette. Wording updated for applied settings and token definitions.

Specification revision (final review fixes): literal token definitions now carry typed canonical constants, so CSS and interchange values come from one authored source. Task closure follows every included token's example references and emits referenced-only component catalog entries without widening the full component set. Persistent settings saves use one cross-tab Web Lock and check draft base revisions; stale theme drafts are rejected and preserved. Storage events trigger a read of the latest envelope. If locks or writable storage are unavailable, settings stay session-only and shared storage is never written. Acceptance checks cover controlled concurrent saves and all three fixes.

Specification revision (2026-10-08, agent evaluation): added an [agent evaluation plan](../specs/07-agent-evaluation.md) to test whether SeeYesYes context improves agent output. It compares no context, the `AGENTS.md` snippet, task context, and full context on eight fixed tasks in a separate fixture app, with three runs per cell. A run is a clean success when it builds, meets requirements, and has no error-severity violations or serious/critical axe findings. Decision criteria are set before round 1. The evaluation is development tooling outside the product and does not block Phase 1, but Phase 2 waits for the round 1 report.

Implementation decision (2026-10-08, M1.1): Next.js 15 remains in Maintenance LTS, but its latest published 15.5.27 dependency tree failed the security audit (PostCSS). Use current stable Next.js 16.4 with React 19.3; use focused current TypeScript and React Hooks lint rules. The Next.js lint preset still pulled in an unpatched glob dependency, so it was removed; browser axe checks cover accessibility. Pin resolved versions and record audit/build evidence in M1. Vitest runs on Node 24 LTS from the bundled runtime.
