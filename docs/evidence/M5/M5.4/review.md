# M5.4 Validation scenarios

Date: 2026-10-14

The clean, mixed, and failing demo reports come from `demoReports`, derived from the registry's rules so every reference is real; they are labeled `source: "demo-fixture"`. This task adds the checks that keep them honest.

- `checkDemoReports` reports any finding whose rule, example, or component does not resolve, whose example intent does not match its status (violation example for findings, corrected example for passes), or whose status differs from its rule's severity.
- Documented counts are pinned per scenario: clean has 8 passed; mixed has 4 passed, 2 warnings, and 2 errors; failing has 1 info, 4 warnings, and 3 errors. Only the failing report has a finding in all six rule categories, as the spec requires.
- `/api/validation` serves exactly these reports, is empty in the `empty` scenario and a 503 error in the `error` scenario.

Verification: `npm run check` passed with 6 new unit tests covering references, counts, categories, broken-reference detection, and the endpoint.

M5.4 is complete. Next: M5.5 the Validation screen.
