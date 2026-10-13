# M3.8 Theme lifecycle tests and the M3 gate

Date: 2026-10-13

**Appearance selector.** M3 had no UI for the workspace appearance preference, so `AppearanceSelector` was added to the Overview header and the Theme editor header. It calls `commitAppearance` (the locked writer), shows pending feedback, changes only appearance, and works locally in session-only mode. It never touches the draft or the unsaved indicator.

**New unit tests** (`tests/theme-bootstrap.test.ts`, 17 tests) run the real inline bootstrap script against a fake document:
- Cached values follow the OS mode at load, not the mode at Apply time; explicit appearance ignores the OS.
- Ten invalid-cache cases (missing, stale revision, old cache or resolver version, unsafe value, bad variable name, mismatched light/dark keys, unsupported envelope version, invalid appearance, corrupt JSON) each apply nothing, so a cache is never partly applied.
- The allowlist test builds caches for all 324 combinations of density, radius, shadows, surface effect, motion, and type scale; the script only applies a cache whose every value matches its own allowlist, so each resolver value is covered.
- Mode independence: editing light colors leaves dark values unchanged. Apply writes the new cache and revision together.
- Global appearance changes during an open draft leave the draft, baseline, and unsaved state alone; Apply does not revert appearance.

**New browser tests** (`tests/browser/theme-appearance.spec.ts`): first paint with app scripts blocked follows the OS mode, including an OS change between visits, then hydration keeps the same values; a stale cache renders defaults first and then the validated settings; corrupt storage shows a notice and Apply replaces it; the selector changes appearance during an open draft, persists, and survives Apply and reload; appearance and theme saved from two tabs preserve each other.

**Gate check (M3):**
- A03: draft edits affect only the Theme preview; Apply updates the workspace; first paint with valid settings uses the saved values with no flash of defaults, including an OS mode change between visits; invalid or stale caches fall back safely. Covered by theme-lifecycle, theme-appearance, theme-bootstrap tests.
- A04: Discard, Reset draft, navigation, refresh, corrupt and blocked storage, appearance during a draft, two-tab locked saves, stale-draft rejection, storage-event adoption, and the no-lock/no-storage session-only fallback all follow the spec. Covered by theme-writer unit tests and theme-tabs, theme-lifecycle, theme-appearance browser tests.
- A05/A06: independent light/dark editing, explicit palette suggestions, and shared controls (M3.2–M3.3 browser tests, plus the contrast tests from M3.6).
- A07 (Theme preview): scope isolation and the dialog portal (M3.4 browser tests, still passing).
- A13 (theme-related): default light and dark themes pass every required contrast pair; reduced motion removes motion in the preview and workspace.
- Failure notices are shown and are usable: conflict, retry, session-only, corrupt, unsupported version, failed write.

Verification: `npm run check` passed (141 unit tests). All 36 production browser tests passed. One existing theme-editor test now reads the last status region, because the new selector adds a status region to the page.

Human screen-reader and WCAG review remain open under the project gates.

**M3 is complete** within those limits. Next: M4.1 Tokens page.
