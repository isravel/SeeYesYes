# SYX-028 ShinyText review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

`ShinyText` (`components/ui/shiny-text.tsx`) is an inline `span`. When `animated`, a highlight sweeps across the text.

- The gradient starts and ends in `currentColor` and passes through `color.primary`, so the words stay in the inherited colour at the ends of every sweep. Only `-webkit-text-fill-color` is made transparent so the gradient shows; `color` is never changed, so contrast tools and fallbacks still see the real text colour.
- The effect needs `background-clip: text` and is wrapped in `@supports`; without it the text is plain.
- Off by default. Reduced motion and forced colors remove the gradient, restore the fill and stop the animation.
- Guidance: one short passage per page, never body copy.

## Evidence

- Unit: plain text and no attribute by default; `data-animated` when asked; words unchanged.
- Browser: the line reads "Ship faster with one system"; the animated span has an animation and a transparent fill while its `color` equals the static span's; the static span has no animation and its fill equals its colour; under reduced motion the animation is `none` and the fill is restored; under forced colors the animation is `none`, the fill is not transparent and the text is intact; axe in four conditions.

## Known limit

In forced colors Chrome reports the fill as the author colour, not the system colour, so that check asserts the fill is not transparent rather than equal to `color`.

## Not covered

Contrast of the primary-coloured part of the sweep against each background (the contract says the text must stay readable without it), and printing.
