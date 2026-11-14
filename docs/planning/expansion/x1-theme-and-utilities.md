# X1 — Theme and utilities

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: A — Foundations and controls. Dependencies: None; reuse the current package and theme work.

- [ ] **SYX-001 — Theme.** Plan the glass surface mode through the existing theme system: tint/opacity, blur, border highlight, elevation and scrim tokens with light/dark values. Validate the direction on a representative shell, Card, toolbar and Dialog before broad implementation. Retain density/radius, font allowlist and motion scales; see the shared visual direction for migration and fallback requirements.
  - Implemented, not closed: `glass` surface, seven tokens, `glass` preset, resolver 1.2, Card/Dialog/drawer opt-in, opaque fallbacks, automated checks pass. Open: the human visual gate and blur performance measurement. [Evidence](../../evidence/expansion/X1/SYX-001/review.md)
- [x] **SYX-002 — Utils.** Provide cn() for optional class names using the CSS Modules convention; document that it does not resolve conflicting Tailwind utilities. Do not introduce Tailwind or a class-merging dependency for this helper.
  - Done: `lib/utils/cn.ts`, exported from the artifact, unit-tested. [Evidence](../../evidence/expansion/X1/SYX-002/review.md)
- [x] **SYX-003 — Backdrop.** Provide a layered, token-driven background that makes translucent surfaces visible without competing with content. Support content-safe fading and a restrained static fallback; keep decoration hidden from assistive technology.
  - Done with automated checks only: contract, example, preview, demo and browser tests. No screenshot or human review. [Evidence](../../evidence/expansion/X1/SYX-003/review.md)
- [x] **SYX-004 — Theme provider.** Reuse ThemeScope and the existing persistence/bootstrap logic; expose consumer setup with no-flash initialization, nested scopes, storage failure recovery and portal inheritance.
  - Checked on automated evidence only. Packed consumers from clean revisions (`1aebef0` on Node 25.6.1, `23f3bb7` on Node 24.22.3), declared peers and no overrides, passed styles, saved appearance, no-flash reload, nested-theme dialog, storage-failure and missing-peer checks; the artifact README documents setup. Open observations: on a first visit with dark system appearance, `data-appearance` and `color-scheme` are set after first contentful paint (background was already dark); the exact `react-aria` pins are the author's choice to revisit. No human review. [Evidence](../../evidence/expansion/X1/SYX-004/review.md)
- [x] **SYX-005 — Theme switcher.** Provide a reusable switcher with one stable accessible label and an exposed current state, connected to the same appearance store; preserve light/dark/system support.
  - Done with automated checks; pending/error states and the no-provider state lack dedicated tests. Not human-reviewed. [Evidence](../../evidence/expansion/X1/SYX-005/review.md)

## Variation matrix

Planned scope, not implemented API claims. **I** = default, hover, focus-visible, pressed where actionable, and disabled. Sizes use existing tokens; medium is a control size, not a page width. Every glass surface also covers light/dark, opaque/no-blur fallback and reduced transparency. Motion variants cover reduced motion. Existing runtime defaults remain until an explicit compatible update; new defaults below are planned.

| Task / item | Variants / composition | Sizes | States | Default |
| --- | --- | --- | --- | --- |
| SYX-001 Theme | glass; clean/subtle-depth retained; light/dark/system | existing density/radius/type scales | draft, applied, reset, invalid, stale | glass for fresh expansion; system appearance; preserve saved themes |
| SYX-002 Utils | conditional class-name composition | N/A | empty, conditional, combined | omit false/empty classes; no utility-conflict merging |
| SYX-003 Backdrop | layered tint; faded edge; static fallback | fill container | glass, no-blur, reduced transparency | static layered tint; decorative |
| SYX-004 Theme provider | workspace; nested scope | container-owned | bootstrap, hydrated, storage failure, stale/conflict | inherit valid saved settings; isolated portals |
| SYX-005 Theme switcher | icon with stable label; labeled control | small/medium/large | I; light/dark/system; pending, save error | medium; current preference; stable accessible name |

**Variation gate:** each supported variant and relevant state has a documented example or test. Check boundary sizes and meaningful combinations; do not create every possible cross-product. Semantic tones, accessible names and destructive behavior cannot be changed by a global cosmetic default.

**Milestone gate:** A packed consumer can load styles, change appearance, reload without a flash, and open an overlay inside a nested theme. Saved settings and existing consumer presets remain intact. The new expansion default and glass fallback pass the shared visual checks.
