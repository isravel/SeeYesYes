# X6 shared checks

Working tree on top of `7082ecc`, 2026-11-13. macOS (darwin), Playwright Chromium against a production build.

SYX-040, 041, 042 and 043: ListingHead, Toolbar (with `useListing`), CardGrid, ListCard, ClearFilters, CourseCard, EventCard and CohortCard. No new dependency.

| Command | Result |
| --- | --- |
| `npm run typecheck` | clean (81 components) |
| `npx eslint .` | clean |
| `npm run audit:components` | All 81 component implementations match their documented props, literal defaults, direct CSS tokens and styled compounds |
| `npx vitest run` | 860 pass across 50 files, including `tests/x6-listings.test.ts` (40) and the type-check of every recommended example |
| `npm run build` | passes |
| `npx playwright test` on `x6-listings`, `keyboard-matrix`, `components-catalog`, `component-detail`, `x5-sections`, `console` | 57 passed and 2 failed on the first run; both failures were test expectations, fixed, and `x6-listings` plus `keyboard-matrix` re-run: 20 pass. The full browser suite was not run |

Failures found, all in tests rather than components:

- Keyboard matrix: the Toolbar demo's slotted controls (search, sort, two view radios, clear) are tab stops of the controls placed in it, not of the Toolbar. They are listed as allowed stops for `toolbar`, as is done for Form Field and Fieldset.
- `x6-listings`: my expectation of two pages for the "advanced" level was wrong; the fixture has four advanced courses, so one page. The test now says 1 page and 4 results.

Notes:

- Page, query, filter, sort and view rules live in a pure reducer (`lib/utils/listing.ts`), unit-tested without a DOM. `lib/utils/listing.ts` was added to `evaluation/reset.mjs` next to `share.ts`.
- `lib/data/section-contracts.ts` now exports its small contract helpers (`Entry`, `prop`, `choice`, `common`, `levelProp`, `toContract`, `toExample`) so `lib/data/listing-contracts.ts` reuses them; the section entries and output are unchanged.

## Not covered

- The milestone gate's packed-consumer run of the full listing journey through public APIs only.
- Human visual review of the glass toolbar and cards, reduced-transparency rendering, and screen-reader announcement of count and loading changes.
- URL synchronisation of listing state, which the consumer owns.
- The full browser suite.
