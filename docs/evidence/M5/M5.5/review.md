# M5.5 Validation screen

Date: 2026-10-14

`/validation` shows the demo reports. It is a data-driven view (primary request `/api/validation`) with the standard loading state, error with Retry, and a "No demo reports" empty state whose action leads back to the normal data. Rules, examples, and component names are static registry data passed from the server page.

- A visible sample-report selector (Clean, Mixed, Failing; Mixed first) drives passed, info, warning, and error counts, which follow the selected report and not the filters. "Demo results" labels appear next to the heading, in the selector note, and in the details, and the page says the reports are fixture data, not a scan of any project.
- Status and category filters combine, with a live count, a no-match state, and Clear filters. A finding's category and severity come from its rule.
- Selecting a result (a real button, so Enter and Space work) opens details: message, rule (linked to its card on the Rules screen), the violating example for findings or the corrected example for passes as focusable code, the rule's explanation, and a copyable suggested fix with "Auto-fix unavailable in Phase 1." Switching reports clears the selection.
- No Run scan, Apply fix, repository picker, or upload action exists; the test asserts none is offered.
- The Overview sidebar links to Validation, and the shared data-state suite now covers it.

Verification: `npm run check` passed (226 unit tests, 4 new for categories, counts, filters, and unknown rules). All 103 production browser tests passed, including 4 new Validation journeys (scenario counts and labels with no scanner actions; filter combinations and recovery; details with copy for failing and passing results; keyboard operation, 320px and 1280px fit, and no serious axe findings) and the shared loading, error, and empty cases. Human screen-reader and WCAG review remain open.

M5.5 is complete. Next: M5.6 the Accessibility screen.
