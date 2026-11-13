# X8 — Package, documentation and release

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Status (2026-11-13): started, nothing checked. Partial results and blockers are in the [X8 evidence](../../evidence/expansion/X8/review.md): R01–R04 partly verified, R05 not performed, R06 not approved.

Phase: D — Templates and release. Runs incrementally with X1–X7; the final gate requires all required tasks and relevant reviews.

- [ ] **SYX-R01 — Package boundary.** Verify exports, styles, types, peer compatibility, install instructions and SSR/client boundaries. Keep workspace routes, demo-only data and consumer domain logic outside reusable exports. Verify a clean packed install without sibling source imports or copied private CSS.
- [ ] **SYX-R02 — Catalog and AI guidance.** Verify every applicable contract, variant, state, token reference, dependency, preview, public import, documentation entry and generated context agrees. Regenerate rather than manually patch generated outputs.
- [ ] **SYX-R03 — Automated verification.** Run npm run check, artifact export/inspection and relevant browser journeys. Verify the complete listing and auth-demo journeys, nested portal themes, storage recovery, glass compositing/contrast, no-blur and opaque fallbacks, blur-related scroll/paint performance, responsive layouts and motion alternatives; record actual outcomes.
- [ ] **SYX-R04 — Consumer regression.** Install the affected versioned artifact into a clean consumer and, when updating Naazhi, follow its existing package workflow and focused checks. Do not require Naazhi to adopt marketing or auth templates.
- [ ] **SYX-R05 — Human review.** Record actual keyboard, screen-reader, 200% browser zoom and visual review in both appearances, including busy backgrounds, overlay stacks and transparent/opaque rendering. Keep original M7 outstanding checks visible and link reusable evidence without claiming unperformed reviews.
- [ ] **SYX-R06 — Release decision.** Reconcile all 79 tasks, milestone gates, evidence and deferred issues. Record the reviewed artifact version, compatibility notes and explicit release decision. Publishing or deployment is a separate action.

## Variation coverage matrix

X8 adds no components or new cosmetic defaults. It verifies the matrices owned by X1–X7 without duplicating their inventories.

| Task | Variants / coverage | Sizes | States | Default / pass condition |
| --- | --- | --- | --- | --- |
| SYX-R01 Package boundary | public component variants, utility exports, templates, types and CSS | exported control sizes and responsive compositions | clean install; SSR/hydration; missing peer failure | packaged imports resolve; declared defaults match implementation |
| SYX-R02 Catalog and AI guidance | every matrix row; aliases and supported compounds | documented size tokens; N/A where not meaningful | relevant states and invalid combinations | same defaults in contract, preview, docs and AI context; aliases resolve to one implementation |
| SYX-R03 Automated verification | glass, clean/subtle-depth compatibility, opaque/no-blur rendering; light/dark/system | small/medium/large where supported; density/radius boundaries; 320px and desktop | interactive, form, overlay, loading, error, recovery; reduced preferences | exercise each variant and risk-relevant combination; preserve existing performance budgets |
| SYX-R04 Consumer regression | packed consumer; existing Naazhi preset; opt-in glass consumer | consumer layouts and supported control sizes | saved settings, migration, portal scope, fallback | no silent consumer/theme restyle; current callers still work |
| SYX-R05 Human review | representative glass surfaces and content/control combinations | mobile/desktop; actual 200% zoom | keyboard/focus, screen reader, composited contrast, stacked overlays, reduced transparency | record actual outcomes separately from automated checks |
| SYX-R06 Release decision | complete inventory and supported combinations | all declared sizes; explicit N/A entries | passed, failed, unverified and deferred evidence | release remains unapproved until required evidence and decision are recorded |

**Milestone gate:** all required scope has evidence; automated checks pass; required human reviews and release approval are recorded separately. An incomplete or unreviewed artifact can be labeled experimental, never presented as fully verified.
