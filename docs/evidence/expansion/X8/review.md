# X8 — Package, documentation and release: evidence

Revision: `65f0b46` plus uncommitted working tree (the same changes are committed with this file). Environment: macOS, Node v25.6.1 (the repo pins Node 22.12+/24; this is **not** the pinned runtime), Playwright 1.64.0.

Logs in this folder: `check-baseline.log`, `check-final.log`, `browser-full.log`, `browser-rerun.log`, `browser-ai-context-rerun.log`, `browser-touched-specs.log`.

## Outcome by task

| Task | Status | Basis |
| --- | --- | --- |
| SYX-R01 Package boundary | **Partly verified** | Packed install into a scratch Next app builds and runs. One peer finding (below). Missing-peer failure and SSR mismatch checks were not run. |
| SYX-R02 Catalog and AI guidance | **Partly verified** | Generator reran inside `npm run check`; unit, audit and agent-file tests pass. Preview/example/contract copy fixed where the browser suite disagreed. No separate row-by-row matrix audit of all 81 items. |
| SYX-R03 Automated verification | **Partly verified** | `npm run check` passes. Full browser suite ran once with failures; failures were fixed and only the touched specs were re-run. The full suite has **not** been re-run green. |
| SYX-R04 Consumer regression | **Partly verified** | Clean packed consumer only. No opt-in glass consumer beyond the nested glass dialog, and Naazhi was not touched. |
| SYX-R05 Human review | **Not performed** | Needs people. Nothing here claims keyboard, screen-reader, 200% zoom or visual review. |
| SYX-R06 Release decision | **Not approved** | Required evidence is missing (see "Blocking"). |

## SYX-R03 — automated results

- `npm run check` (typecheck, component audit, lint, unit, build): exit 0. Unit: 51 files, **892 tests passed**.
- Full browser suite, first run: **314 tests, 307 passed, 7 failed** (6.8 min).
- Fixes after that run:
  - Preview and demo copy "Accessible by default" tripped the content-claims rule; reworded to "Keyboard friendly" in previews, demos, the FeatureBento contract example and the `CardSwap` preview. The fixture copy in `ControlsFixture.tsx` was left alone because that page is not a rendered public page.
  - Hero previews and the demo rendered a second `h1` on component pages; they now use `level={2}`.
  - Tests used non-unique selectors: `p[role="status"]` (x2-controls, now a `menu-status` test id) and `/Dialog/` (ai-context, now `/^Dialog\b/`).
  - Timing: the RotatingWord assertion now polls past the fade, and the content-claims maturity test got a 300 s timeout (it visits every component page).
- Re-run of the failing group: 78 tests, 77 passed, 1 failed (the `/Dialog/` selector in the `uncheck` call). Fixed.
- Final run of the six touched specs (`x2-controls`, `x4-effects`, `x5-sections`, `content-claims`, `components-catalog`, `ai-context`): **77 passed** (1.8 min).
- **Not done:** a full re-run of all 314 browser tests after the fixes; blur scroll/paint performance (`npm run perf`); a dedicated no-blur/opaque and 320px pass beyond what the existing specs cover; the full listing and auth-demo journeys in the workspace app.
- Side effect: the full run regenerated `docs/evidence/M7/a11y-audit-results.md`. It now lists one more moderate finding, `landmark-unique`: the Navbar's default label "Main" repeats on `/layouts` (4 occurrences, 2 states). Zero serious or critical findings.

## SYX-R01 / R04 — packed consumer

Method: exported and packed the artifact (`seeyesyes-ui-0.1.0-src.65f0b46.dirty.*.tgz`, built from a dirty tree, so it is not a release artifact), installed it into a scratch Next 16.4.6 app in `/tmp` with the declared peers, built it, and drove it with Playwright.

Observed:
- Install and `next build` succeed. Tokens load. Appearance changes to dark and survives a reload; the saved appearance was already on the root element at the first readystate event.
- `/listing` and `/sign-in` return 200. The listing shows 6 course cards. Submitting an empty sign-in form shows "Enter your email address."
- **Peer finding:** with the default install, a dialog opened inside a nested light `ThemeScope` rendered in the dark root scope, not in the nested one, and the glass blur was `blur(0px)`. After forcing one copy of `react-aria` (npm `overrides`), the same dialog rendered inside the nested scope with `blur(20px) saturate(1.4)`. My reading is that two copies of `react-aria` gave `@react-aria/overlays` and `react-aria-components` separate portal contexts. I did not isolate the cause beyond that before/after difference, and I did not capture the tree from before the override.
- **Console 404s (explained):** they were Next link prefetches (`/forgot?_rsc=…`, `/sign-up?_rsc=…`) from the sign-in template's links. The scratch consumer only defines `/`, `/listing` and `/sign-in`, so these come from my fixture, not the package. Integrators must provide those routes or pass their own hrefs.

### Follow-up: single portal context (fixed in source, verified in a packed consumer)

- Change: `ThemeScope` and the generated contract probe now import `UNSAFE_PortalProvider` from `react-aria/PortalProvider`, and the artifact declares the peer `react-aria` instead of `@react-aria/overlays`. `react-aria-components` resolves the same `react-aria` copy, so one portal context is shared. The `@react-aria/overlays` dependency was removed from the source `package.json`.
- Verification: `npm run generate` and `npm run check` passed (EXIT=0). A tarball from the committed tree (`…src.033883b`, `workingTreeClean: true`) was installed with `npm ci` and **no overrides**. There is one `react-aria` copy in `node_modules`, and the dialog opened in the nested scope renders inside `div#nested[scope][light]`, not the dark root scope.
- Glass check on the fixed build: an ancestor of the dialog inside the nested scope computes `backdrop-filter: blur(20px) saturate(1.4)`, as in the override run.
- Not verified: the full 314-test browser suite after this change.

Not done: a missing-peer failure test, an SSR hydration-mismatch check, an opt-in glass consumer, the Naazhi package workflow, and a rerun of the packed consumer on a clean (committed) tree.

## Blocking release

1. SYX-001 (visual gate) and SYX-004 (packed-consumer check) remain open in X1. The packed run above is evidence for SYX-004 but does not tick it: the artifact came from a dirty tree and the 404 console errors are unexplained.
2. ~~`react-aria` duplication~~ Fixed in source (see follow-up above). Still needs the full browser suite and the glass-blur check on the fixed build.
3. Human visual, keyboard, screen-reader and 200% zoom reviews for X1–X7 are all pending.
4. Full browser suite re-run, performance run, and a Node 22/24 run are pending.
5. Original M7 human reviews, evaluation and MCP gates remain open as recorded in the main plan.

**Release decision: not approved.** The artifact may be labelled experimental only.

## Full browser run after the `react-aria` peer change

- Command: full Playwright suite against the production build (310 tests listed).
- Result: **306 passed, 4 failed** (6.3 min).
- Failing tests, all of them timeouts waiting for an element under parallel load:
  - `component-controls.spec.ts:50` (component preview not found)
  - `content-claims.spec.ts:40` (header not found)
  - `x3-panels.spec.ts:172` (alertdialog not found)
  - `views.spec.ts:68` (still on `/system/rules` instead of `/`)
- Re-run of those four on their own with 2 workers: **4 passed** (40 s).
- Reading: these look like load-sensitive timing, not product regressions. They are not proven flaky, because I have not reproduced the failure a second time under load. Treat as open flake work, not as a pass of the full suite.
- Still not run: `npm run perf`, missing-peer check, SSR check, opt-in glass consumer, Naazhi workflow, Node 22/24 run.

## Performance run (`npm run perf`) on the post-peer-change build

- Two runs, Lighthouse mobile, 3 runs per route (median). Both exited 1 because at least one route missed a target. The tracked report `docs/evidence/M7/performance.md` now holds the second run. Previously committed (M7) results met every target.
- Run 1: Theme `/system/theme` LCP 2.56 s (target 2.50 s). The other three routes met targets.
- Run 2: Theme LCP 2.56 s again; Components `/components` LCP 2.84 s (performance 94). Overview and AI Context met targets.
- Interaction traces: 0 long tasks in both runs. Cumulative layout shift stayed within the 0.1 target.
- **Conditions were noisy.** The machine had a load average of 17 at the start of run 1 (the IDE, Podcasts and other processes were active). The Components miss appeared in only one of two runs, so it is likely noise. The Theme miss appeared in both runs, so I treat it as real until it passes on a quiet machine.
- **Script transfer is higher than the M7 baseline** (Overview 302 → 413 KB, Components 221 → 260 KB, AI Context 301 → 411 KB). The 81-component expansion (X2–X7) landed after that baseline, so that may explain it. I have not bisected it, and I did not test whether the `react-aria` import change contributed.
- Status: **performance gate not met.** It needs a rerun on an idle machine and a look at the Theme route's LCP and the script growth.

## Script-growth bisect attempt (inconclusive)

- Built a scratch worktree of an earlier commit in `/tmp`, patched its two `@react-aria/overlays` imports to `react-aria/PortalProvider` so it would build against the current `node_modules`, and ran `scripts/perf.mjs` there. The worktree is deleted; the exact base commit was not recorded here, so this cannot be reproduced from this note.
- Result (load average 20–36 during the run, so LCP is unreliable): script transfer Overview 302 KB, Theme 216 KB, Components 221 KB, AI Context 300 KB. These match the M7 baseline and are well below the current build (413 / ~260 / 411 KB for Overview / Components / AI Context).
- LCP in that run: Theme 2.41 s (met), AI Context 2.84 s (missed), Components 2.11 s. AI Context missed here but not on the current build, which shows how much the LCP numbers move with machine load.
- Reading: the transfer growth is not caused by the import change itself, because the scratch build had it. It comes from something in the commits between that base and HEAD. It is not yet located.
- Status unchanged: performance gate not met. Next step is a per-commit bisect of script transfer (cheap: build + `next start` + sum JS bytes, no Lighthouse), then an LCP rerun on an idle machine.
- Reverted the tracked `docs/evidence/M7/performance.*` files to their committed state; they had been overwritten by a noisy run.

## Script-growth bisect (base `b54eacd` + react-aria import patch vs HEAD)

Both builds were run with `next start` and a headless request counter (JS decoded KB per route, load avg 14-24 so only sizes are used, not LCP).

| Route | Base decoded KB | HEAD decoded KB | Base transfer KB | HEAD transfer KB |
| --- | --- | --- | --- | --- |
| `/` | 540 | 546 | 162 | 165 |
| `/system/theme` | 691 | 703 | 211 | 216 |
| `/components` | 541 | 547 | 163 | 165 |
| `/ai/context` | 536 | 542 | 161 | 163 |

The static chunk sizes differ by only ~6-12 KB, so the build did not grow materially. The larger numbers seen in the perf runs came from the request counter picking up two extra lazy chunks on `/` at HEAD (~215 KB and ~176 KB gzip), which contain the X2-X7 previews (CardSwap, Carousel, CohortCard, Combobox, CourseCard, FeatureBento, Hero, InputOtp, Testimonials). `/` loaded 17 scripts at base and 20 at HEAD (984 KB vs 1386 KB decoded). That is expected growth from adding the X2-X7 components to the example previews, loaded on demand through `LazyPreview`. Not a regression from the react-aria import change.

Theme route: transfer grew only ~5 KB, so bundle size does not explain the repeated Theme LCP of 2.56s. That miss remains unexplained and unfixed. Needs an idle-machine perf run and an LCP-element trace on `/system/theme`.

Caveat: the base build was a scratch worktree (removed) with its node_modules copied from HEAD and `@react-aria/overlays` imports patched to `react-aria/PortalProvider`. Base commit is `b54eacd`.

## Navbar labels and `landmark-unique` recheck

- The Navbar default stays `Main`. Each template example on `/layouts` now passes its own `navLabel` (and footer label) through `SiteConfig`: "Site shell navigation", "Landing page navigation", "Course listing navigation", "Events listing navigation". A unit test checks both the custom label and the `Main` default; a browser test checks the labels on `/layouts` are unique.
- Recheck: the targeted browser run (`browser-navlabel.log`, 16 passed, including the full axe audit) regenerated `docs/evidence/M7/a11y-audit-results.md`: 0 serious or critical findings, and the only lesser finding is the pre-existing `region` (tooltip overlay container). `landmark-unique` no longer appears.
- `npm run check` after these changes: exit 0 (`check-final2.log`).

## Missing-peer, SSR and consumer follow-up

Recorded in `docs/evidence/expansion/X1/SYX-004/review.md` (packed from clean `1aebef0`, no overrides): styles, saved appearance, no-flash reload, nested-theme glass dialog, blocked and corrupt storage, no console errors, and a missing-peer build failure. SYX-004 stays open: no Node 24 run was possible (the installed `node@24` fails with a missing `libsimdjson`), and the exact peer pins need sign-off.
Still not done for X8: full browser re-run, idle-machine `npm run perf` and the Theme LCP, opt-in glass consumer, Naazhi workflow, row-by-row audit of 81 items, human reviews (R05).
