# SYX-051 Page shell review

Status: automated evidence only. No human visual review, no packed-consumer run.

`PageShell` (`components/templates/page-shell.tsx`) composes an optional `Backdrop`, the X5 `Navbar`, a content column and the X5 `Footer`.

- **One configuration:** brand, grouped links, header actions and footer columns all come from the `SiteConfig` the consumer passes. The component has no links of its own, so a route is changed in one place.
- **`variant="page"` (default):** the content is the page's one `main`, a skip link jumps to it, and the Navbar is pinned unless `sticky` is false.
- **`variant="contained"`:** the same frame becomes one named region (`label`) inside an existing page. There is no `main`, no skip link and nothing pinned, so the host page keeps its landmarks.
- **Backdrop:** on by default; `false` gives a plain background.

## Evidence

- Unit (`tests/x7-templates.test.ts`): page variant has one `main`, a skip link and one footer; contained variant is a named region with no `main` and no skip link; no links and no footer appear when none are supplied.
- Browser (`tests/browser/x7-templates.spec.ts`): the `site-shell` layout preview is one named region, has no `main`, and its links come from the configuration.
- `tests/browser/layouts.spec.ts`: every layout preview, including this one, renders in its own theme scope, fits 320, 768 and 1280px in both appearances, and has no serious axe findings in compact and spacious density.

## Not covered

- Human visual review of the glass Navbar and Footer over the backdrop, reduced-transparency rendering and screen readers.
- The `page` variant is only unit-tested; the layouts screen shows the contained variant, because a whole-page `main` cannot live inside another page.
- The packed-consumer run through public exports only.
