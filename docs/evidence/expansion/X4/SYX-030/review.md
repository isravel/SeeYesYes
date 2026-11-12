# SYX-030 TiltCard review

Status: automated evidence only. No human visual review, touch-device test or reduced-transparency check.

`TiltCard` (`components/ui/tilt-card.tsx`) is a `Card` that can lean toward a mouse or pen pointer.

- **Opt-in.** `tilt` is off by default; without it the card is a plain `Card` and never moves.
- **Pointer only.** Touch pointers are ignored, and keyboard focus never tilts the card.
- **No fake semantics.** The card has no role or tabindex. Any action goes inside and stays a normal button.
- **Layer depth.** With `depth`, descendants marked `data-tilt-layer` shift against the lean.
- **Reduced motion** removes the lean and the transition even under the pointer.
- **Rest state.** The transform applies only while a pointer is leaning (`data-leaning`), so a resting card has `transform: none` and creates no stacking context or blur on its own.

## Evidence

- Unit: tilt attributes only when enabled; `maxTilt` clamped to 15.
- Browser: resting transform `none`; mouse move produces a transform on the card and its layer; leaving lays it flat; a card without `tilt` never moves; the inside button is focusable and focus does not tilt; no role or tabindex; touch events do not set `--tilt-x`; reduced motion keeps `none`; axe in four conditions.

## Failure found on the way

A first version always applied a `perspective()` transform, so a resting card read `matrix3d(... -0.00104167 ...)`, not `none`. That is a needless stacking context. The transform now applies only while leaning.

## Not covered

Real touch devices, and the look of the lean over glass.
