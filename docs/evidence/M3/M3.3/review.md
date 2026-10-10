# M3.3 theme controls

Date: 2026-10-10

Extended `/system/theme` with draft controls for the registry's allowlisted sans and monospace fonts, type scale, corner shape, density, shadow scale, clean/subtle-depth surface effect, and motion. Component variant and size controls are generated from each component contract's `themeDefaults`, so unsupported values are not offered. Changes update the draft, and the scoped Button preview reflects its selected defaults.

The controls use the existing shared theme scales and remain local to the draft. Apply, Discard, Reset draft, unsaved state, session navigation, and refresh behavior remain for M3.5. A multi-component preview and portal isolation remain for M3.4; contrast and gamut feedback remain for M3.6.

Verification: `npm run check` passed, including registry/component audit, lint, 102 unit tests, and production build. All 23 production browser tests passed. The new browser journey checks shared controls, contract-derived Button variants, live preview updates, and no horizontal overflow at 320px. Screenshot: [Theme controls](theme-controls.png).

Next: M3.4 is scoped multi-component preview and portal isolation; use GPT-6.1 Sol at Medium. Switch back from Luna before starting M3.4.
