# M4.2 Components catalog

Date: 2026-10-13

`/components` lists every component contract with a summary, search, and category filter.

- **Data flow:** a data-driven view. The client loads `/api/components?scenario=…` through the shared HTTP adapter with TanStack Query, and shows a loading state, an error state with Retry, an empty state with a next action (link to the normal catalog), and a no-match state with Clear filters. The page reads `?scenario=normal|empty|error` on the server, which is the production-testable scenario hook. Metadata readiness is computed on the server from the full registry and passed in, so the view needs no second request.
- **Counts come from contracts:** components, metadata-complete, accessibility reviewed, and stable, via `lib/components/catalog.ts`. Cards show purpose, category, maturity, accessibility review status, variant option count, state count, and whether the component is interactive. Unreviewed components are labeled "Not reviewed", and the summary says how many are unreviewed. Currently 0 are reviewed.
- **Metadata readiness** (`lib/contract/readiness.ts`) follows the contract checklist as six named checks: description, contract (props, states, tokens), guidance (prohibited use, prefer/avoid), accessibility (keyboard required only when interactive), a recommended example with a preview key, and resolving references. Incomplete cards list the failed checks. It states plainly that metadata-complete does not mean reviewed or agent-tested. Recommended preview keys are proven to resolve by the generated `verifiedPreviews` type check.
- **Navigation:** the Overview sidebar's Components link now goes to `/components`.

Not in this task: card links to Component Detail. That route arrives in M4.3, and linking to it now would produce a 404. The Components row in the data-driven table lists no secondary request, which matches this design.

Verification: `npm run check` passed (152 unit tests, 7 new for readiness failure cases and catalog derivation). All 41 production browser tests passed, including three new journeys: counts, filters, no-match recovery, and honest review labels; empty-scenario next action and error Retry; and 320px and 1280px fit in light and dark. Human screen-reader and WCAG review remain open.

M4.2 is complete. Next: M4.3 shared Component Detail template.
