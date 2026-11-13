# SYX-054 Events page review

Status: automated evidence only. No human visual review, no packed-consumer run.

`EventsPage` (`components/templates/events-page.tsx`) is a poster listing: a heading with a count, a search field, and `EventCard`s in a `CardGrid`.

- **One column when narrow, two columns on desktop.** The grid arrangement is a small additive option on `CardGrid`.
- **Source order is kept.** There is no sort; the supplied order is the order shown.
- **The count** is derived from the supplied events and the current search, never estimated.
- **Facts are text.** Date, time and place come from `EventCard` as real text, and the poster keeps the width and height supplied.
- **States:** loading, error with Retry, no matches, and empty. Pagination appears only when there is more than one page.

## Evidence

- Unit (`tests/x7-templates.test.ts`): source order, facts as text, count, pagination only when needed, empty state.
- Browser (`tests/browser/x7-templates.spec.ts`): the `events-page` preview shows the true count and narrows it by searching for a place.

## Not covered

- Human visual review of the poster grid, real poster artwork (the demo uses a placeholder), and screen-reader announcement of count changes.
- Date handling: dates are text the consumer supplies, so nothing is parsed, sorted or marked as past or upcoming.
