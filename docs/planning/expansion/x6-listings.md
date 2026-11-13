# X6 — Listing kit and content cards

Read [delivery rules](delivery.md) and [visual direction](visual-direction.md), then this file only. Read dependency contracts or public APIs as needed; do not load every milestone. Update [tracking](tracking.md) when reviewing this milestone.

Phase: C — Sections and listings. Dependencies: X1–X3 and Section head from X5; optional X4 media effects only where used.

- [x] **SYX-040 — Listing.** Deliver ListingHead, Toolbar, CardGrid, ListCard and ClearFilters as a coherent kit. Connect search, filters, sort, grid/list views, pagination, counts, loading, error/retry and no matches with a clear state owner.
  - 2026-11-13: checked on automated evidence only. State owner is `useListing` (exported from the `toolbar` module, rules in `lib/utils/listing.ts`). Evidence: [review](../../evidence/expansion/X6/SYX-040/review.md). Open: human visual review, packed-consumer journey, URL sync (consumer's).
- [x] **SYX-041 — Course card.** Compose image, badges, rating, chips, original/current price, saving and details link. Consumers own currency, calculation and commercial truth.
  - 2026-11-13: checked on automated evidence only. `CourseCard`. Evidence: [review](../../evidence/expansion/X6/SYX-041/review.md). Open: human visual review.
- [x] **SYX-042 — Event card.** Provide poster-led presentation with accessible event information and a destination even when details are embedded in an image.
  - 2026-11-13: checked on automated evidence only. `EventCard`. Evidence: [review](../../evidence/expansion/X6/SYX-042/review.md). Open: human visual review.
- [x] **SYX-043 — Cohort card.** Compose title, status, supplied tool imagery and optional tilt/texture; keep content accessible when effects are disabled.
  - 2026-11-13: checked on automated evidence only. `CohortCard`. Evidence: [review](../../evidence/expansion/X6/SYX-043/review.md). Open: human visual review.

## Variation matrix

Planned scope, not implemented API claims. **I** = default, hover, focus-visible, pressed where actionable, and disabled. Sizes use existing tokens; medium is a control size, not a page width. Every glass surface also covers light/dark, opaque/no-blur fallback and reduced transparency. Motion variants cover reduced motion. Existing runtime defaults remain until an explicit compatible update; new defaults below are planned.

| Task / item | Variants / composition | Sizes | States | Default |
| --- | --- | --- | --- | --- |
| SYX-040 Listing | grid/list; filter/sort toolbar | responsive grid; density-driven | loading, rows, empty, error/retry, no matches; I | grid; empty query/filters; source order; first page |
| SYX-041 Course card | grid image card; list composition | container/card width | static, media loading/error, action I, missing price/rating | glass; details link; omit absent data; consumer currency/price rules |
| SYX-042 Event card | poster-led card | responsive; preserve supplied poster ratio | media loading/error; link I | poster+accessible text; no autoplay |
| SYX-043 Cohort card | glass cohort card; optional tilt/tool imagery/texture | responsive card | status, media fallback, action I; reduced motion | static; supplied status; tilt/texture off |
| SYX-040 ListingHead | heading/count; optional description | heading scale; responsive | loading count, known/unknown count | count from provided results; no invented total |
| SYX-040 Toolbar | search/filter/sort/view slots | density-driven; wrap narrow | I; pending filters; no matches | show supplied controls; keep labels accessible |
| SYX-040 CardGrid | responsive grid | container-derived columns | loading, populated, empty, error | logical DOM order; no masonry |
| SYX-040 ListCard | horizontal media/content; stacked narrow | container width | media loading/error; action I | glass; details link; no nested conflicting actions |
| SYX-040 ClearFilters | text or Button action | inherit Button size | I; filters active/inactive | clear query+filters; retain sort/view; reset page to 1 |

**Variation gate:** each supported variant and relevant state has a documented example or test. Check boundary sizes and meaningful combinations; do not create every possible cross-product. Semantic tones, accessible names and destructive behavior cannot be changed by a global cosmetic default.

**Milestone gate:** Glass card and toolbar surfaces meet the shared visual checks. A packed consumer runs the complete listing journey using only public APIs. Filter clearing resets the documented fields, changes reset/clamp pagination, and grid/list modes retain selections. Content remains usable without decorative effects.
