# SYX-003 — Backdrop

Revision: `9acfd3f` plus uncommitted working tree.

- `components/ui/backdrop.tsx` is a container with `variant` `tint` (default) or `faded`. It creates its own stacking context, so the layers always sit behind the children with no caller setup.
- The layers are radial mixes of `color.primary`, `color.accent` and `color.info` into `color.background`, so they follow the theme and both appearances. Nothing animates, so reduced motion needs no variant.
- `faded` dissolves toward the bottom edge, where long content sits. Without `color-mix` support, or under forced colors, the layers drop out and the container keeps the plain page background.
- The layers are `aria-hidden` and have `pointer-events: none`. Children remain normal content.
- Registered as a contract (`backdrop`) with a recommended example that composes it with Card and Dialog. Added to the preview map, playground demos and the generated defaults. Catalog and detail routes render it.
- Checks: contract, inventory and example type-check tests; browser test for the hidden decoration and pointer behavior; the detail-route matrix covers it.
- Not done: no screenshot review of the layers, and no blur-cost measurement over it.
