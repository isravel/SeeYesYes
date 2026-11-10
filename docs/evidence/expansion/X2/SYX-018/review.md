# SYX-018 — Dialog

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/dialog.tsx` is a React Aria modal with a visible title as its name. Under a glass scope the panel gets the glass surface and a separate `scrimBlur` layer behind it blurs the page. The page-blur layer is a sibling of the panel, not its ancestor, so the two blurs are independent.
- Defaults unchanged: medium, outside press does not dismiss, Escape closes, "Close" label.
- Browser (`Dialog under glass…`): opens from the keyboard; has the name "Glass dialog"; panel computes `blur(20px)`; the sibling page-blur layer computes a blur, does not contain the panel, and the panel's parent has no blur; the close button uses the custom label; axe reports no serious or critical issues with it open; Escape closes it and focus returns to the trigger.
- Browser (`Dialog keeps an opaque panel…`): with forced colors active the panel computes `backdrop-filter: none`.
- Existing `overlays.spec.ts` (run again, passing) covers focus containment, the scoped portal, blocked outside dismissal and focus return.
- Not checked: reduced transparency (CSS inspected, not run); the contrast of the scrim over bright content; large dialog on a short viewport.
- Human visual review is pending (SYX-001 gate).
