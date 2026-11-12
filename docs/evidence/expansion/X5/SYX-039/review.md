# SYX-039 SectionHead review

Status: automated evidence only. No human visual review or screen-reader test.

`SectionHead` (`components/ui/section-head.tsx`) is a heading, an optional subtitle and an optional View all link.

- **Heading level** is supplied by the page (`level` 2, 3 or 4, default 2). The size follows the level on the shared type scale (`title` for level 2, `heading` otherwise); there is no separate size prop.
- **View all** appears only when `viewAllHref` is given. Its accessible name is the label followed by a visually hidden copy of the heading ("View all Featured guides"), so several links on one page stay distinct. It reuses `Link`, so page routes navigate client-side and focus styles are shared.
- **Narrow screens.** The row wraps; the link drops below a long heading at 320px and nothing overflows.

## Evidence

- Unit: default and chosen levels, no link or subtitle unless supplied, link name, custom label.
- Browser: heading levels and text; link accessible names for the default and a custom label; link absent without a destination; level 2 larger than level 3; 320px wrap with the link below the heading; axe in four conditions.

## Not covered

Screen-reader reading, and right-to-left layouts.
