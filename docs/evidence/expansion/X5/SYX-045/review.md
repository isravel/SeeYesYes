# SYX-045 FeatureBento review

Status: automated evidence only. No human visual review over glass.

`FeatureBento` (`components/ui/feature-bento.tsx`) is a list of `Card` cells, each with a heading, and optionally a badge, media, a description and a link.

- **Reading order.** The DOM order is the reading order. No script reorders or places cells; every layout stacks in that order on narrow screens.
- **Three over four.** From 961px a twelve-column grid gives the first three of every seven cells four columns and the next four three columns. Below that it is the same auto-fit grid as `grid`.
- **Links.** Named by the label followed by the feature title, so several links stay distinct. A link only exists when `href` is supplied.
- **No hover effect.** Cells never tilt or move.

## Evidence

- Unit: order, headings at the chosen level, three-over-four rows, optional badge and link, empty list.
- Browser: see the FeatureBento test in `x5-sections` (order, link names, three over four, 320px) and the axe sweep.

## Not covered

Human visual review, long titles in other languages, and media-failure rendering inside a cell (media is supplied by the page).
