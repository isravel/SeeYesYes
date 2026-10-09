# M2.8 integration review

Date: 2026-10-09

## What was reviewed

- Ran the existing workspace, overlay, navigation, table, and nested theme-scope browser journeys, plus focused checks for the M2.7 feedback examples.
- Exercised the workspace at 320, 768, 1280, and 1920 CSS pixels in light and dark appearance. Saved screenshots in this directory. No page-level horizontal overflow appeared at those widths.
- Checked the 640px layout viewport as a reflow proxy for 200% desktop zoom. The mobile navigation opened, contained focus, and restored focus on Escape. This is a viewport proxy, not a literal browser zoom test.
- Confirmed feedback examples expose a named loading status, an empty-state heading and action, a retryable alert, clipboard success feedback, and a recovery link. The retry and action controls work with keyboard activation. Axe reported no serious or critical issues on the reviewed route.
- Checked reduced-motion behavior in the browser; the global preference rule sets animation and transition durations to zero.
- Reviewed nested ThemeScope coverage for independent light/dark appearances, compact/spacious density, sharp/curvy radii, component defaults, and portal inheritance. Existing focused scope and overlay tests passed.
- Calculated required contrast pairs for default light and dark colors and added a token-level regression test. The dark muted foreground was below 4.5:1 against muted surfaces, so its OKLCH lightness was raised from 0.76 to 0.80. The required text, focus, paired-label, and control-boundary pairs now meet their configured minima in the regression test. Border contrast applies to visible control boundaries; decorative borders remain exempt.

## Integration fix

The NotFound demo was embedding its default level-one heading inside Overview, which created two page-level headings and failed two existing browser checks. NotFound now accepts a heading level (default remains level one for page use), and its embedded example uses level two.

## Verification

- `npm run check`: typecheck, component audit, lint, unit tests, and production build.
- `npm run test:browser`: all 20 production browser checks passed, including the final reduced-motion check.
- Unit coverage includes both modes and the required foreground/background, muted, focus, paired-role, and border contrast pairs.
- Screenshots: `workspace-{light,dark}-{320,768,1280,1920}.png`.

## Gate status

M2 implementation and automated integration review are complete. The M2 milestone remains open because its quality spec reserves manual keyboard navigation, screen-reader testing, and final WCAG criteria review for a human tester. No component is marked as accessibility reviewed. A human reviewer should record browser and assistive-technology versions and results for Theme forms, Dialog, Dropdown Menu, Tabs, and validation details, then perform literal 200% browser zoom and confirm the focus and contrast findings.
