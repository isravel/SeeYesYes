# X3 — Missing controls and feedback

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: A — Foundations and controls. Dependencies: X1–X2, limited to the controls each task actually uses.

- [x] **SYX-007 — Highlight.** Provide restrained inline emphasis using the existing typography and color tokens, with usage guidance against overuse.
  - 2026-11-10: Done with automated checks only; no human visual review. Native `mark`; text contrast over the tint checked in light and dark. [Evidence](../../evidence/expansion/X3/SYX-007/review.md)
- [x] **SYX-009 — Chip.** Provide compact metadata chips with outline/text tones; distinguish static labels from removable or selectable controls.
  - 2026-11-10: Done with automated checks only; no human visual review. Static, selectable and removable forms are separate; a chip cannot be both. Failed removal keeps the chip and shows text. [Evidence](../../evidence/expansion/X3/SYX-009/review.md)
- [x] **SYX-011 — Level.** Provide configurable difficulty labels with dot and text; Easy/Medium/Hard are example content.
  - 2026-11-10: Done with automated checks only; no human visual review. Nothing is inferred from the words. [Evidence](../../evidence/expansion/X3/SYX-011/review.md)
- [x] **SYX-012 — Live dot.** Provide a status dot with text and optional animation; preserve meaning without color or motion.
  - 2026-11-10: Done with automated checks only; no human visual review. Live and inactive differ by shape; animation is opt-in and stops under reduced motion. [Evidence](../../evidence/expansion/X3/SYX-012/review.md)
- [x] **SYX-014 — Search input.** Compose Input with a search icon, accessible label, clear behavior and controlled/uncontrolled usage.
  - 2026-11-10: Done with automated checks only; no human visual review. Clear button only with text; click and Escape clear and return focus; searching is reported in text. [Evidence](../../evidence/expansion/X3/SYX-014/review.md)
- [x] **SYX-016 — Segmented.** Provide single-selection view controls with appropriate radio/toggle semantics; use Tabs only when switching tab panels.
  - 2026-11-10: Done with automated checks only; no human visual review. Native radios in a radiogroup; no tab semantics; arrow keys and disabled choices checked in the browser. [Evidence](../../evidence/expansion/X3/SYX-016/review.md)
- [x] **SYX-017 — Icon button.** Compose Button with compact sizing, a required accessible name and optional tooltip.
  - 2026-11-10: Done with automated checks only; no human visual review. Composes Button; label required; pressed is a shape, not only color; optional tooltip never replaces the label. [Evidence](../../evidence/expansion/X3/SYX-017/review.md)
- [ ] **SYX-019 — Confirm dialog.** Compose Dialog with safe initial focus, pending/error states and optional type-to-confirm; preserve user input after a failed action.
- [ ] **SYX-020 — Toast.** Provide queued confirmations, live-region semantics, dismissal and timed expiry that pauses during interaction; actionable messages allow enough time to respond.
- [x] **SYX-032 — Disclosure.** Provide an accessible click trigger and optional pointer-hover enhancement; hidden content cannot receive focus.
  - 2026-11-10: Done with automated checks only; no human visual review. Native button with `aria-expanded`/`aria-controls`; collapsed content is `hidden`; hover is a mouse-only opt-in and a click pins it. Height animation not built, only the chevron turn. [Evidence](../../evidence/expansion/X3/SYX-032/review.md)
- [x] **SYX-060 — Accordion.** Compose disclosure sections with single/multiple expansion, linked headings, keyboard access and reduced-motion transitions.
  - 2026-11-10: Done with automated checks only; no human visual review. Disclosures with headings and named regions; single (collapsible or not) and multiple modes. Arrow-key movement between triggers is not added. [Evidence](../../evidence/expansion/X3/SYX-060/review.md)
- [x] **SYX-062 — Pagination.** Support links or onChange, current-page semantics, ellipsis, boundary states and keyboard access.
  - 2026-11-10: Done with automated checks only; no human visual review. Links with `getHref`, buttons otherwise; `aria-current`; stable-length ellipsis list; ends disabled. [Evidence](../../evidence/expansion/X3/SYX-062/review.md)
- [x] **SYX-063 — Breadcrumbs.** Extract/reuse the existing navigation breadcrumb behavior as a standalone composition with current-page semantics.
  - 2026-11-10: Done with automated checks only; no human visual review. Standalone `nav` with an ordered list; current page is text; the shell Navigation keeps its own breadcrumb markup and was not changed. Truncation/overflow collapse is not built; items wrap. [Evidence](../../evidence/expansion/X3/SYX-063/review.md)
- [ ] **SYX-065 — Popover.** Provide a trigger-anchored panel with appropriate focus, dismissal, placement and theme inheritance using the installed overlay foundation.
- [ ] **SYX-066 — Drawer.** Generalize the navigation drawer only as needed for reusable edge panels; retain focus containment, dismissal and return.
- [x] **SYX-070 — Checkbox group.** Provide an array-valued selection group with label, hints, errors and disabled options.
  - 2026-11-10: Done with automated checks only; no human visual review. Fieldset of native checkboxes; array value in option order; hints are descriptions; required not put on every checkbox. [Evidence](../../evidence/expansion/X3/SYX-070/review.md)
- [ ] **SYX-071 — Input OTP.** Support one-time-code entry, full-code paste, SMS autofill, correction, incomplete/error states and a coherent accessible label.
- [ ] **SYX-072 — Combobox.** Provide searchable selection with keyboard navigation, selected value, loading, no results, disabled and error states.
- [x] **SYX-078 — Kbd.** Provide semantic keyboard shortcut hints with platform-neutral display content.
  - 2026-11-10: Done with automated checks only; no human visual review. Display only; binds nothing. [Evidence](../../evidence/expansion/X3/SYX-078/review.md)
- [ ] **SYX-079 — Avatar group.** Compose overlapping avatars with an accessible group label and meaningful +N overflow content.
  - 2026-11-10: Implemented and checked (group name, +N with its own name, overlap, max edge cases). Open: the matrix's optional overflow trigger is not built. [Evidence](../../evidence/expansion/X3/SYX-079/review.md)

## Variation matrix

Planned scope, not implemented API claims. **I** = default, hover, focus-visible, pressed where actionable, and disabled. Sizes use existing tokens; medium is a control size, not a page width. Every glass surface also covers light/dark, opaque/no-blur fallback and reduced transparency. Motion variants cover reduced motion. Existing runtime defaults remain until an explicit compatible update; new defaults below are planned.

| Task / item | Variants / composition | Sizes | States | Default |
| --- | --- | --- | --- | --- |
| SYX-007 Highlight | inline emphasis | inherit surrounding text | static; selection; contrast fallback | inline semantic emphasis; no animation |
| SYX-009 Chip | outlined metadata; selectable; removable; semantic tones | small/medium | static; I for actionable forms; selected, removal pending/error | medium; neutral; static unless action supplied |
| SYX-011 Level | Easy/Medium/Hard examples; custom label/tone | inherit label scale | static; no-color fallback | caller supplies level; text+dot; no inferred difficulty |
| SYX-012 Live dot | status dot+label; static/ping | small/medium | live/inactive; reduced motion | small; caller supplies label/status; animation opt-in |
| SYX-014 Search input | search icon; optional clear action | small/medium/large | I; empty, filled, searching, error | medium; empty uncontrolled query; clear only when populated |
| SYX-016 Segmented | single-select view toggle; text/icon+text | small/medium/large | I; selected/unselected | medium; caller supplies initial selection; no tabpanel semantics |
| SYX-017 Icon button | boxed/ghost; semantic Button treatments | small/medium/large; square | I; loading; optional pressed toggle | medium; ghost; accessible name required |
| SYX-019 Confirm dialog | standard confirmation; type-to-confirm | small/medium/large | closed/open; mismatch, ready, pending, failed, succeeded | medium; closed; safe initial focus; typing off; no outside dismiss |
| SYX-020 Toast | info/success/warning/destructive; optional action | content-sized; viewport-clamped | queued, visible, paused, dismissed, expired; action failure | bottom-centre; info; 5s non-action expiry; actionable stays until dismissed |
| SYX-032 Disclosure | click; click+hover enhancement | content-owned | I; collapsed/expanded; hover exit; reduced motion | collapsed; click trigger; hover off |
| SYX-060 Accordion | single/multiple expansion; optional non-collapsible single mode | container width; density-driven | I; expanded/collapsed; disabled item | single; all collapsed; collapsible |
| SYX-062 Pagination | link navigation; onChange control | small/medium/large | I; current, first, last, ellipsis; no pages | medium; page=1; no auto-fetch; ellipsis not actionable |
| SYX-063 Breadcrumbs | text; optional separators | inherit text scale | current, linked ancestor, truncated/overflow | last item current; ancestors links; no auto route lookup |
| SYX-065 Popover | non-modal panel; dialog semantics only when warranted | content-sized; viewport-clamped | closed/open; focus, dismissal, placement change | closed; bottom placement; Escape/outside dismiss; focus return |
| SYX-066 Drawer | left/right/top/bottom panel | small/medium/large; viewport-clamped | closed/open; focus contained; Escape; reduced motion | right; medium; closed; modal; Escape dismiss |
| SYX-070 Checkbox group | vertical/horizontal; optional option hints | density-driven | I; empty/some/all selected; required, invalid | vertical; empty array when uncontrolled; optional |
| SYX-071 Input OTP | numeric code; optional masked display | small/medium/large; configurable code length | I; empty, partial, complete, paste, autofill, invalid | medium; 6 digits; unmasked; no auto-submit |
| SYX-072 Combobox | single searchable selection; grouped options | small/medium/large | I; open/closed, typing, loading, no matches, invalid | medium; empty query; no selection; closed; no free-text value |
| SYX-078 Kbd | single key; shortcut sequence | small/medium | static; long sequence | small; display only; does not bind shortcuts |
| SYX-079 Avatar group | overlap group; +N overflow | small/medium/large | images/fallbacks; overflow; optional overflow trigger focus | medium; show up to 4; overflow count; no popup unless content supplied |

**Variation gate:** each supported variant and relevant state has a documented example or test. Check boundary sizes and meaningful combinations; do not create every possible cross-product. Semantic tones, accessible names and destructive behavior cannot be changed by a global cosmetic default.

**Milestone gate:** A small listing example supports search, view switching, clear filters, a detail dialog and confirmation toast. Use the [X6 composition](x6-listings.md) early; it does not have to wait for marketing motion. Form and overlay checks cover keyboard use and theme isolation.
