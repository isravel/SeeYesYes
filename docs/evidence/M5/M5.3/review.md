# M5.3 Rules screen

Date: 2026-10-14

`/system/rules` is a data-driven view: the rules list loads from `/api/rules`, and the registry loads as a dependent secondary request only after the list succeeds with at least one rule, to supply examples and component names. It has the standard loading state, error with Retry, empty state with a next action, and a no-match state with Clear filters. If only the registry request fails, the rule list stays visible with "Examples did not load" and a Retry.

Each rule shows its ID, severity and category, description, applicability (the whole system, or links to the affected components), the referenced violation example and corrected example as focusable code blocks, the violation's explanation, a copyable suggested fix, and "Auto-fix unavailable in Phase 1." with the reason. Category and severity filters combine, with a live count. The page says rules do not inspect code and no fix edits a project. Component Detail's rule entries now link here (`/system/rules#<id>`), and the Overview sidebar links to Rules.

Verification: `npm run check` passed (216 unit tests, 3 new; lint clean). All 95 production browser tests passed, including 4 new Rules journeys (all 8 rules with their registry examples and links, filter combinations and recovery, the Component Detail link, and the dependent registry request failing and recovering), and Rules and AI Context were added to the shared loading/error/empty state suite. Human screen-reader and WCAG review remain open.

M5.3 is complete. Next: M5.4 validation scenarios.
