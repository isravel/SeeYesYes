# SYX-040 Listing review

Status: automated evidence only. No human visual review, no packed-consumer run.

Five parts and one state owner, all in `components/ui/`:

- **`ListingHead`**: a heading at the page's level, an optional description, and a result count in a status region. The count is only what is passed; with none, no text is rendered, and `loading` says the count is pending.
- **`Toolbar`**: a `Card` holding a named search region with search, filters, sort, view and clear slots. It holds no values. It also exports `useListing`, the state owner.
- **`CardGrid`**: shows exactly one of loading, error (with Retry when `onRetry` is given), no matches, empty, or the cards. `view` only changes the arrangement and never re-creates the cards.
- **`ListCard`**: media beside the text when wide, above it when narrow, one details link over the whole card.
- **`ClearFilters`**: a native button as text or `Button`. When nothing is active it uses `aria-disabled` instead of `disabled`, so focus survives clearing the last filter.

## State owner and rules (`lib/utils/listing.ts`)

Pure reducer, so the rules are unit-tested without a DOM.

| Change | Page | Query / filters | Sort | View |
| --- | --- | --- | --- | --- |
| Search, filter or sort | reset to 1 | changed | changed or kept | kept |
| View | kept | kept | kept | changed |
| Clear | reset to 1 | removed | kept | kept |
| Page | clamped to 1 and, if `pageCount` is passed, to the last page | kept | kept | kept |

A filter with no values is removed, so it no longer counts as a filter. A blank search, the sort and the view never count as narrowing. Setting a value to the current value returns the same state object, so the page is not reset by a no-op.

The consumer owns the data. `useListing` filters and sorts nothing; the fixture does that with ordinary array code and clamps the page itself when the result count shrinks.

## Evidence

- Unit (`tests/x6-listings.test.ts`): the reducer rules above, including no mutation of the input; each part's markup, states and omissions; contract defaults, interactivity and focus-rule membership.
- Browser (`tests/browser/x6-listings.spec.ts`, against the controls fixture's `Listing kit` section): count and source order; search narrows and resets the page; filter and sort reset the page while view keeps it; grid and list keep the same card mounted (a focused link keeps focus and a DOM marker); no matches offers Clear filters and clearing keeps sort and view; Clear filters is focusable and inert when idle and keeps focus after the last filter is cleared; loading, error, Retry; toolbar Tab order; 320px; axe in light, dark, glass and clean.

## Not covered

- Human visual review of the glass toolbar and cards, and reduced-transparency rendering.
- The packed-consumer run of the full journey through public exports only (the milestone gate); `useListing` is exported from the `toolbar` module and has not been checked from a packed artifact.
- The URL is not a state owner here: syncing `ListingState` with the address bar is left to the consumer.
- Screen-reader announcement of count and loading changes.
- Very large result sets; there is no virtualization.
