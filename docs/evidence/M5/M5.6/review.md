# M5.6 Accessibility screen

Date: 2026-10-14

`/accessibility` keeps three things apart, as the spec requires, with no single score and no conformance claim.

1. **Component review evidence** (from `/api/components`): a table of every component's human review status, keyboard behavior, focus documentation, and reduced-motion behavior, plus a form-semantics table (element, meaning, first requirement) for form components, all read from contracts. A component counts as reviewed only when its contract says so and links evidence; today the page states "0 of 29 reviewed" and that automated keyboard checks are not a review.
2. **Live contrast for the applied theme:** measured locally for the 16 required pairs in both modes (32 results) with ratio, minimum, and a text result (not color alone), noting gamut adjustment. It follows the applied theme only: an unapplied draft changes nothing, and applying a failing theme shows "Below minimum" and "A failing theme is not marked as verified." It is labeled a limited local calculation, not a complete audit.
3. **Sample validation results** (from `/api/validation`), labeled "Demo results" and "fixture data, not measurements": the accessibility-rule results for the clean, mixed, and failing demo reports, linking to the Validation screen.

Each data section has its own loading state, its own error with Retry, and its own empty state with a next action; the tests fail one request and confirm the other sections keep working, and show that the empty scenario leaves the contrast section in place. Focus documentation counts a `focus-visible` state or the linked `wcag-focus-visible` rule, which is how Copy Button documents it. The Overview sidebar links here.

Verification: `npm run check` passed (231 unit tests, 5 new for evidence rows, reviewed-needs-evidence, keyboard/focus/motion summaries, form semantics, and demo summaries). All 112 production browser tests passed, including 5 new Accessibility journeys (three honest sections; measured contrast following the applied theme including a failing case; per-section error and Retry; per-section empty states; 320px and 1280px fit with no serious axe findings). Human screen-reader and WCAG review remain open, and nothing on this screen claims otherwise.

M5.6 is complete. Next: M5.7 Overview with calculated coverage and labeled demo health.
