# M4.1 Tokens screen

Date: 2026-10-13

`/system/tokens` lists every registry token resolved against the applied theme (`resolveTokens` over the applied-theme store), so values change after Apply and not while a draft is being edited. It shows the applied theme ID, and "custom, based on …" for an edited theme.

- **Filters:** search over ID, CSS variable, category, and purpose (all terms required, case-insensitive), plus category and primitive/semantic kind filters. A live count ("N of M tokens"), a no-match empty state, and Clear filters are included. The logic is the pure `lib/tokens/browse.ts`.
- **Each token:** ID, category and kind badges, purpose, resolved value with a color swatch for colors, CSS variable, and the components (from their `tokenIds`) and examples that use it.
- **Mode-dependent tokens** show light and dark values and mark the mode currently in effect, following the workspace scope, including OS changes under `system` appearance.
- **Copy:** value (per mode for paired tokens) and CSS variable, using the shared copy-feedback pattern with success and failure messages.
- **Navigation:** Overview sidebar now links Theme and Tokens. Navigation links and breadcrumbs navigate client-side for page routes (hash links and API routes stay plain anchors), so an open Theme draft survives moving between pages, as the lifecycle spec requires.

Not in this task: usage guidance beyond the registry's purpose, used-by, and examples (the contract has no separate guidance field), and the Design Tokens download and exclusion notes (M4.8).

Verification: `npm run check` passed (145 unit tests, 4 new for filters and usage derivation). All 38 production browser tests passed, including two new Tokens journeys: filters, no-match recovery, copy value and variable, both-mode display with the in-effect marker moving on an OS change, and applied-versus-draft values with the draft surviving client-side navigation. Human screen-reader and WCAG review remain open.

M4.1 is complete. Next: M4.2 Components catalog.
