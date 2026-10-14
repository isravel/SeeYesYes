# M6.6 All thirteen views, navigation, unknown routes, long content, and copy actions

Date: 2026-10-14

**Structural finding and fix: a shared shell.** Only the Overview had navigation; every other screen was an island with its own back link, so the spec's workspace navigation did not exist for twelve of the thirteen views. A new `WorkspaceShell` now wraps every screen (internal check fixtures stay bare): a skip link, brand, the workspace appearance selector (moved out of the Theme editor and Overview headers), and the navigation with the current destination marked, longest matching route winning (so a component page marks Components). Top-level pages also get breadcrumbs; component and article pages keep their own richer breadcrumbs. Every screen's `main` is now the focus target of the skip link. The Overview, its header, footer, and sidebar moved into the shell.

**Defects found by the new suite and fixed**
- The Theme editor had no page title (it was a client component, so it fell back to the site default); it is now a server page with metadata.
- A very long search query overflowed the Documentation screen to 3,018px because the result count echoes the query; the count now wraps.
- The shell's appearance selector briefly added a second status region to every page and broke tests that pick the first status; its message is now a live region without the status role. The Playground's own appearance control is now named "Preview appearance" to tell it apart from the workspace selector.

**Checks** (`tests/browser/views.spec.ts`)
- Each of the 13 views (Component Detail represented by Button): one distinct title ending in the site name, one `h1`, one `main`, exactly one destination marked current, and a first-Tab skip link that moves focus to `main`.
- Each view fits 320px and 1280px in both appearances, and has no serious or critical axe findings.
- The sidebar reaches every view; at 375px the drawer opens, contains focus through repeated Tab, restores focus on Escape, and a chosen destination closes it and navigates.
- Unknown routes (`/nope`, `/system/nope`, a bad component, a bad article, `/ai/nope`) return 404 with the not-found view and recovery link inside the shell and no serious axe findings.
- Very long input (400 characters) in the Tokens, Components, and Documentation searches and a settings field wraps without overflow at 320px and 1280px.
- Copy actions: across seven screens with many copy buttons, every Copy clicked puts non-empty text on the clipboard and shows a copied message (more than 20 clicks).

Verification: `npm run check` passed (307 unit tests, 2 new for the shell's route matching). All 153 production browser tests passed. Human screen-reader and WCAG review remain open.

M6.6 is complete. Next: M6.7 a fresh local setup walkthrough and portal isolation check.
