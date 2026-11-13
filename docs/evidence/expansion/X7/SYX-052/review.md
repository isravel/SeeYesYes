# SYX-052 Landing page review

Status: automated evidence only. No human visual review, no packed-consumer run.

`LandingPage` (`components/templates/landing-page.tsx`) composes Hero, StatStrip, CohortCard and CourseCard grids, FeatureBento, Testimonials and CtaPanel, in that order.

- **Only the hero is required.** Every other section is rendered only when it has items, so there is no empty heading and no empty space.
- **No invented content.** Every word, number, link, image and review comes from the consumer. A stat with no value shows the text the StatStrip uses for a missing value.
- **Heading order:** `level` is 1 by default and 2 when the host page already has an h1. Sections sit one level under the hero and cards one under those, so the outline never skips a level.
- **No landmarks of its own:** sections are labelled regions, and the Navbar and Footer come from `PageShell` or the host page.

## Evidence

- Unit (`tests/x7-templates.test.ts`): hero only renders no sections; an empty section is omitted; headings follow the hero at both levels; a missing stat value is shown as text.
- Browser (`tests/browser/x7-templates.spec.ts`): in the `landing-page` preview the heading levels never jump by more than one; the preview fits 320px in both appearances.

## Not covered

- Human visual review of section rhythm, and of the media and CTA over the backdrop.
- Placeholder media only: the demo uses `public/sample-media.svg` and neutral sample text.
- Section order is fixed. A consumer who wants another order composes the sections themselves.
