# Shared delivery rules

Read this once per working session. The [entry plan](../component-expansion.md) routes tasks; [tracking](tracking.md) owns milestone status; each milestone file owns its task checkboxes. [Visual direction](visual-direction.md) owns the glass requirements.

## Scope and parallel work

All 79 requested items remain required expansion scope. Keep CSS Modules, semantic tokens, native controls and React Aria. Reuse current implementations and preserve public callers. cn() does not imply Tailwind; a dependency change requires a demonstrated gap. Utilities/templates need truthful public docs and examples rather than being forced into a control schema.

The [Naazhi migration](../naazhi-consumer-migration.md) continues independently under its own IDs. No complete expansion milestone blocks it. Pull forward a shared task it needs, record shared implementation here and consumer verification there. Preserve existing working-tree changes. Ship affected additions through the versioned artifact workflow; no sibling source imports or copied private styles.

Original M7 human reviews, evaluation and MCP gates remain open as recorded in the [main plan](../milestones-and-tasks.md). This expansion does not declare them passed. Backend auth, publishing and deployment remain separate work.

## Task completion and evidence

SYX-001 through SYX-079 retain their original IDs; SYX-R01 through SYX-R06 are release tasks. A checked task means scoped implementation, relevant contracts, examples and focused automated checks have evidence. Existing source is a reuse baseline, not a passed expansion check.

For an active task, add a short dated note below its checkbox: owner, state, revision, changed files, checks/result, evidence link and next action. Keep milestone implementation, automated checks, human review and release approval separate in tracking. Do not duplicate status in the index or other specs.

A change reaches relevant callers, tokens/schema/defaults, registry, contract, preview/detail or layout example, public exports, documentation and AI context. Regenerate generated files. Retain Link, Label and shared loading/empty/error patterns even though they were not in the submitted list.

Each X1–X7 file owns a variation matrix for its tasks; X8 owns release coverage. Matrix entries are planned requirements, not claims of existing props. Preserve current public names and defaults; add aliases only when they avoid breaking callers. Do not invent size props for utilities, typography or page layouts. Glass is a theme surface treatment, not an extra interactive state or a duplicate variant API on every control. Use explicit props, then valid theme defaults, then contract defaults as the existing system does. Uncontrolled defaults never override a supplied controlled value. Theme defaults cannot change semantics or destructive behavior.

Verify variants, relevant states and boundary sizes using representative combinations, including selected/disabled, loading/disabled and invalid/required where supported. Document unsupported combinations in contracts and prevent them through types or runtime validation as appropriate. Do not run an exhaustive Cartesian product of cosmetic settings. Resolve a planned default that conflicts with existing behavior explicitly before implementation, recording affected callers and compatibility evidence.

Run focused checks for changed non-trivial behavior: forms, controlled/uncontrolled values, labels, keyboard/focus, disabled/read-only/error/loading states, scoped portals, SSR/hydration, storage recovery and responsive layouts. Apply the shared glass checks to surfaces. Run broader project/package/browser checks at affected gates rather than after every trivial style edit.

Evidence lives at docs/evidence/expansion/<milestone>/<task>/ and records revision, environment, command/review method, outcome and remaining issues. Create evidence when work is performed. Human review and release decisions require actual results; never infer them from a successful build.
