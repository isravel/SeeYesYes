# M5.7 Overview with calculated coverage and demo health

Date: 2026-10-14

The Overview's old milestone-era counters and copy were replaced.

- **System coverage** is calculated from the registry (`lib/contract/coverage.ts`): components, metadata-complete (N of M, via the readiness checklist), accessibility reviewed (N of M, counted only with linked evidence; currently 0 of 29), resolved tokens, rules, examples, interactive components, and the default preset. The section says metadata-complete does not mean reviewed or agent-tested.
- **Demo health** is a separate client panel loading `/api/validation`, with a "Demo results" label and the statement that it is fixture data, not a measurement, and is never combined with coverage. It shows per-sample counts (passed, info, warning, error) for clean, mixed, and failing, and links to Validation. It has its own loading state, error with Retry, and "No demo results" empty state, and its failure leaves the rest of the page working. No combined score exists anywhere on the page (asserted).
- Hero and closing links now point to the real screens (Theme, Components, AI context, Tokens, Rules, Accessibility, Validation). The Getting Started link arrives with that screen in M6.
- The page reads `?scenario=` so the panel's empty and error states can be shown in production.

Verification: `npm run check` passed (233 unit tests, 2 new for calculated coverage and its sensitivity to missing metadata and unevidenced reviews). All 115 production browser tests passed, including 3 new Overview journeys (coverage numbers equal the registry and stay apart from demo results; the panel fails and recovers independently and shows its empty state; links lead to real routes, with no serious axe findings). Human screen-reader and WCAG review remain open.

M5.7 is complete. Next: M5.8 tests for export completeness, size comparison, and agreement.
