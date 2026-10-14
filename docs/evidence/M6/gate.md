# M6 gate

Date: 2026-10-14

- **A01:** all 13 views and the documented deep links load; each has a distinct title, one `h1`, one `main`, a marked current destination, and a working skip link; unknown routes, components, and articles show a useful 404 inside the shell (M6.6, `tests/browser/views.spec.ts`).
- **A07:** Playground changes stay local, including Dialog, Menu, and Tooltip portals; Reset reloads applied settings (M6.2).
- **A09 and A10 including Layouts and Documentation search:** search, filters, copy, and download work on every screen built; Layouts and Documentation load through adapters or the registry, show loading, error with Retry, and empty states, and the shared data-state suite covers them (M6.1, M6.5).
- **A16:** local setup and examples work against the shipped files (fresh clone walkthrough, example type-check); all documentation links resolve, including every link in `/llms.txt`; `/llms.txt` and `/llms-full.txt` are deterministic, include the articles, and say they use the default theme; Copy for LLM on a component equals the matching task export exactly, and on an article equals the article source with site-root links (M6.4, M6.5, M6.7, M6.8).
- **A18:** the seven layouts reuse only system components (no raw interactive or table elements, only public imports, semantic spacing tokens); a style-ownership test confirms page and layout CSS never styles the inside of a component through descendant selectors or component state attributes, which found and fixed several leaks (for example page rules reaching into live demos on component pages and the Playground); component demos work in the preview, layout, and Playground containers without parent-specific overrides (M6.1, M6.6, M6.7).

Complete journeys work: configure, apply, and export (Theme, Tokens, AI Context, agent files) and discover, preview, and copy (Components, Playground, Documentation).

Human screen-reader and WCAG review remain open for M2 through M6.
