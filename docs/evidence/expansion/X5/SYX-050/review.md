# SYX-050 Instructor review

Status: automated evidence only. No human visual review.

`Instructor` (`components/ui/instructor.tsx`) is an `article` with a name heading, and optionally a portrait, role, bio and links, all supplied.

- **Missing parts.** Anything not supplied is left out: no portrait, no list, no empty paragraphs.
- **Portrait.** A `MediaFrame` with a fixed square, so the page does not jump; on failure the name is shown as text in its place.
- **Links.** Each shows its own visible label, opens in a new tab and says so; the list is named after the person.
- **Layout.** Side by side from 641px when a portrait exists; stacked with the portrait first below that.

## Evidence

- Unit: name heading, parts omitted when absent, level, new-tab links.
- Browser: see the Instructor test in `x5-sections` (heading, stacking at narrow widths, failed portrait) and the axe sweep.

## Not covered

Human visual review and very long names or bios in other languages.
