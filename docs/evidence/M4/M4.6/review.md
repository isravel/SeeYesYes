# M4.6 Loading, empty, error/retry, no-match, and unknown-component behavior

Date: 2026-10-14

**Tokens is now a data-driven view**, as the spec's table requires: the token list loads from `/api/tokens?scenario=…` through the shared adapter with TanStack Query. Fonts and usage links are static registry data passed from the server page, so it needs no secondary request. It reads `?scenario=normal|empty|error` like Components and Component Detail.

A new browser suite, `tests/browser/data-states.spec.ts`, exercises every state on the three data-driven screens (Tokens, Components, Component Detail) using real request interception:

- **Loading:** the first request is held, a status region named "Loading tokens/components/component" is visible with no serious or critical axe findings, then the content replaces it.
- **Error with Retry and recovery:** the first request fails with a 503, then separately with a network failure; the error and Retry are shown (clean axe), and one Retry click recovers to the real content. Request counts confirm exactly one retry.
- **Demo error scenario:** stays an error and keeps offering Retry.
- **Empty:** Tokens and Components show an empty state whose action leads back to the normal data. Component Detail's empty (missing-data) scenario is an error with Retry, never an empty list.
- **No match:** Tokens and Components searches with no hits show a no-match state with Clear filters, which restores the list.
- **Dependent request:** Component Detail's registry request is skipped when the component request fails, and its own failure shows "Linked data did not load" with Retry that recovers.
- **Unknown component:** a real 404 with a recovery link in the normal, empty, and error scenarios (clean axe), and the API returns 404 for it in the error scenario.

No component code changed for the other two screens; the suite confirmed their behavior already matched the spec. Not covered here: states for the screens that do not exist yet (Rules, Layouts, Accessibility, Validation, AI Context); each gets the same suite as it is built.

Verification: `npm run check` passed (159 unit tests). All 71 production browser tests passed on repeated runs, including 22 new data-state tests. Human screen-reader and WCAG review remain open.

M4.6 is complete. Next: M4.7 verify every required component is metadata-complete and check keyboard interaction across the full inventory.
