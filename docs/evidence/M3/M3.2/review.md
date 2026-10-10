# M3.2 color and appearance editing

Date: 2026-10-10

Added `/system/theme` with independent light and dark semantic color editing. The editor exposes all OKLCH channels (lightness, chroma, hue, alpha) within the contract ranges. Palette suggestions require an explicit action and update only the selected role in the selected mode. Its preview has its own light/dark/system appearance selector; system mode reuses the ThemeScope OS preference listener. A route link is available from Overview.

The route edits the draft store only. Apply and persistence controls remain for M3.5; contrast calculation and warnings remain for M3.6. The preview currently shows a focused color sample and action; the full multi-component preview is M3.4.

Verification: `npm run check` passed (component audit, lint, 102 unit tests, production build). All 22 production browser checks passed. The Theme editor browser journey verifies mode independence, explicit palette use, and following the OS preference. Screenshot: [Theme editor](theme-editor.png).

Next: M3.3 is control UI built on the shared theme state, recommended GPT-6 Luna at Medium. Switch back to GPT-6.1 Sol at Medium for M3.4 scope isolation and M3.5 Apply/persistence behavior.
