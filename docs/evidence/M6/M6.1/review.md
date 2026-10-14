# M6.1 Layouts

Date: 2026-10-14

`/layouts` shows the seven required demo compositions: page shell, dashboard, split view, detail view, settings, dense data, and marketing/product. They are registered in the registry (`lib/data/layout-contracts.ts`, so they appear in full exports and `/llms.txt`), built only from existing primitives (Button, Card, Badge, Avatar, Link, Progress, Alert, Tabs, Table, FormField, Input, Select, Switch, Separator), and not business features.

- **Data flow:** a data-driven view. `/api/layouts` loads first, and the registry loads as a dependent secondary request only when at least one layout exists, to name the components each layout uses (linked to their detail pages). It has the standard loading, error with Retry, and empty states, and a secondary-request failure leaves the layouts visible with its own Retry.
- **Isolation:** each preview sits in its own nested `ThemeScope` with its own density and appearance controls, so switching one preview changes neither the other previews nor the workspace (the test compares computed variables).
- **Density:** previews use the density-driven semantic spacing tokens (stack, inline, section), so Compact, Comfortable, and Spacious visibly change spacing.
- **Responsive:** layouts use container queries, so they adapt to the width of their own preview as well as the viewport; split panes and sidebars stack when narrow.
- **Local behavior only:** the split view selects a person, settings Save says "Saved in this preview only. Nothing is stored.", dense data filters by search and status with a live count and a no-match message, and the detail view's tabs switch. The test confirms nothing is written to storage.
- Layouts also join the Overview sidebar, `/llms.txt`, and the shared data-state suite.

Verification: `npm run check` passed (281 unit tests, 2 new for the seven required layouts and their component references). All 129 production browser tests passed, including 5 new Layouts journeys (all seven render with scopes and component links; density and appearance isolation; the interactive layouts and their no-storage promise; 320, 768, and 1280px fit in both appearances plus stacking at narrow widths; no serious axe findings in compact and spacious density). Human screen-reader and WCAG review remain open.

M6.1 is complete. Next: M6.2 Playground.
