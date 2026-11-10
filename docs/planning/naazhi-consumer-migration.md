# Naazhi × SeeYesYes design migration

**Status:** active. This is the joint plan for using Naazhi as the first real SeeYesYes consumer. Update the matching plan in Naazhi when a milestone changes.

## The result we are building

Naazhi becomes a calm, high-density financial workspace. It has a warm-grey outer canvas, a contained desktop application frame, compact navigation, clear hierarchy, soft panel depth, a raspberry primary action, and finance reports that stay dense without becoming hard to scan.

SeeYesYes remains a product-neutral package. It provides tokens, theme scopes, accessible primitives, and generic report surfaces. Naazhi owns its navigation behavior, financial layouts, money and INR formatting, charts, provenance and freshness labels, financial statuses, and finance-specific tests.

## Non-negotiable boundaries

| SeeYesYes owns | Naazhi owns |
| --- | --- |
| Theme scopes, semantic tokens, the soft-workspace preset, and generic layout foundations | The contained app frame, navigation, report composition, and mobile behavior |
| Button, Card, form controls, Dialog, Menu, Tabs, Tooltip, Toast, Table, and Navigation primitives | INR formatting, money rules, charts, data sources, freshness, and financial status meaning |
| Public package exports, peer compatibility, and component-level tests/docs | Theme adapter, local CSS, product accessibility checks, and finance tests |

Naazhi only installs a packed, versioned `@seeyesyes/ui` artifact. It must not import SeeYesYes source, use a sibling-checkout symlink, or copy internal styles. SeeYesYes must not import Naazhi or gain finance-specific components.

## Working method

1. Change the shared package only after the Naazhi need proves the pattern is reusable.
2. Export a tarball, install it into Naazhi's local `vendor/` workflow, then verify the real consumer before calling a shared change complete.
3. Treat a missing token, rigid API, CSS override, portal theme leak, or accessibility gap as concrete package feedback. Fix it in SeeYesYes when it is generic; keep it local when it expresses finance behavior.
4. Ship one vertical slice at a time: shell, Financial Pulse, settings forms, then the remaining product pages.
5. Keep human accessibility review honest. Automated checks help, but SeeYesYes keyboard, screen-reader, zoom, and visual reviews remain open until a person performs them.

## Milestones

### M0 — Baseline and plan

- [x] `SY-NZ-001` Inspect both working trees and preserve existing changes.
- [x] `SY-NZ-002` Set architecture boundaries and write this joint plan.
- [x] `SY-NZ-003` Confirm compatibility target: Naazhi Next 16.4.3 / React 19.0; SeeYesYes Next 16.4 / React 19.3.
- [x] `SY-NZ-004` Add this plan to Naazhi and link both copies.

**Exit gate:** both repositories carry the same current plan; no existing user change is overwritten.

### M1 — Versioned public package baseline

- [x] `SY-NZ-101` Review the SeeYesYes public artifact boundary. It excludes routes, WorkspaceShell, demo fixtures, preview catalog, and API handlers.
- [x] `SY-NZ-102` Verify the public surface has React and Next peer ranges that include Naazhi.
- [ ] `SY-NZ-103` Fix the `npm pack` failure under the current Node 25 runtime and produce a tarball.
- [ ] `SY-NZ-104` Install the tarball in Naazhi through a local versioned package workflow.
- [ ] `SY-NZ-105` Add Naazhi `transpilePackages: ["@seeyesyes/ui"]` and pass typecheck/build with one React runtime.

**Exit gate:** Naazhi resolves only the artifact, and its typecheck and build pass.

### M2 — Soft workspace foundations

- [x] `SY-NZ-201` Add the generic `soft-workspace` theme preset, compact density, subtle depth, and raspberry primary baseline.
- [x] `SY-NZ-202` Add the generic elevated Card surface for report panels.
- [x] `SY-NZ-203` Update the theme schema for multiple named presets and cover the preset with a contract test.
- [ ] `SY-NZ-204` Verify the exported tarball contains the preset and elevated Card through Naazhi, not an internal import.
- [ ] `SY-NZ-205` Document package use and any consumer constraints found in the first installation.

**Exit gate:** the generic patterns work in the actual consumer and no financial concept enters SeeYesYes.

### M3 — Naazhi theme adapter and shell

- [ ] `NZ-SY-301` Build a Naazhi-owned theme adapter derived from the public soft-workspace preset.
- [ ] `NZ-SY-302` Apply the adapter at the app root and migrate global styling without touching financial behavior.
- [ ] `NZ-SY-303` Rebuild the contained shell: calm outer canvas, framed desktop surface, compact navigation, focused top bar, and responsive mobile route access.
- [ ] `NZ-SY-304` Verify dialogs, menus, tooltips, and toasts inherit the active theme through portals.
- [ ] `NZ-SY-305` Check keyboard navigation, visible focus, mobile overflow, light/dark contrast, and reduced motion for the shell.

**Exit gate:** the shell looks distinctly Naazhi, while controls come from the installed package and overlays do not leak theme styles.

### M4 — Financial Pulse

- [ ] `NZ-SY-401` Recompose the Financial Pulse header, period controls, KPI group, insight panels, and attention list with package primitives.
- [ ] `NZ-SY-402` Keep charts, INR display, data provenance, freshness language, and financial statuses local.
- [ ] `NZ-SY-403` Use dense report panels with clear labels, scan order, and status text that never relies on color alone.
- [ ] `NZ-SY-404` Update targeted dashboard tests and run accessibility checks for the view.

**Exit gate:** Financial Pulse is readable at desktop and mobile widths, preserves all finance semantics, and uses no copied SeeYesYes style source.

### M5 — Settings-related forms

- [ ] `NZ-SY-501` Migrate appearance, dashboard, notification, consent, and reset forms to package controls.
- [ ] `NZ-SY-502` Keep preference persistence, consent behavior, and reset logic unchanged.
- [ ] `NZ-SY-503` Validate labels, descriptions, errors, focus order, dialog behavior, and destructive-action confirmation.
- [ ] `NZ-SY-504` Add or update focused settings tests.

**Exit gate:** settings behavior is unchanged; form controls and confirmation dialog use the package cleanly.

### M6 — Remaining product surfaces

- [ ] `NZ-SY-601` Migrate Wealth, Cash Flow, and Needs Attention compositions.
- [ ] `NZ-SY-602` Migrate ledger, planning, import, notification, assistant, and security screens in priority order.
- [ ] `NZ-SY-603` Retire superseded Naazhi primitives only after every caller has migrated.
- [ ] `NZ-SY-604` Keep a short list of deliberate local finance primitives.

**Exit gate:** every migrated screen uses the public package where the pattern is generic, and finance-specific presentation remains local.

### M7 — Closeout and handoff

- [ ] `SY-NZ-701` Run SeeYesYes typecheck, lint, focused tests, artifact export, and package inspection.
- [ ] `NZ-SY-702` Run Naazhi typecheck, lint, focused tests, build, and relevant browser checks.
- [ ] `SY-NZ-703` Record solved and deferred integration feedback.
- [ ] `SY-NZ-704` Complete human keyboard, screen-reader, 200% zoom, and visual reviews for both products.
- [ ] `SY-NZ-705` Update package and migration documentation with the final installed artifact version.

**Exit gate:** artifact-based consumption is verified, test evidence is current, and human-review work is either completed or clearly still open.

## Current blockers and decisions

| Item | Status | Next action |
| --- | --- | --- |
| SeeYesYes dependencies | Ready | Focused contract test passes: 52 tests. |
| Public package archive | Blocked | `npm pack` exits 255 under Node 25; reproduce with output and make the pack step runtime-compatible. |
| Naazhi source changes | Not started | Preserve the existing `src/app/layout.tsx` edit until the package installs. |
| Human accessibility review | Open | Do not mark complete from automated checks. |

## Change log

| Date | Task IDs | Note |
| --- | --- | --- |
| 2026-11-09 | `SY-NZ-001`–`003`, `SY-NZ-101`–`102`, `SY-NZ-201`–`203` | Plan created; soft-workspace preset, elevated Card, and multi-preset schema added in SeeYesYes. |
