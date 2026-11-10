# SYX-017 — Icon button

Working tree on top of `9acfd3f`, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/icon-button.tsx` composes `Button`, so loading, disabled and focus behavior are Button's. `label` and `icon` are required. The label becomes `aria-label`; the icon is wrapped in a hidden span.
- Variants: `ghost` (default), `outline`, `soft`, `muted`, `primary`, `secondary`, `destructive`. Sizes: small, medium (default), large. `destructive` is not an approved theme default.
- `pressed` turns it into a toggle with `aria-pressed`. A pressed button gets an inset ring, and a 2px border in forced colors, so the state is a shape and not only a color change.
- `tooltip` is optional and shown on hover and keyboard focus through the same overlay foundation as Tooltip. It never replaces `label`.
- Unit: the label is the accessible name and the icon is hidden; defaults and every variant and size; `pressed` appears only when passed; loading gives busy and disabled; the label stays the name with a tooltip; destructive is not a theme default.
- Browser: the button is square and at least the target size; the tooltip appears on keyboard focus and Escape dismisses it; the toggle flips `aria-pressed` and gains a box shadow; loading is busy, disabled is disabled; focus outline is solid; forced colors give the pressed state a 2px border.
- Not checked: small and large sizes in the browser, hover and press in dark mode, screen-reader output, and tooltip placement at viewport edges.
