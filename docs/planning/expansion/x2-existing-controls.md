# X2 — Existing control extensions

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: A — Foundations and controls. Dependencies: X1; verify existing implementations before changing their APIs.

- [x] **SYX-006 — Button.** Keep current variants and add missing solid/outline/soft/muted/ghost/danger treatments through existing tokens; map familiar aliases to the existing API instead of breaking callers.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. Aliases `solid`/`danger` map to `primary`/`destructive`; default unchanged. [Evidence](../../evidence/expansion/X2/SYX-006/review.md)
- [x] **SYX-008 — Card.** Extend default/outlined/elevated surfaces with the shared glass treatment: translucent tint, backdrop blur, crisp edge highlights and restrained elevation. Keep dense content readable and avoid stacking multiple blurred layers.
  - 2026-11-10: Done with automated checks only. Glass appearance still needs the human visual review from the SYX-001 gate. Nested glass Cards drop their own blur. [Evidence](../../evidence/expansion/X2/SYX-008/review.md)
- [x] **SYX-010 — Badge.** Support compact card/media labels, including rating, new and popularity, with text equivalents and semantic tones.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. Text carries the meaning; the icon is hidden from assistive technology. [Evidence](../../evidence/expansion/X2/SYX-010/review.md)
- [x] **SYX-013 — Input.** Support compact toolbar sizing through the existing size scale, with read-only, invalid, disabled and focus states.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. No adornment prop was added; callers compose adornments. [Evidence](../../evidence/expansion/X2/SYX-013/review.md)
- [x] **SYX-015 — Select.** Keep native selection and apply the same compact toolbar sizing and form states.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-015/review.md)
- [x] **SYX-018 — Dialog.** Verify named modal, scoped portal, focus containment, Escape and focus return. Use a glass panel over a contrast-preserving scrim; independently control panel and background blur.
  - 2026-11-10: Done with automated checks only. Glass appearance still needs the human visual review from the SYX-001 gate. Reduced transparency is CSS-inspected only. [Evidence](../../evidence/expansion/X2/SYX-018/review.md)
- [x] **SYX-021 — Dropdown menu.** Extend the existing React Aria menu with the shared glass overlay surface, readable item states and clear focus tokens.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. Added link items, named groups and non-focusable separators on the existing React Aria menu, with action-item callers unchanged. Checked native link navigation, group semantics, disabled and empty states, focus return and 320px clamping. Reduced transparency is CSS-inspected only; no catalog example shows the new item kinds yet. [Evidence](../../evidence/expansion/X2/SYX-021/review.md)
- [x] **SYX-022 — Avatar.** Retain image/fallback behavior and add token-driven ring treatment where needed.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. A browser test found and fixed a broken-image fallback before hydration. [Evidence](../../evidence/expansion/X2/SYX-022/review.md)
- [x] **SYX-023 — Switch.** Retain current accessible behavior and support neutral styling through semantic tokens.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-023/review.md)
- [x] **SYX-024 — Checkbox.** Retain native behavior, indeterminate state and neutral styling through semantic tokens.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-024/review.md)
- [x] **SYX-059 — Tabs.** Support line and boxed/segmented visual treatments while preserving tab/tabpanel semantics.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. Decision: retain `boxed` as the compatible default, pinned by the existing test. Use explicit `variant="line"` where a composition needs line tabs; no global default change or caller restyle is required. [Evidence](../../evidence/expansion/X2/SYX-059/review.md)
- [x] **SYX-061 — Table.** Retain semantic headers and overflow containment; add reusable header and hover treatments without assuming a finance domain.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-061/review.md)
- [x] **SYX-064 — Tooltip.** Verify concise labels on hover and focus, Escape dismissal and scoped portal styling.
  - 2026-11-10: Done with automated checks only. Glass appearance still needs the human visual review from the SYX-001 gate. Placements at viewport edges are not checked. [Evidence](../../evidence/expansion/X2/SYX-064/review.md)
- [x] **SYX-067 — Field.** Extend FormField rather than duplicate it; wire labels, hints and errors for native and composite controls. Include Fieldset and Legend for related control groups.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. Fieldset was registered as its own contract; composite controls use the `children` function form. [Evidence](../../evidence/expansion/X2/SYX-067/review.md)
- [x] **SYX-068 — Textarea.** Add content growth with sensible min/max bounds while preserving manual resizing and form states.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. Dragging the resize handle is not covered by a browser test. [Evidence](../../evidence/expansion/X2/SYX-068/review.md)
- [x] **SYX-069 — Radio group.** Retain one-choice behavior and support optional per-option hints and errors.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-069/review.md)
- [x] **SYX-073 — Alert.** Add outline/text treatments using semantic tones; keep message meaning in text.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-073/review.md)
- [x] **SYX-074 — Skeleton.** Use system neutral surfaces and reduced-motion behavior; mark loading content appropriately.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-074/review.md)
- [x] **SYX-075 — Spinner.** Retain compact sizes, accessible loading labels and restrained announcements.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-075/review.md)
- [x] **SYX-076 — Progress.** Support determinate/indeterminate neutral bars with accessible values and labels.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-076/review.md)
- [x] **SYX-077 — Separator.** Retain structural/decorative semantics and token-driven hairlines.
  - 2026-11-10: Done with automated checks only (unit, browser, type, lint, build); no human visual review. [Evidence](../../evidence/expansion/X2/SYX-077/review.md)

## Variation matrix

Planned scope, not implemented API claims. **I** = default, hover, focus-visible, pressed where actionable, and disabled. Sizes use existing tokens; medium is a control size, not a page width. Every glass surface also covers light/dark, opaque/no-blur fallback and reduced transparency. Motion variants cover reduced motion. Existing runtime defaults remain until an explicit compatible update; new defaults below are planned.

| Task / item | Variants / composition | Sizes | States | Default |
| --- | --- | --- | --- | --- |
| SYX-006 Button | primary/secondary/ghost/destructive; planned outline/soft/muted; solid→primary, danger→destructive aliases | small/medium/large | I; loading | primary; medium; type=button; loading=false |
| SYX-008 Card | default/outlined/elevated; glass via theme | content/container-owned | static; overflow; opaque fallback | default; glass under expansion theme; no click semantics |
| SYX-010 Badge | neutral/primary/success/warning/destructive; text or icon+text | intrinsic compact | static; long label | neutral; static label; no rating logic |
| SYX-013 Input | native input types; leading/trailing adornment composition | small/medium/large | I; empty, filled, read-only, required, invalid | text; medium; optional; enabled |
| SYX-015 Select | native single select; optional placeholder | small/medium/large | I; unselected, selected, required, invalid, empty options | medium; native selection rules; no invented value |
| SYX-018 Dialog | glass modal; opaque fallback | small/medium/large | closed/open; focus contained; Escape; focus return | medium; outside dismiss=false; Escape=true; Close label |
| SYX-021 Dropdown menu | action items; links; groups/separators; destructive item | content width; viewport-clamped | closed/open; item hover/focus; disabled, empty | closed; trigger-owned state; no selected item |
| SYX-022 Avatar | image; initials/fallback; optional ring | small/medium/large | image loading/error; fallback | medium; fallback when image unavailable |
| SYX-023 Switch | neutral toggle | small/medium/large | I; off/on; required, invalid | medium; unchecked when uncontrolled |
| SYX-024 Checkbox | neutral checkbox | small/medium/large | I; unchecked/checked/indeterminate; required, invalid | medium; unchecked; not indeterminate |
| SYX-059 Tabs | line; boxed; horizontal/vertical | content width; density-driven | I; selected/unselected; panel active/hidden | boxed; horizontal; automatic activation; explicit key or first enabled tab |
| SYX-061 Table | basic semantic table; optional row hover | container width; density-driven | rows, empty, horizontal overflow | semantic headers; No rows to show.; no automatic sorting |
| SYX-064 Tooltip | inverted label; top/bottom/left/right placement | content-sized; capped to viewport | closed/open; hover/focus; Escape | top; 600ms delay; no interactive content |
| SYX-067 Field | Field; Fieldset/Legend; help/error slots | inherit control size | optional/required; valid/invalid; help/error | required=false; no error; IDs wired to controls |
| SYX-068 Textarea | fixed rows; auto-grow | small/medium/large; min/max height | I; empty, filled, read-only, required, invalid | medium; 3 rows; auto-grow off; manual resize retained |
| SYX-069 Radio group | vertical/horizontal; optional option hints | density-driven | I; selected/unselected; required, invalid | vertical; no implicit selection; optional |
| SYX-073 Alert | info/success/warning/destructive; outline/text | content-width or full-width layout | message; optional composed action | info; static, non-dismissible message |
| SYX-074 Skeleton | text/rect/circle | consumer dimensions; text width | loading; reduced motion | text; decorative placeholder; inherit container loading semantics |
| SYX-075 Spinner | neutral ring | small/medium/large | loading; reduced motion | medium; accessible loading label |
| SYX-076 Progress | determinate; indeterminate | container width; token thickness | 0, partial, complete, indeterminate | max=100; value omitted means indeterminate |
| SYX-077 Separator | horizontal/vertical; decorative/structural | parent width/height; token hairline | static | horizontal; decorative=true |
| SYX-067 Fieldset / Legend | grouped controls; optional hint/error | inherit controls; density-driven | required, invalid, disabled descendants | semantic fieldset+legend; enabled; no error |

**Variation gate:** each supported variant and relevant state has a documented example or test. Check boundary sizes and meaningful combinations; do not create every possible cross-product. Semantic tones, accessible names and destructive behavior cannot be changed by a global cosmetic default.

## Outstanding gate evidence

The checked tasks record scoped implementation and automated evidence, not full milestone signoff. All 21 inventory tasks are checked, and Fieldset is implemented under SYX-067. Before closing X2, record:

- Human glass composition review through the SYX-001 gate, in light and dark, including shell, toolbar, controls and open overlays.
- Actual reduced-transparency rendering in a browser/OS that supports the preference, with the environment and activation method recorded. CSS inspection is partial evidence only. Do not substitute forced colors for this check; Dialog forced-colors results cover that separate condition only.
- Tooltip placement at viewport edges and manual Textarea resize behavior. Carry other unverified combinations from per-task evidence into the variation gate review.
- Applicable blur-performance, screen-reader and packed-consumer evidence through X1 and the shared release gates. Keep unperformed checks visible; do not infer them from the focused browser pass.

**Milestone gate:** Glass surfaces meet the shared visual checks. Existing callers still build. Each extended variant renders in the catalog and a consumer with correct focus, disabled, loading and error states where applicable.
