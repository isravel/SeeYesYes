# SYX-047 StatStrip review

Status: automated evidence only. No human visual review or screen-reader test.

`StatStrip` (`components/ui/stat-strip.tsx`) is a description list of value and label pairs.

- **Consumer-owned.** Values and meaning come from the caller. Nothing is counted, rounded, animated or invented; a value of `0` renders as `0`.
- **Reading order.** The `dt` label comes before the `dd` value in the document; on screen the value sits above its label (`column-reverse`). A test measures both.
- **Missing values.** A pair with no value (undefined, null, false or an empty string) shows `missingLabel` ("Not provided" by default) and is marked `data-missing`, so a gap is never silent.
- **Responsive.** `auto-fit` columns spread across a wide screen and stack to one column at 320px.
- **Empty.** No items renders nothing.

## Evidence

- Unit: list structure and order, values as given including `0`, missing labels and custom text, no items.
- Browser: `dt` and `dd` text in order; value above label on screen; one missing pair; one column at 320px and several at 1280px; axe in four conditions.

## Not covered

Screen-reader announcement of the description list, very long values, and right-to-left layouts.
