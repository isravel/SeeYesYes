# M3.6 Contrast calculation, gamut handling, and warnings

Date: 2026-10-13

`lib/accessibility/contrast.ts` is a pure module (no React or browser APIs) that checks the required pairs from the theme spec in both modes: text on background/surface, muted text on background/surface/muted, each `on*` role on its role, focus on background/surface (3:1), and control borders on background/surface (3:1). Decorative borders are exempt and are not reported as failures.

- **Gamut:** out-of-gamut OKLCH colors are mapped into sRGB by reducing chroma at constant lightness and hue (binary search), so the lightness that contrast depends on is preserved. Results report when a color was adjusted.
- **Alpha:** translucent colors are composited over their background; a translucent background sits on white (light) or black (dark).
- **UI:** the Theme editor shows a Contrast check section with draft results and, while the draft differs, the applied theme's results. Each failure names the mode, pair, measured ratio and minimum. Warnings state the theme will not be marked verified, and Apply stays enabled. The copy says this is a limited local check, not an audit.

Verification: `npm run check` passed (112 unit tests, 5 new, including default-theme pass in both modes, one-mode failure isolation, known ratios, gamut mapping, alpha). The existing default-theme contrast test now uses the shared module and still passes. All 28 production browser tests passed, including a new journey: editing foreground lightness warns only for light, Apply still works, Reset shows a clean draft against a warning applied theme. Human WCAG review remains open.

M3.6 is complete. Next: M3.7 storage failures, Web Lock serialization, stale-draft rejection, `storage` event sync, and the reduced-motion override.
