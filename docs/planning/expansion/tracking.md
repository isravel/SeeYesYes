# Expansion tracking

This file owns milestone status. Task checkboxes and task evidence notes live only in the linked milestone files. Read only the row for the work being resumed.

| Phase | Milestone | Implementation | Automated checks | Human review | Release |
| --- | --- | --- | --- | --- | --- |
| A — Foundations and controls | [X1 — Theme and utilities](x1-theme-and-utilities.md) | In progress: 3 of 5 tasks done; SYX-001 and SYX-004 open | Passed for the covered scope (unit, type, lint, build, focused browser) | Pending | Not approved |
| A — Foundations and controls | [X2 — Existing control extensions](x2-existing-controls.md) | All 21 inventory tasks checked on automated evidence; Fieldset additionally implemented under SYX-067. Milestone signoff open | Passed for the covered scope (unit 542, type, lint, component audit, build, 55 focused browser tests); [shared checks](../../evidence/expansion/X2/checks.md) | Pending; waits on the SYX-001 visual gate | Not approved |
| A — Foundations and controls | [X3 — Missing controls and feedback](x3-new-controls.md) | In progress: 15 of 19 tasks checked (SYX-007, 009, 011, 012, 014, 016, 017, 032, 060, 062, 063, 065, 066, 070, 078); SYX-079 implemented, optional overflow trigger open. 4 not started (019, 020, 071, 072) | Passed for the covered scope (unit 641, type, lint, component audit (48), build, 65 focused browser tests across 12 specs); [shared checks](../../evidence/expansion/X3/checks.md) | Pending | Not approved |
| B — Motion and media | [X4 — Optional effects and media primitives](x4-motion-and-media.md) | Planned | Not run | Pending | Not approved |
| C — Sections and listings | [X5 — Reusable page sections](x5-page-sections.md) | Planned | Not run | Pending | Not approved |
| C — Sections and listings | [X6 — Listing kit and content cards](x6-listings.md) | Planned | Not run | Pending | Not approved |
| D — Templates and release | [X7 — Complete page templates](x7-page-templates.md) | Planned | Not run | Pending | Not approved |
| D — Templates and release | [X8 — Package, documentation and release](x8-release.md) | Planned | Not run | Pending | Not approved |

Next implementation task: X3 can start, with its glass look compared against the SYX-001 review once done. Retain boxed Tabs as the default; line remains explicit opt-in. Full X2 signoff and further broad restyling wait on the SYX-001 human visual gate. Reduced-transparency browser rendering, other X2 evidence gaps and the SYX-004 packed-consumer check remain open. Recommended model: Sol for menu semantics, contracts and package decisions; follow the main model guide for focused follow-ups. Naazhi continues under its own tracker.

## Change log

- 2026-11-10: X3 started with five display primitives: Highlight, Level, LiveDot, Kbd and AvatarGroup (inventory 37). SYX-007, 011, 012 and 078 checked on automated evidence; SYX-079 left open for the optional overflow trigger. Unit 573, type, lint, audit and build pass. One assertion in `tests/context-completeness.test.ts` was deliberately relaxed (overview is no longer smaller than every task export); details in the X3 checks file. The other 14 X3 tasks were not started at that point.
- 2026-11-10: X3 fourth batch: Popover and Drawer (inventory 48). SYX-065 and 066 checked on automated evidence only. Unit 641, type, lint, audit and build pass; 8 new browser tests pass plus 57 related. Popover is light-dismiss, not non-modal as planned, because React Aria's non-modal mode did not open reliably from a click here. The shell `NavigationDrawer` was not refactored. Remaining X3: Input OTP, Combobox, Confirm dialog, Toast, and the SYX-079 overflow trigger.
- 2026-11-10: X3 third batch: Disclosure, Accordion, Pagination and Breadcrumbs (inventory 46). SYX-032, 060, 062 and 063 checked on automated evidence only. Unit 637, type, lint, audit and build pass; 8 new browser tests pass. The focus rule now lists the four new controls. The shell `Navigation` breadcrumb was left as is rather than refactored. Remaining X3: Popover, Drawer, Input OTP, Combobox, Confirm dialog, Toast, and the SYX-079 overflow trigger.
- 2026-11-10: X3 second batch: IconButton, SearchInput, Segmented, Chip and CheckboxGroup (inventory 42). SYX-009, 014, 016, 017 and 070 checked on automated evidence only. Unit 604, type, lint, audit and build pass; 50 focused browser tests pass. Also: the Link overview example order was restored (link-docs first), the focus rule now lists the five new interactive controls, and `theme-controls.spec.ts` now expects Button's six approved theme defaults (stale since X2). Remaining X3: Disclosure, Accordion, Pagination, Breadcrumbs, Popover, Drawer, Input OTP, Combobox, Confirm dialog, Toast, and the SYX-079 overflow trigger.

- 2026-11-10: SYX-021 done. The menu now supports link items, named groups and non-focusable separators, with action-item callers unchanged. Added 6 browser tests (structure, keyboard, links, empty state, 320px, axe); unit 542, 55 focused browser tests, type, lint, audit and build pass. All 21 inventory tasks are checked. X2 signoff stays open for human visual review and real reduced-transparency browser testing; Dialog forced-colors results cover a separate condition.

- 2026-11-10: Resolved X2 plan decisions: keep boxed Tabs as default, retain menu links/groups/separators as required SYX-021 scope, and list remaining browser/human evidence explicitly. No implementation, check result or release status changed.

- 2026-11-10: X2 task-by-task pass. Added 53 unit tests, a scoped controls fixture page and 15 browser tests; per-task evidence under `docs/evidence/expansion/X2/`. Found and fixed: Fieldset had no contract (now `fieldset`, inventory 32) and Avatar did not show its fallback when an image failed before hydration. Tabs default stays `boxed` (decision needed). 21 of 22 tasks checked on automated evidence; SYX-021 open. Human visual review still pending.

- 2026-11-09: X1 implementation. Added the `glass` surface and seven glass tokens (resolver 1.2), a `glass` preset (default theme unchanged), `cn()`, Backdrop, ThemeSwitcher, and artifact exports for the theme runtime. Also fixed `tsconfig.json` so type-checking ignores the gitignored `projects/` and `artifact/` folders and allows `.ts` import specifiers, which had been failing `npm run build`. Component inventory was 31 at that point (32 after X2 registered Fieldset).

- 2026-11-09: Added milestone-local variants/sizes/states/defaults matrices for all 79 inventory items, Fieldset/Legend and the five Listing subcomponents. X8 covers release verification of those matrices. Existing task IDs, checkboxes and implementation/review status are unchanged.

- 2026-11-09: Recorded all 79 inventory tasks, four phases, eight milestones and six release tasks. Implementation unchecked.
- 2026-11-09: Made translucent glass the planned expansion visual direction and split the plan into targeted files. IDs and statuses preserved; no implementation or verification claim added.
