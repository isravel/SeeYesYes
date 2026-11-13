# SYX-053 Listing page review

Status: automated evidence only. No human visual review, no packed-consumer run.

`ListingPage` (`components/templates/listing-page.tsx`) is a complete course listing built from the X6 kit: `ListingHead`, `Toolbar` with search, topic filter, sort, grid and list view and Clear filters, `CardGrid` of `CourseCard`, and `Pagination`.

- **Rules come from `useListing`:** search, filter and sort return to page 1, the view change keeps everything, and clearing keeps sort and view.
- **Searching, filtering, sorting and paging** are done in the browser by `queryListing` (`lib/utils/listing.ts`), a pure function that never mutates its input and clamps the page. This suits a few hundred items; for a large catalog the consumer runs their own query and composes the kit.
- **The count** is the number of matches in the supplied courses, shown only when the status is ready.
- **Optional controls:** the topic filter and the value sort appear only when the courses supply `topic` and `sortValue`.
- **States:** loading, error with Retry, no matches (with Clear filters), empty, and results.

## Evidence

- Unit: `queryListing` search, filter, sort and page clamping are in `tests/x6-listings.test.ts`; `tests/x7-templates.test.ts` covers the true count, first page in source order, optional controls, loading, error and empty text, and heading level.
- Browser: in the `listing-page` preview, count, page size, a no-match search with Clear filters, and moving to page 2.

## Not covered

- URL synchronisation of the listing state, which the consumer owns.
- Human visual review, screen-reader announcement of count changes, and very large lists (no virtualization).
