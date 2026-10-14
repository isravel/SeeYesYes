# M5.1 AI Context screen

Date: 2026-10-14

`/ai/context` builds overview, task, and full context locally from the registry and the applied settings, using the existing pure `createContext`. No model is called and nothing leaves the browser.

- **Modes:** Overview is selected first. Task has searchable component selection (name or purpose), with Clear search, and shows the requested components, the dependencies included automatically, and the components that are referenced only (catalog entries, not full contracts) with an explanation. Counts of components, tokens, rules, and examples come from `contextCounts` and match the JSON exactly. Full includes the complete registry. Task with nothing selected shows an empty state instead of an export, and a reference-resolution error would be shown in an alert (the error path is covered by unit tests, since the seeded registry resolves).
- **Labels:** schema version, mode, scope, theme ID (with the base preset when custom), and appearance are shown above the views.
- **Three views of one object:** Human, JSON, and Markdown tabs are built from the same context. The Human view lists identity, principles, project guidance, and the catalog or the selection's components, tokens, rules, and examples.
- **Markdown is now genuinely readable** (it previously wrapped the JSON in a code fence): `contextMarkdown` writes structured sections for principles, project guidance, theme and both color maps, selection, each component with import, effective defaults, variants, props table, accessibility, prohibited use, composition, and AI guidance, a token table with light and dark values, rules, examples with code, referenced components, and, for full, layouts, fonts, and presets. The JSON remains the exact structured payload. One existing test that read JSON out of the Markdown was updated to check determinism instead.
- **Data flow:** the registry loads through the adapter with the standard loading state, error with Retry, and a missing-data error with Retry for the empty scenario. The Overview sidebar links here.

Not in this task (M5.2): copy and download, `WorkspaceSettings` download, byte counts, and the `/llms.txt` links.

Verification: `npm run check` passed (210 unit tests, 10 new for Markdown/JSON agreement across all modes, both-mode token values, appearance and applied-theme changes, counts, stable ordering, and empty/unknown selection errors). All 80 production browser tests passed, including 5 new AI Context journeys: overview with labels and catalog agreement across Human, JSON, and Markdown; task selection with requested, included, and referenced-only lists and matching counts; full mode counts; exports following an applied theme, applied Button default, and appearance while ignoring an unapplied draft; and error/missing-data Retry plus 320px and 1280px fit with no serious axe findings. Human screen-reader and WCAG review remain open.

M5.1 is complete. Next: M5.2 copy and download with failure feedback, settings download, byte counts, and empty-selection handling.
