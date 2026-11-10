# SYX-001 — Glass surface theme

Revision: `9acfd3f` plus uncommitted working tree. Environment: macOS, Node per `.nvmrc`, Chromium 1248 via Playwright.

## What changed

- `effects.surface` accepts `glass` (`lib/contract/schema.ts`, `lib/theme/check.ts`). `clean` and `subtle-depth` stay valid, so saved themes load unchanged.
- Seven new registry tokens, resolved by the existing resolver: `color.glass-tint`, `color.glass-tint-dense`, `color.glass-edge`, `color.scrim`, `shadow.glass`, `effect.glass-blur`, `effect.glass-saturation`. Tint and edge values are derived from the theme's own surface and foreground colors. There is no second token store and no hardcoded palette in components.
- Neutral values outside glass: opaque tint, `0px` blur, transparent edge, zero glass shadow, and the previous 30% scrim. Existing consumers and the `default` and `soft-workspace` presets render as before.
- New `glass` preset (clean palette plus glass surface). **The default theme is still `default` (clean).** The plan's "glass for fresh expansion" is available as a preset and in the Theme editor and Playground. It is not forced on the workspace or on Naazhi.
- `RESOLVER_VERSION` is `1.2`. Older caches are discarded with a "rebuilt" notice and the saved theme is kept (unit and browser test).
- Card, Dialog and the Navigation drawer opt in through `data-surface`, set from the nearest scope via `useSurface()`. Glass is a theme treatment, not a variant prop.
- Fallbacks: `@supports not (backdrop-filter)`, `prefers-reduced-transparency`, and `forced-colors` all return to the solid `color.surface` with no filter.
- `lib/accessibility/contrast.ts` gains `contrastOnLayers`, which measures against the composited result rather than the tint alone.

## Checks

- Unit: `tests/glass-theme.test.ts` (neutral values for clean/subtle-depth, glass values in both modes, derivation from edited colors, shadow scale `none`, Design Tokens export with no exclusions, saved-theme round trip, stale-cache rebuild).
- Contrast over the composited result, backgrounds tested: page background, pure white, pure black, primary wash, bright busy image, dark busy image. The app's own backgrounds pass 4.5:1 for text and muted text and 3:1 for focus. The stress cases where the appearance mismatches the image are recorded, not claimed as passing.
- Browser: `tests/browser/glass-theme.spec.ts`. The default stays clean, glass applies before paint and survives reload, a stale cache is rebuilt, Card and Dialog compute `backdrop-filter: blur(20px)`, and forced colors computes `none`.
- Full unit suite, `tsc`, ESLint, the component audit and `next build` pass.

## Not done (so SYX-001 stays unchecked)

- The visual gate: a human review of the shell, Card, toolbar, form controls and an open Dialog in light and dark. No screenshots were taken or judged, and the chosen composition is unreviewed.
- Measured mobile and desktop scroll and overlay-open performance with blur.
- Reduced-transparency rendering was verified by CSS only. Chromium cannot emulate `prefers-reduced-transparency` here.
- The workspace shell and toolbar do not use glass yet. That belongs to the broader surface milestones.
- The `link` component audit warnings are pre-existing and were not touched.

Next action: run the visual gate on `/components/backdrop` with the `glass` surface selected, then record the decision here.
