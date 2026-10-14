# M6.2 Playground

Date: 2026-10-14

`/playground` lets people try theme settings, components, variants, and states together, labeled "Playground only" throughout.

- **Isolated session state:** a new `playground` store holds overrides (density, radius, shadows, surface effect, motion, type scale) and an appearance choice. The preview theme is the applied theme with those overrides layered on (`playgroundTheme`, a pure function that never mutates the applied theme), so it starts from your applied settings and follows later Apply changes for anything not overridden. It never writes the applied settings, the Theme draft, or storage (the test compares storage before and after), survives client-side navigation within the session, and is gone after refresh.
- **Reset to applied theme** clears every override and the appearance choice, with a status message; it is disabled when nothing differs.
- **Component, variant, and state controls** reuse the M4.4 demos: pick any of the 29 components, set its variants and forced states, and see the real component with matching, copyable code. The initial selection follows the effective defaults under the Playground theme, and disallowed combinations are disabled with the contract's reason.
- **Own scope and portals:** the preview is a nested `ThemeScope` (`#playground-preview`). Dialog, Dropdown Menu, and Tooltip portal into it and inherit its settings (for example a curvy radius) while the workspace stays unchanged.
- It does not depend on a network request, so Reset never fails. The Overview sidebar links here.

Verification: `npm run check` passed (285 unit tests, 4 new for `playgroundTheme` and the store's isolation). All 135 production browser tests passed, including 6 new Playground journeys (starts from applied, changes only its preview, resets, and leaves storage untouched; navigation survival, refresh reset, and no draft leakage; following the applied theme; component, variant, and state controls with code; overlay portal isolation for Dialog, Menu, and Tooltip; narrow and wide fit in both appearances with no serious axe findings). Human screen-reader and WCAG review remain open.

M6.2 is complete. Next: M6.3 Getting Started.
