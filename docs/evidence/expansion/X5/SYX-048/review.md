# SYX-048 CtaPanel review

Status: automated evidence only. No human visual review, reduced-transparency check or contrast measurement over a busy background.

`CtaPanel` (`components/ui/cta-panel.tsx`) is a `Card` with a heading, an optional description and one supplied action.

- **Surface.** It is a Card (elevated), so the glass tint, edge, blur, nested-glass rule and the opaque fallbacks for no backdrop filter, reduced transparency and forced colors are Card's own. It adds no second surface treatment.
- **Decoration.** A soft brand tint sits behind the content in a `::before` layer. `texture` (off by default) adds a faint dot pattern in `::after`. Both are behind the content in the Card's own stacking context, ignore the pointer, and are removed in forced colors. Text keeps the foreground color on the surface; the tint is decoration.
- **One action.** The panel renders exactly the `action` supplied and no other control.
- **Heading** level is supplied by the page.

## Evidence

- Unit: heading, description, one button, surface marker, texture off by default, chosen level.
- Browser: one button; heading level; `::before` present and `::after` absent without texture and present with it; decoration ignores the pointer; focus ring on the action; decoration hidden in forced colors; 320px; axe in light, dark, glass and clean.

## Not covered

The composited contrast of body text over the tint on busy backgrounds (the visual-direction rule asks for it), reduced-transparency rendering in a real browser setting, and human review.
