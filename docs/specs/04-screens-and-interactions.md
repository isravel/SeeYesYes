# Screens and interactions

## Shared workspace

Use a desktop sidebar with direct destinations and groups. On mobile, use a compact header and keyboard-accessible navigation drawer. Active links, headings, breadcrumbs, and page titles must agree.

| Sidebar entry | Routes |
| --- | --- |
| Overview | `/` |
| Getting Started | `/getting-started` |
| System | Theme `/system/theme`, Tokens `/system/tokens`, Rules `/system/rules` |
| Components | Components `/components`, Component Detail `/components/[component]` |
| Product | Layouts `/layouts` |
| AI | AI Context `/ai/context` |
| Quality | Accessibility `/accessibility`, Validation `/validation` |
| Playground | `/playground` |
| Documentation | `/docs`, `/docs/[slug]` |

Breadcrumbs follow this grouping, not the URL path.

There is no login or account menu. A global appearance selector changes the workspace appearance preference through the shared settings writer and shows pending feedback while saving. In session-only mode it changes the preference locally. It does not touch an open Theme draft or its unsaved indicator; see [Theme lifecycle](02-architecture-and-theme.md#theme-lifecycle).

Every data-driven view must cover loading, request error with Retry, and empty results with a clear next action, as set out per view and scenario in [Server and client boundaries](02-architecture-and-theme.md#server-and-client-boundaries). Search/filter emptiness offers Clear filters. Copy actions report success or failure. Unknown component/document routes show a helpful not-found view.

## Routes and required behavior

### 1. Overview — `/`

Explain the human + AI concept, the shared contract, and the configure-once experience. Include Getting Started, Theme, Components, and AI Context links.

Component coverage and metadata readiness are calculated from the registry using the [metadata readiness](03-design-system-contract.md#metadata-readiness) checklist. System health and sample validation counts must carry a visible “Demo results” label. Do not combine fixture scores with measured implementation quality into one score.

### 2. Getting Started — `/getting-started`

Provide setup, theme configuration, component use, project integration, context export, and a working local example.

Before package publishing exists, document the actual repository setup and imports. Treat `@/components/ui/button` as a repository alias, not an installable package. Any future npm command belongs in a clearly labeled “Planned package workflow” section and must not be the main setup path.

All local snippets must match shipped files and APIs. Include the real development/build/check commands once the project exists. Link to a working settings layout example and explain how exported context can be supplied to an agent manually.

### 3. Theme — `/system/theme`

Group controls into Colors, Typography, Shape and Density, Shadows and Effects, Motion, Component Defaults, and Appearance.

Colors includes primary, secondary, accent, surfaces, text, muted, border, focus, destructive, success, warning, and information roles with their contrasting text roles. Offer light/dark editing, OKLCH values, the primitive palette, explicit palette suggestions, and contrast warnings for the [defined pairs](02-architecture-and-theme.md#contrast-pairs).

Typography offers only fonts from the registry allowlist. Component Defaults offers only each contract's `themeDefaults` values.

Appearance has two parts: a preview toggle (light/dark) that affects only this screen's preview, and the same workspace appearance selector as the header. The draft never stores appearance.

Show a live form, buttons, card, tabs, dialog, and table in one preview. The dialog must open inside the preview scope. Include Apply to workspace, Discard changes, Reset draft, and unsaved status. Show pending saves, preserve a draft rejected because another tab changed the theme, and let Discard load the latest applied settings. Explain session-only changes when persistent saving is unavailable. Use the exact lifecycle in [Architecture and theme behavior](02-architecture-and-theme.md).

### 4. Tokens — `/system/tokens`

Search by name or purpose and filter by category and primitive/semantic kind. Show ID, category, resolved value, semantic purpose, CSS variable, example, and usage guidance. Allow copy of value and variable. Offer “Download design tokens” for the light and dark [Design Tokens format files](03-design-system-contract.md#token-export-design-tokens-format), with a one-line note on which tools read them. List unsupported-token exclusions with reasons and offer export-notes JSON. Show errors for invalid supported values instead of downloading malformed files. Values follow the applied theme. Mode-dependent tokens show both light and dark values and mark the mode currently in effect.

### 5. Components — `/components`

Search by name/purpose and filter by category. Cards show purpose, maturity, variant count, accessibility review status, and whether the component is metadata-complete. Keep cards easy to scan. Counts come from contracts; unreviewed items must remain labeled unreviewed.

### 6. Component Detail — `/components/[component]`

Include overview, live preview, variants, relevant states, anatomy, props, recommended use, prohibited use, accessibility, tokens, composition, and AI guidance.

Variant and state controls must change a working preview. List compound variants with their descriptions. Controls disable a `disallowed` combination and explain why rather than render it. Show matching code from shared examples. Not every state applies to every component: document relevant states rather than invent loading/error behavior for all of them.

Show effective defaults under the applied theme next to contract defaults when they differ. Display the verified public import module and export name from the contract alongside code examples.

Provide human guidance, the metadata readiness checklist, and a structured contract view with Copy. Add a “Copy for LLM” action that copies this component's task-mode Markdown export under the applied theme. Display accessibility review status honestly and link to evidence when reviewed. Violation examples show code and explanation only; they have no live preview.

### 7. Layouts — `/layouts`

Build page shell, dashboard, split view, detail view, settings, dense-data, and marketing/product examples. Each must render existing primitives, adapt to viewport changes, and support preview density switching.

These are demo compositions, not business features. Save buttons can provide local feedback without implying remote persistence. Optional product components are not needed to complete these layouts.

### 8. AI Context — `/ai/context`

Offer Overview, Task, and Full context modes, with Overview selected initially. Overview shows system identity, principles, project guidance, appearance, and the discovery catalog. Task adds selected contracts and their required dependencies. Full shows the complete system.

In Task mode, provide searchable component selection, a requested-versus-included list, and counts of components, tokens, rules, and examples. Explain that referenced dependencies are included automatically, and list referenced-only components separately. Disable task export until at least one component is selected; show reference-resolution errors explicitly.

Human, JSON, and Markdown tabs represent the same selected mode and generated data. Copy and download JSON/Markdown as local files. Also offer a download of the applied `WorkspaceSettings` as JSON, and links to `/llms.txt` and `/llms-full.txt` with a note that they use the default theme.

Add an “Agent instructions” section with the [`AGENTS.md` snippet](03-design-system-contract.md#agent-readable-files-and-copy-for-llm), its size in bytes, Copy, and a short explanation of where to paste it. Getting Started links here from its context-export step. Display schema version, scope, theme ID (with its base preset when custom), and export size in bytes. Do not call byte or character counts token counts.

Generate context locally and deterministically. No AI inference, external integration, or separate hard-coded context fixture is needed.

### 9. Rules — `/system/rules`

Filter by category and severity. Show ID, description, applicability, example violation, corrected example, suggested fix, and “Auto-fix unavailable in Phase 1.” Link affected components. Rules do not inspect user code.

### 10. Accessibility — `/accessibility`

Separate three sections: component review evidence, live contrast for the applied theme, and sample validation results. Show keyboard expectations, focus behavior, reduced motion, and form semantics from contracts.

Label sample results clearly. A contrast calculation is a limited local check, not a complete audit. Do not claim conformance from fixture results or a single automated score.

### 11. Validation — `/validation`

Use a visible scenario selector with clean, mixed, and failing sample reports. Show passed, info, warning, and error counts. Categories are the six rule categories: component, token, accessibility, composition, styling, and performance. A finding takes its category from its rule. Filter by status and category; counts follow the selected scenario. The failing report includes at least one finding in every category.

Selecting a finding opens its message, rule, example, and suggested fix. Fix snippets can be copied. No Run scan, Apply fix, repository picker, or upload action should imply a real scanner. Use “Load demo report” if an explicit action is useful.

### 12. Playground — `/playground`

Experiment with theme, appearance, density, radius, required effects, component variants, and relevant states. Preview controls act locally. Show “Playground only” and Reset to applied theme.

Use the shared component map and token resolver. Avoid a second implementation of components or theme behavior.

### 13. Documentation — `/docs` and `/docs/[slug]`

Provide searchable concepts, components, tokens, rules, context, accessibility, setup, and configuration. Search article titles and text locally. Link results to real routes and headings. Include no-result and Clear search actions. Each article has a “Copy for LLM” action that copies its Markdown.

Write hand-written articles in Markdown so the page, search index, Copy for LLM, and `/llms-full.txt` all read the same source.

Component, token, and rule reference entries are short registry-generated summaries that link to the canonical Component Detail, Tokens, and Rules screens. Do not rebuild those screens inside Documentation. Keep hand-written concepts and setup articles separate from generated reference content. All code examples must match the shipped prototype.
