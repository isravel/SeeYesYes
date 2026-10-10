# M3.1 theme state and persistence foundation

Date: 2026-10-10

Added client-side default, applied, and draft stores. Workspace appearance remains on applied settings and is not part of the draft. Versioned settings are parsed and checked against the registry before use. The persisted envelope includes a resolver-versioned cache with shared variables and independent light/dark maps.

The inline head bootstrap checks envelope/cache/resolver versions, revision agreement, variable names, and a bounded CSS value allowlist before setting root variables. It resolves `system` appearance from the current OS preference on every visit. The workspace ThemeScope waits for client settings initialization before writing its own variables, leaving validated bootstrap styles in place through hydration. Invalid cache data is ignored while valid settings are retained. Invalid settings use defaults with a notice; blocked reads enter session-only mode with a refresh warning.

Verification covers runtime schema validation, resolver output against the bootstrap allowlist, stale and unsafe cache fallback, invalid font rejection, session-only mode, and versioned persistence. The production browser check seeds saved dark settings while emulating a light OS preference and confirms the selected dark theme variables appear before hydration.

Checks: `npm run check` passed (102 unit tests, component audit, lint, and production build). The complete production browser suite passed all 21 checks, including the pre-hydration bootstrap journey.

M3.1 is complete. Theme editing controls, apply/discard flows, contrast warnings, Web Locks, cross-tab sync, and the full lifecycle race matrix remain in M3.2–M3.8.
