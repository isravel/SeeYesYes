# M4.3 Component Detail template

Date: 2026-10-13

`/components/[component]` is one shared template for all 29 components. It is a data-driven view: the primary request is `/api/components/:id`, and the registry loads as a dependent secondary request only after the primary succeeds, for linked examples and components. It shows a loading state, an error state with Retry for each request, and Retry for the empty (missing-data) scenario. Unknown component IDs return a real 404 in every scenario and show the not-found view (new `app/not-found.tsx`) with a link back to the catalog.

Sections, all rendered from the contract: overview (verified public import, element and meaning, interactivity), live preview (the recommended example's real preview), variants and compound variants (with "Not allowed" shown for disallowed combinations), documented states, anatomy, props table (type or allowed values, default, required, description), recommended use (shared example code), prohibited use (list plus violation examples as code and explanation only), accessibility (honest review status, requirements, keyboard table for interactive components, evidence link only when reviewed), tokens (linked to the Tokens screen), composition (linked partner components and constraints), AI guidance (prefer/avoid), and the per-check metadata readiness list. Effective defaults under the applied theme appear beside the contract defaults only when they differ. Catalog cards now link to their detail page.

Left for later tasks: variant and state controls driving the preview (M4.4), the structured contract view with Copy and the usage-boundary and rule-link polish (M4.5), "Copy for LLM" (needs the M5 task export), and the full loading/error pass (M4.6).

Verification: `npm run check` passed (152 unit tests). All 47 production browser tests passed, including a check that every one of the 29 components renders all 13 sections, a props table, a keyboard table when interactive, and a "Not reviewed" label; contract content for Button including import, props, token links, and violation explanation; the catalog to detail to breadcrumb round trip; 404 in all three scenarios and Retry in error and empty; 320px and 1280px fit in both appearances for Button, Table, and Dialog; and the effective-default note appearing only after Apply. Human screen-reader and WCAG review remain open.

M4.3 is complete. Next: M4.4 variant and state controls wired to real components and matching examples.
