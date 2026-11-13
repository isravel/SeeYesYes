# SYX-038 Hero review

Status: automated evidence only. No human visual review.

`Hero` (`components/ui/hero.tsx`) composes a badge, a heading, a lead, actions and media that the page supplies. It adds no copy, imagery, texture or motion.

- **Order.** Text, then actions, then media, in both layouts, so reading and tab order match.
- **Layout.** `auto` splits only when media is supplied; `centered` forces centered; `split` without media stays centered because there is nothing to split. Split applies from 861px; narrower, the media sits below.
- **Heading.** Level 1 by default; level 2 when another h1 owns the page. Its size follows the viewport with a clamp and long words wrap.
- **Media.** Not autoplayed; the page supplies a `MediaFrame` for proportions and a fallback.

## Evidence

- Unit: order, no copy of its own, split rules and level.
- Browser: see the Hero test in `x5-sections` (text first, split only with media, no overflow at 320px) and the axe sweep.

## Not covered

Human visual review, and the heading size against very long translated headings.
