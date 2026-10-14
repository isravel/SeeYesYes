# M4.7 Inventory and keyboard review

Date: 2026-10-14

**Inventory (A02).** `tests/component-inventory.test.ts` pins the required inventory at 29 components and checks, for every one: an implementation file exists at its public import path, a recommended example is linked, and all six metadata-readiness checks pass. All 29 are metadata-complete. It also checks that no component claims an accessibility review or evidence that has not happened (all 29 are "not reviewed").

**Spec discrepancy found and recorded.** The visual-system spec listed 13 interactive components, but the registry marks 17. The extra four (Empty State, Error State, Not Found, Copy Button) each embed an action, retry, link, or copy control, so the spec's own rule ("a component that gains a focusable part becomes interactive") applies to them. The registry is right; the spec sentence was updated to list them. Table remains non-interactive but documents its scrollable region's keyboard behavior, which is pinned in the test.

**Keyboard matrix (A12), `tests/browser/keyboard-matrix.spec.ts`**, run on the Component Detail previews of the production build:
- Every one of the 17 interactive components is reached by Tab, exposes the expected role and a non-empty accessible name, and shows a visible focus indicator when focused from the keyboard.
- The 12 non-interactive components add no tab stops of their own. The two documented exceptions are Table's scrollable region and the Input that the Form Field demo wraps.
- Behavior checks: Space toggles Checkbox and Switch; arrow keys move a Radio Group selection within one group; type-ahead changes a native Select without leaving it; typing works in Input and Textarea; Enter follows a Link; Enter and Space both activate a Button; Dialog opens, contains Tab focus, and Escape closes it and returns focus to the trigger; Dropdown Menu opens with ArrowDown, moves between items, and Escape returns focus to the trigger; Tabs move focus and selection with arrows and Home and expose their panel; Tooltip opens on keyboard focus and Escape dismisses it.
- The run writes [component-review-matrix.md](component-review-matrix.md), listing each component's interactivity, metadata status, Tab reach, name, focus indicator, contract keys, and review status.

**Limits, stated plainly.** This is automated keyboard evidence on one browser (Chromium on macOS). Native Select arrow keys open the list on some platforms and change the value on others, so only type-ahead is asserted. Screen-reader behavior, focus order across a whole page, and WCAG criteria review need a human tester; no component is marked reviewed.

Verification: `npm run check` passed (163 unit tests, 4 new). All 74 production browser tests passed, including 3 new keyboard tests.

M4.7 is complete. Next: M4.8 the Design Tokens exporter, light and dark downloads, format validation, and Style Dictionary parse tests.
