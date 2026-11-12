# SYX-031 CardSwap review

Status: automated evidence only. No human visual review, screen-reader test or reduced-transparency check.

`CardSwap` (`components/ui/card-swap.tsx`) is a stack of cards with one in front, Previous and Next buttons, and a status line ("Card 2 of 3").

- **Stable reading order.** Every card stays in the document in the order given. Only the front card is exposed: the others are `inert`, so they add no tab stops and no headings.
- **Stable height.** The stack holds equal height across all positions.
- **Manual by default.** It never cycles unless `autoplay` is set.
- **Autoplay** pauses on mouse hover and on focus within, has a visible Pause cycling / Resume cycling button, never runs faster than every 3 seconds, and does not cycle under reduced motion. The status line stops announcing while it cycles.
- **Reduced motion** gives a static stack.

## Evidence

- Unit: group, controls, status, `inert` on back cards, no pause button by default.
- Browser: one group; all headings in order, one exposed; tab order is the front action, Previous, Next; heights equal across a full loop; Enter and Space on the buttons swap; autoplay advances, the pause button holds it, hover holds it, reduced motion never cycles; axe in four conditions.

## Failures found on the way

- The autoplay test expected cycling to resume after Resume, but focus stayed on the button inside the card, which also holds the cycle. This is correct behavior; the test now moves focus out first.
- The group locator also matched the "Auto highlights" group by substring, so it now matches the name exactly.

## Not covered

Screen-reader reading of the status line, touch gestures, and long autoplay runs.
