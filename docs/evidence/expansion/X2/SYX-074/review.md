# SYX-074 — Skeleton

Revision `9acfd3f` + working tree, 2026-11-10. See [shared checks](../checks.md).

- `components/ui/skeleton.tsx` is a decorative, `aria-hidden` placeholder with shapes `text` (default), `rect` and `circle`, and consumer `width` and `height`. The loading state belongs to the container (`aria-busy` on it); the contract example shows that. Colors come from the neutral surface tokens.
- Unit: default shape; three shapes, all hidden from assistive technology; width and height reach the inline style.
- Browser (`feedback: alerts carry text…`): the skeleton is `aria-hidden="true"`; it animates with the default motion preference (`animation-name` not `none`) and stops with `prefers-reduced-motion: reduce`.
- Not checked: the circle and text shapes in the browser; skeleton over a glass Card.
