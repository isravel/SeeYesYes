# M6.5 Documentation search, deep links, and Copy for LLM

Date: 2026-10-14

`/docs` has local search over article titles, headings, and text (including the generated reference). It runs on the device and sends nothing anywhere. Every query term must match, case is ignored, and title matches rank above heading matches above body matches. Each result links to a real route; heading results deep link to the exact section (for example `/docs/configuration#apply-discard-and-reset`), and the browser test follows one and confirms the heading is in view. No-match shows "No results for …", an empty state, and Clear search, which restores the guide and reference lists. Results show an excerpt around the match.

Each article has Copy for LLM, which copies the article's Markdown with links rewritten as site-root paths (the test compares against the source file transformed the same way and confirms no relative links remain) and reports success or failure through the shared copy feedback. Unknown article slugs return a real 404 with a recovery link. Articles show breadcrumbs and an "On this page" list that links to each section.

Verification: `npm run check` passed (305 unit tests; 12 new for sources, links, accuracy, reference, Markdown helpers, and search). All 147 production browser tests passed, including 8 new Documentation journeys (index with guides apart from reference; search, deep link, no-match, and reference search; every article's anchors and links; reference linking to canonical screens; Copy for LLM success and failure; 404; narrow and wide fit in both appearances with no serious axe findings). Human screen-reader and WCAG review remain open.

M6.5 is complete.
