# X7 — Complete page templates

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: D — Templates and release. Dependencies: X5–X6; auth templates require X1–X3 rather than marketing effects.

- [ ] **SYX-051 — Page shell.** Compose optional Backdrop, Navbar, a system-sized content column and Footer; keep route/link configuration in one consumer-owned source.
- [ ] **SYX-052 — Landing page.** Provide a configurable example composed from hero, stats, cohorts/courses, features, testimonials and CTA sections; no copied site order or copy is required.
- [ ] **SYX-053 — Listing page.** Deliver a complete course-listing example with head, search/filter/sort toolbar, grid/list cards and pagination.
- [ ] **SYX-054 — Events page.** Deliver a poster-listing example with heading, count and responsive two-column desktop layout.
- [ ] **SYX-055 — Auth shell.** Provide a centered glass auth panel over the shared layered backdrop, labeled fields, password visibility, provider buttons and error/status regions using shared controls.
- [ ] **SYX-056 — Sign in page.** Provide email/password entry, Google/GitHub integration callbacks, forgot-password and sign-up links, validation and pending/failure states.
- [ ] **SYX-057 — Sign up page.** Provide name/email/password fields, a baseline eight-character minimum, provider callbacks and terms links; consumers can enforce stronger server policy.
- [ ] **SYX-058 — Forgot password page.** Provide reset-request and neutral check-inbox states that do not reveal account existence, plus retry feedback that does not expose account details.

## Variation matrix

Planned scope, not implemented API claims. **I** = default, hover, focus-visible, pressed where actionable, and disabled. Sizes use existing tokens; medium is a control size, not a page width. Every glass surface also covers light/dark, opaque/no-blur fallback and reduced transparency. Motion variants cover reduced motion. Existing runtime defaults remain until an explicit compatible update; new defaults below are planned.

| Task / item | Variants / composition | Sizes | States | Default |
| --- | --- | --- | --- | --- |
| SYX-051 Page shell | marketing shell; contained workspace composition | system max-width; responsive gutter | navigation open/closed; scrolled; fallback | glass navigation/panels; static layered backdrop; consumer links |
| SYX-052 Landing page | configurable section composition | responsive page | section media fallbacks; action I | hero→stats→features→CTA baseline; optional content sections omitted |
| SYX-053 Listing page | grid/list course listing | responsive page; density-driven | loading, results, no matches, empty, failure/retry | Listing defaults; visible search/sort/view controls |
| SYX-054 Events page | poster listing | 1 column narrow; 2 columns desktop | loading, populated, empty, failure/retry | source order; count derived from supplied results |
| SYX-055 Auth shell | centered auth panel; optional identity/provider slots | responsive constrained panel | form valid/invalid; pending, error; password visible/hidden | glass panel; password hidden; supplied provider buttons only |
| SYX-056 Sign in page | email/password; optional Google/GitHub actions | Auth shell; controls inherit size | empty, invalid, pending, failed, success redirect | empty fields; password hidden; no automatic submission |
| SYX-057 Sign up page | name/email/password; optional Google/GitHub actions | Auth shell; controls inherit size | empty, invalid, pending, failed, success | 8-character baseline minimum; optional stronger consumer policy; password hidden |
| SYX-058 Forgot password page | reset request; neutral inbox confirmation | Auth shell; controls inherit size | empty, invalid, pending, sent, retryable failure | request screen; empty email; non-disclosing response |

**Variation gate:** each supported variant and relevant state has a documented example or test. Check boundary sizes and meaningful combinations; do not create every possible cross-product. Semantic tones, accessible names and destructive behavior cannot be changed by a global cosmetic default.

**Milestone gate:** Templates apply the shared glass direction and fallback. Templates have complete navigation and honest demo states. Real account creation, OAuth, email delivery and account enumeration protections are consumer backend responsibilities, documented at integration points.
